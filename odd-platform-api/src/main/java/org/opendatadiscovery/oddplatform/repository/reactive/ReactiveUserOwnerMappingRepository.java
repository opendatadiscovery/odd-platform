package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.RoleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.UserOwnerMappingPojo;
import reactor.core.publisher.Mono;

public interface ReactiveUserOwnerMappingRepository {
    Mono<UserOwnerMappingPojo> createRelation(final String oidcUsername,
                                              final String provider,
                                              final Long ownerId);

    Mono<UserOwnerMappingPojo> deleteRelation(final String oidcUsername,
                                              final String provider);

    Mono<OwnerPojo> getAssociatedOwner(final String oidcUsername,
                                       final String provider);

    Mono<Boolean> isOwnerAssociated(final Long ownerId);

    Mono<List<RoleDto>> getUserRolesByOwner(final String username, final String provider);
}
