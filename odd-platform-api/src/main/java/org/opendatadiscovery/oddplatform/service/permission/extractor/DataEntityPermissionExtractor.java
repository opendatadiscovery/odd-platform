package org.opendatadiscovery.oddplatform.service.permission.extractor;

import java.util.Collection;
import java.util.Optional;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.policy.DataEntityPolicyResolverContext;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyTypeDto;
import org.opendatadiscovery.oddplatform.mapper.PolicyMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.service.PolicyService;
import org.opendatadiscovery.oddplatform.service.policy.PolicyPermissionExtractor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Component
public class DataEntityPermissionExtractor
    extends AbstractContextualPermissionExtractor<DataEntityPolicyResolverContext> {
    private final PolicyPermissionExtractor policyPermissionExtractor;
    private final DataEntityRepository dataEntityRepository;
    private final AuthIdentityProvider authIdentityProvider;

    public DataEntityPermissionExtractor(final PolicyService policyService,
                                         final PolicyMapper policyMapper,
                                         final PolicyPermissionExtractor extractor,
                                         final DataEntityRepository dataEntityRepository,
                                         final AuthIdentityProvider authIdentityProvider) {
        super(policyService, policyMapper);
        this.policyPermissionExtractor = extractor;
        this.dataEntityRepository = dataEntityRepository;
        this.authIdentityProvider = authIdentityProvider;
    }

    @Override
    public PolicyTypeDto getResourceType() {
        return PolicyTypeDto.DATA_ENTITY;
    }

    @Override
    protected Mono<DataEntityPolicyResolverContext> getContext(final long resourceId) {
        final Mono<DataEntityDimensionsDto> dtoMono = Mono.fromCallable(() -> dataEntityRepository.get(resourceId))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .switchIfEmpty(Mono.error(
                () -> new IllegalArgumentException("Data entity with id %s is not present".formatted(resourceId))))
            .publishOn(Schedulers.boundedElastic());
        final Mono<OwnerPojo> ownerPojoMono = authIdentityProvider.fetchAssociatedOwner();
        return ownerPojoMono
            .zipWith(dtoMono)
            .map(tuple -> new DataEntityPolicyResolverContext(tuple.getT2(), tuple.getT1()))
            .switchIfEmpty(Mono.defer(() -> dtoMono.map(dto -> new DataEntityPolicyResolverContext(dto, null))));
    }

    @Override
    protected Collection<PolicyPermissionDto> getPermissions(final PolicyDto policyDto,
                                                             final DataEntityPolicyResolverContext context) {
        return policyPermissionExtractor.extractDataEntityPermissions(policyDto.getStatements(), context);
    }
}
