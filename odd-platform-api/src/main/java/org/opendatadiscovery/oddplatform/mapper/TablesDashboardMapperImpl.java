package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.jooq.Record2;
import org.opendatadiscovery.oddplatform.api.contract.model.MonitoredTablesDashboard;
import org.opendatadiscovery.oddplatform.api.contract.model.TablesDashboard;
import org.opendatadiscovery.oddplatform.api.contract.model.TablesHealthDashboard;
import org.springframework.stereotype.Component;

@Component
public class TablesDashboardMapperImpl implements TablesDashboardMapper {
    @Override
    public TablesDashboard mapToDto(final List<Record2<Integer, String>> tableHealth,
                                    final List<Record2<Integer, String>> monitoredTablesStatus) {
        final TablesHealthDashboard tablesHealthDashboard = new TablesHealthDashboard();

        tableHealth.forEach(row -> {
            switch (row.get(TABLE_STATUS, String.class)) {
                case GOOD_HEALTH -> tablesHealthDashboard.setHealthyTables(row.get(COUNT, Integer.class));
                case ERROR_HEALTH -> tablesHealthDashboard.setErrorTables(row.get(COUNT, Integer.class));
                case WARNING_HEALTH -> tablesHealthDashboard.setWarningTables(row.get(COUNT, Integer.class));
            }
        });

        final MonitoredTablesDashboard monitoredTablesDashboard = new MonitoredTablesDashboard();

        monitoredTablesStatus.forEach(row -> {
            switch (row.get(TABLE_STATUS, String.class)) {
                case MONITORED_TABLES -> monitoredTablesDashboard.setMonitoredTables(row.get(COUNT, Integer.class));
                case NOT_MONITORED_TABLES ->
                        monitoredTablesDashboard.setNotMonitoredTables(row.get(COUNT, Integer.class));
            }
        });

        return new TablesDashboard()
                .tablesHealth(tablesHealthDashboard)
                .monitoredTables(monitoredTablesDashboard);
    }
}
