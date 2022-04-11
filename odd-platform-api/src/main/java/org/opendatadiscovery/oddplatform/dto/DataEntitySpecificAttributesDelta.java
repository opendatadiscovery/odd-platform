package org.opendatadiscovery.oddplatform.dto;

import java.util.Set;

public record DataEntitySpecificAttributesDelta(String oddrn,
                                                Set<DataEntityClassDto> entityClasses,
                                                String oldAttrsJson,
                                                String newAttrsJson) {
}