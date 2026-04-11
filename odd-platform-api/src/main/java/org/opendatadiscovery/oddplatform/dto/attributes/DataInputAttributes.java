package org.opendatadiscovery.oddplatform.dto.attributes;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Set;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataInput.OUTPUT_LIST;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class DataInputAttributes extends DataEntityAttributes {
    @JsonProperty(OUTPUT_LIST)
    private Set<String> outputListOddrn;

    @Override
    public Set<String> getDependentOddrns() {
        return outputListOddrn;
    }
}
