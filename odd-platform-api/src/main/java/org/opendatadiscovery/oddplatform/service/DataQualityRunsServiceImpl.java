package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityBaseSearchForm;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityLatestRunSearchForm;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityResults;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTableHealthSearchForm;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilterState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.dto.DataEntityQualityStatusDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTaskRunStatusDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.DataQualityTestFiltersDto;
import org.opendatadiscovery.oddplatform.mapper.DataQualityCategoryMapper;
import org.opendatadiscovery.oddplatform.mapper.DataQualityTestFiltersMapper;
import org.opendatadiscovery.oddplatform.mapper.FacetStateMapper;
import org.opendatadiscovery.oddplatform.mapper.TablesDashboardMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRunsRepository;
import org.opendatadiscovery.oddplatform.service.search.SearchService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_QUALITY_TEST;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_SET;

@Service
@RequiredArgsConstructor
public class DataQualityRunsServiceImpl implements DataQualityRunsService {
    private final SearchService searchService;
    private final DataQualityCategoryMapper testsMapper;
    private final TablesDashboardMapper tablesDashboardMapper;
    private final DataQualityTestFiltersMapper dataQualityTestFiltersMapper;
    private final FacetStateMapper facetStateMapper;
    private final ReactiveDataQualityRunsRepository dataQualityRunsRepository;

    @Override
    public Mono<DataQualityResults> getDataQualityTestsRuns(final List<Long> namespaceIds,
                                                            final List<Long> datasourceIds,
                                                            final List<Long> ownerIds,
                                                            final List<Long> titleIds,
                                                            final List<Long> tagIds,
                                                            final List<Long> deNamespaceIds,
                                                            final List<Long> deDatasourceIds,
                                                            final List<Long> deOwnerIds,
                                                            final List<Long> deTitleIds,
                                                            final List<Long> deTagIds) {
        final DataQualityTestFiltersDto filtersDto
            = dataQualityTestFiltersMapper.mapToDto(namespaceIds, datasourceIds, ownerIds, titleIds, tagIds,
            deNamespaceIds, deDatasourceIds, deOwnerIds, deTitleIds, deTagIds);
        return dataQualityRunsRepository.getLatestDataQualityRunsResults(filtersDto)
            .collectList()
            .zipWith(dataQualityRunsRepository.getLatestTablesHealth(filtersDto).collectList()
                .zipWith(dataQualityRunsRepository.getMonitoredTables(filtersDto).collectList()))
            .map(item -> new DataQualityResults()
                .testResults(testsMapper.mapToDto(item.getT1()))
                .tablesDashboard(tablesDashboardMapper.mapToDto(item.getT2().getT1(), item.getT2().getT2())));
    }

    @Override
    public Mono<SearchFacetsData> createDataQualityLatestRunsSearch(final DataQualityLatestRunSearchForm form) {
        final SearchFormData searchFormData =
            facetStateMapper.mapToFormData(form.getNamespaceIds(), form.getDatasourceIds(), form.getOwnerIds(),
                form.getTagIds(),
                List.of(DATA_QUALITY_TEST.getId()), List.of());

        if (form.getStatus() != null) {
            final DataEntityTaskRunStatusDto statusDto =
                DataEntityTaskRunStatusDto.findByStatus(form.getStatus().getValue())
                    .orElseThrow(() -> new IllegalArgumentException(
                        String.format("Status %s was not founded in the system", form.getStatus().getValue())));

            searchFormData.getFilters().addLastRunStatusesItem(new SearchFilterState()
                .entityId((long) statusDto.getId())
                .entityName(statusDto.getStatus())
                .selected(true));
        }

        return searchService.search(searchFormData);
    }

    @Override
    public Mono<SearchFacetsData> createDataQualityTableHealthSearch(final DataQualityTableHealthSearchForm form) {
        final SearchFormData searchFormData =
            facetStateMapper.mapToFormData(form.getNamespaceIds(), form.getDatasourceIds(), form.getOwnerIds(),
                form.getTagIds(), List.of(), List.of());

        final DataEntityQualityStatusDto statusDto =
            DataEntityQualityStatusDto.findByStatus(form.getStatus().getValue())
                .orElseThrow(() -> new IllegalArgumentException(
                    String.format("Status %s was not founded in the system", form.getStatus().getValue())));

        searchFormData.getFilters().addDataQualityRelationsItem(new SearchFilterState()
            .entityId((long) statusDto.getId())
            .entityName(statusDto.getStatus())
            .selected(true));

        return searchService.search(searchFormData);
    }

    @Override
    public Mono<SearchFacetsData> createDataQualityMonitoredTablesSearch(final DataQualityBaseSearchForm form) {
        final SearchFormData searchFormData =
            facetStateMapper.mapToFormData(form.getNamespaceIds(), form.getDatasourceIds(), form.getOwnerIds(),
                form.getTagIds(),
                List.of(DATA_SET.getId()), List.of(DataEntityTypeDto.TABLE.getId()));

        return searchService.search(searchFormData);
    }
}
