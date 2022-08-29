package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;
import org.opendatadiscovery.oddplatform.mapper.AssociatedOwnerMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerAssociationRequestRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class IdentityServiceImpl implements IdentityService {
    private final AuthIdentityProvider authIdentityProvider;
    private final ReactiveUserOwnerMappingRepository userOwnerMappingRepository;
    private final ReactiveOwnerAssociationRequestRepository ownerAssociationRequestRepository;
    private final AssociatedOwnerMapper associatedOwnerMapper;

    @Override
    public Mono<AssociatedOwner> whoami() {
        return authIdentityProvider
            .getUsername()
            .flatMap(this::getAssociatedOwner);
    }

    private Mono<AssociatedOwner> getAssociatedOwner(final String username) {
        return Mono.zip(
                authIdentityProvider.getPermissions(),
                userOwnerMappingRepository.getAssociatedOwner(username)
                    .defaultIfEmpty(new OwnerPojo()),
                ownerAssociationRequestRepository.getLastRequestForUsername(username)
                    .defaultIfEmpty(new OwnerAssociationRequestPojo()))
            .map(function((permissions, owner, request) -> new AssociatedOwnerDto(
                username,
                owner.getId() != null ? owner : null,
                permissions,
                request.getStatus() != null ? OwnerAssociationRequestStatus.fromValue(request.getStatus()) : null
            )))
            .map(associatedOwnerMapper::mapAssociatedOwner);
    }
}
