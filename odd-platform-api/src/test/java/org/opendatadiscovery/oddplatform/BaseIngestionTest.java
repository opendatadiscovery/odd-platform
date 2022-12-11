package org.opendatadiscovery.oddplatform;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.BiConsumer;
import java.util.stream.Collectors;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilterState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetStatistics;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DatasetStatisticsList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import static org.assertj.core.api.Assertions.assertThat;

@AutoConfigureWebTestClient(timeout = "60000")
public abstract class BaseIngestionTest extends BaseIntegrationTest {
    @Autowired
    protected WebTestClient webTestClient;

    protected DataSource createDataSource() {
        final DataSourceFormData form = new DataSourceFormData()
            .name(UUID.randomUUID().toString())
            .oddrn(UUID.randomUUID().toString())
            .active(true)
            .namespaceName(UUID.randomUUID().toString());

        return webTestClient.post()
            .uri("/api/datasources")
            .body(Mono.just(form), DataSourceFormData.class)
            .exchange()
            .returnResult(DataSource.class)
            .getResponseBody()
            .single()
            .block();
    }

    protected void ingestAndAssert(final DataEntityList dataEntityList) {
        webTestClient.post()
            .uri("/ingestion/entities")
            .body(Mono.just(dataEntityList), DataEntityList.class)
            .exchange()
            .expectStatus().isOk();
    }

    protected void ingestStatistics(final DatasetStatisticsList statistics) {
        webTestClient.post()
            .uri("/ingestion/entities/datasets/stats")
            .body(Mono.just(statistics), DatasetStatisticsList.class)
            .exchange()
            .expectStatus().isCreated();
    }

    protected long extractIngestedEntityIdAndAssert(final DataSource createdDataSource) {
        return (long) extractIngestedEntitiesAndAssert(createdDataSource, 1).values().toArray()[0];
    }

    protected void assertDataEntityDetailsEqual(final DataEntityDetails expected) {
        assertDataEntityDetailsEqual(expected, null);
    }

    protected void assertDataEntityDetailsEqual(
        final DataEntityDetails expected,
        final BiConsumer<DataEntityDetails, DataEntityDetails> additionalAssertions
    ) {
        webTestClient.get()
            .uri("/api/dataentities/{data_entity_id}", expected.getId())
            .exchange()
            .expectStatus().isOk()
            .expectBody(DataEntityDetails.class)
            .value(actual -> {
                assertThat(actual)
                    .usingRecursiveComparison()
                    .ignoringFields(
                        "dataSource.token", "viewCount", "updatedAt",
                        "versionList", "entityClasses", "type.id",
                        "sourceList", "targetList", "datasetsList", "metadataFieldValues",
                        "latestRun.id", "latestRun.updatedAt", "latestRun.createdAt"
                    )
                    .isEqualTo(expected);

                assertThat(actual.getMetadataFieldValues())
                    .usingRecursiveFieldByFieldElementComparatorIgnoringFields("field.id")
                    .hasSameElementsAs(expected.getMetadataFieldValues());

                if (additionalAssertions != null) {
                    additionalAssertions.accept(expected, actual);
                }
            });
    }

    protected void assertDatasetStructuresEqual(final long dataEntityId, final DataSetStructure expected) {
        webTestClient.get()
            .uri("/api/datasets/{dataset_id}/structure", dataEntityId)
            .exchange()
            .expectStatus().isOk()
            .expectBody(DataSetStructure.class)
            .value(actual -> {
                assertThat(expected.getDataSetVersion())
                    .usingRecursiveComparison()
                    .ignoringFields("id", "createdAt")
                    .isEqualTo(actual.getDataSetVersion());

                assertThat(actual.getFieldList()).hasSize(expected.getFieldList().size());

                final List<DataSetField> sortedActualFields = actual.getFieldList().stream()
                    .sorted(Comparator.comparing(DataSetField::getOddrn))
                    .toList();

                final List<DataSetField> sortedExpectedFields = expected.getFieldList().stream()
                    .sorted(Comparator.comparing(DataSetField::getOddrn))
                    .toList();

                for (int i = 0; i < sortedActualFields.size(); i++) {
                    final DataSetField expectedField = sortedExpectedFields.get(i);
                    final DataSetField actualField = sortedActualFields.get(i);

                    assertThat(actualField)
                        .usingRecursiveComparison()
                        .ignoringFields("id", "labels")
                        .isEqualTo(expectedField);

                    assertThat(actualField.getLabels())
                        .usingRecursiveFieldByFieldElementComparatorIgnoringFields("id")
                        .hasSameElementsAs(expectedField.getLabels());
                }
            });
    }

    protected Map<String, Long> extractIngestedEntitiesAndAssert(final DataSource createdDataSource,
                                                                 final long expectedSize) {
        final String searchId = createSearchId();

        final SearchFormData filterByDataSource = new SearchFormData()
            .query("")
            .filters(new SearchFormDataFilters().datasources(List.of(new SearchFilterState()
                .entityId(createdDataSource.getId())
                .entityName(createdDataSource.getName())
                .selected(true))));

        webTestClient.put()
            .uri("/api/search/{search_id}", searchId)
            .body(Mono.just(filterByDataSource), SearchFormData.class)
            .exchange()
            .expectStatus().isOk();

        return webTestClient.get()
            .uri("/api/search/{search_id}/results?page=1&size=1000", searchId)
            .exchange()
            .expectStatus().isOk()
            .expectBody(org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList.class)
            .consumeWith(del -> assertThat(del.getResponseBody().getItems().size()).isEqualTo(expectedSize))
            .returnResult()
            .getResponseBody()
            .getItems()
            .stream()
            .collect(Collectors.toMap(DataEntity::getOddrn, DataEntity::getId));
    }

    protected DataEntityRef buildExpectedDataEntityRef(
        final org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity ingestedEntity,
        final long ingestedId
    ) {
        return new DataEntityRef()
            .id(ingestedId)
            .oddrn(ingestedEntity.getOddrn())
            .externalName(ingestedEntity.getName())
            .url("")
            .hasAlerts(null)
            .manuallyCreated(false);
    }

    private String createSearchId() {
        return webTestClient.post()
            .uri("/api/search")
            .body(Mono.just(new SearchFormData().filters(new SearchFormDataFilters())), SearchFormData.class)
            .exchange()
            .returnResult(SearchFacetsData.class)
            .getResponseBody()
            .single()
            .map(SearchFacetsData::getSearchId)
            .map(UUID::toString)
            .block();
    }
}
