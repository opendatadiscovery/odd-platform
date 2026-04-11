package org.opendatadiscovery.oddplatform.service.ingestion.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import lombok.experimental.UtilityClass;

@UtilityClass
public class DateTimeUtil {
    public static LocalDateTime generateNow() {
        return OffsetDateTime.now().atZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
    }

    public LocalDateTime mapUTCDateTime(final OffsetDateTime offsetDateTime) {
        if (offsetDateTime == null) {
            return null;
        }
        return offsetDateTime.atZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
    }

    public OffsetDateTime mapUTCDateTime(final LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return localDateTime.atOffset(ZoneOffset.UTC);
    }

    public OffsetDateTime mapEpochSeconds(final Integer epochSeconds) {
        if (epochSeconds == null) {
            return null;
        }
        return OffsetDateTime.ofInstant(Instant.ofEpochSecond(epochSeconds), ZoneOffset.UTC);
    }
}
