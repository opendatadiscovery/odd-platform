package org.opendatadiscovery.oddplatform.dto.term;

import java.util.Set;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;

@Builder
@Getter
@RequiredArgsConstructor
public class TermDetailsDto {
    private final TermDto termDto;
    private final Set<TagPojo> tags;

    public TermDetailsDto(final TermRefDto termRefDto) {
        this.tags = null;
        this.termDto = new TermDto(termRefDto, null, null);
    }
}
