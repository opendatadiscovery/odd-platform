package org.opendatadiscovery.oddplatform.service.permission.extractor;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.dto.policy.DataEntityPolicyResolverContext;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyTypeDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.PolicyMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTagRepository;
import org.opendatadiscovery.oddplatform.service.DataEntityService;
import org.opendatadiscovery.oddplatform.service.PolicyService;
import org.opendatadiscovery.oddplatform.service.policy.PolicyPermissionExtractor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

@Component
public class DataEntityPermissionExtractor
    extends AbstractContextualPermissionExtractor<DataEntityPolicyResolverContext> {
    private final PolicyPermissionExtractor policyPermissionExtractor;
    private final DataEntityService dataEntityService;
    private final ReactiveTagRepository tagRepository;
    private final AuthIdentityProvider authIdentityProvider;

    public DataEntityPermissionExtractor(final PolicyService policyService,
                                         final PolicyMapper policyMapper,
                                         final PolicyPermissionExtractor extractor,
                                         final DataEntityService dataEntityService,
                                         final ReactiveTagRepository tagRepository,
                                         final AuthIdentityProvider authIdentityProvider) {
        super(policyService, policyMapper);
        this.policyPermissionExtractor = extractor;
        this.dataEntityService = dataEntityService;
        this.tagRepository = tagRepository;
        this.authIdentityProvider = authIdentityProvider;
    }

    @Override
    public PolicyTypeDto getResourceType() {
        return PolicyTypeDto.DATA_ENTITY;
    }

    @Override
    protected Mono<DataEntityPolicyResolverContext> getContext(final long resourceId) {
        return authIdentityProvider.fetchAssociatedOwner()
            .flatMap(owner -> getDataEntityWithTags(resourceId)
                .map(tuple -> new DataEntityPolicyResolverContext(tuple.getT1(), tuple.getT2(), owner)))
            .switchIfEmpty(Mono.defer(() -> getDataEntityWithTags(resourceId)
                .map(tuple -> new DataEntityPolicyResolverContext(tuple.getT1(), tuple.getT2(), null))));
    }

    @Override
    protected Collection<PolicyPermissionDto> getPermissions(final PolicyDto policyDto,
                                                             final DataEntityPolicyResolverContext context) {
        return policyPermissionExtractor.extractDataEntityPermissions(policyDto.getStatements(), context);
    }

    private Mono<Tuple2<DataEntityDimensionsDto, List<TagPojo>>> getDataEntityWithTags(final long dataEntityId) {
        final Mono<DataEntityDimensionsDto> dtoMono = dataEntityService.getDimensions(dataEntityId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Data entity", dataEntityId)));
        final Mono<List<TagPojo>> tagsMono = tagRepository.listDataEntityDtos(dataEntityId)
            .map(tags -> tags.stream().map(TagDto::tagPojo).toList());
        return dtoMono.zipWith(tagsMono);
    }
}
