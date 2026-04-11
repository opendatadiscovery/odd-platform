package org.opendatadiscovery.oddplatform.dto.attributes;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Set;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.apache.commons.collections4.SetUtils;

import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataTransformer.SOURCE_CODE_URL;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataTransformer.SOURCE_LIST;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataTransformer.TARGET_LIST;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class DataTransformerAttributes extends DataEntityAttributes {
    @JsonProperty(SOURCE_LIST)
    private Set<String> sourceOddrnList;

    @JsonProperty(TARGET_LIST)
    private Set<String> targetOddrnList;

    @JsonProperty(SOURCE_CODE_URL)
    private String sourceCodeUrl;

    @Override
    public Set<String> getDependentOddrns() {
        return SetUtils.union(sourceOddrnList, targetOddrnList);
    }
}
