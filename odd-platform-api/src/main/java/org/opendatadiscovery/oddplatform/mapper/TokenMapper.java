package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.Token;
import org.opendatadiscovery.oddplatform.dto.TokenDto;

public interface TokenMapper {
    Token mapDtoToToken(final TokenDto dto);
}
