package org.opendatadiscovery.oddplatform.mapper;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public interface ReadOnlyCRUDMapper<E, P> {
    E mapPojo(final P pojo);

    default OffsetDateTime addUTC(final LocalDateTime time) {
        if (null == time) {
            return null;
        }

        return time.atOffset(ZoneOffset.UTC);
    }
}
