package org.opendatadiscovery.oddplatform.service.permission.extractor;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyTypeDto;
import org.opendatadiscovery.oddplatform.dto.policy.QueryExamplePolicyResolverContext;
import org.opendatadiscovery.oddplatform.mapper.PolicyMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityQueryExampleRelationRepository;
import org.opendatadiscovery.oddplatform.service.PolicyService;
import org.opendatadiscovery.oddplatform.service.policy.PolicyPermissionExtractor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class QueryExamplePermissionExtractor
    extends AbstractContextualPermissionExtractor<QueryExamplePolicyResolverContext> {

    private final AuthIdentityProvider authIdentityProvider;
    private final ReactiveDataEntityQueryExampleRelationRepository repository;
    private final PolicyPermissionExtractor permissionExtractor;

    public QueryExamplePermissionExtractor(final PolicyService policyService,
                                           final PolicyMapper policyMapper,
                                           final AuthIdentityProvider authIdentityProvider,
                                           final ReactiveDataEntityQueryExampleRelationRepository repository,
                                           final PolicyPermissionExtractor permissionExtractor) {
        super(policyService, policyMapper);
        this.authIdentityProvider = authIdentityProvider;
        this.repository = repository;
        this.permissionExtractor = permissionExtractor;
    }

    @Override
    protected Mono<QueryExamplePolicyResolverContext> getContext(final long resourceId) {
        final Mono<QueryExampleDto> dtoMono = repository.getQueryExampleDatasetRelations(resourceId);

        final Mono<OwnerPojo> ownerPojoMono = authIdentityProvider.fetchAssociatedOwner();
        return ownerPojoMono
            .zipWith(dtoMono)
            .map(tuple
                -> new QueryExamplePolicyResolverContext(tuple.getT2(), tuple.getT1()))
            .switchIfEmpty(Mono.defer(()
                -> dtoMono.map(dto -> new QueryExamplePolicyResolverContext(dto, null))));
    }

    @Override
    protected Collection<PolicyPermissionDto> getPermissions(final PolicyDto policyDto,
                                                             final QueryExamplePolicyResolverContext context) {
        return permissionExtractor.extractQueryExamplePermissions(policyDto.getStatements(), context);
    }

    @Override
    public PolicyTypeDto getResourceType() {
        return PolicyTypeDto.QUERY_EXAMPLE;
    }
}
