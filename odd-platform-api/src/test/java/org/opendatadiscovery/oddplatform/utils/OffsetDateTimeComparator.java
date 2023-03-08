package org.opendatadiscovery.oddplatform.utils;

import java.time.OffsetDateTime;
import java.util.Comparator;

public class OffsetDateTimeComparator implements Comparator<OffsetDateTime> {

    private static final OffsetDateTimeComparator INSTANCE = new OffsetDateTimeComparator();

    public static OffsetDateTimeComparator getInstance() {
        return INSTANCE;
    }

    private OffsetDateTimeComparator() {
    }

    @Override
    public int compare(final OffsetDateTime o1, final OffsetDateTime o2) {
        if (o1 == null && o2 == null) {
            return 0;
        }
        if (o1 == null) {
            return -1;
        }
        if (o2 == null) {
            return 1;
        }
        return OffsetDateTime.timeLineOrder().compare(o1, o2);
    }
}
