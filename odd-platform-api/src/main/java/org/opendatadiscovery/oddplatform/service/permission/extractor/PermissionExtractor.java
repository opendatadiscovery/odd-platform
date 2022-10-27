package org.opendatadiscovery.oddplatform.service.permission.extractor;

import org.opendatadiscovery.oddplatform.api.contract.model.PermissionResourceType;

public interface PermissionExtractor {
    PermissionResourceType getResourceType();
}
