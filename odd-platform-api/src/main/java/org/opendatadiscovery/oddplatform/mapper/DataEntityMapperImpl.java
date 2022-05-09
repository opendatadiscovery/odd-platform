package org.opendatadiscovery.oddplatform.mapper;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
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
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupLineageList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineage;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageEdge;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageNode;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageStream;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestExpectation;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRun;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStats;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityGroupLineageDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityLineageDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityLineageStreamDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

import static java.util.Collections.emptyList;
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
    private final DataQualityMapper dataQualityMapper;

    @Override
    public DataEntity mapPojo(final DataEntityDimensionsDto dto) {
        final Set<DataEntityClassDto> entityClasses =
            DataEntityClassDto.findByIds(dto.getDataEntity().getEntityClassIds());

        final Integer typeId = dto.getDataEntity().getTypeId();

        final DataEntityType type = DataEntityTypeDto.findById(typeId)
            .map(this::mapType)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format("No type with id %d for entity %s was found", typeId, dto.getDataEntity().getOddrn())));

        final DataEntity entity = mapPojo(dto.getDataEntity())
            .entityClasses(entityClasses.stream().map(this::mapEntityClass).toList())
            .type(type)
            .ownership(ownershipMapper.mapDtos(dto.getOwnership()))
            .dataSource(dataSourceMapper.mapDto(new DataSourceDto(dto.getDataSource(), dto.getNamespace(), null)))
            .tags(dto.getTags() != null
                ? dto.getTags().stream().map(tagMapper::mapPojo).collect(Collectors.toList())
                : null);

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
    public DataEntityDetails mapDtoDetails(final DataEntityDetailsDto dto) {
        final DataEntityPojo pojo = dto.getDataEntity();
        final Integer typeId = dto.getDataEntity().getTypeId();

        final Set<DataEntityClassDto> entityClasses =
            DataEntityClassDto.findByIds(dto.getDataEntity().getEntityClassIds());

        final DataEntityType type = DataEntityTypeDto.findById(typeId)
            .map(this::mapType)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format("No type with id %d for entity %s was found", typeId,
                    dto.getDataEntity().getOddrn())));

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
            .tags(dto.getTags().stream().map(tagMapper::mapPojo).collect(Collectors.toList()))
            .metadataFieldValues(metadataFieldValueMapper.mapDtos(dto.getMetadata()))
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
                .latestRun(dataQualityMapper.mapDataQualityTestRun(
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
        final DataQualityTestDetailsDto dqDto = dto.getDataQualityTestDetailsDto();

        final DataQualityTestRun latestRun = dqDto.latestTaskRun() != null
            ? dataQualityMapper.mapDataQualityTestRun(dto.getDataEntity().getId(), dqDto.latestTaskRun())
            : null;

        return mapPojo(dto)
            .suiteName(dqDto.suiteName())
            .suiteUrl(dqDto.suiteUrl())
            .expectation(mapDataQualityTestExpectation(dqDto))
            .latestRun(latestRun)
            .linkedUrlList(dqDto.linkedUrlList())
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
    public DataEntityClass mapEntityClass(final DataEntityClassDto entityClass) {
        if (entityClass == null) {
            return null;
        }

        return new DataEntityClass()
            .id(entityClass.getId())
            .name(DataEntityClass.NameEnum.fromValue(entityClass.name()));
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
    public DataEntityLineage mapLineageDto(final DataEntityLineageDto dto) {
        return new DataEntityLineage()
            .root(mapNode(dto.getDataEntityDto()))
            .upstream(mapStream(dto.getUpstream()))
            .downstream(mapStream(dto.getDownstream()));
    }

    @Override
    public DataEntityGroupLineageList mapGroupLineageDto(final DataEntityGroupLineageDto dataEntityGroupLineageDto) {
        final List<DataEntityLineageStream> lineageStreams = dataEntityGroupLineageDto.lineageItems()
            .stream()
            .map(this::mapStream)
            .toList();

        return new DataEntityGroupLineageList().items(lineageStreams);
    }

    @Override
    public DataEntityRef mapRef(final DataEntityDto dto) {
        return mapReference(dto);
    }

    @Override
    public DataEntityRef mapRef(final DataEntityPojo pojo) {
        return mapReference(pojo);
    }

    private DataEntityLineageStream mapStream(final DataEntityLineageStreamDto stream) {
        final Map<Long, List<Long>> groupsRelations = stream.getGroupsRelations();

        final Set<Long> streamGroups = new HashSet<>();
        final List<DataEntityLineageNode> nodes = new ArrayList<>();

        for (final DataEntityDimensionsDto node : stream.getNodes()) {
            final List<Long> groupIds = groupsRelations.get(node.getDataEntity().getId());
            if (groupIds != null) {
                streamGroups.addAll(groupIds);
            }

            nodes.add(mapNode(node, groupIds));
        }

        return new DataEntityLineageStream()
            .nodes(nodes)
            .edges(stream.getEdges().stream().map(this::mapEdge).collect(Collectors.toList()))
            .groups(stream.getGroups()
                .stream()
                .filter(g -> streamGroups.contains(g.getDataEntity().getId()))
                .map(this::mapNode)
                .collect(Collectors.toList()));
    }

    private DataEntityLineageEdge mapEdge(final Pair<Long, Long> edge) {
        return new DataEntityLineageEdge()
            .sourceId(edge.getLeft())
            .targetId(edge.getRight());
    }

    private DataEntityLineageNode mapNode(final DataEntityDimensionsDto dto) {
        return mapNode(dto, emptyList());
    }

    private DataEntityLineageNode mapNode(final DataEntityDimensionsDto dto, final List<Long> groupId) {
        final DataEntityPojo dataEntity = dto.getDataEntity();
        final DataSourcePojo dataSource = dto.getDataSource();

        final List<DataEntityClass> entityClasses =
            DataEntityClassDto.findByIds(dto.getDataEntity().getEntityClassIds())
                .stream()
                .map(this::mapEntityClass)
                .toList();

        return new DataEntityLineageNode()
            .id(dataEntity.getId())
            .entityClasses(entityClasses)
            .externalName(dataEntity.getExternalName())
            .internalName(dataEntity.getInternalName())
            .groupIdList(groupId)
            .dataSource(dataSource != null
                ? dataSourceMapper.mapDto(new DataSourceDto(dto.getDataSource(), dto.getNamespace(), null))
                : null);
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
            .externalName(pojo.getExternalName())
            .internalName(pojo.getInternalName())
            .entityClasses(entityClasses)
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
}
