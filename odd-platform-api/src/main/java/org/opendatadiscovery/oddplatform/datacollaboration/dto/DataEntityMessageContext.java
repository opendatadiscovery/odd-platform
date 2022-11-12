package org.opendatadiscovery.oddplatform.datacollaboration.dto;

import java.util.Set;
import javax.annotation.Nullable;
import lombok.Builder;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.OwnershipPair;

@Builder
public record DataEntityMessageContext(
    long dataEntityId,
    String dataEntityName,
    @Nullable String dataSourceName,
    @Nullable String namespaceName,
    DataEntityTypeDto type,
    Set<OwnershipPair> owners,
    Set<String> tags
) {
}
