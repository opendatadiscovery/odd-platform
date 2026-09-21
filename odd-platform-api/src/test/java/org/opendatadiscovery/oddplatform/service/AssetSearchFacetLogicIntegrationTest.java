package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.Asset;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilterState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.SearchFilterId;
import org.opendatadiscovery.oddplatform.mapper.FacetStateMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermOwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchFacetRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTagRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTitleRepository;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ST-11 (#1845, CTRIB-074) — the facet-logic model of the unified cross-kind search, driven through the real
 * service against a real Postgres (ADR unified-asset-search D13 + D3): per-facet MATCH ANY / MATCH ALL, per-value
 * EXCLUSION, and ONE rule across every asset kind — a Term is narrowed by the Namespace / Owner / Tag it carries, a
 * kind that cannot carry a facet is dropped by a positive selection and admitted by an exclusion — so that for any
 * value {@code v}, {@code v} and {@code not v} PARTITION the result set.
 *
 * <p>The fixture mirrors the CTRIB-074 baseline stand (section 3a): five data entities on two datasources / two
 * namespaces with tags {@code pii} / {@code finance} / {@code legacy} and owners {@code alice} / {@code bob}, two
 * terms (one tagged {@code pii} + owned by alice in namespace A, one untagged + owned by bob in namespace B) and one
 * query example, all findable by one token. Seeded through the real write paths (the {@code *_search_entrypoint}
 * writers fire the V0_0_98 union-row triggers). Every expected set below was captured on that running stand at
 * main {@code 015f6fa2} — the pre-ST-11 rows are the RED half (B2–B11), the corrected rows the GREEN half.
 *
 * <p>RED on {@code ref:main} by construction: the contract fields {@code exclude} / {@code match_all} do not exist
 * there, and the pass-through cases (Tag = pii listing the untagged term) fail on their totals.
 */
@DisplayName("Unified search facet logic — any / all / exclude, one rule across kinds (ST-11 / #1845)")
class AssetSearchFacetLogicIntegrationTest extends BaseIntegrationTest {

    @Autowired private AssetSearchService assetSearchService;
    @Autowired private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired private ReactiveSearchEntrypointRepository searchEntrypointRepository;
    @Autowired private ReactiveTermRepository termRepository;
    @Autowired private ReactiveTermSearchEntrypointRepository termSearchEntrypointRepository;
    @Autowired private ReactiveTermOwnershipRepository termOwnershipRepository;
    @Autowired private ReactiveNamespaceRepository namespaceRepository;
    @Autowired private ReactiveDataSourceRepository dataSourceRepository;
    @Autowired private ReactiveOwnerRepository ownerRepository;
    @Autowired private ReactiveTitleRepository titleRepository;
    @Autowired private ReactiveOwnershipRepository ownershipRepository;
    @Autowired private ReactiveTagRepository tagRepository;
    @Autowired private ReactiveQueryExampleRepository queryExampleRepository;
    @Autowired private ReactiveQueryExampleSearchEntrypointRepository queryExampleSearchEntrypointRepository;
    @Autowired private ReactiveSearchFacetRepository searchFacetRepository;
    @Autowired private FacetStateMapper facetStateMapper;

    // The fixture is seeded ONCE per class run (the Spring context — and its database — is per class:
    // BaseIntegrationTest dirties it BEFORE_CLASS), through the injected repositories of the first test instance.
    // A PER_CLASS lifecycle + @BeforeAll cannot do this: the instance is injected with a context that
    // @DirtiesContext(BEFORE_CLASS) then replaces, so its connection pool is already closed when @BeforeAll runs.
    private static boolean seeded;
    private static String token;
    private static long nsA;
    private static long nsB;
    private static long dsA;
    private static long dsB;
    private static long alice;
    private static long bob;
    private static long pii;
    private static long finance;
    private static long legacy;
    private static long orders;
    private static long customers;
    private static long ledger;
    private static long scratch;
    private static long archive;
    private static long termPii;
    private static long termPlain;
    private static long qe;

    @BeforeEach
    void seedOnce() {
        if (seeded) {
            return;
        }
        seeded = true;
        token = "facetlogic" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        nsA = namespaceRepository.createByName(token + "nsa").block().getId();
        nsB = namespaceRepository.createByName(token + "nsb").block().getId();
        dsA = dataSourceRepository.create(new DataSourcePojo().setName(token + "dsa").setOddrn("//" + token + "/dsa")
            .setNamespaceId(nsA)).block().getId();
        dsB = dataSourceRepository.create(new DataSourcePojo().setName(token + "dsb").setOddrn("//" + token + "/dsb")
            .setNamespaceId(nsB)).block().getId();
        alice = ownerRepository.create(new OwnerPojo().setName(token + "alice")).block().getId();
        bob = ownerRepository.create(new OwnerPojo().setName(token + "bob")).block().getId();
        final long title = titleRepository.create(new TitlePojo().setName(token + "steward")).block().getId();
        pii = tagRepository.create(new TagPojo().setName(token + "pii").setImportant(true)).block().getId();
        finance = tagRepository.create(new TagPojo().setName(token + "finance").setImportant(false)).block().getId();
        legacy = tagRepository.create(new TagPojo().setName(token + "legacy").setImportant(false)).block().getId();

        orders = dataEntity("orders", dsA, nsA, DataEntityStatusDto.STABLE);
        customers = dataEntity("customers", dsA, nsA, DataEntityStatusDto.DRAFT);
        ledger = dataEntity("ledger", dsB, nsB, DataEntityStatusDto.STABLE);
        scratch = dataEntity("scratch", dsB, nsB, DataEntityStatusDto.UNASSIGNED);
        archive = dataEntity("archive", dsB, nsB, DataEntityStatusDto.DEPRECATED);
        tags(orders, pii, finance);
        tags(customers, pii);
        tags(ledger, finance);
        tags(archive, legacy, finance);
        own(orders, alice, title);
        own(orders, bob, title);
        own(customers, bob, title);
        own(ledger, alice, title);
        own(archive, bob, title);

        termPii = createTerm("termpii", nsA);
        termPlain = createTerm("termplain", nsB);
        tagRepository.createTermRelations(termPii, List.of(pii)).collectList().block();
        termOwnershipRepository.create(new TermOwnershipPojo().setTermId(termPii).setOwnerId(alice).setTitleId(title))
            .block();
        termOwnershipRepository.create(new TermOwnershipPojo().setTermId(termPlain).setOwnerId(bob).setTitleId(title))
            .block();

        final QueryExamplePojo created = queryExampleRepository.bulkCreate(List.of(new QueryExamplePojo()
            .setQuery("select 1").setDefinition(token + " query example"))).collectList().block().get(0);
        queryExampleSearchEntrypointRepository.updateQueryExampleVectors(created.getId()).block();
        qe = created.getId();
    }

    // ------------------------------------------------------------------------------------------------------
    // The characterization — a request WITHOUT the new fields keeps today's semantics (the pre-work note)
    // ------------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("no filter: the eight seeded assets (B1)")
    void noFilter_returnsEverything() {
        assertThat(ids(search(filters()))).containsExactlyInAnyOrder(
            de(orders), de(customers), de(ledger), de(scratch), de(archive), term(termPii), term(termPlain), qe(qe));
    }

    @Test
    @DisplayName("within a facet the default is match ANY; across facets AND (B3 / B8 / B9)")
    void defaultsAreAnyWithinAndAcrossFacets() {
        assertThat(ids(search(filters().tags(sel(pii, finance)))))
            .as("any of pii / finance — plus the pii term, now narrowed rather than passed through")
            .containsExactlyInAnyOrder(de(orders), de(customers), de(ledger), de(archive), term(termPii));
        assertThat(ids(search(filters().owners(sel(alice, bob)))))
            .containsExactlyInAnyOrder(de(orders), de(customers), de(ledger), de(archive), term(termPii),
                term(termPlain));
        assertThat(ids(search(filters().tags(sel(pii)).owners(sel(bob)))))
            .as("AND across facets: tagged pii AND owned by bob")
            .containsExactlyInAnyOrder(de(orders), de(customers));
    }

    @Test
    @DisplayName("a Data-Entity-only facet (datasource / status) drops the other kinds on a positive selection"
        + " (B5 / B7)")
    void dataEntityOnlyFacet_positive_dropsOtherKinds() {
        assertThat(ids(search(filters().datasources(sel(dsA)))))
            .containsExactlyInAnyOrder(de(orders), de(customers));
        assertThat(ids(search(filters().statuses(sel(DataEntityStatusDto.STABLE.getId(),
            DataEntityStatusDto.DRAFT.getId())))))
            .containsExactlyInAnyOrder(de(orders), de(customers), de(ledger));
    }

    // ------------------------------------------------------------------------------------------------------
    // R4 — the cross-kind rule (the correction of the pass-through; RED on ref:main)
    // ------------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("R4: Tag = pii lists the pii term and NOT the untagged term or the query example"
        + " (was: both passed through)")
    void tagFacet_narrowsTerms_dropsQueryExamples() {
        final AssetList list = search(filters().tags(sel(pii)));
        assertThat(ids(list)).containsExactlyInAnyOrder(de(orders), de(customers), term(termPii));
        assertThat(list.getPageInfo().getTotal()).isEqualTo(3L);
    }

    @Test
    @DisplayName("R4: Owner = alice does not list bob's term; Namespace = A does not list the namespace-B term")
    void ownerAndNamespaceFacets_narrowTerms() {
        assertThat(ids(search(filters().owners(sel(alice)))))
            .containsExactlyInAnyOrder(de(orders), de(ledger), term(termPii));
        assertThat(ids(search(filters().namespaces(sel(nsA)))))
            .containsExactlyInAnyOrder(de(orders), de(customers), term(termPii));
    }

    @Test
    @DisplayName("R4: asset_kinds=[TERM] + Tag = pii returns the pii term only (was: every term)")
    void termsOnly_tagFacet_returnsOnlyTheTaggedTerm() {
        assertThat(ids(search(filters().tags(sel(pii)), AssetKind.TERM))).containsExactly(term(termPii));
    }

    // ------------------------------------------------------------------------------------------------------
    // R1 — match all
    // ------------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("R1: match_all=[tags] with pii + finance keeps only the asset carrying both")
    void matchAll_tags_requiresEverySelectedValue() {
        assertThat(ids(search(filters().tags(sel(pii, finance)).matchAll(List.of("tags")))))
            .containsExactly(de(orders));
    }

    @Test
    @DisplayName("R1: match_all=[owners] with alice + bob keeps only the two-owner asset; a term with one owner is out")
    void matchAll_owners_requiresEverySelectedValue() {
        assertThat(ids(search(filters().owners(sel(alice, bob)).matchAll(List.of("owners")))))
            .containsExactly(de(orders));
    }

    @Test
    @DisplayName("R1: match_all on a single-valued facet (datasource) with two values is honestly empty;"
        + " with one it is the value")
    void matchAll_singleValuedFacet_isHonest() {
        assertThat(ids(search(filters().datasources(sel(dsA, dsB)).matchAll(List.of("datasources"))))).isEmpty();
        assertThat(ids(search(filters().datasources(sel(dsA)).matchAll(List.of("datasources")))))
            .containsExactlyInAnyOrder(de(orders), de(customers));
    }

    @Test
    @DisplayName("R1: an unknown match_all token is dropped — the facet stays match any")
    void matchAll_unknownToken_isDropped() {
        assertThat(ids(search(filters().tags(sel(pii, finance)).matchAll(List.of("bogus", "'; drop")))))
            .containsExactlyInAnyOrder(de(orders), de(customers), de(ledger), de(archive), term(termPii));
    }

    // ------------------------------------------------------------------------------------------------------
    // R2 / R3 — exclusion, composition, the partition invariant
    // ------------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("R2: not legacy removes the legacy-tagged asset and keeps everything else,"
        + " terms and the query example included")
    void exclude_tag_removesCarriersOnly() {
        assertThat(ids(search(filters().tags(exc(legacy)))))
            .containsExactlyInAnyOrder(de(orders), de(customers), de(ledger), de(scratch), term(termPii),
                term(termPlain), qe(qe));
    }

    @Test
    @DisplayName("R2: not pii admits the untagged term AND the query example (a kind that cannot carry the value)")
    void exclude_tag_admitsKindsThatCannotCarryIt() {
        final AssetList list = search(filters().tags(exc(pii)));
        assertThat(ids(list)).containsExactlyInAnyOrder(de(ledger), de(scratch), de(archive), term(termPlain), qe(qe));
        assertThat(list.getPageInfo().getTotal()).isEqualTo(5L);
    }

    @Test
    @DisplayName("R2: an exclusion on a Data-Entity-only facet (datasource / status) keeps the other kinds")
    void exclude_dataEntityOnlyFacet_keepsOtherKinds() {
        assertThat(ids(search(filters().datasources(exc(dsA)))))
            .containsExactlyInAnyOrder(de(ledger), de(scratch), de(archive), term(termPii), term(termPlain), qe(qe));
        assertThat(ids(search(filters().statuses(exc(DataEntityStatusDto.DEPRECATED.getId())))))
            .containsExactlyInAnyOrder(de(orders), de(customers), de(ledger), de(scratch), term(termPii),
                term(termPlain), qe(qe));
    }

    @Test
    @DisplayName("R2: a two-owner asset excluded by ONE owner is out"
        + " — exclusions are entity-level, never row-level on the fan-out")
    void exclude_owner_isEntityLevel_onAFanOutFacet() {
        assertThat(ids(search(filters().owners(exc(bob)))))
            .as("orders has alice AND bob: `not bob` must not keep it through alice's row")
            .containsExactlyInAnyOrder(de(ledger), de(scratch), term(termPii), qe(qe));
    }

    @Test
    @DisplayName("R2: a namespace exclusion narrows terms too; the query example (no namespace) passes")
    void exclude_namespace_crossKind() {
        assertThat(ids(search(filters().namespaces(exc(nsB)))))
            .containsExactlyInAnyOrder(de(orders), de(customers), term(termPii), qe(qe));
    }

    @Test
    @DisplayName("R3: positives and exclusions compose within a facet (pii AND not legacy) and across facets")
    void composition_withinAndAcrossFacets() {
        assertThat(ids(search(filters().tags(sel(pii, finance).exclude(legacy)))))
            .as("any of pii / finance, minus the legacy carrier")
            .containsExactlyInAnyOrder(de(orders), de(customers), de(ledger), term(termPii));
        assertThat(ids(search(filters().tags(sel(pii)).owners(exc(alice)))))
            .as("tagged pii AND not owned by alice")
            .containsExactly(de(customers));
    }

    @Test
    @DisplayName("R3: for any value v, `v` and `not v` partition the result set"
        + " — the totals sum to the unfiltered total")
    void partitionInvariant() {
        final long all = search(filters()).getPageInfo().getTotal();
        assertThat(all).isEqualTo(8L);
        assertPartition(all, filters().tags(sel(pii)), filters().tags(exc(pii)));
        assertPartition(all, filters().owners(sel(alice)), filters().owners(exc(alice)));
        assertPartition(all, filters().datasources(sel(dsA)), filters().datasources(exc(dsA)));
        assertPartition(all, filters().statuses(sel(DataEntityStatusDto.STABLE.getId())),
            filters().statuses(exc(DataEntityStatusDto.STABLE.getId())));
        assertPartition(all, filters().namespaces(sel(nsB)), filters().namespaces(exc(nsB)));
    }

    @Test
    @DisplayName("a value listed both as a positive and as an exclusion reads as EXCLUDED")
    void bothListed_readsAsExcluded() {
        assertThat(ids(search(filters().tags(sel(pii).exclude(pii)))))
            .containsExactlyInAnyOrder(de(ledger), de(scratch), de(archive), term(termPlain), qe(qe));
    }

    // ------------------------------------------------------------------------------------------------------
    // The documented exception — Data entity type refines the Data-Entity rows and never touches the other kinds
    // ------------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("Data entity type: a positive class keeps terms + query examples (a refinement of the DE rows);"
        + " all = contains every class; exclude = not carrying it")
    void entityClassFacet_isAKindScopedRefinement() {
        final long combo = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()
            .setOddrn("//" + token + "/de/combo").setExternalName(token + "combo")
            .setEntityClassIds(new Integer[] {1, 2}).setTypeId(11).setDataSourceId(dsB).setNamespaceId(nsB)
            .setHollow(false).setStatus(DataEntityStatusDto.STABLE.getId()).setExcludeFromSearch(false)))
            .blockLast().getId();
        searchEntrypointRepository.updateDataEntityVectors(combo).block();
        try {
            assertThat(ids(search(filters().entityClasses(sel(1L)))))
                .as("every DE carries class 1; the terms and the query example PASS a class selection")
                .containsExactlyInAnyOrder(de(orders), de(customers), de(ledger), de(scratch), de(archive), de(combo),
                    term(termPii), term(termPlain), qe(qe));
            assertThat(ids(search(filters().entityClasses(sel(1L, 2L)).matchAll(List.of("entity_classes")))))
                .as("all of {1, 2} = the entity carrying both classes; the other kinds still pass")
                .containsExactlyInAnyOrder(de(combo), term(termPii), term(termPlain), qe(qe));
            assertThat(ids(search(filters().entityClasses(exc(2L)))))
                .as("not class 2 drops the combo entity only")
                .containsExactlyInAnyOrder(de(orders), de(customers), de(ledger), de(scratch), de(archive),
                    term(termPii), term(termPlain), qe(qe));
        } finally {
            dataEntityRepository.delete(combo).block();
        }
    }

    // ------------------------------------------------------------------------------------------------------
    // R10 — Statuses = DELETED lifts the default exclusion (legacy parity)
    // ------------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("R10: a positive DELETED status lists the deleted entity; without it the entity stays hidden")
    void deletedStatus_positiveSelection_liftsTheDefaultExclusion() {
        final long deleted = dataEntity("deleted", dsB, nsB, DataEntityStatusDto.DELETED);
        try {
            assertThat(ids(search(filters()))).doesNotContain(de(deleted));
            assertThat(ids(search(filters().statuses(sel(DataEntityStatusDto.DELETED.getId())))))
                .as("the deleted entity is listed (another test's soft-deleted fixture may legitimately join it)")
                .contains(de(deleted))
                .doesNotContain(de(orders), term(termPii), qe(qe));
            assertThat(ids(search(filters().statuses(exc(DataEntityStatusDto.DELETED.getId())))))
                .as("excluding DELETED changes nothing — it is excluded by default")
                .doesNotContain(de(deleted));
        } finally {
            dataEntityRepository.delete(deleted).block();
        }
    }


    // ------------------------------------------------------------------------------------------------------
    // R11 — the legacy session's facet COUNTS honour the new dimensions on the facet set each count conditions
    // on, and count ENTITIES (the fan-out double count of the shipped queries corrected — CTRIB-074 B16)
    // ------------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("R11: Datasource `not A` -> the Owner options count only datasource-B entities (alice 1 / bob 1)")
    void counts_owner_honourADatasourceExclusion() {
        final Map<String, Long> owners = named(searchFacetRepository
            .getOwnerFacetForDataEntity(token, 1, 30, state(filters().datasources(exc(dsA)))).block());
        assertThat(owners).containsEntry(token + "alice", 1L).containsEntry(token + "bob", 1L);
    }

    @Test
    @DisplayName("R11: the Status options under Tag = pii + finance count each entity ONCE"
        + " (2, not 3 — the double count corrected)")
    void counts_status_countEntitiesNotJoinedRows() {
        final Map<String, Long> statuses = named(searchFacetRepository
            .getStatusFacetForDataEntity("", 1, 30, state(filters().tags(sel(pii, finance)))).block());
        assertThat(statuses)
            .as("orders carries BOTH selected tags and is one STABLE entity; ledger is the other")
            .containsEntry("STABLE", 2L).containsEntry("DRAFT", 1L).containsEntry("DEPRECATED", 1L);
    }

    @Test
    @DisplayName("R11: the Status options honour Match all — Tag = pii + finance, all -> STABLE 1 (orders only)")
    void counts_status_honourMatchAll() {
        final Map<String, Long> statuses = named(searchFacetRepository
            .getStatusFacetForDataEntity("", 1, 30, state(filters().tags(sel(pii, finance)).matchAll(List.of("tags"))))
            .block());
        assertThat(statuses).containsEntry("STABLE", 1L).containsEntry("DRAFT", 0L).containsEntry("DEPRECATED", 0L);
    }

    @Test
    @DisplayName("R11: the entity-class options under Datasource `not A` count the datasource-B entities only")
    void counts_entityClass_honourAnExclusion() {
        final Map<String, Long> classes = named(searchFacetRepository
            .getEntityClassFacetForDataEntity(state(filters().datasources(exc(dsA)))).block());
        assertThat(classes).containsEntry("DATA_SET", 3L);
    }

    @Test
    @DisplayName("R11 characterization: a request without the new fields keeps today's Owner / Tag counts"
        + " (query + datasource only)")
    void counts_ownerAndTag_withoutTheNewFields_areUnchanged() {
        final Map<String, Long> owners = named(searchFacetRepository
            .getOwnerFacetForDataEntity(token, 1, 30, state(filters().tags(sel(pii)))).block());
        assertThat(owners)
            .as("the Owner count ignores a Tag selection — the shipped posture, disclosed")
            .containsEntry(token + "bob", 3L).containsEntry(token + "alice", 2L);
        final Map<String, Long> tags = named(searchFacetRepository
            .getTagFacetForDataEntity(token, 1, 30, state(filters())).block());
        assertThat(tags).containsEntry(token + "finance", 3L).containsEntry(token + "pii", 2L)
            .containsEntry(token + "legacy", 1L);
    }

    private FacetStateDto state(final SearchFormDataFilters filters) {
        return FacetStateDto.removeUnselected(facetStateMapper.mapForm(new SearchFormData().query(token)
            .filters(filters)));
    }

    private static Map<String, Long> named(final Map<SearchFilterId, Long> counts) {
        return counts.entrySet().stream().collect(Collectors.toMap(e -> e.getKey().getName(), Map.Entry::getValue,
            (a, b) -> a));
    }

    // ------------------------------------------------------------------------------------------------------
    // helpers
    // ------------------------------------------------------------------------------------------------------

    private void assertPartition(final long all, final SearchFormDataFilters positive,
                                 final SearchFormDataFilters negative) {
        final AssetList yes = search(positive);
        final AssetList no = search(negative);
        assertThat(yes.getPageInfo().getTotal() + no.getPageInfo().getTotal()).isEqualTo(all);
        assertThat(ids(yes)).doesNotContainAnyElementsOf(ids(no));
    }

    private AssetList search(final SearchFormDataFilters filters) {
        return search(filters, null);
    }

    private AssetList search(final SearchFormDataFilters filters, final AssetKind kind) {
        final AssetSearchFormData form = new AssetSearchFormData().query(token).filters(filters);
        if (kind != null) {
            form.assetKinds(List.of(kind));
        }
        return assetSearchService.searchAssets(form, 30, null).block();
    }

    private static SearchFormDataFilters filters() {
        return new SearchFormDataFilters();
    }

    /** Positive selections of a facet; chain {@link Selection#exclude} to add exclusions to the same facet. */
    private static Selection sel(final long... ids) {
        final Selection selection = new Selection();
        for (final long id : ids) {
            selection.add(new SearchFilterState(id, true));
        }
        return selection;
    }

    private static Selection exc(final long... ids) {
        return new Selection().exclude(ids);
    }

    private static final class Selection extends java.util.ArrayList<SearchFilterState> {
        Selection exclude(final long... ids) {
            for (final long id : ids) {
                add(new SearchFilterState(id, true).exclude(true));
            }
            return this;
        }
    }

    private static Set<String> ids(final AssetList list) {
        return list.getItems().stream().map(AssetSearchFacetLogicIntegrationTest::key).collect(Collectors.toSet());
    }

    private static String key(final Asset asset) {
        return switch (asset.getAssetKind()) {
            case DATA_ENTITY -> de(asset.getDataEntity().getId());
            case TERM -> term(asset.getTerm().getId());
            case QUERY_EXAMPLE -> qe(asset.getQueryExample().getId());
            default -> asset.getAssetKind() + ":?";
        };
    }

    private static String de(final long id) {
        return "DE:" + id;
    }

    private static String term(final long id) {
        return "TERM:" + id;
    }

    private static String qe(final long id) {
        return "QE:" + id;
    }

    private long dataEntity(final String name, final long dataSourceId, final long namespaceId,
                            final DataEntityStatusDto status) {
        final DataEntityPojo created = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()
            .setOddrn("//" + token + "/de/" + name)
            .setExternalName(token + name)
            .setEntityClassIds(new Integer[] {1})
            .setTypeId(1)
            .setDataSourceId(dataSourceId)
            .setNamespaceId(namespaceId)
            .setHollow(false)
            .setStatus(status.getId())
            .setExcludeFromSearch(false))).blockLast();
        searchEntrypointRepository.updateDataEntityVectors(created.getId()).block();
        return created.getId();
    }

    private void tags(final long dataEntityId, final long... tagIds) {
        tagRepository.createDataEntityRelations(java.util.Arrays.stream(tagIds)
            .mapToObj(tagId -> new TagToDataEntityPojo().setDataEntityId(dataEntityId).setTagId(tagId))
            .collect(Collectors.toList())).collectList().block();
    }

    private void own(final long dataEntityId, final long ownerId, final long titleId) {
        ownershipRepository.create(new OwnershipPojo().setDataEntityId(dataEntityId).setOwnerId(ownerId)
            .setTitleId(titleId)).block();
    }

    private long createTerm(final String name, final long namespaceId) {
        final TermPojo created = termRepository.create(new TermPojo()
            .setName(token + name).setDefinition(token + " term " + name).setNamespaceId(namespaceId)).block();
        termSearchEntrypointRepository.updateTermVectors(created.getId()).block();
        return created.getId();
    }
}
