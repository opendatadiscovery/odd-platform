package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.DataSourceDto;
import com.provectus.oddplatform.exception.EntityAlreadyExistsException;
import com.provectus.oddplatform.exception.NotFoundException;
import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.model.tables.records.DataSourceRecord;
import com.provectus.oddplatform.repository.util.JooqQueryHelper;
import com.provectus.oddplatform.utils.Page;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.Table;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import static com.provectus.oddplatform.model.Tables.DATA_SOURCE;
import static com.provectus.oddplatform.model.Tables.NAMESPACE;
import static java.util.Collections.emptyList;

@Repository
@RequiredArgsConstructor
@Slf4j
public class DataSourceRepositoryImpl implements DataSourceRepository {
    private final DSLContext dslContext;
    private final NamespaceRepository namespaceRepository;
    private final JooqQueryHelper jooqQueryHelper;

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
            .and(DATA_SOURCE.IS_DELETED.isFalse())
            .fetchStream()
            .map(this::mapRecord)
            .collect(Collectors.toList());
    }

    @Override
    public Page<DataSourceDto> list(final int page, final int size, final String query) {
        final Select<DataSourceRecord> homogeneousQuery = dslContext
            .selectFrom(DATA_SOURCE)
            .where(queryCondition(query))
            .and(DATA_SOURCE.IS_DELETED.isFalse());

        final Select<? extends Record> dataSourceSelect =
            jooqQueryHelper.paginate(homogeneousQuery, (page - 1) * size, size);

        final Table<? extends Record> dataSourceCTE = dataSourceSelect.asTable("data_source_cte");

        final List<Record> dataSourceRecords = dslContext.with(dataSourceCTE.getName())
            .as(dataSourceSelect)
            .select(dataSourceCTE.fields())
            .from(dataSourceCTE.getName())
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(dataSourceCTE.field(DATA_SOURCE.NAMESPACE_ID)))
            .fetchStream()
            .collect(Collectors.toList());

        return jooqQueryHelper.pageifyResult(dataSourceRecords, this::mapRecord, () -> fetchCount(query));
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

                return store(ds.getId(), dto.getDataSource(), namespace);
            })
            .orElseGet(() -> store(dto.getDataSource(), namespace));
    }

    @Override
    public DataSourceDto update(final DataSourceDto dto) {
        final NamespacePojo namespace = dto.getNamespace() != null
            ? namespaceRepository.createIfNotExists(dto.getNamespace())
            : null;

        return dslContext.selectFrom(DATA_SOURCE)
            .where(DATA_SOURCE.ID.eq(dto.getDataSource().getId()))
            .and(DATA_SOURCE.IS_DELETED.isFalse())
            .fetchOptionalInto(DataSourcePojo.class)
            .map(ds -> store(ds.getId(), dto.getDataSource(), namespace))
            .orElseThrow(() -> {
                throw new NotFoundException();
            });
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

    private DataSourceDto store(final DataSourcePojo dataSource, final NamespacePojo namespace) {
        return store(null, dataSource, namespace);
    }

    private DataSourceDto store(final Long dsId, final DataSourcePojo dataSource, final NamespacePojo namespace) {
        final DataSourceRecord record = pojoToRecord(dataSource);

        record.set(DATA_SOURCE.IS_DELETED, false);

        if (dsId != null) {
            record.set(DATA_SOURCE.ID, dsId);
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
        return StringUtils.hasLength(query)
            ? List.of(DATA_SOURCE.NAME.startsWithIgnoreCase(query))
            : emptyList();
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
