package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGroupParentGroupRelationRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class GroupParentGroupIngestionRequestProcessor implements IngestionRequestProcessor {
    private final ReactiveGroupParentGroupRelationRepository groupParentGroupRelationRepository;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        // TODO: why no delete here opposed to what's in GERIRP? Is it because we don't want to delete old "experiments"?
        return groupParentGroupRelationRepository.createRelations(request.getGroupParentGroupRelations());
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return CollectionUtils.isNotEmpty(request.getGroupParentGroupRelations());
    }
}
