package org.opendatadiscovery.oddplatform.service.search;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntitySearchHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermOwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityQueryExampleRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTagRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTitleRepository;
import org.opendatadiscovery.oddplatform.service.search.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.MARK_END;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.MARK_START;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.POLYMORPHIC_FIELD_CAP;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.toHtmlMarks;

/**
 * The per-kind "why it matched" on a real PostgreSQL (ST-12 / #1846) — the one place the whole chain runs: the
 * kind's own loader → the kind's document → the shared {@code ts_headline} sink with the shared tsquery → the parse.
 * Behavioural, per kind: a Term found by name / definition / namespace / tag / owner title; a Query Example found by
 * its SQL and by a linked entity's name; a prefix, a quoted phrase, a -exclusion and a metacharacter payload; the
 * Data Entity PARITY with the legacy session endpoint (equal on every field within the bound; the over-bound field
 * differs by construction; the legacy strings still carry {@code <b>} — ADR D9); visibility (soft-deleted, DELETED,
 * hollow, excluded, missing → not found); and the markup class — a description carrying tags travels verbatim.
 *
 * @validates F-017 (F-017-UC-19)
 * @enforces ADR unified-asset-search D6 (parity), D9 (the legacy endpoint unchanged), principle 4 (the text-only wire)
 */
