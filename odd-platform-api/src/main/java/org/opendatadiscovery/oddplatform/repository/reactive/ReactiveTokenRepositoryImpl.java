package org.opendatadiscovery.oddplatform.repository.reactive;

import lombok.RequiredArgsConstructor;
import org.jooq.UpdateResultStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.TokenRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.TOKEN;

@Repository
@RequiredArgsConstructor
public class ReactiveTokenRepositoryImpl implements ReactiveTokenRepository {
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
}
