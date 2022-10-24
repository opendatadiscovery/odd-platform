package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.api.contract.model.PermissionResourceType;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.mapper.PolicyMapper;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactivePolicyRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {
    private final AuthIdentityProvider authIdentityProvider;
    private final DataEntityRepository dataEntityRepository;
    private final ReactivePolicyRepository policyRepository;
    //private final PolicyPermissionExtractor policyPermissionExtractor;
    private final PolicyMapper policyMapper;

    @Override
    public Flux<Permission> getPermissionsForCurrentUser(final PermissionResourceType resourceType,
                                                         final long resourceId) {
        return Flux.empty();
//        return switch (resourceType) {
//            case DATA_ENTITY:
//                yield getPermissionsForDataEntity(resourceId);
//            case TERM:
//                yield getPermissionsForTerm(resourceId);
//            case DATASOURCE:
//                yield getPermissionsForDatasource(resourceId);
//            case COLLECTOR:
//                yield getPermissionsForCollector(resourceId);
//        };
    }
//        final Mono<DataEntityDimensionsDto> deMono = Mono.fromCallable(() -> dataEntityRepository.get(dataEntityId))
//            .filter(Optional::isPresent)
//            .map(Optional::get)
//            .switchIfEmpty(Mono.error(
//                () -> new IllegalArgumentException("Data entity with id %s is not present".formatted(dataEntityId))))
//            .publishOn(Schedulers.boundedElastic());
//        final Mono<OwnerPojo> ownerPojoMono = authIdentityProvider.fetchAssociatedOwner();
//        final Mono<List<PolicyPojo>> policiesMono = authIdentityProvider.getCurrentUser()
//            .flatMap(userDto -> policyRepository.getUserPolicies(userDto.username(), userDto.provider()));
//        return Mono.zip(deMono, ownerPojoMono, policiesMono)
//            .map(function((dataEntity, owner, policies) -> {
//                final List<PolicyDto> policyDtos = policyMapper.mapToPolicyDtos(policies);
//                final Set<PolicyPermissionDto> permission = policyDtos.stream()
//                    .flatMap(p -> policyResourceValidator.permissionsDataEntity(p.getStatements(),
//                        new DataEntityPolicyResolverContext(dataEntity, owner)).stream())
//                    .collect(Collectors.toSet());
//                return new Actions().allowed(permission.stream().map(p -> Permission.fromValue(p.name())).toList());
//            }));

    private Flux<Permission> getPermissionsForCollector(final long collectorId) {
        return Flux.empty();
    }

    private Flux<Permission> getPermissionsForDatasource(final long dataSourceId) {
        return Flux.empty();
    }

    private Flux<Permission> getPermissionsForTerm(final long termId) {
        return Flux.empty();
    }

    private Flux<Permission> getPermissionsForDataEntity(final long dataEntityId) {
        return Flux.empty();
    }
}
