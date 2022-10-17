package org.opendatadiscovery.oddplatform.auth;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.dto.security.UserDto;
import org.opendatadiscovery.oddplatform.dto.security.UserPermission;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthIdentityProviderImpl implements AuthIdentityProvider {
    private final ReactiveUserOwnerMappingRepository userOwnerMappingRepository;

    @Override
    public Mono<UserDto> getCurrentUser() {
        return ReactiveSecurityContextHolder.getContext()
            .map(SecurityContext::getAuthentication)
            .map(authentication -> {
                final String username = authentication.getName();
                final Set<UserPermission> permissions = Optional.ofNullable(authentication.getAuthorities())
                    .map(this::mapAuthorities)
                    .orElse(Set.of());
                if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
                    return new UserDto(username, oauthToken.getAuthorizedClientRegistrationId(), permissions);
                } else {
                    return new UserDto(username, null, permissions);
                }
            });
    }

    @Override
    public Mono<OwnerPojo> fetchAssociatedOwner() {
        return getCurrentUser()
            .flatMap(user -> userOwnerMappingRepository.getAssociatedOwner(user.username(), user.provider()));
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
            log.warn("Can't map authority {} to existing permission", authority.getAuthority());
            return Optional.empty();
        }
    }
}
