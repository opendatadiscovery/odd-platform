package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAlertRepository;
import org.opendatadiscovery.oddplatform.service.AlertLocator;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class AlertIngestionRequestProcessor implements IngestionRequestProcessor {
    private final ReactiveAlertRepository alertRepository;
    private final AlertLocator alertLocator;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        return alertLocator.locateAlerts(request)
            .collectList()
            .flatMap(alertRepository::createAlerts)
            .then();
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return true;
    }

    @Override
    public IngestionProcessingPhase getPhase() {
        return IngestionProcessingPhase.FINALIZING;
    }
}
