package org.opendatadiscovery.oddplatform.service.genai;

import org.opendatadiscovery.oddplatform.api.contract.model.GenAIRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.GenAIResponse;
import reactor.core.publisher.Mono;

public interface GenAIService {
    Mono<GenAIResponse> getResponseFromGenAI(final GenAIRequest item);
}
