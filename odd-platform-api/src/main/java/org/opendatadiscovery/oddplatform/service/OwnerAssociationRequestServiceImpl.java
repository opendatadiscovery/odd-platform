package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestList;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestDto;
import org.opendatadiscovery.oddplatform.dto.security.UserDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.OwnerAssociationRequestMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.UserOwnerMappingPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerAssociationRequestRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import org.opendatadiscovery.oddplatform.service.permission.PermissionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.api.contract.model.PermissionResourceType.MANAGEMENT;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class OwnerAssociationRequestServiceImpl implements OwnerAssociationRequestService {
    private final OwnerService ownerService;
    private final ReactiveOwnerAssociationRequestRepository ownerAssociationRequestRepository;
    private final OwnerAssociationRequestMapper mapper;
    private final AuthIdentityProvider authIdentityProvider;
    private final ReactiveUserOwnerMappingRepository userOwnerMappingRepository;
    private final PermissionService permissionService;

    @Override
    @ReactiveTransactional
    public Mono<OwnerAssociationRequest> createOwnerAssociationRequest(final String ownerName) {
        final Mono<UserDto> currentUserMono = authIdentityProvider.getCurrentUser()
            .switchIfEmpty(Mono.error(() -> new RuntimeException("There is no current authorization")));
        final Mono<OwnerPojo> ownerMono = ownerService.getOrCreate(ownerName);
        final Mono<List<Permission>> permissionsMono = permissionService
            .getNonContextualPermissionsForCurrentUser(MANAGEMENT).collectList();
        return Mono.zip(currentUserMono, ownerMono, permissionsMono)
            .flatMap(function((user, ownerPojo, permissions) -> {
                if (permissions.contains(Permission.DIRECT_OWNER_SYNC)) {
                    return createRelation(user.username(), user.provider(), ownerPojo.getId())
                        .thenReturn(mapper.mapToApprovedRequest(user.username(), ownerPojo.getName()));
                } else {
                    return Mono.just(mapper.mapToPojo(user.username(), user.provider(), ownerPojo.getId()))
                        .flatMap(ownerAssociationRequestRepository::create)
                        .map(pojo -> mapper.mapToOwnerAssociationRequest(
                            new OwnerAssociationRequestDto(pojo, ownerName, null)));
                }
            }));
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
        final Mono<UserDto> currentUser = authIdentityProvider.getCurrentUser()
            .switchIfEmpty(Mono.error(() -> new RuntimeException("There is no current authorization")));
        return ownerAssociationRequestRepository.getDto(id)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Can't find request with id %s", id)))
            .zipWith(currentUser)
            .map(function((dto, user) -> mapper.applyToPojo(dto.pojo(), status, user.username(), LocalDateTime.now())))
            .flatMap(ownerAssociationRequestRepository::update)
            .flatMap(this::createMappingForApprovedRequest)
            .flatMap(pojo -> ownerAssociationRequestRepository.getDto(pojo.getId()))
            .map(mapper::mapToOwnerAssociationRequest);
    }

    private Mono<OwnerAssociationRequestPojo> createMappingForApprovedRequest(final OwnerAssociationRequestPojo pojo) {
        if (!pojo.getStatus().equals(OwnerAssociationRequestStatus.APPROVED.getValue())) {
            return Mono.just(pojo);
        }
        return createRelation(pojo.getUsername(), pojo.getProvider(), pojo.getOwnerId()).thenReturn(pojo);
    }

    private Mono<UserOwnerMappingPojo> createRelation(final String username,
                                                      final String provider,
                                                      final Long ownerId) {
        return userOwnerMappingRepository.deleteRelation(username, provider)
            .then(userOwnerMappingRepository.createRelation(username, provider, ownerId));
    }
}
