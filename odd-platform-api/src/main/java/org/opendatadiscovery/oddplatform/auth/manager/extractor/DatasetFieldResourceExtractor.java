package org.opendatadiscovery.oddplatform.auth.manager.extractor;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.auth.manager.AuthorizationManagerType;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.springframework.security.web.server.authorization.AuthorizationContext;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class DatasetFieldResourceExtractor implements ResourceExtractor {
    private final ReactiveDatasetFieldRepository datasetFieldRepository;

    @Override
    public boolean handles(final AuthorizationManagerType type) {
        return type == AuthorizationManagerType.DATASET_FIELD;
    }

    @Override
    public Mono<Long> extractResourceId(final AuthorizationContext context,
                                        final String resourceIdVariableName) {
        return Mono.just(context)
            .map(c -> (String) c.getVariables().get(resourceIdVariableName))
            .map(Long::valueOf)
            .flatMap(datasetFieldRepository::getDataEntityIdByDatasetFieldId);
    }
}
