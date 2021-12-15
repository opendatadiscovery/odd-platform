package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.MapUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupLineageList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineage;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageEdge;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageNode;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageStream;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntitySubType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityTypeDictionary;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestExpectation;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRun;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStats;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto.DataQualityTestDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityGroupLineageDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityLineageDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityLineageStreamDto;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTypePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataEntityMapperImpl implements DataEntityMapper {
    private final DataSourceMapper dataSourceMapper;
    private final OwnershipMapper ownershipMapper;
    private final TagMapper tagMapper;
    private final MetadataFieldMapper metadataFieldMapper;
    private final DatasetVersionMapper datasetVersionMapper;
    private final DataQualityMapper dataQualityMapper;

    @Override
    public DataEntity mapPojo(final DataEntityDimensionsDto dataEntityDto) {
        final List<DataEntityType> types = dataEntityDto.getTypes()
            .stream()
            .map(this::mapType)
            .toList();

        final List<DataEntityType.NameEnum> typeNames = types.stream()
            .map(DataEntityType::getName)
            .toList();

        final DataEntity entity = mapPojo(dataEntityDto.getDataEntity())
            .types(types)
            .subType(mapSubType(dataEntityDto.getSubtype()))
            .ownership(ownershipMapper.mapDtos(dataEntityDto.getOwnership()))
            .dataSource(dataSourceMapper.mapPojo(new DataSourceDto(dataEntityDto.getDataSource(),
                dataEntityDto.getNamespace())))
            .tags(dataEntityDto.getTags() != null
                ? dataEntityDto.getTags().stream().map(tagMapper::mapPojo).collect(Collectors.toList())
                : null);
        if (typeNames.contains(DataEntityType.NameEnum.ENTITY_GROUP)) {
            final List<DataEntityRef> dataEntityRefs = dataEntityDto.getGroupsDto().entities().stream()
                .map(this::mapReference)
                .toList();
            entity.setEntities(dataEntityRefs);
            entity.setItemsCount(dataEntityDto.getGroupsDto().itemsCount());
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

        final List<DataEntityType> types = dto.getTypes()
            .stream()
            .map(this::mapType)
            .collect(Collectors.toList());

        final List<DataEntityRef> groups = Optional.ofNullable(dto.getDataEntityGroups()).stream()
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
            .types(types)
            .subType(mapSubType(dto.getSubtype()))
            .ownership(ownershipMapper.mapDtos(dto.getOwnership()))
            .dataSource(dataSourceMapper.mapPojo(new DataSourceDto(dto.getDataSource(), dto.getNamespace())))
            .tags(dto.getTags().stream().map(tagMapper::mapPojo).collect(Collectors.toList()))
            .metadataFieldValues(metadataFieldMapper.mapDtos(dto.getMetadata()))
            .viewCount(pojo.getViewCount());

        final List<DataEntityType.NameEnum> typeNames = types
            .stream()
            .map(DataEntityType::getName)
            .collect(Collectors.toList());

        if (typeNames.contains(DataEntityType.NameEnum.SET)) {
            details.setVersionList(datasetVersionMapper.mapPojo(dto.getDataSetDetailsDto().datasetVersions()));
            details.setStats(mapStats(dto.getDataSetDetailsDto()));
        }

        if (typeNames.contains(DataEntityType.NameEnum.TRANSFORMER)) {
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

        if (typeNames.contains(DataEntityType.NameEnum.QUALITY_TEST)) {
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

        if (typeNames.contains(DataEntityType.NameEnum.CONSUMER)) {
            details.setInputList(dto.getDataConsumerDetailsDto()
                .inputList()
                .stream()
                .distinct()
                .map(this::mapReference).collect(Collectors.toList()));
        }

        if (typeNames.contains(DataEntityType.NameEnum.ENTITY_GROUP)) {
            final List<DataEntityRef> dataEntityRefs = dto.getGroupsDto().entities().stream()
                .map(this::mapReference)
                .toList();
            details.setEntities(dataEntityRefs);
            details.setHasChildren(dto.getDataEntityGroupDetailsDto().hasChildren());
        }

        if (typeNames.contains(DataEntityType.NameEnum.INPUT)) {
            details.setOutputList(dto.getDataInputDetailsDto()
                .getOutputList()
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
    public DataEntityType mapType(final DataEntityTypePojo type) {
        if (type == null) {
            return null;
        }

        return new DataEntityType().id(type.getId()).name(DataEntityType.NameEnum.fromValue(type.getName()));
    }

    @Override
    public DataEntitySubType mapSubType(final DataEntitySubtypePojo sub) {
        if (sub == null || sub.getId() == null) {
            return null;
        }

        return new DataEntitySubType()
            .id(sub.getId())
            .name(DataEntitySubType.NameEnum.fromValue(sub.getName()));
    }

    @Override
    public DataEntityTypeDictionary mapTypeDict(final Map<DataEntityTypePojo, List<DataEntitySubtypePojo>> typeDict) {
        return new DataEntityTypeDictionary()
            .subtypes(typeDict.values()
                .stream()
                .flatMap(List::stream)
                .map(this::mapSubType)
                .filter(Objects::nonNull)
                .collect(Collectors.toList()))
            .types(typeDict.keySet()
                .stream()
                .map(this::mapType)
                .collect(Collectors.toList()));
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
        final List<DataEntityLineageStream> lineageStreams = dataEntityGroupLineageDto.lineageItems().stream()
            .map(this::mapStream)
            .toList();
        return new DataEntityGroupLineageList()
            .items(lineageStreams);
    }

    @Override
    public DataEntityRef mapRef(final DataEntityDto dto) {
        return mapReference(dto);
    }

    private DataEntityLineageStream mapStream(final DataEntityLineageStreamDto upstream) {
        return new DataEntityLineageStream()
            .nodes(upstream.getNodes().stream().map(this::mapNode).collect(Collectors.toList()))
            .edges(upstream.getEdges().stream().map(this::mapEdge).collect(Collectors.toList()));
    }

    private DataEntityLineageEdge mapEdge(final Pair<Long, Long> edge) {
        return new DataEntityLineageEdge()
            .sourceId(edge.getLeft())
            .targetId(edge.getRight());
    }

    private DataEntityLineageNode mapNode(final DataEntityDimensionsDto dto) {
        final DataEntityPojo dataEntity = dto.getDataEntity();
        final DataSourcePojo dataSource = dto.getDataSource();

        return new DataEntityLineageNode()
            .id(dataEntity.getId())
            .types(dto.getTypes().stream().map(this::mapType).collect(Collectors.toList()))
            .externalName(dataEntity.getExternalName())
            .internalName(dataEntity.getInternalName())
            .dataSource(dataSource != null
                ? dataSourceMapper.mapPojo(new DataSourceDto(dto.getDataSource(), dto.getNamespace()))
                : null);
    }

    private DataEntityRef mapReference(final DataEntityDto dto) {
        final DataEntityPojo pojo = dto.getDataEntity();

        return mapReference(pojo)
            .types(dto.getTypes().stream().map(this::mapType).collect(Collectors.toList()))
            .hasAlerts(dto.isHasAlerts());
    }

    private DataEntityRef mapReference(final DataEntityPojo pojo) {
        return new DataEntityRef()
            .id(pojo.getId())
            .externalName(pojo.getExternalName())
            .internalName(pojo.getInternalName())
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
