package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.jooq.Condition;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Record2;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SelectHavingStep;
import org.jooq.SortOrder;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRunStatus;
import org.opendatadiscovery.oddplatform.dto.DatasetTestReportDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.utils.Page;
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
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TASK_RUN;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_QUALITY_TEST_RELATIONS;

@Repository
@RequiredArgsConstructor
public class ReactiveDataQualityRepositoryImpl implements ReactiveDataQualityRepository {
    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqQueryHelper jooqQueryHelper;

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
    public Mono<Page<DataEntityTaskRunPojo>> getDataQualityTestRuns(final long dataQualityTestId,
                                                                    final DataQualityTestRunStatus status,
                                                                    final int page,
                                                                    final int size) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(DATA_ENTITY.ID.eq(dataQualityTestId));
        conditions.add(DATA_ENTITY.HOLLOW.isFalse());
        if (status != null) {
            conditions.add(DATA_ENTITY_TASK_RUN.STATUS.eq(status.name()));
        }

        final SelectConditionStep<Record> baseQuery = DSL
            .select(DATA_ENTITY_TASK_RUN.fields())
            .from(DATA_ENTITY_TASK_RUN)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATA_ENTITY_TASK_RUN.DATA_ENTITY_ODDRN))
            .where(conditions);

        final Select<? extends Record> query = jooqQueryHelper.paginate(
            baseQuery,
            DATA_ENTITY_TASK_RUN.START_TIME,
            SortOrder.DESC,
            (page - 1) * size,
            size
        );

        return jooqReactiveOperations.flux(query)
            .collectList()
            .flatMap(list -> jooqQueryHelper.pageifyResult(
                list,
                r -> r.into(DataEntityTaskRunPojo.class),
                fetchCount(baseQuery)
            ));
    }

    @Override
    public Mono<DatasetTestReportDto> getDatasetTestReport(final long datasetId) {
        final SelectConditionStep<Record1<LocalDateTime>> maxEndTimeSubquery = DSL
            .select(DSL.max(DATA_ENTITY_TASK_RUN.END_TIME))
            .from(DATA_ENTITY_TASK_RUN)
            .where(DATA_ENTITY_TASK_RUN.DATA_ENTITY_ODDRN.eq(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN));

        // @formatter:off
        final SelectHavingStep<Record2<String, Long>> query = DSL
            .select(DATA_ENTITY_TASK_RUN.STATUS, count(DATA_ENTITY_TASK_RUN.ID).cast(Long.class))
            .from(DATA_QUALITY_TEST_RELATIONS)
            .join(DATA_ENTITY_TASK_RUN)
                .on(DATA_ENTITY_TASK_RUN.DATA_ENTITY_ODDRN.eq(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN))
            .join(DATA_ENTITY)
                .on(DATA_ENTITY.ODDRN.eq(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
            .where(DATA_ENTITY.ID.eq(datasetId))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .and(DATA_ENTITY_TASK_RUN.END_TIME.eq(maxEndTimeSubquery))
            .groupBy(DATA_ENTITY_TASK_RUN.STATUS);
        // @formatter:on

        return jooqReactiveOperations.flux(query)
            .collectMap(Record2::value1, Record2::value2)
            .map(this::mapReport);
    }

    private Mono<Long> fetchCount(final Select<Record> query) {
        return jooqReactiveOperations.mono(DSL.selectCount().from(query))
            .map(Record1::value1)
            .map(Long::valueOf);
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
