package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import java.util.List;
import org.jooq.JSONB;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearch;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearchFormData;
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

    /**
     * #1878 (ADR D11 — one canonical spec, two surfaces): the persisted spec is the FULL AssetSearchFormData, so
     * the two URL-only dimensions survive create -> stored jsonb -> read back. `favorites=false` is a REAL
     * filter (only un-starred assets) and must round-trip as false, never be normalised away. On main before the
     * widening the payload type could not even carry the fields (a compile-RED, the honest RED for a contract
     * widening); the behaviour RED is the web test's 201-without-the-keys.
     */
    @Test
    void create_persistsAssetKindsAndFavorites_andReadsThemBack() {
        identity();
        when(repository.existsByName("alice", "google", "stars", null)).thenReturn(Mono.just(false));
        final ArgumentCaptor<JSONB> stored = ArgumentCaptor.forClass(JSONB.class);
        when(repository.create(eq("alice"), eq("google"), eq("stars"), stored.capture()))
            .thenAnswer(inv -> Mono.just(pojo(1L, "stars", stored.getValue().data())));

        final SavedSearchFormData form = new SavedSearchFormData().name("stars").spec(new AssetSearchFormData()
            .query("orders").sort("name").favorites(false).assetKinds(List.of(AssetKind.TERM, AssetKind.DATA_ENTITY)));

        StepVerifier.create(service.create(form))
            .assertNext(saved -> {
                assertThat(saved.getSpec().getQuery()).isEqualTo("orders");
                assertThat(saved.getSpec().getSort()).isEqualTo("name");
                assertThat(saved.getSpec().getFavorites()).isFalse();
                assertThat(saved.getSpec().getAssetKinds()).containsExactly(AssetKind.TERM, AssetKind.DATA_ENTITY);
            })
            .verifyComplete();
        // The jsonb itself carries the two wire keys — the contract gap #1878 describes was exactly their absence.
        assertThat(stored.getValue().data()).contains("\"asset_kinds\":[\"TERM\",\"DATA_ENTITY\"]")
            .contains("\"favorites\":false");
    }

    /**
     * A row saved BEFORE the widening carries neither key: it must read back with both null (= no narrowing)
     * and reapply exactly as it did — compatibility is a requirement, not a hope (#1878 R5).
     */
    @Test
    void list_rowSavedBeforeTheWidening_readsBackWithNoNarrowing() {
        identity();
        when(repository.list("alice", "google", 0, 30))
            .thenReturn(Flux.just(pojo(2L, "old", "{\"query\":\"orders\",\"sort\":\"name\",\"filters\":{}}")));
        when(repository.count("alice", "google")).thenReturn(Mono.just(1L));

        StepVerifier.create(service.list(1, 30))
            .assertNext(list -> {
                final AssetSearchFormData spec = list.getItems().get(0).getSpec();
                assertThat(spec.getQuery()).isEqualTo("orders");
                assertThat(spec.getSort()).isEqualTo("name");
                assertThat(spec.getAssetKinds()).isNull();
                assertThat(spec.getFavorites()).isNull();
            })
            .verifyComplete();
    }

    /**
     * Fail-closed PER TOKEN, not per spec (#1878 R6-BE): a stored asset kind that no longer exists, or a
     * favorites value of the wrong type, costs the saved search that one field — the query and the rest of the
     * search survive. Before this change the whole spec would have degraded to empty (the enum deserialiser
     * throws), which for a saved search is data loss dressed as safety. Mirrors the `sort` / `my_data` posture.
     */
    @Test
    void list_unknownKindTokenOrMistypedFavorites_dropsTheFieldNotTheSearch() {
        identity();
        final String staleKind =
            "{\"query\":\"q\",\"asset_kinds\":[\"BOGUS\",7,\"TERM\"],\"favorites\":\"yes\",\"filters\":{}}";
        final String kindsNotAList =
            "{\"query\":\"q2\",\"asset_kinds\":\"TERM\",\"favorites\":true,\"filters\":{}}";
        final String explicitNulls =
            "{\"query\":\"q3\",\"asset_kinds\":null,\"favorites\":null,\"filters\":{}}";
        when(repository.list("alice", "google", 0, 30)).thenReturn(Flux.just(
            pojo(3L, "stale-kind", staleKind), pojo(4L, "kinds-not-a-list", kindsNotAList),
            pojo(5L, "explicit-nulls", explicitNulls)));
        when(repository.count("alice", "google")).thenReturn(Mono.just(3L));

        StepVerifier.create(service.list(1, 30))
            .assertNext(list -> {
                // an unknown token AND a non-string element are both dropped; the known one survives
                final AssetSearchFormData stale = list.getItems().get(0).getSpec();
                assertThat(stale.getQuery()).isEqualTo("q");
                assertThat(stale.getAssetKinds()).containsExactly(AssetKind.TERM);
                assertThat(stale.getFavorites()).isNull();
                final AssetSearchFormData notAList = list.getItems().get(1).getSpec();
                assertThat(notAList.getQuery()).isEqualTo("q2");
                assertThat(notAList.getAssetKinds()).isNull();
                assertThat(notAList.getFavorites()).isTrue();
                // explicit JSON nulls (what the server itself writes for an unset field) bind to null, untouched
                final AssetSearchFormData nulls = list.getItems().get(2).getSpec();
                assertThat(nulls.getQuery()).isEqualTo("q3");
                assertThat(nulls.getAssetKinds()).isNull();
                assertThat(nulls.getFavorites()).isNull();
            })
            .verifyComplete();
    }

    /**
     * ST-9 (#1843): a stored popularity range is read back exactly as the live search would apply it, or not at all —
     * a non-object is dropped; a non-integer bound is dropped field-level; an INVERTED range (min > max after the
     * same clamp the live request applies) is dropped whole so the UI's reapply and the API agree; a bound of 0 and
     * an empty object survive untouched.
     */
    @Test
    void list_storedPopularityRange_isNormalisedFieldLevel_neverTheSearch() {
        identity();
        final String inverted = "{\"query\":\"p1\",\"popularity\":{\"min\":10,\"max\":2},\"filters\":{}}";
        final String notAnObject = "{\"query\":\"p2\",\"popularity\":\"4..9\",\"filters\":{}}";
        final String badBound = "{\"query\":\"p3\",\"popularity\":{\"min\":\"abc\",\"max\":5},\"filters\":{}}";
        final String zero = "{\"query\":\"p4\",\"popularity\":{\"min\":0,\"max\":0},\"filters\":{}}";
        final String clampedNotInverted = "{\"query\":\"p5\",\"popularity\":{\"min\":99,\"max\":25},\"filters\":{}}";
        when(repository.list("alice", "google", 0, 30)).thenReturn(Flux.just(
            pojo(11L, "inverted", inverted), pojo(12L, "not-an-object", notAnObject),
            pojo(13L, "bad-bound", badBound), pojo(14L, "zero", zero), pojo(15L, "clamped", clampedNotInverted)));
        when(repository.count("alice", "google")).thenReturn(Mono.just(5L));

        StepVerifier.create(service.list(1, 30))
            .assertNext(list -> {
                assertThat(list.getItems().get(0).getSpec().getPopularity()).as("inverted → absent").isNull();
                assertThat(list.getItems().get(0).getSpec().getQuery()).isEqualTo("p1");
                assertThat(list.getItems().get(1).getSpec().getPopularity()).as("not an object → absent").isNull();
                final var badBoundSpec = list.getItems().get(2).getSpec().getPopularity();
                assertThat(badBoundSpec).as("the bad bound is dropped, the good one kept").isNotNull();
                assertThat(badBoundSpec.getMin()).isNull();
                assertThat(badBoundSpec.getMax()).isEqualTo(5);
                final var zeroSpec = list.getItems().get(3).getSpec().getPopularity();
                assertThat(zeroSpec.getMin()).as("0 is a real bound").isZero();
                assertThat(zeroSpec.getMax()).isZero();
                final var clamped = list.getItems().get(4).getSpec().getPopularity();
                assertThat(clamped).as("99 and 25 both clamp to 20 — not inverted, kept as stored").isNotNull();
            })
            .verifyComplete();
    }

    /**
     * ST-10 (#1844): a stored recency scope is read back exactly as the search would apply it — with ONE deliberate
     * difference from the popularity rule above. An INVERTED window drops both BOUNDS and KEEPS the scope ("any
     * time"), because a stored spec came from a client that did intend a recency scope and "every asset in my
     * history" is the search it can still run; a live inverted window, by contrast, answers an empty page. The
     * front-end projection mirrors this exact rule, so the two surfaces can never disagree about a stored window.
     *
     * <p>Note also that an EMPTY scope object survives as a real scope, where an empty popularity range means no
     * range at all: presence is the switch here.
     */
    @Test
    void list_storedRecencyScope_isNormalisedFieldLevel_andAnInvertedWindowKeepsTheScope() {
        identity();
        final String inverted = "{\"query\":\"r1\",\"recently_viewed\":"
            + "{\"viewed_after\":\"2026-09-30T00:00:00Z\",\"viewed_before\":\"2026-09-01T00:00:00Z\"},"
            + "\"filters\":{}}";
        final String notAnObject = "{\"query\":\"r2\",\"recently_viewed\":\"last week\",\"filters\":{}}";
        final String badBound = "{\"query\":\"r3\",\"recently_viewed\":"
            + "{\"viewed_after\":\"not-a-date\",\"viewed_before\":\"2026-09-30T00:00:00Z\"},\"filters\":{}}";
        final String anyTime = "{\"query\":\"r4\",\"recently_viewed\":{},\"filters\":{}}";
        // The shape a REAL saved search actually stores: the serialiser writes the unset bounds as explicit JSON
        // nulls rather than omitting them, so `{"viewed_after": null, "viewed_before": null}` is what comes back
        // off the wire for "any time" (observed on a running stack in the IT-157 saved-search case, where an
        // oracle expecting a literal `{}` failed against it). It must read as the SAME state as `{}` above:
        // present, bounds-free. Without this the null-bound branch is the one production takes and no test does.
        final String explicitNulls = "{\"query\":\"r5\",\"recently_viewed\":"
            + "{\"viewed_after\":null,\"viewed_before\":null},\"filters\":{}}";
        when(repository.list("alice", "google", 0, 30)).thenReturn(Flux.just(
            pojo(21L, "inverted", inverted), pojo(22L, "not-an-object", notAnObject),
            pojo(23L, "bad-bound", badBound), pojo(24L, "any-time", anyTime),
            pojo(25L, "explicit-nulls", explicitNulls)));
        when(repository.count("alice", "google")).thenReturn(Mono.just(5L));

        StepVerifier.create(service.list(1, 30))
            .assertNext(list -> {
                final var invertedSpec = list.getItems().get(0).getSpec().getRecentlyViewed();
                assertThat(invertedSpec)
                    .as("inverted → the SCOPE survives (unlike popularity, which drops entirely)")
                    .isNotNull();
                assertThat(invertedSpec.getViewedAfter()).as("both bounds dropped").isNull();
                assertThat(invertedSpec.getViewedBefore()).isNull();
                assertThat(list.getItems().get(0).getSpec().getQuery()).isEqualTo("r1");

                assertThat(list.getItems().get(1).getSpec().getRecentlyViewed())
                    .as("not an object → absent").isNull();

                final var badBoundSpec = list.getItems().get(2).getSpec().getRecentlyViewed();
                assertThat(badBoundSpec).as("the bad bound is dropped, the good one kept").isNotNull();
                assertThat(badBoundSpec.getViewedAfter()).isNull();
                assertThat(badBoundSpec.getViewedBefore()).isNotNull();

                assertThat(list.getItems().get(3).getSpec().getRecentlyViewed())
                    .as("an empty scope is a REAL stored state — 'any time' — and must not collapse to absent")
                    .isNotNull();

                final var nullsSpec = list.getItems().get(4).getSpec().getRecentlyViewed();
                assertThat(nullsSpec)
                    .as("explicit JSON nulls are the SHIPPED wire shape of 'any time' — present, not absent")
                    .isNotNull();
                assertThat(nullsSpec.getViewedAfter()).isNull();
                assertThat(nullsSpec.getViewedBefore()).isNull();
                assertThat(list.getItems().get(4).getSpec().getQuery()).isEqualTo("r5");
            })
            .verifyComplete();
    }

    /**
     * A stored spec that parses but is not a JSON object (an array, a scalar) has no fields to sanitise or bind:
     * it degrades to the empty spec like unreadable text does — never a 500, never a throw in the list path.
     */
    @Test
    void list_storedSpecThatIsNotAnObject_degradesToEmptySpec_neverThrows() {
        identity();
        when(repository.list("alice", "google", 0, 30)).thenReturn(Flux.just(
            pojo(5L, "array", "[\"TERM\"]"), pojo(6L, "scalar", "\"orders\"")));
        when(repository.count("alice", "google")).thenReturn(Mono.just(2L));

        StepVerifier.create(service.list(1, 30))
            .assertNext(list -> {
                assertThat(list.getItems()).hasSize(2);
                for (final SavedSearch item : list.getItems()) {
                    assertThat(item.getSpec()).isNotNull();
                    assertThat(item.getSpec().getQuery()).isNull();
                    assertThat(item.getSpec().getAssetKinds()).isNull();
                }
            })
            .verifyComplete();
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
        return new SavedSearchFormData().name(name).spec(new AssetSearchFormData().query(query));
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
