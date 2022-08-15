package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;
import org.opendatadiscovery.oddplatform.mapper.AssociatedOwnerMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class IdentityServiceImpl implements IdentityService {
    private final AuthIdentityProvider authIdentityProvider;
    private final ReactiveUserOwnerMappingRepository userOwnerMappingRepository;
    private final AssociatedOwnerMapper associatedOwnerMapper;

    @Override
    public Mono<AssociatedOwner> whoami() {
        return authIdentityProvider
            .getUsername()
            .flatMap(this::getAssociatedOwner);
    }

    private Mono<AssociatedOwner> getAssociatedOwner(final String username) {
        return userOwnerMappingRepository.getAssociatedOwner(username)
            .map(owner -> associatedOwnerMapper.mapAssociatedOwner(new AssociatedOwnerDto(username, owner)))
            .switchIfEmpty(Mono.defer(
                () -> Mono.just(associatedOwnerMapper.mapAssociatedOwner(new AssociatedOwnerDto(username, null)))));
    }
}
