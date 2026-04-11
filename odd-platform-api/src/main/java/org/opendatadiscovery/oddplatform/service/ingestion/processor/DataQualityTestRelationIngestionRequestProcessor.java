package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityTestRelationRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataQualityTestRelationIngestionRequestProcessor implements IngestionRequestProcessor {
    private final ReactiveDataQualityTestRelationRepository dataQualityTestRelationRepository;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        return dataQualityTestRelationRepository.createRelations(request.getDataQARelations());
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return CollectionUtils.isNotEmpty(request.getDataQARelations());
    }
}
