package org.opendatadiscovery.oddplatform.api.ingestion.utils;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.jeasy.random.EasyRandom;
import org.jeasy.random.randomizers.collection.MapRandomizer;
import org.jeasy.random.randomizers.text.StringRandomizer;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldEnumValue;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldStat;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetStatistics;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DatasetStatisticsList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetadataExtension;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Tag;

import static java.util.stream.Collectors.toMap;

public class IngestionModelGenerator {
    private static final EasyRandom EASY_RANDOM = new EasyRandom();

    private static final MapRandomizer<String, String> MAP_RANDOMIZER =
        new MapRandomizer<>(new StringRandomizer(), new StringRandomizer());

    public static DataEntity generateSimpleDataEntity(final DataEntityType ingestionEntityType) {
        final String uuid = UUID.randomUUID().toString();

        return new DataEntity()
            .name(uuid)
            .oddrn(uuid)
            .metadata(generateMetadataExtension())
            .type(ingestionEntityType)
            .createdAt(OffsetDateTime.of(LocalDateTime.now(), ZoneOffset.UTC).truncatedTo(ChronoUnit.MILLIS));
    }

    public static List<MetadataExtension> generateMetadataExtension() {
        return List.of(EASY_RANDOM.nextObject(MetadataExtension.class).metadata(generateMetadataMap()));
    }

    public static Map<String, Object> generateMetadataMap() {
        return MAP_RANDOMIZER.getRandomValue()
            .entrySet()
            .stream()
            .collect(toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    public static List<DataSetField> generateDatasetFields(final int size) {
        return EASY_RANDOM.objects(DataSetField.class, size)
            .peek(df -> df.setEnumValues(null))
            .toList();
    }

    public static DataSetFieldStat generateDataSetFieldStat(final List<String> labels) {
        return EASY_RANDOM
            .nextObject(DataSetFieldStat.class)
            .tags(labels.stream().map(l -> new Tag().name(l)).toList());
    }

    public static List<DataSetFieldEnumValue> generateDataSetFieldEnumValues(final int size) {
        return EASY_RANDOM.objects(DataSetFieldEnumValue.class, size).toList();
    }

    public static DatasetStatisticsList generateDatasetStatisticsList(
        final String datasetOddrn,
        final Map<String, List<String>> fieldsToLabelNames
    ) {
        final Map<String, DataSetFieldStat> fieldStats = fieldsToLabelNames.entrySet()
            .stream()
            .collect(toMap(Map.Entry::getKey, e -> generateDataSetFieldStat(e.getValue())));

        return new DatasetStatisticsList()
            .items(List.of(new DataSetStatistics().datasetOddrn(datasetOddrn).fields(fieldStats)));
    }

    public static List<Tag> generateDataSetFieldLabels(final int count) {
        return EASY_RANDOM.objects(Tag.class, count).toList();
    }
}
