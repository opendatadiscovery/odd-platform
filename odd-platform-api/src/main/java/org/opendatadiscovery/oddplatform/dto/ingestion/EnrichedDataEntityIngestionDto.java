package org.opendatadiscovery.oddplatform.dto.ingestion;

import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class EnrichedDataEntityIngestionDto extends DataEntityIngestionDto {
    private long id;
    private boolean updated;

    private Boolean datasetSchemaChanged;

    public EnrichedDataEntityIngestionDto(final long id, final DataEntityIngestionDto ingestionDto) {
        this(id, ingestionDto, true);
    }

    public EnrichedDataEntityIngestionDto(final long id,
                                          final DataEntityIngestionDto ingestionDto,
                                          final boolean updated) {
        super(ingestionDto.name, ingestionDto.oddrn, ingestionDto.dataSourceId, ingestionDto.externalDescription,
            ingestionDto.createdAt, ingestionDto.updatedAt, ingestionDto.entityClasses, ingestionDto.type,
            ingestionDto.metadata, ingestionDto.tags, ingestionDto.specificAttributesJson, ingestionDto.dataSet,
            ingestionDto.dataTransformer, ingestionDto.dataConsumer, ingestionDto.datasetQualityTest,
            ingestionDto.dataInput, ingestionDto.dataEntityGroup);

        this.id = id;
        this.updated = updated;
    }
}
