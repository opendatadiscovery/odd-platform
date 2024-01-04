package org.opendatadiscovery.oddplatform.dto.policy;

import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;

public record QueryExamplePolicyResolverContext(QueryExampleDto detailsDto, OwnerPojo currentOwner) {
}