package org.opendatadiscovery.oddplatform.dto.ingestion;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldEnumValue;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipPojo;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DataEntityIngestionDto {
    protected String name;
    protected String oddrn;
    protected long dataSourceId;
    protected String externalDescription;
    protected OffsetDateTime sourceCreatedAt;
    protected OffsetDateTime sourceUpdatedAt;
    protected Set<DataEntityClassDto> entityClasses;
    protected DataEntityTypeDto type;
    protected Map<String, Object> metadata;
    protected List<String> tags;
    protected String specificAttributesJson;

    protected DataSetIngestionDto dataSet;
    protected DataTransformerIngestionDto dataTransformer;
    protected DataConsumerIngestionDto dataConsumer;
    protected DataQualityTestIngestionDto dataQualityTest;
    protected DataInputIngestionDto dataInput;
    protected DataEntityGroupDto dataEntityGroup;

    public record DataSetIngestionDto(String parentDatasetOddrn,
                                      List<DatasetFieldIngestionDto> fieldList,
                                      String structureHash,
                                      Long rowsCount,
                                      Map<RelationshipPojo, List<ErdRelationshipPojo>> erdRelationDto,
                                      Map<RelationshipPojo, GraphRelationshipPojo> graphRelationDto) {
    }

    public record DataTransformerIngestionDto(List<String> sourceList, List<String> targetList) {
    }

    public record DataConsumerIngestionDto(List<String> inputList) {
    }

    public record DataQualityTestIngestionDto(List<String> datasetList) {
    }

    public record DataInputIngestionDto(List<String> outputs) {
    }

    public record DataEntityGroupDto(List<String> entitiesOddrns, String groupOddrn) {
    }

    public record DatasetFieldIngestionDto(DatasetFieldPojo field,
                                           List<String> tags,
                                           List<DataSetFieldEnumValue> enumValues,
                                           Map<String, Object> metadata) {
    }
}
