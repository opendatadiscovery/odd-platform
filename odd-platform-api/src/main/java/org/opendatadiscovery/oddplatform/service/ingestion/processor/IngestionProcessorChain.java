package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class IngestionProcessorChain {
    private final Map<IngestionProcessingPhase, List<IngestionRequestProcessor>> ingestionRequestProcessors;

    public IngestionProcessorChain(final List<IngestionRequestProcessor> ingestionRequestProcessors) {
        this.ingestionRequestProcessors = ingestionRequestProcessors.stream()
            .collect(Collectors.groupingBy(
                IngestionRequestProcessor::getPhase,
                () -> new TreeMap<>(Comparator.comparingInt(IngestionProcessingPhase::getOrder)),
                Collectors.toList()
            ));
    }

    public Mono<IngestionRequest> processIngestionRequest(final IngestionRequest request) {
        return Flux.fromStream(ingestionRequestProcessors.entrySet().stream())
            .<Mono<IngestionRequest>>handle((e, sink) -> {
                final List<Mono<IngestionRequest>> phaseExecutions =
                    getPhaseExecutions(request, e.getKey(), e.getValue());

                if (CollectionUtils.isNotEmpty(phaseExecutions)) {
                    sink.next(Mono.zip(phaseExecutions, voids -> request));
                }
            })
            .concatMap(execution -> execution)
            .then(Mono.just(request));
    }

    private List<Mono<IngestionRequest>> getPhaseExecutions(final IngestionRequest request,
                                                            final IngestionProcessingPhase phase,
                                                            final List<IngestionRequestProcessor> processors) {
        return processors
            .stream()
            .filter(ip -> {
                final boolean shouldProcess = ip.shouldProcess(request);
                log.debug("Phase: {}, Processor: {}, Scheduled: {}", phase, ip.getClass().getName(), shouldProcess);
                return shouldProcess;
            })
            .map(ip -> ip.process(request).thenReturn(request))
            .toList();
    }
}
