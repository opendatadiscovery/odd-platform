package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.jeasy.random.EasyRandom;
import org.jeasy.random.EasyRandomParameters;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageEdge;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineageNode;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityGroupLineageDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityLineageDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityLineageStreamDto;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageNodeDto;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.opendatadiscovery.oddplatform.utils.RecordFactory;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.jeasy.random.FieldPredicates.named;

class LineageMapperTest {

    private final LineageMapper mapper = new LineageMapperImpl();

    private static final EasyRandom EASY_RANDOM;

    static {
        final EasyRandomParameters EASY_RANDOMParameters = new EasyRandomParameters()
            .scanClasspathForConcreteTypes(true)
            .excludeField(named("hasChildren"))
            .randomizationDepth(10)
            .objectFactory(new RecordFactory());

        EASY_RANDOM = new EasyRandom(EASY_RANDOMParameters);
    }

    @BeforeEach
    void setUp() {
        mapper.setDataEntityMapper(
            new DataEntityMapperImpl(
                new DataSourceMapperImpl(
                    new NamespaceMapperImpl(),
                    new TokenMapperImpl(
                        new OffsetDateTimeMapperImpl()
                    )
                ),
                new OwnershipMapperImpl(
                    new OwnerMapperImpl(),
                    new TitleMapperImpl()
                ),
                new TagMapperImpl(),
                new MetadataFieldValueMapperImpl(
                    new MetadataFieldMapperImpl()
                ),
                new DatasetVersionMapperImpl(
                    new DatasetFieldApiMapperImpl(
                        new LabelMapperImpl(), new MetadataFieldValueMapperImpl(new MetadataFieldMapperImpl())
                    ),
                    new OffsetDateTimeMapperImpl()
                ),
                new DataEntityRunMapperImpl(
                    new OffsetDateTimeMapperImpl()
                ),
                new TermMapperImpl(
                    new NamespaceMapperImpl(),
                    new OffsetDateTimeMapperImpl(),
                    new OwnershipMapperImpl(
                        new OwnerMapperImpl(),
                        new TitleMapperImpl()
                    )
                )
            )
        );
        mapper.setDataSourceMapper(
            new DataSourceMapperImpl(
                new NamespaceMapperImpl(),
                new TokenMapperImpl(new OffsetDateTimeMapperImpl())
            )
        );
    }

    @Test
    void mapLineageDto() {
        final var dto = DataEntityLineageDto.builder()
            .dataEntityDto(
                EASY_RANDOM.nextObject(DataEntityDimensionsDto.class))
            .downstream(generateStreamDto())
            .build();
        final var result = mapper.mapLineageDto(dto);
        assertThat(result.getRoot().getId()).isEqualTo(dto.getDataEntityDto().getDataEntity().getId());
        assertThat(
            result.getDownstream().getNodes().stream().map(DataEntityLineageNode::getId).collect(Collectors.toList()))
            .isEqualTo(dto.getDownstream().nodes().stream().map(node -> node.entity().getDataEntity().getId()).collect(
                Collectors.toList()));
        assertThat(
            result.getDownstream().getNodes().stream().flatMap(i -> i.getGroupIdList().stream()).distinct().collect(
                Collectors.toList()))
            .isEqualTo(
                List.of(dto.getDownstream().groups().stream().findFirst().orElseThrow().getDataEntity().getId()));
        assertThat(result.getDownstream().getEdges().stream().findFirst().map(DataEntityLineageEdge::getSourceId)
            .orElseThrow())
            .isIn(result.getDownstream().getNodes().stream().map(DataEntityLineageNode::getId)
                .collect(Collectors.toList()));
    }

    @Test
    void mapGroupLineageDto() {
        final var dto = new DataEntityGroupLineageDto(List.of(generateStreamDto()));
        final var result = mapper.mapGroupLineageDto(dto);
        assertThat(
            result.getItems().stream().flatMap(item -> item.getNodes().stream().map(DataEntityLineageNode::getId))
                .collect(
                    Collectors.toList())).isEqualTo(dto.lineageItems().stream()
            .flatMap(item -> item.nodes().stream().map(node -> node.entity().getDataEntity().getId())).collect(
                Collectors.toList()));
        assertThat(result.getItems().stream()
            .flatMap(item -> item.getNodes().stream().flatMap(node -> node.getGroupIdList().stream())).distinct()
            .collect(
                Collectors.toList())).isEqualTo(List.of(
            dto.lineageItems().stream().flatMap(item -> item.groups().stream()).findFirst().orElseThrow()
                .getDataEntity().getId()));
        assertThat(result.getItems().stream().flatMap(item -> item.getEdges().stream()).findFirst()
            .map(DataEntityLineageEdge::getSourceId).orElseThrow()).isIn(
            result.getItems().stream().flatMap(item -> item.getNodes().stream().map(DataEntityLineageNode::getId))
                .collect(
                    Collectors.toList()));
    }

    private DataEntityLineageStreamDto generateStreamDto() {
        final var nodes = EASY_RANDOM.objects(LineageNodeDto.class, 2).toList();
        final var deg = EASY_RANDOM.nextObject(DataEntityDimensionsDto.class);
        final var relations = Map.of(nodes.get(0).entity().getDataEntity().getId(),
            List.of(deg.getDataEntity().getId()),
            nodes.get(1).entity().getDataEntity().getId(),
            List.of(deg.getDataEntity().getId()));
        return new DataEntityLineageStreamDto(
            nodes,
            List.of(
                Pair.of(nodes.get(0).entity().getDataEntity().getId(), nodes.get(1).entity().getDataEntity().getId())),
            List.of(deg),
            relations);
    }
}