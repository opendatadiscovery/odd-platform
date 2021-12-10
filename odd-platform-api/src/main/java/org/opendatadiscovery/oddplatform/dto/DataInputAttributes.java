package org.opendatadiscovery.oddplatform.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.util.Set;

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
