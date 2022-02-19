package org.opendatadiscovery.oddplatform.repository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.exception.DataAccessException;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.TokenRecord;
import org.springframework.stereotype.Repository;

import static org.opendatadiscovery.oddplatform.model.Tables.TOKEN;

@Repository
@RequiredArgsConstructor
@Slf4j
public class TokenRepositoryImpl implements TokenRepository {
    private final DSLContext dslContext;

    @Override
    public TokenDto create(final TokenPojo tokenPojo) {
        final TokenRecord tokenRecord = pojoToRecord(tokenPojo);
        final TokenPojo pojo = dslContext.insertInto(TOKEN)
            .set(tokenRecord)
            .returning()
            .fetchOptional()
            .orElseThrow(() -> new DataAccessException("Error inserting token record"))
            .into(TokenPojo.class);
        return new TokenDto(pojo, true);
    }

    @Override
    public TokenDto updateToken(final TokenPojo tokenPojo) {
        final TokenRecord tokenRecord = pojoToRecord(tokenPojo);
        final TokenPojo pojo = dslContext.update(TOKEN)
            .set(tokenRecord)
            .where(TOKEN.ID.eq(tokenPojo.getId()))
            .returning()
            .fetchOptional()
            .orElseThrow(() -> new DataAccessException("Error updating token record"))
            .into(TokenPojo.class);
        return new TokenDto(pojo, true);
    }

    private TokenRecord pojoToRecord(final TokenPojo pojo) {
        return dslContext.newRecord(TOKEN, pojo);
    }
}
