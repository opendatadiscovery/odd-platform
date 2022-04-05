package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.Optional;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.opendatadiscovery.oddplatform.annotation.BlockingTransactional;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.NamespaceRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.springframework.stereotype.Repository;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;

@Repository
public class NamespaceRepositoryImpl
    extends AbstractSoftDeleteCRUDRepository<NamespaceRecord, NamespacePojo>
    implements NamespaceRepository {

    private final JooqFTSHelper jooqFTSHelper;

    public NamespaceRepositoryImpl(final DSLContext dslContext,
                                   final JooqQueryHelper jooqQueryHelper,
                                   final JooqFTSHelper jooqFTSHelper) {
        super(dslContext, jooqQueryHelper, NAMESPACE, NAMESPACE.ID, NAMESPACE.IS_DELETED, NAMESPACE.NAME,
            NAMESPACE.NAME, NAMESPACE.UPDATED_AT, NamespacePojo.class);

        this.jooqFTSHelper = jooqFTSHelper;
    }

    @Override
    @BlockingTransactional
    public NamespacePojo create(final NamespacePojo pojo) {
        return super.create(pojo);
    }

    @Override
    @BlockingTransactional
    public NamespacePojo update(final NamespacePojo pojo) {
        final NamespacePojo updatedNamespace = super.update(pojo);
        updateSearchVectors(updatedNamespace.getId());
        return updatedNamespace;
    }

    @Override
    public NamespacePojo createIfNotExists(final NamespacePojo namespacePojo) {
        return getByName(namespacePojo.getName())
            .orElseGet(() -> super.create(namespacePojo));
    }

    @Override
    public Optional<NamespacePojo> getByName(final String name) {
        return dslContext
            .selectFrom(NAMESPACE)
            .where(addSoftDeleteFilter(NAMESPACE.NAME.eq(name)))
            .fetchOptionalInto(NamespacePojo.class);
    }

    private void updateSearchVectors(final long namespaceId) {
        final Field<Long> dataEntityId = field("data_entity_id", Long.class);

        final List<Field<?>> vectorFields = List.of(NAMESPACE.NAME);

        final SelectConditionStep<Record> vectorSelect = dslContext
            .select(DATA_ENTITY.ID.as(dataEntityId))
            .select(vectorFields)
            .from(NAMESPACE)
            .join(DATA_SOURCE).on(DATA_SOURCE.NAMESPACE_ID.eq(NAMESPACE.ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.DATA_SOURCE_ID.eq(DATA_SOURCE.ID)).and(DATA_ENTITY.HOLLOW.isFalse())
            .where(NAMESPACE.ID.eq(namespaceId))
            .and(NAMESPACE.IS_DELETED.isFalse());

        jooqFTSHelper.buildSearchEntrypointUpsert(
            vectorSelect,
            dataEntityId,
            vectorFields,
            SEARCH_ENTRYPOINT.NAMESPACE_VECTOR,
            true
        ).execute();
    }
}
