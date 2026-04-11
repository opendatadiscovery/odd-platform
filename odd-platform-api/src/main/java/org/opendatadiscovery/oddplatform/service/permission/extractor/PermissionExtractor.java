package org.opendatadiscovery.oddplatform.service.permission.extractor;

import org.opendatadiscovery.oddplatform.dto.policy.PolicyTypeDto;

public interface PermissionExtractor {
    PolicyTypeDto getResourceType();
}
