package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.model.tables.records.NamespaceRecord;
import com.provectus.oddplatform.repository.util.JooqFTSHelper;
import com.provectus.oddplatform.repository.util.JooqQueryHelper;
import java.util.List;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import static com.provectus.oddplatform.model.Tables.DATA_ENTITY;
import static com.provectus.oddplatform.model.Tables.DATA_SOURCE;
import static com.provectus.oddplatform.model.Tables.NAMESPACE;
import static com.provectus.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.jooq.impl.DSL.field;

@Repository
public class NamespaceRepositoryImpl
    extends AbstractSoftDeleteCRUDRepository<NamespaceRecord, NamespacePojo>
    implements NamespaceRepository {

    private final JooqFTSHelper jooqFTSHelper;

    public NamespaceRepositoryImpl(final DSLContext dslContext,
                                   final JooqQueryHelper jooqQueryHelper,
                                   final JooqFTSHelper jooqFTSHelper) {
        super(dslContext, jooqQueryHelper, NAMESPACE, NAMESPACE.ID, NAMESPACE.IS_DELETED, NAMESPACE.NAME,
            NAMESPACE.NAME, NamespacePojo.class);

        this.jooqFTSHelper = jooqFTSHelper;
    }

    @Override
    @Transactional
    public NamespacePojo create(final NamespacePojo pojo) {
        // TODO: finish after below issues are fixed
        //  https://github.com/opendatadiscovery/odd-platform/issues/151
        //  https://github.com/opendatadiscovery/odd-platform/issues/150
        return super.create(pojo);
    }

    @Override
    @Transactional
    public NamespacePojo update(final NamespacePojo pojo) {
        final NamespacePojo updatedNamespace = super.update(pojo);
        updateSearchVectors(updatedNamespace.getId());
        return updatedNamespace;
    }

    @Override
    public NamespacePojo createIfNotExists(final NamespacePojo namespacePojo) {
        return dslContext
            .selectFrom(NAMESPACE)
            .where(addSoftDeleteFilter(NAMESPACE.NAME.eq(namespacePojo.getName())))
            .fetchOptionalInto(NamespacePojo.class)
            .orElseGet(() -> super.create(namespacePojo));
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
            .where(NAMESPACE.ID.eq(namespaceId));

        jooqFTSHelper.buildSearchEntrypointUpsert(
            vectorSelect,
            dataEntityId,
            vectorFields,
            SEARCH_ENTRYPOINT.NAMESPACE_VECTOR,
            true
        ).execute();
    }
}
