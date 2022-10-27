package org.opendatadiscovery.oddplatform.service.permission;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.api.contract.model.PermissionResourceType;
import org.opendatadiscovery.oddplatform.service.permission.extractor.ContextualPermissionExtractor;
import org.opendatadiscovery.oddplatform.service.permission.extractor.NoContextPermissionExtractor;
import org.opendatadiscovery.oddplatform.service.permission.extractor.PermissionExtractor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {
    private final List<ContextualPermissionExtractor> contextualPermissionExtractors;
    private final List<NoContextPermissionExtractor> noContextPermissionExtractors;

    @Override
    public Flux<Permission> getResourcePermissionsForCurrentUser(final PermissionResourceType resourceType,
                                                                 final long resourceId) {
        return getExtractor(resourceType, contextualPermissionExtractors)
            .getContextualResourcePermissions(resourceId);
    }

    @Override
    public Flux<Permission> getNonContextualPermissionsForCurrentUser(final PermissionResourceType resourceType) {
        return getExtractor(resourceType, noContextPermissionExtractors)
            .getNonContextualPermissions();
    }

    private <T extends PermissionExtractor> T getExtractor(final PermissionResourceType resourceType,
                                                           final List<T> extractors) {
        return extractors.stream()
            .filter(e -> e.getResourceType() == resourceType)
            .findFirst()
            .orElseThrow(
                () -> new IllegalArgumentException("No extractor for resource type %s".formatted(resourceType)));
    }
}
