package org.opendatadiscovery.oddplatform.repository;

import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import reactor.core.publisher.Mono;

public interface TokenRepository {
    Mono<TokenDto> create(final TokenPojo tokenPojo);

    Mono<TokenDto> updateToken(final TokenPojo tokenPojo);
}
