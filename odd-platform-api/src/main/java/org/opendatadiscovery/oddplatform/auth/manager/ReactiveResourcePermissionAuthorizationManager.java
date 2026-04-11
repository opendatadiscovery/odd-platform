package org.opendatadiscovery.oddplatform.auth.manager;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.PermissionResourceType;
import org.opendatadiscovery.oddplatform.auth.manager.extractor.ResourceExtractor;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto;
import org.opendatadiscovery.oddplatform.service.permission.PermissionService;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.ReactiveAuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.authorization.AuthorizationContext;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class ReactiveResourcePermissionAuthorizationManager
    implements ReactiveAuthorizationManager<AuthorizationContext> {
    private final PermissionService permissionService;
    private final ResourceExtractor resourceExtractor;
    private final String resourceIdVariableName;
    private final PolicyPermissionDto permission;

    @Override
    public Mono<AuthorizationDecision> check(final Mono<Authentication> authentication,
                                             final AuthorizationContext object) {
        final PermissionResourceType type = PermissionResourceType.fromValue(permission.getType().name());
        return resourceExtractor.extractResourceId(object, resourceIdVariableName)
            .flatMapMany(resourceId -> permissionService.getResourcePermissionsForCurrentUser(type, resourceId))
            .filter(p -> p.name().equals(permission.name()))
            .hasElements()
            .map(AuthorizationDecision::new)
            .switchIfEmpty(Mono.just(new AuthorizationDecision(false)));
    }
}
