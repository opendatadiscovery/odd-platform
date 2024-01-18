package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.api.contract.model.ERDRelationshipDetailsList;
import org.opendatadiscovery.oddplatform.mapper.ErdRelationShipMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveERDRelationshipsRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class ERDRelationshipsServiceImpl implements ERDRelationshipsService {
    private final ReactiveERDRelationshipsRepository erdRelationshipsRepository;
    private final RelationshipsService relationshipsService;
    private final ErdRelationShipMapper erdRelationShipMapper;

    @Override
    public Mono<ERDRelationshipDetailsList> getDataSetErdRelationshipsById(final Long dataEntityId,
                                                                           final Long relationshipsId) {
        return relationshipsService.getRelationshipById(relationshipsId)
            .flatMap(item -> erdRelationshipsRepository.findERDSByRelationIds(List.of(relationshipsId))
                .map(erds -> new ERDRelationshipDetailsList()
                    .datasetRelationship(item)
                    .items(erdRelationShipMapper.pojoListToDetailsList(erds))));
    }
}
