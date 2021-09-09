package com.provectus.oddplatform.auth;

import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import com.provectus.oddplatform.repository.UserOwnerMappingRepository;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthIdentityProviderImpl implements AuthIdentityProvider {
    private final UserOwnerMappingRepository userOwnerMappingRepository;

    @Override
    public Mono<String> getUsername() {
        return ReactiveSecurityContextHolder.getContext()
            .switchIfEmpty(Mono.empty())
            .map(SecurityContext::getAuthentication)
            .map(Principal::getName);
    }

    @Override
    public Mono<OwnerPojo> fetchAssociatedOwner() {
        return getUsername()
            .map(userOwnerMappingRepository::getAssociatedOwner)
            .flatMap(optional -> optional.map(Mono::just).orElseGet(Mono::empty));
    }
}
