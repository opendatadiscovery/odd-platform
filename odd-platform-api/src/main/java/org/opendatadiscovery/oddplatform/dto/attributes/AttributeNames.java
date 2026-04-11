package org.opendatadiscovery.oddplatform.dto.attributes;

import lombok.experimental.UtilityClass;

@UtilityClass
public class AttributeNames {

    @UtilityClass
    public static class Dataset {
        public static final String ROWS_COUNT = "rows_count";
        public static final String FIELDS_COUNT = "fields_count";
        public static final String CONSUMERS_COUNT = "consumers_count";
        public static final String PARENT_DATASET = "parent_dataset";
    }

    @UtilityClass
    public static class DataConsumer {
        public static final String INPUT_LIST = "input_list";
    }

    @UtilityClass
    public static class DataEntityGroup {
        public static final String GROUP_ODDRN = "group_oddrn";
        public static final String ENTITIES_LIST = "entities_list";
    }

    @UtilityClass
    public static class DataInput {
        public static final String OUTPUT_LIST = "output_list";
    }

    @UtilityClass
    public static class DataQualityTest {
        public static final String SUITE_NAME = "suite_name";
        public static final String SUITE_URL = "suite_url";
        public static final String DATASET_LIST = "dataset_list";
        public static final String LINKED_URL_LIST = "linked_url_list";
        public static final String EXPECTATION = "expectation";
    }

    @UtilityClass
    public static class DataTransformer {
        public static final String SOURCE_LIST = "source_list";
        public static final String TARGET_LIST = "target_list";
        public static final String SOURCE_CODE_URL = "source_code_url";
    }
}
