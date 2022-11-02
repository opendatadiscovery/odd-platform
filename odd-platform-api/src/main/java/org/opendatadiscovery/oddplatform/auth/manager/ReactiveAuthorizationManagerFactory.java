package org.opendatadiscovery.oddplatform.auth.manager;

import java.util.List;
import org.opendatadiscovery.oddplatform.auth.manager.extractor.ResourceExtractor;
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
                                                                             final List<ResourceExtractor> extractors,
                                                                             final PermissionService s,
                                                                             final PolicyPermissionDto p) {
        if (type == AuthorizationManagerType.NO_CONTEXT) {
            return new ReactiveNonContextPermissionAuthorizationManager(s, p);
        }
        return resourceManager(type, s, extractors, p);
    }

    private static ReactiveAuthorizationManager<AuthorizationContext> resourceManager(
        final AuthorizationManagerType type,
        final PermissionService s,
        final List<ResourceExtractor> extractors,
        final PolicyPermissionDto p) {
        final ResourceExtractor resourceExtractor = getExtractor(extractors, type);
        return new ReactiveResourcePermissionAuthorizationManager(s, resourceExtractor,
            resourceExtractorVariableName(type), p);
    }

    private static String resourceExtractorVariableName(final AuthorizationManagerType type) {
        return switch (type) {
            case DATA_ENTITY -> DATA_ENTITY_ID;
            case DATASET_FIELD -> DATASET_FIELD_ID;
            case TERM -> TERM_ID;
            case ALERT -> ALERT_ID;
            case DEG -> DATA_ENTITY_GROUP_ID;
            default -> throw new IllegalArgumentException("Unsupported resource type: " + type);
        };
    }

    private static ResourceExtractor getExtractor(final List<ResourceExtractor> extractors,
                                                  final AuthorizationManagerType type) {
        return extractors.stream()
            .filter(e -> e.handles(type))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unsupported resource type: " + type));
    }
}
