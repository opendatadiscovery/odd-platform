package com.provectus.oddplatform.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class EnrichedDataEntityIngestionDto extends DataEntityIngestionDto {
    private long id;

    public EnrichedDataEntityIngestionDto(final long id, final DataEntityIngestionDto ingestionDto) {
        super(ingestionDto.name, ingestionDto.oddrn, ingestionDto.dataSourceId, ingestionDto.externalDescription,
                ingestionDto.createdAt, ingestionDto.updatedAt, ingestionDto.types, ingestionDto.subType,
                ingestionDto.metadata, ingestionDto.specificAttributesJson, ingestionDto.dataSet,
                ingestionDto.dataTransformer, ingestionDto.dataConsumer, ingestionDto.datasetQualityTest);

        this.id = id;
    }
}
