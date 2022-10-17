package org.opendatadiscovery.oddplatform.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.MapUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClass;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClassAndTypeDictionary;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClassUsageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRun;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUsageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestExpectation;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStats;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityStatisticsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestSeverityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto.DataQualityTestDetailsDto;

@Component
@RequiredArgsConstructor
public class DataEntityMapperImpl implements DataEntityMapper {
    private static DataEntityClassAndTypeDictionary TYPE_DICTIONARY = null;

    private final DataSourceMapper dataSourceMapper;
    private final OwnershipMapper ownershipMapper;
    private final TagMapper tagMapper;
    private final MetadataFieldValueMapper metadataFieldValueMapper;
    private final DatasetVersionMapper datasetVersionMapper;
    private final DataEntityRunMapper dataEntityRunMapper;
    private final TermMapper termMapper;

    @Override
    public DataEntity mapPojo(final DataEntityDimensionsDto dto) {
        final Set<DataEntityClassDto> entityClasses =
            DataEntityClassDto.findByIds(dto.getDataEntity().getEntityClassIds());
        final DataEntityType type = getDataEntityType(dto.getDataEntity());
        final List<DataEntityRef> groups = Optional.ofNullable(dto.getParentGroups()).stream()
            .flatMap(Collection::stream)
            .map(this::mapReference)
            .toList();

        final DataEntity entity = mapPojo(dto.getDataEntity())
            .entityClasses(entityClasses.stream().map(this::mapEntityClass).toList())
            .type(type)
            .ownership(ownershipMapper.mapDtos(dto.getOwnership()))
            .dataSource(dataSourceMapper.mapDto(new DataSourceDto(dto.getDataSource(), dto.getNamespace(), null)))
            .tags(dto.getTags() != null
                ? dto.getTags().stream().map(tagMapper::mapToTag).collect(Collectors.toList())
                : null)
            .dataEntityGroups(groups);

        if (entityClasses.contains(DataEntityClassDto.DATA_SET)) {
            entity.setStats(mapStats(dto.getDataSetDetailsDto()));
        }

        if (entityClasses.contains(DataEntityClassDto.DATA_TRANSFORMER)) {
            entity.setSourceList(dto.getDataTransformerDetailsDto().sourceList()
                .stream()
                .distinct()
                .map(this::mapReference)
                .collect(Collectors.toList()));

            entity.setTargetList(dto.getDataTransformerDetailsDto()
                .targetList()
                .stream()
                .distinct()
                .map(this::mapReference)
                .collect(Collectors.toList()));
        }

        if (entityClasses.contains(DataEntityClassDto.DATA_QUALITY_TEST)) {
            entity.datasetsList(dto.getDataQualityTestDetailsDto()
                .datasetList()
                .stream()
                .distinct()
                .map(this::mapReference)
                .collect(Collectors.toList()));
        }

        if (entityClasses.contains(DataEntityClassDto.DATA_CONSUMER)) {
            entity.setInputList(dto.getDataConsumerDetailsDto()
                .inputList()
                .stream()
                .distinct()
                .map(this::mapReference).collect(Collectors.toList()));
        }

        if (entityClasses.contains(DataEntityClassDto.DATA_INPUT)) {
            entity.setOutputList(dto.getDataInputDetailsDto()
                .outputList()
                .stream()
                .distinct()
                .map(this::mapReference).collect(Collectors.toList()));
        }

        if (entityClasses.contains(DataEntityClassDto.DATA_ENTITY_GROUP) && dto.getGroupsDto() != null) {
            final List<DataEntityRef> dataEntityRefs = dto.getGroupsDto().entities().stream()
                .map(this::mapReference)
                .toList();

            entity.setEntities(dataEntityRefs);
            entity.setItemsCount(dto.getGroupsDto().itemsCount());
        }

        return entity;
    }

    private DataEntity mapPojo(final DataEntityPojo pojo) {
        return new DataEntity()
            .id(pojo.getId())
            .internalName(pojo.getInternalName())
            .externalName(pojo.getExternalName())
            .oddrn(pojo.getOddrn())
            .createdAt(addUTC(pojo.getCreatedAt()))
            .updatedAt(addUTC(pojo.getUpdatedAt()))
            .viewCount(pojo.getViewCount());
    }

