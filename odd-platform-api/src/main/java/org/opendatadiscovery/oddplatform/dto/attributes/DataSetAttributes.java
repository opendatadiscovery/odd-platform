package org.opendatadiscovery.oddplatform.dto.attributes;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Set;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class DataSetAttributes extends DataEntityAttributes {
    @JsonProperty("rows_count")
    private Long rowsCount;

    @JsonProperty("fields_count")
    private Long fieldsCount;

    @JsonProperty("consumers_count")
    private Long consumersCount;

    @Override
    public Set<String> getDependentOddrns() {
        return Set.of();
    }
}
