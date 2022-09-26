package org.opendatadiscovery.oddplatform.api.ingestion.utils;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.jeasy.random.EasyRandom;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetadataExtension;

public class IngestionModelGenerator {
    private final static EasyRandom EASY_RANDOM = new EasyRandom();

    public static DataEntity generateSimpleDataEntity(final DataEntityType ingestionEntityType) {
        final String uuid = UUID.randomUUID().toString();

        return new DataEntity()
            .name(uuid)
            .oddrn(uuid)
            .metadata(List.of(EASY_RANDOM.nextObject(MetadataExtension.class)))
            .type(ingestionEntityType)
            .createdAt(OffsetDateTime.of(LocalDateTime.now(), ZoneOffset.UTC));
    }

    public static List<DataSetField> generateDatasetFields(final int size) {
        return EASY_RANDOM.objects(DataSetField.class, size).toList();
    }
}
