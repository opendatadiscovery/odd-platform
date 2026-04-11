package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGroupEntityRelationRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class GroupEntityRelationIngestionRequestProcessor implements IngestionRequestProcessor {
    private final ReactiveGroupEntityRelationRepository groupEntityRelationRepository;

    @Override
    @ReactiveTransactional
    public Mono<Void> process(final IngestionRequest request) {
        return groupEntityRelationRepository.deleteRelations(request.getGroupEntityRelations())
            .then(groupEntityRelationRepository.createRelations(request.getGroupEntityRelations()));
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return CollectionUtils.isNotEmpty(request.getGroupEntityRelations());
    }
}
