package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.DataEntityDetailsDto;
import com.provectus.oddplatform.dto.DatasetTestReportDto;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import com.provectus.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record2;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static com.provectus.oddplatform.model.Tables.*;
import static java.util.Collections.emptyList;
import static org.jooq.impl.DSL.count;

@Repository
@RequiredArgsConstructor
public class DataQualityRepositoryImpl implements DataQualityRepository {
    private final DSLContext dslContext;
    private final DataEntityRepository dataEntityRepository;

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
    public Collection<DataEntityTaskRunPojo> getDataQualityTestRuns(final long dataQualityTestId) {
        return dslContext.select(DATA_ENTITY_TASK_RUN.fields())
            .from(DATA_ENTITY_TASK_RUN)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATA_ENTITY_TASK_RUN.DATA_ENTITY_ODDRN))
            .where(DATA_ENTITY.ID.eq(dataQualityTestId))
            .fetchStreamInto(DataEntityTaskRunPojo.class)
            .collect(Collectors.toList());
    }

    @Override
    public Optional<DatasetTestReportDto> getDatasetTestReport(final long datasetId) {
        final boolean datasetExists = dslContext.fetchExists(dslContext.selectFrom(DATA_ENTITY)
            .where(DATA_ENTITY.ID.eq(datasetId))
            .and(DATA_ENTITY.HOLLOW));

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
            .fetchMap(Record2::component1, Long.class);

        // TODO: enum
        return Optional.of(DatasetTestReportDto.builder()
            .successTotal(report.getOrDefault("SUCCESS", 0L))
            .failedTotal(report.getOrDefault("FAILED", 0L))
            .abortedTotal(report.getOrDefault("ABORTED", 0L))
            .brokenTotal(report.getOrDefault("BROKEN", 0L))
            .unknownTotal(report.getOrDefault("UNKNOWN", 0L))
            .total(report.values().stream().mapToLong(a -> a).sum())
            .build());
    }
}
