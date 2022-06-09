package org.opendatadiscovery.oddplatform.mapper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClass;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupLineageList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineage;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageEdge;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageNode;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageStream;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityGroupLineageDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityLineageDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityLineageStreamDto;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageNodeDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

import static java.util.Collections.emptyList;

@Component
@RequiredArgsConstructor
public class LineageMapperImpl implements LineageMapper {
    private final DataSourceMapper dataSourceMapper;
    private final DataEntityMapper dataEntityMapper;

    @Override
    public DataEntityLineage mapLineageDto(final DataEntityLineageDto dto) {
        return new DataEntityLineage()
            .root(mapRootOrGroupNode(dto.getDataEntityDto()))
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

    private DataEntityLineageStream mapStream(final DataEntityLineageStreamDto stream) {
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

    private DataEntityLineageEdge mapEdge(final Pair<Long, Long> edge) {
        return new DataEntityLineageEdge()
            .sourceId(edge.getLeft())
            .targetId(edge.getRight());
    }

    private DataEntityLineageNode mapRootOrGroupNode(final DataEntityDimensionsDto dto) {
        return mapNode(new LineageNodeDto(dto, null, null), emptyList());
    }

    private DataEntityLineageNode mapNode(final LineageNodeDto dto, final List<Long> groupId) {
        final DataEntityPojo dataEntity = dto.entity().getDataEntity();
        final DataSourcePojo dataSource = dto.entity().getDataSource();

        final List<DataEntityClass> entityClasses =
            DataEntityClassDto.findByIds(dto.entity().getDataEntity().getEntityClassIds())
                .stream()
                .map(dataEntityMapper::mapEntityClass)
                .toList();

        return new DataEntityLineageNode()
            .id(dataEntity.getId())
            .entityClasses(entityClasses)
            .externalName(dataEntity.getExternalName())
            .internalName(dataEntity.getInternalName())
            .groupIdList(groupId)
            .dataSource(dataSource != null
                ? dataSourceMapper.mapDto(new DataSourceDto(dto.entity().getDataSource(),
                dto.entity().getNamespace(), null))
                : null)
            .childrenCount(dto.childrenCount())
            .parentsCount(dto.parentsCount());
    }
}
