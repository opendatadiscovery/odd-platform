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

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class DataQualityTestAttributes extends DataEntityAttributes {
    @JsonProperty("suite_name")
    private String suiteName;

    @JsonProperty("suite_url")
    private String suiteUrl;

    @JsonProperty("dataset_list")
    private Set<String> datasetOddrnList;

    @JsonProperty("linked_url_list")
    private List<String> linkedUrlList;

    @JsonProperty("expectation")
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
