package org.opendatadiscovery.oddplatform.service;

import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.tuple.Pair;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTable;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnDto;
import org.opendatadiscovery.oddplatform.dto.LookupTableDto;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableDto;
import org.opendatadiscovery.oddplatform.mapper.LookupTableDefinitionMapper;
import org.opendatadiscovery.oddplatform.mapper.LookupTableMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableDefinitionRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableSearchEntrypointRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class LookupDataServiceImpl implements LookupDataService {
    private final DataEntityLookupTableService dataEntityLookupTableService;
    private final ReactiveLookupTableRepository tableRepository;
    private final ReactiveLookupTableDefinitionRepository tableDefinitionRepository;
    private final ReactiveLookupTableSearchEntrypointRepository lookupTableSearchEntrypointRepository;
    private final LookupTableMapper tableMapper;
    private final LookupTableDefinitionMapper tableDefinitionMapper;

    @Override
    @ReactiveTransactional
    public Mono<LookupTable> createLookupTable(final ReferenceTableDto tableDto) {
        return dataEntityLookupTableService.createLookupDataEntity(tableDto)
            .flatMap(dataEntityPojo ->
                tableRepository.create(tableMapper.mapToPojo(tableDto, dataEntityPojo.getId()))
            )
            .flatMap(item -> createPrimaryKeyDefinition(item)
                .then(tableRepository.getTableWithFieldsById(item.getId())))
            .map(tableMapper::mapToLookupTable)
            .flatMap(this::updateSearchVectors)
            .flatMap(this::updateNamespaceSearchVectors);
    }

    @Override
    public Mono<LookupTableDto> getLookupTableById(final Long lookupTableId) {
        return tableRepository.getTableWithFieldsById(lookupTableId);
    }

    @Override
    public Mono<LookupTableColumnDto> getLookupTableDefinitionById(final Long columnId) {
        return tableDefinitionRepository.getLookupColumnWithTable(columnId);
    }

    @Override
    @ReactiveTransactional
    public Mono<LookupTable> addColumnsToLookupTable(final Long lookupTableId,
                                                     final Long dataEntityId,
                                                     final List<LookupTableFieldFormData> columns) {
        return dataEntityLookupTableService.createOrUpdateLookupDatasetField(columns, dataEntityId)
            .flatMap(fields -> {
                final List<Pair<Long, LookupTableFieldFormData>> formDataWithFieldsId = new ArrayList<>();

                fields.forEach(field -> columns.stream()
                    .filter(column -> field.getName().equals(column.getName()))
                    .map(column -> Pair.of(field.getId(), column))
                    .forEach(formDataWithFieldsId::add));

                return tableDefinitionRepository.bulkCreate(
                        tableDefinitionMapper.mapListToPojoList(formDataWithFieldsId, lookupTableId))
                    .collectList();
            })
            .then(tableRepository.getTableWithFieldsById(lookupTableId))
            .map(tableMapper::mapToLookupTable)
            .flatMap(this::updateTableDefinitionSearchVectors);
    }

    @Override
    @ReactiveTransactional
    public Mono<LookupTable> updateLookupTable(final LookupTableDto table,
                                               final ReferenceTableDto dto) {
        return dataEntityLookupTableService.updateLookupDataEntity(table, dto)
            .then(tableRepository.update(tableMapper.applyToPojo(dto, table.tablesPojo())))
            .flatMap(item -> tableRepository.getTableWithFieldsById(item.getId()))
            .map(tableMapper::mapToLookupTable)
            .flatMap(this::updateSearchVectors);
    }

    @Override
    @ReactiveTransactional
    public Mono<LookupTable> updateLookupTableColumn(final LookupTableColumnDto columnDto,
                                                     final LookupTableFieldUpdateFormData formData) {
        final LookupTablesDefinitionsPojo updatedPojo =
            tableDefinitionMapper.applyToPojo(formData, columnDto.columnPojo());
        return dataEntityLookupTableService
            .updateLookupDatasetField(updatedPojo,
                columnDto.tablesPojo().getDataEntityId(),
                columnDto.columnPojo().getDatasetFieldId())
            .flatMap(fields -> {
                updatedPojo.setDatasetFieldId(fields.getId());
                return tableDefinitionRepository.update(updatedPojo);
            })
            .then(tableRepository.getTableWithFieldsById(columnDto.tablesPojo().getId()))
            .map(tableMapper::mapToLookupTable)
            .flatMap(this::updateTableDefinitionSearchVectors);
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> deleteLookupTable(final LookupTableDto table) {
        return lookupTableSearchEntrypointRepository.deleteByTableId(table.tablesPojo().getId())
            .then(tableDefinitionRepository.deleteByTableId(table.tablesPojo().getId()))
            .then(tableRepository.delete(table.tablesPojo().getId()))
            .then(dataEntityLookupTableService.deleteByDataEntityId(table.tablesPojo().getDataEntityId()));
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> deleteLookupTableField(final LookupTableColumnDto field) {
        return tableDefinitionRepository.deleteFieldById(field.columnPojo().getId())
            .then(dataEntityLookupTableService.deleteByDatasetFieldById(field.tablesPojo().getDataEntityId(),
                field.columnPojo().getDatasetFieldId()));
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

    private Mono<LookupTablesDefinitionsPojo> createPrimaryKeyDefinition(final LookupTablesPojo tablesPojo) {
        final LookupTablesDefinitionsPojo pojo = new LookupTablesDefinitionsPojo()
            .setColumnName("id")
            .setLookupTableId(tablesPojo.getId())
            .setColumnType(LookupTableFieldType.INTEGER.getValue())
            .setIsPrimaryKey(true);

        return dataEntityLookupTableService.createOrUpdateLookupDatasetField(pojo,
                tablesPojo.getDataEntityId())
            .flatMap(item -> tableDefinitionRepository.create(pojo.setDatasetFieldId(item.getId())));
    }
}
