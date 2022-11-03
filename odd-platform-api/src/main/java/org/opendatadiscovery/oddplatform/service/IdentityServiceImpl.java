package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.PermissionResourceType;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestDto;
import org.opendatadiscovery.oddplatform.dto.security.UserDto;
import org.opendatadiscovery.oddplatform.mapper.AssociatedOwnerMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerAssociationRequestRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import org.opendatadiscovery.oddplatform.service.permission.PermissionService;
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
    private final PermissionService permissionService;

    @Override
    public Mono<AssociatedOwner> whoami() {
        return authIdentityProvider
            .getCurrentUser()
            .flatMap(this::getAssociatedOwner);
    }

    private Mono<AssociatedOwner> getAssociatedOwner(final UserDto userDto) {
        return Mono.zip(
                userOwnerMappingRepository.getAssociatedOwner(userDto.username(), userDto.provider())
                    .defaultIfEmpty(new OwnerPojo()),
                ownerAssociationRequestRepository.getLastRequestForUsername(userDto.username())
                    .defaultIfEmpty(new OwnerAssociationRequestDto(null, null, null)),
                permissionService.getNonContextualPermissionsForCurrentUser(PermissionResourceType.MANAGEMENT)
                    .collectList())
            .map(function((owner, request, permissions) -> {
                final AssociatedOwnerDto associatedOwnerDto = new AssociatedOwnerDto(
                    userDto.username(),
                    owner.getId() != null ? owner : null,
                    request.pojo() != null ? request : null
                );
                return associatedOwnerMapper.mapAssociatedOwnerWithPermissions(associatedOwnerDto, permissions);
            }));
    }
}
