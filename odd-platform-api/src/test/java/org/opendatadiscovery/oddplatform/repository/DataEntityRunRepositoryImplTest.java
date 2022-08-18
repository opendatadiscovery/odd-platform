package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun.IngestionTaskRunStatus;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRunRepository;
import org.opendatadiscovery.oddplatform.utils.DataEntityTaskRunPojoEndTimeComparator;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

class DataEntityRunRepositoryImplTest extends BaseIntegrationTest {
    private final Comparator<DataEntityTaskRunPojo> endTimeComparator =
        new DataEntityTaskRunPojoEndTimeComparator().reversed();

    @Autowired
    private ReactiveDataEntityRunRepository dataEntityRunRepository;

    @Autowired
    private DataEntityRepository dataEntityRepository;

    @Autowired
    private DataEntityTaskRunRepository dataEntityTaskRunRepository;

    @Test
    public void testGetDataQualityRuns() {
        final DataEntityPojo de = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString())))
            .get(0);

        final List<DataEntityTaskRunPojo> taskRuns = List.of(
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.SUCCESS),
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.SUCCESS),
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.SUCCESS),
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.SUCCESS),
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.SUCCESS),
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.BROKEN),
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.ABORTED),
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.UNKNOWN),
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.UNKNOWN),
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.RUNNING)
        );

        dataEntityTaskRunRepository.persist(taskRuns);

        dataEntityRunRepository.getDataEntityRuns(de.getId(), null, 1, 5)
            .as(StepVerifier::create)
            .assertNext(page -> {
                assertThat(page.getData())
                    .hasSize(5)
                    .isSortedAccordingTo(endTimeComparator);

                assertThat(page.getTotal()).isEqualTo(10);
                assertThat(page.isHasNext()).isTrue();
            })
            .verifyComplete();

        dataEntityRunRepository.getDataEntityRuns(de.getId(), null, 2, 5)
            .as(StepVerifier::create)
            .assertNext(page -> {
                assertThat(page.getData())
                    .hasSize(5)
                    .isSortedAccordingTo(endTimeComparator);

                assertThat(page.getTotal()).isEqualTo(10);
                assertThat(page.isHasNext()).isFalse();
            })
            .verifyComplete();

        dataEntityRunRepository.getDataEntityRuns(de.getId(), DataEntityRunStatus.SUCCESS, 1, 30)
            .as(StepVerifier::create)
            .assertNext(page -> {
                assertThat(page.getData())
                    .hasSize(5)
                    .isSortedAccordingTo(endTimeComparator)
                    .extracting(DataEntityTaskRunPojo::getStatus)
                    .containsOnly(IngestionTaskRunStatus.SUCCESS.toString());

                assertThat(page.getTotal()).isEqualTo(5);
                assertThat(page.isHasNext()).isFalse();
            })
            .verifyComplete();
    }

    private DataEntityTaskRunPojo createTaskRun(final String deOddrn,
                                                final IngestionTaskRunStatus status) {
        return new DataEntityTaskRunPojo()
            .setOddrn(UUID.randomUUID().toString())
            .setTaskOddrn(deOddrn)
            .setStartTime(LocalDateTime.now())
            .setEndTime(IngestionTaskRunStatus.RUNNING.equals(status) ? null : LocalDateTime.now())
            .setStatus(status.toString());
    }
}