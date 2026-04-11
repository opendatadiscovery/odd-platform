package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.MonitoredTablesDashboard;
import org.opendatadiscovery.oddplatform.api.contract.model.TablesDashboard;
import org.opendatadiscovery.oddplatform.api.contract.model.TablesHealthDashboard;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRunsRepository;
import org.springframework.stereotype.Component;

@Component
public class TablesDashboardMapperImpl implements TablesDashboardMapper {
    @Override
    public TablesDashboard mapToDto(final List<ReactiveDataQualityRunsRepository.TableHealthRecord> tableHealth,
                                    final List<ReactiveDataQualityRunsRepository.MonitoredtablesRecord>
                                        monitoredTablesStatus) {
        final TablesHealthDashboard tablesHealthDashboard = new TablesHealthDashboard();

        tableHealth.forEach(row -> {
            switch (row.tableStatus()) {
                case GOOD_HEALTH -> tablesHealthDashboard.setHealthyTables(row.count());
                case ERROR_HEALTH -> tablesHealthDashboard.setErrorTables(row.count());
                case WARNING_HEALTH -> tablesHealthDashboard.setWarningTables(row.count());
            }
        });

        final MonitoredTablesDashboard monitoredTablesDashboard = new MonitoredTablesDashboard();

        monitoredTablesStatus.forEach(row -> {
            switch (row.status()) {
                case MONITORED_TABLES -> monitoredTablesDashboard.setMonitoredTables(row.count());
                case NOT_MONITORED_TABLES -> monitoredTablesDashboard.setNotMonitoredTables(row.count());
            }
        });

        return new TablesDashboard()
            .tablesHealth(tablesHealthDashboard)
            .monitoredTables(monitoredTablesDashboard);
    }
}
