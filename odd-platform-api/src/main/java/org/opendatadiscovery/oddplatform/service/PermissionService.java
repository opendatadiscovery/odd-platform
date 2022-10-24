package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.api.contract.model.PermissionResourceType;
import reactor.core.publisher.Flux;

public interface PermissionService {
    Flux<Permission> getPermissionsForCurrentUser(final PermissionResourceType resourceType,
                                                  final long resourceId);
}
