package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.masking.DatasetFieldMaskingDto;
import org.opendatadiscovery.oddplatform.dto.masking.MaskingRuleDto;
import reactor.core.publisher.Mono;

public interface MaskingService {
    Mono<List<MaskingRuleDto>> getMaskingRules();

    Mono<DatasetFieldMaskingDto> getFieldMasking(long datasetFieldId);

    Mono<List<DatasetFieldMaskingDto>> getDatasetMaskings(long datasetId);

    Mono<Void> applyMasking(long datasetFieldId, long ruleId);

    Mono<Void> removeMasking(long datasetFieldId);

    String maskValue(String value, String ruleType);
}
