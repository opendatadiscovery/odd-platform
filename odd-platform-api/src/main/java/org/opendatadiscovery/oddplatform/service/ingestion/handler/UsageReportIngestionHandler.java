package org.opendatadiscovery.oddplatform.service.ingestion.handler;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityStatisticsRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UsageReportIngestionHandler implements IngestionHandler {
    private final ReactiveDataEntityStatisticsRepository dataEntityStatisticsRepository;

    @Override
    public Mono<Void> handle(final IngestionDataStructure dataStructure) {
        return dataEntityStatisticsRepository.updateCounts(
            dataStructure.getEntityClassesTotalDelta().totalDelta(),
            dataStructure.getEntityClassesTotalDelta().entityClassesDelta()
        ).then();
    }
}