    @Override
    public DataEntityList mapPojos(final List<DataEntityDimensionsDto> dataEntityDto) {
        return new DataEntityList()
            .items(dataEntityDto.stream().map(this::mapPojo).collect(Collectors.toList()))
            .pageInfo(pageInfo(dataEntityDto.size()));
    }

    @Override
    public DataEntityList mapPojos(final Page<DataEntityDimensionsDto> dataEntityDto) {
        return new DataEntityList()
            .items(dataEntityDto.getData().stream().map(this::mapPojo).collect(Collectors.toList()))
            .pageInfo(pageInfo(dataEntityDto));
    }

    @Override
    public DataEntityPojo mapToPojo(final DataEntityGroupFormData formData,
                                    final DataEntityClassDto classDto,
                                    final NamespacePojo namespacePojo) {
        final LocalDateTime now = LocalDateTime.now();
        return new DataEntityPojo()
            .setInternalName(formData.getName())
            .setNamespaceId(namespacePojo != null ? namespacePojo.getId() : null)
            .setEntityClassIds(new Integer[] {classDto.getId()})
            .setTypeId(formData.getType().getId())
            .setCreatedAt(now)
            .setUpdatedAt(now)
            .setManuallyCreated(true)
            .setHollow(false)
            .setExcludeFromSearch(false)
            .setIsDeleted(false);
    }

    @Override
    public DataEntityPojo applyToPojo(final DataEntityGroupFormData formData,
                                      final NamespacePojo namespacePojo,
                                      final DataEntityPojo pojo) {
        if (pojo == null) {
            return null;
        }
        return pojo
            .setInternalName(formData.getName())
            .setNamespaceId(namespacePojo != null ? namespacePojo.getId() : null)
            .setTypeId(formData.getType().getId())
            .setUpdatedAt(LocalDateTime.now());
    }

    @Override
    public DataEntityDetails mapDtoDetails(final DataEntityDetailsDto dto) {
        final DataEntityPojo pojo = dto.getDataEntity();
        final Set<DataEntityClassDto> entityClasses =
            DataEntityClassDto.findByIds(dto.getDataEntity().getEntityClassIds());
        final DataEntityType type = getDataEntityType(pojo);
        final List<DataEntityRef> groups = Optional.ofNullable(dto.getParentGroups()).stream()
            .flatMap(Collection::stream)
            .map(this::mapReference)
            .toList();

        final DataEntityDetails details = new DataEntityDetails()
            .id(pojo.getId())
            .externalName(pojo.getExternalName())
            .internalName(pojo.getInternalName())
            .oddrn(pojo.getOddrn())
            .internalDescription(pojo.getInternalDescription())
            .externalDescription(pojo.getExternalDescription())
            .createdAt(addUTC(pojo.getCreatedAt()))
            .updatedAt(addUTC(pojo.getUpdatedAt()))
            .dataEntityGroups(groups)
            .entityClasses(entityClasses.stream().map(this::mapEntityClass).toList())
            .type(type)
            .ownership(ownershipMapper.mapDtos(dto.getOwnership()))
            .dataSource(dataSourceMapper.mapDto(new DataSourceDto(dto.getDataSource(), dto.getNamespace(), null)))
            .tags(tagMapper.mapToTagList(dto.getTags()))
            .metadataFieldValues(metadataFieldValueMapper.mapDtos(dto.getMetadata()))
            .terms(termMapper.mapToRefList(dto.getTerms()))
            .viewCount(pojo.getViewCount());

        if (entityClasses.contains(DataEntityClassDto.DATA_SET)) {
            details.setVersionList(datasetVersionMapper.mapPojo(dto.getDatasetVersions()));
            details.setStats(mapStats(dto.getDataSetDetailsDto()));
        }

        if (entityClasses.contains(DataEntityClassDto.DATA_TRANSFORMER)) {
            details.setSourceList(dto.getDataTransformerDetailsDto().sourceList()
                .stream()
                .distinct()
                .map(this::mapReference)
                .collect(Collectors.toList()));

            details.setTargetList(dto.getDataTransformerDetailsDto()
                .targetList()
                .stream()
                .distinct()
                .map(this::mapReference)
                .collect(Collectors.toList()));
        }

        if (entityClasses.contains(DataEntityClassDto.DATA_QUALITY_TEST)) {
            final DataQualityTestExpectation expectation = new DataQualityTestExpectation()
                .type(dto.getDataQualityTestDetailsDto().expectationType());

            expectation.putAll(MapUtils.emptyIfNull(dto.getDataQualityTestDetailsDto().expectationParameters()));

            details.expectation(expectation)
                .datasetsList(dto.getDataQualityTestDetailsDto()
                    .datasetList()
                    .stream()
                    .distinct()
                    .map(this::mapReference)
                    .collect(Collectors.toList()))
                .linkedUrlList(dto.getDataQualityTestDetailsDto().linkedUrlList())
                .latestRun(dataEntityRunMapper.mapDataEntityRun(
                    dto.getDataEntity().getId(),
                    dto.getDataQualityTestDetailsDto().latestTaskRun())
                )
                .suiteName(dto.getDataQualityTestDetailsDto().suiteName())
                .suiteUrl(dto.getDataQualityTestDetailsDto().suiteUrl());
        }

        if (entityClasses.contains(DataEntityClassDto.DATA_CONSUMER)) {
            details.setInputList(dto.getDataConsumerDetailsDto()
                .inputList()
                .stream()
                .distinct()
                .map(this::mapReference).collect(Collectors.toList()));
        }

        if (entityClasses.contains(DataEntityClassDto.DATA_ENTITY_GROUP)) {
            final List<DataEntityRef> dataEntityRefs = dto.getGroupsDto().entities().stream()
                .map(this::mapReference)
                .toList();
            details.setEntities(dataEntityRefs);
            details.setHasChildren(dto.getGroupsDto().hasChildren());
            details.setManuallyCreated(dto.getDataEntity().getManuallyCreated());
        }

        if (entityClasses.contains(DataEntityClassDto.DATA_INPUT)) {
            details.setOutputList(dto.getDataInputDetailsDto()
                .outputList()
                .stream()
                .distinct()
                .map(this::mapReference).collect(Collectors.toList()));
        }

        return details;
    }

