package org.opendatadiscovery.oddplatform.mapper;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.Identity;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
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
            .ownerId(dto.ownerId())
            .roles(rolePojoCollectionToRoleList(dto.roles()))
            .status(OwnerAssociationRequestStatus.valueOf(dto.pojo().getStatus()));
    }

    private List<Role> rolePojoCollectionToRoleList(final Collection<RolePojo> collection) {
        if (collection == null || collection.isEmpty()) {
            return null;
        }

        return collection.stream().map(rolePojo -> new Role().id(rolePojo.getId()).name(rolePojo.getName()))
            .collect(Collectors.toCollection(() -> new ArrayList<>(collection.size())));
    }
}
