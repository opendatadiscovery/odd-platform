package org.opendatadiscovery.oddplatform.auth;

import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.security.UserPermission;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import reactor.core.publisher.Mono;

public interface AuthIdentityProvider {
    Mono<String> getUsername();

    Mono<Set<UserPermission>> getPermissions();

    Mono<OwnerPojo> fetchAssociatedOwner();
}
