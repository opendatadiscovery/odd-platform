package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.jeasy.random.randomizers.misc.EnumRandomizer;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.DatasetTestReportDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun.IngestionTaskRunStatus;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRepository;
import org.opendatadiscovery.oddplatform.utils.DataEntityTaskRunPojoEndTimeComparator;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.counting;
import static java.util.stream.Collectors.groupingBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus.ABORTED;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus.BROKEN;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus.FAILED;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus.SKIPPED;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus.SUCCESS;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus.UNKNOWN;

@Slf4j
class DataQualityRepositoryImplTest extends BaseIntegrationTest {
    private final Comparator<DataEntityTaskRunPojo> endTimeComparator =
        new DataEntityTaskRunPojoEndTimeComparator().reversed();

    @Autowired
    private ReactiveDataQualityRepository dataQualityRepository;

    @Autowired
    private DataEntityTaskRunRepository dataEntityTaskRunRepository;

    @Autowired
    private DataQualityTestRelationRepository dataQualityTestRelationRepository;

    @Autowired
    private DataEntityRepository dataEntityRepository;

    @Test
    public void testGetDataQualityTestOddrnsForHollowDataset() {
        final DataEntityPojo hollowDataEntity = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setHollow(true).setOddrn(UUID.randomUUID().toString())))
            .get(0);

        final DataEntityPojo dqTest = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString())))
            .get(0);

        dataQualityTestRelationRepository.createRelations(List.of(
            new DataQualityTestRelationsPojo()
                .setDataQualityTestOddrn(dqTest.getOddrn())
                .setDatasetOddrn(hollowDataEntity.getOddrn())
        ));

        dataQualityRepository.getDataQualityTestOddrnsForDataset(hollowDataEntity.getId())
            .as(StepVerifier::create)
            .verifyComplete();
    }

    @Test
    public void testGetDataQualityTestOddrnsForDataset() {
        final List<String> dqOddrns = Stream.generate(() -> UUID.randomUUID().toString())
            .limit(5)
            .toList();

        final DataEntityPojo dataEntity = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString())))
            .get(0);

        final List<DataEntityPojo> dqTests = dataEntityRepository
            .bulkCreate(dqOddrns.stream().map(oddrn -> new DataEntityPojo().setOddrn(oddrn)).toList());

        dataQualityTestRelationRepository.createRelations(
            dqTests.stream()
                .map(dqTest -> new DataQualityTestRelationsPojo()
                    .setDataQualityTestOddrn(dqTest.getOddrn())
                    .setDatasetOddrn(dataEntity.getOddrn()))
                .toList()
        );

        dataQualityRepository.getDataQualityTestOddrnsForDataset(dataEntity.getId())
            .collectList()
            .as(StepVerifier::create)
            .assertNext(dqListOddrns -> assertThat(dqListOddrns).hasSameElementsAs(dqOddrns))
            .verifyComplete();
    }

    @Test
    public void testGetDatasetTestReportWithoutTests() {
        final DataEntityPojo dataEntity = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString())))
            .get(0);

        dataQualityRepository.getDatasetTestReport(dataEntity.getId())
            .as(StepVerifier::create)
            .assertNext(report -> {
                assertThat(report.getAbortedTotal()).isZero();
                assertThat(report.getBrokenTotal()).isZero();
                assertThat(report.getFailedTotal()).isZero();
                assertThat(report.getSkippedTotal()).isZero();
                assertThat(report.getSuccessTotal()).isZero();
                assertThat(report.getUnknownTotal()).isZero();
                assertThat(report.getTotal()).isZero();
            })
            .verifyComplete();
    }

    @Test
    public void testGetDatasetTestReportWithoutFinishedTests() {
        final DataEntityPojo dataEntity = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString())))
            .get(0);

        final DataEntityPojo dqTest = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString())))
            .get(0);

        dataEntityTaskRunRepository.persist(
            createTaskRun(dqTest.getOddrn(), IngestionTaskRunStatus.RUNNING));

        dataQualityTestRelationRepository.createRelations(List.of(
            new DataQualityTestRelationsPojo()
                .setDataQualityTestOddrn(dqTest.getOddrn())
                .setDatasetOddrn(dataEntity.getOddrn())
        ));

        dataQualityRepository.getDatasetTestReport(dataEntity.getId())
            .as(StepVerifier::create)
            .assertNext(report -> {
                assertThat(report.getAbortedTotal()).isZero();
                assertThat(report.getBrokenTotal()).isZero();
                assertThat(report.getFailedTotal()).isZero();
                assertThat(report.getSkippedTotal()).isZero();
                assertThat(report.getSuccessTotal()).isZero();
                assertThat(report.getUnknownTotal()).isZero();
                assertThat(report.getTotal()).isZero();
            })
            .verifyComplete();
    }

    @Test
    public void testGetDatasetTestReport() {
        final EnumRandomizer<IngestionTaskRunStatus> statusEnumRandomizer =
            new EnumRandomizer<>(IngestionTaskRunStatus.class, IngestionTaskRunStatus.RUNNING);

        final DataEntityPojo dataEntity = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString())))
            .get(0);

        final List<String> dqOddrns = Stream.generate(() -> UUID.randomUUID().toString())
            .limit(5)
            .toList();

        final List<DataEntityPojo> dqTests = dataEntityRepository
            .bulkCreate(dqOddrns.stream().map(oddrn -> new DataEntityPojo().setOddrn(oddrn)).toList());

        final Map<String, List<DataEntityTaskRunPojo>> taskRuns = dqTests.stream()
            .flatMap(dqTest ->
                Stream.generate(
                    () -> createTaskRun(dqTest.getOddrn(), statusEnumRandomizer.getRandomValue())).limit(5))
            .collect(groupingBy(DataEntityTaskRunPojo::getTaskOddrn));

        dataEntityTaskRunRepository.persist(taskRuns.values().stream().flatMap(List::stream).toList());

        dataQualityTestRelationRepository.createRelations(
            dqTests.stream()
                .map(dqTest -> new DataQualityTestRelationsPojo()
                    .setDataQualityTestOddrn(dqTest.getOddrn())
                    .setDatasetOddrn(dataEntity.getOddrn()))
                .toList()
        );

        final DatasetTestReportDto expected = mapReport(taskRuns.values().stream()
            .map(dataEntityTaskRunPojos -> dataEntityTaskRunPojos
                .stream()
                .max(endTimeComparator.reversed())
                .map(DataEntityTaskRunPojo::getStatus)
                .orElseThrow())
            .collect(groupingBy(identity(), counting())));

        dataQualityRepository.getDatasetTestReport(dataEntity.getId())
            .as(StepVerifier::create)
            .assertNext(actual -> assertThat(actual).isEqualTo(expected))
            .verifyComplete();
    }

    private DataEntityTaskRunPojo createTaskRun(final String dataQualityTestOddrn,
                                                final IngestionTaskRunStatus status) {
        return new DataEntityTaskRunPojo()
            .setOddrn(UUID.randomUUID().toString())
            .setTaskOddrn(dataQualityTestOddrn)
            .setStartTime(LocalDateTime.now())
            .setEndTime(IngestionTaskRunStatus.RUNNING.equals(status) ? null : LocalDateTime.now())
            .setStatus(status.toString());
    }

    private DatasetTestReportDto mapReport(final Map<String, Long> report) {
        return DatasetTestReportDto.builder()
            .successTotal(report.getOrDefault(SUCCESS.getValue(), 0L))
            .failedTotal(report.getOrDefault(FAILED.getValue(), 0L))
            .abortedTotal(report.getOrDefault(ABORTED.getValue(), 0L))
            .skippedTotal(report.getOrDefault(SKIPPED.getValue(), 0L))
            .brokenTotal(report.getOrDefault(BROKEN.getValue(), 0L))
            .unknownTotal(report.getOrDefault(UNKNOWN.getValue(), 0L))
            .total(report.values().stream().reduce(0L, Long::sum))
            .build();
    }
}