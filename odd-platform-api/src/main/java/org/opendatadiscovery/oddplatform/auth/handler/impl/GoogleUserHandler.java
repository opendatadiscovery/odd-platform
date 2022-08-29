package org.opendatadiscovery.oddplatform.auth.handler.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.auth.condition.GoogleCondition;
import org.opendatadiscovery.oddplatform.auth.handler.OidcUserHandler;
import org.opendatadiscovery.oddplatform.auth.mapper.GrantedAuthorityExtractor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientPropertiesRegistrationAdapter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component("googleUserHandler")
@Conditional(GoogleCondition.class)
@RequiredArgsConstructor
public class GoogleUserHandler implements OidcUserHandler {

    @Value("${spring.security.oauth2.client.provider.google.admin-principals:}")
    private Set<String> adminPrincipals;

    @Value("${spring.security.oauth2.client.provider.google.allowed-domain:}")
    private String allowedDomain;

    private final GrantedAuthorityExtractor grantedAuthorityExtractor;

    @Override
    public Mono<OidcUser> enrichUserWithProviderInformation(final OidcUser oidcUser,
                                                            final OidcUserRequest request) {
        return Mono.just(oidcUser);
    }

    @Bean
    public InMemoryReactiveClientRegistrationRepository clientRegistrationRepository(
        final OAuth2ClientProperties properties) {
        final List<ClientRegistration> registrations = new ArrayList<>(
            OAuth2ClientPropertiesRegistrationAdapter.getClientRegistrations(properties).values());
        if (StringUtils.isNotEmpty(allowedDomain)) {
            final List<ClientRegistration> clientRegistrations = registrations.stream()
                .map(cr -> {
                    if (cr.getRegistrationId().equalsIgnoreCase(CommonOAuth2Provider.GOOGLE.name())) {
                        final String newUri = cr.getProviderDetails().getAuthorizationUri() + "?hd=" + allowedDomain;
                        return ClientRegistration.withClientRegistration(cr).authorizationUri(newUri).build();
                    } else {
                        return cr;
                    }
                }).toList();
            return new InMemoryReactiveClientRegistrationRepository(clientRegistrations);
        }
        return new InMemoryReactiveClientRegistrationRepository(registrations);
    }
}
