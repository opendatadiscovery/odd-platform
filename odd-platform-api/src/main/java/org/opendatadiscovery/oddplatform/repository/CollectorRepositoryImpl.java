package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.Table;
import org.jooq.exception.DataAccessException;
import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.exception.EntityAlreadyExistsException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.CollectorRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.opendatadiscovery.oddrn.Generator;
import org.opendatadiscovery.oddrn.model.ODDPlatformCollectorPath;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import static org.opendatadiscovery.oddplatform.model.Tables.COLLECTOR;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.TOKEN;

@Repository
public class CollectorRepositoryImpl implements CollectorRepository {

    private final DSLContext dslContext;
    private final TokenRepository tokenRepository;
    private final NamespaceRepository namespaceRepository;
    private final Generator generator;
    private final JooqQueryHelper jooqQueryHelper;
    private final JooqRecordHelper jooqRecordHelper;

    public CollectorRepositoryImpl(final DSLContext dslContext,
                                   final JooqQueryHelper jooqQueryHelper,
                                   final JooqRecordHelper jooqRecordHelper,
                                   final TokenRepository tokenRepository,
                                   final NamespaceRepository namespaceRepository) {
        this.dslContext = dslContext;
        this.tokenRepository = tokenRepository;
        this.namespaceRepository = namespaceRepository;
        this.generator = new Generator();
        this.jooqQueryHelper = jooqQueryHelper;
        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Optional<CollectorDto> get(final long id) {
        return dslContext.select(COLLECTOR.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(COLLECTOR)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(COLLECTOR.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(COLLECTOR.TOKEN_ID))
            .where(COLLECTOR.ID.eq(id))
            .and(COLLECTOR.IS_DELETED.isFalse())
            .fetchOptional(this::mapRecord);
    }

    @Override
    public Optional<CollectorDto> getByOddrn(final String oddrn) {
        return dslContext.select(COLLECTOR.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(COLLECTOR)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(COLLECTOR.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(COLLECTOR.TOKEN_ID))
            .where(COLLECTOR.ODDRN.eq(oddrn))
            .and(COLLECTOR.IS_DELETED.isFalse())
            .fetchOptional(this::mapRecord);
    }

    @Override
    public List<CollectorDto> list() {
        return dslContext.select(COLLECTOR.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(COLLECTOR)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(COLLECTOR.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(COLLECTOR.TOKEN_ID))
            .where(COLLECTOR.IS_DELETED.isFalse())
            .fetchStream()
            .map(this::mapRecord)
            .collect(Collectors.toList());
    }

    @Override
    public List<CollectorDto> list(final String query) {
        return dslContext.select(COLLECTOR.asterisk())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(COLLECTOR)
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(COLLECTOR.NAMESPACE_ID))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(COLLECTOR.TOKEN_ID))
            .where(queryCondition(query))
            .fetchStream()
            .map(this::mapRecord)
            .collect(Collectors.toList());
    }

    @Override
    public Page<CollectorDto> list(final int page, final int size, final String query) {
        final Select<CollectorRecord> homogeneousQuery = dslContext
            .selectFrom(COLLECTOR)
            .where(queryCondition(query));

        final Select<? extends Record> collectorSelect =
            jooqQueryHelper.paginate(homogeneousQuery, (page - 1) * size, size);

        final Table<? extends Record> collectorCTE = collectorSelect.asTable("collector_cte");

        final List<Record> records = dslContext.with(collectorCTE.getName())
            .as(collectorSelect)
            .select(collectorCTE.fields())
            .select(NAMESPACE.asterisk())
            .select(TOKEN.asterisk())
            .from(collectorCTE.getName())
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(collectorCTE.field(COLLECTOR.NAMESPACE_ID)))
            .leftJoin(TOKEN).on(TOKEN.ID.eq(collectorCTE.field(COLLECTOR.TOKEN_ID)))
            .fetchStream()
            .toList();

        return jooqQueryHelper
            .pageifyResult(records, r -> mapRecord(r, collectorCTE.getName()), () -> fetchCount(query));
    }

    @Override
    @Transactional
    public CollectorDto create(final CollectorDto dto) {
        final NamespacePojo namespace = dto.namespace() != null
            ? namespaceRepository.createIfNotExists(dto.namespace())
            : null;
        final TokenDto token = tokenRepository.create(dto.tokenDto().tokenPojo());
        return dslContext.selectFrom(COLLECTOR)
            .where(COLLECTOR.NAME.eq(dto.collectorPojo().getName()))
            .fetchOptionalInto(CollectorPojo.class)
            .map(c -> {
                if (!c.getIsDeleted()) {
                    throw new EntityAlreadyExistsException();
                }
                return saveCollector(c.getId(), dto.collectorPojo(), namespace, token);
            })
            .orElseGet(() -> saveCollector(dto.collectorPojo(), namespace, token));
    }

    @Override
    @Transactional
    public CollectorDto update(final CollectorDto dto) {
        final NamespacePojo namespace = dto.namespace() != null
            ? namespaceRepository.createIfNotExists(dto.namespace())
            : null;

        return dslContext.selectFrom(COLLECTOR)
            .where(COLLECTOR.ID.eq(dto.collectorPojo().getId()))
            .and(COLLECTOR.IS_DELETED.isFalse())
            .fetchOptionalInto(CollectorPojo.class)
            .map(existingCollector ->
                saveCollector(existingCollector.getId(), dto.collectorPojo(), namespace, dto.tokenDto()))
            .orElseThrow(() -> {
                throw new NotFoundException();
            });
    }

    @Override
    public List<CollectorDto> bulkCreate(final Collection<CollectorDto> pojos) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public List<CollectorDto> bulkUpdate(final Collection<CollectorDto> pojos) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public void delete(final long id) {
        dslContext
            .update(COLLECTOR)
            .set(COLLECTOR.IS_DELETED, true)
            .where(COLLECTOR.ID.eq(id))
            .execute();
    }

    @Override
    public void delete(final List<Long> id) {
        dslContext
            .update(COLLECTOR)
            .set(COLLECTOR.IS_DELETED, true)
            .where(COLLECTOR.ID.in(id))
            .execute();
    }

    private CollectorDto saveCollector(final CollectorPojo collector,
                                       final NamespacePojo namespace,
                                       final TokenDto tokenDto) {
        return saveCollector(null, collector, namespace, tokenDto);
    }

    private CollectorDto saveCollector(final Long collectorId,
                                       final CollectorPojo collector,
                                       final NamespacePojo namespace,
                                       final TokenDto tokenDto) {
        final CollectorRecord record = pojoToRecord(collector);
        record.setIsDeleted(false);
        if (collectorId != null) {
            record.setId(collectorId);
            record.setUpdatedAt(LocalDateTime.now());
        }
        if (namespace != null) {
            record.setNamespaceId(namespace.getId());
        }
        if (tokenDto != null && tokenDto.tokenPojo() != null) {
            record.setTokenId(tokenDto.tokenPojo().getId());
        }

        final var pojo = upsertCollector(record);
        if (pojo.getOddrn() == null) {
            final Long id = pojo.getId();
            final String oddrn = generateOddrn(id);
            pojo.setOddrn(oddrn);
            return new CollectorDto(upsertCollector(pojoToRecord(pojo)), namespace, tokenDto);
        }
        return new CollectorDto(pojo, namespace, tokenDto);
    }

    private CollectorPojo upsertCollector(final CollectorRecord record) {
        final CollectorRecord collectorRecord = dslContext.insertInto(COLLECTOR)
            .set(record)
            .onDuplicateKeyUpdate()
            .set(record)
            .returning()
            .fetchOptional()
            .orElseThrow(() -> new DataAccessException(""));
        return recordToPojo(collectorRecord);
    }

    private CollectorRecord pojoToRecord(final CollectorPojo pojo) {
        return dslContext.newRecord(COLLECTOR, pojo);
    }

    private CollectorPojo recordToPojo(final CollectorRecord record) {
        return record.into(CollectorPojo.class);
    }

    private String generateOddrn(final Long collectorId) {
        try {
            final ODDPlatformCollectorPath collectorPath = ODDPlatformCollectorPath.builder()
                .collectorId(collectorId).build();
            return generator.generate(collectorPath, "collectorId");
        } catch (Exception e) {
            throw new RuntimeException("Can't generate oddrn for collector with id " + collectorId, e);
        }
    }

    private List<Condition> queryCondition(final String query) {
        final var conditionsList = new ArrayList<Condition>();

        conditionsList.add(COLLECTOR.IS_DELETED.isFalse());
        if (StringUtils.hasLength(query)) {
            conditionsList.add(COLLECTOR.NAME.startsWithIgnoreCase(query));
        }
        return conditionsList;
    }

    private Long fetchCount(final String query) {
        return dslContext.selectCount()
            .from(COLLECTOR)
            .where(queryCondition(query))
            .fetchOneInto(Long.class);
    }

    private CollectorDto mapRecord(final Record record, final String collectorCteName) {
        final TokenPojo tokenPojo = jooqRecordHelper.extractRelation(record, TOKEN, TokenPojo.class);
        return new CollectorDto(
            jooqRecordHelper.remapCte(record, collectorCteName, COLLECTOR).into(CollectorPojo.class),
            record.into(NAMESPACE).into(NamespacePojo.class),
            new TokenDto(tokenPojo)
        );
    }

    private CollectorDto mapRecord(final Record record) {
        final TokenPojo tokenPojo = jooqRecordHelper.extractRelation(record, TOKEN, TokenPojo.class);
        return new CollectorDto(
            record.into(COLLECTOR).into(CollectorPojo.class),
            record.into(NAMESPACE).into(NamespacePojo.class),
            new TokenDto(tokenPojo)
        );
    }
}
