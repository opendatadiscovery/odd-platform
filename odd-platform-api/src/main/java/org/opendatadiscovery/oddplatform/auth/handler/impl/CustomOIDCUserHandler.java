package org.opendatadiscovery.oddplatform.auth.handler.impl;

import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.opendatadiscovery.oddplatform.auth.Provider;
import org.opendatadiscovery.oddplatform.auth.condition.CustomProviderCondition;
import org.opendatadiscovery.oddplatform.auth.handler.OAuthUserHandler;
import org.opendatadiscovery.oddplatform.auth.mapper.GrantedAuthorityExtractor;
import org.springframework.context.annotation.Conditional;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;

@Component
@Conditional(CustomProviderCondition.class)
public class CustomOIDCUserHandler extends AbstractOIDCUserHandler
    implements OAuthUserHandler<OidcUser, OidcUserRequest> {

    public CustomOIDCUserHandler(final ODDOAuth2Properties properties,
                                 final GrantedAuthorityExtractor authorityExtractor) {
        super(properties, authorityExtractor);
    }

    @Override
    public boolean shouldHandle(final String provider) {
        final Set<String> providers = Stream.of(Provider.values())
            .map(Enum::name)
            .map(String::toLowerCase)
            .collect(Collectors.toSet());
        return !providers.contains(provider.toLowerCase());
    }

    @Override
    protected String getDefaultUsernameAttribute() {
        return IdTokenClaimNames.SUB;
    }

    @Override
    protected String getDefaultGroupsClaim() {
        return null;
    }
}
