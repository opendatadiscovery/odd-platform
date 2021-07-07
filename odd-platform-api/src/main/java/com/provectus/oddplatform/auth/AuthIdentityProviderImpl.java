package com.provectus.oddplatform.auth;

import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import com.provectus.oddplatform.repository.UserOwnerMappingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class AuthIdentityProviderImpl implements AuthIdentityProvider {
    private final UserOwnerMappingRepository userOwnerMappingRepository;

    @Override
    public Mono<OAuth2User> getIdentity() {
        return ReactiveSecurityContextHolder.getContext()
            .switchIfEmpty(Mono.empty())
            .map(SecurityContext::getAuthentication)
            .cast(OAuth2AuthenticationToken.class)
            .map(OAuth2AuthenticationToken::getPrincipal);
    }

    @Override
    public Mono<String> getUsername() {
        return getIdentity()
            .flatMap(user -> {
                final Object username = user.getAttribute("username");
                return username == null ? Mono.empty() : Mono.just(username);
            })
            .cast(String.class);
    }

    @Override
    public Mono<OwnerPojo> fetchAssociatedOwner() {
        return getUsername()
            .map(userOwnerMappingRepository::getAssociatedOwner)
            .flatMap(optional -> optional.map(Mono::just).orElseGet(Mono::empty));
    }
}
