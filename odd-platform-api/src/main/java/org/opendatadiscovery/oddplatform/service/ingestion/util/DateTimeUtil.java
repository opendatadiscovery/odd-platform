package org.opendatadiscovery.oddplatform.service.ingestion.util;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import lombok.experimental.UtilityClass;

@UtilityClass
public class DateTimeUtil {
    public static LocalDateTime generateNow() {
        return OffsetDateTime.now().atZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
    }
}
