package org.opendatadiscovery.oddplatform.auth.mapper;

import java.util.Set;
import java.util.stream.Collectors;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.dto.security.UserRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Component
public class GrantedAuthorityExtractor {

    public Set<GrantedAuthority> getAuthoritiesByUserRoles(final Set<UserRole> roles) {
        if (CollectionUtils.isEmpty(roles)) {
            return Set.of();
        }
        return roles.stream()
            .flatMap(r -> r.getPermissions().stream())
            .distinct()
            .map(up -> new SimpleGrantedAuthority(up.name()))
            .collect(Collectors.toSet());
    }
}
