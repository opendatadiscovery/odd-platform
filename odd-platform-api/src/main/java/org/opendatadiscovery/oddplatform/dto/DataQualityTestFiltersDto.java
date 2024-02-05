package org.opendatadiscovery.oddplatform.dto;

import java.util.List;
import lombok.Builder;

@Builder
public record DataQualityTestFiltersDto(List<Long> namespaceIds,
                                        List<Long> datasourceIds,
                                        List<Long> ownerIds,
                                        List<Long> titleIds,
                                        List<Long> tagIds,
                                        List<Long> deNamespaceId,
                                        List<Long> deDatasourceId,
                                        List<Long> deOwnerId,
                                        List<Long> deTitleId,
                                        List<Long> deTagId) {
}
