package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
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
        final Select<? extends Record> collectorSelect = jooqQueryHelper.paginate(
            DSL.selectFrom(COLLECTOR).where(listCondition(nameQuery)),
            (page - 1) * size,
            size
        );

        final Table<? extends Record> collectorCTE = collectorSelect.asTable("collector_cte");

        final List<Record> records = DSL.with(collectorCTE.getName())
            .as(collectorSelect)
            .select(collectorCTE.fields())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(collectorCTE.getName())
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(collectorCTE.field(COLLECTOR.NAMESPACE_ID)))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(collectorCTE.field(COLLECTOR.TOKEN_ID)))
            .fetchStream()
            .toList();

        return jooqQueryHelper.pageifyResult(
            records,
            r -> mapRecordToDto(r, collectorCTE.getName()),
            fetchCount(nameQuery)
        );
    }

    @Override
    public Mono<CollectorDto> getDtoByOddrn(final String oddrn) {
        final SelectConditionStep<Record> query = DSL.select(COLLECTOR.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(COLLECTOR)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(COLLECTOR.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(COLLECTOR.TOKEN_ID))
            .where(COLLECTOR.ODDRN.eq(oddrn))
            .and(COLLECTOR.IS_DELETED.isFalse());

        return jooqReactiveOperations.mono(query).map(this::mapRecordToDto);
    }

    private CollectorDto mapRecordToDto(final Record record, final String collectorCteName) {
        final TokenPojo tokenPojo = jooqRecordHelper.extractRelation(record, TOKEN, TokenPojo.class);
        return new CollectorDto(
            jooqRecordHelper.remapCte(record, collectorCteName, COLLECTOR).into(CollectorPojo.class),
            record.into(NAMESPACE).into(NamespacePojo.class),
            new TokenDto(tokenPojo)
        );
    }

    private CollectorDto mapRecordToDto(final Record record) {
        return new CollectorDto(
            record.into(COLLECTOR).into(CollectorPojo.class),
            record.into(NAMESPACE).into(NamespacePojo.class),
            new TokenDto(record.into(TOKEN).into(TokenPojo.class))
        );
    }
}
