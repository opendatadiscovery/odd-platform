package org.opendatadiscovery.oddplatform.utils;

import com.fasterxml.uuid.EthernetAddress;
import com.fasterxml.uuid.Generators;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import lombok.experimental.UtilityClass;

@UtilityClass
public class UUIDHelper {
    // just believe us here :)
    private static final long NUM_100NS_INTERVALS_SINCE_UUID_EPOCH = 0x01b21dd213814000L;

    public static UUID generateUUIDv1() {
        return Generators.timeBasedGenerator(EthernetAddress.fromInterface()).generate();
    }

    public static long extractEpochMsFromUUID(final UUID uuid) {
        return (uuid.timestamp() - NUM_100NS_INTERVALS_SINCE_UUID_EPOCH) / 10_000L;
    }

    public static OffsetDateTime extractDateTimeFromUUID(final UUID uuid) {
        return OffsetDateTime.ofInstant(Instant.ofEpochMilli(UUIDHelper.extractEpochMsFromUUID(uuid)), ZoneOffset.UTC);
    }
}
