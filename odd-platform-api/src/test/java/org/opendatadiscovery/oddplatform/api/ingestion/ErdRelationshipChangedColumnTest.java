package org.opendatadiscovery.oddplatform.api.ingestion;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationship;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationshipList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.ERDRelationshipPairs;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelGenerator;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataRelationship;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.ERDRelationship;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Regression test for the ERD details endpoint on a column whose definition has
 * changed. A changed definition gets a new {@code dataset_field} row under the same
 * ODDRN, and the ERD query joins {@code dataset_field} on ODDRN across every
 * version, so it brings both rows back. Collecting them with
 * {@code Collectors.toMap} and no merge function threw
 * {@code IllegalStateException}, and the endpoint answered 500.
 *
 * <p>It also pins which row the endpoint picks: the one the Structure tab shows
 * for the latest version. The two views would otherwise name a column's
 * definition differently without anything failing.
 */
public class ErdRelationshipChangedColumnTest extends BaseIngestionTest {

    @Test
    public void erdDetailsResolveAChangedColumnToTheRowTheStructureTabShows() {
        final DataSource dataSource = createDataSource();
        final String sourceFieldOddrn = UUID.randomUUID().toString();
        final String targetFieldOddrn = UUID.randomUUID().toString();

        final DataEntity source = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().fieldList(List.of(field(sourceFieldOddrn, "customer_id", true))));
        final DataEntity target = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().fieldList(List.of(field(targetFieldOddrn, "id", false))));
        ingestAndAssert(new DataEntityList().dataSourceOddrn(dataSource.getOddrn()).items(List.of(source, target)));
        final Map<String, Long> ids = extractIngestedEntitiesAndAssert(dataSource, 2);

        // Same column, new definition: it stops being nullable. That is a new dataset
        // version and a second dataset_field row under the same ODDRN.
        source.getDataset().setFieldList(List.of(field(sourceFieldOddrn, "customer_id", false)));
        ingestAndAssert(new DataEntityList().dataSourceOddrn(dataSource.getOddrn()).items(List.of(source)));

        final DataRelationship erd = new DataRelationship()
            .relationshipType(DataRelationship.RelationshipTypeEnum.ERD)
            .details(new ERDRelationship()
                .sourceDatasetFieldOddrnsList(List.of(sourceFieldOddrn))
                .targetDatasetFieldOddrnsList(List.of(targetFieldOddrn))
                .isIdentifying(false));
        erd.setSourceDatasetOddrn(source.getOddrn());
        erd.setTargetDatasetOddrn(target.getOddrn());
        final DataEntity relationship = IngestionModelGenerator
            .generateSimpleDataEntity(DataEntityType.ENTITY_RELATIONSHIP)
            .dataRelationship(erd);
        ingestAndAssert(new DataEntityList().dataSourceOddrn(dataSource.getOddrn()).items(List.of(relationship)));

        final long relationshipId = webTestClient.get()
            .uri(b -> b.path("/api/relationships")
                .queryParam("page", 1).queryParam("size", 100).queryParam("type", "ERD").build())
            .exchange()
            .expectStatus().isOk()
            .expectBody(DataEntityRelationshipList.class)
            .returnResult().getResponseBody()
            .getItems().stream()
            .filter(r -> relationship.getOddrn().equals(r.getOddrn()))
            .map(DataEntityRelationship::getId)
            .findFirst().orElseThrow();

        final DataEntityRelationshipDetails details = webTestClient.get()
            .uri("/api/relationships/erd/{relationship_id}", relationshipId)
            .exchange()
            .expectStatus().isOk()
            .expectBody(DataEntityRelationshipDetails.class)
            .returnResult().getResponseBody();

        final long structureFieldId = webTestClient.get()
            .uri("/api/datasets/{dataset_id}/structure", ids.get(source.getOddrn()))
            .exchange()
            .expectStatus().isOk()
            .expectBody(DataSetStructure.class)
            .returnResult().getResponseBody()
            .getFieldList().stream()
            .filter(f -> sourceFieldOddrn.equals(f.getOddrn()))
            .findFirst().orElseThrow()
            .getId();

        assertThat(details.getErdRelationship().getFieldsPairs())
            .singleElement()
            .extracting(ERDRelationshipPairs::getSourceDatasetFieldId)
            .isEqualTo(structureFieldId);
    }

    private static DataSetField field(final String oddrn, final String name, final boolean nullable) {
        return new DataSetField()
            .oddrn(oddrn)
            .name(name)
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.INTEGER)
                .logicalType("int")
                .isNullable(nullable));
    }
}
