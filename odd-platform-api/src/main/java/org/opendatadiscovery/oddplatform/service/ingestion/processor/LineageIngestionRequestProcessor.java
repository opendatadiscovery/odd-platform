package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.service.LineageService;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class LineageIngestionRequestProcessor implements IngestionRequestProcessor {
    private final LineageService lineageService;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        return lineageService.replaceLineagePaths(request.getLineageRelations()).then();
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return CollectionUtils.isNotEmpty(request.getLineageRelations());
    }
}
