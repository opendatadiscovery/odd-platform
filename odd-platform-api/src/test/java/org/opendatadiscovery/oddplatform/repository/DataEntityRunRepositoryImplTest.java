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
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityTaskRunRepository;
import org.opendatadiscovery.oddplatform.utils.DataEntityTaskRunPojoEndTimeComparator;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

class DataEntityRunRepositoryImplTest extends BaseIntegrationTest {
    private final Comparator<DataEntityTaskRunPojo> endTimeComparator =
        new DataEntityTaskRunPojoEndTimeComparator().reversed();

    @Autowired
    private ReactiveDataEntityTaskRunRepository dataEntityRunRepository;

    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;

    @Autowired
    private ReactiveDataEntityTaskRunRepository reactiveDataEntityTaskRunRepository;

    @Test
    public void testGetDataQualityRuns() {
        final DataEntityPojo de = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString())))
            .collectList()
            .block()
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

        reactiveDataEntityTaskRunRepository.bulkCreate(taskRuns).block();

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

    @Test
    public void getDataEntityRuns_inFlightRunsAtTop_deterministicTotalOrder() {
        final DataEntityPojo de = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString())))
            .collectList()
            .block()
            .get(0);

        final LocalDateTime t = LocalDateTime.of(2026, 6, 1, 10, 0);
        // Two in-flight (RUNNING, end_time = null) runs with different start_times. Insert the older-start one FIRST
        // so a tiebreaker-less "ORDER BY end_time DESC" would leave them in insertion order (older first) — the
        // start_time DESC tiebreaker must reorder them newest-in-flight-first.
        final DataEntityTaskRunPojo runningOld =
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.RUNNING, t, null);
        final DataEntityTaskRunPojo runningNew =
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.RUNNING, t.plusHours(1), null);
        // Completed runs. midA and midB share an identical (end_time, start_time); midA is inserted first (lower id),
        // so the id DESC final tiebreaker must place midB before midA — a total order, no dup/skip under paging.
        final DataEntityTaskRunPojo late =
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.SUCCESS, t, t.plusDays(3));
        final DataEntityTaskRunPojo midA =
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.SUCCESS, t, t.plusDays(2));
        final DataEntityTaskRunPojo midB =
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.SUCCESS, t, t.plusDays(2));
        final DataEntityTaskRunPojo early =
            createTaskRun(de.getOddrn(), IngestionTaskRunStatus.FAILED, t, t.plusDays(1));

        reactiveDataEntityTaskRunRepository
            .bulkCreate(List.of(runningOld, runningNew, late, midA, midB, early))
            .block();

        dataEntityRunRepository.getDataEntityRuns(de.getId(), null, 1, 30)
            .as(StepVerifier::create)
            .assertNext(page -> {
                assertThat(page.getData())
                    .extracting(DataEntityTaskRunPojo::getOddrn)
                    .containsExactly(
                        runningNew.getOddrn(),   // in-flight, newest start -> top
                        runningOld.getOddrn(),   // in-flight, older start
                        late.getOddrn(),         // completed, end +3d
                        midB.getOddrn(),         // completed, end +2d; id DESC breaks the (end, start) tie
                        midA.getOddrn(),         // completed, end +2d
                        early.getOddrn());       // completed, end +1d
                assertThat(page.getTotal()).isEqualTo(6);
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

    private DataEntityTaskRunPojo createTaskRun(final String deOddrn,
                                                final IngestionTaskRunStatus status,
                                                final LocalDateTime startTime,
                                                final LocalDateTime endTime) {
        return new DataEntityTaskRunPojo()
            .setOddrn(UUID.randomUUID().toString())
            .setTaskOddrn(deOddrn)
            .setStartTime(startTime)
            .setEndTime(endTime)
            .setStatus(status.toString());
    }
}