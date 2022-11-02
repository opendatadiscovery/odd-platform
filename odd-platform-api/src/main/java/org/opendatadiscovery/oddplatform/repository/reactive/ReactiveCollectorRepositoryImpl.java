package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SelectOnConditionStep;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.CollectorRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.COLLECTOR;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.TOKEN;

@Repository
public class ReactiveCollectorRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<CollectorRecord, CollectorPojo>
    implements ReactiveCollectorRepository {

    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveCollectorRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                           final JooqRecordHelper jooqRecordHelper,
                                           final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, COLLECTOR, CollectorPojo.class);

        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Mono<CollectorDto> getDto(final long id) {
        final SelectConditionStep<Record> query = DSL.select(COLLECTOR.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(COLLECTOR)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(COLLECTOR.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(COLLECTOR.TOKEN_ID))
            .where(COLLECTOR.ID.eq(id))
            .and(COLLECTOR.IS_DELETED.isFalse());

        return jooqReactiveOperations.mono(query).map(this::mapRecordToDto);
    }

    @Override
    public Mono<Page<CollectorDto>> listDto(final int page, final int size, final String nameQuery) {
        final Select<? extends Record> collectorSelect = paginate(
            DSL.selectFrom(COLLECTOR).where(listCondition(nameQuery)),
            List.of(new OrderByField(COLLECTOR.ID, SortOrder.ASC)),
            (page - 1) * size,
            size
        );

        final Table<? extends Record> collectorCTE = collectorSelect.asTable("collector_cte");

        final SelectOnConditionStep<Record> query = DSL.with(collectorCTE.getName())
            .as(collectorSelect)
            .select(collectorCTE.fields())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(collectorCTE.getName())
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(collectorCTE.field(COLLECTOR.NAMESPACE_ID)))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(collectorCTE.field(COLLECTOR.TOKEN_ID)));

        return jooqReactiveOperations.flux(query)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToDto(r, collectorCTE.getName()),
                fetchCount(nameQuery)
            ));
    }

    @Override
    public Mono<CollectorPojo> getByToken(final String token) {
        final SelectConditionStep<Record> query = DSL
            .select(COLLECTOR.asterisk())
            .from(COLLECTOR)
            .join(TOKEN).on(TOKEN.ID.eq(COLLECTOR.TOKEN_ID))
            .where(addSoftDeleteFilter(TOKEN.VALUE.eq(token)));

        return jooqReactiveOperations.mono(query).map(r -> r.into(CollectorPojo.class));
    }

    @Override
    public Mono<Boolean> existsByNamespace(final long namespaceId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(COLLECTOR).where(addSoftDeleteFilter(COLLECTOR.NAMESPACE_ID.eq(namespaceId)))
        );

        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    private CollectorDto mapRecordToDto(final Record record, final String collectorCteName) {
        final TokenPojo tokenPojo = jooqRecordHelper.extractRelation(record, TOKEN, TokenPojo.class);

        return new CollectorDto(
            jooqRecordHelper.remapCte(record, collectorCteName, COLLECTOR).into(CollectorPojo.class),
            jooqRecordHelper.extractRelation(record, NAMESPACE, NamespacePojo.class),
            new TokenDto(tokenPojo)
        );
    }

    private CollectorDto mapRecordToDto(final Record record) {
        final TokenPojo tokenPojo = jooqRecordHelper.extractRelation(record, TOKEN, TokenPojo.class);

        return new CollectorDto(
            record.into(COLLECTOR).into(CollectorPojo.class),
            jooqRecordHelper.extractRelation(record, NAMESPACE, NamespacePojo.class),
            new TokenDto(tokenPojo)
        );
    }
}
