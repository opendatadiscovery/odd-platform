package org.opendatadiscovery.oddplatform.mapper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClass;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupLineageList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineage;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageEdge;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageNode;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageStream;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityGroupLineageDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityLineageDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityLineageStreamDto;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageNodeDto;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.beans.factory.annotation.Autowired;

import static java.util.Collections.emptyList;

@Mapper(config = MapperConfig.class)
public abstract class LineageMapper {

    private DataEntityMapper dataEntityMapper;
    private DataSourceMapper dataSourceMapper;

    @Autowired
    public void setDataEntityMapper(final DataEntityMapper dataEntityMapper) {
        this.dataEntityMapper = dataEntityMapper;
    }

    @Autowired
    public void setDataSourceMapper(final DataSourceMapper dataSourceMapper) {
        this.dataSourceMapper = dataSourceMapper;
    }

    @Mapping(target = "root", source = "dataEntityDto")
    public abstract DataEntityLineage mapLineageDto(final DataEntityLineageDto dataEntityLineageDto);

    public DataEntityGroupLineageList mapGroupLineageDto(final DataEntityGroupLineageDto dataEntityGroupLineageDto) {
        final List<DataEntityLineageStream> lineageStreams = dataEntityGroupLineageDto.lineageItems()
            .stream()
            .map(this::mapStream)
            .toList();

        return new DataEntityGroupLineageList().items(lineageStreams);
    }

    DataEntityLineageStream mapStream(final DataEntityLineageStreamDto stream) {
        if (stream == null) {
            return null;
        }
        final Map<Long, List<Long>> groupsRelations = stream.groupsRelations();

        final Set<Long> streamGroups = new HashSet<>();
        final List<DataEntityLineageNode> nodes = new ArrayList<>();

        for (final LineageNodeDto node : stream.nodes()) {
            final List<Long> groupIds = groupsRelations.get(node.entity().getDataEntity().getId());
            if (groupIds != null) {
                streamGroups.addAll(groupIds);
            }

            nodes.add(mapNode(node, groupIds));
        }

        return new DataEntityLineageStream()
            .nodes(nodes)
            .edges(stream.edges().stream().map(this::mapEdge).collect(Collectors.toList()))
            .groups(stream.groups()
                .stream()
                .filter(g -> streamGroups.contains(g.getDataEntity().getId()))
                .map(this::mapRootOrGroupNode)
                .collect(Collectors.toList()));
    }

    @Mapping(target = "sourceId", source = "left")
    @Mapping(target = "targetId", source = "right")
    abstract DataEntityLineageEdge mapEdge(final Pair<Long, Long> edge);

    DataEntityLineageNode mapRootOrGroupNode(final DataEntityDimensionsDto dto) {
        return mapNode(new LineageNodeDto(dto, null, null), emptyList());
    }

    @Mapping(target = "groupIdList", source = "groupIds")
    @Mapping(target = "id", source = "dto.entity.dataEntity.id")
    @Mapping(target = "oddrn", source = "dto.entity.dataEntity.oddrn")
    @Mapping(target = "externalName", source = "dto.entity.dataEntity.externalName")
    @Mapping(target = "internalName", source = "dto.entity.dataEntity.internalName")
    @Mapping(target = "entityClasses", source = "dto", qualifiedByName = "entityClassesNamed")
    @Mapping(target = "dataSource", source = "dto", qualifiedByName = "dtoToDataSourceNamed")
    abstract DataEntityLineageNode mapNode(final LineageNodeDto dto, final List<Long> groupIds);

    @Named("entityClassesNamed")
    List<DataEntityClass> mapDtoToEntityClasses(final LineageNodeDto dto) {
        return DataEntityClassDto.findByIds(dto.entity().getDataEntity().getEntityClassIds())
            .stream()
            .map(dataEntityMapper::mapEntityClass)
            .toList();
    }

    @Named("dtoToDataSourceNamed")
    DataSource mapDtoToDataSource(final LineageNodeDto dto) {
        return dto.entity().getDataSource() != null
            ? dataSourceMapper.mapDto(new DataSourceDto(dto.entity().getDataSource(),
            dto.entity().getNamespace(), null))
            : null;
    }
}

