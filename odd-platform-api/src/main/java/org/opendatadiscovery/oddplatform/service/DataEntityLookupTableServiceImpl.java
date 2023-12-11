package org.opendatadiscovery.oddplatform.service;

import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldFormData;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnTypes;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableDto;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldApiMapper;
import org.opendatadiscovery.oddplatform.mapper.DatasetVersionMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.opendatadiscovery.oddrn.Generator;
import org.opendatadiscovery.oddrn.model.ODDPlatformDataEntityLookupTablesPath;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_SET;

@Service
@Slf4j
@RequiredArgsConstructor
public class DataEntityLookupTableServiceImpl implements DataEntityLookupTableService {
    private final Generator oddrnGenerator = Generator.getInstance();

    private final DatasetStructureService datasetStructureService;
    private final ReactiveDatasetFieldRepository reactiveDatasetFieldRepository;
    private final ReactiveDataEntityRepository reactiveDataEntityRepository;
    private final ReactiveDatasetVersionRepository reactiveDatasetVersionRepository;
    private final DataEntityMapper dataEntityMapper;
    private final DatasetFieldApiMapper datasetFieldApiMapper;
    private final DatasetVersionMapper datasetVersionMapper;

    @Override
    @ReactiveTransactional
    public Mono<DataEntityPojo> createLookupDataEntity(final ReferenceTableDto tableDto) {
        return Mono.just(tableDto)
            .map(item -> dataEntityMapper.mapCreatedLookupTablePojo(item, DATA_SET))
            .flatMap(reactiveDataEntityRepository::create)
            .map(pojo -> {
                final String oddrn = generateOddrn(pojo);
                pojo.setOddrn(oddrn);
                return pojo;
            })
            .flatMap(reactiveDataEntityRepository::update)
            .flatMap(this::createVersion);
    }

    @Override
    public Mono<List<DatasetFieldPojo>> createLookupDatasetFields(final List<LookupTableFieldFormData> columns,
                                                                  final Long dataEntityId) {
        final Gson gson = new Gson();
        final List<DatasetFieldPojo> fieldsToCreate = new ArrayList<>();

        for (final LookupTableFieldFormData column : columns) {
            final Map<String, Object> typeMape = new HashMap<>();

            typeMape.put("type", LookupTableColumnTypes.resolveByTypeString(column.getFieldType().getValue())
                .getDatasetFieldType().getValue());
            typeMape.put("is_nullable", column.getIsNullable());
            typeMape.put("is_unique", column.getIsUnique());
            typeMape.put("logical_type", column.getFieldType().getValue());

            final JSONB typeJsonb = JSONB.jsonb(gson.toJson(typeMape));
            final JSONB stats = JSONB.jsonb(gson.toJson(new HashMap<>()));
            fieldsToCreate.add(datasetFieldApiMapper.mapLookupFieldFormToPojo(column,
                typeJsonb,
                stats));
        }

        return reactiveDatasetVersionRepository.getLatestDatasetVersion(dataEntityId)
            .flatMap(version -> {
                    final List<DatasetFieldPojo> collect = version.getDatasetFields().stream()
                        .map(DatasetFieldDto::getDatasetFieldPojo)
                        .collect(Collectors.toList());

                    fieldsToCreate.forEach(
                        pojo -> pojo.setOddrn(version.getDatasetVersion().getDatasetOddrn()
                            + "/field/"
                            + pojo.getName()));

                    collect.addAll(fieldsToCreate);

                    return createVersionWithFields(version, collect);
                }
            );
    }

    @Override
    public Mono<DatasetFieldPojo> createLookupDatasetFields(final LookupTablesDefinitionsPojo definitionPojo,
                                                            final Long dataEntityId) {
        System.out.println("ENITY " + dataEntityId);
        final Map<String, Object> typeMape = new HashMap<>();

        typeMape.put("type", LookupTableColumnTypes.resolveByTypeString(definitionPojo.getColumnType())
            .getDatasetFieldType().getValue());
        typeMape.put("is_nullable", definitionPojo.getIsNullable());
        typeMape.put("is_unique", definitionPojo.getIsUnique());
        typeMape.put("logical_type", definitionPojo.getColumnType());

        final Gson gson = new Gson();
        final JSONB typeJsonb = JSONB.jsonb(gson.toJson(typeMape));
        final JSONB stats = JSONB.jsonb(gson.toJson(new HashMap<>()));

        return reactiveDatasetVersionRepository.getLatestDatasetVersion(dataEntityId)
            .flatMap(version -> {
                    final List<DatasetFieldPojo> collect = version.getDatasetFields().stream()
                        .map(DatasetFieldDto::getDatasetFieldPojo)
                        .collect(Collectors.toList());

                    collect.add(datasetFieldApiMapper.mapLookupFieldToPojo(definitionPojo,
                        version.getDatasetVersion().getDatasetOddrn()
                            + "/field/" + definitionPojo.getColumnName(),
                        typeJsonb, stats));

                    return createVersionWithFields(version, collect);
                }
            )
            .flatMap(datasetFieldPojos -> Mono.just(datasetFieldPojos.get(0)));
    }

    private Mono<List<DatasetFieldPojo>> createVersionWithFields(final DatasetStructureDto version,
                                                                 final List<DatasetFieldPojo> collect) {
        return datasetStructureService
            .createDatasetStructureForSpecificEntity(
                datasetVersionMapper.mapDatasetVersion(version.getDatasetVersion().getDatasetOddrn(),
                    null,
                    version.getDatasetVersion().getVersion() + 1),
                collect);
    }

    private Mono<DataEntityPojo> createVersion(final DataEntityPojo entity) {
        return reactiveDatasetVersionRepository.create(datasetVersionMapper.mapDatasetVersion(entity.getOddrn(),
                null,
                1L))
            .thenReturn(entity);
    }

    private String generateOddrn(final DataEntityPojo pojo) {
        try {
            return oddrnGenerator.generate(ODDPlatformDataEntityLookupTablesPath.builder()
                .id(pojo.getId())
                .build());
        } catch (final Exception e) {
            log.error("Error while generating oddrn for data entity {}", pojo.getId(), e);
            throw new RuntimeException(e);
        }
    }
}
