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
import org.opendatadiscovery.oddplatform.api.contract.model.IntegerFieldStat;
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

    public static DataSetFieldStat buildExpectedDataSetFieldStat(
        final org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldStat stat
    ) {
        return new DataSetFieldStat()
            .integerStats(
                new IntegerFieldStat()
                    .highValue(stat.getIntegerStats().getHighValue())
                    .lowValue(stat.getIntegerStats().getLowValue())
                    .meanValue(stat.getIntegerStats().getMeanValue())
                    .medianValue(stat.getIntegerStats().getMedianValue())
                    .nullsCount(stat.getIntegerStats().getNullsCount())
                    .uniqueCount(stat.getIntegerStats().getUniqueCount())
            )
            .stringStats(
                new StringFieldStat()
                    .avgLength(stat.getStringStats().getAvgLength())
                    .maxLength(stat.getStringStats().getMaxLength())
                    .nullsCount(stat.getStringStats().getNullsCount())
                    .uniqueCount(stat.getStringStats().getUniqueCount())
            )
            .binaryStats(
                new BinaryFieldStat()
                    .avgLength(stat.getBinaryStats().getAvgLength())
                    .maxLength(stat.getBinaryStats().getMaxLength())
                    .nullsCount(stat.getBinaryStats().getNullsCount())
                    .uniqueCount(stat.getBinaryStats().getUniqueCount())
            )
            .booleanStats(
                new BooleanFieldStat()
                    .falseCount(stat.getBooleanStats().getFalseCount())
                    .nullsCount(stat.getBooleanStats().getNullsCount())
                    .trueCount(stat.getBooleanStats().getTrueCount())
            )
            .complexStats(
                new ComplexFieldStat()
                    .nullsCount(stat.getComplexStats().getNullsCount())
                    .uniqueCount(stat.getComplexStats().getUniqueCount())
            )
            .datetimeStats(
                new DateTimeFieldStat()
                    .nullsCount(stat.getDatetimeStats().getNullsCount())
                    .uniqueCount(stat.getDatetimeStats().getUniqueCount())
                    .highValue(stat.getDatetimeStats().getHighValue())
                    .lowValue(stat.getDatetimeStats().getLowValue())
                    .meanValue(stat.getDatetimeStats().getMeanValue())
                    .medianValue(stat.getDatetimeStats().getMedianValue())
            )
            .numberStats(
                new NumberFieldStat()
                    .highValue(stat.getNumberStats().getHighValue())
                    .lowValue(stat.getNumberStats().getLowValue())
                    .meanValue(stat.getNumberStats().getMeanValue())
                    .medianValue(stat.getNumberStats().getMedianValue())
                    .nullsCount(stat.getNumberStats().getNullsCount())
                    .uniqueCount(stat.getNumberStats().getUniqueCount())
            );
    }

    public static DataSetField buildExpectedDataSetField(
        final org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField field
    ) {
        final DataSetFieldType expectedType = new DataSetFieldType()
            .logicalType(field.getType().getLogicalType())
            .type(DataSetFieldType.TypeEnum.fromValue(field.getType().getType().getValue()))
            .isNullable(field.getType().getIsNullable());

        final DataSetFieldStat stats = buildExpectedDataSetFieldStat(field.getStats());

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
