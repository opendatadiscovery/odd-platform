package org.opendatadiscovery.oddplatform.service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTable;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableField;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableRowFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableRowList;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnTypes;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableColumnDto;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableDto;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.LookupTableDefinitionMapper;
import org.opendatadiscovery.oddplatform.mapper.LookupTableMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReferenceDataRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ReferenceDataServiceImpl implements ReferenceDataService {
    private final LookupDataService lookupDataService;
    private final ReferenceDataRepository referenceDataRepository;
    private final ReactiveLookupTableRepository tableRepository;
    private final ReactiveNamespaceRepository namespaceRepository;
    private final LookupTableDefinitionMapper tableDefinitionMapper;
    private final LookupTableMapper tableMapper;

    @Override
    public Mono<LookupTableRowList> getLookupTableRowList(final Long lookupTableId,
                                                          final Integer page,
                                                          final Integer size) {
        return lookupDataService.getLookupTableById(lookupTableId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("LookupTable", lookupTableId)))
            .flatMap(table -> referenceDataRepository.getLookupTableRowList(table, page, size));
    }

    @Override
    public Mono<LookupTable> getLookupTableById(final Long lookupTableId) {
        return lookupDataService.getLookupTableById(lookupTableId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("LookupTable", lookupTableId)))
            .map(tableMapper::mapToLookupTable);
    }

    @Override
    public Mono<LookupTableField> getLookupTableField(final Long lookupTableId, final Long columnId) {
        return lookupDataService.getLookupTableDefinitionById(columnId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("LookupTableDefinition", columnId)))
            .map(field -> {
                if (!field.tablesPojo().getId().equals(lookupTableId)) {
                    throw new BadUserRequestException("%s doesn't belong to %s",
                        field.columnPojo().getColumnName(),
                        field.tablesPojo().getName());
                }

                return tableDefinitionMapper.mapPojoToTablesField(field.columnPojo());
            });
    }

    @Override
    public Mono<LookupTable> createLookupTable(final LookupTableFormData formData) {
        return namespaceRepository.getByName(formData.getNamespaceName())
            .flatMap(namespacePojo -> {
                final ReferenceTableDto tableDto = ReferenceTableDto.builder()
                    .name(formData.getName())
                    .tableName(buildTableName(formData.getName(), namespacePojo))
                    .tableDescription(formData.getDescription())
                    .namespacePojo(namespacePojo)
                    .build();

                return referenceDataRepository.createLookupTable(tableDto)
                    .then(lookupDataService.createLookupTable(tableDto));
            });
    }

    @Override
    public Mono<LookupTable> addColumnsToLookupTable(final Long lookupTableId,
                                                     final List<LookupTableFieldFormData> columns) {
        return tableRepository.get(lookupTableId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("LookupTable", lookupTableId)))
            .flatMap(table ->
                referenceDataRepository.addColumnsToLookupTable(table.getTableName(), retrieveColumns(columns))
                    .then(lookupDataService.addColumnsToLookupTable(lookupTableId, table.getDataEntityId(), columns)));
    }

    @Override
    public Mono<LookupTableRowList> addDataToLookupTable(final Long lookupTableId,
                                                         final List<LookupTableRowFormData> items) {
        return lookupDataService.getLookupTableById(lookupTableId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("LookupTable", lookupTableId)))
            .flatMap(table -> referenceDataRepository.addDataToLookupTable(table, items));
    }

    @Override
    public Mono<LookupTable> updateLookupTable(final Long lookupTableId,
                                               final LookupTableUpdateFormData formData) {
        return lookupDataService.getLookupTableById(lookupTableId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("LookupTable", lookupTableId)))
            .flatMap(table -> {
                final ReferenceTableDto tableDto = ReferenceTableDto.builder()
                    .name(formData.getName())
                    .tableName(buildTableName(formData.getName(), table.namespacePojo()))
                    .tableDescription(formData.getDescription())
                    .namespacePojo(table.namespacePojo())
                    .build();

                return (table.tablesPojo().getTableName().equals(tableDto.getTableName())
                    ? Mono.empty()
                    : referenceDataRepository.updateLookupTable(table, tableDto)
                ).then(lookupDataService.updateLookupTable(table, tableDto));
            });
    }

    @Override
    public Mono<LookupTable> updateLookupTableField(final Long columnId,
                                                    final LookupTableFieldUpdateFormData formData) {
        return lookupDataService.getLookupTableDefinitionById(columnId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("LookupTableDefinition", columnId)))
            .flatMap(columnDto -> {
                final ReferenceTableColumnDto inputColumnInfo = ReferenceTableColumnDto.builder()
                    .name(formData.getName())
                    .defaultValue(StringUtils.isNotBlank(formData.getDefaultValue())
                        ? formData.getDefaultValue()
                        : null)
                    .isNullable(formData.getIsNullable() != null ? formData.getIsNullable() : true)
                    .isUnique(formData.getIsUnique() != null ? formData.getIsUnique() : false)
                    .build();
                return referenceDataRepository.updateLookupTableColumn(columnDto, inputColumnInfo)
                    .then(lookupDataService.updateLookupTableColumn(columnDto, formData));
            });
    }

    @Override
    public Mono<LookupTableRowList> updateLookupTableRow(final Long lookupTableId, final Long rowId,
                                                         final LookupTableRowFormData item) {
        return lookupDataService.getLookupTableById(lookupTableId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("LookupTable", lookupTableId)))
            .flatMap(table -> referenceDataRepository.updateLookupTableRow(table, item, rowId));
    }

    @Override
    public Mono<Void> deleteLookupTable(final Long lookupTableId) {
        return lookupDataService.getLookupTableById(lookupTableId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("LookupTable", lookupTableId)))
            .flatMap(table -> referenceDataRepository.deleteLookupTable(table)
                .then(lookupDataService.deleteLookupTable(table)));
    }

    @Override
    public Mono<Void> deleteLookupTableField(final Long columnId) {
        return lookupDataService.getLookupTableDefinitionById(columnId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("LookupTableDefinition", columnId)))
            .flatMap(field -> referenceDataRepository.deleteLookupTableField(field)
                .then(lookupDataService.deleteLookupTableField(field)));
    }

    @Override
    public Mono<Void> deleteLookupTableRow(final Long lookupTableId, final Long rowId) {
        return lookupDataService.getLookupTableById(lookupTableId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("LookupTable", lookupTableId)))
            .flatMap(table -> referenceDataRepository.deleteLookupTableRow(table, rowId));
    }

    private List<ReferenceTableColumnDto> retrieveColumns(final List<LookupTableFieldFormData> columns) {
        if (CollectionUtils.isEmpty(columns)) {
            return Collections.emptyList();
        }

        return columns.stream().map(column -> ReferenceTableColumnDto.builder()
                .name(column.getName())
                .dataType(LookupTableColumnTypes.resolveByTypeString(column.getFieldType().name()))
                .defaultValue(StringUtils.isNotBlank(column.getDefaultValue()) ? column.getDefaultValue() : null)
                .isNullable(column.getIsNullable() != null ? column.getIsNullable() : true)
                .isUnique(column.getIsUnique() != null ? column.getIsUnique() : false)
                .build())
            .collect(Collectors.toList());
    }

    private String buildTableName(final String name, final NamespacePojo namespacePojo) {
        final String fixedName = name.toLowerCase().replace(" ", "_");
        return "n_" + namespacePojo.getId() + "__" + fixedName;
    }
}
