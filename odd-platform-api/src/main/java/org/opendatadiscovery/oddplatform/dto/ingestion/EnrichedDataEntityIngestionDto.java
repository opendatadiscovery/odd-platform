package org.opendatadiscovery.oddplatform.dto.ingestion;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;

@EqualsAndHashCode(callSuper = true)
@Data
public class EnrichedDataEntityIngestionDto extends DataEntityIngestionDto {
    private long id;
    private DataEntityPojo previousVersionPojo;
    private Boolean datasetSchemaChanged;

    public EnrichedDataEntityIngestionDto(final long id,
                                          final DataEntityPojo previousVersionPojo,
                                          final DataEntityIngestionDto ingestionDto) {
        super(ingestionDto.name, ingestionDto.oddrn, ingestionDto.dataSourceId, ingestionDto.externalDescription,
            ingestionDto.sourceCreatedAt, ingestionDto.sourceUpdatedAt, ingestionDto.entityClasses, ingestionDto.type,
            ingestionDto.metadata, ingestionDto.tags, ingestionDto.specificAttributesJson, ingestionDto.dataSet,
            ingestionDto.dataTransformer, ingestionDto.dataConsumer, ingestionDto.dataQualityTest,
            ingestionDto.dataInput, ingestionDto.dataEntityGroup);

        this.id = id;
        this.previousVersionPojo = previousVersionPojo;
    }
}
