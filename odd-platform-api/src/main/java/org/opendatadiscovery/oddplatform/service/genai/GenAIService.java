package org.opendatadiscovery.oddplatform.service.genai;

import org.opendatadiscovery.oddplatform.api.contract.model.GenAIMessage;
import reactor.core.publisher.Mono;

public interface GenAIService {
    Mono<GenAIMessage> getResponseFromGenAI(final GenAIMessage item);
}
