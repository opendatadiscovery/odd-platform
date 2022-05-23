package org.opendatadiscovery.oddplatform.dto.term;

import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermOwnershipPojo;

public record TermOwnershipDto(TermOwnershipPojo pojo, OwnerPojo owner, RolePojo role) {
}
