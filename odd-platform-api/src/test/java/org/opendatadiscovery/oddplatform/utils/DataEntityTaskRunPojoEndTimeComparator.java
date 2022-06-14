package org.opendatadiscovery.oddplatform.utils;

import java.util.Comparator;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;

public class DataEntityTaskRunPojoEndTimeComparator implements Comparator<DataEntityTaskRunPojo> {
    @Override
    public int compare(final DataEntityTaskRunPojo d1, final DataEntityTaskRunPojo d2) {
        if (d1 == d2) {
            return 0;
        }

        if (d1.getEndTime() == null) {
            return 1;
        }

        if (d2.getEndTime() == null) {
            return -1;
        }

        return d1.getEndTime().compareTo(d2.getEndTime());
    }
}