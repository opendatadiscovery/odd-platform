package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;

public interface TermRepository {

    List<TermRefDto> findTermsByDataEntityId(final Long dataEntityId);
}
