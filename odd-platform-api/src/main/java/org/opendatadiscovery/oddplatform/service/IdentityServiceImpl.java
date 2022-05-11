package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.Identity;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.mapper.OwnerMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.UserOwnerMappingRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class IdentityServiceImpl implements IdentityService {
    private final AuthIdentityProvider authIdentityProvider;
    private final UserOwnerMappingRepository userOwnerMappingRepository;
    private final OwnerMapper ownerMapper;
    private final OwnerService ownerService;

    @Override
    public Mono<AssociatedOwner> whoami() {
        return authIdentityProvider
            .getUsername()
            .flatMap(this::getAssociatedOwner);
    }

    @Override
    @ReactiveTransactional
    public Mono<AssociatedOwner> associateOwner(final OwnerFormData formData) {
        return Mono.zip(authIdentityProvider.getUsername(), ownerService.getOrCreate(formData.getName()))
            .flatMap(function((username, owner) -> userOwnerMappingRepository.deleteRelation(username)
                .thenReturn(Tuples.of(username, owner))))
            .flatMap(function((username, owner) -> userOwnerMappingRepository.createRelation(username, owner.getId())
                .thenReturn(Tuples.of(username, owner))))
            .map(function(this::mapAssociatedOwner));
    }

    private Mono<AssociatedOwner> getAssociatedOwner(final String username) {
        return userOwnerMappingRepository.getAssociatedOwner(username)
            .map(owner -> mapAssociatedOwner(username, owner))
            .switchIfEmpty(Mono.defer(() -> Mono.just(mapAssociatedOwner(username, null))));
    }

    private AssociatedOwner mapAssociatedOwner(final String username, final OwnerPojo owner) {
        return new AssociatedOwner()
            .owner(owner != null ? ownerMapper.mapToOwner(owner) : null)
            .identity(new Identity().username(username));
    }
}
