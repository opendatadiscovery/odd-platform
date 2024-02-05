package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityResults;
import org.opendatadiscovery.oddplatform.dto.DataQualityTestFiltersDto;
import org.opendatadiscovery.oddplatform.mapper.DataQualityCategoryMapper;
import org.opendatadiscovery.oddplatform.mapper.DataQualityTestFiltersMapper;
import org.opendatadiscovery.oddplatform.mapper.TablesDashboardMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRunsRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataQualityRunsServiceImpl implements DataQualityRunsService {
    private final DataQualityCategoryMapper testsMapper;
    private final TablesDashboardMapper tablesDashboardMapper;
    private final DataQualityTestFiltersMapper dataQualityTestFiltersMapper;
    private final ReactiveDataQualityRunsRepository dataQualityRunsRepository;

    @Override
    public Mono<DataQualityResults> getDataQualityTestsRuns(final List<Long> namespaceIds,
                                                            final List<Long> datasourceIds,
                                                            final List<Long> ownerIds,
                                                            final List<Long> titleIds,
                                                            final List<Long> tagIds,
                                                            final List<Long> deNamespaceId,
                                                            final List<Long> deDatasourceId,
                                                            final List<Long> deOwnerId,
                                                            final List<Long> deTitleId,
                                                            final List<Long> deTagId) {
        final DataQualityTestFiltersDto filtersDto
                = dataQualityTestFiltersMapper.mapToDto(namespaceIds, datasourceIds, ownerIds, titleIds, tagIds,
                                                        deNamespaceId, deDatasourceId, deOwnerId, deTitleId, deTagId);
        return dataQualityRunsRepository.getLatestDataQualityRunsResults(filtersDto)
                .collectList()
                .zipWith(dataQualityRunsRepository.getLatestTablesHealth(filtersDto).collectList()
                    .zipWith(dataQualityRunsRepository.getMonitoredTables(filtersDto).collectList()))
                .map(item -> new DataQualityResults()
                    .testResults(testsMapper.mapToDto(item.getT1()))
                    .tablesDashboard(tablesDashboardMapper.mapToDto(item.getT2().getT1(), item.getT2().getT2())));
    }
}
