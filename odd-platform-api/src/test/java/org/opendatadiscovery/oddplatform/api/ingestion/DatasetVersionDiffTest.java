package org.opendatadiscovery.oddplatform.api.ingestion;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldDiffState;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersion;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersionDiff;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersionDiffList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersionDiffStatus;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelGenerator;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldType.TypeEnum.INTEGER;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldType.TypeEnum.LIST;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldType.TypeEnum.STRING;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldType.TypeEnum.STRUCT;

public class DatasetVersionDiffTest extends BaseIngestionTest {

    /**
     * 1. Create data entity with different fields (including nested fields)
     * 2. Modify some fields, change nested structure
     * 3. Validate diff between 2 versions
     */

    @Test
    public void datasetVersionDiff() {
        final var createdDataSource = createDataSource();
        final List<DataSetField> firstVersionFields = generateFirstVersionFields();
        final DataEntity datasetToIngest = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.TABLE)
            .type(DataEntityType.TABLE)
            .dataset(new DataSet().fieldList(firstVersionFields));

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(datasetToIngest));

        ingestAndAssert(dataEntityList);

        final long foundEntityId = extractIngestedEntityIdAndAssert(createdDataSource);

        final List<DataSetField> secondVersionFields = generateSecondVersionFields(firstVersionFields);
        datasetToIngest.getDataset().setFieldList(secondVersionFields);

        ingestAndAssert(dataEntityList);

        final DataEntityDetails details = getDetails(foundEntityId);
        final List<DataSetVersion> versions = details.getVersionList().stream()
            .sorted(Comparator.comparing(DataSetVersion::getVersion))
            .toList();
        final Long firstVersionId = versions.get(0).getId();
        final Long secondVersionId = versions.get(1).getId();

        final DataSetStructure firstVersionStructure = getDatasetStructureByVersionId(foundEntityId, firstVersionId);
        final DataSetStructure secondVersionStructure = getDatasetStructureByVersionId(foundEntityId, secondVersionId);

        final DataSetVersionDiffList expected = buildExpectedDiffList(firstVersionId.toString(),
            secondVersionId.toString(),
            firstVersionStructure, secondVersionStructure);

        assertDiffBetweenVersions(foundEntityId, firstVersionId, secondVersionId, expected);
    }

    private DataEntityDetails getDetails(final Long entityId) {
        return webTestClient.get()
            .uri("/api/dataentities/{data_entity_id}", entityId)
            .exchange()
            .returnResult(DataEntityDetails.class)
            .getResponseBody()
            .single()
            .block();
    }

    private DataSetStructure getDatasetStructureByVersionId(final long dataEntityId,
                                                            final long versionId) {
        return webTestClient.get()
            .uri("/api/datasets/{data_entity_id}/structure/{version_id}", dataEntityId, versionId)
            .exchange()
            .returnResult(DataSetStructure.class)
            .getResponseBody()
            .single()
            .block();
    }

    private void assertDiffBetweenVersions(final Long dataEntityId,
                                           final Long firstVersionId,
                                           final Long secondVersionId,
                                           final DataSetVersionDiffList expected) {
        webTestClient.get()
            .uri("/api/datasets/{data_entity_id}/structure/diff"
                    + "?first_version_id={first_version_id}&second_version_id={second_version_id}",
                dataEntityId, firstVersionId, secondVersionId)
            .exchange()
            .expectStatus().isOk()
            .expectBody(DataSetVersionDiffList.class)
            .value(actual -> assertThat(actual)
                .usingRecursiveComparison()
                .ignoringCollectionOrder()
                .isEqualTo(expected));
    }

    private DataSetVersionDiffList buildExpectedDiffList(final String firstVersionId,
                                                         final String secondVersionId,
                                                         final DataSetStructure firstVersionStructure,
                                                         final DataSetStructure secondVersionStructure) {
        final DataSetVersionDiffList result = new DataSetVersionDiffList();

        final var id = getField(firstVersionStructure.getFieldList(), "id");
        final DataSetVersionDiff idDiff = new DataSetVersionDiff();
        idDiff.setStatus(DataSetVersionDiffStatus.NO_CHANGES);
        final DataSetFieldDiffState idState = generateDiffState(id);
        idDiff.setStates(generateState(firstVersionId, idState, secondVersionId, idState));

        final var name = getField(firstVersionStructure.getFieldList(), "name");
        final DataSetVersionDiff nameDiff = new DataSetVersionDiff();
        nameDiff.setStatus(DataSetVersionDiffStatus.DELETED);
        nameDiff.setStates(generateState(firstVersionId, generateDiffState(name), secondVersionId, null));

        final var parent = getField(firstVersionStructure.getFieldList(), "parent");
        final DataSetVersionDiff parentDiff = new DataSetVersionDiff();
        parentDiff.setStatus(DataSetVersionDiffStatus.NO_CHANGES);
        final DataSetFieldDiffState parentState = generateDiffState(parent);
        parentDiff.setStates(generateState(firstVersionId, parentState, secondVersionId, parentState));

        final var newParent = getField(secondVersionStructure.getFieldList(), "new_parent");
        final DataSetVersionDiff newParentDiff = new DataSetVersionDiff();
        newParentDiff.setStatus(DataSetVersionDiffStatus.CREATED);
        final DataSetFieldDiffState newParentState = generateDiffState(newParent);
        newParentDiff.setStates(generateState(firstVersionId, null, secondVersionId, newParentState));

        final var firstChild = getField(firstVersionStructure.getFieldList(), "first_child");
        final DataSetVersionDiff firstChildDiff = new DataSetVersionDiff();
        firstChildDiff.setStatus(DataSetVersionDiffStatus.DELETED);
        final DataSetFieldDiffState firstChildState = generateDiffState(firstChild);
        firstChildDiff.setStates(generateState(firstVersionId, firstChildState, secondVersionId, null));

        final var secondChild = getField(firstVersionStructure.getFieldList(), "second_child");
        final DataSetVersionDiff secondChildDiff = new DataSetVersionDiff();
        secondChildDiff.setStatus(DataSetVersionDiffStatus.DELETED);
        final DataSetFieldDiffState secondChildState = generateDiffState(secondChild);
        secondChildDiff.setStates(generateState(firstVersionId, secondChildState, secondVersionId, null));

        final var newFirstChild = getField(secondVersionStructure.getFieldList(), "first_child");
        final DataSetVersionDiff newFirstChildDiff = new DataSetVersionDiff();
        newFirstChildDiff.setStatus(DataSetVersionDiffStatus.CREATED);
        final DataSetFieldDiffState newFirstChildState = generateDiffState(newFirstChild);
        newFirstChildDiff.setStates(generateState(firstVersionId, null, secondVersionId, newFirstChildState));

        final var newSecondChild = getField(secondVersionStructure.getFieldList(), "second_child");
        final DataSetVersionDiff newSecondChildDiff = new DataSetVersionDiff();
        newSecondChildDiff.setStatus(DataSetVersionDiffStatus.CREATED);
        final DataSetFieldDiffState newSecondChildState = generateDiffState(newSecondChild);
        newSecondChildDiff.setStates(generateState(firstVersionId, null, secondVersionId, newSecondChildState));

        result.setFieldList(
            List.of(idDiff, nameDiff, parentDiff, newParentDiff, firstChildDiff, secondChildDiff, newFirstChildDiff,
                newSecondChildDiff));
        return result;
    }

    private Map<String, DataSetFieldDiffState> generateState(final String firstVersionId,
                                                             final DataSetFieldDiffState firstState,
                                                             final String secondVersionId,
                                                             final DataSetFieldDiffState secondState) {
        final Map<String, DataSetFieldDiffState> state = new HashMap<>();
        state.put(firstVersionId, firstState);
        state.put(secondVersionId, secondState);
        return state;
    }

    private DataSetFieldDiffState generateDiffState(
        final org.opendatadiscovery.oddplatform.api.contract.model.DataSetField field) {
        final DataSetFieldDiffState state = new DataSetFieldDiffState();
        state.setId(field.getId());
        state.setParentFieldId(field.getParentFieldId());
        state.setName(field.getName());
        state.setType(field.getType());
        state.setIsPrimaryKey(field.getIsPrimaryKey());
        state.setIsKey(field.getIsKey());
        state.setIsValue(field.getIsValue());
        return state;
    }

    private List<DataSetField> generateFirstVersionFields() {
        final DataSetField id = generateField(UUID.randomUUID().toString(), "id", getType(INTEGER, false), null, true);
        final DataSetField name =
            generateField(UUID.randomUUID().toString(), "name", getType(STRING, true), null, null);
        final DataSetField parent =
            generateField(UUID.randomUUID().toString(), "parent", getType(STRUCT, false), null, null);
        final DataSetField firstChild =
            generateField(UUID.randomUUID().toString(), "first_child", getType(LIST, false), parent.getOddrn(), null);
        final DataSetField secondChild =
            generateField(UUID.randomUUID().toString(), "second_child", getType(STRING, true), firstChild.getOddrn(),
                null);
        return List.of(id, name, parent, firstChild, secondChild);
    }

    private List<DataSetField> generateSecondVersionFields(final List<DataSetField> firstVersionFields) {
        final DataSetField id = getFieldByName(firstVersionFields, "id");
        final DataSetField parent = getFieldByName(firstVersionFields, "parent");
        final DataSetField newParent =
            generateField(UUID.randomUUID().toString(), "new_parent", getType(STRUCT, false), null, null);

        final DataSetField firstChild = getFieldByName(firstVersionFields, "first_child");
        firstChild.setParentFieldOddrn(newParent.getOddrn());

        final DataSetField secondChild = getFieldByName(firstVersionFields, "second_child");
        return List.of(id, parent, newParent, firstChild, secondChild);
    }

    private DataSetField getFieldByName(final List<DataSetField> fields,
                                        final String name) {
        return fields.stream().filter(f -> f.getName().equals(name)).findFirst().orElseThrow();
    }

    private org.opendatadiscovery.oddplatform.api.contract.model.DataSetField getField(
        final List<org.opendatadiscovery.oddplatform.api.contract.model.DataSetField> fields,
        final String name
    ) {
        return fields.stream().filter(f -> f.getName().equals(name)).findFirst().orElseThrow();
    }

    private DataSetField generateField(final String oddrn,
                                       final String name,
                                       final DataSetFieldType type,
                                       final String parentOddrn,
                                       final Boolean isPrimaryKey) {
        final DataSetField field = new DataSetField();
        field.setOddrn(oddrn);
        field.setName(name);
        field.setType(type);
        field.setParentFieldOddrn(parentOddrn);
        field.setIsPrimaryKey(isPrimaryKey);
        return field;
    }

    private DataSetFieldType getType(final DataSetFieldType.TypeEnum type,
                                     final Boolean nullable) {
        final DataSetFieldType result = new DataSetFieldType();
        result.setType(type);
        result.setIsNullable(nullable);
        result.setLogicalType(UUID.randomUUID().toString());
        return result;
    }
}
