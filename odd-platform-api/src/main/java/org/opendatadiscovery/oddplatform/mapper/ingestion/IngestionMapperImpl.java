package org.opendatadiscovery.oddplatform.mapper.ingestion;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.Comparator;
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
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.ListUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataConsumer;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityGroup;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataInput;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataQualityTest;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataQualityTestRun;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataTransformer;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataTransformerRun;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Tag;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_CONSUMER;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_ENTITY_GROUP;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_INPUT;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_QUALITY_TEST;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_QUALITY_TEST_RUN;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_SET;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_TRANSFORMER;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_TRANSFORMER_RUN;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataConsumerIngestionDto;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataEntityGroupDto;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataInputIngestionDto;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataQualityTestIngestionDto;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataSetIngestionDto;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataTransformerIngestionDto;

@Component
@RequiredArgsConstructor
@Slf4j
public class IngestionMapperImpl implements IngestionMapper {
    private final DatasetFieldIngestionMapper datasetFieldIngestionMapper;

    private static final List<Pair<Predicate<DataEntity>, DataEntityClassDto>> ENTITY_CLASS_DISCRIMINATOR = List.of(
        Pair.of(de -> de.getDataset() != null, DATA_SET),
        Pair.of(de -> de.getDataTransformer() != null, DATA_TRANSFORMER),
        Pair.of(de -> de.getDataTransformerRun() != null, DATA_TRANSFORMER_RUN),
        Pair.of(de -> de.getDataConsumer() != null, DATA_CONSUMER),
        Pair.of(de -> de.getDataQualityTest() != null, DATA_QUALITY_TEST),
        Pair.of(de -> de.getDataQualityTestRun() != null, DATA_QUALITY_TEST_RUN),
        Pair.of(de -> de.getDataEntityGroup() != null, DATA_ENTITY_GROUP),
        Pair.of(de -> de.getDataInput() != null, DATA_INPUT)
    );

    @Override
    public DataEntityIngestionDto createIngestionDto(final DataEntity dataEntity, final long dataSourceId) {
        final Set<DataEntityClassDto> entityClasses = defineEntityClasses(dataEntity);
        final DataEntityTypeDto type = DataEntityTypeDto.valueOf(dataEntity.getType().getValue());

        DataEntityIngestionDto.DataEntityIngestionDtoBuilder builder = DataEntityIngestionDto.builder()
            .name(dataEntity.getName())
            .oddrn(dataEntity.getOddrn())
            .externalDescription(dataEntity.getDescription())
            .dataSourceId(dataSourceId)
            .createdAt(dataEntity.getCreatedAt())
            .updatedAt(dataEntity.getUpdatedAt())
            .entityClasses(entityClasses)
            .type(type)
            .specificAttributesJson(specificAttributesAsString(entityClasses, dataEntity));

        if (dataEntity.getMetadata() != null && !dataEntity.getMetadata().isEmpty()) {
            builder = builder.metadata(dataEntity.getMetadata().get(0).getMetadata());
        }

        if (CollectionUtils.isNotEmpty(dataEntity.getTags())) {
            builder = builder.tags(dataEntity.getTags().stream().map(Tag::getName).toList());
        }

        if (entityClasses.contains(DATA_SET)) {
            builder = builder.dataSet(createDatasetIngestionDto(dataEntity.getDataset()));
        }

        if (entityClasses.contains(DATA_TRANSFORMER)) {
            builder = builder.dataTransformer(createDataTransformerIngestionDto(dataEntity.getDataTransformer()));
        }

        if (entityClasses.contains(DATA_CONSUMER)) {
            builder = builder.dataConsumer(createDataConsumerIngestionDto(dataEntity.getDataConsumer()));
        }

        if (entityClasses.contains(DATA_QUALITY_TEST)) {
            builder = builder.dataQualityTest(createDataQualityTestIngestionDto(dataEntity.getDataQualityTest()));
        }

        if (entityClasses.contains(DATA_ENTITY_GROUP)) {
            builder = builder.dataEntityGroup(createDataEntityGroupDto(dataEntity.getDataEntityGroup()));
        }

        if (entityClasses.contains(DATA_INPUT)) {
            builder = builder.dataInput(createDataInput(dataEntity.getDataInput()));
        }

        return builder.build();
    }

