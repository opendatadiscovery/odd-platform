package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveERDRelationshipsRepository;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class RelationshipsServiceImpl implements RelationshipsService {
    private final ReactiveERDRelationshipsRepository relationshipsRepository;
}
