package org.opendatadiscovery.oddplatform.auth;

import java.security.Principal;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.dto.security.Role;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthIdentityProviderImpl implements AuthIdentityProvider {
    private final ReactiveUserOwnerMappingRepository userOwnerMappingRepository;

    @Override
    public Mono<String> getUsername() {
        return ReactiveSecurityContextHolder.getContext()
            .switchIfEmpty(Mono.empty())
            .map(SecurityContext::getAuthentication)
            .map(Principal::getName);
    }

    @Override
    public Mono<Set<Role>> getRoles() {
        return ReactiveSecurityContextHolder.getContext()
            .map(SecurityContext::getAuthentication)
            .map(Authentication::getAuthorities)
            .map(authorities -> authorities.stream()
                .map(a -> Role.valueOf(a.getAuthority()))
                .collect(Collectors.toSet()));
    }

    @Override
    public Mono<OwnerPojo> fetchAssociatedOwner() {
        return getUsername()
            .flatMap(userOwnerMappingRepository::getAssociatedOwner);
    }
}
