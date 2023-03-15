package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.DataEntityTotalDelta;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.service.DataEntityStatisticsService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UsageReportIngestionRequestProcessor implements IngestionRequestProcessor {
    private final DataEntityStatisticsService dataEntityStatisticsService;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        final DataEntityTotalDelta classesDelta = request.getEntityTotalDelta();
        return dataEntityStatisticsService.updateStatistics(classesDelta.totalDelta(), classesDelta.entityDelta())
            .then();
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return true;
    }
}
