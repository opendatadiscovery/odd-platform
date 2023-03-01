package org.opendatadiscovery.oddplatform.api.ingestion;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import org.apache.commons.collections4.ListUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.BulkEnumValueFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStats;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersion;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValue;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueList;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelGenerator;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelMapper;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DatasetStatisticsList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Tag;
import org.springframework.http.MediaType;

import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toMap;
import static org.assertj.core.api.Assertions.assertThat;

public class DatasetFieldIngestionTest extends BaseIngestionTest {
    /**
     * External enum values complex test.
     *
     * <p>Flow:
     * 1. Injects datasets and fields with enum values, asserts success
     * 2. Modifies enum values' state in various ways (deletes, updates descriptions, etc.) and asserts correct changes
     * 3. Injects an empty enum value state and asserts that no changes were written into the database
     */
    @Test
    @DisplayName("External enum values complex test")
    public void enumValuesComplexTest() {
        final var createdDataSource = createDataSource();

        final Map<String, List<EnumValue>> dsfOddrnToEnums = new HashMap<>();

        final List<DataSetField> fieldList = IngestionModelGenerator.generateDatasetFields(5);
        for (final DataSetField field : fieldList) {
            field.setEnumValues(IngestionModelGenerator.generateDataSetFieldEnumValues(5));
            dsfOddrnToEnums.put(field.getOddrn(), IngestionModelMapper.buildExpectedEnumValues(field.getEnumValues()));
        }

        final DataEntity datasetToIngest = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.TABLE)
            .type(DataEntityType.TABLE)
            .dataset(new DataSet().fieldList(fieldList).rowsNumber(1000L));

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(datasetToIngest));

        ingestAndAssert(dataEntityList);

        final long foundEntityId = extractIngestedEntityIdAndAssert(createdDataSource);

        final var expectedDataEntityDetails = IngestionModelMapper
            .buildExpectedBaseDEDetails(foundEntityId, datasetToIngest, createdDataSource)
            .stats(new DataSetStats()
                .consumersCount(0L)
                .fieldsCount((long) datasetToIngest.getDataset().getFieldList().size())
                .rowsCount(datasetToIngest.getDataset().getRowsNumber()));

        final var expectedDataStructure = new DataSetStructure()
            .dataSetVersion(new DataSetVersion().version(1))
            .fieldList(datasetToIngest.getDataset().getFieldList().stream()
                .map(IngestionModelMapper::buildExpectedDataSetField).toList());

        assertDataEntityDetailsEqual(expectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(1);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
        });

        assertDatasetStructuresEqual(foundEntityId, expectedDataStructure);
        assertEnumState(foundEntityId, dsfOddrnToEnums);

        // change enums so that different parts of the state got deleted, created and updated
        for (final DataSetField field : fieldList) {
            field.getEnumValues().get(0).setDescription("updated_description");
            field.setEnumValues(
                ListUtils.union(
                    field.getEnumValues().subList(0, 2),
                    IngestionModelGenerator.generateDataSetFieldEnumValues(2)
                )
            );

            dsfOddrnToEnums.put(field.getOddrn(), IngestionModelMapper.buildExpectedEnumValues(field.getEnumValues()));
        }

        ingestAndAssert(dataEntityList);
        assertDataEntityDetailsEqual(expectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(1);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
        });

        final var updatedExpectedDataStructure = new DataSetStructure()
            .dataSetVersion(new DataSetVersion().version(1))
            .fieldList(datasetToIngest.getDataset().getFieldList().stream()
                .map(IngestionModelMapper::buildExpectedDataSetField).toList());

        assertDatasetStructuresEqual(foundEntityId, updatedExpectedDataStructure);
        assertEnumState(foundEntityId, dsfOddrnToEnums);

        // inject an empty enum value state
        for (final DataSetField field : fieldList) {
            field.setEnumValues(null);
        }

        ingestAndAssert(dataEntityList);
        assertDatasetStructuresEqual(foundEntityId, updatedExpectedDataStructure);
        assertEnumState(foundEntityId, dsfOddrnToEnums);
    }

    /**
     * Rewriting internal state of enum values test
     *
     * <p>Flow:
     * 1. Injects dataset with fields and creates internal enum values
     * 2. Rewrites internal state with external state and asserts changes written into the database
     */
    @Test
    @DisplayName("Rewriting internal state of enum values with external one")
    public void rewritingInternalEnumStateTest() {
        final var createdDataSource = createDataSource();

        final Map<String, List<EnumValue>> dsfOddrnToEnums = new HashMap<>();

        final List<DataSetField> fieldList = IngestionModelGenerator.generateDatasetFields(5);

        final DataEntity datasetToIngest = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.TABLE)
            .type(DataEntityType.TABLE)
            .dataset(new DataSet().fieldList(fieldList).rowsNumber(1000L));

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(datasetToIngest));

        ingestAndAssert(dataEntityList);

        final long foundEntityId = extractIngestedEntityIdAndAssert(createdDataSource);

        final var expectedDataEntityDetails = IngestionModelMapper
            .buildExpectedBaseDEDetails(foundEntityId, datasetToIngest, createdDataSource)
            .stats(new DataSetStats()
                .consumersCount(0L)
                .fieldsCount((long) datasetToIngest.getDataset().getFieldList().size())
                .rowsCount(datasetToIngest.getDataset().getRowsNumber()));

        final var expectedDataStructure = new DataSetStructure()
            .dataSetVersion(new DataSetVersion().version(1))
            .fieldList(datasetToIngest.getDataset().getFieldList().stream()
                .map(IngestionModelMapper::buildExpectedDataSetField).toList());

        assertDataEntityDetailsEqual(expectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(1);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
        });

        assertDatasetStructuresEqual(foundEntityId, expectedDataStructure);
        createInternalEnumLabelState(foundEntityId);

        for (final var field : fieldList) {
            field.setEnumValues(IngestionModelGenerator.generateDataSetFieldEnumValues(5));
            dsfOddrnToEnums.put(field.getOddrn(), IngestionModelMapper.buildExpectedEnumValues(field.getEnumValues()));
        }

        ingestAndAssert(dataEntityList);

        final var updatedExpectedDataStructure = new DataSetStructure()
            .dataSetVersion(new DataSetVersion().version(1))
            .fieldList(datasetToIngest.getDataset().getFieldList().stream()
                .map(IngestionModelMapper::buildExpectedDataSetField).toList());

        assertDatasetStructuresEqual(foundEntityId, updatedExpectedDataStructure);
        assertEnumState(foundEntityId, dsfOddrnToEnums);
    }

    /**
     * Preserve external labels state from different ingestion endpoints test.
     *
     * <p>Test ingests metadata with statistics and tags via standard Ingestion API endpoint
     * and asserts correct ingestion process
     *
     * <p>Then it ingests statistics and tags via Ingestion Statistics API endpoint and asserts
     * that statistics is updated and labels' states are not mixed
     *
     * <p>Then it ingests the original payload via standard Ingestion API endpoint and asserts
     * that labels' states are the same
     */
    @Test
    @DisplayName("Test whether statistics and tags from different ingestion endpoints do not mix their states")
    public void externalStatisticsLabelStateIngestionTest() {
        final DataSource createdDataSource = createDataSource();

        final DataEntity datasetToIngest = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().fieldList(IngestionModelGenerator.generateDatasetFields(5)).rowsNumber(1000L));

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(datasetToIngest));

        // Ingest a simple dataset with generated statistics and tags
        // via standard Ingestion API endpoint
        ingestAndAssert(dataEntityList);

        final long foundEntityId = extractIngestedEntityIdAndAssert(createdDataSource);

        final var expectedDataEntityDetails = IngestionModelMapper
            .buildExpectedBaseDEDetails(foundEntityId, datasetToIngest, createdDataSource)
            .stats(new DataSetStats()
                .consumersCount(0L)
                .fieldsCount((long) datasetToIngest.getDataset().getFieldList().size())
                .rowsCount(datasetToIngest.getDataset().getRowsNumber()));

        final var expectedDataStructure = new DataSetStructure()
            .dataSetVersion(new DataSetVersion().version(1))
            .fieldList(datasetToIngest.getDataset().getFieldList().stream()
                .map(IngestionModelMapper::buildExpectedDataSetField).toList());

        assertDataEntityDetailsEqual(expectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(1);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
        });

        assertDatasetStructuresEqual(foundEntityId, expectedDataStructure);

        // build statistics and ingest it via Ingestion Statistics API
        final Map<String, List<String>> fieldToLabelNames = datasetToIngest.getDataset().getFieldList()
            .stream()
            .collect(toMap(
                DataSetField::getOddrn,
                // adding 5 new labels and removing half of old ones
                // basically mixing new and old labels together to make assumptions later
                d -> mixLabelState(d.getTags().stream().map(Tag::getName).toList(), 5, d.getTags().size() / 2)
            ));

        final DatasetStatisticsList statistics = IngestionModelGenerator.generateDatasetStatisticsList(
            datasetToIngest.getOddrn(),
            fieldToLabelNames
        );

        ingestStatistics(statistics);

        assertDataEntityDetailsEqual(expectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(1);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
        });

        final Map<String, List<String>> originalLabelState = datasetToIngest.getDataset().getFieldList()
            .stream()
            .collect(toMap(DataSetField::getOddrn, df -> df.getTags().stream().map(Tag::getName).toList()));

        final Map<String, List<Label>> expectedLabelState = fieldToLabelNames.entrySet()
            .stream()
            .collect(toMap(
                Map.Entry::getKey,
                e -> mapLabels(mergeLists(e.getValue(), originalLabelState.getOrDefault(e.getKey(), emptyList())))
            ));

        final DataSetStructure expectedMergedStructure = new DataSetStructure()
            .dataSetVersion(new DataSetVersion().version(1))
            .fieldList(datasetToIngest.getDataset().getFieldList().stream()
                .map(IngestionModelMapper::buildExpectedDataSetField)
                .peek(d -> d.setLabels(expectedLabelState.get(d.getOddrn())))
                .peek(d -> d.setStats(IngestionModelMapper.buildExpectedDataSetFieldStat(
                    statistics.getItems().get(0).getFields().get(d.getOddrn()))))
                .toList());

        assertDatasetStructuresEqual(foundEntityId, expectedMergedStructure);

        // Ingest original payload to assert that labels do not change
        ingestAndAssert(dataEntityList);

        assertDataEntityDetailsEqual(expectedDataEntityDetails, (expected, actual) -> {
            assertThat(actual.getVersionList()).hasSize(1);
            assertThat(actual.getVersionList().get(0).getVersion()).isEqualTo(1);
        });

        final DataSetStructure expectedOriginalStructure = new DataSetStructure()
            .dataSetVersion(new DataSetVersion().version(1))
            .fieldList(datasetToIngest.getDataset().getFieldList().stream()
                .map(IngestionModelMapper::buildExpectedDataSetField)
                .peek(d -> d.setLabels(expectedLabelState.get(d.getOddrn())))
                .toList());

        assertDatasetStructuresEqual(foundEntityId, expectedOriginalStructure);
    }

    private void createInternalEnumLabelState(final long dataEntityId) {
        final DataSetStructure fields = webTestClient.get()
            .uri("/api/datasets/{dataset_id}/structure", dataEntityId).exchange()
            .expectStatus().isOk().expectBody(DataSetStructure.class)
            .returnResult().getResponseBody();

        final BulkEnumValueFormData formData = new BulkEnumValueFormData().items(List.of(
            new EnumValueFormData().name("any name 1").description("any desc 1"),
            new EnumValueFormData().name("any name 2").description("any desc 2"),
            new EnumValueFormData().name("any name 3").description("any desc 3")
        ));

        // noinspection DataFlowIssue, because null-check and correspondent assertions are completed before this assert
        for (final var field : fields.getFieldList()) {
            webTestClient.post()
                .uri("/api/datasetfields/{dataset_field_id}/enum_values", field.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(formData)
                .exchange()
                .expectStatus().is2xxSuccessful();
        }
    }

    private void assertEnumState(final long dataEntityId,
                                 final Map<String, List<EnumValue>> expectedDirectory) {
        final DataSetStructure fields = webTestClient.get()
            .uri("/api/datasets/{dataset_id}/structure", dataEntityId).exchange()
            .expectStatus().isOk().expectBody(DataSetStructure.class)
            .returnResult().getResponseBody();

        // noinspection DataFlowIssue, because null-check and correspondent assertions are completed before this assert
        for (final var field : fields.getFieldList()) {
            webTestClient.get()
                .uri("/api/datasetfields/{dataset_field_id}/enum_values", field.getId()).exchange()
                .expectStatus().isOk().expectBody(EnumValueList.class)
                .value(actualList -> {
                    final List<EnumValue> expected = expectedDirectory.get(field.getOddrn());

                    assertThat(actualList.getExternal()).isTrue();
                    assertThat(actualList.getItems())
                        .usingRecursiveFieldByFieldElementComparatorIgnoringFields("id")
                        .hasSameElementsAs(expected);
                });
        }
    }

    private List<Label> mapLabels(final List<String> labelNames) {
        return labelNames.stream()
            .map(ln -> new Label().name(ln).external(true))
            .toList();
    }

    private <T> List<T> mergeLists(final List<T> l1, final List<T> l2) {
        final HashSet<T> res = new HashSet<>();

        res.addAll(l1);
        res.addAll(l2);

        return new ArrayList<>(res);
    }

    private List<String> mixLabelState(final List<String> currentLabels,
                                       final int appendedLabelsCount,
                                       final int trimmedLabelSize) {
        final List<String> appendedLabels = IngestionModelGenerator
            .generateDataSetFieldLabels(appendedLabelsCount).stream()
            .map(Tag::getName)
            .toList();

        return ListUtils.union(
            currentLabels.subList(0, currentLabels.size() - trimmedLabelSize),
            appendedLabels
        );
    }
}
