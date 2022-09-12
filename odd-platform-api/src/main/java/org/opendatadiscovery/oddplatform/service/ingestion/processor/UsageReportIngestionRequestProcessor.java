package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassesTotalDelta;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityStatisticsRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UsageReportIngestionRequestProcessor implements IngestionRequestProcessor {
    private final ReactiveDataEntityStatisticsRepository dataEntityStatisticsRepository;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        final DataEntityClassesTotalDelta classesDelta = request.getEntityClassesTotalDelta();

        return dataEntityStatisticsRepository
            .updateCounts(classesDelta.totalDelta(), classesDelta.entityClassesDelta())
            .then();
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return true;
    }
}