    @Override
    public DataEntity mapDataQualityTest(final DataEntityDetailsDto dto) {
        return mapDataQualityTest(dto, null);
    }

    @Override
    public DataEntity mapDataQualityTest(final DataEntityDetailsDto dto,
                                         final String severity) {
        final DataQualityTestDetailsDto dqDto = dto.getDataQualityTestDetailsDto();

        final DataEntityRun latestRun = dqDto.latestTaskRun() != null
            ? dataEntityRunMapper.mapDataEntityRun(dto.getDataEntity().getId(), dqDto.latestTaskRun())
            : null;

        return mapPojo(dto)
            .suiteName(dqDto.suiteName())
            .suiteUrl(dqDto.suiteUrl())
            .expectation(mapDataQualityTestExpectation(dqDto))
            .latestRun(latestRun)
            .linkedUrlList(dqDto.linkedUrlList())
            .severity(severity != null ? DataQualityTestSeverity.valueOf(severity) : null)
            .datasetsList(dqDto
                .datasetList()
                .stream()
                .map(this::mapRef)
                .collect(Collectors.toList()));
    }

    @Override
    public DataEntityList mapDataQualityTests(final Collection<DataEntityDetailsDto> dtos) {
        return new DataEntityList()
            .items(dtos.stream().map(this::mapDataQualityTest).collect(Collectors.toList()));
    }

    @Override
    public DataEntityList mapDataQualityTests(final Collection<DataEntityDetailsDto> dtos,
                                              final Collection<DataQualityTestSeverityPojo> severities) {
        final Map<Long, DataQualityTestSeverityPojo> severityMap = severities
            .stream()
            .collect(Collectors.toMap(
                DataQualityTestSeverityPojo::getDataQualityTestId,
                identity()
            ));

        final List<DataEntity> items = dtos.stream()
            .map(d -> {
                final String severity = Optional
                    .ofNullable(severityMap.get(d.getDataEntity().getId()))
                    .map(DataQualityTestSeverityPojo::getSeverity)
                    .orElse(null);

                return mapDataQualityTest(d, severity);
            })
            .toList();

        return new DataEntityList().items(items);
    }

