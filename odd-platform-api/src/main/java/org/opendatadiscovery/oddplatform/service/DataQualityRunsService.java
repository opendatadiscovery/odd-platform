package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityResults;
import reactor.core.publisher.Mono;

public interface DataQualityRunsService {
    Mono<DataQualityResults> getDataQualityTestsRuns(final List<Long> namespaceIds, final List<Long> datasourceIds,
                                                     final List<Long> ownerIds, final List<Long> titleIds,
                                                     final List<Long> tagIds, final List<Long> deNamespaceId,
                                                     final List<Long> deDatasourceId, final List<Long> deOwnerId,
                                                     final List<Long> deTitleId, final List<Long> deTagId);
}
