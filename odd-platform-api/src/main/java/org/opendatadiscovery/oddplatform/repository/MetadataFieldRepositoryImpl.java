package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataKey;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MetadataFieldRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import static java.util.function.Function.identity;
import static java.util.function.Predicate.not;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD;

@Repository
public class MetadataFieldRepositoryImpl
    extends AbstractSoftDeleteCRUDRepository<MetadataFieldRecord, MetadataFieldPojo>
    implements MetadataFieldRepository {

    public MetadataFieldRepositoryImpl(final DSLContext dslContext, final JooqQueryHelper jooqQueryHelper) {
        super(dslContext, jooqQueryHelper, METADATA_FIELD, METADATA_FIELD.ID, METADATA_FIELD.IS_DELETED,
            List.of(METADATA_FIELD.NAME, METADATA_FIELD.TYPE),
            METADATA_FIELD.NAME, MetadataFieldPojo.class);
    }

    @Override
    public List<MetadataFieldPojo> list(final String query) {
        List<Condition> whereClause =
            addSoftDeleteFilter(METADATA_FIELD.ORIGIN.eq(MetadataOrigin.INTERNAL.name()));

        if (StringUtils.hasLength(query)) {
            whereClause = new ArrayList<>(whereClause);
            whereClause.add(nameField.containsIgnoreCase(query));
        }

        return dslContext
            .selectFrom(recordTable)
            .where(whereClause)
            .fetchStream()
            .map(this::recordToPojo)
            .collect(Collectors.toList());
    }

    @Override
    public List<MetadataFieldPojo> listByKey(final Collection<MetadataKey> keys) {
        if (keys.isEmpty()) {
            return Collections.emptyList();
        }

        final Condition condition = keys.stream()
            .map(t -> METADATA_FIELD.NAME.eq(t.fieldName())
                .and(METADATA_FIELD.TYPE.eq(t.fieldType().toString())))
            .reduce(Condition::or)
            .orElseThrow();

        return dslContext.selectFrom(METADATA_FIELD)
            .where(addSoftDeleteFilter(condition))
            .fetchStream()
            .map(this::recordToPojo)
            .collect(Collectors.toList());
    }

    @Override
    public List<MetadataFieldPojo> createIfNotExist(final Collection<MetadataFieldPojo> entities) {
        final Map<MetadataKey, MetadataFieldPojo> entitiesMap = entities.stream()
            .collect(Collectors.toMap(MetadataKey::new, identity()));

        final Map<MetadataKey, MetadataFieldPojo> existing = listByKey(entitiesMap.keySet()).stream()
            .collect(Collectors.toMap(MetadataKey::new, identity()));

        final List<MetadataFieldPojo> newMetadata = bulkCreate(entitiesMap.keySet().stream()
            .filter(not(existing::containsKey))
            .map(entitiesMap::get)
            .collect(Collectors.toList()));

        return Stream.concat(existing.values().stream(), newMetadata.stream()).collect(Collectors.toList());
    }
}
