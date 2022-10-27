package org.opendatadiscovery.oddplatform.auth.mapper;

import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.security.UserProviderRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Component
public class GrantedAuthorityExtractor {

    public Set<GrantedAuthority> getAuthorities(final boolean isAdmin) {
        if (isAdmin) {
            return Set.of(new SimpleGrantedAuthority(UserProviderRole.ADMIN.name()));
        }
        return Set.of(new SimpleGrantedAuthority(UserProviderRole.USER.name()));
    }
}
