package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.Owner;
import com.provectus.oddplatform.api.contract.model.Ownership;
import com.provectus.oddplatform.api.contract.model.Role;
import com.provectus.oddplatform.dto.OwnershipDto;
import com.provectus.oddplatform.model.tables.pojos.OwnershipPojo;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OwnershipMapperImpl implements OwnershipMapper {
    private final RoleMapper roleMapper;
    private final OwnerMapper ownerMapper;

    @Override
    public Ownership mapDto(final OwnershipDto ownership) {
        return mapModel(
                ownership.getOwnership(),
                ownerMapper.mapPojo(ownership.getOwner()),
                roleMapper.mapPojo(ownership.getRole())
        );
    }

    @Override
    public List<Ownership> mapDtos(final List<OwnershipDto> ownership) {
        return ownership.stream().map(this::mapDto).collect(Collectors.toList());
    }

    @Override
    public Ownership mapModel(final OwnershipPojo ownership, final Owner owner, final Role role) {
        return new Ownership()
                .id(ownership.getId())
                .dataEntityId(ownership.getDataEntityId())
                .owner(owner)
                .role(role);
    }
}
