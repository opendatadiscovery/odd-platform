package org.opendatadiscovery.oddplatform.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataRelationshipDetailsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipDetailsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveERDRelationshipsRepository;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class ERDRelationshipsIngestionServiceImpl implements ERDRelationshipsIngestionService {
    private final ReactiveERDRelationshipsRepository erdRelationshipsRepository;

    @Override
    public Mono<Void> createERDRelationships(
        final List<Pair<RelationshipsPojo, DataRelationshipDetailsDto>> relationshipPojoWithDetails) {
        final List<ErdRelationshipDetailsPojo> toCreate = relationshipPojoWithDetails.stream().map(item -> {
            final DataRelationshipDetailsDto erdDetails = item.getRight();

            erdDetails.erdRelationshipDetailsPojo().setRelationshipId(item.getLeft().getId());

            return erdDetails.erdRelationshipDetailsPojo();
        }).toList();

        return erdRelationshipsRepository.bulkCreate(toCreate).then();
    }

    @Override
    public Mono<Void> updateExistedERDRelationships(
        final List<Pair<RelationshipsPojo, DataRelationshipDetailsDto>> relationshipPojoWithDetails) {
        final Map<Long, Pair<RelationshipsPojo, DataRelationshipDetailsDto>> erdToUpdateMap =
            relationshipPojoWithDetails.stream()
                .collect(Collectors.toMap(item -> item.getLeft().getId(), Function.identity()));

        return erdRelationshipsRepository.findERDSByRelationIds(erdToUpdateMap.keySet().stream().toList())
            .flatMap(existedErds -> {
                final Set<ErdRelationshipDetailsPojo> toUpdate = new HashSet<>();

                existedErds.forEach(existedErd -> {
                    final ErdRelationshipDetailsPojo ingested
                        = erdToUpdateMap.get(existedErd.getRelationshipId()).getRight().erdRelationshipDetailsPojo();
                    ingested.setId(existedErd.getId());
                    ingested.setRelationshipId(existedErd.getRelationshipId());
                    toUpdate.add(ingested);
                });

                return erdRelationshipsRepository.bulkUpdate(toUpdate).collectList();
            }).then();
    }
}
