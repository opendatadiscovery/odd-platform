package org.opendatadiscovery.oddplatform.mapper;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public interface OffsetDateTimeMapper {

    default OffsetDateTime map(final LocalDateTime localDateTime) {
        return localDateTime.atOffset(ZoneOffset.UTC);
    }
}
