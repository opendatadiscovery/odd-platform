package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.Owner;
import com.provectus.oddplatform.api.contract.model.Ownership;
import com.provectus.oddplatform.api.contract.model.Role;
import com.provectus.oddplatform.dto.OwnershipDto;
import com.provectus.oddplatform.model.tables.pojos.OwnershipPojo;

import java.util.List;

public interface OwnershipMapper {
    Ownership mapDto(final OwnershipDto ownership);

    List<Ownership> mapDtos(final List<OwnershipDto> ownership);

    Ownership mapModel(final OwnershipPojo ownership, final Owner owner, final Role role);
}
