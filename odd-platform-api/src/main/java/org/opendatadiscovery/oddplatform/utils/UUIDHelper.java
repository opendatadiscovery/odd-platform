package org.opendatadiscovery.oddplatform.utils;

import com.fasterxml.uuid.EthernetAddress;
import com.fasterxml.uuid.Generators;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Calendar;
import java.util.TimeZone;
import java.util.UUID;
import lombok.experimental.UtilityClass;

@UtilityClass
public class UUIDHelper {
    public static UUID generateUUIDv1() {
        // TODO: is this an IO operation?
        return Generators.timeBasedGenerator(EthernetAddress.fromInterface()).generate();
    }

    public static long extractEpochMsFromUUID(final UUID uuid) {
        final Calendar uuidEpoch = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        uuidEpoch.clear();
        uuidEpoch.set(1582, Calendar.OCTOBER, 15, 0, 0, 0);
        final long epochMillis = uuidEpoch.getTime().getTime();

        return uuid.timestamp() / 10_000L + epochMillis;
    }

    public static OffsetDateTime extractDateTimeFromUUID(final UUID uuid) {
        // TODO: check UTC
        return OffsetDateTime.ofInstant(Instant.ofEpochMilli(UUIDHelper.extractEpochMsFromUUID(uuid)), ZoneOffset.UTC);
    }
}
