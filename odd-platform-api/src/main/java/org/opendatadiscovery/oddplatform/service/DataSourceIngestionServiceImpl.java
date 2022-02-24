package org.opendatadiscovery.oddplatform.service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.mapper.ingestion.DataSourceIngestionMapper;
import org.opendatadiscovery.oddplatform.repository.DataSourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataSourceIngestionServiceImpl implements DataSourceIngestionService {

    private final DataSourceRepository dataSourceRepository;
    private final DataSourceIngestionMapper dataSourceIngestionMapper;

    @Override
    @Transactional
    public Mono<List<DataSource>> createDataSourcesFromIngestion(final List<DataSource> dataSources) {
        final List<DataSourceDto> dtos = dataSources.stream()
            .map(dataSourceIngestionMapper::mapIngestionModel)
            .toList();
        final List<String> oddrns = exctractOddrns(dtos);

        final Map<Boolean, List<DataSourceDto>> deletedSplitDataSources = dataSourceRepository
            .getByOddrns(oddrns, true)
            .stream()
            .collect(Collectors.partitioningBy(p -> p.dataSource().getIsDeleted()));

        if (!deletedSplitDataSources.get(true).isEmpty()) {
            final List<String> deletedOddrns = exctractOddrns(deletedSplitDataSources.get(true));
            dataSourceRepository.restoreDataSources(deletedOddrns);
        }

        final List<String> existingOddrns = deletedSplitDataSources.values().stream()
            .flatMap(Collection::stream)
            .map(dto -> dto.dataSource().getOddrn())
            .toList();
        final List<DataSourceDto> dataSourcesToCreate = dtos.stream()
            .filter(dto -> !existingOddrns.contains(dto.dataSource().getOddrn()))
            .toList();
        final List<DataSourceDto> createdDtos = dataSourceRepository.bulkCreate(dataSourcesToCreate);

        final List<DataSource> createdDataSources = Stream.of(
                createdDtos,
                deletedSplitDataSources.get(true),
                deletedSplitDataSources.get(false))
            .flatMap(Collection::stream)
            .map(dataSourceIngestionMapper::mapDtoToIngestionModel)
            .toList();

        return Mono.just(createdDataSources);
    }

    private List<String> exctractOddrns(final List<DataSourceDto> dtos) {
        return dtos.stream()
            .map(dto -> dto.dataSource().getOddrn())
            .toList();
    }
}
