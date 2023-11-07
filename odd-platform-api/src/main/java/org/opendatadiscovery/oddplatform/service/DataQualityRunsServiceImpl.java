package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityResults;
import org.opendatadiscovery.oddplatform.mapper.DataQualityCategoryMapper;
import org.opendatadiscovery.oddplatform.mapper.TablesDashboardMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRunsRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataQualityRunsServiceImpl implements DataQualityRunsService {
    private final DataQualityCategoryMapper testsMapper;
    private final TablesDashboardMapper tablesDashboardMapper;
    private final ReactiveDataQualityRunsRepository dataQualityRunsRepository;

    @Override
    public Mono<DataQualityResults> getDataQualityTestsRuns() {
        return dataQualityRunsRepository.getLatestDataQualityRunsResults()
                .collectList()
                .zipWith(dataQualityRunsRepository.getLatestTablesHealth().collectList()
                        .zipWith(dataQualityRunsRepository.getMonitoredTables().collectList()))
                .map(item -> new DataQualityResults()
                        .testResults(testsMapper.mapToDto(item.getT1()))
                        .tablesDashboard(tablesDashboardMapper.mapToDto(item.getT2().getT1(), item.getT2().getT2())));
    }
}
