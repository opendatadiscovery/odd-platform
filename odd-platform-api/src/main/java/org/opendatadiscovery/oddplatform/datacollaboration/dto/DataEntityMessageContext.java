package org.opendatadiscovery.oddplatform.datacollaboration.dto;

import java.util.List;
import java.util.Set;
import javax.annotation.Nullable;
import lombok.Builder;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.OwnershipPair;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;

@Builder
public record DataEntityMessageContext(
    MessagePojo message,
    DataEntity dataEntity,
    List<String> degNames
) {
    @Builder
    public record DataEntity(long dataEntityId,
                             String dataEntityOddrn,
                             String dataEntityName,
                             @Nullable String dataSourceName,
                             @Nullable String namespaceName,
                             DataEntityTypeDto type,
                             Set<OwnershipPair> owners,
                             Set<String> tags
    ) {
    }
}
