package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SelectOnConditionStep;
import org.jooq.Table;
import org.jooq.UpdateResultStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.exception.EntityAlreadyExistsException;
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

import static org.apache.commons.lang3.StringUtils.isEmpty;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.TOKEN;

@Repository
@RequiredArgsConstructor
public class ReactiveDataSourceRepositoryImpl implements ReactiveDataSourceRepository {
    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqRecordHelper jooqRecordHelper;
    private final JooqQueryHelper jooqQueryHelper;

    @Override
    public Mono<DataSourceDto> get(final long id) {
        final SelectConditionStep<Record> query = DSL.select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(DATA_SOURCE.TOKEN_ID))
            .where(DATA_SOURCE.ID.eq(id))
            .and(DATA_SOURCE.IS_DELETED.isFalse());

        return jooqReactiveOperations.mono(query).map(this::mapRecord);
    }

    @Override
    public Mono<Page<DataSourceDto>> list(final int page, final int size, final String nameQuery) {
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
                r -> mapRecord(r, dataSourceCTE.getName()),
                fetchCount(nameQuery)
            ));
    }

    @Override
    public Mono<DataSourceDto> getByOddrn(final String oddrn) {
        final SelectConditionStep<Record> query = DSL
            .select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(DATA_SOURCE.TOKEN_ID))
            .where(DATA_SOURCE.ODDRN.eq(oddrn))
            .and(DATA_SOURCE.IS_DELETED.isFalse());

        return jooqReactiveOperations.mono(query).map(this::mapRecord);
    }

    @Override
    public Flux<DataSourceDto> getByOddrns(final List<String> oddrns, final boolean includeDeleted) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(DATA_SOURCE.ODDRN.in(oddrns));

        if (!includeDeleted) {
            conditions.add(DATA_SOURCE.IS_DELETED.isFalse());
        }

        final SelectConditionStep<Record> query = DSL
            .select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(DATA_SOURCE.TOKEN_ID))
            .where(conditions);

        return jooqReactiveOperations.flux(query).map(this::mapRecord);
    }

    @Override
    public Flux<DataSourceDto> listActive() {
        final SelectConditionStep<Record> query = DSL
            .select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(DATA_SOURCE.TOKEN_ID))
            .where(DATA_SOURCE.ACTIVE.isTrue())
            .and(DATA_SOURCE.IS_DELETED.isFalse())
            .and(DATA_SOURCE.CONNECTION_URL.isNotNull())
            .and(DATA_SOURCE.CONNECTION_URL.notEqual(""));

        return jooqReactiveOperations.flux(query).map(this::mapRecord);
    }

    @Override
    public Mono<Boolean> existsByNamespace(final long namespaceId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_SOURCE)
                .where(DATA_SOURCE.NAMESPACE_ID.eq(namespaceId))
                .and(DATA_SOURCE.IS_DELETED.isFalse())
        );

        return jooqReactiveOperations.mono(query).map(r -> r.get(0, Boolean.class));
    }

    @Override
    @ReactiveTransactional
    public Mono<DataSourcePojo> create(final DataSourcePojo dataSource) {
        final boolean isConnectionUrlExists = isEmpty(dataSource.getConnectionUrl());

        final Condition checkIfExistsCondition = isConnectionUrlExists
            ? DATA_SOURCE.CONNECTION_URL.eq(dataSource.getConnectionUrl())
            : DATA_SOURCE.ODDRN.eq(dataSource.getOddrn());

        return jooqReactiveOperations
            .mono(DSL.selectFrom(DATA_SOURCE).where(checkIfExistsCondition))
            .map(r -> r.into(DataSourcePojo.class))
            .flatMap(ds -> {
                if (!ds.getIsDeleted()) {
                    return Mono.error(new EntityAlreadyExistsException(
                        "Data source with %s ODDRN already exists".formatted(dataSource.getOddrn())));
                }

                return insert(dataSource.setId(ds.getId()));
            })
            .switchIfEmpty(Mono.defer(() -> insert(dataSource)));
    }

    @Override
    public Flux<DataSourcePojo> bulkCreate(final Collection<DataSourcePojo> dataSource) {
        return null;
    }

    @Override
    @ReactiveTransactional
    public Mono<DataSourcePojo> update(final DataSourcePojo dataSource) {
        final Select<? extends Record1<Boolean>> existsQuery = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_SOURCE)
                .where(DATA_SOURCE.ID.eq(dataSource.getId()))
                .and(DATA_SOURCE.IS_DELETED.isFalse())
        );

        // TODO: rework with new abstractions
        return jooqReactiveOperations.mono(existsQuery)
            .filter(Record1::component1)
            .map(ignored -> jooqReactiveOperations.newRecord(DATA_SOURCE, dataSource))
            .map(record -> DSL.update(DATA_SOURCE).set(record).returning())
            .flatMap(jooqReactiveOperations::mono)
            .map(r -> r.into(DataSourcePojo.class));
    }

    @Override
    public Flux<DataSourcePojo> bulkUpdate(final Collection<DataSourcePojo> dataSource) {
        return null;
    }

    @Override
    public Mono<DataSourceDto> injectOddrn(final long id, final String oddrn) {
        final UpdateResultStep<DataSourceRecord> query = DSL.update(DATA_SOURCE)
            .set(DATA_SOURCE.ODDRN, oddrn)
            .set(DATA_SOURCE.UPDATED_AT, LocalDateTime.now())
            .where(DATA_SOURCE.ID.eq(id))
            .returning();

        return jooqReactiveOperations.mono(query).map(this::mapRecord);
    }

    @Override
    public Mono<DataSourcePojo> delete(final long id) {
        final UpdateResultStep<DataSourceRecord> query = DSL.update(DATA_SOURCE)
            .set(DATA_SOURCE.IS_DELETED, true)
            .where(DATA_SOURCE.ID.eq(id))
            .returning();

        return jooqReactiveOperations.mono(query).map(r -> r.into(DataSourcePojo.class));
    }

    private Mono<DataSourcePojo> insert(final DataSourcePojo dataSource) {
        final DataSourceRecord record = jooqReactiveOperations.newRecord(DATA_SOURCE, dataSource);

        return jooqReactiveOperations
            .mono(DSL.insertInto(DATA_SOURCE).set(record).returning())
            .map(r -> r.into(DataSourcePojo.class));
    }

    private Mono<Long> fetchCount(final String nameQuery) {
        return jooqReactiveOperations
            .mono(DSL.selectCount().from(DATA_SOURCE).where(queryCondition(nameQuery)))
            .map(r -> r.into(Long.class));
    }

    private List<Condition> queryCondition(final String nameQuery) {
        final var conditionsList = new ArrayList<Condition>();

        conditionsList.add(DATA_SOURCE.IS_DELETED.isFalse());
        if (StringUtils.isNotEmpty(nameQuery)) {
            conditionsList.add(DATA_SOURCE.NAME.startsWithIgnoreCase(nameQuery));
        }

        return conditionsList;
    }

    private DataSourceDto mapRecord(final Record record, final String dataSourceCteName) {
        final TokenPojo tokenPojo = jooqRecordHelper.extractRelation(record, TOKEN, TokenPojo.class);
        return new DataSourceDto(
            jooqRecordHelper.remapCte(record, dataSourceCteName, DATA_SOURCE).into(DataSourcePojo.class),
            record.into(NAMESPACE).into(NamespacePojo.class),
            tokenPojo != null ? new TokenDto(tokenPojo) : null
        );
    }

    private DataSourceDto mapRecord(final Record record) {
        final TokenPojo tokenPojo = jooqRecordHelper.extractRelation(record, TOKEN, TokenPojo.class);
        return new DataSourceDto(
            record.into(DATA_SOURCE).into(DataSourcePojo.class),
            record.into(NAMESPACE).into(NamespacePojo.class),
            tokenPojo != null ? new TokenDto(tokenPojo) : null
        );
    }
}
