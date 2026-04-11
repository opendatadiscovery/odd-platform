package org.opendatadiscovery.oddplatform.dto.activity;

import java.util.List;
import org.jooq.JSONB;

public record DatasetFieldTermsActivityStateDto(Long id, String name, JSONB type,
                                                List<TermActivityStateDto> terms) {
}
