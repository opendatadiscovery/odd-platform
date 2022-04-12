package org.opendatadiscovery.oddplatform.dto.term;

import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;

public record TermOwnershipDto(OwnerPojo owner, RolePojo role) {
}
