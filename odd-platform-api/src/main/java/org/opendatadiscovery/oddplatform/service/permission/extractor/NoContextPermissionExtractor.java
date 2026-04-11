package org.opendatadiscovery.oddplatform.service.permission.extractor;

import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import reactor.core.publisher.Flux;

public interface NoContextPermissionExtractor extends PermissionExtractor {
    Flux<Permission> getNonContextualPermissions();
}
