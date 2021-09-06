package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.dto.DataEntityDto;
import com.provectus.oddplatform.dto.DataEntityIngestionDto;
import com.provectus.oddplatform.dto.DataEntitySubtype;
import com.provectus.oddplatform.dto.DataEntityType;
import com.provectus.oddplatform.dto.EnrichedDataEntityIngestionDto;
import com.provectus.oddplatform.ingestion.contract.model.DataConsumer;
import com.provectus.oddplatform.ingestion.contract.model.DataEntity;
import com.provectus.oddplatform.ingestion.contract.model.DataQualityTest;
import com.provectus.oddplatform.ingestion.contract.model.DataSet;
import com.provectus.oddplatform.ingestion.contract.model.DataSetField;
import com.provectus.oddplatform.ingestion.contract.model.DataTransformer;
import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTypePojo;
import com.provectus.oddplatform.repository.DataEntityTypeRepository;
import com.provectus.oddplatform.utils.JSONSerDeUtils;
import com.provectus.oddplatform.utils.Pair;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.ListUtils;
import org.jooq.JSONB;
import org.springframework.stereotype.Component;

import static com.provectus.oddplatform.dto.DataEntityType.DATA_CONSUMER;
import static com.provectus.oddplatform.dto.DataEntityType.DATA_QUALITY_TEST;
import static com.provectus.oddplatform.dto.DataEntityType.DATA_QUALITY_TEST_RUN;
import static com.provectus.oddplatform.dto.DataEntityType.DATA_SET;
import static com.provectus.oddplatform.dto.DataEntityType.DATA_TRANSFORMER;
import static com.provectus.oddplatform.dto.DataEntityType.DATA_TRANSFORMER_RUN;

@Component
@RequiredArgsConstructor
@Slf4j
public class IngestionMapperImpl implements IngestionMapper {
    private static final List<Pair<Predicate<DataEntity>, DataEntityType>> TYPE_DICT_DISCRIMINATOR = List.of(
            Pair.of(de -> de.getDataset() != null, DATA_SET),
            Pair.of(de -> de.getDataTransformer() != null, DATA_TRANSFORMER),
            Pair.of(de -> de.getDataTransformerRun() != null, DATA_TRANSFORMER_RUN),
            Pair.of(de -> de.getDataConsumer() != null, DATA_CONSUMER),
            Pair.of(de -> de.getDataQualityTest() != null, DATA_QUALITY_TEST),
            Pair.of(de -> de.getDataQualityTestRun() != null, DATA_QUALITY_TEST_RUN)
    );

    // TODO: filth
    private final DataEntityTypeRepository dataEntityTypeRepository;

    @Override
    public DataEntityIngestionDto createIngestionDto(final DataEntity dataEntity, final long dataSourceId) {
        // TODO: validate subtype
        final Set<DataEntityType> types = defineTypes(dataEntity);
        final DataEntitySubtype subType = DataEntitySubtype.valueOf(dataEntity.getType().toString());

        DataEntityIngestionDto.DataEntityIngestionDtoBuilder builder = DataEntityIngestionDto.builder()
                .name(dataEntity.getName())
                .oddrn(dataEntity.getOddrn().toLowerCase())
                .externalDescription(dataEntity.getDescription())
                .dataSourceId(dataSourceId)
                .createdAt(dataEntity.getCreatedAt())
                .updatedAt(dataEntity.getUpdatedAt())
                .types(types)
                .subType(subType)
                .specificAttributesJson(specificAttributesAsString(types, dataEntity));

        if (dataEntity.getMetadata() != null && !dataEntity.getMetadata().isEmpty()) {
            builder = builder.metadata(dataEntity.getMetadata().get(0).getMetadata());
        }

        if (types.contains(DATA_SET)) {
            builder = builder.dataSet(createDatasetIngestionDto(dataEntity.getDataset()));
        }

        if (types.contains(DATA_TRANSFORMER)) {
            builder = builder.dataTransformer(createDataTransformerIngestionDto(dataEntity.getDataTransformer()));
        }

        if (types.contains(DATA_CONSUMER)) {
            builder = builder.dataConsumer(createDataConsumerIngestionDto(dataEntity.getDataConsumer()));
        }

        if (types.contains(DATA_QUALITY_TEST)) {
            builder = builder.datasetQualityTest(createDataQualityTestIngestionDto(dataEntity.getDataQualityTest()));
        }

        return builder.build();
    }

