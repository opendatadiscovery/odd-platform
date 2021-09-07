package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.AssociatedOwner;
import com.provectus.oddplatform.api.contract.model.Identity;
import com.provectus.oddplatform.api.contract.model.OwnerFormData;
import com.provectus.oddplatform.auth.AuthIdentityProvider;
import com.provectus.oddplatform.mapper.OwnerMapper;
import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import com.provectus.oddplatform.repository.UserOwnerMappingRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
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
