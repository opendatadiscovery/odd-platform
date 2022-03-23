package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.Table;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.exception.EntityAlreadyExistsException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataSourceRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.TOKEN;

@Repository
@RequiredArgsConstructor
@Slf4j
public class DataSourceRepositoryImpl implements DataSourceRepository {
    private final DSLContext dslContext;
    private final NamespaceRepository namespaceRepository;
    private final JooqQueryHelper jooqQueryHelper;
    private final JooqRecordHelper jooqRecordHelper;
    private final JooqFTSHelper jooqFTSHelper;
    private final TokenRepository tokenRepository;

    @Override
    public Optional<DataSourceDto> get(final long id) {
        return dslContext.select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(DATA_SOURCE.TOKEN_ID))
            .where(DATA_SOURCE.ID.eq(id))
            .and(DATA_SOURCE.IS_DELETED.isFalse())
            .fetchOptional(this::mapRecord);
    }

    @Override
    public List<DataSourceDto> list() {
        return dslContext.select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(DATA_SOURCE.TOKEN_ID))
            .where(DATA_SOURCE.IS_DELETED.isFalse())
            .fetchStream()
            .map(this::mapRecord)
            .collect(Collectors.toList());
    }

    @Override
    public List<DataSourceDto> list(final String query) {
        return dslContext.select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(DATA_SOURCE.TOKEN_ID))
            .where(queryCondition(query))
            .fetchStream()
            .map(this::mapRecord)
            .collect(Collectors.toList());
    }

    @Override
    public Page<DataSourceDto> list(final int page, final int size, final String query) {
        final Select<DataSourceRecord> homogeneousQuery = dslContext
            .selectFrom(DATA_SOURCE)
            .where(queryCondition(query));

        final Select<? extends Record> dataSourceSelect =
            jooqQueryHelper.paginate(homogeneousQuery, (page - 1) * size, size);

        final Table<? extends Record> dataSourceCTE = dataSourceSelect.asTable("data_source_cte");

        final List<Record> dataSourceRecords = dslContext.with(dataSourceCTE.getName())
            .as(dataSourceSelect)
            .select(dataSourceCTE.fields())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(dataSourceCTE.getName())
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(dataSourceCTE.field(DATA_SOURCE.NAMESPACE_ID)))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(dataSourceCTE.field(DATA_SOURCE.TOKEN_ID)))
            .fetchStream()
            .collect(Collectors.toList());

        return jooqQueryHelper.pageifyResult(
            dataSourceRecords,
            r -> mapRecord(r, dataSourceCTE.getName()),
            () -> fetchCount(query)
        );
    }

    @Override
    @Transactional
    public DataSourceDto create(final DataSourceDto dto) {
        final NamespacePojo namespace = dto.namespace() != null
            ? namespaceRepository.createIfNotExists(dto.namespace())
            : null;

        final TokenDto token = tokenRepository.create(dto.token().tokenPojo());

        final DataSourcePojo dsPojo = dto.dataSource();

        final boolean isConnectionUrlExists = dsPojo.getConnectionUrl() != null && !dsPojo.getConnectionUrl().isEmpty();
        final Condition checkIfExistsCondition = isConnectionUrlExists
            ? DATA_SOURCE.CONNECTION_URL.eq(dsPojo.getConnectionUrl())
            : DATA_SOURCE.ODDRN.eq(dsPojo.getOddrn());

        return dslContext.selectFrom(DATA_SOURCE)
            .where(checkIfExistsCondition)
            .fetchOptionalInto(DataSourcePojo.class)
            .map(ds -> {
                if (!ds.getIsDeleted()) {
                    throw new EntityAlreadyExistsException();
                }
                return persist(ds.getId(), dsPojo, namespace, token);
            })
            .orElseGet(() -> persist(dsPojo, namespace, token));
    }

    @Override
    @Transactional
    public DataSourceDto update(final DataSourceDto dto) {
        final NamespacePojo namespace = dto.namespace() != null
            ? namespaceRepository.createIfNotExists(dto.namespace())
            : null;

        return dslContext.selectFrom(DATA_SOURCE)
            .where(DATA_SOURCE.ID.eq(dto.dataSource().getId()))
            .and(DATA_SOURCE.IS_DELETED.isFalse())
            .fetchOptionalInto(DataSourcePojo.class)
            .map(ds -> update(ds, dto, namespace, dto.token()))
            .orElseThrow(() -> {
                throw new NotFoundException();
            });
    }

    private DataSourceDto update(final DataSourcePojo existing,
                                 final DataSourceDto delta,
                                 final NamespacePojo namespace,
                                 final TokenDto tokenDto) {
        final DataSourceDto updatedDs = persist(existing.getId(), delta.dataSource(), namespace, tokenDto);

        final Field<Long> deId = field("data_entity_id", Long.class);

        final List<Field<?>> dsVectorFields = List.of(DATA_SOURCE.NAME, DATA_SOURCE.CONNECTION_URL, DATA_SOURCE.ODDRN);

        final SelectConditionStep<Record> dsSelect = dslContext
            .select(DATA_ENTITY.ID.as(deId))
            .select(dsVectorFields)
            .from(DATA_SOURCE)
            .join(DATA_ENTITY).on(DATA_ENTITY.DATA_SOURCE_ID.eq(DATA_SOURCE.ID)).and(DATA_ENTITY.HOLLOW.isFalse())
            .where(DATA_SOURCE.ID.eq(existing.getId()));

        final List<Field<?>> nsVectorFields = List.of(NAMESPACE.NAME);

        final SelectConditionStep<Record> nsSelect = dslContext
            .select(DATA_ENTITY.ID.as(deId))
            .select(nsVectorFields)
            .from(DATA_SOURCE)
            .join(DATA_ENTITY).on(DATA_ENTITY.DATA_SOURCE_ID.eq(DATA_SOURCE.ID)).and(DATA_ENTITY.HOLLOW.isFalse())
            .join(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .where(DATA_SOURCE.ID.eq(existing.getId()));

        jooqFTSHelper
            .buildSearchEntrypointUpsert(dsSelect, deId, dsVectorFields, SEARCH_ENTRYPOINT.DATA_SOURCE_VECTOR, true)
            .execute();

        jooqFTSHelper
            .buildSearchEntrypointUpsert(nsSelect, deId, nsVectorFields, SEARCH_ENTRYPOINT.NAMESPACE_VECTOR, true)
            .execute();

        return updatedDs;
    }

    @Override
    public List<DataSourceDto> bulkCreate(final Collection<DataSourceDto> pojos) {
        if (CollectionUtils.isEmpty(pojos)) {
            return List.of();
        }
        final List<DataSourceRecord> records = pojos.stream()
            .map(dto -> pojoToRecord(dto.dataSource()))
            .toList();
        InsertSetStep<DataSourceRecord> insertStep = dslContext.insertInto(DATA_SOURCE);
        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return insertStep
            .set(records.get(records.size() - 1))
            .returning(DATA_SOURCE.fields())
            .fetch()
            .stream()
            .map(this::mapRecord)
            .toList();
    }

    @Override
    public List<DataSourceDto> bulkUpdate(final Collection<DataSourceDto> pojos) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public void delete(final long id) {
        dslContext
            .update(DATA_SOURCE)
            .set(DATA_SOURCE.IS_DELETED, true)
            .where(DATA_SOURCE.ID.eq(id))
            .execute();
    }

    @Override
    public void delete(final List<Long> id) {
        dslContext
            .update(DATA_SOURCE)
            .set(DATA_SOURCE.IS_DELETED, true)
            .where(DATA_SOURCE.ID.in(id))
            .execute();
    }

    @Override
    public Optional<DataSourceDto> getByOddrn(final String oddrn) {
        return dslContext
            .select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(DATA_SOURCE.TOKEN_ID))
            .where(DATA_SOURCE.ODDRN.eq(oddrn))
            .and(DATA_SOURCE.IS_DELETED.isFalse())
            .fetchOptional()
            .map(this::mapRecord);
    }

    @Override
    public List<DataSourceDto> getByOddrns(final List<String> oddrns, final boolean includeDeleted) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(DATA_SOURCE.ODDRN.in(oddrns));
        if (!includeDeleted) {
            conditions.add(DATA_SOURCE.IS_DELETED.isFalse());
        }
        return dslContext
            .select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(DATA_SOURCE.TOKEN_ID))
            .where(conditions)
            .fetchStream()
            .map(this::mapRecord)
            .toList();
    }

    @Override
    public Collection<DataSourceDto> listActive() {
        return dslContext
            .select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(DATA_SOURCE.TOKEN_ID))
            .where(DATA_SOURCE.ACTIVE.isTrue())
            .and(DATA_SOURCE.IS_DELETED.isFalse())
            .and(DATA_SOURCE.CONNECTION_URL.isNotNull())
            .and(DATA_SOURCE.CONNECTION_URL.notEqual(""))
            .fetchStream()
            .map(this::mapRecord)
            .collect(Collectors.toList());
    }

    @Override
    public boolean existByNamespace(final long namespaceId) {
        return dslContext.fetchExists(
            dslContext.selectFrom(DATA_SOURCE)
                .where(DATA_SOURCE.NAMESPACE_ID.eq(namespaceId))
                .and(DATA_SOURCE.IS_DELETED.isFalse())
        );
    }

    @Override
    public void injectOddrn(final long id, final String oddrn) {
        dslContext.update(DATA_SOURCE)
            .set(DATA_SOURCE.ODDRN, oddrn)
            .set(DATA_SOURCE.UPDATED_AT, LocalDateTime.now())
            .where(DATA_SOURCE.ID.eq(id))
            .execute();
    }

    @Override
    public void restoreDataSources(final List<String> oddrns) {
        dslContext.update(DATA_SOURCE)
            .set(DATA_SOURCE.IS_DELETED, false)
            .where(DATA_SOURCE.ODDRN.in(oddrns))
            .execute();
    }

    @Override
    public void setTokenFromCollector(final List<String> dataSourceOddrns, final Long tokenId) {
        dslContext.update(DATA_SOURCE)
            .set(DATA_SOURCE.TOKEN_ID, tokenId)
            .where(DATA_SOURCE.ODDRN.in(dataSourceOddrns))
            .execute();
    }

    private DataSourceDto persist(
        final DataSourcePojo dataSource,
        final NamespacePojo namespace,
        final TokenDto tokenDto
    ) {
        return persist(null, dataSource, namespace, tokenDto);
    }

    private DataSourceDto persist(
        final Long dsId,
        final DataSourcePojo dataSource,
        final NamespacePojo namespace,
        final TokenDto tokenDto
    ) {
        final DataSourceRecord record = pojoToRecord(dataSource);

        record.set(DATA_SOURCE.IS_DELETED, false);

        if (dsId != null) {
            record.set(DATA_SOURCE.ID, dsId);
            record.changed(DATA_SOURCE.ID, false);
            record.set(DATA_SOURCE.UPDATED_AT, LocalDateTime.now());
        }

        if (namespace != null) {
            record.set(DATA_SOURCE.NAMESPACE_ID, namespace.getId());
        }

        if (tokenDto != null && tokenDto.tokenPojo() != null) {
            record.set(DATA_SOURCE.TOKEN_ID, tokenDto.tokenPojo().getId());
        }

        record.store();

        return new DataSourceDto(recordToPojo(record), namespace, tokenDto);
    }

    private Long fetchCount(final String query) {
        return dslContext.selectCount()
            .from(DATA_SOURCE)
            .where(queryCondition(query))
            .fetchOneInto(Long.class);
    }

    private List<Condition> queryCondition(final String query) {
        final var conditionsList = new ArrayList<Condition>();

        conditionsList.add(DATA_SOURCE.IS_DELETED.isFalse());
        if (StringUtils.hasLength(query)) {
            conditionsList.add(DATA_SOURCE.NAME.startsWithIgnoreCase(query));
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

    private DataSourceRecord pojoToRecord(final DataSourcePojo pojo) {
        return dslContext.newRecord(DATA_SOURCE, pojo);
    }

    private DataSourcePojo recordToPojo(final DataSourceRecord record) {
        return record.into(DataSourcePojo.class);
    }
}
