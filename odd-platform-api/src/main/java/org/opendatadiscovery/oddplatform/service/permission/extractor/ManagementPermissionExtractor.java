package org.opendatadiscovery.oddplatform.service.permission.extractor;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyTypeDto;
import org.opendatadiscovery.oddplatform.mapper.PolicyMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.PolicyPojo;
import org.opendatadiscovery.oddplatform.service.PolicyService;
import org.opendatadiscovery.oddplatform.service.policy.PolicyPermissionExtractor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class ManagementPermissionExtractor implements NoContextPermissionExtractor {
    private final PolicyService policyService;
    private final PolicyMapper policyMapper;
    private final PolicyPermissionExtractor policyPermissionExtractor;

    @Override
    public PolicyTypeDto getResourceType() {
        return PolicyTypeDto.MANAGEMENT;
    }

    @Override
    public Flux<Permission> getNonContextualPermissions() {
        final Mono<List<PolicyPojo>> policiesMono = policyService.getCurrentUserPolicies();
        return policiesMono.flatMapIterable(policies -> {
            final List<PolicyDto> policyDtos = policyMapper.mapToPolicyDtos(policies);
            final Set<PolicyPermissionDto> permission = policyDtos.stream()
                .flatMap(p -> policyPermissionExtractor.extractManagementPermissions(p.getStatements()).stream())
                .collect(Collectors.toSet());
            return permission.stream().map(p -> Permission.fromValue(p.name())).collect(Collectors.toList());
        });
    }
}
