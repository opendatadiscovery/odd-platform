package org.opendatadiscovery.oddplatform.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class MetadataBinding {
    private final long dataEntityId;
    private final long metadataFieldId;
}
