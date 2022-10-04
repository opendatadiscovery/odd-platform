package org.opendatadiscovery.oddplatform.api.ingestion.utils;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.jeasy.random.EasyRandom;
import org.jeasy.random.randomizers.collection.MapRandomizer;
import org.jeasy.random.randomizers.text.StringRandomizer;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetadataExtension;

public class IngestionModelGenerator {
    private static final EasyRandom EASY_RANDOM = new EasyRandom();

    private static final MapRandomizer<String, String> MAP_RANDOMIZER =
        new MapRandomizer<>(new StringRandomizer(), new StringRandomizer());

    public static DataEntity generateSimpleDataEntity(final DataEntityType ingestionEntityType) {
        final String uuid = UUID.randomUUID().toString();

        return new DataEntity()
            .name(uuid)
            .oddrn(uuid)
            .metadata(List.of(EASY_RANDOM.nextObject(MetadataExtension.class).metadata(generateMetadataMap())))
            .type(ingestionEntityType)
            .createdAt(OffsetDateTime.of(LocalDateTime.now(), ZoneOffset.UTC).truncatedTo(ChronoUnit.MILLIS));
    }

    public static Map<String, Object> generateMetadataMap() {
        return MAP_RANDOMIZER.getRandomValue()
            .entrySet()
            .stream()
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    public static List<DataSetField> generateDatasetFields(final int size) {
        return EASY_RANDOM.objects(DataSetField.class, size).toList();
    }
}
