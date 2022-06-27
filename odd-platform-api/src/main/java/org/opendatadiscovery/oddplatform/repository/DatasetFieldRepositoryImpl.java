package org.opendatadiscovery.oddplatform.repository;

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
import org.jooq.SelectOnConditionStep;
import org.opendatadiscovery.oddplatform.annotation.BlockingTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.model.tables.DatasetField;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetFieldRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.springframework.stereotype.Repository;

import static java.util.Collections.emptyList;
import static java.util.function.Predicate.not;
import static org.jooq.impl.DSL.max;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL_TO_DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;

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
        super(dslContext, jooqQueryHelper, DATASET_FIELD, DATASET_FIELD.ID, DATASET_FIELD.NAME,
            null, DatasetFieldPojo.class);

        this.jooqFTSHelper = jooqFTSHelper;
        this.labelRepository = labelRepository;
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
}
