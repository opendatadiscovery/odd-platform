package org.opendatadiscovery.oddplatform.dto.masking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaskingRuleDto {
    private Long id;
    private String name;
    private MaskingRuleType type;
    private String replacement;
    private String pattern;
}
