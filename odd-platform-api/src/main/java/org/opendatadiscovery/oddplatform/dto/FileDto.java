package org.opendatadiscovery.oddplatform.dto;

import org.springframework.core.io.Resource;

public record FileDto(Resource resource, String fileName) {
}
