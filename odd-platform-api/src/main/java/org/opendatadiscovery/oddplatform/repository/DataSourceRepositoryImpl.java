package org.opendatadiscovery.oddplatform.repository;

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
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.Table;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.exception.EntityAlreadyExistsException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataSourceRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;

@Repository
@RequiredArgsConstructor
@Slf4j
public class DataSourceRepositoryImpl implements DataSourceRepository {
    private final DSLContext dslContext;
    private final NamespaceRepository namespaceRepository;
    private final JooqQueryHelper jooqQueryHelper;
    private final JooqRecordHelper jooqRecordHelper;
    private final JooqFTSHelper jooqFTSHelper;

    @Override
    public Optional<DataSourceDto> get(final long id) {
        return dslContext.select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .where(DATA_SOURCE.ID.eq(id))
            .and(DATA_SOURCE.IS_DELETED.isFalse())
            .fetchOptional(this::mapRecord);
    }

    @Override
    public List<DataSourceDto> list() {
        return dslContext.select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .where(DATA_SOURCE.IS_DELETED.isFalse())
            .fetchStream()
            .map(this::mapRecord)
            .collect(Collectors.toList());
    }

    @Override
    public List<DataSourceDto> list(final String query) {
        return dslContext.select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
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
            .from(dataSourceCTE.getName())
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(dataSourceCTE.field(DATA_SOURCE.NAMESPACE_ID)))
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
        final NamespacePojo namespace = dto.getNamespace() != null
            ? namespaceRepository.createIfNotExists(dto.getNamespace())
            : null;

        return dslContext.selectFrom(DATA_SOURCE)
            .where(DATA_SOURCE.ODDRN.eq(dto.getDataSource().getOddrn()))
            .fetchOptionalInto(DataSourcePojo.class)
            .map(ds -> {
                if (!ds.getIsDeleted()) {
                    throw new EntityAlreadyExistsException();
                }

                return upsert(ds.getId(), dto.getDataSource(), namespace);
            })
            .orElseGet(() -> upsert(dto.getDataSource(), namespace));
    }

    @Override
    @Transactional
    public DataSourceDto update(final DataSourceDto dto) {
        final NamespacePojo namespace = dto.getNamespace() != null
            ? namespaceRepository.createIfNotExists(dto.getNamespace())
            : null;

        return dslContext.selectFrom(DATA_SOURCE)
            .where(DATA_SOURCE.ID.eq(dto.getDataSource().getId()))
            .and(DATA_SOURCE.IS_DELETED.isFalse())
            .fetchOptionalInto(DataSourcePojo.class)
            .map(ds -> update(ds, dto, namespace))
            .orElseThrow(() -> {
                throw new NotFoundException();
            });
    }

    private DataSourceDto update(final DataSourcePojo existing,
                                 final DataSourceDto delta,
                                 final NamespacePojo namespace) {
        final DataSourceDto updatedDs = upsert(existing.getId(), delta.getDataSource(), namespace);

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
        throw new UnsupportedOperationException("Not implemented");
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
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .where(DATA_SOURCE.ODDRN.eq(oddrn))
            .and(DATA_SOURCE.IS_DELETED.isFalse())
            .fetchOptional()
            .map(this::mapRecord);
    }

    @Override
    public Collection<DataSourceDto> listActive() {
        return dslContext
            .select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .where(DATA_SOURCE.ACTIVE.isTrue())
            .and(DATA_SOURCE.IS_DELETED.isFalse())
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

    private DataSourceDto upsert(final DataSourcePojo dataSource, final NamespacePojo namespace) {
        return upsert(null, dataSource, namespace);
    }

    private DataSourceDto upsert(final Long dsId, final DataSourcePojo dataSource, final NamespacePojo namespace) {
        final DataSourceRecord record = pojoToRecord(dataSource);

        record.set(DATA_SOURCE.IS_DELETED, false);

        if (dsId != null) {
            record.set(DATA_SOURCE.ID, dsId);
            record.changed(DATA_SOURCE.ID, false);
        }

        if (namespace != null) {
            record.set(DATA_SOURCE.NAMESPACE_ID, namespace.getId());
        }

        record.store();

        return new DataSourceDto(recordToPojo(record), namespace);
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
        return new DataSourceDto(
            jooqRecordHelper.remapCte(record, dataSourceCteName, DATA_SOURCE).into(DataSourcePojo.class),
            record.into(NAMESPACE).into(NamespacePojo.class)
        );
    }

    private DataSourceDto mapRecord(final Record record) {
        return new DataSourceDto(
            record.into(DATA_SOURCE).into(DataSourcePojo.class),
            record.into(NAMESPACE).into(NamespacePojo.class)
        );
    }

    private DataSourceRecord pojoToRecord(final DataSourcePojo pojo) {
        return dslContext.newRecord(DATA_SOURCE, pojo);
    }

    private DataSourcePojo recordToPojo(final DataSourceRecord record) {
        return record.into(DataSourcePojo.class);
    }
}
