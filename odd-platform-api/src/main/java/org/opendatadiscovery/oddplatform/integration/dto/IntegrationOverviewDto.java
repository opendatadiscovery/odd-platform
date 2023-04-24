package org.opendatadiscovery.oddplatform.integration.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.util.List;
import org.opendatadiscovery.oddplatform.integration.serde.IntegrationDeserializer;

@JsonDeserialize(using = IntegrationDeserializer.class)
public record IntegrationOverviewDto(IntegrationPreviewDto integration,
                                     List<IntegrationContentBlockDto> contentBlocks) {
}
