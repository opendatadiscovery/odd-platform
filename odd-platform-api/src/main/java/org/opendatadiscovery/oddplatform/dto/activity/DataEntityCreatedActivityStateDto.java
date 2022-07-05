package org.opendatadiscovery.oddplatform.dto.activity;

import java.util.List;

public record DataEntityCreatedActivityStateDto(Long id, String externalName, String oddrn, List<Integer> classes,
                                                Integer typeId) {
}
