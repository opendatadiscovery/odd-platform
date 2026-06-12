package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.DataQualityTestFiltersDto;
import org.springframework.stereotype.Component;

@Component
public class DataQualityTestFiltersMapper {
    public DataQualityTestFiltersDto mapToDto(final List<Long> namespaceIds, final List<Long> datasourceIds,
                                              final List<Long> ownerIds, final List<Long> titleIds,
                                              final List<Long> tagIds, final List<Long> deNamespaceIds,
                                              final List<Long> deDatasourceIds, final List<Long> deOwnerIds,
                                              final List<Long> deTitleIds, final List<Long> deTagIds) {
        return DataQualityTestFiltersDto.builder()
            .namespaceIds(namespaceIds)
            .datasourceIds(datasourceIds)
            .ownerIds(ownerIds)
            .titleIds(titleIds)
            .tagIds(tagIds)
            .deNamespaceIds(deNamespaceIds)
            .deDatasourceIds(deDatasourceIds)
            .deOwnerIds(deOwnerIds)
            .deTitleIds(deTitleIds)
            .deTagIds(deTagIds)
            .build();
    }
}
