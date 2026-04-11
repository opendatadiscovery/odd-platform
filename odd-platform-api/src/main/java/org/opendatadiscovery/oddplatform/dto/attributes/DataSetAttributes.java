package org.opendatadiscovery.oddplatform.dto.attributes;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Set;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.Dataset.CONSUMERS_COUNT;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.Dataset.FIELDS_COUNT;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.Dataset.ROWS_COUNT;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class DataSetAttributes extends DataEntityAttributes {
    @JsonProperty(ROWS_COUNT)
    private Long rowsCount;

    @JsonProperty(FIELDS_COUNT)
    private Long fieldsCount;

    @JsonProperty(CONSUMERS_COUNT)
    private Long consumersCount;

    @Override
    public Set<String> getDependentOddrns() {
        return Set.of();
    }
}
