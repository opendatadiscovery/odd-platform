package org.opendatadiscovery.oddplatform.service;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceDirectory;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceDirectoryList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceTypeList;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataSourceMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.utils.OddrnUtils;
import org.opendatadiscovery.oddrn.Generator;
import org.opendatadiscovery.oddrn.annotation.PathField;
import org.opendatadiscovery.oddrn.model.OddrnPath;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import static org.opendatadiscovery.oddplatform.utils.OddrnUtils.UNKNOWN_DATASOURCE_TYPE;
import static reactor.function.TupleUtils.function;

@Service
@Slf4j
@RequiredArgsConstructor
public class DirectoryServiceImpl implements DirectoryService {
    private final ReactiveDataSourceRepository dataSourceRepository;
    private final ReactiveDataEntityRepository dataEntityRepository;
    private final DataSourceMapper dataSourceMapper;
    private final Generator oddrnGenerator = Generator.getInstance();

    @Override
    public Mono<DataSourceTypeList> getDataSourceTypes() {
        final Mono<Map<Long, Long>> countByDataSource = dataEntityRepository.getCountByDataSources();
        final Mono<Map<String, Collection<DataSourcePojo>>> groupedDataSources = dataSourceRepository.list()
            .collectMultimap(pojo -> getDataSourcePrefix(pojo.getOddrn()));

        return Mono.zip(countByDataSource, groupedDataSources).map(function((counts, dataSourcesMap) -> {
            final List<DataSourceType> dataSourceTypes = dataSourcesMap.entrySet().stream()
                .map(e -> {
                    final Long prefixCount = getPrefixCount(e.getValue(), counts);
                    final DataSourcePojo dataSource = getFirstDataSource(e.getValue());
                    return new DataSourceType()
                        .prefix(OddrnUtils.transformPrefix(e.getKey()))
                        .name(getDataSourceName(dataSource.getOddrn()))
                        .entitiesCount(prefixCount);
                }).toList();
            return new DataSourceTypeList().items(dataSourceTypes);
        }));
    }

    @Override
    public Mono<DataSourceDirectoryList> getDirectoryDatasourceList(final String prefix) {
        final String normalizedPrefix = OddrnUtils.normalizePrefix(prefix);
        return getDataSourcesByPrefix(normalizedPrefix)
            .flatMap(dataSources -> {
                final List<Long> ids = dataSources.stream().map(DataSourcePojo::getId).toList();
                return dataEntityRepository.getCountByDataSources(ids).map(counts -> Tuples.of(counts, dataSources));
            })
            .map(function((counts, pojos) -> {
                final Long totalCount = counts.values().stream().reduce(Long::sum).orElse(0L);
                final List<DataSourceDirectory> dataSources = pojos.stream().map(pojo -> {
                    final Map<String, String> oddrnProperties = getOddrnProperties(pojo.getOddrn(), normalizedPrefix);
                    final Long entitiesCount = counts.getOrDefault(pojo.getId(), 0L);
                    return dataSourceMapper.mapToDirectoryDataSource(pojo, oddrnProperties, entitiesCount);
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

    private Mono<List<DataSourcePojo>> getDataSourcesByPrefix(final String prefix) {
        if (UNKNOWN_DATASOURCE_TYPE.equalsIgnoreCase(prefix)) {
            return dataSourceRepository.list()
                .filter(pojo -> getDataSourcePrefix(pojo.getOddrn()).equals(UNKNOWN_DATASOURCE_TYPE))
                .collectList();
        } else {
            return dataSourceRepository.findByPrefix(prefix).collectList();
        }
    }

    private String getDataSourcePrefix(final String oddrn) {
        try {
            return oddrnGenerator.parse(oddrn)
                .map(OddrnPath::prefix)
                .orElse(UNKNOWN_DATASOURCE_TYPE);
        } catch (Exception e) {
            log.error("Error while extracting ODDRN prefix for oddrn {}", oddrn, e);
            return UNKNOWN_DATASOURCE_TYPE;
        }
    }

    private String getDataSourceName(final String oddrn) {
        try {
            return oddrnGenerator.parse(oddrn)
                .map(OddrnPath::name)
                .map(name -> StringUtils.capitalize(name).replace("_", " "))
                .orElse(StringUtils.capitalize(UNKNOWN_DATASOURCE_TYPE));
        } catch (Exception e) {
            log.error("Error while extracting ODDRN name for oddrn {}", oddrn, e);
            return StringUtils.capitalize(UNKNOWN_DATASOURCE_TYPE);
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
        final Map<String, String> defaultPropertiesMap = Map.of("oddrn", oddrn);
        if (UNKNOWN_DATASOURCE_TYPE.equalsIgnoreCase(prefix)) {
            return defaultPropertiesMap;
        }
        try {
            return oddrnGenerator.parse(oddrn)
                .map(this::getOddrnPathProperties)
                .filter(map -> !map.isEmpty())
                .orElse(defaultPropertiesMap);
        } catch (Exception e) {
            return defaultPropertiesMap;
        }
    }

    private Map<String, String> getOddrnPathProperties(final OddrnPath path) {
        final Map<String, String> properties = new HashMap<>();
        final Class<? extends OddrnPath> pathClass = path.getClass();
        for (final Field field : pathClass.getDeclaredFields()) {
            final PathField annotation = field.getAnnotation(PathField.class);
            if (annotation != null) {
                try {
                    final Method getMethod = pathClass.getMethod("get" + StringUtils.capitalize(field.getName()));
                    final Object value = getMethod.invoke(path);
                    if (value != null) {
                        properties.put(field.getName(), value.toString());
                    }
                } catch (Exception e) {
                    log.error("Can't read OddrnPath property", e);
                }
            }
        }
        return properties;
    }

    private DataSourcePojo getFirstDataSource(final Collection<DataSourcePojo> pojos) {
        if (CollectionUtils.isEmpty(pojos)) {
            throw new IllegalArgumentException("Collection can not be empty");
        }
        return pojos.iterator().next();
    }
}
