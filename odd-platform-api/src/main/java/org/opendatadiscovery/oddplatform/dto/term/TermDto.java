package org.opendatadiscovery.oddplatform.dto.term;

import java.util.Set;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class TermDto {
    private final TermRefDto termRefDto;
    private final Integer entitiesUsingCount;
    private final Integer columnsUsingCount;
    private final Integer linkedTermsUsingCount;
    private final Integer queryExampleUsingCount;
    private final Set<TermOwnershipDto> ownerships;
}
