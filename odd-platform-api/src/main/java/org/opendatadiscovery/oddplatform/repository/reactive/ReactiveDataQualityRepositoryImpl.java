package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.jooq.InsertResultStep;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Record2;
import org.jooq.SelectConditionStep;
import org.jooq.SelectHavingStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity;
import org.opendatadiscovery.oddplatform.dto.DatasetTestReportDto;
import org.opendatadiscovery.oddplatform.dto.TestStatusWithSeverityDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus;
import org.opendatadiscovery.oddplatform.model.tables.DataEntity;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestSeverityPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataQualityTestSeverityRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.count;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus.ABORTED;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus.BROKEN;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus.FAILED;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus.SKIPPED;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus.SUCCESS;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus.UNKNOWN;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TASK_LAST_RUN;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_QUALITY_TEST_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_QUALITY_TEST_SEVERITY;

@Repository
@RequiredArgsConstructor
public class ReactiveDataQualityRepositoryImpl implements ReactiveDataQualityRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<String> getDataQualityTestOddrnsForDataset(final long datasetId) {
        final SelectConditionStep<Record1<String>> query = DSL
            .select(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN)
            .from(DATA_QUALITY_TEST_RELATIONS)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
            .where(DATA_ENTITY.ID.eq(datasetId)).and(DATA_ENTITY.HOLLOW.isFalse());

        return jooqReactiveOperations.flux(query).map(Record1::value1);
    }

    @Override
    public Mono<DatasetTestReportDto> getDatasetTestReport(final long datasetId) {
        final SelectHavingStep<Record2<String, Long>> query = DSL
            .select(
                DATA_ENTITY_TASK_LAST_RUN.STATUS,
                count(DATA_ENTITY_TASK_LAST_RUN.LAST_TASK_RUN_ODDRN).cast(Long.class)
            )
            .from(DATA_QUALITY_TEST_RELATIONS)
            .join(DATA_ENTITY_TASK_LAST_RUN)
            .on(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN.eq(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN))
            .join(DATA_ENTITY)
            .on(DATA_ENTITY.ODDRN.eq(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
            .where(DATA_ENTITY.ID.eq(datasetId))
            .groupBy(DATA_ENTITY_TASK_LAST_RUN.STATUS);

        return jooqReactiveOperations.flux(query)
            .collectMap(Record2::value1, Record2::value2)
            .map(this::mapTestReport);
    }

    @Override
    public Mono<DataQualityTestSeverityPojo> setDataQualityTestSeverity(final long dataQualityTestId,
                                                                        final long dataEntityId,
                                                                        final DataQualityTestSeverity severity) {
        final InsertResultStep<DataQualityTestSeverityRecord> query = DSL
            .insertInto(DATA_QUALITY_TEST_SEVERITY)
            .set(DATA_QUALITY_TEST_SEVERITY.DATA_QUALITY_TEST_ID, dataQualityTestId)
            .set(DATA_QUALITY_TEST_SEVERITY.DATASET_ID, dataEntityId)
            .set(DATA_QUALITY_TEST_SEVERITY.SEVERITY, severity.getValue())
            .onDuplicateKeyUpdate()
            .set(DATA_QUALITY_TEST_SEVERITY.SEVERITY, severity.getValue())
            .returning();

        return jooqReactiveOperations
            .mono(query)
            .map(r -> r.into(DataQualityTestSeverityPojo.class));
    }

    @Override
    public Flux<TestStatusWithSeverityDto> getSLA(final long datasetId) {
        final DataEntity dataset = DATA_ENTITY.as("dataset");
        final DataEntity dataQualityTest = DATA_ENTITY.as("data_quality_test");

        // @formatter:off
        final SelectConditionStep<Record2<String, String>> query = DSL
            .select(DATA_ENTITY_TASK_LAST_RUN.STATUS, DATA_QUALITY_TEST_SEVERITY.SEVERITY)
            .from(DATA_QUALITY_TEST_RELATIONS)
            .join(dataset)
                .on(dataset.ODDRN.eq(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
            .join(dataQualityTest)
                .on(dataQualityTest.ODDRN.eq(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN))
            .join(DATA_ENTITY_TASK_LAST_RUN)
                .on(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN.eq(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN))
            .leftJoin(DATA_QUALITY_TEST_SEVERITY)
                .on(DATA_QUALITY_TEST_SEVERITY.DATASET_ID.eq(dataset.ID))
                .and(DATA_QUALITY_TEST_SEVERITY.DATA_QUALITY_TEST_ID.eq(dataQualityTest.ID))
            .where(dataset.ID.eq(datasetId));
        // @formatter:on

        return jooqReactiveOperations.flux(query).map(this::mapLastRunDto);
    }

    @Override
    public Flux<DataQualityTestSeverityPojo> getSeverities(final Collection<String> dataQualityOddrns,
                                                           final long datasetId) {
        final SelectConditionStep<Record> query = DSL
            .select(DATA_QUALITY_TEST_SEVERITY.fields())
            .from(DATA_QUALITY_TEST_SEVERITY)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(DATA_QUALITY_TEST_SEVERITY.DATA_QUALITY_TEST_ID))
            .where(DATA_ENTITY.ODDRN.in(dataQualityOddrns))
            .and(DATA_QUALITY_TEST_SEVERITY.DATASET_ID.eq(datasetId));

        return jooqReactiveOperations.flux(query).map(r -> r.into(DataQualityTestSeverityPojo.class));
    }

    private TestStatusWithSeverityDto mapLastRunDto(final Record2<String, String> record) {
        return new TestStatusWithSeverityDto(
            QualityRunStatus.valueOf(record.value1()),
            record.value2() == null
                ? DataQualityTestSeverity.AVERAGE
                : DataQualityTestSeverity.valueOf(record.value2())
        );
    }

    private DatasetTestReportDto mapTestReport(final Map<String, Long> report) {
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
