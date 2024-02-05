package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.DataQualityTestFiltersDto;
import org.springframework.stereotype.Component;

@Component
public class DataQualityTestFiltersMapper {
    public DataQualityTestFiltersDto mapToDto(final List<Long> namespaceIds, final List<Long> datasourceIds,
                                              final List<Long> ownerIds, final List<Long> titleIds,
                                              final List<Long> tagIds, final List<Long> deNamespaceId,
                                              final List<Long> deDatasourceId, final List<Long> deOwnerId,
                                              final List<Long> deTitleId, final List<Long> deTagId) {
        return DataQualityTestFiltersDto.builder()
            .namespaceIds(namespaceIds)
            .datasourceIds(datasourceIds)
            .ownerIds(ownerIds)
            .titleIds(titleIds)
            .tagIds(tagIds)
            .deNamespaceId(deNamespaceId)
            .deDatasourceId(deDatasourceId)
            .deOwnerId(deOwnerId)
            .deTitleId(deTitleId)
            .deTagId(deTagId)
            .build();
    }
}