    @Override
    public <T extends DataEntityIngestionDto> DataEntityPojo dtoToPojo(final T dto) {
        final OffsetDateTime createdAt = dto.getCreatedAt();
        final OffsetDateTime updatedAt = dto.getUpdatedAt();

        final Integer[] entityClassesIds = dto.getEntityClasses()
            .stream()
            .map(DataEntityClassDto::getId)
            .toArray(Integer[]::new);

        final DataEntityPojo pojo = new DataEntityPojo()
            .setExternalName(dto.getName())
            .setExternalDescription(dto.getExternalDescription())
            .setOddrn(dto.getOddrn())
            .setDataSourceId(dto.getDataSourceId())
            .setEntityClassIds(entityClassesIds)
            .setCreatedAt(createdAt != null ? createdAt.toLocalDateTime() : null)
            .setUpdatedAt(updatedAt != null ? updatedAt.toLocalDateTime() : null)
            .setTypeId(dto.getType().getId())
            .setHollow(false)
            .setSpecificAttributes(JSONB.jsonb(dto.getSpecificAttributesJson()))
            .setExcludeFromSearch(isExcludedFromSearch(dto))
            .setManuallyCreated(false)
            .setIsDeleted(false);

        if (dto instanceof EnrichedDataEntityIngestionDto entityIngestionDto) {
            pojo.setId(entityIngestionDto.getId());
        }

        return pojo;
    }

    @Override
    public <T extends DataEntityIngestionDto> List<DataEntityPojo> dtoToPojo(final Collection<T> dtos) {
        return dtos.stream().map(this::dtoToPojo).collect(Collectors.toList());
    }

    @Override
    public IngestionTaskRun mapTaskRun(final DataEntity dataEntity) {
        if (dataEntity.getDataTransformerRun() == null && dataEntity.getDataQualityTestRun() == null) {
            throw new IllegalArgumentException("Data Entity doesn't have task run data");
        }

        return dataEntity.getDataTransformerRun() != null
            ? mapTaskRun(dataEntity.getDataTransformerRun(), dataEntity.getName(), dataEntity.getOddrn())
            : mapTaskRun(dataEntity.getDataQualityTestRun(), dataEntity.getName(), dataEntity.getOddrn());
    }

    private IngestionTaskRun mapTaskRun(final DataTransformerRun transformerRun,
                                        final String name,
                                        final String oddrn) {
        return IngestionTaskRun.builder()
            .taskRunName(name)
            .oddrn(oddrn)
            .taskOddrn(transformerRun.getTransformerOddrn())
            .startTime(transformerRun.getStartTime())
            .endTime(transformerRun.getEndTime())
            .status(IngestionTaskRun.IngestionTaskRunStatus.valueOf(transformerRun.getStatus().name()))
            .statusReason(transformerRun.getStatusReason())
            .type(IngestionTaskRun.IngestionTaskRunType.DATA_TRANSFORMER_RUN)
            .build();
    }

    private IngestionTaskRun mapTaskRun(final DataQualityTestRun dataQualityTestRun,
                                        final String name,
                                        final String oddrn) {
        return IngestionTaskRun.builder()
            .taskRunName(name)
            .oddrn(oddrn)
            .taskOddrn(dataQualityTestRun.getDataQualityTestOddrn())
            .startTime(dataQualityTestRun.getStartTime())
            .endTime(dataQualityTestRun.getEndTime())
            .status(IngestionTaskRun.IngestionTaskRunStatus.valueOf(dataQualityTestRun.getStatus().name()))
            .statusReason(dataQualityTestRun.getStatusReason())
            .type(IngestionTaskRun.IngestionTaskRunType.DATA_QUALITY_TEST_RUN)
            .build();
    }

    private DataSetIngestionDto createDatasetIngestionDto(final DataSet dataEntity) {
        return new DataSetIngestionDto(
            dataEntity.getParentOddrn(),
            datasetFieldIngestionMapper.mapFields(dataEntity.getFieldList()),
            structureHash(dataEntity.getFieldList()),
            dataEntity.getRowsNumber()
        );
    }

    private DataTransformerIngestionDto createDataTransformerIngestionDto(final DataTransformer dataTransformer) {
        return new DataTransformerIngestionDto(
            ListUtils.emptyIfNull(dataTransformer.getInputs()),
            ListUtils.emptyIfNull(dataTransformer.getOutputs())
        );
    }

