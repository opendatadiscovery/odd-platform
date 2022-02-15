package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldOrigin;
import org.opendatadiscovery.oddplatform.dto.MetadataFieldKey;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MetadataFieldRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import static java.util.function.Predicate.not;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD;

@Repository
public class MetadataFieldRepositoryImpl
    extends AbstractSoftDeleteCRUDRepository<MetadataFieldRecord, MetadataFieldPojo>
    implements MetadataFieldRepository {

    public MetadataFieldRepositoryImpl(final DSLContext dslContext, final JooqQueryHelper jooqQueryHelper) {
        super(dslContext, jooqQueryHelper, METADATA_FIELD, METADATA_FIELD.ID, METADATA_FIELD.IS_DELETED,
            List.of(METADATA_FIELD.NAME, METADATA_FIELD.TYPE),
            METADATA_FIELD.NAME, null, MetadataFieldPojo.class);
    }

    @Override
    public List<MetadataFieldPojo> list(final String query) {
        List<Condition> whereClause =
            addSoftDeleteFilter(METADATA_FIELD.ORIGIN.eq(MetadataFieldOrigin.INTERNAL.getValue()));

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
    public List<MetadataFieldPojo> listByKey(final Collection<MetadataFieldKey> keys) {
        if (keys.isEmpty()) {
            return Collections.emptyList();
        }

        final Condition condition = keys.stream()
            .map(t -> METADATA_FIELD.NAME.eq(t.getFieldName())
                .and(METADATA_FIELD.TYPE.eq(t.getFieldType().toString())))
            .reduce(Condition::or)
            .orElseThrow();

        return dslContext.selectFrom(METADATA_FIELD)
            .where(addSoftDeleteFilter(condition))
            .fetchStream()
            .map(this::recordToPojo)
            .collect(Collectors.toList());
    }

    @Override
    // TODO: handle deleted metadata (with is_deleted==true)
    // TODO: bulkCreate?
    public List<MetadataFieldPojo> createIfNotExist(final Collection<MetadataFieldPojo> entities) {
        final List<MetadataFieldKey> keys = entities.stream()
            .map(e -> new MetadataFieldKey(e.getName(), e.getType()))
            .collect(Collectors.toList());

        final Map<MetadataFieldKey, MetadataFieldPojo> existing = listByKey(keys)
            .stream()
            .collect(Collectors.toMap(
                m -> new MetadataFieldKey(m.getName(), m.getType()),
                Function.identity()
            ));

        final List<MetadataFieldPojo> newMetadata = bulkCreate(keys.stream()
            .filter(not(existing::containsKey))
            .map(mfk -> new MetadataFieldPojo()
                .setName(mfk.getFieldName())
                .setType(mfk.getFieldType().toString()))
            .collect(Collectors.toList()));

        return Stream.concat(existing.values().stream(), newMetadata.stream()).collect(Collectors.toList());
    }
}
