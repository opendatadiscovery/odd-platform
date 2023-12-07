package org.opendatadiscovery.oddplatform.service;

import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.tuple.Pair;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTable;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFormData;
import org.opendatadiscovery.oddplatform.mapper.LookupTableDefinitionMapper;
import org.opendatadiscovery.oddplatform.mapper.LookupTableMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableDefinitionRepositoryImpl;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class LookupDataServiceImpl implements LookupDataService {
    private final DataEntityLookupTableService dataEntityLookupTableService;
    private final ReactiveLookupTableRepository tableRepository;
    private final ReactiveNamespaceRepository namespaceRepository;
    private final ReactiveLookupTableDefinitionRepositoryImpl tableDefinitionRepository;
    private final ReactiveLookupTableSearchEntrypointRepository lookupTableSearchEntrypointRepository;
    private final LookupTableMapper tableMapper;
    private final LookupTableDefinitionMapper tableDefinitionMapper;

    @Override
    @ReactiveTransactional
    public Mono<LookupTable> createLookupTable(final LookupTableFormData formData) {
//        todo check namespace
        return namespaceRepository.getByName(formData.getNamespaceName())
            .flatMap(namespacePojo -> dataEntityLookupTableService.createLookupDataEntity(formData, namespacePojo)
                .flatMap(dataEntityPojo ->
                    tableRepository.create(tableMapper.mapToPojo(formData, dataEntityPojo.getId(), namespacePojo))
                )
            )
            .flatMap(item -> createPrimaryKeyDefinition(item)
                .then(tableRepository.getTableWithFieldsById(item.getId())))
            .map(tableMapper::mapToLookupTable)
            .flatMap(this::updateSearchVectors)
            .flatMap(this::updateNamespaceSearchVectors);
    }

    @Override
    @ReactiveTransactional
    public Mono<LookupTable> addColumnsToLookupTable(final Long lookupTableId,
                                                     final Long dataEntityId,
                                                     final List<LookupTableFieldFormData> columns) {
        return dataEntityLookupTableService.createLookupDatasetFields(columns, dataEntityId)
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

        return dataEntityLookupTableService.createLookupDatasetFields(pojo,
                tablesPojo.getDataEntityId())
            .flatMap(item -> tableDefinitionRepository.create(pojo.setDatasetFieldId(item.getId())));
    }
}
