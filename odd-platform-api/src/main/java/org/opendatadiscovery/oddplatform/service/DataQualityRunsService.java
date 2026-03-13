package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityBaseSearchForm;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityLatestRunSearchForm;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityResults;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTableHealthSearchForm;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFacetsData;
import reactor.core.publisher.Mono;

public interface DataQualityRunsService {
    Mono<DataQualityResults> getDataQualityTestsRuns(final List<Long> namespaceIds, final List<Long> datasourceIds,
                                                     final List<Long> ownerIds, final List<Long> titleIds,
                                                     final List<Long> tagIds, final List<Long> deNamespaceIds,
                                                     final List<Long> deDatasourceIds, final List<Long> deOwnerIds,
                                                     final List<Long> deTitleIds, final List<Long> deTagIds);

    Mono<SearchFacetsData> createDataQualityLatestRunsSearch(final DataQualityLatestRunSearchForm form);

    Mono<SearchFacetsData> createDataQualityTableHealthSearch(final DataQualityTableHealthSearchForm form);

    Mono<SearchFacetsData> createDataQualityMonitoredTablesSearch(final DataQualityBaseSearchForm form);
}
