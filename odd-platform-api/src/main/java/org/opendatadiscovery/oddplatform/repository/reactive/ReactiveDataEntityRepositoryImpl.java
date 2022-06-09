package org.opendatadiscovery.oddplatform.repository.reactive;

import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;

@Repository
public class ReactiveDataEntityRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<DataEntityRecord, DataEntityPojo>
    implements ReactiveDataEntityRepository {

    public ReactiveDataEntityRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                            final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, DATA_ENTITY, DataEntityPojo.class, DATA_ENTITY.EXTERNAL_NAME,
            DATA_ENTITY.ID, DATA_ENTITY.UPDATED_AT, DATA_ENTITY.IS_DELETED, DATA_ENTITY.DELETED_AT);
    }

    @Override
    public Mono<Boolean> exists(final long dataEntityId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_ENTITY).where(addSoftDeleteFilter(DATA_ENTITY.ID.eq(dataEntityId))));

        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    @Override
    public Mono<Boolean> existsByDataSourceId(final long dataSourceId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_ENTITY).where(addSoftDeleteFilter(DATA_ENTITY.DATA_SOURCE_ID.eq(dataSourceId))));

        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    @Override
    public Mono<Boolean> existsByNamespaceId(final long namespaceId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_ENTITY).where(addSoftDeleteFilter(DATA_ENTITY.NAMESPACE_ID.eq(namespaceId))));

        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }
}
