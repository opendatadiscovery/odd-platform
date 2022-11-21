package org.opendatadiscovery.oddplatform.service.ingestion.rnd;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class AlertResolverServiceImpl implements AlertResolverService {
    @Override
    public Mono<Void> tryResolve(final IngestionRequest request) {
        return Mono.empty();
    }
}
