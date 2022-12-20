package org.opendatadiscovery.oddplatform.service.permission.extractor;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.policy.DataEntityPolicyResolverContext;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyTypeDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.PolicyMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.service.DataEntityService;
import org.opendatadiscovery.oddplatform.service.PolicyService;
import org.opendatadiscovery.oddplatform.service.policy.PolicyPermissionExtractor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class DataEntityPermissionExtractor
    extends AbstractContextualPermissionExtractor<DataEntityPolicyResolverContext> {
    private final PolicyPermissionExtractor policyPermissionExtractor;
    private final DataEntityService dataEntityService;
    private final AuthIdentityProvider authIdentityProvider;

    public DataEntityPermissionExtractor(final PolicyService policyService,
                                         final PolicyMapper policyMapper,
                                         final PolicyPermissionExtractor extractor,
                                         final DataEntityService dataEntityService,
                                         final AuthIdentityProvider authIdentityProvider) {
        super(policyService, policyMapper);
        this.policyPermissionExtractor = extractor;
        this.dataEntityService = dataEntityService;
        this.authIdentityProvider = authIdentityProvider;
    }

    @Override
    public PolicyTypeDto getResourceType() {
        return PolicyTypeDto.DATA_ENTITY;
    }

    @Override
    protected Mono<DataEntityPolicyResolverContext> getContext(final long resourceId) {
        final Mono<DataEntityDimensionsDto> dtoMono = dataEntityService.getDimensions(resourceId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Data entity", resourceId)));
        final Mono<OwnerPojo> ownerPojoMono = authIdentityProvider.fetchAssociatedOwner();
        return ownerPojoMono.zipWith(dtoMono)
            .map(tuple -> new DataEntityPolicyResolverContext(tuple.getT2(), tuple.getT1()))
            .switchIfEmpty(Mono.defer(() -> dtoMono.map(dto -> new DataEntityPolicyResolverContext(dto, null))));
    }

    @Override
    protected Collection<PolicyPermissionDto> getPermissions(final PolicyDto policyDto,
                                                             final DataEntityPolicyResolverContext context) {
        return policyPermissionExtractor.extractDataEntityPermissions(policyDto.getStatements(), context);
    }
}
