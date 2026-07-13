package org.opendatadiscovery.oddplatform.dto.masking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetFieldMaskingDto {
    private Long id;
    private Long datasetFieldId;
    private MaskingRuleDto maskingRule;
}
