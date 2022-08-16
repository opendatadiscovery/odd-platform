package org.opendatadiscovery.oddplatform.mapper;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.Identity;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AssociatedOwnerMapperImpl implements AssociatedOwnerMapper {
    private final OwnerMapper ownerMapper;

    @Override
    public AssociatedOwner mapAssociatedOwner(final AssociatedOwnerDto dto) {
        if (dto == null) {
            return null;
        }
        return new AssociatedOwner()
            .owner(dto.owner() != null ? ownerMapper.mapToOwner(dto.owner()) : null)
            .identity(new Identity().username(dto.username()));
    }
}
