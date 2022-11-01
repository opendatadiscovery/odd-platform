package org.opendatadiscovery.oddplatform.dto.policy;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum PolicyTypeDto {
    DATA_ENTITY(true),
    TERM(true),
    MANAGEMENT(false);

    private final boolean hasContext;
}