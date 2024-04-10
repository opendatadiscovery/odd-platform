package org.opendatadiscovery.oddplatform.service;

import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestList;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatusParam;
import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.api.contract.model.ProviderList;
import org.opendatadiscovery.oddplatform.api.contract.model.UserOwnerMappingFormData;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.auth.Provider;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestDto;
import org.opendatadiscovery.oddplatform.dto.OwnerDto;
import org.opendatadiscovery.oddplatform.dto.security.UserDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.OwnerAssociationRequestMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerAssociationRequestRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.opendatadiscovery.oddplatform.service.permission.PermissionService;
import org.opendatadiscovery.oddplatform.utils.ProviderUtils;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.api.contract.model.PermissionResourceType.MANAGEMENT;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class OwnerAssociationRequestServiceImpl implements OwnerAssociationRequestService {
    private final OwnerService ownerService;
    private final ReactiveOwnerRepository ownerRepository;
    private final ReactiveOwnerAssociationRequestRepository ownerAssociationRequestRepository;
    private final AuthIdentityProvider authIdentityProvider;
    private final UserOwnerMappingService userOwnerMappingService;
    private final PermissionService permissionService;
    private final OwnerAssociationRequestMapper mapper;
    private final ProviderUtils providerUtils;

    @Override
    @ReactiveTransactional
    public Mono<OwnerAssociationRequest> createOwnerAssociationRequest(final String ownerName) {
        final Mono<UserDto> currentUserMono = authIdentityProvider.getCurrentUser()
            .switchIfEmpty(Mono.error(() -> new RuntimeException("There is no current authorization")));
        final Mono<OwnerDto> ownerMono = ownerService.getOrCreate(ownerName)
            .flatMap(item -> ownerRepository.getDto(item.getId()));

        final Mono<List<Permission>> permissionsMono = permissionService
            .getNonContextualPermissionsForCurrentUser(MANAGEMENT).collectList();
        return Mono.zip(currentUserMono, ownerMono, permissionsMono)
            .flatMap(function((user, owner, permissions) -> {
                if (permissions.contains(Permission.DIRECT_OWNER_SYNC)) {
                    return userOwnerMappingService.createRelation(user.username(), user.provider(),
                            owner.ownerPojo().getId())
                        .thenReturn(mapper.mapToApprovedRequest(user.username(), owner.ownerPojo().getName()));
                } else {
                    return Mono.just(mapper.mapToPojo(user.username(), user.provider(), owner.ownerPojo().getId()))
                        .flatMap(ownerAssociationRequestRepository::create)
                        .map(pojo -> mapper.mapToOwnerAssociationRequest(
                            new OwnerAssociationRequestDto(pojo, ownerName, owner.ownerPojo().getId(), owner.roles(),
                                null)));
                }
            }));
    }

    @Override
    public Mono<OwnerAssociationRequestList>
        getOwnerAssociationRequestList(final int page,
                                       final int size,
                                       final String query,
                                       final OwnerAssociationRequestStatusParam status) {
        return ownerAssociationRequestRepository.getDtoList(page, size, query, status)
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
            .map(function(
                (dto, user) -> mapper.applyToPojo(dto.pojo(), status, user.username(), DateTimeUtil.generateNow())))
            .flatMap(ownerAssociationRequestRepository::update)
            .flatMap(this::createMappingForApprovedRequest)
            .flatMap(this::cancelCollisionAssociationByIdForApprovedRequest)
            .flatMap(pojo -> ownerAssociationRequestRepository.getDto(pojo.getId()))
            .map(mapper::mapToOwnerAssociationRequest);
    }

    @Override
    @ReactiveTransactional
    public Mono<Owner> createUserOwnerMapping(final UserOwnerMappingFormData form) {
        return createManualAssociationRequest(form.getOidcUsername(), form.getProvider(),
                form.getOwnerId())
            .then(userOwnerMappingService.createRelation(form.getOidcUsername(), form.getProvider(), form.getOwnerId()))
            .then(ownerService.getOwnerDtoById(form.getOwnerId()));
    }

    @Override
    @ReactiveTransactional
    public Mono<Owner> deleteActiveUserOwnerMapping(final Long ownerId) {
        return cancelAssociationByOwnerId(ownerId)
            .then(userOwnerMappingService.deleteActiveUserRelation(ownerId))
            .then(ownerService.getOwnerDtoById(ownerId));
    }

    @Override
    public Mono<ProviderList> getAuthProviders() {
        return Mono.just(new ProviderList()
            .defaultProviders(Arrays.stream(Provider.values()).map(value -> value.name().toLowerCase()).toList())
            .activeProviders(providerUtils.getRegisteredProviders()));
    }

    private Mono<OwnerAssociationRequestPojo> createManualAssociationRequest(final String oidcUsername,
                                                                             final String provider,
                                                                             final Long ownerId) {
        final Mono<UserDto> currentUserMono = authIdentityProvider.getCurrentUser()
            .switchIfEmpty(Mono.error(() -> new RuntimeException("There is no current authorization")));

        return currentUserMono.flatMap(user -> {
            final OwnerAssociationRequestPojo association = mapper.mapToPojo(oidcUsername, provider, ownerId);

            association.setStatus(OwnerAssociationRequestStatus.APPROVED.getValue());
            association.setStatusUpdatedBy(user.username());
            association.setStatusUpdatedAt(DateTimeUtil.generateNow());

            return ownerAssociationRequestRepository.cancelAssociationByOwnerId(ownerId, user.username())
                .then(ownerAssociationRequestRepository.cancelAssociationByUsername(oidcUsername, user.username()))
                .then(ownerAssociationRequestRepository.create(association));
        });
    }

    private Mono<OwnerAssociationRequestPojo> cancelAssociationByOwnerId(final Long ownerId) {
        final Mono<UserDto> currentUserMono = authIdentityProvider.getCurrentUser()
            .switchIfEmpty(Mono.error(() -> new RuntimeException("There is no current authorization")));

        return currentUserMono.flatMap(
            user -> ownerAssociationRequestRepository.cancelAssociationByOwnerId(ownerId, user.username()));
    }

    private Mono<OwnerAssociationRequestPojo> createMappingForApprovedRequest(final OwnerAssociationRequestPojo pojo) {
        if (!pojo.getStatus().equals(OwnerAssociationRequestStatus.APPROVED.getValue())) {
            return Mono.just(pojo);
        }
        return userOwnerMappingService.createRelation(pojo.getUsername(), pojo.getProvider(), pojo.getOwnerId())
            .thenReturn(pojo);
    }

    private Mono<OwnerAssociationRequestPojo> cancelCollisionAssociationByIdForApprovedRequest(
        final OwnerAssociationRequestPojo pojo) {
        if (!pojo.getStatus().equals(OwnerAssociationRequestStatus.APPROVED.getValue())) {
            return Mono.just(pojo);
        }

        return ownerAssociationRequestRepository.cancelCollisionAssociationById(pojo)
            .thenReturn(pojo);
    }
}
