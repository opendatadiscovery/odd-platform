package org.opendatadiscovery.oddplatform.auth.manager.extractor;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.auth.manager.AuthorizationManagerType;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAlertRepository;
import org.springframework.security.web.server.authorization.AuthorizationContext;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class AlertResourceExtractor implements ResourceExtractor {
    private final ReactiveAlertRepository alertRepository;

    @Override
    public boolean handles(final AuthorizationManagerType type) {
        return type == AuthorizationManagerType.ALERT;
    }

    @Override
    public Mono<Long> extractResourceId(final AuthorizationContext context,
                                        final String resourceIdVariableName) {
        return Mono.just(context)
            .map(c -> (String) c.getVariables().get(resourceIdVariableName))
            .map(Long::valueOf)
            .flatMap(alertRepository::getDataEntityIdByAlertId);
    }
}
