package org.opendatadiscovery.oddplatform.dto.policy;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum PolicyTypeDto {
    DATA_ENTITY(true),
    TERM(true),
    QUERY_EXAMPLE(true),
    MANAGEMENT(false);

    private final boolean hasContext;
}