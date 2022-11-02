package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.Identity;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestDto;
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
        final Identity identity = new Identity()
            .username(dto.username());
        return new AssociatedOwner()
            .owner(dto.owner() != null ? ownerMapper.mapFromPojo(dto.owner()) : null)
            .identity(identity)
            .associationRequest(mapAssociationRequest(dto.lastRequestDto()));
    }

    @Override
    public AssociatedOwner mapAssociatedOwnerWithPermissions(final AssociatedOwnerDto dto,
                                                             final List<Permission> permissions) {
        final AssociatedOwner associatedOwner = mapAssociatedOwner(dto);
        if (associatedOwner != null) {
            associatedOwner.getIdentity().setPermissions(permissions);
        }
        return associatedOwner;
    }

    private OwnerAssociationRequest mapAssociationRequest(final OwnerAssociationRequestDto dto) {
        if (dto == null) {
            return null;
        }
        return new OwnerAssociationRequest()
            .username(dto.pojo().getUsername())
            .ownerName(dto.ownerName())
            .status(OwnerAssociationRequestStatus.valueOf(dto.pojo().getStatus()));
    }
}
