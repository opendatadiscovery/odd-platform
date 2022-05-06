package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import reactor.core.publisher.Mono;

public interface ReactiveTokenRepository {
    Mono<TokenDto> create(final TokenPojo tokenPojo);

    Mono<TokenDto> updateToken(final TokenPojo tokenPojo);
}
