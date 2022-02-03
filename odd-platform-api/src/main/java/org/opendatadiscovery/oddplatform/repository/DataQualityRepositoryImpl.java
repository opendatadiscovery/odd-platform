package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.Record2;
import org.jooq.Select;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRunStatus;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DatasetTestReportDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;

import static java.util.Collections.emptyList;
import static org.jooq.impl.DSL.count;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TASK_RUN;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_QUALITY_TEST_RELATIONS;

@Repository
@RequiredArgsConstructor
public class DataQualityRepositoryImpl implements DataQualityRepository {
    private final DSLContext dslContext;
    private final DataEntityRepository dataEntityRepository;
    private final JooqQueryHelper jooqQueryHelper;

    @Override
    public Collection<DataEntityDetailsDto> getDataQualityTests(final long datasetId) {
        final Set<String> oddrns = dslContext.select(DATA_QUALITY_TEST_RELATIONS.fields())
            .from(DATA_QUALITY_TEST_RELATIONS)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
            .where(DATA_ENTITY.ID.eq(datasetId)).and(DATA_ENTITY.HOLLOW.isFalse())
            .fetchStreamInto(DataQualityTestRelationsPojo.class)
            .map(DataQualityTestRelationsPojo::getDataQualityTestOddrn)
            .collect(Collectors.toSet());

        return !oddrns.isEmpty()
            ? dataEntityRepository.listDetailsByOddrns(oddrns)
            : emptyList();
    }

    @Override
    public Page<DataEntityTaskRunPojo> getDataQualityTestRuns(final long dataQualityTestId,
                                                              final DataQualityTestRunStatus status,
                                                              final Integer page,
                                                              final Integer size) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(DATA_ENTITY.ID.eq(dataQualityTestId));
        if (status != null) {
            conditions.add(DATA_ENTITY_TASK_RUN.STATUS.eq(status.name()));
        }

        final var baseQuery = dslContext.select(DATA_ENTITY_TASK_RUN.fields())
            .from(DATA_ENTITY_TASK_RUN)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATA_ENTITY_TASK_RUN.DATA_ENTITY_ODDRN))
            .where(conditions)
            .orderBy(DATA_ENTITY_TASK_RUN.START_TIME.desc());

        final Select<? extends Record> select =
            jooqQueryHelper.paginate(baseQuery, DATA_ENTITY_TASK_RUN.START_TIME, (page - 1) * size, size);

        final List<? extends Record> records = select
            .fetchStream()
            .toList();

        return jooqQueryHelper.pageifyResult(records, r -> r.into(DataEntityTaskRunPojo.class),
            () -> fetchCount(baseQuery));
    }

    @Override
    public Optional<DatasetTestReportDto> getDatasetTestReport(final long datasetId) {
        final boolean datasetExists = dslContext.fetchExists(dslContext.selectFrom(DATA_ENTITY)
            .where(DATA_ENTITY.ID.eq(datasetId))
            .and(DATA_ENTITY.HOLLOW.isFalse()));

        if (!datasetExists) {
            return Optional.empty();
        }

        final Map<String, Long> report = dslContext
            .select(DATA_ENTITY_TASK_RUN.STATUS, count(DATA_ENTITY_TASK_RUN.ID).cast(Long.class))
            .from(DATA_QUALITY_TEST_RELATIONS)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
            .join(DATA_ENTITY_TASK_RUN)
            .on(DATA_ENTITY_TASK_RUN.DATA_ENTITY_ODDRN.eq(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN))
            .where(DATA_ENTITY.ID.eq(datasetId))
            .groupBy(DATA_ENTITY_TASK_RUN.STATUS)
            .fetchMap(Record2::component1, Record2::component2);

        // TODO: enum
        return Optional.of(DatasetTestReportDto.builder()
            .successTotal(report.getOrDefault("SUCCESS", 0L))
            .failedTotal(report.getOrDefault("FAILED", 0L))
            .abortedTotal(report.getOrDefault("ABORTED", 0L))
            .skippedTotal(report.getOrDefault("SKIPPED", 0L))
            .brokenTotal(report.getOrDefault("BROKEN", 0L))
            .unknownTotal(report.getOrDefault("UNKNOWN", 0L))
            .total(report.values().stream().mapToLong(a -> a).sum())
            .build());
    }

    private Long fetchCount(final Select<?> select) {
        return dslContext.selectCount()
            .from(select)
            .fetchOptionalInto(Long.class)
            .orElse(0L);
    }
}
