package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.Actions;
import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.security.UserPermission;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataEntitySecurityServiceImpl implements DataEntitySecurityService {
    private final AuthIdentityProvider authIdentityProvider;
    private final ReactiveDataEntityRepository dataEntityRepository;

    @Override
    public Mono<Actions> getActionsForCurrentUser(final long dataEntityId) {
        final Mono<Boolean> isUserCanEditEntities = authIdentityProvider.getPermissions()
            .map(permissions -> permissions.contains(UserPermission.DATA_ENTITY_EDIT))
            .defaultIfEmpty(false);
        final Mono<Boolean> isUserDataEntityOwner = authIdentityProvider.getUsername()
            .flatMap(username -> dataEntityRepository.userIsDataEntityOwner(dataEntityId, username))
            .defaultIfEmpty(false);
        return isUserCanEditEntities
            .filter(isAdmin -> isAdmin)
            .switchIfEmpty(isUserDataEntityOwner)
            .filter(isOwner -> isOwner)
            .map(isOwner -> new Actions().addAllowedItem(Permission.DATA_ENTITY_EDIT))
            .defaultIfEmpty(new Actions());
    }
}
