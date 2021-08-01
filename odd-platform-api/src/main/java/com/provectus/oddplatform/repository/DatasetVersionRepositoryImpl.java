package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.DatasetFieldDto;
import com.provectus.oddplatform.dto.DatasetStructureDto;
import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetVersionPojo;
import com.provectus.oddplatform.model.tables.pojos.LabelPojo;
import com.provectus.oddplatform.model.tables.records.DatasetVersionRecord;
import com.provectus.oddplatform.utils.JSONSerDeUtils;
import com.provectus.oddplatform.utils.Pair;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.ListUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Record2;
import org.jooq.SelectConditionStep;
import org.jooq.SelectHavingStep;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.provectus.oddplatform.model.Tables.*;
import static org.jooq.impl.DSL.*;

@Repository
@Slf4j
public class DatasetVersionRepositoryImpl
    extends AbstractCRUDRepository<DatasetVersionRecord, DatasetVersionPojo>
    implements DatasetVersionRepository {

    public DatasetVersionRepositoryImpl(final DSLContext dslContext) {
        super(dslContext, DATASET_VERSION, DATASET_VERSION.ID, null, DatasetVersionPojo.class);
    }

    @Override
    // TODO: filth?
    public Optional<DatasetStructureDto> getDatasetVersion(final long datasetId, final long datasetVersionId) {
        final List<Field<?>> selectFields = Stream.of(DATASET_VERSION.fields(), DATASET_FIELD.fields())
            .flatMap(Arrays::stream)
            .collect(Collectors.toList());

        final Map<DatasetVersionPojo, List<DatasetFieldDto>> result = dslContext
            .select(DATASET_FIELD.fields())
            .select(selectFields)
            .select(jsonArrayAgg(field(LABEL.asterisk().toString())).as("labels"))
            .from(DATASET_VERSION)
            .leftJoin(DATASET_FIELD).on(DATASET_FIELD.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(DATASET_FIELD.ID.eq(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID))
            .leftJoin(LABEL).on(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(LABEL.ID))
            .where(DATASET_VERSION.DATASET_ID.eq(datasetId))
            .groupBy(selectFields)
            .fetchGroups(DatasetVersionPojo.class, this::extractDatasetFieldDto);

        return result.entrySet().stream()
            .findFirst()
            .map(e -> DatasetStructureDto.builder()
                .datasetVersion(e.getKey())
                .datasetFields(e.getValue())
                .build());
    }

    @Override
    public Optional<DatasetStructureDto> getLatestDatasetVersion(final long datasetId) {
        final Field<Long> dsvMaxField = max(DATASET_VERSION.VERSION).as("dsv_max");

        final SelectConditionStep<Record1<Long>> subquery = dslContext
            .select(dsvMaxField)
            .from(DATASET_VERSION)
            .where(DATASET_VERSION.DATASET_ID.eq(datasetId));

        final List<Field<?>> selectFields = Stream.of(DATASET_VERSION.fields(), DATASET_FIELD.fields())
            .flatMap(Arrays::stream)
            .collect(Collectors.toList());

        final Map<DatasetVersionPojo, List<DatasetFieldDto>> result = dslContext
            .select(selectFields)
            .select(jsonArrayAgg(field(LABEL.asterisk().toString())).as("labels"))
            .from(subquery)
            .join(DATASET_VERSION).on(DATASET_VERSION.DATASET_ID.eq(datasetId))
            .and(DATASET_VERSION.VERSION.eq(dsvMaxField))
            .leftJoin(DATASET_FIELD).on(DATASET_FIELD.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(DATASET_FIELD.ID.eq(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID))
            .leftJoin(LABEL).on(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(LABEL.ID))
            .groupBy(selectFields)
            .fetchGroups(r -> r.into(DATASET_VERSION).into(DatasetVersionPojo.class), this::extractDatasetFieldDto);

        log.info("RESULT: {}", result);

        return result.entrySet().stream()
            .findFirst()
            .map(e -> DatasetStructureDto.builder()
                .datasetVersion(e.getKey())
                .datasetFields(e.getValue())
                .build());
    }

    @Override
    public List<DatasetVersionPojo> getVersions(final long datasetId) {
        return dslContext.selectFrom(DATASET_VERSION)
            .where(DATASET_VERSION.DATASET_ID.eq(datasetId))
            .fetchStreamInto(DatasetVersionPojo.class)
            .collect(Collectors.toList());
    }

    @Override
    public List<DatasetVersionPojo> getLatestVersions(final Collection<Long> datasetIds) {
        final Field<Long> datasetIdField = DATASET_VERSION.DATASET_ID.as("dsv_dataset_id");
        final Field<Long> dsvMaxField = max(DATASET_VERSION.VERSION).as("dsv_max");

        final SelectHavingStep<Record2<Long, Long>> subquery = dslContext
            .select(datasetIdField, dsvMaxField)
            .from(DATASET_VERSION)
            .where(DATASET_VERSION.DATASET_ID.in(datasetIds))
            .groupBy(DATASET_VERSION.DATASET_ID);

        return dslContext.select(DATASET_VERSION.fields())
            .from(subquery)
            .join(DATASET_VERSION).on(DATASET_VERSION.DATASET_ID.eq(subquery.field("dsv_dataset_id").cast(Long.class)))
            .and(DATASET_VERSION.VERSION.eq(dsvMaxField))
            .fetchStreamInto(DATASET_VERSION)
            .map(this::recordToPojo)
            .collect(Collectors.toList());
    }

    @Override
    public Map<Long, Pair<List<DatasetFieldPojo>, List<DatasetFieldPojo>>> getLastStructureDelta(
        final Collection<Long> datasetIds
    ) {
        final List<DatasetVersionPojo> havePreMax = getLatestVersions(datasetIds)
            .stream()
            .filter(p -> p.getVersion() > 1)
            .collect(Collectors.toList());

        if (havePreMax.isEmpty()) {
            return Map.of();
        }

        final Condition condition = havePreMax.stream()
            .map(v -> DATASET_VERSION.DATASET_ID.eq(v.getDatasetId()).and(DATASET_VERSION.VERSION.eq(v.getVersion() - 1)))
            .reduce(Condition::or)
            .get();

        final List<DatasetVersionPojo> preMax = dslContext.selectFrom(DATASET_VERSION)
            .where(condition)
            .fetchStreamInto(DatasetVersionPojo.class)
            .collect(Collectors.toList());

        final List<DatasetVersionPojo> versions = ListUtils.union(havePreMax, preMax);

        final Map<Long, List<DatasetFieldPojo>> vidToFields = dslContext.selectFrom(DATASET_FIELD)
            .where(DATASET_FIELD.DATASET_VERSION_ID.in(versions.stream()
                .map(DatasetVersionPojo::getId)
                .collect(Collectors.toSet())))
            .fetchStreamInto(DatasetFieldPojo.class)
            .collect(Collectors.groupingBy(DatasetFieldPojo::getDatasetVersionId));

        final Map<Long, List<DatasetVersionPojo>> dsIdToVersions = versions
            .stream()
            .collect(Collectors.groupingBy(DatasetVersionPojo::getDatasetId));

        return dsIdToVersions.entrySet().stream()
            .map(e -> {
                final List<DatasetVersionPojo> v = e.getValue().stream()
                    .sorted(Comparator.comparing(DatasetVersionPojo::getVersion))
                    .collect(Collectors.toList());

                return Pair.of(e.getKey(), Pair.of(
                    vidToFields.get(v.get(0).getId()),
                    vidToFields.get(v.get(1).getId())
                ));
            })
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));
    }

    private DatasetFieldDto extractDatasetFieldDto(final Record record) {
        //noinspection unchecked
        final List<LabelPojo> labels = (List<LabelPojo>) record.getValue("labels", List.class)
            .stream()
            .map(t -> JSONSerDeUtils.deserializeJson(t, LabelPojo.class))
            .collect(Collectors.toList());

        return DatasetFieldDto.builder()
            .datasetFieldPojo(record.into(DATASET_FIELD).into(DatasetFieldPojo.class))
            .labelPojos(labels)
            .build();
    }
}
