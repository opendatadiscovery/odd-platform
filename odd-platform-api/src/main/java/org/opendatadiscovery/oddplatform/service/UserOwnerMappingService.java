package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.model.tables.pojos.UserOwnerMappingPojo;
import reactor.core.publisher.Mono;

public interface UserOwnerMappingService {

    Mono<UserOwnerMappingPojo> createRelation(final String username,
                                              final String provider,
                                              final Long ownerId);

    Mono<UserOwnerMappingPojo> deleteActiveUserRelation(final Long ownerId);
}
