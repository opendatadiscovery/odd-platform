package org.opendatadiscovery.oddplatform.repository.reactive;

import java.io.Serializable;
import org.opendatadiscovery.oddplatform.dto.DataQualityTestFiltersDto;
import reactor.core.publisher.Flux;

public interface ReactiveDataQualityRunsRepository {
    record DataQualityRunsRecord(String taskRunCategory, String status, Integer taskRunsCount) implements
        Serializable {
    }

    record TableHealthRecord(Integer count, String tableStatus) implements
        Serializable {
    }

    record MonitoredtablesRecord(Integer count, String status) implements
        Serializable {
    }

    Flux<DataQualityRunsRecord> getLatestDataQualityRunsResults(final DataQualityTestFiltersDto filtersDto);

    Flux<TableHealthRecord> getLatestTablesHealth(final DataQualityTestFiltersDto filtersDto);

    Flux<MonitoredtablesRecord> getMonitoredTables(final DataQualityTestFiltersDto filtersDto);
}
