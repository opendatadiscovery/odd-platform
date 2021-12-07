package org.opendatadiscovery.oddplatform.repository;

import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.ListUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Record2;
import org.jooq.SelectHavingStep;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDelta;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetVersionRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Repository;

import static java.util.stream.Collectors.mapping;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.jooq.impl.DSL.max;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL_TO_DATASET_FIELD;

@Repository
@Slf4j
public class DatasetVersionRepositoryImpl
    extends AbstractCRUDRepository<DatasetVersionRecord, DatasetVersionPojo>
    implements DatasetVersionRepository {

    private final JooqRecordHelper jooqRecordHelper;

    public DatasetVersionRepositoryImpl(final DSLContext dslContext,
                                        final JooqRecordHelper jooqRecordHelper,
                                        final JooqQueryHelper jooqQueryHelper) {
        super(dslContext, jooqQueryHelper, DATASET_VERSION, DATASET_VERSION.ID, null, DatasetVersionPojo.class);
        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Optional<DatasetStructureDto> getDatasetVersion(final long datasetVersionId) {
        final List<Field<?>> selectFields = Stream.of(DATASET_VERSION.fields(), DATASET_FIELD.fields())
            .flatMap(Arrays::stream)
            .collect(Collectors.toList());

        final Map<DatasetVersionPojo, List<DatasetFieldDto>> result = dslContext
            .select(selectFields)
            .select(jsonArrayAgg(field(LABEL.asterisk().toString())).as("labels"))
            .from(DATASET_VERSION)
            .leftJoin(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .leftJoin(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(DATASET_FIELD.ID.eq(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID))
            .leftJoin(LABEL).on(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(LABEL.ID)).and(LABEL.IS_DELETED.isFalse())
            .where(DATASET_VERSION.ID.eq(datasetVersionId))
            .groupBy(selectFields)
            .fetchGroups(this::extractDatasetVersion, this::extractDatasetFieldDto);

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

        final SelectHavingStep<Record2<String, Long>> subquery = dslContext
            .select(DATASET_VERSION.DATASET_ODDRN, dsvMaxField)
            .from(DATASET_VERSION)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .where(DATA_ENTITY.ID.eq(datasetId))
            .groupBy(DATASET_VERSION.DATASET_ODDRN);

        final List<Field<?>> selectFields = Stream.of(DATASET_VERSION.fields(), DATASET_FIELD.fields())
            .flatMap(Arrays::stream)
            .collect(Collectors.toList());

        final Map<DatasetVersionPojo, List<DatasetFieldDto>> result = dslContext
            .select(selectFields)
            .select(jsonArrayAgg(field(LABEL.asterisk().toString())).as("labels"))
            .from(subquery)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(datasetId))
            .join(DATASET_VERSION)
            .on(DATASET_VERSION.DATASET_ODDRN.eq(subquery.field(DATASET_VERSION.DATASET_ODDRN)))
            .and(DATASET_VERSION.VERSION.eq(dsvMaxField))
            .leftJoin(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .leftJoin(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(DATASET_FIELD.ID.eq(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID))
            .leftJoin(LABEL).on(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(LABEL.ID)).and(LABEL.IS_DELETED.isFalse())
            .groupBy(selectFields)
            .fetchGroups(this::extractDatasetVersion, this::extractDatasetFieldDto);

        return result.entrySet().stream()
            .findFirst()
            .map(e -> DatasetStructureDto.builder()
                .datasetVersion(e.getKey())
                .datasetFields(e.getValue())
                .build());
    }

    @Override
    public List<DatasetVersionPojo> getVersions(final long datasetId) {
        return dslContext.select(DATASET_VERSION.asterisk())
            .from(DATASET_VERSION)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .where(DATA_ENTITY.ID.eq(datasetId))
            .fetchStreamInto(DatasetVersionPojo.class)
            .collect(Collectors.toList());
    }

    @Override
    public List<DatasetVersionPojo> getLatestVersions(final Collection<Long> datasetIds) {
        final String dsOddrnAlias = "dsv_dataset_oddrn";

        final Field<String> datasetOddrnField = DATASET_VERSION.DATASET_ODDRN.as(dsOddrnAlias);
        final Field<Long> dsvMaxField = max(DATASET_VERSION.VERSION).as("dsv_max");

        final SelectHavingStep<Record2<String, Long>> subquery = dslContext
            .select(datasetOddrnField, dsvMaxField)
            .from(DATASET_VERSION)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .where(DATA_ENTITY.ID.in(datasetIds))
            .groupBy(DATASET_VERSION.DATASET_ODDRN);

        return dslContext.select(DATASET_VERSION.fields())
            .from(subquery)
            .join(DATASET_VERSION).on(DATASET_VERSION.DATASET_ODDRN.eq(subquery.field(dsOddrnAlias, String.class)))
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .and(DATASET_VERSION.VERSION.eq(dsvMaxField))
            .fetchStreamInto(DATASET_VERSION)
            .map(this::recordToPojo)
            .collect(Collectors.toList());
    }

    @Override
    public Map<String, DatasetStructureDelta> getLastStructureDelta(
        final Collection<Long> datasetIds
    ) {
        final List<DatasetVersionPojo> havePenultimate = getLatestVersions(datasetIds)
            .stream()
            .filter(p -> p.getVersion() > 1)
            .collect(Collectors.toList());

        if (havePenultimate.isEmpty()) {
            return Map.of();
        }

        final Condition condition = havePenultimate.stream()
            .map(v -> DATA_ENTITY.ODDRN.eq(v.getDatasetOddrn())
                .and(DATASET_VERSION.VERSION.eq(v.getVersion() - 1)))
            .reduce(Condition::or)
            .get();

        final List<DatasetVersionPojo> penultimate = dslContext.select(DATASET_VERSION.asterisk())
            .from(DATASET_VERSION)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .where(condition)
            .fetchStreamInto(DatasetVersionPojo.class)
            .collect(Collectors.toList());

        final List<DatasetVersionPojo> versions = ListUtils.union(havePenultimate, penultimate);

        final Map<Long, List<DatasetFieldPojo>> vidToFields =
            dslContext.select(DATASET_STRUCTURE.DATASET_VERSION_ID)
                .select(DATASET_FIELD.asterisk())
                .from(DATASET_FIELD)
                .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
                .where(DATASET_STRUCTURE.DATASET_VERSION_ID.in(versions.stream()
                    .map(DatasetVersionPojo::getId)
                    .collect(Collectors.toSet())))
                .fetchStream()
                .collect(Collectors.groupingBy(
                    r -> r.get(DATASET_STRUCTURE.DATASET_VERSION_ID),
                    mapping(this::extractDatasetField, Collectors.toList())
                ));

        final Map<String, List<DatasetVersionPojo>> dsOddrnToVersions = versions
            .stream()
            .collect(Collectors.groupingBy(DatasetVersionPojo::getDatasetOddrn));

        return dsOddrnToVersions.entrySet().stream()
            .map(e -> {
                final List<DatasetVersionPojo> v = e.getValue().stream()
                    .sorted(Comparator.comparing(DatasetVersionPojo::getVersion))
                    .collect(Collectors.toList());

                return Pair.of(e.getKey(), new DatasetStructureDelta(
                    vidToFields.get(v.get(0).getId()),
                    vidToFields.get(v.get(1).getId())
                ));
            })
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));
    }

    private DatasetVersionPojo extractDatasetVersion(final Record record) {
        return jooqRecordHelper.extractRelation(record, DATASET_VERSION, DatasetVersionPojo.class);
    }

    private DatasetFieldPojo extractDatasetField(final Record record) {
        return jooqRecordHelper.extractRelation(record, DATASET_FIELD, DatasetFieldPojo.class);
    }

    private DatasetFieldDto extractDatasetFieldDto(final Record record) {
        return DatasetFieldDto.builder()
            .datasetFieldPojo(extractDatasetField(record))
            .labelPojos(jooqRecordHelper.extractAggRelation(record, "labels", LabelPojo.class))
            .build();
    }
}
