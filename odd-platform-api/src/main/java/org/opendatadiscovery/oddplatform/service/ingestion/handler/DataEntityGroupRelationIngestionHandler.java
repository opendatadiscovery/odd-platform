package org.opendatadiscovery.oddplatform.service.ingestion.handler;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGroupEntityRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGroupParentGroupRelationRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataEntityGroupRelationIngestionHandler implements IngestionHandler {
    private final ReactiveGroupEntityRelationRepository groupEntityRelationRepository;
    private final ReactiveGroupParentGroupRelationRepository groupParentGroupRelationRepository;

    @Override
    @ReactiveTransactional
    public Mono<Void> handle(final IngestionDataStructure dataStructure) {
        return groupEntityRelationRepository.deleteRelationsHeadless(dataStructure.getGroupEntityRelations())
            .then(groupEntityRelationRepository.createRelationsHeadless(dataStructure.getGroupEntityRelations()))
            .then(groupParentGroupRelationRepository.createRelations(dataStructure.getGroupParentGroupRelations()))
            .then();
    }
}
