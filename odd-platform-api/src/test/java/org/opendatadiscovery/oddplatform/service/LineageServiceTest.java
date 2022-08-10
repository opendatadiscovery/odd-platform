package org.opendatadiscovery.oddplatform.service;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import org.jeasy.random.EasyRandom;
import org.jeasy.random.EasyRandomParameters;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.mapper.LineageMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGroupEntityRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLineageRepository;
import org.opendatadiscovery.oddplatform.utils.RecordFactory;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.jeasy.random.FieldPredicates.named;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit tests for LineageService")
class LineageServiceTest {

    private LineageService lineageService;

    @Mock
    private ReactiveLineageRepository lineageRepository;

    @Mock
    private ReactiveGroupEntityRelationRepository groupEntityRelationRepository;

    @Mock
    private DataEntityRepository dataEntityRepository;

    @Mock
    private LineageMapper lineageMapper;

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
        lineageService = new LineageServiceImpl(lineageRepository, dataEntityRepository, groupEntityRelationRepository,
            lineageMapper);
    }

    @Test
    void getLineage() {
        final var rootEntityOddrn = "root";
        final var firstChildEntityOddrn = "firstChild";
        final var secondChildEntityOddrn = "secondChild";
        final var groupEntityOddrn = "group";
        final var rootEntity = new DataEntityPojo().setOddrn(rootEntityOddrn);
        final var firstChildEntity = new DataEntityPojo().setOddrn(firstChildEntityOddrn);
        final var secondChildEntity = new DataEntityPojo().setOddrn(secondChildEntityOddrn);

        final var dto = DataEntityDimensionsDto.dimensionsBuilder()
            .dataEntity(new DataEntityPojo().setOddrn("some")).build();
        when(dataEntityRepository.get(eq(1L))).thenReturn(Optional.of(dto));
        when(lineageRepository.getLineageRelations(any(), any(), any()))
            .thenReturn(Flux.just(EASY_RANDOM.nextObject(LineagePojo.class)));
        when(groupEntityRelationRepository.fetchGroupRelations(any()))
            .thenReturn(Mono.just(new HashMap<>()));
        when(lineageRepository.getChildrenCount(any())).thenReturn(Mono.just(new HashMap<>()));
        when(lineageRepository.getParentCount(any())).thenReturn(Mono.just(new HashMap<>()));
        when(dataEntityRepository.listDimensionsByOddrns(any())).thenReturn(List.of());

        lineageService
            .getLineage(1L, 1, LineageStreamKind.DOWNSTREAM)
            .as(StepVerifier::create)
            .assertNext(r -> assertThat(r).isEqualTo(null))
            .verifyComplete();
    }

    @Test
    void getDataEntityGroupLineage() {
        lineageService
            .getDataEntityGroupLineage(1L)
            .as(StepVerifier::create)
            .assertNext(r -> assertThat(r).isEqualTo(null))
            .verifyComplete();
    }
}