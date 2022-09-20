package org.opendatadiscovery.oddplatform.dto.security;

import java.util.Set;

public record UserDto(String username, Set<UserPermission> permissions) {
}
