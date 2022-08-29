package org.opendatadiscovery.oddplatform.auth;

import java.security.Principal;
import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.dto.security.UserPermission;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
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
    public Mono<Set<UserPermission>> getPermissions() {
        return ReactiveSecurityContextHolder.getContext()
            .map(SecurityContext::getAuthentication)
            .map(Authentication::getAuthorities)
            .map(this::mapAuthorities)
            .defaultIfEmpty(Set.of());
    }

    @Override
    public Mono<OwnerPojo> fetchAssociatedOwner() {
        return getUsername()
            .flatMap(userOwnerMappingRepository::getAssociatedOwner);
    }

    private Set<UserPermission> mapAuthorities(final Collection<? extends GrantedAuthority> authorities) {
        return authorities.stream()
            .map(this::mapAuthority)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toSet());
    }

    private Optional<UserPermission> mapAuthority(final GrantedAuthority authority) {
        try {
            return Optional.of(UserPermission.valueOf(authority.getAuthority()));
        } catch (Exception e) {
            log.debug("Can't map authority {} to existing role", authority.getAuthority());
            return Optional.empty();
        }
    }
}
