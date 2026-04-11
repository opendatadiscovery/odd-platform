package org.opendatadiscovery.oddplatform.dto.term;

import lombok.Builder;
import lombok.Getter;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;

@Builder
@Getter
public class TermRefDto {
    private final TermPojo term;
    private final NamespacePojo namespace;
}
