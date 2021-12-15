package org.opendatadiscovery.oddplatform.dto.attributes;

import java.util.Map;
import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.DataEntityType;

public abstract class DataEntityAttributes {
    public static final Map<DataEntityType, Class<? extends DataEntityAttributes>> TYPE_TO_ATTR_CLASS = Map.of(
        DataEntityType.DATA_SET, DataSetAttributes.class,
        DataEntityType.DATA_TRANSFORMER, DataTransformerAttributes.class,
        DataEntityType.DATA_CONSUMER, DataConsumerAttributes.class,
        DataEntityType.DATA_QUALITY_TEST, DataQualityTestAttributes.class,
        DataEntityType.DATA_INPUT, DataInputAttributes.class
    );

    public abstract Set<String> getDependentOddrns();
}
