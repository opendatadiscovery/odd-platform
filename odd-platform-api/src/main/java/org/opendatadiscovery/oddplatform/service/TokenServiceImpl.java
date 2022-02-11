package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Token;
import org.opendatadiscovery.oddplatform.api.contract.model.TokenFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TokenList;
import org.opendatadiscovery.oddplatform.api.contract.model.TokenUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.mapper.TokenMapper;
import org.opendatadiscovery.oddplatform.repository.TokenRepository;
import org.springframework.stereotype.Service;

@Service
public class TokenServiceImpl extends
    AbstractCRUDService<Token, TokenList, TokenFormData, TokenUpdateFormData,
            TokenDto, TokenMapper, TokenRepository> implements TokenService {

    public TokenServiceImpl(final TokenMapper entityMapper, final TokenRepository entityRepository) {
        super(entityMapper, entityRepository);
    }

}
