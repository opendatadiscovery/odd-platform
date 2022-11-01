package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SelectJoinStep;
import org.jooq.SelectOnConditionStep;
import org.jooq.Table;
import org.jooq.UpdateResultStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataSourceRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.TOKEN;

@Repository
public class ReactiveDataSourceRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<DataSourceRecord, DataSourcePojo>
    implements ReactiveDataSourceRepository {

    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveDataSourceRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                            final JooqQueryHelper jooqQueryHelper,
                                            final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, DATA_SOURCE, DataSourcePojo.class);
        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Mono<DataSourceDto> getDto(final long id) {
        final SelectConditionStep<Record> query = baseSelect()
            .where(DATA_SOURCE.ID.eq(id))
            .and(DATA_SOURCE.IS_DELETED.isFalse());

        return jooqReactiveOperations.mono(query).map(this::mapRecordIntoDto);
    }

    @Override
    public Mono<Page<DataSourceDto>> listDto(final int page, final int size, final String nameQuery) {
        final Select<DataSourceRecord> homogeneousQuery = DSL.selectFrom(DATA_SOURCE).where(queryCondition(nameQuery));

        final Select<? extends Record> dataSourceSelect =
            jooqQueryHelper.paginate(homogeneousQuery, (page - 1) * size, size);

        final Table<? extends Record> dataSourceCTE = dataSourceSelect.asTable("data_source_cte");

        final SelectOnConditionStep<Record> query = DSL.with(dataSourceCTE.getName())
            .as(dataSourceSelect)
            .select(dataSourceCTE.fields())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(dataSourceCTE.getName())
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(dataSourceCTE.field(DATA_SOURCE.NAMESPACE_ID)))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(dataSourceCTE.field(DATA_SOURCE.TOKEN_ID)));

        return jooqReactiveOperations.flux(query)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordIntoDto(r, dataSourceCTE.getName()),
                fetchCount(nameQuery)
            ));
    }

    @Override
    public Mono<DataSourceDto> getDtoByOddrn(final String oddrn) {
        final SelectConditionStep<Record> query = baseSelect()
            .where(DATA_SOURCE.ODDRN.eq(oddrn))
            .and(DATA_SOURCE.IS_DELETED.isFalse());

        return jooqReactiveOperations.mono(query).map(this::mapRecordIntoDto);
    }

    @Override
    public Flux<DataSourceDto> getDtosByOddrns(final List<String> oddrns) {
        final SelectConditionStep<Record> query = baseSelect()
            .where(DATA_SOURCE.ODDRN.in(oddrns))
            .and(DATA_SOURCE.IS_DELETED.isFalse());

        return jooqReactiveOperations.flux(query).map(this::mapRecordIntoDto);
    }

    @Override
    public Mono<Boolean> existsByNamespace(final long namespaceId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_SOURCE)
                .where(DATA_SOURCE.NAMESPACE_ID.eq(namespaceId))
                .and(DATA_SOURCE.IS_DELETED.isFalse())
        );

        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    @Override
    public Mono<DataSourcePojo> injectOddrn(final long id, final String oddrn) {
        final UpdateResultStep<DataSourceRecord> query = DSL.update(DATA_SOURCE)
            .set(DATA_SOURCE.ODDRN, oddrn)
            .set(DATA_SOURCE.UPDATED_AT, LocalDateTime.now())
            .where(DATA_SOURCE.ID.eq(id))
            .returning();

        return jooqReactiveOperations.mono(query).map(r -> r.into(DataSourcePojo.class));
    }

    private SelectJoinStep<Record> baseSelect() {
        return DSL
            .select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(DATA_SOURCE.TOKEN_ID));
    }

    private List<Condition> queryCondition(final String nameQuery) {
        final var conditionsList = new ArrayList<Condition>();

        conditionsList.add(DATA_SOURCE.IS_DELETED.isFalse());
        if (StringUtils.isNotEmpty(nameQuery)) {
            conditionsList.add(DATA_SOURCE.NAME.startsWithIgnoreCase(nameQuery));
        }

        return conditionsList;
    }

    private DataSourceDto mapRecordIntoDto(final Record record, final String dataSourceCteName) {
        final TokenPojo tokenPojo = jooqRecordHelper.extractRelation(record, TOKEN, TokenPojo.class);
        return new DataSourceDto(
            jooqRecordHelper.remapCte(record, dataSourceCteName, DATA_SOURCE).into(DataSourcePojo.class),
            jooqRecordHelper.extractRelation(record, NAMESPACE, NamespacePojo.class),
            tokenPojo != null ? new TokenDto(tokenPojo) : null
        );
    }

    private DataSourceDto mapRecordIntoDto(final Record record) {
        final TokenPojo tokenPojo = jooqRecordHelper.extractRelation(record, TOKEN, TokenPojo.class);

        return new DataSourceDto(
            record.into(DATA_SOURCE).into(DataSourcePojo.class),
            jooqRecordHelper.extractRelation(record, NAMESPACE, NamespacePojo.class),
            tokenPojo != null ? new TokenDto(tokenPojo) : null
        );
    }
}
