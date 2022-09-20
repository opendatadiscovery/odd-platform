package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
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
        return authIdentityProvider.getCurrentUser()
            .flatMap(userDto -> {
                if (userDto.permissions().contains(UserPermission.DATA_ENTITY_EDIT)) {
                    return Mono.just(true);
                }
                return dataEntityRepository.userIsDataEntityOwner(dataEntityId, userDto.username())
                    .defaultIfEmpty(false);
            })
            .filter(canEdit -> canEdit)
            .map(canEdit -> new Actions()
                .addAllowedItem(Permission.DATA_ENTITY_EDIT)
                .addAllowedItem(Permission.ALERT_PROCESSING))
            .defaultIfEmpty(new Actions());
    }
}
