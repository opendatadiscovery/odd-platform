package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.Token;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;

public interface TokenMapper {
    Token mapPojoToToken(TokenPojo pojo);
    TokenPojo mapTokenToPojo(Token token);
}
