package org.opendatadiscovery.oddplatform.dto.policy;

import org.opendatadiscovery.oddplatform.dto.term.TermDetailsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;

public record TermPolicyResolverContext(TermDetailsDto detailsDto, OwnerPojo currentOwner) {
}
