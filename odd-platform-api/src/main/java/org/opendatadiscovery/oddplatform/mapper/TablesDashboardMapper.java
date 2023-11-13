package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.jooq.Record2;
import org.opendatadiscovery.oddplatform.api.contract.model.TablesDashboard;

public interface TablesDashboardMapper {
    String TABLE_STATUS = "STATUS";
    String GOOD_HEALTH = "GOOD_HEALTH";
    String ERROR_HEALTH = "ERROR";
    String WARNING_HEALTH = "WARNING";
    String MONITORED_TABLES = "MONITORED_TABLES";
    String NOT_MONITORED_TABLES = "NOT_MONITORED_TABLES";
    String COUNT = "COUNT";

    TablesDashboard mapToDto(final List<Record2<Integer, String>> tableHealth,
                             final List<Record2<Integer, String>> monitoredTablesStatus);
}
