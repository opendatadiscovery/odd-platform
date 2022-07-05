package org.opendatadiscovery.oddplatform.dto.activity;

import java.util.List;

public record CustomGroupActivityStateDto(Long id, String name, List<Integer> entityClasses,
                                          Integer typeId,
                                          String namespaceName,
                                          List<CustomGroupEntityActivityStateDto> entities) {
}
