package org.opendatadiscovery.oddplatform.dto.term;

import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermOwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;

public record TermOwnershipDto(TermOwnershipPojo pojo, OwnerPojo owner, TitlePojo title) {
}
