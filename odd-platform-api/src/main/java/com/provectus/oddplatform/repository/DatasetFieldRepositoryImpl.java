package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import com.provectus.oddplatform.dto.DatasetFieldDto;
import com.provectus.oddplatform.model.tables.DatasetField;
import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.LabelPojo;
import com.provectus.oddplatform.model.tables.records.DatasetFieldRecord;
import com.provectus.oddplatform.repository.util.JooqFTSHelper;
import com.provectus.oddplatform.repository.util.JooqQueryHelper;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.SetUtils;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Record3;
import org.jooq.SelectConditionStep;
import org.jooq.SelectHavingStep;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import static com.provectus.oddplatform.model.Tables.DATASET_FIELD;
import static com.provectus.oddplatform.model.Tables.DATASET_STRUCTURE;
import static com.provectus.oddplatform.model.Tables.DATASET_VERSION;
import static com.provectus.oddplatform.model.Tables.DATA_ENTITY;
import static com.provectus.oddplatform.model.Tables.LABEL;
import static com.provectus.oddplatform.model.Tables.LABEL_TO_DATASET_FIELD;
import static com.provectus.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static java.util.Collections.emptyList;
import static java.util.function.Predicate.not;
import static org.jooq.impl.DSL.max;

@Repository
@Slf4j
public class DatasetFieldRepositoryImpl
    extends AbstractCRUDRepository<DatasetFieldRecord, DatasetFieldPojo>
    implements DatasetFieldRepository {

    private final JooqFTSHelper jooqFTSHelper;
    private final LabelRepository labelRepository;

    public DatasetFieldRepositoryImpl(final DSLContext dslContext,
                                      final JooqQueryHelper jooqQueryHelper,
                                      final JooqFTSHelper jooqFTSHelper,
                                      final LabelRepository labelRepository) {
        super(dslContext, jooqQueryHelper, DATASET_FIELD, DATASET_FIELD.ID, DATASET_FIELD.NAME, DatasetFieldPojo.class);

        this.jooqFTSHelper = jooqFTSHelper;
        this.labelRepository = labelRepository;
    }

    @Override
    @Transactional
    public void setDescription(final long datasetFieldId, final String description) {
        dslContext.update(DATASET_FIELD)
            .set(DATASET_FIELD.INTERNAL_DESCRIPTION, description)
            .where(DATASET_FIELD.ID.eq(datasetFieldId))
            .execute();
    }

    @Override
    public List<DatasetFieldPojo> persist(final List<DatasetFieldPojo> fields) {
        if (fields.isEmpty()) {
            return emptyList();
        }

        final Condition condition = fields.stream()
            .map(f -> DATASET_FIELD.ODDRN.eq(f.getOddrn()).and(DATASET_FIELD.TYPE.eq(f.getType())))
            .reduce(Condition::or)
            .orElseThrow(RuntimeException::new);

        final Map<String, DatasetFieldPojo> existingFieldsDict = dslContext
            .selectFrom(DATASET_FIELD)
            .where(condition)
            .fetchStreamInto(DatasetFieldPojo.class)
            .collect(Collectors.toMap(DatasetFieldPojo::getOddrn, Function.identity()));

        final List<DatasetFieldPojo> fieldsToCreate = fields.stream()
            .filter(f -> !existingFieldsDict.containsKey(f.getOddrn()))
            .collect(Collectors.toList());

        final List<DatasetFieldPojo> createdFields = super.bulkCreate(fieldsToCreate);

        final List<DatasetFieldRecord> updatedFieldRecords = fields.stream()
            .map(f -> createRecord(f, existingFieldsDict.get(f.getOddrn())))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        dslContext.batchUpdate(updatedFieldRecords).execute();

        return Stream
            .concat(updatedFieldRecords.stream().map(r -> r.into(DatasetFieldPojo.class)), createdFields.stream())
            .collect(Collectors.toList());
    }

    @Nullable
    private DatasetFieldRecord createRecord(final DatasetFieldPojo f, final DatasetFieldPojo existingField) {
        if (null == existingField) {
            return null;
        }

        final DatasetFieldRecord fieldRecord =
            dslContext.newRecord(recordTable, f.setId(existingField.getId()));

        fieldRecord.changed(DATASET_FIELD.INTERNAL_DESCRIPTION, false);
        return fieldRecord;
    }

    @Override
    public void updateSearchVectors(final long datasetFieldId) {
        final SelectConditionStep<Record1<String>> deOddrnsQuery = dslContext
            .select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .join(DATASET_VERSION).on(DATASET_VERSION.DATASET_ODDRN.eq(DATA_ENTITY.ODDRN))
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .where(DATASET_STRUCTURE.DATASET_FIELD_ID.eq(datasetFieldId));

        final String dsOddrnAlias = "dsv_dataset_oddrn";

        final Field<String> datasetOddrnField = DATASET_VERSION.DATASET_ODDRN.as(dsOddrnAlias);
        final Field<Long> dsvMaxField = max(DATASET_VERSION.VERSION).as("dsv_max");

        final SelectHavingStep<Record3<Long, String, Long>> subquery = dslContext
            .select(DATA_ENTITY.ID, datasetOddrnField, dsvMaxField)
            .from(DATASET_VERSION)
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .join(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .and(DATA_ENTITY.ODDRN.in(deOddrnsQuery))
            .groupBy(DATA_ENTITY.ID, datasetOddrnField);

        final Field<Long> deId = subquery.field(DATA_ENTITY.ID);

        final Field<String> labelName = LABEL.NAME.as("label_name");

        final List<Field<?>> vectorFields = List.of(
            DATASET_FIELD.NAME,
            DATASET_FIELD.INTERNAL_DESCRIPTION,
            DATASET_FIELD.EXTERNAL_DESCRIPTION,
            labelName
        );

        final SelectConditionStep<Record> vectorSelect = dslContext
            .select(vectorFields)
            .select(deId)
            .from(subquery)
            .join(DATASET_VERSION)
            .on(DATASET_VERSION.DATASET_ODDRN.eq(subquery.field(dsOddrnAlias, String.class)))
            .and(DATASET_VERSION.VERSION.eq(dsvMaxField))
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .join(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .leftJoin(LABEL).on(LABEL.ID.eq(LABEL_TO_DATASET_FIELD.LABEL_ID))
            .where(LABEL.IS_DELETED.isFalse());

        jooqFTSHelper.buildSearchEntrypointUpsert(
            vectorSelect,
            deId,
            vectorFields,
            SEARCH_ENTRYPOINT.STRUCTURE_VECTOR,
            true,
            Map.of(labelName, LABEL.NAME)
        ).execute();
    }

    @Override
    @Transactional
    public DatasetFieldDto updateDatasetField(final long datasetFieldId,
                                              final DatasetFieldUpdateFormData datasetFieldUpdateFormData) {
        final DatasetFieldDto dto = getDto(datasetFieldId);
        final DatasetFieldPojo currentPojo = dto.getDatasetFieldPojo();

        final String newDescription = datasetFieldUpdateFormData.getDescription();
        if (!StringUtils.equals(currentPojo.getInternalDescription(), newDescription)) {
            setDescription(datasetFieldId, newDescription);
            currentPojo.setInternalDescription(newDescription);
        }

        Set<LabelPojo> labels = updateDatasetFieldLabels(datasetFieldId, datasetFieldUpdateFormData);
        dto.setLabelPojos(labels);

        updateSearchVectors(datasetFieldId);
        return dto;
    }

    private Set<LabelPojo> updateDatasetFieldLabels(long datasetFieldId, DatasetFieldUpdateFormData datasetFieldUpdateFormData) {
        final Set<LabelPojo> currentLabels = new HashSet<>(labelRepository.listByDatasetFieldId(datasetFieldId));
        final Set<String> names = new HashSet<>(datasetFieldUpdateFormData.getLabelNames());

        final Set<String> currentLabelsNames = currentLabels.stream().map(LabelPojo::getName).collect(Collectors.toSet());

        if (!SetUtils.isEqualSet(currentLabelsNames, names)) {
            final List<LabelPojo> existingLabels = labelRepository.listByNames(names);

            final List<String> existingLabelsNames = existingLabels.stream()
                .map(LabelPojo::getName)
                .collect(Collectors.toList());

            final List<Long> idsToDelete = currentLabels.stream()
                .filter(l -> !names.contains(l.getName()))
                .map(LabelPojo::getId)
                .collect(Collectors.toList());

            labelRepository.deleteRelations(datasetFieldId, idsToDelete);

            final List<LabelPojo> labelsToCreate = names.stream()
                .filter(n -> !currentLabelsNames.contains(n) && !existingLabelsNames.contains(n))
                .map(n -> new LabelPojo().setName(n))
                .collect(Collectors.toList());

            final List<Long> createdIds = labelRepository.bulkCreate(labelsToCreate).stream()
                .map(LabelPojo::getId)
                .collect(Collectors.toList());

            final Set<Long> toRelate = Stream.concat(
                createdIds.stream(),
                existingLabels.stream().map(LabelPojo::getId).filter(not(idsToDelete::contains))
            ).collect(Collectors.toSet());

            labelRepository.createRelations(datasetFieldId, toRelate);

            return Stream.concat(
                    labelsToCreate.stream(),
                    existingLabels.stream())
                .collect(Collectors.toSet());
        } else {
            return currentLabels;
        }
    }

    @Override
    public DatasetFieldDto getDto(final long id) {
        final DatasetField df = DATASET_FIELD.as("df");
        final DatasetField df2 = DATASET_FIELD.as("df2");

        final Optional<DatasetFieldDto> dtoOptional = dslContext.select(df.asterisk(), df2.ID.as("parent_field_id"))
            .from(df)
            .leftJoin(df2)
            .on(df.PARENT_FIELD_ODDRN.eq(df2.ODDRN))
            .where(df.ID.eq(id))
            .fetchOptional(this::mapRecordToDatasetFieldDto);
        return dtoOptional.orElseThrow(
            () -> new IllegalArgumentException(String.format("DatasetField not found by id = %s", id)));
    }

    @NotNull
    private DatasetFieldDto mapRecordToDatasetFieldDto(final Record record) {
        final DatasetFieldPojo pojo = record.into(DatasetFieldPojo.class);
        final Long parentFieldId = record.get("parent_field_id", Long.class);

        return DatasetFieldDto.builder()
            .datasetFieldPojo(pojo)
            .parentFieldId(parentFieldId)
            .build();
    }
}
