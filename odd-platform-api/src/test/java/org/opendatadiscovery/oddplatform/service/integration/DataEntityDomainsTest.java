package org.opendatadiscovery.oddplatform.service.integration;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDomain;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDomainList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatusEnum;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelGenerator;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.service.DataEntityService;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.core.publisher.Mono;

import static org.assertj.core.api.Assertions.assertThat;

public class DataEntityDomainsTest extends BaseIngestionTest {

    @Autowired
    private DataEntityService dataEntityService;

    /**
     * Domains information test.
     *
     * <p>We ingest 3 DEG. 2 domains and 1 DAG. Each has 2 children. Assert correct information
     *
     * <p>We delete 1 domain and 1 children from the second domain. Assert again
     */
    @Test
    void testDomainsInfo() {
        final DataSource createdDataSource = createDataSource();
        final DataEntity firstChild = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(10L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));
        final DataEntity secondChild = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(10L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));
        final DataEntity thirdChild = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(10L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));
        final DataEntity fourthChild = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(10L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));
        final DataEntity fifthChild = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(10L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));
        final DataEntity sixthChild = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet().rowsNumber(10L).fieldList(IngestionModelGenerator.generateDatasetFields(5)));

        final List<DataEntity> items =
            List.of(firstChild, secondChild, thirdChild, fourthChild, fifthChild, sixthChild);

        final var dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(items);
        ingestAndAssert(dataEntityList);

        final Map<String, Long> ingestedEntities = extractIngestedEntitiesAndAssert(createdDataSource, items.size());

        final DataEntityGroupFormData firstDomain =
            createDEGFormData(DataEntityTypeDto.DOMAIN, List.of(firstChild, secondChild), ingestedEntities);
        final DataEntityGroupFormData secondDomain =
            createDEGFormData(DataEntityTypeDto.DOMAIN, List.of(thirdChild, fourthChild), ingestedEntities);
        final DataEntityGroupFormData dag =
            createDEGFormData(DataEntityTypeDto.DAG, List.of(fifthChild, sixthChild), ingestedEntities);

        final DataEntityRef firstDomainRef = createDEG(firstDomain);
        final DataEntityRef secondDomainRef = createDEG(secondDomain);
        createDEG(dag);

        final DataEntityDomainList domainsInfo = getDomainsInfo();
        assertThat(domainsInfo.getItems()).hasSize(2);
        assertThat(domainsInfo.getItems()).hasSameElementsAs(List.of(
            new DataEntityDomain(firstDomainRef, 2L),
            new DataEntityDomain(secondDomainRef, 2L)
        ));

        unAssignEntityFromDeg(ingestedEntities.get(firstChild.getOddrn()), firstDomainRef.getId());
        unAssignEntityFromDeg(ingestedEntities.get(secondChild.getOddrn()), firstDomainRef.getId());
        deleteDeg(firstDomainRef.getId());

        changeStatus(ingestedEntities.get(thirdChild.getOddrn()), new DataEntityStatus(DataEntityStatusEnum.DELETED));

        final DataEntityDomainList updatedDomainsInfo = getDomainsInfo();
        assertThat(updatedDomainsInfo.getItems()).hasSize(1);
        assertThat(updatedDomainsInfo.getItems()).hasSameElementsAs(List.of(
            new DataEntityDomain(secondDomainRef, 1L)
        ));
    }

    private DataEntityDomainList getDomainsInfo() {
        return webTestClient.get()
            .uri("/api/dataentitygroups/domains")
            .exchange()
            .returnResult(DataEntityDomainList.class)
            .getResponseBody()
            .single()
            .block();
    }

    private DataEntityRef createDEG(final DataEntityGroupFormData formData) {
        return webTestClient.post()
            .uri("/api/dataentitygroups")
            .body(Mono.just(formData), DataEntityGroupFormData.class)
            .exchange()
            .returnResult(DataEntityRef.class)
            .getResponseBody()
            .single()
            .block();
    }

    private void deleteDeg(final Long id) {
        webTestClient.delete()
            .uri("/api/dataentitygroups/{id}", id)
            .exchange()
            .expectStatus().isNoContent();
    }

    private void unAssignEntityFromDeg(final Long dataEntityId,
                                       final Long dataEntityGroupId) {
        webTestClient.delete()
            .uri("/api/dataentities/{data_entity_id}/data_entity_group/{data_entity_group_id}",
                dataEntityId,
                dataEntityGroupId)
            .exchange()
            .expectStatus().isNoContent();
    }

    private void changeStatus(final Long dataEntityId,
                              final DataEntityStatus status) {
        webTestClient.put()
            .uri("/api/dataentities/{data_entity_id}/statuses", dataEntityId)
            .body(Mono.just(status), DataEntityStatus.class)
            .exchange()
            .expectStatus().isOk();
    }

    private DataEntityGroupFormData createDEGFormData(final DataEntityTypeDto type,
                                                      final List<DataEntity> children,
                                                      final Map<String, Long> ingestedMap) {
        final DataEntityGroupFormData formData = new DataEntityGroupFormData();
        formData.setName(UUID.randomUUID().toString());
        formData.setType(new org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType()
            .id(type.getId())
            .name(org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType.NameEnum.fromValue(
                type.name())));
        final List<DataEntityRef> dataEntityRefs = children.stream()
            .map(de -> new DataEntityRef()
                .id(ingestedMap.get(de.getOddrn()))
                .oddrn(de.getOddrn())
                .status(new DataEntityStatus(DataEntityStatusEnum.UNASSIGNED))
                .isStale(false))
            .toList();
        formData.setEntities(dataEntityRefs);
        return formData;
    }
}
