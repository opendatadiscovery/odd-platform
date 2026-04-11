package org.opendatadiscovery.oddplatform.api;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceDirectory;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceDirectoryList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceTypeList;
import org.opendatadiscovery.oddplatform.api.ingestion.utils.IngestionModelGenerator;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.utils.OddrnUtils;
import org.opendatadiscovery.oddrn.model.OddrnPath;
import org.opendatadiscovery.oddrn.model.PostgreSqlPath;

import static org.assertj.core.api.Assertions.assertThat;

public class DirectoryTest extends BaseIngestionTest {

    @Test
    public void directoriesTest() {
        final PostgreSqlPath firstPostgresPath = PostgreSqlPath.builder()
            .host("1.2.3.4")
            .database("test")
            .build();
        final PostgreSqlPath secondPostgresPath = PostgreSqlPath.builder()
            .host("1.2.3.4")
            .database("odd")
            .build();
        final String firstUnknownOddrn = "//oddplatform/host/1.2.3.4";
        final String secondUnknownOddrn = "//unknown/odd";

        final DataSource firstPostgres = createDataSource(dataSourceFormData(firstPostgresPath.oddrn()));
        final long firstPostgresCount = ingestEntitiesForDataSource(firstPostgres, 5);

        final DataSource secondPostgres = createDataSource(dataSourceFormData(secondPostgresPath.oddrn()));
        final long secondPostgresCount = ingestEntitiesForDataSource(secondPostgres, 10);

        final DataSource firstUnknown = createDataSource(dataSourceFormData(firstUnknownOddrn));
        final long firstUnknownCount = ingestEntitiesForDataSource(firstUnknown, 3);

        final DataSource secondUnknown = createDataSource(dataSourceFormData(secondUnknownOddrn));
        final long secondUnknownCount = ingestEntitiesForDataSource(secondUnknown, 2);

        final DataSourceTypeList dataSourceTypeList = getDataSourceTypeList();
        assertThat(dataSourceTypeList.getItems()).hasSize(2);

        final Map<OddrnPath, Long> existingDataSourceTypesMap =
            Map.of(PostgreSqlPath.builder().build(), firstPostgresCount + secondPostgresCount);

        final List<DataSourceType> existingTypes = buildExistingExpectedTypes(existingDataSourceTypesMap);
        final List<DataSourceType> unknownTypes = buildUnknownExpectedTypes(firstUnknownCount + secondUnknownCount);

        assertThat(dataSourceTypeList.getItems())
            .hasSameElementsAs(CollectionUtils.union(existingTypes, unknownTypes));

        final String postgresPrefix = OddrnUtils.transformPrefix(PostgreSqlPath.builder().build().prefix());
        final DataSourceDirectoryList postgresDataSources = getDataSourceList(postgresPrefix);

        assertThat(postgresDataSources.getEntitiesCount()).isEqualTo(firstPostgresCount + secondPostgresCount);
        assertThat(postgresDataSources.getItems()).hasSize(2);
        assertThat(postgresDataSources.getItems()).hasSameElementsAs(List.of(
            buildExpectedPostgresDataSource(firstPostgresPath, firstPostgres, firstPostgresCount),
            buildExpectedPostgresDataSource(secondPostgresPath, secondPostgres, secondPostgresCount)
        ));

        final DataSourceDirectoryList otherDataSources = getDataSourceList(OddrnUtils.UNKNOWN_DATASOURCE_TYPE);
        assertThat(otherDataSources.getEntitiesCount()).isEqualTo(firstUnknownCount + secondUnknownCount);
        assertThat(otherDataSources.getItems()).hasSize(2);
        assertThat(otherDataSources.getItems()).hasSameElementsAs(List.of(
            buildExpectedUnknownDataSource(firstUnknown, firstUnknownCount),
            buildExpectedUnknownDataSource(secondUnknown, secondUnknownCount)
        ));
    }

    private DataSourceTypeList getDataSourceTypeList() {
        return webTestClient.get()
            .uri("/api/directory")
            .exchange()
            .returnResult(DataSourceTypeList.class)
            .getResponseBody()
            .single()
            .block();
    }

    private DataSourceDirectoryList getDataSourceList(final String prefix) {
        return webTestClient.get()
            .uri("/api/directory/datasources?prefix={prefix}", prefix)
            .exchange()
            .returnResult(DataSourceDirectoryList.class)
            .getResponseBody()
            .single()
            .block();
    }

    private long ingestEntitiesForDataSource(final DataSource dataSource, final int entitiesCount) {
        final List<DataEntity> dataEntities = IntStream.range(0, entitiesCount)
            .mapToObj(
                i -> IngestionModelGenerator.generateSimpleDataEntity(DataEntityType.TABLE).dataset(new DataSet()))
            .toList();
        final var entityList = new DataEntityList()
            .dataSourceOddrn(dataSource.getOddrn())
            .items(dataEntities);
        ingestAndAssert(entityList);
        return entitiesCount;
    }

    private DataSourceFormData dataSourceFormData(final String oddrn) {
        return new DataSourceFormData()
            .name(UUID.randomUUID().toString())
            .oddrn(oddrn);
    }

    private List<DataSourceType> buildExistingExpectedTypes(final Map<OddrnPath, Long> types) {
        return types.entrySet().stream()
            .map(e -> new DataSourceType()
                .name(StringUtils.capitalize(e.getKey().name()).replace("_", " "))
                .prefix(OddrnUtils.transformPrefix(e.getKey().prefix()))
                .entitiesCount(e.getValue()))
            .collect(Collectors.toList());
    }

    private List<DataSourceType> buildUnknownExpectedTypes(final Long otherCount) {
        final List<DataSourceType> result = new ArrayList<>();
        result.add(new DataSourceType().name("Other").prefix("other").entitiesCount(otherCount));
        return result;
    }

    private DataSourceDirectory buildExpectedPostgresDataSource(final PostgreSqlPath path,
                                                                final DataSource dataSource,
                                                                final Long entitiesCount) {
        return new DataSourceDirectory()
            .id(dataSource.getId())
            .name(dataSource.getName())
            .properties(Map.of("host", path.getHost(), "database", path.getDatabase()))
            .entitiesCount(entitiesCount);
    }

    private DataSourceDirectory buildExpectedUnknownDataSource(final DataSource dataSource,
                                                               final Long entitiesCount) {
        return new DataSourceDirectory()
            .id(dataSource.getId())
            .name(dataSource.getName())
            .properties(Map.of("oddrn", dataSource.getOddrn()))
            .entitiesCount(entitiesCount);
    }
}
