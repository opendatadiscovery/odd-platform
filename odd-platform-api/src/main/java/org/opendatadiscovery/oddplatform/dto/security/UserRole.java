package org.opendatadiscovery.oddplatform.dto.security;

import java.util.Set;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import static org.opendatadiscovery.oddplatform.dto.security.UserPermission.ALERT_PROCESSING;
import static org.opendatadiscovery.oddplatform.dto.security.UserPermission.DATA_ENTITY_EDIT;
import static org.opendatadiscovery.oddplatform.dto.security.UserPermission.DIRECT_OWNER_SYNC;
import static org.opendatadiscovery.oddplatform.dto.security.UserPermission.MANAGEMENT_CONTROL;

@Getter
@RequiredArgsConstructor
public enum UserRole {
    ROLE_ADMIN(Set.of(MANAGEMENT_CONTROL, DATA_ENTITY_EDIT, DIRECT_OWNER_SYNC, ALERT_PROCESSING));

    private final Set<UserPermission> permissions;
}