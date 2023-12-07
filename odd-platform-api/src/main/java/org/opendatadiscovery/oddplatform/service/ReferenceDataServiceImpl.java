package org.opendatadiscovery.oddplatform.service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTable;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFormData;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnDto;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnTypes;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReferenceDataRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ReferenceDataServiceImpl implements ReferenceDataService {
    private final LookupDataService lookupDataService;
    private final ReferenceDataRepository referenceDataRepository;
    private final ReactiveLookupTableRepository tableRepository;

    @Override
    public Mono<LookupTable> createLookupTable(final LookupTableFormData formData) {
        final ReferenceTableDto tableDto = ReferenceTableDto.builder()
            .tableName(formData.getTableName())
            .tableDescription(formData.getDescription())
            .namespace(formData.getNamespaceName())
            .build();

        return referenceDataRepository.createLookupTable(tableDto)
            .then(lookupDataService.createLookupTable(formData));
    }

    @Override
    public Mono<LookupTable> addColumnsToLookupTable(final Long lookupTableId,
                                                     final List<LookupTableFieldFormData> columns) {
        return tableRepository.get(lookupTableId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("LookupTable", lookupTableId)))
            .flatMap(table -> referenceDataRepository.addColumnsToLookupTable(table.getName(), retrieveColumns(columns))
                .then(lookupDataService.addColumnsToLookupTable(lookupTableId, table.getDataEntityId(), columns)));
    }

    private List<LookupTableColumnDto> retrieveColumns(final List<LookupTableFieldFormData> columns) {
        if (CollectionUtils.isEmpty(columns)) {
            return Collections.emptyList();
        }

        return columns.stream().map(column -> LookupTableColumnDto.builder()
                .name(column.getName())
                .dataType(LookupTableColumnTypes.resolveByTypeString(column.getFieldType().name()))
                .defaultValue(StringUtils.isNotBlank(column.getDefaultValue()) ? column.getDefaultValue() : null)
                .isNullable(column.getIsNullable() != null ? column.getIsNullable() : true)
                .isUnique(column.getIsUnique() != null ? column.getIsUnique() : false)
                .build())
            .collect(Collectors.toList());
    }
}