    @Override
    public List<DataEntityIngestionDto> createIngestionDto(final Collection<DataEntity> dataEntities,
                                                           final long dataSourceId) {
        return dataEntities.stream()
                .map(e -> createIngestionDto(e, dataSourceId))
                .collect(Collectors.toList());
    }

    @Override
    public DataEntityPojo dtoToPojo(final EnrichedDataEntityIngestionDto dto) {
        final OffsetDateTime createdAt = dto.getCreatedAt();
        final OffsetDateTime updatedAt = dto.getUpdatedAt();

        // TODO: can be stored in the DataEntityIngestionDto as well
        final DataEntitySubtypePojo subtype = dataEntityTypeRepository.findSubtypeByName(dto.getSubType().toString());

        return new DataEntityPojo()
                .setId(dto.getId())
                .setExternalName(dto.getName())
                .setExternalDescription(dto.getExternalDescription())
                .setOddrn(dto.getOddrn().toLowerCase())
                .setDataSourceId(dto.getDataSourceId())
                .setCreatedAt(createdAt != null ? createdAt.toLocalDateTime() : null)
                .setUpdatedAt(updatedAt != null ? updatedAt.toLocalDateTime() : null)
                .setSubtypeId(subtype.getId())
                .setHollow(false)
                .setSpecificAttributes(JSONB.jsonb(dto.getSpecificAttributesJson()));
    }

    @Override
    public DataEntityPojo dtoToPojo(final DataEntityIngestionDto dto) {
        final OffsetDateTime createdAt = dto.getCreatedAt();
        final OffsetDateTime updatedAt = dto.getUpdatedAt();

        // TODO: can be stored in the DataEntityIngestionDto as well
        final DataEntitySubtypePojo subtype = dataEntityTypeRepository.findSubtypeByName(dto.getSubType().toString());

        return new DataEntityPojo()
                .setExternalName(dto.getName())
                .setExternalDescription(dto.getExternalDescription())
                .setOddrn(dto.getOddrn().toLowerCase())
                .setDataSourceId(dto.getDataSourceId())
                .setCreatedAt(createdAt != null ? createdAt.toLocalDateTime() : null)
                .setUpdatedAt(updatedAt != null ? updatedAt.toLocalDateTime() : null)
                .setSubtypeId(subtype.getId())
                .setHollow(false)
                .setSpecificAttributes(JSONB.jsonb(dto.getSpecificAttributesJson()));
    }

    @Override
    public List<DataEntityPojo> dtoToPojo(final List<EnrichedDataEntityIngestionDto> dtos) {
        return dtos.stream().map(this::dtoToPojo).collect(Collectors.toList());
    }

    @Override
    public DataEntityDto ingestDtoToDto(final DataEntityIngestionDto ingestionDto) {
        final Set<DataEntityTypePojo> types = ingestionDto.getTypes().stream()
                .map(DataEntityType::toString)
                .map(dataEntityTypeRepository::findTypeByName)
                .collect(Collectors.toSet());

        return DataEntityDto.builder()
                .dataEntity(dtoToPojo(ingestionDto))
                .subtype(dataEntityTypeRepository.findSubtypeByName(ingestionDto.getSubType().toString()))
                .types(types)
                .build();
    }

    @Override
    public DataEntityDto ingestDtoToDto(final EnrichedDataEntityIngestionDto ingestionDto) {
        final Set<DataEntityTypePojo> types = ingestionDto.getTypes().stream()
                .map(DataEntityType::toString)
                .map(dataEntityTypeRepository::findTypeByName)
                .collect(Collectors.toSet());

        return DataEntityDto.builder()
                .dataEntity(dtoToPojo(ingestionDto))
                .subtype(dataEntityTypeRepository.findSubtypeByName(ingestionDto.getSubType().toString()))
                .types(types)
                .build();
    }

    @Override
    public List<DataEntityDto> ingestDtoToDto(final Collection<DataEntityIngestionDto> ingestionDtos) {
        return ingestionDtos.stream().map(this::ingestDtoToDto).collect(Collectors.toList());
    }

    private DataEntityIngestionDto.DataSetIngestionDto createDatasetIngestionDto(final DataSet dataEntity) {
        return DataEntityIngestionDto.DataSetIngestionDto.builder()
                .rowsCount(dataEntity.getRowsNumber())
                .fieldList(dataEntity.getFieldList())
                .structureHash(structureHash(dataEntity.getFieldList()))
                .parentDatasetOddrn(dataEntity.getParentOddrn())
                .build();
    }

