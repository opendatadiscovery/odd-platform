package org.opendatadiscovery.oddplatform.auth.handler.impl;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.opendatadiscovery.oddplatform.auth.Provider;
import org.opendatadiscovery.oddplatform.auth.condition.GithubCondition;
import org.opendatadiscovery.oddplatform.auth.handler.OAuthUserHandler;
import org.opendatadiscovery.oddplatform.auth.mapper.GrantedAuthorityExtractor;
import org.springframework.context.annotation.Conditional;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.utils.OperationUtils.containsIgnoreCase;

@Component
@Conditional(GithubCondition.class)
@RequiredArgsConstructor
public class GithubUserHandler implements OAuthUserHandler<OAuth2User, OAuth2UserRequest> {
    private static final String ORGANIZATION = "organization";
    private static final String TEAM_NAME = "name";
    private static final String ORGANIZATION_NAME = "login";
    private static final String USER_LOGIN = "login";
    private static final String GITHUB_ACCEPT_HEADER = "application/vnd.github+json";

    private final WebClient webClient = WebClient.create("https://api.github.com");
    private final GrantedAuthorityExtractor grantedAuthorityExtractor;
    private final ODDOAuth2Properties oAuth2Properties;

    @Override
    public boolean shouldHandle(final String provider) {
        return StringUtils.isNotEmpty(provider) && provider.equalsIgnoreCase(Provider.GITHUB.name());
    }

    @Override
    public Mono<OAuth2User> enrichUserWithProviderInformation(final OAuth2User user,
                                                              final OAuth2UserRequest request) {
        final String registrationId = request.getClientRegistration().getRegistrationId();
        final ODDOAuth2Properties.OAuth2Provider provider = oAuth2Properties.getClient().get(registrationId);
        final String userNameAttributeName = provider.getUserNameAttribute();
        if (CollectionUtils.isNotEmpty(provider.getAdminPrincipals())) {
            final String adminPrincipalAttribute = StringUtils.isNotEmpty(provider.getAdminAttribute())
                ? provider.getAdminAttribute() : USER_LOGIN;
            final Optional<String> username = Optional.ofNullable(user.getAttribute(adminPrincipalAttribute));
            final boolean containsUsername = username
                .map(name -> containsIgnoreCase(provider.getAdminPrincipals(), name))
                .orElse(false);
            if (containsUsername) {
                return Mono.just(new DefaultOAuth2User(grantedAuthorityExtractor.getAuthorities(true),
                    user.getAttributes(),
                    userNameAttributeName)
                );
            }
        }
        if (StringUtils.isEmpty(provider.getOrganizationName())) {
            return Mono.just(
                new DefaultOAuth2User(grantedAuthorityExtractor.getAuthorities(false),
                    user.getAttributes(),
                    userNameAttributeName)
            );
        }

        final Mono<List<Map<String, Object>>> userOrganizations = webClient
            .get()
            .uri("/user/orgs")
            .headers(headers -> {
                headers.set(HttpHeaders.ACCEPT, GITHUB_ACCEPT_HEADER);
                headers.setBearerAuth(request.getAccessToken().getTokenValue());
            })
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<>() {
            });

        return userOrganizations
            .map(orgs -> userBelongsToOrganization(orgs, provider.getOrganizationName()))
            .filter(belongs -> belongs)
            .switchIfEmpty(Mono.error(() -> new OAuth2AuthenticationException(new OAuth2Error("invalid_token",
                String.format("User doesn't belong to organization %s", provider.getOrganizationName()), ""))))
            .then(Mono.defer(() -> determineAdminUser(request, provider)))
            .map(isAdmin -> new DefaultOAuth2User(grantedAuthorityExtractor.getAuthorities(isAdmin),
                user.getAttributes(),
                userNameAttributeName)
            );
    }

    private Mono<Boolean> determineAdminUser(final OAuth2UserRequest request,
                                             final ODDOAuth2Properties.OAuth2Provider provider) {
        if (CollectionUtils.isEmpty(provider.getAdminGroups())) {
            return Mono.just(false);
        }
        final Mono<List<Map<String, Object>>> userTeamsRequest = webClient
            .get()
            .uri("/user/teams")
            .headers(headers -> {
                headers.set(HttpHeaders.ACCEPT, GITHUB_ACCEPT_HEADER);
                headers.setBearerAuth(request.getAccessToken().getTokenValue());
            })
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<>() {
            });
        return userTeamsRequest.map(teams -> teams.stream()
            .filter(team -> teamBelongsToOrganization(team, provider.getOrganizationName()))
            .map(t -> t.get(TEAM_NAME))
            .filter(Objects::nonNull)
            .map(Object::toString)
            .anyMatch(userTeam -> containsIgnoreCase(provider.getAdminGroups(), userTeam)));
    }

    @SuppressWarnings("unchecked")
    private boolean teamBelongsToOrganization(final Map<String, Object> teamInfo,
                                              final String organizationName) {
        final Object organization = teamInfo.get(ORGANIZATION);
        if (organization == null) {
            return false;
        }
        final Object teamOrganization = ((Map<String, Object>) organization).get(ORGANIZATION_NAME);
        return teamOrganization != null && teamOrganization.toString().equalsIgnoreCase(organizationName);
    }

    private boolean userBelongsToOrganization(final List<Map<String, Object>> organizations,
                                              final String organizationName) {
        return organizations.stream()
            .anyMatch(org -> org.get(ORGANIZATION_NAME).toString().equalsIgnoreCase(organizationName));
    }
}


