package org.opendatadiscovery.oddplatform.dto.attributes;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Set;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.apache.commons.collections4.SetUtils;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class DataTransformerAttributes extends DataEntityAttributes {
    @JsonProperty("source_list")
    private Set<String> sourceOddrnList;

    @JsonProperty("target_list")
    private Set<String> targetOddrnList;

    @JsonProperty("source_code_url")
    private String sourceCodeUrl;

    @Override
    public Set<String> getDependentOddrns() {
        return SetUtils.union(sourceOddrnList, targetOddrnList);
    }
}
