package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import org.jooq.JSONB;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearch;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.auth.CurrentUserIdentityResolver;
import org.opendatadiscovery.oddplatform.dto.security.UserDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.exception.UniqueConstraintException;
import org.opendatadiscovery.oddplatform.mapper.DateTimeMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SavedSearchPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSavedSearchRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for SavedSearchServiceImpl (issue #1837 / ST-3): every operation resolves the caller
 * identity from the security context (never a request parameter) and confines itself to that owner; a name
 * collision is a clean domain error (never a 500); a saved search not owned by the caller is reported as
 * not-found (existence is never leaked); and an unreadable stored spec fails closed to an empty spec rather
 * than throwing. Identity, repository, and (via a real default-method mapper) the timestamp conversion are
 * exercised with StepVerifier.
 */
@ExtendWith(MockitoExtension.class)
class SavedSearchServiceImplTest {

    private static final LocalDateTime TS = LocalDateTime.of(2026, 1, 1, 12, 0);

    @Mock private CurrentUserIdentityResolver currentUserIdentityResolver;
    @Mock private ReactiveSavedSearchRepository repository;

    private SavedSearchServiceImpl service;

    @BeforeEach
    void setUp() {
        // A real DateTimeMapper (all default methods) so the LocalDateTime -> OffsetDateTime mapping is exercised.
        service = new SavedSearchServiceImpl(currentUserIdentityResolver, repository, new DateTimeMapper() { });
    }

    @Test
    void create_resolvesIdentity_checksUniqueness_persists_andMaps() {
        identity();
        when(repository.existsByName("alice", "google", "My orders", null)).thenReturn(Mono.just(false));
        when(repository.create(eq("alice"), eq("google"), eq("My orders"), any(JSONB.class)))
            .thenReturn(Mono.just(pojo(1L, "My orders", "{\"query\":\"orders\",\"filters\":{}}")));

        StepVerifier.create(service.create(form("My orders", "orders")))
            .assertNext(saved -> {
                assertThat(saved.getId()).isEqualTo(1L);
                assertThat(saved.getName()).isEqualTo("My orders");
                assertThat(saved.getSpec().getQuery()).isEqualTo("orders");
                assertThat(saved.getCreatedAt()).isNotNull();
                assertThat(saved.getUpdatedAt()).isNotNull();
            })
            .verifyComplete();
        verify(repository).create(eq("alice"), eq("google"), eq("My orders"), any(JSONB.class));
    }

    @Test
    void create_duplicateName_failsWithUniqueConstraint_andNeverPersists() {
        identity();
        when(repository.existsByName("alice", "google", "Taken", null)).thenReturn(Mono.just(true));

        StepVerifier.create(service.create(form("Taken", "x")))
            .verifyError(UniqueConstraintException.class);
        verify(repository, never()).create(any(), any(), any(), any());
    }

    @Test
    void list_capsSizeAt100_buildsPageInfo_andMapsItems() {
        identity();
        when(repository.list("alice", "google", 0, 100))
            .thenReturn(Flux.just(pojo(1L, "a", "{\"query\":\"q\",\"filters\":{}}")));
        when(repository.count("alice", "google")).thenReturn(Mono.just(1L));

        StepVerifier.create(service.list(1, 500))
            .assertNext(list -> {
                assertThat(list.getItems()).hasSize(1);
                assertThat(list.getItems().get(0).getName()).isEqualTo("a");
                assertThat(list.getPageInfo().getTotal()).isEqualTo(1L);
                assertThat(list.getPageInfo().getHasNext()).isFalse();
            })
            .verifyComplete();
        verify(repository).list("alice", "google", 0, 100);
    }

    @Test
    void list_unreadableStoredSpec_failsClosedToEmptySpec_neverThrows() {
        identity();
        when(repository.list("alice", "google", 0, 30))
            .thenReturn(Flux.just(pojo(9L, "corrupt", "this is not valid json {{{")));
        when(repository.count("alice", "google")).thenReturn(Mono.just(1L));

        StepVerifier.create(service.list(1, 30))
            .assertNext(list -> {
                assertThat(list.getItems()).hasSize(1);
                // Degraded to an empty spec (no query), not a 500.
                assertThat(list.getItems().get(0).getSpec()).isNotNull();
                assertThat(list.getItems().get(0).getSpec().getQuery()).isNull();
            })
            .verifyComplete();
    }

    @Test
    void list_nullStoredSpec_degradesToEmptySpec_neverThrows() {
        identity();
        final SavedSearchPojo nullSpec = new SavedSearchPojo()
            .setId(9L).setName("no-spec").setSpec(null).setCreatedAt(TS).setUpdatedAt(TS);
        when(repository.list("alice", "google", 0, 30)).thenReturn(Flux.just(nullSpec));
        when(repository.count("alice", "google")).thenReturn(Mono.just(1L));

        StepVerifier.create(service.list(1, 30))
            .assertNext(list -> {
                assertThat(list.getItems()).hasSize(1);
                assertThat(list.getItems().get(0).getSpec()).isNotNull();
            })
            .verifyComplete();
    }

    @Test
    void update_ownRow_checksUniquenessExcludingSelf_thenUpdates() {
        identity();
        when(repository.get(5L, "alice", "google"))
            .thenReturn(Mono.just(pojo(5L, "old", "{\"filters\":{}}")));
        when(repository.existsByName("alice", "google", "new", 5L)).thenReturn(Mono.just(false));
        when(repository.update(eq(5L), eq("alice"), eq("google"), eq("new"), any(JSONB.class)))
            .thenReturn(Mono.just(pojo(5L, "new", "{\"query\":\"q\",\"filters\":{}}")));

        StepVerifier.create(service.update(5L, form("new", "q")))
            .assertNext(saved -> assertThat(saved.getName()).isEqualTo("new"))
            .verifyComplete();
    }

    @Test
    void update_notOwned_isNotFound_andNeverChecksNameNorUpdates() {
        identity();
        when(repository.get(404L, "alice", "google")).thenReturn(Mono.empty());

        StepVerifier.create(service.update(404L, form("whatever", "q")))
            .verifyError(NotFoundException.class);
        verify(repository, never()).update(anyLong(), any(), any(), any(), any());
    }

    @Test
    void update_renameToAnExistingName_failsWithUniqueConstraint_andNeverUpdates() {
        identity();
        when(repository.get(5L, "alice", "google"))
            .thenReturn(Mono.just(pojo(5L, "old", "{\"filters\":{}}")));
        when(repository.existsByName("alice", "google", "taken", 5L)).thenReturn(Mono.just(true));

        StepVerifier.create(service.update(5L, form("taken", "q")))
            .verifyError(UniqueConstraintException.class);
        verify(repository, never()).update(anyLong(), any(), any(), any(), any());
    }

    @Test
    void delete_ownRow_completes() {
        identity();
        when(repository.delete(3L, "alice", "google")).thenReturn(Mono.just(1));

        StepVerifier.create(service.delete(3L)).verifyComplete();
    }

    @Test
    void delete_notOwned_isNotFound() {
        identity();
        when(repository.delete(404L, "alice", "google")).thenReturn(Mono.just(0));

        StepVerifier.create(service.delete(404L))
            .verifyError(NotFoundException.class);
    }

    private void identity() {
        when(currentUserIdentityResolver.resolve()).thenReturn(Mono.just(new UserDto("alice", "google")));
    }

    private static SavedSearchFormData form(final String name, final String query) {
        return new SavedSearchFormData().name(name).spec(new SearchFormData().query(query));
    }

    private static SavedSearchPojo pojo(final Long id, final String name, final String specJson) {
        return new SavedSearchPojo()
            .setId(id)
            .setName(name)
            .setSpec(JSONB.jsonb(specJson))
            .setCreatedAt(TS)
            .setUpdatedAt(TS);
    }
}
