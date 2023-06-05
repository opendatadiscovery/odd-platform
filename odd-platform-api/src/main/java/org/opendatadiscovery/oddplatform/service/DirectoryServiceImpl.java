package org.opendatadiscovery.oddplatform.service;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceDirectory;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceDirectoryList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceTypeList;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddrn.Generator;
import org.opendatadiscovery.oddrn.model.OddrnPath;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import static reactor.function.TupleUtils.function;

@Service
@Slf4j
@RequiredArgsConstructor
public class DirectoryServiceImpl implements DirectoryService {
    private final ReactiveDataSourceRepository dataSourceRepository;
    private final ReactiveDataEntityRepository dataEntityRepository;
    private final Generator oddrnGenerator;

    @Override
    public Mono<DataSourceTypeList> getDataSourceTypes() {
        final Mono<Map<Long, Long>> countByDataSource = dataEntityRepository.getCountByDataSources();
        final Mono<Map<String, Collection<DataSourcePojo>>> groupedDataSources = dataSourceRepository.list()
            .collectMultimap(pojo -> getDataSourcePrefix(pojo.getOddrn()));

        return Mono.zip(countByDataSource, groupedDataSources).map(function((counts, dataSourcesMap) -> {
            final List<DataSourceType> dataSourceTypes = dataSourcesMap.entrySet().stream()
                .map(e -> {
                    final Long prefixCount = getPrefixCount(e.getValue(), counts);
                    return new DataSourceType().prefix(e.getKey()).entitiesCount(prefixCount);
                }).toList();
            return new DataSourceTypeList().items(dataSourceTypes);
        }));
    }

    @Override
    public Mono<DataSourceDirectoryList> getDirectoryDatasourceList(final String prefix) {
        return dataSourceRepository.findByPrefix(prefix)
            .collectList()
            .flatMap(dataSources -> {
                final List<Long> ids = dataSources.stream().map(DataSourcePojo::getId).toList();
                return dataEntityRepository.getCountByDataSources(ids).map(counts -> Tuples.of(counts, dataSources));
            })
            .map(function((counts, pojos) -> {
                final Long totalCount = counts.values().stream().reduce(Long::sum).orElse(0L);
                final List<DataSourceDirectory> dataSources = pojos.stream().map(pojo -> {
                    final String oddrn = pojo.getOddrn();
                    final Map<String, String> oddrnProperties = getOddrnProperties(oddrn, prefix);
                    final DataSourceDirectory dataSource = new DataSourceDirectory();
                    dataSource.setId(pojo.getId());
                    dataSource.setName(pojo.getName());
                    dataSource.setProperties(oddrnProperties);
                    dataSource.setEntitiesCount(counts.getOrDefault(pojo.getId(), 0L));
                    return dataSource;
                }).toList();
                return new DataSourceDirectoryList().items(dataSources).entitiesCount(totalCount);
            }));
    }

    @Override
    public Flux<DataEntityType> getDatasourceEntityTypes(final long dataSourceId) {
        return dataEntityRepository.getDataSourceEntityTypeIds(dataSourceId)
            .map(this::getDataEntityTypeDto)
            .map(dto -> new DataEntityType().id(dto.getId()).name(DataEntityType.NameEnum.fromValue(dto.name())));
    }

    private String getDataSourcePrefix(final String oddrn) {
        try {
            return oddrnGenerator.parse(oddrn)
                .map(OddrnPath::prefix)
                .orElse(oddrn);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private DataEntityTypeDto getDataEntityTypeDto(final int id) {
        return DataEntityTypeDto.findById(id)
            .orElseThrow(() -> new NotFoundException("Data entity type", id));
    }

    private Long getPrefixCount(final Collection<DataSourcePojo> pojos,
                                final Map<Long, Long> counts) {
        return pojos.stream()
            .map(DataSourcePojo::getId)
            .map(id -> counts.getOrDefault(id, 0L))
            .reduce(Long::sum)
            .orElse(0L);
    }

    private Map<String, String> getOddrnProperties(final String oddrn, final String prefix) {
        final String replaced = oddrn.replace(prefix + "/", "");
        final String[] split = replaced.split("/");
        if (split.length % 2 != 0) {
            log.error("Incorrect built oddrn for data source: {}", oddrn);
            return Map.of();
        }
        final Map<String, String> properties = new HashMap<>();
        for (int i = 0; i < split.length; i += 2) {
            properties.put(StringUtils.capitalize(split[i].toLowerCase()), split[i + 1]);
        }
        return properties;
    }
}
