package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.model.tables.pojos.UserOwnerMappingPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UserOwnerMappingServiceImpl implements UserOwnerMappingService {
    private final ReactiveUserOwnerMappingRepository userOwnerMappingRepository;

    @Override
    public Mono<UserOwnerMappingPojo> createRelation(final String username, final String provider, final Long ownerId) {
        return userOwnerMappingRepository.deleteRelation(username, provider)
            .then(userOwnerMappingRepository.createRelation(username, provider, ownerId));
    }

    @Override
    public Mono<UserOwnerMappingPojo> deleteActiveUserRelation(final Long ownerId) {
        return userOwnerMappingRepository.deleteActiveRelationByOwner(ownerId);
    }
}
