package org.opendatadiscovery.oddplatform.dto.policy;

import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;

public record DataEntityPolicyResolverContext(DataEntityDimensionsDto dataEntity, OwnerPojo currentOwner) {
}
