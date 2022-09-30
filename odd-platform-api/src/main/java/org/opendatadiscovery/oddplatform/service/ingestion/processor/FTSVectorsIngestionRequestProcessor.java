package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class FTSVectorsIngestionRequestProcessor implements IngestionRequestProcessor {
    private final ReactiveSearchEntrypointRepository searchEntrypointRepository;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        final List<Long> idsToProcess = request.getAllEntities()
            .stream()
            .filter(dto -> !DataEntityTypeDto.JOB_RUN.equals(dto.getType()))
            .map(EnrichedDataEntityIngestionDto::getId)
            .toList();

        return searchEntrypointRepository.recalculateVectors(idsToProcess);
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return request.getAllEntities()
            .stream()
            .anyMatch(dto -> !DataEntityTypeDto.JOB_RUN.equals(dto.getType()));
    }

    @Override
    public IngestionProcessingPhase getPhase() {
        return IngestionProcessingPhase.FINALIZING;
    }
}
