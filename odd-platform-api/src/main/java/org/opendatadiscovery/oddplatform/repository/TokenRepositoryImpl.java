package org.opendatadiscovery.oddplatform.repository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.Table;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.TokenRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.TOKEN;

@Repository
@RequiredArgsConstructor
@Slf4j
public class TokenRepositoryImpl implements TokenRepository {
    private final DSLContext dslContext;
    private final JooqQueryHelper jooqQueryHelper;
    private final JooqRecordHelper jooqRecordHelper;
    private final JooqFTSHelper jooqFTSHelper;

    @Override
    public Optional<TokenDto> get(final long id) {
        return dslContext.select(TOKEN.asterisk())
                .from(TOKEN)
                .where(TOKEN.ID.eq(id))
                .fetchOptional(this::mapRecord);
    }

    @Override
    public List<TokenDto> list() {
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
    public List<TokenDto> list(String query) {
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
    public Page<TokenDto> list(int page, int size, String query) {
        final Select<TokenRecord> homogeneousQuery = dslContext
                .selectFrom(TOKEN)
                .where(queryCondition(query));

        final Select<? extends Record> tokenSelect =
                jooqQueryHelper.paginate(homogeneousQuery, (page - 1) * size, size);

        final Table<? extends Record> tokenCTE = tokenSelect.asTable("token_cte");

        final List<Record> tokenRecords = dslContext.with(tokenCTE.getName())
                .as(tokenSelect)
                .select(tokenCTE.fields())
                .from(tokenCTE.getName())
                .fetchStream()
                .collect(Collectors.toList());

        return jooqQueryHelper.pageifyResult(
                tokenRecords,
                r -> mapRecord(r, tokenCTE.getName()),
                () -> fetchCount(query)
        );
    }

    @Override
    @Transactional
    public TokenDto create(final TokenDto dto) {
        final TokenPojo tokenPojo = dto.tokenPojo();
        final Condition checkIfExistsCondition = TOKEN.ID.eq(tokenPojo.getId());

        return dslContext.selectFrom(TOKEN)
                .where(checkIfExistsCondition)
                .fetchOptionalInto(DataSourcePojo.class)
                .map(ds -> persist(ds.getId(), tokenPojo))
                .orElseGet(() -> persist(tokenPojo));
    }

    @Override
    @Transactional
    public TokenDto update(TokenDto dto) {
        return dslContext.selectFrom(TOKEN)
                .where(TOKEN.ID.eq(dto.tokenPojo().getId()))
                .fetchOptionalInto(TokenPojo.class)
                .map(pojo -> update(pojo, dto))
                .orElseThrow(() -> {
                    throw new NotFoundException();
                });
    }

    @Override
    public List<TokenDto> bulkCreate(Collection<TokenDto> pojos) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public List<TokenDto> bulkUpdate(Collection<TokenDto> pojos) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public void delete(long id) {

    }

    @Override
    public void delete(List<Long> id) {

    }

    private TokenDto update(final TokenPojo existing,
                                 final TokenDto delta) {
        final TokenDto updatedDs = persist(existing.getId(), delta.tokenPojo());

        final Field<Long> deId = field("data_entity_id", Long.class);

        final List<Field<?>> tVectorFields = List.of(TOKEN.NAME, TOKEN.VALUE);

        final SelectConditionStep<Record> dsSelect = dslContext
                .select(DATA_ENTITY.ID.as(deId))
                .select(tVectorFields)
                .from(TOKEN)
                .join(DATA_SOURCE).on(DATA_SOURCE.TOKEN_ID.eq(TOKEN.ID))
                .join(DATA_ENTITY).on(DATA_ENTITY.DATA_SOURCE_ID.eq(DATA_SOURCE.ID)).and(DATA_ENTITY.HOLLOW.isFalse())
                .where(TOKEN.ID.eq(existing.getId()));

        jooqFTSHelper
                .buildSearchEntrypointUpsert(dsSelect, deId, tVectorFields, SEARCH_ENTRYPOINT.TOKEN_VECTOR, true)
                .execute();

        return updatedDs;
    }

    private Long fetchCount(final String query) {
        return dslContext.selectCount()
                .from(TOKEN)
                .where(queryCondition(query))
                .fetchOneInto(Long.class);
    }

    private List<Condition> queryCondition(final String query) {
        final var conditionsList = new ArrayList<Condition>();

        if (StringUtils.hasLength(query)) {
            conditionsList.add(TOKEN.NAME.startsWithIgnoreCase(query));
        }
        return conditionsList;
    }

    private TokenDto persist(final TokenPojo tokenPojo) {
        return persist(null, tokenPojo);
    }

    private TokenDto persist(final Long dsId, final TokenPojo tokenPojo) {
        final TokenRecord record = pojoToRecord(tokenPojo);

        if (dsId != null) {
            record.set(TOKEN.ID, dsId);
            record.changed(TOKEN.ID, false);
        }

        record.store();

        return new TokenDto(recordToPojo(record));
    }

    private TokenDto mapRecord(final Record record, final String tokenCteName) {
        return new TokenDto(jooqRecordHelper.remapCte(record, tokenCteName, TOKEN).into(TokenPojo.class));
    }

    private TokenDto mapRecord(final Record record) {
        return new TokenDto(record.into(TOKEN).into(TokenPojo.class));
    }

    private TokenRecord pojoToRecord(final TokenPojo pojo) {
        return dslContext.newRecord(TOKEN, pojo);
    }

    private TokenPojo recordToPojo(final TokenRecord record) {
        return record.into(TokenPojo.class);
    }
}
