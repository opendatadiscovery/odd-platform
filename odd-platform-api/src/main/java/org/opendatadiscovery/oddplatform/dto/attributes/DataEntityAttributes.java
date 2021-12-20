package org.opendatadiscovery.oddplatform.dto.attributes;

import java.util.Map;
import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;

public abstract class DataEntityAttributes {
    public static final Map<DataEntityTypeDto, Class<? extends DataEntityAttributes>> TYPE_TO_ATTR_CLASS = Map.of(
        DataEntityTypeDto.DATA_SET, DataSetAttributes.class,
        DataEntityTypeDto.DATA_TRANSFORMER, DataTransformerAttributes.class,
        DataEntityTypeDto.DATA_CONSUMER, DataConsumerAttributes.class,
        DataEntityTypeDto.DATA_QUALITY_TEST, DataQualityTestAttributes.class,
        DataEntityTypeDto.DATA_ENTITY_GROUP, DataEntityGroupAttributes.class,
        DataEntityTypeDto.DATA_INPUT, DataInputAttributes.class
    );

    public abstract Set<String> getDependentOddrns();
}
