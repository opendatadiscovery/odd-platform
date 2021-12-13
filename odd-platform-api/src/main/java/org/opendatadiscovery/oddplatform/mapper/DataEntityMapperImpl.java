package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.MapUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
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
        return mapPojo(dataEntityDto.getDataEntity())
            .types(dataEntityDto.getTypes().stream().map(this::mapType).collect(Collectors.toList()))
            .subType(mapSubType(dataEntityDto.getSubtype()))
            .ownership(ownershipMapper.mapDtos(dataEntityDto.getOwnership()))
            .dataSource(dataSourceMapper.mapPojo(new DataSourceDto(dataEntityDto.getDataSource(),
                dataEntityDto.getNamespace())))
            .tags(dataEntityDto.getTags() != null
                ? dataEntityDto.getTags().stream().map(tagMapper::mapPojo).collect(Collectors.toList())
                : null
            );
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

        final DataEntityDetails details = new DataEntityDetails()
            .id(pojo.getId())
            .externalName(pojo.getExternalName())
            .internalName(pojo.getInternalName())
            .oddrn(pojo.getOddrn())
            .internalDescription(pojo.getInternalDescription())
            .externalDescription(pojo.getExternalDescription())
            .createdAt(addUTC(pojo.getCreatedAt()))
            .updatedAt(addUTC(pojo.getUpdatedAt()))
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
            details.setVersionList(datasetVersionMapper.mapPojo(dto.getDataSetDetailsDto().getDatasetVersions()));
            details.setStats(mapStats(dto.getDataSetDetailsDto()));
        }

        if (typeNames.contains(DataEntityType.NameEnum.TRANSFORMER)) {
            details.setSourceList(dto.getDataTransformerDetailsDto().getSourceList()
                .stream()
                .distinct()
                .map(this::mapReference)
                .collect(Collectors.toList()));

            details.setTargetList(dto.getDataTransformerDetailsDto()
                .getTargetList()
                .stream()
                .distinct()
                .map(this::mapReference)
                .collect(Collectors.toList()));
        }

        if (typeNames.contains(DataEntityType.NameEnum.QUALITY_TEST)) {
            final DataQualityTestExpectation expectation = new DataQualityTestExpectation()
                .type(dto.getDataQualityTestDetailsDto().getExpectationType());

            expectation.putAll(MapUtils.emptyIfNull(dto.getDataQualityTestDetailsDto().getExpectationParameters()));

            details.expectation(expectation)
                .datasetsList(dto.getDataQualityTestDetailsDto()
                    .getDatasetList()
                    .stream()
                    .distinct()
                    .map(this::mapReference)
                    .collect(Collectors.toList()))
                .linkedUrlList(dto.getDataQualityTestDetailsDto().getLinkedUrlList())
                .latestRun(dataQualityMapper.mapDataQualityTestRun(
                    dto.getDataEntity().getId(),
                    dto.getDataQualityTestDetailsDto().getLatestTaskRun())
                )
                .suiteName(dto.getDataQualityTestDetailsDto().getSuiteName())
                .suiteUrl(dto.getDataQualityTestDetailsDto().getSuiteUrl());
        }

        if (typeNames.contains(DataEntityType.NameEnum.CONSUMER)) {
            details.setInputList(dto.getDataConsumerDetailsDto()
                .getInputList()
                .stream()
                .distinct()
                .map(this::mapReference).collect(Collectors.toList()));
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

        final DataQualityTestRun latestRun = dqDto.getLatestTaskRun() != null
            ? dataQualityMapper.mapDataQualityTestRun(dto.getDataEntity().getId(), dqDto.getLatestTaskRun())
            : null;

        return mapPojo(dto)
            .suiteName(dqDto.getSuiteName())
            .suiteUrl(dqDto.getSuiteUrl())
            .expectation(mapDataQualityTestExpectation(dqDto))
            .latestRun(latestRun)
            .linkedUrlList(dqDto.getLinkedUrlList())
            .datasetsList(dqDto
                .getDatasetList()
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
    public DataEntityRef mapRef(final DataEntityDto dto) {
        return new DataEntityRef()
            .id(dto.getDataEntity().getId())
            .internalName(dto.getDataEntity().getInternalName())
            .externalName(dto.getDataEntity().getExternalName())
            .types(dto.getTypes().stream().map(this::mapType).collect(Collectors.toList()))
            .hasAlerts(dto.isHasAlerts())
            .url("");
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

        return new DataEntityRef()
            .id(pojo.getId())
            .externalName(pojo.getExternalName())
            .internalName(pojo.getInternalName())
            .types(dto.getTypes().stream().map(this::mapType).collect(Collectors.toList()))
            .url("");
    }

    private DataSetStats mapStats(final DataEntityDetailsDto.DataSetDetailsDto dataSetDetailsDto) {
        return new DataSetStats()
            .consumersCount(dataSetDetailsDto.getConsumersCount())
            .fieldsCount(dataSetDetailsDto.getFieldsCount())
            .rowsCount(dataSetDetailsDto.getRowsCount());
    }

    private DataQualityTestExpectation mapDataQualityTestExpectation(final DataQualityTestDetailsDto dto) {
        final DataQualityTestExpectation expectation = new DataQualityTestExpectation().type(dto.getExpectationType());

        expectation.putAll(MapUtils.emptyIfNull(dto.getExpectationParameters()));

        return expectation;
    }
}
