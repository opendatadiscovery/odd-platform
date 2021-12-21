package org.opendatadiscovery.oddplatform.dto.attributes;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Set;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class DataEntityGroupAttributes extends DataEntityAttributes {
    @JsonProperty("group_oddrn")
    private String groupOddrn;

    @JsonProperty("entities_list")
    private Set<String> entitiesOddrnList;

    @Override
    public Set<String> getDependentOddrns() {
        return entitiesOddrnList;
    }
}
