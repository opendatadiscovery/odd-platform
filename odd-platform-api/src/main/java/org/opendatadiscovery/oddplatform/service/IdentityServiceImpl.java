package org.opendatadiscovery.oddplatform.service;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.Identity;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.mapper.OwnerMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.UserOwnerMappingRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class IdentityServiceImpl implements IdentityService {
    private final AuthIdentityProvider authIdentityProvider;
    private final UserOwnerMappingRepository userOwnerMappingRepository;
    private final OwnerMapper ownerMapper;

    @Override
    public Mono<AssociatedOwner> whoami() {
        return authIdentityProvider
            .getUsername()
            .map(username -> {
                final Optional<OwnerPojo> owner = userOwnerMappingRepository.getAssociatedOwner(username);
                return new AssociatedOwner()
                    .owner(owner.map(ownerMapper::mapPojo).orElse(null))
                    .identity(new Identity().username(username));
            });
    }

    @Override
    public Mono<AssociatedOwner> associateOwner(final OwnerFormData formData) {
        return authIdentityProvider.getUsername()
            .map(username -> {
                final OwnerPojo owner = userOwnerMappingRepository.createRelation(username, formData.getName());

                return new AssociatedOwner()
                    .owner(ownerMapper.mapPojo(owner))
                    .identity(new Identity().username(username));
            });
    }
}
