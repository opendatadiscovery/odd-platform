package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.jooq.JSONB;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.Asset;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermOwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTitleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * CTRIB-073 / #1847 ST-13a — the result-column projection on the cross-kind search, end to end through the real
 * repositories (R7): {@code columns} on the request body selects which extra values each item carries in
 * {@code fields}; a value is present only when its column was named AND the item's kind carries it; an unknown
 * token is dropped; no {@code columns} means no {@code fields} object at all — the pre-ST-13a payload.
 */
class AssetSearchColumnsIntegrationTest extends BaseIntegrationTest {

    @Autowired private AssetSearchService assetSearchService;
    @Autowired private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired private ReactiveSearchEntrypointRepository searchEntrypointRepository;
    @Autowired private ReactiveTermRepository termRepository;
    @Autowired private ReactiveTermSearchEntrypointRepository termSearchEntrypointRepository;
    @Autowired private ReactiveTermOwnershipRepository termOwnershipRepository;
    @Autowired private ReactiveNamespaceRepository namespaceRepository;
    @Autowired private ReactiveOwnerRepository ownerRepository;
    @Autowired private ReactiveTitleRepository titleRepository;
    @Autowired private ReactiveOwnershipRepository ownershipRepository;
    @Autowired private ReactiveQueryExampleRepository queryExampleRepository;
    @Autowired private ReactiveQueryExampleSearchEntrypointRepository queryExampleSearchEntrypointRepository;

    @Test
    @DisplayName("columns on the body project only the requested + applicable values onto each kind's row")
    void searchAssets_columns_projectsRequestedApplicableValuesPerKind() {
        final String token = "colproj" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        final NamespacePojo ns = namespaceRepository.createByName("ns-" + token).block();
        final OwnerPojo owner = ownerRepository.create(new OwnerPojo().setName("owner-" + token)).block();
        final TitlePojo title = titleRepository.create(new TitlePojo().setName("title-" + token)).block();

        final DataEntityPojo de = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()
            .setOddrn("//assetsearch/columns/" + token)
            .setExternalName(token)
            .setEntityClassIds(new Integer[] {1}) // DATA_SET
            .setTypeId(1)
            .setHollow(false)
            .setNamespaceId(ns.getId())
            .setStatus(DataEntityStatusDto.STABLE.getId())
            .setExcludeFromSearch(false)
            .setExternalDescription("external " + token)
            .setViewCount(42L)
            .setSourceUpdatedAt(LocalDateTime.of(2025, 6, 1, 10, 0))
            .setSpecificAttributes(JSONB.jsonb("{\"DATA_SET\":{\"rows_count\":123456,\"fields_count\":17}}"))))
            .blockLast();
        searchEntrypointRepository.updateDataEntityVectors(de.getId()).block();
        ownershipRepository.create(new OwnershipPojo()
            .setDataEntityId(de.getId()).setOwnerId(owner.getId()).setTitleId(title.getId())).block();

        final TermPojo term = termRepository.create(new TermPojo()
            .setName(token).setDefinition("term definition " + token).setNamespaceId(ns.getId())).block();
        termSearchEntrypointRepository.updateTermVectors(term.getId()).block();
        termOwnershipRepository.create(new TermOwnershipPojo()
            .setTermId(term.getId()).setOwnerId(owner.getId()).setTitleId(title.getId())).block();

        final QueryExamplePojo qe = queryExampleRepository.bulkCreate(List.of(new QueryExamplePojo()
            .setQuery("select 1").setDefinition("qe " + token))).collectList().block().get(0);
        queryExampleSearchEntrypointRepository.updateQueryExampleVectors(qe.getId()).block();

        final AssetSearchFormData request = new AssetSearchFormData()
            .query(token)
            .filters(new SearchFormDataFilters())
            .columns(List.of("namespace", "owners", "updated_at", "rows_count", "description", "nope", "type"));

        assetSearchService.searchAssets(request, 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> {
                assertThat(list.getItems()).extracting(Asset::getAssetKind)
                    .contains(AssetKind.DATA_ENTITY, AssetKind.TERM, AssetKind.QUERY_EXAMPLE);
                assertThat(list.getItems()).anySatisfy(a -> {
                    assertThat(a.getAssetKind()).isEqualTo(AssetKind.DATA_ENTITY);
                    assertThat(a.getFields()).as("the DE row carries the requested values").isNotNull();
                    assertThat(a.getFields().getNamespace().getName()).isEqualTo("ns-" + token);
                    assertThat(a.getFields().getOwners()).hasSize(1);
                    assertThat(a.getFields().getOwners().get(0).getOwner().getName()).isEqualTo("owner-" + token);
                    assertThat(a.getFields().getOwners().get(0).getTitle().getName()).isEqualTo("title-" + token);
                    assertThat(a.getFields().getUpdatedAt()).isNotNull();
                    assertThat(a.getFields().getRowsCount()).isEqualTo(123456L);
                    assertThat(a.getFields().getDescription())
                        .as("no platform description was written -> the source's").isEqualTo("external " + token);
                    assertThat(a.getFields().getFieldsCount()).as("not requested -> absent").isNull();
                    assertThat(a.getFields().getViewCount()).as("not requested -> absent").isNull();
                });
                assertThat(list.getItems()).anySatisfy(a -> {
                    assertThat(a.getAssetKind()).isEqualTo(AssetKind.TERM);
                    assertThat(a.getFields()).isNotNull();
                    assertThat(a.getFields().getNamespace().getName()).isEqualTo("ns-" + token);
                    assertThat(a.getFields().getOwners()).hasSize(1);
                    assertThat(a.getFields().getUpdatedAt()).isNotNull();
                    assertThat(a.getFields().getDescription()).isEqualTo("term definition " + token);
                    assertThat(a.getFields().getRowsCount()).as("a term has no rows").isNull();
                });
                assertThat(list.getItems()).anySatisfy(a -> {
                    assertThat(a.getAssetKind()).isEqualTo(AssetKind.QUERY_EXAMPLE);
                    assertThat(a.getFields()).isNotNull();
                    assertThat(a.getFields().getUpdatedAt()).isNotNull();
                    assertThat(a.getFields().getDescription()).isEqualTo("qe " + token);
                    assertThat(a.getFields().getNamespace()).as("a query example has no namespace").isNull();
                    assertThat(a.getFields().getOwners()).isNull();
                });
            })
            .verifyComplete();

        // No columns -> no fields object on any item: the pre-ST-13a payload (ADR D9).
        assetSearchService.searchAssets(new AssetSearchFormData().query(token).filters(new SearchFormDataFilters()),
                30, null)
            .as(StepVerifier::create)
            .assertNext(list -> assertThat(list.getItems()).allSatisfy(a -> assertThat(a.getFields()).isNull()))
            .verifyComplete();

        // Only unknown / client-only tokens -> the same as none.
        assetSearchService.searchAssets(new AssetSearchFormData().query(token).filters(new SearchFormDataFilters())
                    .columns(List.of("type", "status", "nope")), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> assertThat(list.getItems()).allSatisfy(a -> assertThat(a.getFields()).isNull()))
            .verifyComplete();
    }
}
