package org.opendatadiscovery.oddplatform.dto;

import java.util.List;
import lombok.Builder;

@Builder
public record DataQualityTestFiltersDto(List<Long> namespaceIds,
                                        List<Long> datasourceIds,
                                        List<Long> ownerIds,
                                        List<Long> titleIds,
                                        List<Long> tagIds,
                                        List<Long> deNamespaceIds,
                                        List<Long> deDatasourceIds,
                                        List<Long> deOwnerIds,
                                        List<Long> deTitleIds,
                                        List<Long> deTagIds) {
}
