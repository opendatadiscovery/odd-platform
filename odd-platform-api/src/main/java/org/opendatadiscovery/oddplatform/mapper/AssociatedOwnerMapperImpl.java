package org.opendatadiscovery.oddplatform.mapper;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.Identity;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AssociatedOwnerMapperImpl implements AssociatedOwnerMapper {
    private final OwnerMapper ownerMapper;

    @Override
    public AssociatedOwner mapAssociatedOwner(final String username, final OwnerPojo owner) {
        return new AssociatedOwner()
            .owner(owner != null ? ownerMapper.mapToOwner(owner) : null)
            .identity(new Identity().username(username));
    }
}
