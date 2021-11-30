package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.Ownership;
import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;

public interface OwnershipMapper {
    Ownership mapDto(final OwnershipDto ownership);

    List<Ownership> mapDtos(final List<OwnershipDto> ownership);

    Ownership mapModel(final OwnershipPojo ownership, final Owner owner, final Role role);
}
