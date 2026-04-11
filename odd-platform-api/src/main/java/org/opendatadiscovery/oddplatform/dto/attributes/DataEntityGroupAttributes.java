package org.opendatadiscovery.oddplatform.dto.attributes;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Set;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataEntityGroup.ENTITIES_LIST;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataEntityGroup.GROUP_ODDRN;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class DataEntityGroupAttributes extends DataEntityAttributes {
    @JsonProperty(GROUP_ODDRN)
    private String groupOddrn;

    @JsonProperty(ENTITIES_LIST)
    private Set<String> entitiesOddrnList;

    @Override
    public Set<String> getDependentOddrns() {
        return entitiesOddrnList;
    }
}
