package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRunStatus;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

public class DataQualityRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private DataQualityRepository dataQualityRepository;

    @Autowired
    private DataEntityTaskRunRepository dataEntityTaskRunRepository;

    @Autowired
    private DataEntityRepository dataEntityRepository;

    @Test
    public void getDataQualityTestRunsTest() {
        final DataEntityPojo dataEntity = createDataEntity();
        final List<DataEntityPojo> dataEntityPojos = dataEntityRepository.bulkCreate(List.of(dataEntity));

        final String entityOddrn = dataEntityPojos.get(0).getOddrn();
        final long entityId = dataEntityPojos.get(0).getId();
        final List<DataEntityTaskRunPojo> dataEntityTaskRunPojos = List.of(
            createDataEntityTaskRun(entityOddrn, IngestionTaskRun.IngestionTaskRunStatus.SUCCESS),
            createDataEntityTaskRun(entityOddrn, IngestionTaskRun.IngestionTaskRunStatus.SUCCESS),
            createDataEntityTaskRun(entityOddrn, IngestionTaskRun.IngestionTaskRunStatus.SUCCESS),
            createDataEntityTaskRun(entityOddrn, IngestionTaskRun.IngestionTaskRunStatus.SUCCESS),
            createDataEntityTaskRun(entityOddrn, IngestionTaskRun.IngestionTaskRunStatus.SUCCESS),
            createDataEntityTaskRun(entityOddrn, IngestionTaskRun.IngestionTaskRunStatus.SUCCESS),
            createDataEntityTaskRun(entityOddrn, IngestionTaskRun.IngestionTaskRunStatus.SUCCESS),
            createDataEntityTaskRun(entityOddrn, IngestionTaskRun.IngestionTaskRunStatus.SUCCESS),
            createDataEntityTaskRun(entityOddrn, IngestionTaskRun.IngestionTaskRunStatus.FAILED),
            createDataEntityTaskRun(entityOddrn, IngestionTaskRun.IngestionTaskRunStatus.FAILED),
            createDataEntityTaskRun(entityOddrn, IngestionTaskRun.IngestionTaskRunStatus.FAILED),
            createDataEntityTaskRun(entityOddrn, IngestionTaskRun.IngestionTaskRunStatus.FAILED)
        );
        dataEntityTaskRunRepository.persist(dataEntityTaskRunPojos);

        final Page<DataEntityTaskRunPojo> page =
            dataQualityRepository.getDataQualityTestRuns(entityId, DataQualityTestRunStatus.SUCCESS,
                1, 5);

        assertThat(page.getData())
            .hasSize(5)
            .isSortedAccordingTo(Comparator.comparing(DataEntityTaskRunPojo::getStartTime).reversed())
            .extracting(DataEntityTaskRunPojo::getStatus)
            .containsOnly(IngestionTaskRun.IngestionTaskRunStatus.SUCCESS.name());
        assertThat(page.getTotal()).isEqualTo(8);
        assertThat(page.isHasNext()).isTrue();

        final Page<DataEntityTaskRunPojo> secondPage =
            dataQualityRepository.getDataQualityTestRuns(entityId, DataQualityTestRunStatus.SUCCESS,
                2, 5);

        assertThat(secondPage.getData())
            .hasSize(3)
            .isSortedAccordingTo(Comparator.comparing(DataEntityTaskRunPojo::getStartTime).reversed())
            .extracting(DataEntityTaskRunPojo::getStatus)
            .containsOnly(IngestionTaskRun.IngestionTaskRunStatus.SUCCESS.name());
        assertThat(secondPage.getTotal()).isEqualTo(8);
        assertThat(secondPage.isHasNext()).isFalse();
    }

    private DataEntityPojo createDataEntity() {
        return new DataEntityPojo()
            .setOddrn(UUID.randomUUID().toString());
    }

    private DataEntityTaskRunPojo createDataEntityTaskRun(final String dataEntityOddrn,
                                                          final IngestionTaskRun.IngestionTaskRunStatus status) {
        return new DataEntityTaskRunPojo()
            .setOddrn(UUID.randomUUID().toString())
            .setDataEntityOddrn(dataEntityOddrn)
            .setStatus(status.name())
            .setStartTime(LocalDateTime.now());
    }
}
