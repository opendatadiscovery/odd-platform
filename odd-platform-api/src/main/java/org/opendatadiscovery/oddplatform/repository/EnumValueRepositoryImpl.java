package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.EnumValueRecord;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import static java.util.Collections.emptyList;
import static org.opendatadiscovery.oddplatform.model.Tables.ENUM_VALUE;

@Repository
@RequiredArgsConstructor
public class EnumValueRepositoryImpl implements EnumValueRepository {
    private final DSLContext dslContext;

    @Override
    public List<EnumValuePojo> getEnumValuesByFieldId(final Long datasetFieldId) {
        return getEnumValues(datasetFieldId);
    }

    @Override
    @Transactional
    public List<EnumValuePojo> updateFieldEnumValues(final Long datasetFieldId, final List<EnumValuePojo> pojos) {
        if (pojos.isEmpty()) {
            dslContext.update(ENUM_VALUE)
                .set(ENUM_VALUE.IS_DELETED, true)
                .where(ENUM_VALUE.DATASET_FIELD_ID.eq(datasetFieldId))
                .execute();
            return emptyList();
        }

        final List<String> enumNames = pojos.stream().map(EnumValuePojo::getName).toList();
        if (hasDuplicates(enumNames)) {
            throw new RuntimeException("There are duplicates in enum values");
        }

        final List<Long> idsToKeep = pojos.stream()
            .map(EnumValuePojo::getId)
            .filter(Objects::nonNull)
            .toList();
        Condition condition = ENUM_VALUE.DATASET_FIELD_ID.eq(datasetFieldId);
        if (CollectionUtils.isNotEmpty(idsToKeep)) {
            condition = condition.and(ENUM_VALUE.ID.notIn(idsToKeep));
        }
        dslContext.update(ENUM_VALUE)
            .set(ENUM_VALUE.IS_DELETED, true)
            .where(condition)
            .execute();

        final Map<Boolean, List<EnumValuePojo>> partitions = pojos.stream()
            .collect(Collectors.partitioningBy(p -> p.getId() != null));

        bulkCreate(datasetFieldId, partitions.get(false));
        bulkUpdate(partitions.get(true));

        return getEnumValues(datasetFieldId);
    }

    private void bulkCreate(final Long datasetFieldId, final List<EnumValuePojo> pojos) {
        if (pojos.isEmpty()) {
            return;
        }
        final Map<String, EnumValueRecord> recordMap = pojos.stream()
            .collect(Collectors.toMap(
                EnumValuePojo::getName,
                pojo -> dslContext.newRecord(ENUM_VALUE, pojo)
            ));
        final Set<String> existingNames = new HashSet<>();
        final List<EnumValueRecord> updatableRecords = dslContext.select()
            .from(ENUM_VALUE)
            .where(ENUM_VALUE.NAME.in(recordMap.keySet())
                .and(ENUM_VALUE.DATASET_FIELD_ID.eq(datasetFieldId))
                .and(ENUM_VALUE.IS_DELETED.isTrue()))
            .fetchStream()
            .map(r -> {
                existingNames.add(r.get(ENUM_VALUE.NAME));
                final EnumValueRecord updatableRecord = recordMap.get(r.get(ENUM_VALUE.NAME));
                updatableRecord.set(ENUM_VALUE.ID, r.get(ENUM_VALUE.ID));
                updatableRecord.set(ENUM_VALUE.IS_DELETED, false);
                return updatableRecord;
            }).toList();

        dslContext.batchUpdate(updatableRecords).execute();

        if (existingNames.size() != pojos.size()) {
            var step = dslContext.insertInto(
                ENUM_VALUE,
                ENUM_VALUE.NAME,
                ENUM_VALUE.DESCRIPTION,
                ENUM_VALUE.DATASET_FIELD_ID
            );

            for (final var p : pojos) {
                if (!existingNames.contains(p.getName())) {
                    step = step.values(p.getName(), p.getDescription(), p.getDatasetFieldId());
                }
            }
            step.execute();
        }
    }

    private void bulkUpdate(final List<EnumValuePojo> pojos) {
        if (pojos.isEmpty()) {
            return;
        }
        final LocalDateTime now = LocalDateTime.now();
        final List<EnumValueRecord> records = pojos.stream()
            .map(e -> {
                final EnumValueRecord record = dslContext.newRecord(ENUM_VALUE, e);
                record.set(ENUM_VALUE.UPDATED_AT, now);
                return record;
            })
            .collect(Collectors.toList());

        dslContext.batchUpdate(records).execute();
    }

    private List<EnumValuePojo> getEnumValues(final Long datasetFieldId) {
        return dslContext.select()
            .from(ENUM_VALUE)
            .where(ENUM_VALUE.DATASET_FIELD_ID.eq(datasetFieldId).and(ENUM_VALUE.IS_DELETED.isFalse()))
            .fetchStreamInto(EnumValuePojo.class)
            .collect(Collectors.toList());
    }

    private <T> boolean hasDuplicates(final List<T> sourceList) {
        if (CollectionUtils.isEmpty(sourceList)) {
            return false;
        }
        return sourceList.stream().distinct().count() != sourceList.size();
    }
}
