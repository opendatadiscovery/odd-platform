package org.opendatadiscovery.oddplatform.service;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.mapper.ingestion.DataSourceIngestionMapper;
import org.opendatadiscovery.oddplatform.mapper.ingestion.DataSourceIngestionMapperImpl;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCollectorRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DataSourceIngestionServiceTest {

    private DataSourceIngestionService dataSourceIngestionService;

    @Mock
    private ReactiveDataSourceRepository reactiveDataSourceRepository;

    @Mock
    private ReactiveCollectorRepository reactiveCollectorRepository;

    private final DataSourceIngestionMapper dataSourceIngestionMapper = new DataSourceIngestionMapperImpl();

    private final long collectorId = 1L;

    @BeforeEach
    void setUp() {
        dataSourceIngestionService = new DataSourceIngestionServiceImpl(reactiveDataSourceRepository,
            reactiveCollectorRepository, dataSourceIngestionMapper);
    }

    @Test
    @DisplayName("Throws exception if the collector is empty")
    public void createDataSourcesForEmptyCollectorTest() {
        when(reactiveCollectorRepository.getDto(eq(collectorId)))
            .thenReturn(Mono.empty());

        dataSourceIngestionService
            .createDataSources(collectorId, new DataSourceList())
            .as(StepVerifier::create)
            .expectErrorMatches(throwable -> throwable instanceof NotFoundException)
            .verify();
    }

    @ParameterizedTest
    @MethodSource("dataSourcesProvider")
    @DisplayName("Creates new datasources or updates existing ones")
    public void createDataSourcesTest(final DataSourceList dataSourceList,
                                      final Collection<DataSource> expected,
                                      final Flux<DataSourceDto> dataSourceMock) {
        final var collectorDto = new CollectorDto(new CollectorPojo(), new NamespacePojo(),
            new TokenDto(new TokenPojo()));

        when(reactiveCollectorRepository.getDto(eq(collectorId)))
            .thenReturn(Mono.just(collectorDto));

        when(reactiveDataSourceRepository.getDtosByOddrns(anyList())).thenReturn(dataSourceMock);
        when(reactiveDataSourceRepository.bulkUpdate(anyList())).thenAnswer(i -> Flux.fromIterable(i.getArgument(0)));
        when(reactiveDataSourceRepository.bulkCreate(anyList())).thenAnswer(i -> Flux.fromIterable(i.getArgument(0)));

        dataSourceIngestionService
            .createDataSources(collectorId, dataSourceList)
            .as(StepVerifier::create)
            .expectNextSequence(expected)
            .verifyComplete();
    }

    private static Stream<Arguments> dataSourcesProvider() {
        final var newDataSourceOddrn = "//newoddrn";
        final var newDataSourceName = "newdatasource";
        final var existingDataSourceOddrn = "//existingoddrn";
        final var existingDataSourceName = "existingdatasource";
        final var newDataSource = new DataSource()
            .oddrn(newDataSourceOddrn)
            .name(newDataSourceName);
        final var existingDataSource = new DataSource()
            .oddrn(existingDataSourceOddrn)
            .name(existingDataSourceName);
        final var newDataSourceList = new DataSourceList().addItemsItem(newDataSource);
        final var existingDataSourceList = new DataSourceList().addItemsItem(existingDataSource);
        final var combinedDataSourceList = new DataSourceList().items(
            List.of(existingDataSource, newDataSource));
        final var existingDataSourceMock =
            Flux.just(
                new DataSourceDto(new DataSourcePojo()
                    .setOddrn(existingDataSourceOddrn)
                    .setName(existingDataSourceName), new TokenDto(new TokenPojo()))
            );
        return Stream.of(
            Arguments.arguments(newDataSourceList, List.of(newDataSource), existingDataSourceMock),
            Arguments.arguments(newDataSourceList, List.of(newDataSource), Flux.empty()),
            Arguments.arguments(existingDataSourceList, List.of(existingDataSource), existingDataSourceMock),
            Arguments.arguments(combinedDataSourceList, List.of(existingDataSource, newDataSource),
                existingDataSourceMock),
            Arguments.arguments(new DataSourceList(), Collections.emptyList(), Flux.empty()),
            Arguments.arguments(new DataSourceList(), Collections.emptyList(), existingDataSourceMock)
        );
    }
}
