package org.opendatadiscovery.oddplatform.api;

import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatusEnum;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatusFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelGenerator;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import reactor.core.publisher.Mono;

import static org.assertj.core.api.Assertions.assertThat;

public class DataEntityStatusChangeTest extends BaseIngestionTest {

    @Test
    public void statusChangeTest() {
        final DataSource dataSource = createDataSource();
        final DataEntity dataEntity = IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE)
            .dataset(new DataSet());
        final var entityList = new DataEntityList()
            .dataSourceOddrn(dataSource.getOddrn())
            .items(List.of(dataEntity));

        ingestAndAssert(entityList);

        final long foundEntityId = extractIngestedEntityIdAndAssert(dataSource);
        changeStatus(foundEntityId, createStatusFormData(false, DataEntityStatusEnum.STABLE, null));

        final DataEntityDetails details = getDetails(foundEntityId);
        assertThat(details.getStatus().getStatus()).isEqualTo(DataEntityStatusEnum.STABLE);
        assertThat(details.getStatus().getStatusSwitchTime()).isNull();

        final OffsetDateTime statusSwitchTime = OffsetDateTime.now();

        changeStatus(foundEntityId,
            createStatusFormData(false, DataEntityStatusEnum.DEPRECATED, statusSwitchTime));
        final DataEntityDetails deprecated = getDetails(foundEntityId);
        assertThat(deprecated.getStatus().getStatus()).isEqualTo(DataEntityStatusEnum.DEPRECATED);
        assertThat(deprecated.getStatus().getStatusSwitchTime()).isEqualTo(statusSwitchTime);

        changeStatusExceptionally(foundEntityId,
            createStatusFormData(false, DataEntityStatusEnum.DRAFT, null));
    }

    private void changeStatus(final Long dataEntityId,
                              final DataEntityStatusFormData status) {
        webTestClient.put()
            .uri("/api/dataentities/{data_entity_id}/statuses", dataEntityId)
            .body(Mono.just(status), DataEntityStatusFormData.class)
            .exchange()
            .expectStatus().isOk();
    }

    private void changeStatusExceptionally(final Long dataEntityId,
                                           final DataEntityStatusFormData status) {
        webTestClient.put()
            .uri("/api/dataentities/{data_entity_id}/statuses", dataEntityId)
            .body(Mono.just(status), DataEntityStatusFormData.class)
            .exchange()
            .expectStatus()
            .is4xxClientError();
    }

    private DataEntityDetails getDetails(final Long id) {
        return webTestClient.get()
            .uri("/api/dataentities/{data_entity_id}", id)
            .exchange()
            .returnResult(DataEntityDetails.class)
            .getResponseBody()
            .single()
            .block();
    }

    private DataEntityStatusFormData createStatusFormData(final boolean isPropagate,
                                                          final DataEntityStatusEnum statusEnum,
                                                          final OffsetDateTime statusSwitchTime) {
        return new DataEntityStatusFormData()
            .propagate(isPropagate)
            .status(new DataEntityStatus(statusEnum).statusSwitchTime(statusSwitchTime));
    }
}