@DisplayName("Per-kind 'why it matched' on a real database (ST-12 / #1846)")
class AssetSearchHighlightIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private AssetSearchHighlightService highlightService;
    @Autowired
    private DataEntityHighlightService dataEntityHighlightService;
    @Autowired
    private SearchService searchService;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private ReactiveDataSourceRepository dataSourceRepository;
    @Autowired
    private ReactiveNamespaceRepository namespaceRepository;
    @Autowired
    private ReactiveTagRepository tagRepository;
    @Autowired
    private ReactiveOwnerRepository ownerRepository;
    @Autowired
    private ReactiveTitleRepository titleRepository;
    @Autowired
    private ReactiveOwnershipRepository ownershipRepository;
    @Autowired
    private ReactiveTermRepository termRepository;
    @Autowired
    private ReactiveTermOwnershipRepository termOwnershipRepository;
    @Autowired
    private ReactiveQueryExampleRepository queryExampleRepository;
    @Autowired
    private ReactiveDataEntityQueryExampleRelationRepository queryExampleRelationRepository;

    private static String mark(final String word) {
        return MARK_START + word + MARK_END;
    }

    private static String token(final String prefix) {
        return prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }

    // ---- Term ------------------------------------------------------------------------------------------------

    @Test
    void term_foundByName_marksTheName() {
        final String name = token("revenue");
        final long termId = seedTerm(name, "money the company earned", token("finance"), null, null, null);

        final AssetSearchHighlight h = highlightService.highlight(AssetKind.TERM, termId, name).block();

        assertThat(h.getAssetKind()).isEqualTo(AssetKind.TERM);
        assertThat(h.getTerm().getName()).isEqualTo(mark(name));
        assertThat(h.getTerm().getDefinition()).isNull();
        assertThat(h.getTerm().getNamespace()).isNull();
        assertThat(h.getTerm().getTags()).isNull();
        assertThat(h.getTerm().getOwners()).isNull();
        assertThat(h.getDataEntity()).isNull();
        assertThat(h.getQueryExample()).isNull();
    }

    @Test
    void term_foundByDefinitionWord_marksTheDefinitionOnly() {
        final String word = token("earned");
        final long termId = seedTerm(token("revenue"), "money the company " + word + " last year", token("finance"),
            null, null, null);

        final AssetSearchHighlight h = highlightService.highlight(AssetKind.TERM, termId, word).block();

        assertThat(h.getTerm().getDefinition()).isEqualTo("money the company " + mark(word) + " last year");
        assertThat(h.getTerm().getName()).isNull();
    }

    @Test
    void term_foundByNamespaceTagOrOwnerTitle_marksThatSectionOnly() {
        final String ns = token("nsfin");
        final String tag = token("piitag");
        final String title = token("stewardt");
        final long termId = seedTerm(token("revenue"), "definition", ns, tag, token("bob"), title);

        final AssetSearchHighlight byNamespace = highlightService.highlight(AssetKind.TERM, termId, ns).block();
        assertThat(byNamespace.getTerm().getNamespace().getName()).isEqualTo(mark(ns));
        assertThat(byNamespace.getTerm().getTags()).isNull();
        assertThat(byNamespace.getTerm().getOwners()).isNull();

        final AssetSearchHighlight byTag = highlightService.highlight(AssetKind.TERM, termId, tag).block();
        assertThat(byTag.getTerm().getTags()).hasSize(1);
        assertThat(byTag.getTerm().getTags().get(0).getName()).isEqualTo(mark(tag));
        assertThat(byTag.getTerm().getNamespace()).isNull();

        final AssetSearchHighlight byTitle = highlightService.highlight(AssetKind.TERM, termId, title).block();
        assertThat(byTitle.getTerm().getOwners()).hasSize(1);
        assertThat(byTitle.getTerm().getOwners().get(0).getTitle()).isEqualTo(mark(title));
        assertThat(byTitle.getTerm().getOwners().get(0).getOwner()).doesNotContain(MARK_START);
        assertThat(byTitle.getTerm().getTags()).isNull();
    }

    @Test
    void term_prefixQuery_marksTheWholeWord() {
        final String name = token("customerz");
        final long termId = seedTerm(name, "d", token("finance"), null, null, null);

        final AssetSearchHighlight h =
            highlightService.highlight(AssetKind.TERM, termId, name.substring(0, name.length() - 3)).block();

        assertThat(h.getTerm().getName()).isEqualTo(mark(name));
    }

    @Test
    void term_operatorQueries_markWhatMatched_andNeverError() {
        final String a = token("alpha");
        final String b = token("beta");
        final long termId = seedTerm(token("t"), a + " " + b + " gamma", token("finance"), null, null, null);

        final AssetSearchHighlight phrase =
            highlightService.highlight(AssetKind.TERM, termId, "\"" + a + " " + b + "\"").block();
        assertThat(phrase.getTerm().getDefinition()).isEqualTo(mark(a) + " " + mark(b) + " gamma");

        // A -excluded word is marked where it happens to appear - the documented behaviour of the shared sink.
        final AssetSearchHighlight exclusion =
            highlightService.highlight(AssetKind.TERM, termId, a + " -gamma").block();
        assertThat(exclusion.getTerm().getDefinition()).startsWith(mark(a));

        final AssetSearchHighlight poison =
            highlightService.highlight(AssetKind.TERM, termId, a + " (:*&|!").block();
        assertThat(poison.getTerm().getDefinition()).startsWith(mark(a));

        final AssetSearchHighlight blank = highlightService.highlight(AssetKind.TERM, termId, "").block();
        assertThat(blank.getTerm().getName()).isNull();
        assertThat(blank.getTerm().getDefinition()).isNull();
    }

    @Test
    void term_softDeleted_orMissing_isNotFound() {
        final long termId = seedTerm(token("gone"), "d", token("finance"), null, null, null);
        termRepository.delete(termId).block();

        StepVerifier.create(highlightService.highlight(AssetKind.TERM, termId, "gone"))
            .expectError(NotFoundException.class).verify();
        StepVerifier.create(highlightService.highlight(AssetKind.TERM, 999_999L, "gone"))
            .expectError(NotFoundException.class).verify();
    }

    // ---- Query Example ---------------------------------------------------------------------------------------

    @Test
    void queryExample_foundBySqlText_marksTheQuery_andWindowsNothingServerSide() {
        final String table = token("orders");
        final long qeId = seedQueryExample("daily totals", "select * from " + table + " where a<b and c>d");

        final AssetSearchHighlight h = highlightService.highlight(AssetKind.QUERY_EXAMPLE, qeId, table).block();

        assertThat(h.getAssetKind()).isEqualTo(AssetKind.QUERY_EXAMPLE);
        assertThat(h.getQueryExample().getQuery()).isEqualTo("select * from " + mark(table) + " where a<b and c>d");
        assertThat(h.getQueryExample().getDefinition()).isNull();
        assertThat(h.getQueryExample().getLinkedEntities()).isNull();
    }

    @Test
    void queryExample_foundOnlyByALinkedEntityName_marksTheLinkedEntity() {
        final String entityName = token("linkedtbl");
        final long entityId = seedDataEntity(entityName, "desc", false, DataEntityStatusDto.UNASSIGNED, false);
        final long qeId = seedQueryExample("totals", "select 1");
        queryExampleRelationRepository.createRelationWithDataEntity(entityId, qeId).block();

        final AssetSearchHighlight h = highlightService.highlight(AssetKind.QUERY_EXAMPLE, qeId, entityName).block();

        assertThat(h.getQueryExample().getQuery()).isNull();
        assertThat(h.getQueryExample().getLinkedEntities()).hasSize(1);
        assertThat(h.getQueryExample().getLinkedEntities().get(0).getExternalName()).isEqualTo(mark(entityName));
    }

    @Test
    void queryExample_matchBeyondTheFieldBound_isNotMarked() {
        final String word = token("deepword");
        final long qeId = seedQueryExample("d", "select 1 -- " + "x".repeat(POLYMORPHIC_FIELD_CAP) + " " + word);

        final AssetSearchHighlight h = highlightService.highlight(AssetKind.QUERY_EXAMPLE, qeId, word).block();

        assertThat(h.getQueryExample().getQuery()).isNull();
        assertThat(h.getQueryExample().getDefinition()).isNull();
    }

    @Test
    void queryExample_softDeleted_orMissing_isNotFound() {
        final long qeId = seedQueryExample("gone", "select 1");
        queryExampleRepository.delete(qeId).block();

        StepVerifier.create(highlightService.highlight(AssetKind.QUERY_EXAMPLE, qeId, "gone"))
            .expectError(NotFoundException.class).verify();
        StepVerifier.create(highlightService.highlight(AssetKind.QUERY_EXAMPLE, 999_999L, "gone"))
            .expectError(NotFoundException.class).verify();
    }

    // ---- Data Entity: parity with the legacy endpoint, visibility, the markup class --------------------------

    @Test
    void dataEntity_parityWithTheLegacySessionEndpoint_withinTheBound_andTheLegacyStillCarriesHtmlMarks() {
        final String name = token("orders");
        final String word = token("shipped");
        final String ns = token("nsde");
        final String tag = token("tagde");
        final String title = token("titlede");
        final long deId = seedDataEntity(name, "rows of " + word + " orders", false, DataEntityStatusDto.STABLE, false,
            ns, tag, token("owner"), title);
        final String query = name + " " + word + " " + ns + " " + tag + " " + title;

        final DataEntitySearchHighlight polymorphic =
            highlightService.highlight(AssetKind.DATA_ENTITY, deId, query).block().getDataEntity();
        final SearchFacetsData session = searchService.search(
            new SearchFormData().query(query).filters(new SearchFormDataFilters())).block();
        final DataEntitySearchHighlight legacy =
            dataEntityHighlightService.highlightDataEntity(session.getSearchId(), deId).block();

        // The legacy dialect is unchanged: <b>/</b> on the wire, never a sentinel.
        assertThat(legacy.getDataEntity().getExternalName()).isEqualTo("<b>" + name + "</b>");
        assertThat(legacy.toString()).doesNotContain(MARK_START).doesNotContain(MARK_END);
        // The polymorphic dialect: the sentinels, and the same content once mapped.
        assertThat(polymorphic.getDataEntity().getExternalName()).isEqualTo(mark(name));
        assertThat(toHtmlMarks(polymorphic.getDataEntity().getExternalDescription()))
            .isEqualTo(legacy.getDataEntity().getExternalDescription());
        assertThat(toHtmlMarks(polymorphic.getNamespace().getName())).isEqualTo(legacy.getNamespace().getName());
        assertThat(toHtmlMarks(polymorphic.getTags().get(0).getName())).isEqualTo(legacy.getTags().get(0).getName());
        assertThat(toHtmlMarks(polymorphic.getOwners().get(0).getTitle()))
            .isEqualTo(legacy.getOwners().get(0).getTitle());
    }

    /** The one stated difference: the legacy path is unbounded, the polymorphic path bounds each field. */
    @Test
    void dataEntity_matchBeyondTheBound_legacyMarksIt_polymorphicDoesNot() {
        final String name = token("longdesc");
        final String word = token("deepde");
        final long deId = seedDataEntity(name, "y".repeat(POLYMORPHIC_FIELD_CAP) + " " + word, false,
            DataEntityStatusDto.STABLE, false);

        final DataEntitySearchHighlight polymorphic =
            highlightService.highlight(AssetKind.DATA_ENTITY, deId, word).block().getDataEntity();
        final SearchFacetsData session = searchService.search(
            new SearchFormData().query(word).filters(new SearchFormDataFilters())).block();
        final DataEntitySearchHighlight legacy =
            dataEntityHighlightService.highlightDataEntity(session.getSearchId(), deId).block();

        assertThat(legacy.getDataEntity().getExternalDescription()).endsWith("<b>" + word + "</b>");
        assertThat(polymorphic.getDataEntity()).isNull();
    }

    @Test
    void dataEntity_notVisibleToTheSearch_isNotFound_theLegacyPathStillAnswers() {
        final String word = token("hidden");
        final long deleted = seedDataEntity(word + "a", "d", false, DataEntityStatusDto.DELETED, false);
        final long hollow = seedDataEntity(word + "b", "d", true, DataEntityStatusDto.STABLE, false);
        final long excluded = seedDataEntity(word + "c", "d", false, DataEntityStatusDto.STABLE, true);

        for (final long id : List.of(deleted, hollow, excluded)) {
            StepVerifier.create(highlightService.highlight(AssetKind.DATA_ENTITY, id, word))
                .expectError(NotFoundException.class).verify();
        }
        StepVerifier.create(highlightService.highlight(AssetKind.DATA_ENTITY, 999_999L, word))
            .expectError(NotFoundException.class).verify();

        // ADR D9: the legacy session path keeps its behaviour - it explains a DELETED entity as before.
        final SearchFacetsData session = searchService.search(
            new SearchFormData().query(word).filters(new SearchFormDataFilters())).block();
        assertThat(dataEntityHighlightService.highlightDataEntity(session.getSearchId(), deleted).block()
            .getDataEntity().getExternalName()).isEqualTo("<b>" + word + "a</b>");
    }

    /** The markup class: tags, angle brackets and script text travel verbatim; only the matched word is marked. */
    @Test
    void dataEntity_descriptionCarryingMarkup_travelsVerbatim_markedWordOnly() {
        final String word = token("budgetw");
        final String description = "cost<budget and " + word + " <img src=\"/nope\"> <script>x()</script> a<b";
        final long deId = seedDataEntity(token("mk"), description, false, DataEntityStatusDto.STABLE, false);

        final DataEntitySearchHighlight h =
            highlightService.highlight(AssetKind.DATA_ENTITY, deId, word).block().getDataEntity();

        assertThat(h.getDataEntity().getExternalDescription())
            .isEqualTo("cost<budget and " + mark(word) + " <img src=\"/nope\"> <script>x()</script> a<b");
    }

    // ---- fixtures ---------------------------------------------------------------------------------------------

    private long seedTerm(final String name, final String definition, final String namespaceName,
                          final String tagName, final String ownerName, final String titleName) {
        final NamespacePojo ns = namespaceRepository.createByName(namespaceName).block();
        final TermPojo term = termRepository.create(new TermPojo()
            .setName(name).setDefinition(definition).setNamespaceId(ns.getId())).block();
        if (tagName != null) {
            final TagPojo tag = tagRepository.create(new TagPojo().setName(tagName).setImportant(false)).block();
            tagRepository.createTermRelations(term.getId(), List.of(tag.getId())).blockLast();
        }
        if (ownerName != null) {
            final OwnerPojo owner = ownerRepository.create(new OwnerPojo().setName(ownerName)).block();
            final TitlePojo title = titleRepository.create(new TitlePojo().setName(titleName)).block();
            termOwnershipRepository.create(new TermOwnershipPojo()
                .setTermId(term.getId()).setOwnerId(owner.getId()).setTitleId(title.getId())).block();
        }
        return term.getId();
    }

    private long seedQueryExample(final String definition, final String query) {
        return queryExampleRepository.bulkCreate(List.of(new QueryExamplePojo()
            .setDefinition(definition).setQuery(query))).collectList().block().get(0).getId();
    }

    private long seedDataEntity(final String name, final String description, final boolean hollow,
                                final DataEntityStatusDto status, final boolean excluded) {
        return seedDataEntity(name, description, hollow, status, excluded, null, null, null, null);
    }

    private long seedDataEntity(final String name, final String description, final boolean hollow,
                                final DataEntityStatusDto status, final boolean excluded,
                                final String namespaceName, final String tagName,
                                final String ownerName, final String titleName) {
        final DataEntityPojo pojo = new DataEntityPojo()
            .setOddrn("//highlight/de/" + name)
            .setExternalName(name)
            .setExternalDescription(description)
            .setEntityClassIds(new Integer[] {1})
            .setTypeId(1)
            .setHollow(hollow)
            .setStatus(status.getId())
            .setExcludeFromSearch(excluded);
        if (namespaceName != null) {
            final NamespacePojo ns = namespaceRepository.createByName(namespaceName).block();
            pojo.setNamespaceId(ns.getId());
            final DataSourcePojo source = dataSourceRepository.create(new DataSourcePojo()
                .setName(token("src")).setOddrn("//highlight/src/" + name).setNamespaceId(ns.getId())).block();
            pojo.setDataSourceId(source.getId());
        }
        final DataEntityPojo created = dataEntityRepository.bulkCreate(List.of(pojo)).blockLast();
        if (tagName != null) {
            final TagPojo tag = tagRepository.create(new TagPojo().setName(tagName).setImportant(false)).block();
            tagRepository.createDataEntityRelations(List.of(new TagToDataEntityPojo()
                .setTagId(tag.getId()).setDataEntityId(created.getId()).setExternal(false))).blockLast();
        }
        if (ownerName != null) {
            final OwnerPojo owner = ownerRepository.create(new OwnerPojo().setName(ownerName)).block();
            final TitlePojo title = titleRepository.create(new TitlePojo().setName(titleName)).block();
            ownershipRepository.create(new OwnershipPojo()
                .setDataEntityId(created.getId()).setOwnerId(owner.getId()).setTitleId(title.getId())).block();
        }
        return created.getId();
    }
}
