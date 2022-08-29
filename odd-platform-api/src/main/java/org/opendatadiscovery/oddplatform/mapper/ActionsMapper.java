package org.opendatadiscovery.oddplatform.mapper;

import java.util.Set;
import org.mapstruct.Mapper;
import org.opendatadiscovery.oddplatform.api.contract.model.Actions;
import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.dto.security.UserPermission;

@Mapper(config = MapperConfig.class)
public interface ActionsMapper {

    Permission mapPermission(final UserPermission userPermission);

    default Actions mapToActions(final Set<UserPermission> permissions) {
        return new Actions().allowed(permissions.stream().map(this::mapPermission).toList());
    }
}
