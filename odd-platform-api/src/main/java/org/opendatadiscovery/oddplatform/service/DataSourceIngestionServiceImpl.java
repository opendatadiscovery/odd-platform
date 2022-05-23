package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.mapper.ingestion.DataSourceIngestionMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCollectorRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.utils.MappingUtils;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class DataSourceIngestionServiceImpl implements DataSourceIngestionService {
    private final ReactiveDataSourceRepository reactiveDataSourceRepository;
    private final ReactiveCollectorRepository reactiveCollectorRepository;
    private final DataSourceIngestionMapper dataSourceIngestionMapper;

    @Override
    @ReactiveTransactional
    public Flux<DataSource> createDataSources(final long collectorId, final DataSourceList dataSourceList) {
        return reactiveCollectorRepository.getDto(collectorId)
            .switchIfEmpty(Mono.error(new NotFoundException("Couldn't find collector with id %s", collectorId)))
            .flatMapMany(c -> {
                final List<DataSourcePojo> dataSources = mapDataSources(dataSourceList, c);

                return reactiveDataSourceRepository.getDtosByOddrns(extractOddrns(dataSources))
                    .map(DataSourceDto::dataSource)
                    .collectList()
                    .flatMapMany(list -> {
                        final List<DataSourcePojo> toUpdate = prepareForUpdate(list, dataSources);
                        log.info("Going to update datasources with oddrns {}",
                            toUpdate.stream().map(DataSourcePojo::getOddrn).collect(Collectors.joining(",")));
                        final Flux<DataSourcePojo> updatedDataSources =
                            reactiveDataSourceRepository.bulkUpdate(toUpdate);

                        final List<DataSourcePojo> toCreate = prepareForCreate(dataSources,
                            list.stream().map(DataSourcePojo::getOddrn).collect(Collectors.toSet()));
                        log.info("Going to create datasources with oddrns {}",
                            toCreate.stream().map(DataSourcePojo::getOddrn).collect(Collectors.joining(",")));

                        final Flux<DataSourcePojo> createdDataSources =
                            reactiveDataSourceRepository.bulkCreate(toCreate);

                        return Flux.concat(updatedDataSources, createdDataSources);
                    })
                    .map(dataSourceIngestionMapper::mapPojoToIngestionModel);
            });
    }

    private List<DataSourcePojo> prepareForUpdate(final List<DataSourcePojo> actual,
                                                  final List<DataSourcePojo> ingested) {
        final Map<String, DataSourcePojo> actualDict =
            actual.stream().collect(toMap(DataSourcePojo::getOddrn, identity()));

        return ingested.stream()
            .map(i -> {
                final DataSourcePojo a = actualDict.get(i.getOddrn());
                if (a == null) {
                    return null;
                }

                return new DataSourcePojo(a)
                    .setName(i.getName())
                    .setDescription(i.getDescription())
                    .setNamespaceId(i.getNamespaceId());
            })
            .filter(Objects::nonNull)
            .toList();
    }

    private List<DataSourcePojo> prepareForCreate(final List<DataSourcePojo> ingested,
                                                  final Set<String> existingOddrns) {
        return ingested.stream().filter(i -> !existingOddrns.contains(i.getOddrn())).toList();
    }

    private List<DataSourcePojo> mapDataSources(final DataSourceList dataSourceList, final CollectorDto c) {
        return dataSourceList.getItems().stream()
            .map(ds -> dataSourceIngestionMapper.mapIngestionModel(ds,
                MappingUtils.extractFieldFromNullableObject(c.namespace(), NamespacePojo::getId),
                c.collectorPojo().getId()
            ))
            .toList();
    }

    private List<String> extractOddrns(final List<DataSourcePojo> dtos) {
        return dtos.stream()
            .map(DataSourcePojo::getOddrn)
            .toList();
    }
}
