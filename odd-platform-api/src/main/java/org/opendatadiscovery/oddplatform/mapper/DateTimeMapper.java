package org.opendatadiscovery.oddplatform.mapper;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import org.mapstruct.Mapper;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;

@Mapper(config = MapperConfig.class)
public interface DateTimeMapper {
    default OffsetDateTime mapUTCDateTime(final LocalDateTime localDateTime) {
        return DateTimeUtil.mapUTCDateTime(localDateTime);
    }

    default OffsetDateTime mapEpochSeconds(final Integer seconds) {
        return DateTimeUtil.mapEpochSeconds(seconds);
    }
}