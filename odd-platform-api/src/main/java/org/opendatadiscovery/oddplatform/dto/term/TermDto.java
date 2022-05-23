package org.opendatadiscovery.oddplatform.dto.term;

import java.util.Set;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class TermDto {
    private final TermRefDto termRefDto;
    private final Integer entitiesUsingCount;
    private final Set<TermOwnershipDto> ownerships;
}
