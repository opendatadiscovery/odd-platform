package org.opendatadiscovery.oddplatform.repository.reactive;

import org.jooq.JSONB;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SavedSearchPojo;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test for ReactiveSavedSearchRepositoryImpl against a real Postgres (Testcontainers via
 * {@link BaseIntegrationTest}) — issue #1837 / ST-3 / ADR D11. Verifies owner-scoped CRUD, newest-first
 * pagination, the unique-name-per-user constraint, the updated_at bump on rename, and — the security-load-bearing
 * assertion — that a SECOND identity can neither read, edit, nor delete another user's saved searches.
 */
public class ReactiveSavedSearchRepositoryImplTest extends BaseIntegrationTest {

    private static final String USER = "alice@corp";
    private static final String PROVIDER = "google";
    private static final JSONB SPEC = JSONB.jsonb("{\"query\":\"orders\",\"filters\":{}}");
    private static final JSONB SPEC2 = JSONB.jsonb("{\"query\":\"revenue\",\"filters\":{}}");

    @Autowired
    private ReactiveSavedSearchRepository repository;

    @Test
    @DisplayName("create persists an owned row with id + timestamps; get returns it")
    public void createThenGet() {
        final SavedSearchPojo created = repository.create(USER, PROVIDER, "My orders", SPEC).block();
        assertThat(created).isNotNull();
        assertThat(created.getId()).isNotNull();
        assertThat(created.getName()).isEqualTo("My orders");
        assertThat(created.getSpec().data()).contains("orders");
        assertThat(created.getCreatedAt()).isNotNull();
        assertThat(created.getUpdatedAt()).isNotNull();

        repository.get(created.getId(), USER, PROVIDER)
            .as(StepVerifier::create)
            .assertNext(pojo -> assertThat(pojo.getName()).isEqualTo("My orders"))
            .verifyComplete();
    }

    @Test
    @DisplayName("list returns the user's saved searches newest-first, paginated; count reflects the total")
    public void listNewestFirstPaginated() {
        final String user = "page-user@corp";
        repository.create(user, PROVIDER, "first", SPEC).block();
        repository.create(user, PROVIDER, "second", SPEC).block();
        repository.create(user, PROVIDER, "third", SPEC).block();

        repository.list(user, PROVIDER, 0, 2)
            .map(SavedSearchPojo::getName)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(names -> assertThat(names).containsExactly("third", "second"))
            .verifyComplete();

        repository.count(user, PROVIDER)
            .as(StepVerifier::create)
            .assertNext(count -> assertThat(count).isEqualTo(3L))
            .verifyComplete();
    }

    @Test
    @DisplayName("SECURITY: a second identity can neither read, update, nor delete another user's saved search")
    public void ownerIsolation() {
        final SavedSearchPojo mine = repository.create(USER, PROVIDER, "private", SPEC).block();
        assertThat(mine).isNotNull();

        // A different username, and a different provider — neither identity sees the row.
        repository.get(mine.getId(), "bob@corp", PROVIDER).as(StepVerifier::create).verifyComplete();
        repository.get(mine.getId(), USER, "github").as(StepVerifier::create).verifyComplete();
        repository.list("bob@corp", PROVIDER, 0, 10).as(StepVerifier::create).verifyComplete();

        // Update by the wrong identity returns empty (no row matched) and does not touch the row.
        repository.update(mine.getId(), "bob@corp", PROVIDER, "hijacked", SPEC2)
            .as(StepVerifier::create).verifyComplete();
        repository.get(mine.getId(), USER, PROVIDER)
            .as(StepVerifier::create)
            .assertNext(pojo -> assertThat(pojo.getName()).isEqualTo("private"))
            .verifyComplete();

        // Delete by the wrong identity removes nothing (0 rows) and leaves the row intact.
        repository.delete(mine.getId(), "bob@corp", PROVIDER)
            .as(StepVerifier::create)
            .assertNext(deleted -> assertThat(deleted).isZero())
            .verifyComplete();
        repository.get(mine.getId(), USER, PROVIDER)
            .as(StepVerifier::create)
            .assertNext(pojo -> assertThat(pojo.getName()).isEqualTo("private"))
            .verifyComplete();
    }

    @Test
    @DisplayName("update on the OWN row renames, replaces the spec, and bumps updated_at; delete removes it")
    public void updateAndDelete() {
        final SavedSearchPojo created = repository.create(USER, PROVIDER, "before", SPEC).block();
        assertThat(created).isNotNull();

        final SavedSearchPojo updated =
            repository.update(created.getId(), USER, PROVIDER, "after", SPEC2).block();
        assertThat(updated).isNotNull();
        assertThat(updated.getName()).isEqualTo("after");
        assertThat(updated.getSpec().data()).contains("revenue");
        assertThat(updated.getUpdatedAt()).isAfterOrEqualTo(created.getUpdatedAt());

        repository.delete(created.getId(), USER, PROVIDER)
            .as(StepVerifier::create)
            .assertNext(deleted -> assertThat(deleted).isEqualTo(1))
            .verifyComplete();
        repository.get(created.getId(), USER, PROVIDER).as(StepVerifier::create).verifyComplete();
    }

    @Test
    @DisplayName("existsByName is per-user and honours excludeId (a no-op rename to the same name is not a conflict)")
    public void existsByNameScopedAndExcludes() {
        final String user = "exists-user@corp";
        final SavedSearchPojo a = repository.create(user, PROVIDER, "reports", SPEC).block();
        assertThat(a).isNotNull();

        repository.existsByName(user, PROVIDER, "reports", null)
            .as(StepVerifier::create).assertNext(e -> assertThat(e).isTrue()).verifyComplete();
        repository.existsByName(user, PROVIDER, "reports", a.getId())
            .as(StepVerifier::create).assertNext(e -> assertThat(e).isFalse()).verifyComplete();
        repository.existsByName(user, PROVIDER, "missing", null)
            .as(StepVerifier::create).assertNext(e -> assertThat(e).isFalse()).verifyComplete();
        repository.existsByName("other@corp", PROVIDER, "reports", null)
            .as(StepVerifier::create).assertNext(e -> assertThat(e).isFalse()).verifyComplete();
    }

    @Test
    @DisplayName("the unique (user, name) index rejects a duplicate name at the DB level")
    public void duplicateNameRejectedByConstraint() {
        final String user = "dupe-user@corp";
        repository.create(user, PROVIDER, "dup", SPEC).block();

        repository.create(user, PROVIDER, "dup", SPEC2)
            .as(StepVerifier::create)
            .verifyError();
    }
}
