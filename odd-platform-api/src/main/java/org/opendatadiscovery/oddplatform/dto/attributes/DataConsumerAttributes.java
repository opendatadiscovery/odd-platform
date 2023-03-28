package org.opendatadiscovery.oddplatform.dto.attributes;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Set;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataConsumer.INPUT_LIST;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class DataConsumerAttributes extends DataEntityAttributes {
    @JsonProperty(INPUT_LIST)
    private Set<String> inputListOddrn;

    @Override
    public Set<String> getDependentOddrns() {
        return inputListOddrn;
    }
}
