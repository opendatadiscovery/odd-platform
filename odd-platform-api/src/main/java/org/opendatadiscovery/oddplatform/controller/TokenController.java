package org.opendatadiscovery.oddplatform.controller;

import org.opendatadiscovery.oddplatform.api.contract.api.TokenApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Token;
import org.opendatadiscovery.oddplatform.api.contract.model.TokenFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TokenList;
import org.opendatadiscovery.oddplatform.api.contract.model.TokenUpdateFormData;
import org.opendatadiscovery.oddplatform.service.TokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

@RestController
public class TokenController extends
    AbstractCRUDController<Token, TokenList, TokenFormData,
            TokenUpdateFormData, TokenService> implements TokenApi {

    public TokenController(final TokenService entityService) {
        super(entityService);
    }

    @Override
    public Mono<ResponseEntity<TokenList>> getTokensList(
            @NotNull @Valid final Integer page,
            @NotNull @Valid final Integer size,
            @Valid final String query,
            final ServerWebExchange exchange
    ) {
        return list(page, size, query);
    }

    @Override
    public Mono<ResponseEntity<Token>> updateToken(
            final Long tokenId,
            @Valid final Mono<TokenUpdateFormData> tokenUpdateFormData,
            final ServerWebExchange exchange
    ) {
        return update(tokenId, tokenUpdateFormData);
    }

}