    private DataConsumerIngestionDto createDataConsumerIngestionDto(final DataConsumer dataConsumer) {
        return new DataConsumerIngestionDto(ListUtils.emptyIfNull(dataConsumer.getInputs()));
    }

    private DataQualityTestIngestionDto createDataQualityTestIngestionDto(final DataQualityTest dataQualityTest) {
        return new DataQualityTestIngestionDto(ListUtils.emptyIfNull(dataQualityTest.getDatasetList()));
    }

    private DataEntityGroupDto createDataEntityGroupDto(final DataEntityGroup dataEntityGroup) {
        return new DataEntityGroupDto(
            ListUtils.emptyIfNull(dataEntityGroup.getEntitiesList()),
            dataEntityGroup.getGroupOddrn()
        );
    }

    private DataInputIngestionDto createDataInput(final DataInput dataInput) {
        return new DataInputIngestionDto(
            ListUtils.emptyIfNull(dataInput.getOutputs())
        );
    }

    private Set<DataEntityClassDto> defineEntityClasses(final DataEntity dataEntity) {
        final Set<DataEntityClassDto> entityClasses = ENTITY_CLASS_DISCRIMINATOR.stream()
            .map(disc -> disc.getLeft().test(dataEntity) ? disc.getRight() : null)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        if (entityClasses.isEmpty()) {
            throw new IllegalArgumentException(
                String.format("There's no supported class for entity %s", dataEntity.getOddrn()));
        }

        return entityClasses;
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

    private String specificAttributesAsString(final Collection<DataEntityClassDto> entityClasses,
                                              final DataEntity dataEntity) {
        return JSONSerDeUtils.serializeJson(defineSpecificAttributes(entityClasses, dataEntity));
    }

    private Map<DataEntityClassDto, Map<String, ?>> defineSpecificAttributes(
        final Collection<DataEntityClassDto> entityClasses,
        final DataEntity dataEntity
    ) {
        return entityClasses.stream()
            .map(t -> defineSpecificAttributes(dataEntity, t))
            .filter(Objects::nonNull)
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));
    }

    private Pair<DataEntityClassDto, Map<String, ?>> defineSpecificAttributes(
        final DataEntity dataEntity,
        final DataEntityClassDto entityClass
    ) {
        return switch (entityClass) {
            case DATA_SET -> Pair.of(entityClass, specAttrsMap(List.of(
                Pair.of("rows_count", dataEntity.getDataset().getRowsNumber()),
                Pair.of("fields_count", dataEntity.getDataset().getFieldList().size()),
                Pair.of("parent_dataset", dataEntity.getDataset().getParentOddrn()),
                Pair.of("consumers_count", 0)
            )));

            case DATA_TRANSFORMER -> Pair.of(entityClass, specAttrsMap(List.of(
                Pair.of("source_list", new HashSet<>(dataEntity.getDataTransformer().getInputs())),
                Pair.of("target_list", new HashSet<>(dataEntity.getDataTransformer().getOutputs())),
                Pair.of("source_code_url", dataEntity.getDataTransformer().getSourceCodeUrl())
            )));

            case DATA_CONSUMER -> Pair.of(entityClass, specAttrsMap(List.of(
                Pair.of("input_list", new HashSet<>(dataEntity.getDataConsumer().getInputs()))
            )));

            case DATA_QUALITY_TEST -> Pair.of(entityClass, specAttrsMap(List.of(
                Pair.of("suite_name", dataEntity.getDataQualityTest().getSuiteName()),
                Pair.of("suite_url", dataEntity.getDataQualityTest().getSuiteUrl()),
                Pair.of("linked_url_list", dataEntity.getDataQualityTest().getLinkedUrlList()),
                Pair.of("dataset_list", new HashSet<>(dataEntity.getDataQualityTest().getDatasetList())),
                Pair.of("expectation", dataEntity.getDataQualityTest().getExpectation())
            )));

            case DATA_ENTITY_GROUP -> Pair.of(entityClass, specAttrsMap(List.of(
                Pair.of("entities_list", new HashSet<>(dataEntity.getDataEntityGroup().getEntitiesList())),
                Pair.of("group_oddrn", dataEntity.getDataEntityGroup().getGroupOddrn())
            )));

            case DATA_INPUT -> Pair.of(entityClass, specAttrsMap(List.of(
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
