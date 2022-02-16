package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.Token;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.springframework.stereotype.Component;

import java.time.ZoneOffset;

@Component
public class TokenMapperImpl implements TokenMapper {

    @Override
    public Token mapPojoToToken(TokenPojo tokenPojo) {
        return new Token()
                .id(tokenPojo.getId())
                .name(tokenPojo.getName())
                .description(tokenPojo.getDescription())
                .value(tokenPojo.getValue())
                .createdAt(tokenPojo.getCreatedAt().atOffset(ZoneOffset.UTC))
                .createdBy(tokenPojo.getCreatedBy())
                .updatedAt(tokenPojo.getUpdatedAt().atOffset(ZoneOffset.UTC))
                .updatedBy(tokenPojo.getUpdatedBy());
    }

    @Override
    public TokenPojo mapTokenToPojo(Token token) {
        return new TokenPojo()
                .setId(token.getId())
                .setName(token.getName())
                .setDescription(token.getDescription())
                .setValue(token.getValue())
                .setCreatedBy(token.getCreatedBy())
                .setUpdatedBy(token.getUpdatedBy())
                .setCreatedAt(token.getCreatedAt().toLocalDateTime())
                .setUpdatedAt(token.getUpdatedAt().toLocalDateTime());
    }
}
