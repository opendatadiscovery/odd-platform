package org.opendatadiscovery.oddplatform.dto.security;

import java.util.Set;

public record UserDto(String username,
                      String provider,
                      Set<UserPermission> permissions) {
}
