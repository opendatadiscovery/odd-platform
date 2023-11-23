package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.TablesDashboard;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRunsRepository;

public interface TablesDashboardMapper {
    String TABLE_STATUS = "STATUS";
    String GOOD_HEALTH = "GOOD_HEALTH";
    String ERROR_HEALTH = "ERROR";
    String WARNING_HEALTH = "WARNING";
    String MONITORED_TABLES = "MONITORED_TABLES";
    String NOT_MONITORED_TABLES = "NOT_MONITORED_TABLES";
    String COUNT = "COUNT";

    TablesDashboard mapToDto(final List<ReactiveDataQualityRunsRepository.TableHealthRecord> tableHealth,
                             final List<ReactiveDataQualityRunsRepository.MonitoredtablesRecord> monitoredTablesStatus);
}
