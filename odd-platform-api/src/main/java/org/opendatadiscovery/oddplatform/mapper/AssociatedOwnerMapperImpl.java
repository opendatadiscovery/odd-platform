package org.opendatadiscovery.oddplatform.mapper;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.Identity;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestDto;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AssociatedOwnerMapperImpl implements AssociatedOwnerMapper {
    private final OwnerMapper ownerMapper;
    private final ActionsMapper actionsMapper;

    @Override
    public AssociatedOwner mapAssociatedOwner(final AssociatedOwnerDto dto) {
        if (dto == null) {
            return null;
        }
        final Identity identity = new Identity()
            .actions(actionsMapper.mapToActions(dto.permissions()))
            .username(dto.username());
        return new AssociatedOwner()
            .owner(dto.owner() != null ? ownerMapper.mapToOwner(dto.owner()) : null)
            .identity(identity)
            .associationRequest(mapAssociationRequest(dto.lastRequestDto()));
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
