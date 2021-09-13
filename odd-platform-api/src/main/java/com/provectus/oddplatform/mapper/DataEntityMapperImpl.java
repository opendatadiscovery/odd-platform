package com.provectus.oddplatform.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.provectus.oddplatform.api.contract.model.DataEntity;
import com.provectus.oddplatform.api.contract.model.DataEntityDetails;
import com.provectus.oddplatform.api.contract.model.DataEntityLineage;
import com.provectus.oddplatform.api.contract.model.DataEntityLineageEdge;
import com.provectus.oddplatform.api.contract.model.DataEntityLineageNode;
import com.provectus.oddplatform.api.contract.model.DataEntityLineageStream;
import com.provectus.oddplatform.api.contract.model.DataEntityList;
import com.provectus.oddplatform.api.contract.model.DataEntityRef;
import com.provectus.oddplatform.api.contract.model.DataEntitySubType;
import com.provectus.oddplatform.api.contract.model.DataEntityType;
import com.provectus.oddplatform.api.contract.model.DataEntityTypeDictionary;
import com.provectus.oddplatform.api.contract.model.DataQualityTestExpectation;
import com.provectus.oddplatform.api.contract.model.DataSetStats;
import com.provectus.oddplatform.dto.DataEntityDetailsDto;
import com.provectus.oddplatform.dto.DataEntityDimensionsDto;
import com.provectus.oddplatform.dto.DataEntityDto;
import com.provectus.oddplatform.dto.DataEntityLineageDto;
import com.provectus.oddplatform.dto.DataEntityLineageStreamDto;
import com.provectus.oddplatform.dto.DataSourceDto;
import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.utils.JSONSerDeUtils;
import com.provectus.oddplatform.utils.Page;
import com.provectus.oddplatform.utils.Pair;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.MapUtils;
import org.jooq.JSONB;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataEntityMapperImpl implements DataEntityMapper {
    private final NamespaceMapper namespaceMapper;
    private final DataSourceMapper dataSourceMapper;
    private final OwnershipMapper ownershipMapper;
    private final TagMapper tagMapper;
    private final MetadataFieldMapper metadataFieldMapper;
    private final DatasetVersionMapper datasetVersionMapper;

    @Override
    public DataEntity mapPojo(final DataEntityDimensionsDto dataEntityDto) {
        return mapPojo(dataEntityDto.getDataEntity())
            .types(dataEntityDto.getTypes().stream().map(this::mapType).collect(Collectors.toList()))
            .subType(mapSubType(dataEntityDto.getSubtype()))
            .namespace(namespaceMapper.mapPojo(dataEntityDto.getNamespace()))
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
            .namespace(namespaceMapper.mapPojo(dto.getNamespace()))
            .ownership(ownershipMapper.mapDtos(dto.getOwnership()))
            .dataSource(dataSourceMapper.mapPojo(new DataSourceDto(dto.getDataSource(), dto.getNamespace())))
            .tags(dto.getTags().stream().map(tagMapper::mapPojo).collect(Collectors.toList()))
            .versionList(datasetVersionMapper.mapPojo(dto.getDataSetDetailsDto().getDatasetVersions()))
            .metadataFieldValues(metadataFieldMapper.mapDtos(dto.getMetadata()))
            .viewCount(pojo.getViewCount());

        final List<DataEntityType.NameEnum> typeNames = types
            .stream()
            .map(DataEntityType::getName)
            .collect(Collectors.toList());

        if (typeNames.contains(DataEntityType.NameEnum.SET)) {
            // TODO: move to the dto
            details.setStats(mapStats(pojo.getSpecificAttributes()));
        }

        if (typeNames.contains(DataEntityType.NameEnum.TRANSFORMER)) {
            details
                .sourceList(dto.getDataTransformerDetailsDto().getSourceList()
                    .stream()
                    .map(this::mapReference)
                    .collect(Collectors.toList()))
                .targetList(dto.getDataTransformerDetailsDto()
                    .getTargetList()
                    .stream()
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
                    .map(this::mapReference)
                    .collect(Collectors.toList()))
                .linkedUrlList(dto.getDataQualityTestDetailsDto().getLinkedUrlList())
                .suiteName(dto.getDataQualityTestDetailsDto().getSuiteName())
                .suiteUrl(dto.getDataQualityTestDetailsDto().getSuiteUrl());
        }

        return details;
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
        final NamespacePojo namespace = dto.getNamespace();
        final DataSourcePojo dataSource = dto.getDataSource();

        return new DataEntityLineageNode()
            .id(dataEntity.getId())
            .types(dto.getTypes().stream().map(this::mapType).collect(Collectors.toList()))
            .externalName(dataEntity.getExternalName())
            .internalName(dataEntity.getInternalName())
            .namespace(namespace != null ? namespaceMapper.mapPojo(namespace) : null)
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

    private DataSetStats mapStats(final JSONB specificAttributes) {
        final Map<String, ?> sa =
            JSONSerDeUtils.deserializeJson(specificAttributes.data(), new TypeReference<Map<String, ?>>() {
            });

        return JSONSerDeUtils
            .deserializeJson(sa.get(DataEntityType.NameEnum.SET.getValue()), DataSetStats.class);
    }
}
