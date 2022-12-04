//package org.opendatadiscovery.oddplatform.service.ingestion.alert;
//
//import java.time.OffsetDateTime;
//import java.util.List;
//import java.util.UUID;
//import java.util.stream.IntStream;
//import org.junit.jupiter.api.Test;
//import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
//import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
//import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
//import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction.CreateAlertAction;
//import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction.ResolveAutomaticallyAlertAction;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum.FAILED_JOB;
//
//class IngestionTaskRunAlertStateTest {
//    @Test
//    public void allSuccessSimpleTest() {
//        final IngestionTaskRunAlertState state = new IngestionTaskRunAlertState("data_entity_oddrn", FAILED_JOB);
//
//        final String taskOddrn = "task_oddrn";
//        final OffsetDateTime baseline = OffsetDateTime.now();
//
//        final List<IngestionTaskRun> taskRuns = IntStream.range(1, 10)
//            .mapToObj(i -> IngestionTaskRun.builder()
//                .taskOddrn(taskOddrn)
//                .oddrn(UUID.randomUUID().toString())
//                .type(IngestionTaskRun.IngestionTaskRunType.DATA_TRANSFORMER_RUN)
//                .status(IngestionTaskRun.IngestionTaskRunStatus.SUCCESS)
//                .startTime(baseline.plusSeconds(i))
//                .endTime(baseline.plusSeconds(i))
//                .build())
//            .toList();
//
//        taskRuns.forEach(state::report);
//
//        assertThat(state.getActions()).isEmpty();
//
//        final long lastAlertId = 1L;
//        final var stateWithAlert =
//            new IngestionTaskRunAlertState("data_entity_oddrn", FAILED_JOB, lastAlertId);
//
//        taskRuns.forEach(stateWithAlert::report);
//        final List<AlertAction> actualWithAlertInState = stateWithAlert.getActions();
//
//        assertThat(actualWithAlertInState).hasSize(1);
//        assertThat(actualWithAlertInState.get(0)).isInstanceOf(ResolveAutomaticallyAlertAction.class);
//        assertThat(((ResolveAutomaticallyAlertAction) actualWithAlertInState.get(0)).getAlertId()).isEqualTo(
//            lastAlertId);
//    }
//
//    @Test
//    public void allFailSimpleTest() {
//        final IngestionTaskRunAlertState state = new IngestionTaskRunAlertState("data_entity_oddrn", FAILED_JOB);
//
//        final String taskOddrn = "task_oddrn";
//        final OffsetDateTime baseline = OffsetDateTime.now();
//
//        final List<IngestionTaskRun> taskRuns = IntStream.rangeClosed(1, 10)
//            .mapToObj(i -> IngestionTaskRun.builder()
//                .taskOddrn(taskOddrn)
//                .oddrn(UUID.randomUUID().toString())
//                .type(IngestionTaskRun.IngestionTaskRunType.DATA_TRANSFORMER_RUN)
//                .status(i % 2 == 0
//                    ? IngestionTaskRun.IngestionTaskRunStatus.FAILED
//                    : IngestionTaskRun.IngestionTaskRunStatus.BROKEN)
//                .startTime(baseline.plusSeconds(i))
//                .endTime(baseline.plusSeconds(i))
//                .build())
//            .toList();
//
//        taskRuns.forEach(state::report);
//
//        assertThat(state.getActions()).hasSize(1);
//        assertThat(state.getActions().get(0)).isInstanceOf(CreateAlertAction.class);
//
//        final AlertPojo createAlertActionPojo = ((CreateAlertAction) state.getActions().get(0)).getAlertPojo();
////        assertThat(createAlertActionPojo.getCreatedAts()).hasSize(10);
//        assertThat(createAlertActionPojo.getStatus()).isEqualTo(AlertStatusEnum.OPEN.getCode());
//
//        final long lastAlertId = 1L;
//        final var stateWithAlert = new IngestionTaskRunAlertState("data_entity_oddrn", lastAlertId);
//
//        taskRuns.forEach(stateWithAlert::report);
//
//        final List<AlertAction> stateWithAlertActions = stateWithAlert.getActions();
//
//        assertThat(stateWithAlertActions).hasSize(2);
//        assertThat(stateWithAlertActions.get(0)).isInstanceOf(StackAlertAction.class);
//        assertThat(((StackAlertAction) stateWithAlertActions.get(0)).getAlertId()).isEqualTo(lastAlertId);
//        assertThat(stateWithAlertActions.get(1)).isInstanceOf(CreateAlertAction.class);
//        assertThat(((CreateAlertAction) stateWithAlertActions.get(1)).getAlertPojo().getStatus())
//            .isEqualTo(AlertStatusEnum.OPEN.getCode());
//    }
//
//    @Test
//    public void mixedStateTest() {
//        final String taskOddrn = "task_oddrn";
//
//        final List<IngestionTaskRun> state1 = List.of(
//            createRun(taskOddrn, IngestionTaskRun.IngestionTaskRunStatus.FAILED, OffsetDateTime.now()),
//            createRun(taskOddrn, IngestionTaskRun.IngestionTaskRunStatus.SUCCESS, OffsetDateTime.now()),
//            createRun(taskOddrn, IngestionTaskRun.IngestionTaskRunStatus.SUCCESS, OffsetDateTime.now()),
//            createRun(taskOddrn, IngestionTaskRun.IngestionTaskRunStatus.SUCCESS, OffsetDateTime.now()),
//            createRun(taskOddrn, IngestionTaskRun.IngestionTaskRunStatus.FAILED, OffsetDateTime.now())
//        );
//
//        final IngestionTaskRunAlertState state = new IngestionTaskRunAlertState("data_entity_oddrn");
//        state1.forEach(state::report);
//        assertThat(state.getActions()).hasSize(2);
//    }
//
//    private IngestionTaskRun createRun(final String taskOddrn,
//                                       final IngestionTaskRun.IngestionTaskRunStatus status,
//                                       final OffsetDateTime baselineDateTime) {
//        return IngestionTaskRun.builder()
//            .taskOddrn(taskOddrn)
//            .oddrn(UUID.randomUUID().toString())
//            .type(IngestionTaskRun.IngestionTaskRunType.DATA_TRANSFORMER_RUN)
//            .status(status)
//            .startTime(baselineDateTime.plusSeconds(1))
//            .endTime(baselineDateTime.plusSeconds(2))
//            .build();
//    }
//}