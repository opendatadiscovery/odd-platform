package org.opendatadiscovery.oddplatform.auth;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.dto.security.UserDto;
import org.opendatadiscovery.oddplatform.dto.security.UserProviderRole;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class AuthIdentityProviderImpl implements AuthIdentityProvider {
    private final ReactiveUserOwnerMappingRepository userOwnerMappingRepository;
    private final String authType;

    public AuthIdentityProviderImpl(final ReactiveUserOwnerMappingRepository userOwnerMappingRepository,
                                    @Value("${auth.type}") final String authType) {
        this.userOwnerMappingRepository = userOwnerMappingRepository;
        this.authType = authType;
    }

    @Override
    public Mono<UserDto> getCurrentUser() {
        return ReactiveSecurityContextHolder.getContext()
            .map(SecurityContext::getAuthentication)
            .map(authentication -> {
                final String username = authentication.getName();
                if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
                    return new UserDto(username, oauthToken.getAuthorizedClientRegistrationId());
                } else {
                    return new UserDto(username, authType);
                }
            });
    }

    @Override
    public Mono<UserProviderRole> getCurrentUserProviderRole() {
        return ReactiveSecurityContextHolder.getContext()
            .map(SecurityContext::getAuthentication)
            .map(Authentication::getAuthorities)
            .filter(CollectionUtils::isNotEmpty)
            .map(authorities -> {
                final String authority = authorities.iterator().next().getAuthority();
                return UserProviderRole.valueOf(authority);
            });
    }

    @Override
    public Mono<OwnerPojo> fetchAssociatedOwner() {
        return getCurrentUser()
            .flatMap(user -> userOwnerMappingRepository.getAssociatedOwner(user.username(), user.provider()));
    }
}
