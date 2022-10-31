package org.opendatadiscovery.oddplatform.auth.manager;

import java.util.function.Function;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto;
import org.opendatadiscovery.oddplatform.service.permission.PermissionService;
import org.springframework.security.authorization.ReactiveAuthorizationManager;
import org.springframework.security.web.server.authorization.AuthorizationContext;

public final class ReactiveAuthorizationManagerFactory {
    private static final String DATA_ENTITY_ID = "data_entity_id";
    private static final String TERM_ID = "term_id";
    private static final String DATASET_FIELD_ID = "dataset_field_id";
    private static final String DATA_ENTITY_GROUP_ID = "data_entity_group_id";
    private static final String ALERT_ID = "alert_id";

    private ReactiveAuthorizationManagerFactory() {
    }

    public static ReactiveAuthorizationManager<AuthorizationContext> manager(final AuthorizationManagerType type,
                                                                             final PermissionService s,
                                                                             final PolicyPermissionDto p) {
        if (type == AuthorizationManagerType.NO_CONTEXT) {
            return new ReactiveNonContextPermissionAuthorizationManager(s, p);
        }
        return resourceManager(type, s, p);
    }

    private static ReactiveAuthorizationManager<AuthorizationContext> resourceManager(
        final AuthorizationManagerType type,
        final PermissionService s,
        final PolicyPermissionDto p) {
        return new ReactiveResourcePermissionAuthorizationManager(s, resourceExtractor(type), p);
    }

    private static Function<AuthorizationContext, Long> resourceExtractor(final AuthorizationManagerType type) {
        return switch (type) {
            case DATA_ENTITY -> c -> (Long) c.getVariables().get(DATA_ENTITY_ID);
            case DATASET_FIELD -> c -> (Long) c.getVariables().get(DATASET_FIELD_ID);
            case TERM -> c -> (Long) c.getVariables().get(TERM_ID);
            case ALERT -> c -> (Long) c.getVariables().get(ALERT_ID);
            case DEG -> c -> (Long) c.getVariables().get(DATA_ENTITY_GROUP_ID);
            default -> throw new IllegalArgumentException("Unsupported resource type: " + type);
        };
    }
}
