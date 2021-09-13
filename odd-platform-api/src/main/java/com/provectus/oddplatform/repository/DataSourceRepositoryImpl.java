package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.DataSourceDto;
import com.provectus.oddplatform.exception.EntityAlreadyExists;
import com.provectus.oddplatform.exception.NotFoundException;
import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.model.tables.records.DataSourceRecord;
import com.provectus.oddplatform.utils.Page;
import lombok.RequiredArgsConstructor;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static com.provectus.oddplatform.model.Tables.DATA_SOURCE;
import static com.provectus.oddplatform.model.Tables.NAMESPACE;
import static java.util.Collections.emptyList;

@Repository
@RequiredArgsConstructor
public class DataSourceRepositoryImpl implements DataSourceRepository {
    private final DSLContext dslContext;
    private final NamespaceRepository namespaceRepository;

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
        final List<DataSourceDto> data = dslContext.select(DATA_SOURCE.asterisk())
            .select(NAMESPACE.asterisk())
            .from(DATA_SOURCE)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .where(queryCondition(query))
            .and(DATA_SOURCE.IS_DELETED.isFalse())
            .offset((page - 1) * size)
            .limit(size)
            .fetchStream()
            .map(this::mapRecord)
            .collect(Collectors.toList());

        return Page.<DataSourceDto>builder()
            .data(data)
            .total(0L)
            .hasNext(false)
            .build();
    }

    @Override
    @Transactional
    public DataSourceDto create(final DataSourceDto dto) {
        final NamespacePojo namespace = namespaceRepository.createIfNotExists(dto.getNamespace());

        return dslContext.selectFrom(DATA_SOURCE)
            .where(DATA_SOURCE.ODDRN.eq(dto.getDataSource().getOddrn()))
            .fetchOptionalInto(DataSourcePojo.class)
            .map(ds -> {
                if (!ds.getIsDeleted()) {
                    throw new EntityAlreadyExists();
                }

                final DataSourceRecord record = pojoToRecord(dto.getDataSource());
                record.set(DATA_SOURCE.IS_DELETED, false);
                record.set(DATA_SOURCE.ID, ds.getId());
                record.set(DATA_SOURCE.NAMESPACE_ID, namespace.getId());
                record.store();

                return new DataSourceDto(recordToPojo(record), namespace);
            })
            .orElseGet(() -> {
                final DataSourceRecord record = pojoToRecord(dto.getDataSource());
                record.set(DATA_SOURCE.NAMESPACE_ID, namespace.getId());
                record.store();
                return new DataSourceDto(recordToPojo(record), namespace);
            });
    }

    @Override
    public DataSourceDto update(final DataSourceDto dto) {
        final NamespacePojo namespace = namespaceRepository.createIfNotExists(dto.getNamespace());

        return dslContext.selectFrom(DATA_SOURCE)
            .where(DATA_SOURCE.ID.eq(dto.getDataSource().getId()))
            .and(DATA_SOURCE.IS_DELETED.isFalse())
            .fetchOptionalInto(DataSourcePojo.class)
            .map(ds -> {
                final DataSourceRecord record = pojoToRecord(dto.getDataSource());
                record.set(DATA_SOURCE.ID, ds.getId());
                record.set(DATA_SOURCE.NAMESPACE_ID, namespace.getId());
                record.store();

                return new DataSourceDto(recordToPojo(record), namespace);
            })
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
