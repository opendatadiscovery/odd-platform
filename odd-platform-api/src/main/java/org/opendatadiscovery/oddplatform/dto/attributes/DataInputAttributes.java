package org.opendatadiscovery.oddplatform.dto.attributes;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Set;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class DataInputAttributes extends DataEntityAttributes {
    @JsonProperty("output_list")
    private Set<String> outputListOddrn;

    @Override
    public Set<String> getDependentOddrns() {
        return outputListOddrn;
    }
}
