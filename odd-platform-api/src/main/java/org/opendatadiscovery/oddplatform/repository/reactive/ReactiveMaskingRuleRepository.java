package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.masking.MaskingRuleDto;
import reactor.core.publisher.Mono;

public interface ReactiveMaskingRuleRepository {
    Mono<List<MaskingRuleDto>> findAll();

    Mono<MaskingRuleDto> getById(long id);
}
