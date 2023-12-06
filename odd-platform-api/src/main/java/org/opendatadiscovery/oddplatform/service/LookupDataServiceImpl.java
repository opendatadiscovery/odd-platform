package org.opendatadiscovery.oddplatform.service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTable;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFormData;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnDto;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnTypes;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.LookupTableDefinitionMapper;
import org.opendatadiscovery.oddplatform.mapper.LookupTableMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableDefinitionRepositoryImpl;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReferenceDataRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class LookupDataServiceImpl implements LookupDataService {
    private final ReferenceDataRepository referenceDataRepository;
    private final ReactiveLookupTableRepository tableRepository;
    private final ReactiveLookupTableDefinitionRepositoryImpl tableDefinitionRepository;
    private final ReactiveLookupTableSearchEntrypointRepository lookupTableSearchEntrypointRepository;
    private final LookupTableMapper tableMapper;
    private final LookupTableDefinitionMapper tableDefinitionMapper;

    @Override
    public Mono<LookupTable> createLookupTable(final LookupTableFormData formData) {
        final ReferenceTableDto tableDto = ReferenceTableDto.builder()
            .tableName(formData.getTableName())
            .tableDescription(formData.getDescription())
            .namespace(formData.getNamespace().getName())
            .build();

        return referenceDataRepository.createLookupTable(tableDto)
            .then(tableRepository.create(tableMapper.mapToPojo(formData)))
            .flatMap(item -> createPrimaryKeyDefinition(item.getId())
                .then(tableRepository.getTableWithFieldsById(item.getId())))
            .map(tableMapper::mapToLookupTable)
            .flatMap(this::updateSearchVectors)
            .flatMap(this::updateNamespaceSearchVectors);
    }

    @Override
    public Mono<LookupTable> addColumnsToLookupTable(final Long lookupTableId,
                                                     final List<LookupTableFieldFormData> columns) {
        return tableRepository.get(lookupTableId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("LookupTable", lookupTableId)))
            .flatMap(
                table -> referenceDataRepository.addColumnsToLookupTable(table.getName(), retrieveColumns(columns)))
            .then(tableDefinitionRepository
                .bulkCreate(tableDefinitionMapper.mapListToPojoList(columns, lookupTableId))
                .collectList())
            .then(tableRepository.getTableWithFieldsById(lookupTableId))
            .map(tableMapper::mapToLookupTable)
            .flatMap(this::updateTableDefinitionSearchVectors);
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

    private Mono<LookupTable> updateSearchVectors(final LookupTable lookupTable) {
        return lookupTableSearchEntrypointRepository.updateLookupTableVectors(lookupTable.getTableId())
            .thenReturn(lookupTable);
    }

    private Mono<LookupTable> updateNamespaceSearchVectors(final LookupTable lookupTable) {
        return lookupTableSearchEntrypointRepository.updateNamespaceSearchVectors(lookupTable.getTableId())
            .thenReturn(lookupTable);
    }

    private Mono<LookupTable> updateTableDefinitionSearchVectors(final LookupTable lookupTable) {
        return lookupTableSearchEntrypointRepository
            .updateTableDefinitionSearchVectors(lookupTable.getTableId())
            .thenReturn(lookupTable);
    }

    private Mono<LookupTablesDefinitionsPojo> createPrimaryKeyDefinition(final Long tableId) {
        LookupTablesDefinitionsPojo tablesDefinitionsPojo = new LookupTablesDefinitionsPojo()
            .setColumnName("id")
            .setLookupTableId(tableId)
            .setColumnType(LookupTableFieldType.INTEGER.getValue())
            .setIsPrimaryKey(true);

        return tableDefinitionRepository.create(tablesDefinitionsPojo);
    }
}
