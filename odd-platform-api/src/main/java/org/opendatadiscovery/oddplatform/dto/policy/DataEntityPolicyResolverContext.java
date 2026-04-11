package org.opendatadiscovery.oddplatform.dto.policy;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;

public record DataEntityPolicyResolverContext(DataEntityDimensionsDto dataEntity,
                                              List<TagPojo> tags,
                                              OwnerPojo currentOwner) {
}