    private DataEntityIngestionDto.DataTransformerIngestionDto createDataTransformerIngestionDto(
            final DataTransformer dataTransformer
    ) {
        return DataEntityIngestionDto.DataTransformerIngestionDto.builder()
                .sourceList(ListUtils.emptyIfNull(dataTransformer.getInputs()))
                .targetList(ListUtils.emptyIfNull(dataTransformer.getOutputs()))
                .build();
    }

    private DataEntityIngestionDto.DataConsumerIngestionDto createDataConsumerIngestionDto(
            final DataConsumer dataConsumer
    ) {
        return DataEntityIngestionDto.DataConsumerIngestionDto.builder()
                .inputList(ListUtils.emptyIfNull(dataConsumer.getInputs()))
                .build();
    }

    private DataEntityIngestionDto.DataQualityTestIngestionDto createDataQualityTestIngestionDto(
            final DataQualityTest dataQualityTest
    ) {
        return DataEntityIngestionDto.DataQualityTestIngestionDto.builder()
                .datasetList(ListUtils.emptyIfNull(dataQualityTest.getDatasetList()))
                .build();
    }

    private Set<DataEntityType> defineTypes(final DataEntity dataEntity) {
        final Set<DataEntityType> types = TYPE_DICT_DISCRIMINATOR.stream()
                .map(disc -> disc.getLeft().test(dataEntity) ? disc.getRight() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (types.isEmpty()) {
            throw new IllegalArgumentException("No supported type was found");
        }

        return types;
    }

    private String structureHash(final List<DataSetField> fields) {
        if (fields == null) {
            return null;
        }

        final MessageDigest md = createSHA256MessageDigest();

        final StringBuilder sb = new StringBuilder();

        for (final byte b : md.digest(JSONSerDeUtils.serializeJson(fields).getBytes())) {
            sb.append(Integer.toString((b & 0xff) + 0x100, 16).substring(1));
        }

        return sb.toString();
    }

    private MessageDigest createSHA256MessageDigest() {
        try {
            return MessageDigest.getInstance("SHA-256");
        } catch (final NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private String specificAttributesAsString(final Collection<DataEntityType> types,
                                              final DataEntity dataEntity) {
        return JSONSerDeUtils.serializeJson(defineSpecificAttributes(types, dataEntity));
    }

    private Map<DataEntityType, Map<String, ?>> defineSpecificAttributes(
            final Collection<DataEntityType> types,
            final DataEntity dataEntity
    ) {
        return types.stream()
                .map(t -> defineSpecificAttributes(dataEntity, t))
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));
    }

    // TODO: refactor using models and dtos
    private Pair<DataEntityType, Map<String, ?>> defineSpecificAttributes(
            final DataEntity dataEntity,
            final DataEntityType type
    ) {
        switch (type) {
            case DATA_SET:
                return Pair.of(type, createMap(
                        Pair.of("rows_count", dataEntity.getDataset().getRowsNumber()),
                        Pair.of("fields_count", dataEntity.getDataset().getFieldList().size()),
                        Pair.of("consumers_count", 0)
                ));

            case DATA_TRANSFORMER:
                return Pair.of(type, createMap(
                        Pair.of("source_list", dataEntity.getDataTransformer().getInputs()),
                        Pair.of("target_list", dataEntity.getDataTransformer().getOutputs()),
                        Pair.of("source_code_url", dataEntity.getDataTransformer().getSourceCodeUrl())
                ));
            case DATA_CONSUMER:
                return Pair.of(type, createMap(
                        Pair.of("input_list", dataEntity.getDataConsumer().getInputs())
                ));
            case DATA_QUALITY_TEST:
                return Pair.of(type, createMap(
                        Pair.of("suite_name", dataEntity.getDataQualityTest().getSuiteName()),
                        Pair.of("suite_url", dataEntity.getDataQualityTest().getSuiteUrl()),
                        Pair.of("linked_url_list", dataEntity.getDataQualityTest().getLinkedUrlList()),
                        Pair.of("dataset_list", dataEntity.getDataQualityTest().getDatasetList()),
                        Pair.of("expectation", dataEntity.getDataQualityTest().getExpectation())
                ));

            default:
                log.warn("There's no specific attributes support for type: {}", type);
                return null;
        }
    }

    private <K, V> Map<K, V> createMap(final Pair<K, V>... pairs) {
        return Arrays.stream(pairs)
                .filter(p -> p.getRight() != null && p.getLeft() != null)
                .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));
    }
}
