package org.opendatadiscovery.oddplatform.service.genai;

import org.opendatadiscovery.oddplatform.api.contract.model.GenAIQuestionResult;
import org.opendatadiscovery.oddplatform.api.contract.model.GenAIRequest;
import reactor.core.publisher.Mono;

public interface GenAIService {
    Mono<GenAIQuestionResult> getResponseFromGenAI(final GenAIRequest item);
}