    @Override
    public DataEntityClass mapEntityClass(final DataEntityClassDto entityClass) {
        if (entityClass == null) {
            return null;
        }

        return new DataEntityClass()
            .id(entityClass.getId())
            .name(DataEntityClass.NameEnum.fromValue(entityClass.name()))
            .types(entityClass.getTypes().stream().map(this::mapType).toList());
    }

    @Override
    public DataEntityType mapType(final DataEntityTypeDto type) {
        if (type == null) {
            return null;
        }

        return new DataEntityType()
            .id(type.getId())
            .name(DataEntityType.NameEnum.fromValue(type.name()));
    }

    @Override
    public DataEntityClassAndTypeDictionary getTypeDict() {
        if (TYPE_DICTIONARY == null) {
            TYPE_DICTIONARY = new DataEntityClassAndTypeDictionary()
                .entityClasses(Arrays.stream(DataEntityClassDto.values()).map(this::mapEntityClass).toList())
                .types(Arrays.stream(DataEntityTypeDto.values()).map(this::mapType).toList());
        }

        return TYPE_DICTIONARY;
    }

    @Override
    public DataEntityRef mapRef(final DataEntityDto dto) {
        return mapReference(dto);
    }

    @Override
    public DataEntityRef mapRef(final DataEntityPojo pojo) {
        return mapReference(pojo);
    }

    @Override
    public DataEntityUsageInfo mapUsageInfo(final DataEntityStatisticsPojo pojo,
                                            final Long filledEntitiesCount) {
        final Map<Integer, Long> classesCount;
        if (pojo.getDataEntityClassesCount() == null) {
            classesCount = new HashMap<>();
        } else {
            classesCount = JSONSerDeUtils.deserializeJson(pojo.getDataEntityClassesCount().data(),
                new TypeReference<>() {
                });
        }
        return new DataEntityUsageInfo()
            .totalCount(pojo.getTotalCount())
            .unfilledCount(pojo.getTotalCount() - filledEntitiesCount)
            .dataEntityClassesInfo(
                Arrays.stream(DataEntityClassDto.values())
                    .filter(dto -> dto != DataEntityClassDto.DATA_QUALITY_TEST_RUN
                        && dto != DataEntityClassDto.DATA_TRANSFORMER_RUN)
                    .map(dto -> new DataEntityClassUsageInfo()
                        .entityClass(mapEntityClass(dto))
                        .totalCount(classesCount.getOrDefault(dto.getId(), 0L)))
                    .toList()
            );
    }

    private DataEntityRef mapReference(final DataEntityDto dto) {
        return mapReference(dto.getDataEntity()).hasAlerts(dto.isHasAlerts());
    }

    private DataEntityRef mapReference(final DataEntityPojo pojo) {
        final List<DataEntityClass> entityClasses = DataEntityClassDto.findByIds(pojo.getEntityClassIds())
            .stream()
            .map(this::mapEntityClass)
            .toList();

        return new DataEntityRef()
            .id(pojo.getId())
            .oddrn(pojo.getOddrn())
            .externalName(pojo.getExternalName())
            .internalName(pojo.getInternalName())
            .entityClasses(entityClasses)
            .manuallyCreated(pojo.getManuallyCreated())
            .url("");
    }

    private DataSetStats mapStats(final DataEntityDetailsDto.DataSetDetailsDto dataSetDetailsDto) {
        return new DataSetStats()
            .consumersCount(dataSetDetailsDto.consumersCount())
            .fieldsCount(dataSetDetailsDto.fieldsCount())
            .rowsCount(dataSetDetailsDto.rowsCount());
    }

    private DataQualityTestExpectation mapDataQualityTestExpectation(final DataQualityTestDetailsDto dto) {
        final DataQualityTestExpectation expectation = new DataQualityTestExpectation().type(dto.expectationType());
        expectation.putAll(MapUtils.emptyIfNull(dto.expectationParameters()));
        return expectation;
    }

    private DataEntityType getDataEntityType(final DataEntityPojo pojo) {
        final Integer typeId = pojo.getTypeId();

        return DataEntityTypeDto.findById(typeId)
            .map(this::mapType)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format("No type with id %d for entity %s was found", typeId, pojo.getOddrn())));
    }
}
