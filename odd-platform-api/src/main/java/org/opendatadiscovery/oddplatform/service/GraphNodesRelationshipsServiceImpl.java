package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGraphRelationshipsRepository;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class GraphNodesRelationshipsServiceImpl implements GraphNodesRelationshipsService {
    private final ReactiveGraphRelationshipsRepository graphNodesRelationshipsRepository;
}
