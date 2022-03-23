package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import reactor.core.publisher.Mono;

public interface TokenService {
    Mono<TokenPojo> generateToken();

    Mono<TokenPojo> regenerateToken(final TokenPojo tokenPojo);
}
