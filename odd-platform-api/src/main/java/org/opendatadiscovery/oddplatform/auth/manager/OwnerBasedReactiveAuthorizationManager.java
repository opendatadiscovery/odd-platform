package org.opendatadiscovery.oddplatform.auth.manager;

import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.auth.condition.AuthorizationManagerCondition;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAlertRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.service.DataEntitySecurityService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Conditional;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.ReactiveAuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.authorization.AuthorizationContext;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@Conditional(AuthorizationManagerCondition.class)
@RequiredArgsConstructor
public class OwnerBasedReactiveAuthorizationManager implements ReactiveAuthorizationManager<AuthorizationContext> {
    private static final String DATA_ENTITY_PATH = "/api/dataentities";
    private static final String DATASET_FIELD_PATH = "/api/datasetfields";
    private static final String ALERT_PATH = "/api/alerts";

    private static final String DATA_ENTITY_ID = "data_entity_id";
    private static final String DATASET_FIELD_ID = "dataset_field_id";
    private static final String ALERT_ID = "alert_id";

    private final DataEntitySecurityService dataEntitySecurityService;
    private final ReactiveDatasetFieldRepository datasetFieldRepository;
    private final ReactiveAlertRepository alertRepository;

    @Override
    public Mono<AuthorizationDecision> check(final Mono<Authentication> authentication,
                                             final AuthorizationContext object) {
        final String path = object.getExchange().getRequest().getPath().pathWithinApplication().value();
        if (path.startsWith(DATA_ENTITY_PATH)) {
            final String dataEntityId = (String) object.getVariables().get(DATA_ENTITY_ID);
            if (dataEntityId == null) {
                return Mono.just(new AuthorizationDecision(false));
            }
            return dataEntitySecurityService.getActionsForCurrentUser(Long.parseLong(dataEntityId))
                .filter(actions -> CollectionUtils.isNotEmpty(actions.getAllowed()))
                .map(actions -> actions.getAllowed().contains(Permission.DATA_ENTITY_EDIT))
                .map(AuthorizationDecision::new)
                .defaultIfEmpty(new AuthorizationDecision(false));
        } else if (path.startsWith(DATASET_FIELD_PATH)) {
            final String datasetFieldId = (String) object.getVariables().get(DATASET_FIELD_ID);
            if (datasetFieldId == null) {
                return Mono.just(new AuthorizationDecision(false));
            }
            return datasetFieldRepository.getDataEntityIdByDatasetFieldId(Long.parseLong(datasetFieldId))
                .flatMap(dataEntitySecurityService::getActionsForCurrentUser)
                .filter(actions -> CollectionUtils.isNotEmpty(actions.getAllowed()))
                .map(actions -> actions.getAllowed().contains(Permission.DATA_ENTITY_EDIT))
                .map(AuthorizationDecision::new)
                .defaultIfEmpty(new AuthorizationDecision(false));
        } else if (path.startsWith(ALERT_PATH)) {
            final String alertId = (String) object.getVariables().get(ALERT_ID);
            if (alertId == null) {
                return Mono.just(new AuthorizationDecision(false));
            }
            return alertRepository.getDataEntityIdByAlertId(Long.parseLong(alertId))
                .flatMap(dataEntitySecurityService::getActionsForCurrentUser)
                .filter(actions -> CollectionUtils.isNotEmpty(actions.getAllowed()))
                .map(actions -> actions.getAllowed().contains(Permission.ALERT_PROCESSING))
                .map(AuthorizationDecision::new)
                .defaultIfEmpty(new AuthorizationDecision(false));
        } else {
            return Mono.just(new AuthorizationDecision(false));
        }
    }
}
