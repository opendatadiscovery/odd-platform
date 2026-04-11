package org.opendatadiscovery.oddplatform.service.permission;

import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.api.contract.model.PermissionResourceType;
import reactor.core.publisher.Flux;

public interface PermissionService {
    Flux<Permission> getResourcePermissionsForCurrentUser(final PermissionResourceType resourceType,
                                                          final long resourceId);

    Flux<Permission> getNonContextualPermissionsForCurrentUser(final PermissionResourceType resourceType);
}
