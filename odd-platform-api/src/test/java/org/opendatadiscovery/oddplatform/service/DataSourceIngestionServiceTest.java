package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.IntStream;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.mapper.ingestion.DataSourceIngestionMapper;
import org.opendatadiscovery.oddplatform.mapper.ingestion.DataSourceIngestionMapperImpl;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.repository.CollectorRepository;
import org.opendatadiscovery.oddplatform.repository.DataSourceRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DataSourceIngestionServiceTest {

    @Mock
    private DataSourceRepository dataSourceRepository;

    @Mock
    private CollectorRepository collectorRepository;

    @Spy
    private DataSourceIngestionMapper dataSourceIngestionMapper = new DataSourceIngestionMapperImpl();

    private DataSourceIngestionService dataSourceIngestionService;

    @BeforeEach
    public void beforeEach() {
        dataSourceIngestionService = new DataSourceIngestionServiceImpl(dataSourceRepository,
            collectorRepository,
            dataSourceIngestionMapper);
    }

    @Test
    public void test() {
        final List<DataSource> dataSources = generateDataSources(3);
        final List<String> oddrns = dataSources.stream().map(DataSource::getOddrn).toList();
        final CollectorDto collector = generateCollectorWithToken(1L);
        when(collectorRepository.getByOddrn(collector.collectorPojo().getOddrn())).thenReturn(Optional.of(collector));
        when(dataSourceRepository.getByOddrns(oddrns, true))
            .thenReturn(
                List.of(createDtoFromDataSource(dataSources.get(0), 1L, false),
                    createDtoFromDataSource(dataSources.get(1), 2L, true))
            );
        doNothing().when(dataSourceRepository).restoreDataSources(List.of(dataSources.get(1).getOddrn()));
        doNothing().when(dataSourceRepository).setTokenFromCollector(oddrns, collector.tokenDto().tokenPojo().getId());
        when(dataSourceRepository.bulkCreate(List.of(createDtoFromDataSource(dataSources.get(2), null, null))))
            .thenReturn(List.of(createDtoFromDataSource(dataSources.get(2), 3L, false)));
        final DataSourceList dataSourceList = new DataSourceList()
            .items(dataSources)
            .providerOddrn(collector.collectorPojo().getOddrn());
        final Mono<List<DataSource>> dataSourcesFromIngestion =
            dataSourceIngestionService.createDataSourcesFromIngestion(dataSourceList);
        StepVerifier.create(dataSourcesFromIngestion)
            .assertNext(list -> Assertions.assertThat(list)
                .hasSize(3)
                .extracting(DataSource::getOddrn)
                .hasSameElementsAs(oddrns))
            .expectComplete()
            .verify();
    }

    private List<DataSource> generateDataSources(final int count) {
        return IntStream.rangeClosed(1, count)
            .mapToObj(i -> new DataSource()
                .oddrn(UUID.randomUUID().toString())
                .name(UUID.randomUUID().toString()))
            .toList();
    }

    private DataSourceDto createDtoFromDataSource(final DataSource dataSource,
                                                  final Long id,
                                                  final Boolean isDeleted) {
        return new DataSourceDto(
            new DataSourcePojo()
                .setId(id)
                .setOddrn(dataSource.getOddrn())
                .setName(dataSource.getName())
                .setActive(true)
                .setIsDeleted(isDeleted),
            null, null
        );
    }

    private CollectorDto generateCollectorWithToken(final Long id) {
        final CollectorPojo collectorPojo = new CollectorPojo()
            .setId(id)
            .setOddrn(UUID.randomUUID().toString())
            .setName(UUID.randomUUID().toString())
            .setDescription(UUID.randomUUID().toString());
        return new CollectorDto(collectorPojo, null,
            new TokenDto(new TokenPojo()
                .setId(1L)
                .setValue(UUID.randomUUID().toString())));
    }
}
