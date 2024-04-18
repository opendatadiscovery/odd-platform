package org.opendatadiscovery.oddplatform.mapper.ingestion;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.ListUtils;
import org.apache.commons.lang3.StringUtils;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.RelationshipTypeDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.DataEntityClassTypeValidationException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataConsumer;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityGroup;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataInput;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataQualityTest;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataQualityTestRun;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataRelationship;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataTransformer;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataTransformerRun;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.ERDRelationship;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.GraphRelationship;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Tag;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.service.ingestion.DatasetVersionHashCalculator;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_CONSUMER;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_ENTITY_GROUP;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_INPUT;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_QUALITY_TEST;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_QUALITY_TEST_RUN;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_RELATIONSHIP;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_SET;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_TRANSFORMER;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_TRANSFORMER_RUN;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataConsumer.INPUT_LIST;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataEntityGroup.ENTITIES_LIST;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataEntityGroup.GROUP_ODDRN;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataInput.OUTPUT_LIST;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataQualityTest.DATASET_LIST;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataQualityTest.EXPECTATION;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataQualityTest.LINKED_URL_LIST;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataQualityTest.SUITE_NAME;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataQualityTest.SUITE_URL;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataTransformer.SOURCE_CODE_URL;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataTransformer.SOURCE_LIST;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.DataTransformer.TARGET_LIST;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.Dataset.FIELDS_COUNT;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.Dataset.PARENT_DATASET;
import static org.opendatadiscovery.oddplatform.dto.attributes.AttributeNames.Dataset.ROWS_COUNT;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataConsumerIngestionDto;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataEntityGroupDto;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataInputIngestionDto;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataQualityTestIngestionDto;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataRelationshipDetailsDto;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataRelationshipDto;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataSetIngestionDto;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataTransformerIngestionDto;

@Component
@RequiredArgsConstructor
@Slf4j
public class IngestionMapperImpl implements IngestionMapper {
    private final DatasetFieldIngestionMapper datasetFieldIngestionMapper;
    private final DatasetERDRelationIngestionMapper erdRelationIngestionMapper;
    private final DatasetGraphRelationIngestionMapper graphRelationIngestionMapper;
    private final DatasetVersionHashCalculator datasetVersionHashCalculator;

    private static final List<Pair<Predicate<DataEntity>, DataEntityClassDto>> ENTITY_CLASS_DISCRIMINATOR = List.of(
        Pair.of(de -> de.getDataset() != null, DATA_SET),
        Pair.of(de -> de.getDataTransformer() != null, DATA_TRANSFORMER),
        Pair.of(de -> de.getDataTransformerRun() != null, DATA_TRANSFORMER_RUN),
        Pair.of(de -> de.getDataConsumer() != null, DATA_CONSUMER),
        Pair.of(de -> de.getDataQualityTest() != null, DATA_QUALITY_TEST),
        Pair.of(de -> de.getDataQualityTestRun() != null, DATA_QUALITY_TEST_RUN),
        Pair.of(de -> de.getDataEntityGroup() != null, DATA_ENTITY_GROUP),
        Pair.of(de -> de.getDataInput() != null, DATA_INPUT),
        Pair.of(de -> de.getDataRelationship() != null, DATA_RELATIONSHIP)
    );

