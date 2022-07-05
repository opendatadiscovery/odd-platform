package org.opendatadiscovery.oddplatform.dto.activity;

import java.util.List;

public record CustomGroupEntityActivityStateDto(Long id, String internalName, String externalName,
                                                List<Integer> entityClasses) {
}
