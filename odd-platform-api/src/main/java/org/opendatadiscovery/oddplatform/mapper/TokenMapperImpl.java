package org.opendatadiscovery.oddplatform.mapper;

import java.time.ZoneOffset;
import org.opendatadiscovery.oddplatform.api.contract.model.Token;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.springframework.stereotype.Component;

@Component
public class TokenMapperImpl implements TokenMapper {

    @Override
    public Token mapPojoToToken(final TokenPojo tokenPojo) {
        return new Token()
                .id(tokenPojo.getId())
                .value(tokenPojo.getValue())
                .createdAt(tokenPojo.getCreatedAt().atOffset(ZoneOffset.UTC))
                .createdBy(tokenPojo.getCreatedBy())
                .updatedAt(tokenPojo.getUpdatedAt().atOffset(ZoneOffset.UTC))
                .updatedBy(tokenPojo.getUpdatedBy());
    }

    @Override
    public TokenPojo mapTokenToPojo(final Token token) {
        return new TokenPojo()
                .setId(token.getId())
                .setValue(token.getValue())
                .setCreatedBy(token.getCreatedBy())
                .setUpdatedBy(token.getUpdatedBy())
                .setCreatedAt(token.getCreatedAt().toLocalDateTime())
                .setUpdatedAt(token.getUpdatedAt().toLocalDateTime());
    }
}
