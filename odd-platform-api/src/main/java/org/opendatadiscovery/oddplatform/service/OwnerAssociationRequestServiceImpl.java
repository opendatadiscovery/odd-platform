package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestList;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.OwnerAssociationRequestMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerAssociationRequestRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class OwnerAssociationRequestServiceImpl implements OwnerAssociationRequestService {
    private final OwnerService ownerService;
    private final ReactiveOwnerAssociationRequestRepository ownerAssociationRequestRepository;
    private final OwnerAssociationRequestMapper mapper;
    private final AuthIdentityProvider authIdentityProvider;
    private final ReactiveUserOwnerMappingRepository userOwnerMappingRepository;

    @Override
    @ReactiveTransactional
    public Mono<OwnerAssociationRequest> createOwnerAssociationRequest(final String ownerName) {
        return authIdentityProvider.getUsername()
            .switchIfEmpty(Mono.error(() -> new RuntimeException("There is no current authorization")))
            .zipWith(ownerService.getOrCreate(ownerName))
            .map(function((username, ownerPojo) -> mapper.mapToPojo(username, ownerPojo.getId())))
            .flatMap(ownerAssociationRequestRepository::create)
            .map(pojo -> mapper.mapToOwnerAssociationRequest(new OwnerAssociationRequestDto(pojo, ownerName, null)));
    }

    @Override
    public Mono<OwnerAssociationRequestList> getOwnerAssociationRequestList(final int page,
                                                                            final int size,
                                                                            final String query,
                                                                            final Boolean active) {
        return ownerAssociationRequestRepository.getDtoList(page, size, query, active)
            .map(mapper::mapPage);
    }

    @Override
    @ReactiveTransactional
    public Mono<OwnerAssociationRequest> updateOwnerAssociationRequest(final long id,
                                                                       final OwnerAssociationRequestStatus status) {
        final Mono<String> currentUser = authIdentityProvider.getUsername()
            .switchIfEmpty(Mono.error(() -> new RuntimeException("There is no current authorization")));
        return ownerAssociationRequestRepository.getDto(id)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Can't find request with id %s", id)))
            .zipWith(currentUser)
            .map(function((dto, user) -> mapper.applyToPojo(dto.pojo(), status, user, LocalDateTime.now())))
            .flatMap(ownerAssociationRequestRepository::update)
            .flatMap(this::createMappingForApprovedRequest)
            .flatMap(pojo -> ownerAssociationRequestRepository.getDto(pojo.getId()))
            .map(mapper::mapToOwnerAssociationRequest);
    }

    private Mono<OwnerAssociationRequestPojo> createMappingForApprovedRequest(final OwnerAssociationRequestPojo pojo) {
        if (!pojo.getStatus().equals(OwnerAssociationRequestStatus.APPROVED.getValue())) {
            return Mono.just(pojo);
        }
        return userOwnerMappingRepository.deleteRelation(pojo.getUsername())
            .then(userOwnerMappingRepository.createRelation(pojo.getUsername(), pojo.getOwnerId()))
            .thenReturn(pojo);
    }
}
