package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@Slf4j
public class IngestionProcessorChain {
    private final List<IngestionRequestProcessor> ingestionRequestProcessors;

    public Mono<IngestionRequest> processIngestionRequest(final IngestionRequest request) {
        final List<Mono<IngestionRequest>> executions = ingestionRequestProcessors
            .stream()
            .filter(ih -> {
                // TODO: revert. Only for debug purposes
                if (ih.shouldProcess(request)) {
                    log.info("Running: {}", ih.getClass().getName());
                    return true;
                } else {
                    log.info("Filtering out {}", ih.getClass().getName());
                    return false;
                }
            })
            .filter(ih -> ih.shouldProcess(request))
            .map(ih -> ih.process(request).thenReturn(request))
            .toList();

        return Mono.zip(executions, voids -> request);
    }
}
