package org.opendatadiscovery.oddplatform.dto.term;

import java.util.List;
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
    private final List<LinkedTermDto> terms;

    public TermDetailsDto(final TermRefDto termRefDto) {
        this.tags = null;
        this.terms = null;
        this.termDto = new TermDto(termRefDto, null, null, null, null, null);
    }
}
