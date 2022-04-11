package org.opendatadiscovery.oddplatform.repository;

import lombok.RequiredArgsConstructor;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.UpdateResultStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.TokenRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.TOKEN;

@Repository
@RequiredArgsConstructor
public class TokenRepositoryImpl implements TokenRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Mono<TokenDto> create(final TokenPojo tokenPojo) {
        final TokenRecord tokenRecord = jooqReactiveOperations.newRecord(TOKEN, tokenPojo);

        return jooqReactiveOperations
            .mono(DSL.insertInto(TOKEN).set(tokenRecord).returning())
            .map(r -> new TokenDto(r.into(TokenPojo.class), true));
    }

    @Override
    public Mono<TokenDto> updateToken(final TokenPojo tokenPojo) {
        final TokenRecord tokenRecord = jooqReactiveOperations.newRecord(TOKEN, tokenPojo);

        final UpdateResultStep<TokenRecord> query = DSL.update(TOKEN)
            .set(tokenRecord)
            .where(TOKEN.ID.eq(tokenPojo.getId()))
            .returning();

        return jooqReactiveOperations.mono(query).map(r -> new TokenDto(r.into(TokenPojo.class), true));
    }

    @Override
    public Mono<TokenDto> getByDataSourceId(final long dataSourceId) {
        final SelectConditionStep<Record> query = DSL.select(TOKEN.asterisk())
            .from(TOKEN)
            .join(DATA_SOURCE).on(DATA_SOURCE.TOKEN_ID.eq(TOKEN.ID))
            .where(DATA_SOURCE.ID.eq(dataSourceId));

        return jooqReactiveOperations.mono(query).map(r -> new TokenDto(r.into(TokenPojo.class)));
    }

    @Override
    public Mono<TokenDto> delete(final long id) {
        return jooqReactiveOperations
            .mono(DSL.delete(TOKEN).where(TOKEN.ID.eq(id)).returning())
            .map(r -> new TokenDto(r.into(TokenPojo.class)));
    }
}
