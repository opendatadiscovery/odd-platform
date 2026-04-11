package org.opendatadiscovery.oddplatform.dto.attributes;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataQualityTest.DATASET_LIST;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataQualityTest.EXPECTATION;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataQualityTest.LINKED_URL_LIST;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataQualityTest.SUITE_NAME;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataQualityTest.SUITE_URL;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class DataQualityTestAttributes extends DataEntityAttributes {
    @JsonProperty(SUITE_NAME)
    private String suiteName;

    @JsonProperty(SUITE_URL)
    private String suiteUrl;

    @JsonProperty(DATASET_LIST)
    private Set<String> datasetOddrnList;

    @JsonProperty(LINKED_URL_LIST)
    private List<LinkedUrlAttribute> linkedUrlList;

    @JsonProperty(EXPECTATION)
    private DataQualityTestExpectationAttributes expectation;

    @Override
    public Set<String> getDependentOddrns() {
        return datasetOddrnList;
    }

    @Data
    @NoArgsConstructor
    public static class DataQualityTestExpectationAttributes {
        @JsonProperty("type")
        private String type;

        private Map<String, String> additionalProperties = new HashMap<>();

        @JsonAnyGetter
        public Map<String, String> any() {
            return this.additionalProperties;
        }

        @JsonAnySetter
        public void set(final String name, final String value) {
            this.additionalProperties.put(name, value);
        }
    }
}
