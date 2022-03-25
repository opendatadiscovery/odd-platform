package org.opendatadiscovery.oddplatform.dto.attributes;

import java.util.Map;
import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;

public abstract class DataEntityAttributes {
    public static final Map<DataEntityClassDto, Class<? extends DataEntityAttributes>> TYPE_TO_ATTR_CLASS = Map.of(
        DataEntityClassDto.DATA_SET, DataSetAttributes.class,
        DataEntityClassDto.DATA_TRANSFORMER, DataTransformerAttributes.class,
        DataEntityClassDto.DATA_CONSUMER, DataConsumerAttributes.class,
        DataEntityClassDto.DATA_QUALITY_TEST, DataQualityTestAttributes.class,
        DataEntityClassDto.DATA_ENTITY_GROUP, DataEntityGroupAttributes.class,
        DataEntityClassDto.DATA_INPUT, DataInputAttributes.class
    );

    public abstract Set<String> getDependentOddrns();
}
