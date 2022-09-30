package org.opendatadiscovery.oddplatform.api.ingestion.utils;

import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.api.contract.model.BinaryFieldStat;
import org.opendatadiscovery.oddplatform.api.contract.model.BooleanFieldStat;
import org.opendatadiscovery.oddplatform.api.contract.model.ComplexFieldStat;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldStat;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DateTimeFieldStat;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataField;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldOrigin;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.api.contract.model.NumberFieldStat;
import org.opendatadiscovery.oddplatform.api.contract.model.StringFieldStat;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;

import static java.util.Collections.emptyList;

public class IngestionModelMapper {
    public static DataEntityDetails buildExpectedBaseDEDetails(final long entityId,
                                                               final DataEntity dataEntity,
                                                               final DataSource dataSource) {
        return new DataEntityDetails()
            .id(entityId)
            .createdAt(dataEntity.getCreatedAt())
            .dataSource(dataSource)
            .externalName(dataEntity.getName())
            .oddrn(dataEntity.getOddrn())
            .metadataFieldValues(buildExpectedMetadataFieldValue(dataEntity.getMetadata().get(0).getMetadata()))
            .dataEntityGroups(emptyList())
            .tags(emptyList())
            .terms(emptyList())
            .type(new DataEntityType().name(DataEntityType.NameEnum.fromValue(dataEntity.getType().getValue())));
    }

    public static DataSetField buildExpectedDataSetField(
        final org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField field
    ) {
        final DataSetFieldType expectedType = new DataSetFieldType()
            .logicalType(field.getType().getLogicalType())
            .type(DataSetFieldType.TypeEnum.fromValue(field.getType().getType().getValue()))
            .isNullable(field.getType().getIsNullable());

        final DataSetFieldStat stats = new DataSetFieldStat()
            .stringStats(
                new StringFieldStat()
                    .avgLength(field.getStats().getStringStats().getAvgLength())
                    .maxLength(field.getStats().getStringStats().getMaxLength())
                    .nullsCount(field.getStats().getStringStats().getNullsCount())
                    .uniqueCount(field.getStats().getStringStats().getUniqueCount())
            )
            .binaryStats(
                new BinaryFieldStat()
                    .avgLength(field.getStats().getBinaryStats().getAvgLength())
                    .maxLength(field.getStats().getBinaryStats().getMaxLength())
                    .nullsCount(field.getStats().getBinaryStats().getNullsCount())
                    .uniqueCount(field.getStats().getBinaryStats().getUniqueCount())
            )
            .booleanStats(
                new BooleanFieldStat()
                    .falseCount(field.getStats().getBooleanStats().getFalseCount())
                    .nullsCount(field.getStats().getBooleanStats().getNullsCount())
                    .trueCount(field.getStats().getBooleanStats().getTrueCount())
            )
            .complexStats(
                new ComplexFieldStat()
                    .nullsCount(field.getStats().getComplexStats().getNullsCount())
                    .uniqueCount(field.getStats().getComplexStats().getUniqueCount())
            )
            .datetimeStats(
                new DateTimeFieldStat()
                    .nullsCount(field.getStats().getDatetimeStats().getNullsCount())
                    .uniqueCount(field.getStats().getDatetimeStats().getUniqueCount())
                    .highValue(field.getStats().getDatetimeStats().getHighValue())
                    .lowValue(field.getStats().getDatetimeStats().getLowValue())
                    .meanValue(field.getStats().getDatetimeStats().getMeanValue())
                    .medianValue(field.getStats().getDatetimeStats().getMedianValue())
            )
            .numberStats(
                new NumberFieldStat()
                    .highValue(field.getStats().getNumberStats().getHighValue())
                    .lowValue(field.getStats().getNumberStats().getLowValue())
                    .meanValue(field.getStats().getNumberStats().getMeanValue())
                    .medianValue(field.getStats().getNumberStats().getMedianValue())
                    .nullsCount(field.getStats().getNumberStats().getNullsCount())
                    .uniqueCount(field.getStats().getNumberStats().getUniqueCount())
            );

        final List<Label> labels = field.getTags().stream()
            .map(d -> new Label().name(d.getName()).external(true))
            .toList();

        return new DataSetField()
            .name(field.getName())
            .oddrn(field.getOddrn())
            .externalDescription(field.getDescription())
            .type(expectedType)
            .stats(stats)
            .isKey(field.getIsKey())
            .labels(labels)
            .isValue(field.getIsValue())
            .isSortKey(field.getIsSortKey())
            .isPrimaryKey(field.getIsPrimaryKey())
            .enumValueCount(0);
    }

    public static List<MetadataFieldValue> buildExpectedMetadataFieldValue(final Map<String, Object> metadata) {
        return metadata.entrySet().stream()
            .map(e -> new MetadataFieldValue()
                .field(new MetadataField()
                    .name(e.getKey())
                    .origin(MetadataFieldOrigin.EXTERNAL)
                    .type(MetadataFieldType.STRING))
                .value(e.getValue().toString())
            )
            .toList();
    }
}
