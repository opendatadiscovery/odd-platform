package org.opendatadiscovery.oddplatform.dto;

import java.util.Set;

public record DataEntitySpecificAttributesDelta(String oddrn,
                                                Set<DataEntityTypeDto> types,
                                                String oldAttrsJson,
                                                String newAttrsJson) {}