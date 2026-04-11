package org.opendatadiscovery.oddplatform.dto.term;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;

public record DescriptionParsedTerms(List<TermPojo> foundTerms, List<TermBaseInfoDto> unknownTerms) {
}
