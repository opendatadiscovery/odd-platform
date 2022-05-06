package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.Set;
import org.apache.commons.collections4.CollectionUtils;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.opendatadiscovery.oddplatform.api.contract.model.Ownership;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.dto.term.TermOwnershipDto;

@Mapper(config = MapperConfig.class, uses = {
    OwnerMapper.class, RoleMapper.class
})
public interface OwnershipMapper {

    @Mapping(source = "ownership.id", target = "id")
    Ownership mapDto(final OwnershipDto ownership);

    @Mapping(source = "pojo.id", target = "id")
    Ownership mapDto(final TermOwnershipDto ownership);

    default List<Ownership> mapDtos(final List<OwnershipDto> ownership) {
        return CollectionUtils.isNotEmpty(ownership) ? ownership.stream().map(this::mapDto).toList() : null;
    }

    default List<Ownership> mapTermDtos(final Set<TermOwnershipDto> ownership) {
        return CollectionUtils.isNotEmpty(ownership) ? ownership.stream().map(this::mapDto).toList() : null;
    }
}
