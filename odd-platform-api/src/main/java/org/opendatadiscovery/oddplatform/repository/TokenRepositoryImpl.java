package org.opendatadiscovery.oddplatform.repository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
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
    public TokenPojo create(final TokenPojo tokenPojo) {
        Condition checkIfExistsCondition = DSL.falseCondition();
        if (ObjectUtils.isNotEmpty(tokenPojo)) {
            final Long tokenPojoId = tokenPojo.getId();
            checkIfExistsCondition = TOKEN.ID.eq(tokenPojoId);
        }
        return persistToken(tokenPojo, checkIfExistsCondition);
    }

    @Override
    public TokenPojo regenerateToken(final TokenPojo tokenPojo) {
        final Condition checkIfExistsCondition = TOKEN.ID.eq(tokenPojo.getId());
        return persistToken(tokenPojo, checkIfExistsCondition);
    }

    private TokenPojo persistToken(final TokenPojo tokenPojo, final Condition checkIfExistsCondition) {
        return dslContext.selectFrom(TOKEN)
            .where(checkIfExistsCondition)
            .fetchOptionalInto(TokenPojo.class)
            .map(pojo -> persist(pojo.getId(), tokenPojo))
            .orElseGet(() -> persist(tokenPojo));
    }

    private TokenPojo persist(final TokenPojo token) {
        return persist(null, token);
    }

    private TokenPojo persist(final Long tokenId, final TokenPojo tokenPojo) {
        final TokenRecord record = pojoToRecord(tokenPojo);

        if (tokenId != null) {
            record.set(TOKEN.ID, tokenId);
            record.changed(TOKEN.ID, false);
        }

        record.store();

        return recordToPojo(record);
    }

    private TokenRecord pojoToRecord(final TokenPojo pojo) {
        return dslContext.newRecord(TOKEN, pojo);
    }

    private TokenPojo recordToPojo(final TokenRecord record) {
        return record.into(TokenPojo.class);
    }
}
