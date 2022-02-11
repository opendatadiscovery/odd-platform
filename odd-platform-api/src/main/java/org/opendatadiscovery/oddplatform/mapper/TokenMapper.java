package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.Token;
import org.opendatadiscovery.oddplatform.api.contract.model.TokenFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TokenList;
import org.opendatadiscovery.oddplatform.api.contract.model.TokenUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;

import javax.security.sasl.AuthenticationException;

public interface TokenMapper
        extends CRUDMapper<Token, TokenList, TokenFormData, TokenUpdateFormData, TokenDto> {
    Token mapPojoToToken(TokenPojo pojo);

    TokenDto mapPojoToDto(TokenPojo pojo, String dsName);
}