    @Override
    public DataEntityIngestionDto createIngestionDto(final DataEntity dataEntity, final long dataSourceId) {
        final DataEntityTypeDto type = DataEntityTypeDto.valueOf(dataEntity.getType().getValue());
        final Set<DataEntityClassDto> entityClasses = defineEntityClasses(dataEntity);
        validateEntityClasses(dataEntity.getOddrn(), entityClasses, type);

        DataEntityIngestionDto.DataEntityIngestionDtoBuilder builder = DataEntityIngestionDto.builder()
            .name(dataEntity.getName())
            .oddrn(dataEntity.getOddrn())
            .externalDescription(dataEntity.getDescription())
            .dataSourceId(dataSourceId)
            .sourceCreatedAt(dataEntity.getCreatedAt())
            .sourceUpdatedAt(dataEntity.getUpdatedAt())
            .entityClasses(entityClasses)
            .type(type)
            .specificAttributesJson(specificAttributesAsString(entityClasses, dataEntity));

        if (CollectionUtils.isNotEmpty(dataEntity.getMetadata())) {
            builder = builder.metadata(dataEntity.getMetadata().get(0).getMetadata());
        }

        if (CollectionUtils.isNotEmpty(dataEntity.getTags())) {
            builder = builder.tags(dataEntity.getTags().stream().map(Tag::getName).toList());
        }

        if (entityClasses.contains(DATA_SET)) {
            builder = builder.dataSet(createDatasetIngestionDto(dataEntity));
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

        if (entityClasses.contains(DATA_RELATIONSHIP)) {
            builder = builder.dataRelationshipDto(createDataRelationship(dataEntity.getDataRelationship()));
        }

        return builder.build();
    }

    @Override
    public <T extends DataEntityIngestionDto> DataEntityPojo dtoToPojo(final T dto) {
        final OffsetDateTime createdAt = dto.getSourceCreatedAt();
        final OffsetDateTime updatedAt = dto.getSourceUpdatedAt();
        final LocalDateTime now = DateTimeUtil.generateNow();

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
            .setPlatformCreatedAt(now)
            .setSourceCreatedAt(createdAt != null ? createdAt.toLocalDateTime() : null)
            .setSourceUpdatedAt(updatedAt != null ? updatedAt.toLocalDateTime() : null)
            .setLastIngestedAt(now)
            .setTypeId(dto.getType().getId())
            .setHollow(false)
            .setSpecificAttributes(JSONB.jsonb(dto.getSpecificAttributesJson()))
            .setExcludeFromSearch(isExcludedFromSearch(dto))
            .setManuallyCreated(false)
            .setStatus(DataEntityStatusDto.UNASSIGNED.getId())
            .setStatusUpdatedAt(now);

        if (dto instanceof EnrichedDataEntityIngestionDto entityIngestionDto) {
            final DataEntityPojo previousVersionPojo = entityIngestionDto.getPreviousVersionPojo();
            if (previousVersionPojo != null) {
                pojo.setId(previousVersionPojo.getId());
                pojo.setInternalName(previousVersionPojo.getInternalName());
                pojo.setInternalDescription(previousVersionPojo.getInternalDescription());
                pojo.setViewCount(previousVersionPojo.getViewCount());
                pojo.setPlatformCreatedAt(previousVersionPojo.getPlatformCreatedAt());
                final DataEntityStatusDto previousStatus = getStatus(previousVersionPojo.getStatus());
                if (previousStatus == DataEntityStatusDto.DELETED) {
                    pojo.setStatus(DataEntityStatusDto.UNASSIGNED.getId());
                    pojo.setStatusUpdatedAt(now);
                } else {
                    pojo.setStatus(previousStatus.getId());
                    pojo.setStatusUpdatedAt(previousVersionPojo.getStatusUpdatedAt());
                    pojo.setStatusSwitchTime(previousVersionPojo.getStatusSwitchTime());
                }
            }
        }

        return pojo;
    }

    @Override
    public <T extends DataEntityIngestionDto> List<DataEntityPojo> dtoToPojo(final Collection<T> dtos) {
        return dtos.stream().map(this::dtoToPojo).toList();
    }

    @Override
    public IngestionTaskRun mapTaskRun(final DataEntity dataEntity) {
        if (dataEntity.getDataTransformerRun() == null && dataEntity.getDataQualityTestRun() == null) {
            throw new BadUserRequestException("""
                Data Entity with oddrn %s has JOB_RUN type, but doesn't have task run data.
                Please define data_transformer_run or data_quality_test_run properties.""".formatted(
                dataEntity.getOddrn())
            );
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

    private DataSetIngestionDto createDatasetIngestionDto(final DataEntity dataEntity) {
        final DataSet dataset = dataEntity.getDataset();

        if (!validateStructure(dataset.getFieldList())) {
            throw new BadUserRequestException("""
                Dataset with oddrn %s has an incomplete structure.
                Please check if parent_field_oddrn and reference_oddrn properties of each dataset field
                have correspondent dataset fields in the payload and TYPE_REFERENCE fields have correspondent
                reference_oddrn properties and vice versa.
                """, dataEntity.getOddrn());
        }

        final String structureHash = datasetVersionHashCalculator.calculateStructureHash(dataset.getFieldList());

        return new DataSetIngestionDto(
            dataset.getParentOddrn(),
            datasetFieldIngestionMapper.mapFields(dataset.getFieldList()),
            structureHash,
            dataset.getRowsNumber()
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

    private DataRelationshipDto createDataRelationship(final DataRelationship relationship) {
        final DataRelationshipDetailsDto dataRelationshipDetailsDto =
            DataRelationship.RelationshipTypeEnum.ERD == relationship.getRelationshipType()
                ? new DataRelationshipDetailsDto(
                    erdRelationIngestionMapper.mapERDRelation((ERDRelationship) relationship.getDetails()),
                    null)
                : new DataRelationshipDetailsDto(
                null,
                graphRelationIngestionMapper.mapGraphRelation((GraphRelationship) relationship.getDetails()));

        return new DataRelationshipDto(
            relationship.getSourceDatasetOddrn(),
            relationship.getTargetDatasetOddrn(),
            RelationshipTypeDto.valueOf(relationship.getRelationshipType().name()),
            dataRelationshipDetailsDto
        );
    }

    private Set<DataEntityClassDto> defineEntityClasses(final DataEntity dataEntity) {
        return ENTITY_CLASS_DISCRIMINATOR.stream()
            .map(disc -> disc.getLeft().test(dataEntity) ? disc.getRight() : null)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
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
                Pair.of(ROWS_COUNT, dataEntity.getDataset().getRowsNumber()),
                Pair.of(FIELDS_COUNT, dataEntity.getDataset().getFieldList().size()),
                Pair.of(PARENT_DATASET, dataEntity.getDataset().getParentOddrn())
            )));

            case DATA_TRANSFORMER -> Pair.of(entityClass, specAttrsMap(List.of(
                Pair.of(SOURCE_LIST, new HashSet<>(dataEntity.getDataTransformer().getInputs())),
                Pair.of(TARGET_LIST, new HashSet<>(dataEntity.getDataTransformer().getOutputs())),
                Pair.of(SOURCE_CODE_URL, dataEntity.getDataTransformer().getSourceCodeUrl())
            )));

            case DATA_CONSUMER -> Pair.of(entityClass, specAttrsMap(List.of(
                Pair.of(INPUT_LIST, new HashSet<>(dataEntity.getDataConsumer().getInputs()))
            )));

            case DATA_QUALITY_TEST -> Pair.of(entityClass, specAttrsMap(List.of(
                Pair.of(SUITE_NAME, dataEntity.getDataQualityTest().getSuiteName()),
                Pair.of(SUITE_URL, dataEntity.getDataQualityTest().getSuiteUrl()),
                Pair.of(LINKED_URL_LIST, dataEntity.getDataQualityTest().getLinkedUrlList()),
                Pair.of(DATASET_LIST, new HashSet<>(dataEntity.getDataQualityTest().getDatasetList())),
                Pair.of(EXPECTATION, dataEntity.getDataQualityTest().getExpectation())
            )));

            case DATA_ENTITY_GROUP -> Pair.of(entityClass, specAttrsMap(List.of(
                Pair.of(ENTITIES_LIST, new HashSet<>(dataEntity.getDataEntityGroup().getEntitiesList())),
                Pair.of(GROUP_ODDRN, dataEntity.getDataEntityGroup().getGroupOddrn())
            )));

            case DATA_INPUT -> Pair.of(entityClass, specAttrsMap(List.of(
                Pair.of(OUTPUT_LIST, new HashSet<>(dataEntity.getDataInput().getOutputs()))
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

    private void validateEntityClasses(final String oddrn,
                                       final Set<DataEntityClassDto> entityClasses,
                                       final DataEntityTypeDto type) {
        final Set<DataEntityClassDto> expectedClasses = DataEntityClassDto.getClassesByType(type);
        final boolean isProperlyFilledClasses = !CollectionUtils.isEmpty(entityClasses)
            && expectedClasses.stream().anyMatch(entityClasses::contains);
        if (!isProperlyFilledClasses) {
            throw new DataEntityClassTypeValidationException(oddrn, type, entityClasses, expectedClasses);
        }
    }

    private boolean validateStructure(final List<DataSetField> fieldList) {
        final Set<String> fieldOddrns = fieldList.stream().map(DataSetField::getOddrn).collect(Collectors.toSet());

        for (final DataSetField field : fieldList) {
            if (StringUtils.isNotEmpty(field.getParentFieldOddrn())
                && !fieldOddrns.contains(field.getParentFieldOddrn())) {
                return false;
            }

            if (StringUtils.isNotEmpty(field.getReferenceOddrn())
                && !fieldOddrns.contains(field.getReferenceOddrn())) {
                return false;
            }

            final boolean isReferenceField = DataSetFieldType.TypeEnum.REFERENCE.equals(field.getType().getType());
            final boolean hasReferenceProperty = StringUtils.isNotEmpty(field.getReferenceOddrn());

            if (isReferenceField != hasReferenceProperty) {
                return false;
            }
        }

        return true;
    }

    private DataEntityStatusDto getStatus(final Short statusId) {
        return DataEntityStatusDto.findById(statusId)
            .orElseThrow(() -> new IllegalArgumentException("Unknown DE status %s".formatted(statusId)));
    }
}
