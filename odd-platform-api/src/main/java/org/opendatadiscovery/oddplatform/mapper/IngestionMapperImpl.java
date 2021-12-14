package org.opendatadiscovery.oddplatform.mapper;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.ListUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityType;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataConsumer;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityGroup;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataInput;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataQualityTest;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataTransformer;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTypePojo;
import org.opendatadiscovery.oddplatform.repository.DataEntityTypeRepository;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.dto.DataEntityType.DATA_CONSUMER;
import static org.opendatadiscovery.oddplatform.dto.DataEntityType.DATA_ENTITY_GROUP;
import static org.opendatadiscovery.oddplatform.dto.DataEntityType.DATA_INPUT;
import static org.opendatadiscovery.oddplatform.dto.DataEntityType.DATA_QUALITY_TEST;
import static org.opendatadiscovery.oddplatform.dto.DataEntityType.DATA_QUALITY_TEST_RUN;
import static org.opendatadiscovery.oddplatform.dto.DataEntityType.DATA_SET;
import static org.opendatadiscovery.oddplatform.dto.DataEntityType.DATA_TRANSFORMER;
import static org.opendatadiscovery.oddplatform.dto.DataEntityType.DATA_TRANSFORMER_RUN;

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
        Pair.of(de -> de.getDataQualityTestRun() != null, DATA_QUALITY_TEST_RUN),
        Pair.of(de -> de.getDataEntityGroup() != null, DATA_ENTITY_GROUP),
        Pair.of(de -> de.getDataInput() != null, DATA_INPUT)
    );

    // TODO: filth
    private final DataEntityTypeRepository dataEntityTypeRepository;

    @Override
    public DataEntityIngestionDto createIngestionDto(final DataEntity dataEntity, final long dataSourceId) {
        final Set<DataEntityType> types = defineTypes(dataEntity);
        final String subType = dataEntity.getType().toString();

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

        if (types.contains(DATA_ENTITY_GROUP)) {
            builder = builder.dataEntityGroup(createDataEntityGroupDto(dataEntity.getDataEntityGroup()));
        }

        if (types.contains(DATA_INPUT)) {
            builder = builder.dataInput(createDataInput(dataEntity.getDataInput()));
        }

        return builder.build();
    }

    @Override
    public <T extends DataEntityIngestionDto> DataEntityPojo dtoToPojo(final T dto) {
        final OffsetDateTime createdAt = dto.getCreatedAt();
        final OffsetDateTime updatedAt = dto.getUpdatedAt();

        // TODO: move pojo to the dto
        final DataEntitySubtypePojo subtype = dataEntityTypeRepository.findSubtypeByName(dto.getSubType());
        final boolean isExcludedFromSearch = isExcludedFromSearch(dto);

        final DataEntityPojo pojo = new DataEntityPojo()
            .setExternalName(dto.getName())
            .setExternalDescription(dto.getExternalDescription())
            .setOddrn(dto.getOddrn().toLowerCase())
            .setDataSourceId(dto.getDataSourceId())
            .setCreatedAt(createdAt != null ? createdAt.toLocalDateTime() : null)
            .setUpdatedAt(updatedAt != null ? updatedAt.toLocalDateTime() : null)
            .setSubtypeId(subtype.getId())
            .setHollow(false)
            .setSpecificAttributes(JSONB.jsonb(dto.getSpecificAttributesJson()))
            .setExcludeFromSearch(isExcludedFromSearch);

        if (dto instanceof EnrichedDataEntityIngestionDto entityIngestionDto) {
            pojo.setId(entityIngestionDto.getId());
        }
        return pojo;
    }

    @Override
    public <T extends DataEntityIngestionDto> DataEntityDto ingestDtoToDto(final T ingestionDto) {
        final Set<DataEntityTypePojo> types = ingestionDto.getTypes().stream()
            .map(DataEntityType::toString)
            .map(dataEntityTypeRepository::findTypeByName)
            .collect(Collectors.toSet());

        return DataEntityDto.builder()
            .dataEntity(dtoToPojo(ingestionDto))
            .subtype(dataEntityTypeRepository.findSubtypeByName(ingestionDto.getSubType()))
            .types(types)
            .build();
    }

    @Override
    public List<DataEntityDto> ingestDtoToDto(final Collection<DataEntityIngestionDto> ingestionDtos) {
        return ingestionDtos.stream().map(this::ingestDtoToDto).collect(Collectors.toList());
    }

    private DataEntityIngestionDto.DataSetIngestionDto createDatasetIngestionDto(final DataSet dataEntity) {
        return new DataEntityIngestionDto.DataSetIngestionDto(
            dataEntity.getParentOddrn(),
            dataEntity.getFieldList(),
            structureHash(dataEntity.getFieldList()),
            dataEntity.getRowsNumber()
        );
    }

    private DataEntityIngestionDto.DataTransformerIngestionDto createDataTransformerIngestionDto(
        final DataTransformer dataTransformer
    ) {
        return new DataEntityIngestionDto.DataTransformerIngestionDto(
            ListUtils.emptyIfNull(dataTransformer.getInputs()),
            ListUtils.emptyIfNull(dataTransformer.getOutputs())
        );
    }

    private DataEntityIngestionDto.DataConsumerIngestionDto createDataConsumerIngestionDto(
        final DataConsumer dataConsumer
    ) {
        return new DataEntityIngestionDto.DataConsumerIngestionDto(
            ListUtils.emptyIfNull(dataConsumer.getInputs()));
    }

    private DataEntityIngestionDto.DataQualityTestIngestionDto createDataQualityTestIngestionDto(
        final DataQualityTest dataQualityTest
    ) {
        return new DataEntityIngestionDto.DataQualityTestIngestionDto(
            ListUtils.emptyIfNull(dataQualityTest.getDatasetList()));
    }

    private DataEntityIngestionDto.DataEntityGroupDto createDataEntityGroupDto(
        final DataEntityGroup dataEntityGroup
    ) {
        return new DataEntityIngestionDto.DataEntityGroupDto(
            ListUtils.emptyIfNull(dataEntityGroup.getEntitiesList()),
            dataEntityGroup.getGroupOddrn()
        );
    }

    private DataEntityIngestionDto.DataInputIngestionDto createDataInput(final DataInput dataInput) {
        return DataEntityIngestionDto.DataInputIngestionDto.builder()
            .outputs(dataInput.getOutputs())
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

        final List<HashableDatasetField> sortedFields = fields.stream()
            .map(f -> HashableDatasetField.builder()
                .name(f.getName())
                .oddrn(f.getOddrn())
                .parentFieldOddrn(f.getParentFieldOddrn())
                .type(f.getType())
                .isKey(BooleanUtils.toBoolean(f.getIsKey()))
                .isValue(BooleanUtils.toBoolean(f.getIsValue()))
                .build())
            .sorted(Comparator.comparing(HashableDatasetField::getOddrn))
            .collect(Collectors.toList());

        final StringBuilder sb = new StringBuilder();

        for (final byte b : md.digest(JSONSerDeUtils.serializeJson(sortedFields).getBytes())) {
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
        return switch (type) {
            case DATA_SET -> Pair.of(type, specAttrsMap(List.of(
                Pair.of("rows_count", dataEntity.getDataset().getRowsNumber()),
                Pair.of("fields_count", dataEntity.getDataset().getFieldList().size()),
                Pair.of("parent_dataset", dataEntity.getDataset().getParentOddrn()),
                Pair.of("consumers_count", 0)
            )));

            case DATA_TRANSFORMER -> Pair.of(type, specAttrsMap(List.of(
                Pair.of("source_list", new HashSet<>(dataEntity.getDataTransformer().getInputs())),
                Pair.of("target_list", new HashSet<>(dataEntity.getDataTransformer().getOutputs())),
                Pair.of("source_code_url", dataEntity.getDataTransformer().getSourceCodeUrl())
            )));

            case DATA_CONSUMER -> Pair.of(type, specAttrsMap(List.of(
                Pair.of("input_list", new HashSet<>(dataEntity.getDataConsumer().getInputs()))
            )));

            case DATA_QUALITY_TEST -> Pair.of(type, specAttrsMap(List.of(
                Pair.of("suite_name", dataEntity.getDataQualityTest().getSuiteName()),
                Pair.of("suite_url", dataEntity.getDataQualityTest().getSuiteUrl()),
                Pair.of("linked_url_list", dataEntity.getDataQualityTest().getLinkedUrlList()),
                Pair.of("dataset_list", new HashSet<>(dataEntity.getDataQualityTest().getDatasetList())),
                Pair.of("expectation", dataEntity.getDataQualityTest().getExpectation())
            )));

            case DATA_INPUT -> Pair.of(type, specAttrsMap(List.of(
                Pair.of("output_list", new HashSet<>(dataEntity.getDataInput().getOutputs()))
            )));

            default -> null;
        };
    }

    private <K, V> Map<K, V> specAttrsMap(final List<Pair<K, V>> pairs) {
        return pairs.stream()
            .filter(p -> p.getRight() != null && p.getLeft() != null)
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));
    }

    private <T extends DataEntityIngestionDto> boolean isExcludedFromSearch(final T dto) {
        return Optional.ofNullable(dto)
            .map(DataEntityIngestionDto::getDataEntityGroup)
            .map(group -> group.groupOddrn() != null)
            .orElse(false);
    }

    @Data
    @Builder
    @AllArgsConstructor
    static class HashableDatasetField {
        private String oddrn;
        private String name;
        private String parentFieldOddrn;
        private DataSetFieldType type;
        private boolean isKey;
        private boolean isValue;
    }
}
