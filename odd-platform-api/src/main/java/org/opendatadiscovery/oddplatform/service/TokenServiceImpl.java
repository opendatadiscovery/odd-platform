package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final AuthIdentityProvider authIdentityProvider;

    @Override
    public Mono<TokenPojo> generateToken() {
        return authIdentityProvider.getUsername()
            .map(this::generate)
            .switchIfEmpty(Mono.defer(() -> Mono.just(this.generate(null))));
    }

    @Override
    public Mono<TokenPojo> regenerateToken(final TokenPojo tokenPojo) {
        return authIdentityProvider.getUsername()
            .map(username -> this.regenerate(tokenPojo, username))
            .switchIfEmpty(Mono.defer(() -> Mono.just(this.regenerate(tokenPojo, null))));
    }

    private TokenPojo generate(final String username) {
        return new TokenPojo()
            .setCreatedAt(LocalDateTime.now())
            .setCreatedBy(username)
            .setValue(RandomStringUtils.randomAlphanumeric(40))
            .setUpdatedAt(LocalDateTime.now())
            .setUpdatedBy(username);
    }

    private TokenPojo regenerate(final TokenPojo token, final String username) {
        if (token == null) {
            throw new RuntimeException("Token is null");
        }
        return token
            .setValue(RandomStringUtils.randomAlphanumeric(40))
            .setUpdatedAt(LocalDateTime.now())
            .setUpdatedBy(username);
    }
}
