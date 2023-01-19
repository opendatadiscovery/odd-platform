package org.opendatadiscovery.oddplatform.auth.handler.impl;

import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.opendatadiscovery.oddplatform.auth.Provider;
import org.opendatadiscovery.oddplatform.auth.condition.AzureCondition;
import org.opendatadiscovery.oddplatform.auth.handler.OAuthUserHandler;
import org.opendatadiscovery.oddplatform.auth.mapper.GrantedAuthorityExtractor;
import org.springframework.context.annotation.Conditional;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;

@Component
@Conditional(AzureCondition.class)
public class AzureUserHandler extends AbstractOIDCUserHandler
    implements OAuthUserHandler<OidcUser, OidcUserRequest> {

    public AzureUserHandler(final ODDOAuth2Properties properties,
                             final GrantedAuthorityExtractor authorityExtractor) {
        super(properties, authorityExtractor);
    }

    @Override
    public boolean shouldHandle(final String provider) {
        return StringUtils.isNotEmpty(provider) && provider.equalsIgnoreCase(Provider.AZURE.name());
    }

    @Override
    protected String getDefaultUsernameAttribute() {
        return "name";
    }

    @Override
    protected String getDefaultGroupsClaim() {
        return "roles";
    }
}
