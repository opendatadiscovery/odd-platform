package org.opendatadiscovery.oddplatform.repository;

import java.util.Optional;
import org.opendatadiscovery.oddplatform.dto.CollectorDto;

public interface CollectorRepository extends CRUDRepository<CollectorDto> {
    Optional<CollectorDto> getByOddrn(final String oddrn);
}
