package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldList;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldMapper;
import org.opendatadiscovery.oddplatform.repository.MetadataFieldRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class MetadataFieldServiceImpl implements MetadataFieldService {
    private final MetadataFieldRepository metadataFieldRepository;
    private final MetadataFieldMapper mapper;

    @Override
    public Mono<MetadataFieldList> list(final String query) {
        return Mono.fromCallable(() -> metadataFieldRepository.list(query))
            .map(mapper::mapPojos);
    }
}
