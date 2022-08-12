package org.opendatadiscovery.oddplatform.service.ingestion.handler;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityTestRelationRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataQualityTestRelationIngestionHandler implements IngestionHandler {
    private final ReactiveDataQualityTestRelationRepository dataQualityTestRelationRepository;

    @Override
    public Mono<Void> handle(final IngestionDataStructure dataStructure) {
        return dataQualityTestRelationRepository
            .createRelations(dataStructure.getDataQARelations())
            .then();
    }
}
