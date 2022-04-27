package org.opendatadiscovery.oddplatform.repository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static java.util.function.Function.identity;
import static org.assertj.core.api.Assertions.assertThat;

public class DataSourceRepositoryImplTest extends BaseIntegrationTest {
    @Autowired
    private ReactiveDataSourceRepository dataSourceRepository;

    @Autowired
    private ReactiveNamespaceRepository namespaceRepository;

    @Autowired
    private TokenRepository tokenRepository;

    @Test
    @DisplayName("Gets a data source dto object from the database, assuming it has a token attached")
    public void getDtoTest() {
        final Mono<DataSourceDto> expected = Mono.zip(
            namespaceRepository.createByName(UUID.randomUUID().toString()),
            tokenRepository.create(new TokenPojo().setValue(UUID.randomUUID().toString()))
        ).flatMap(t -> dataSourceRepository
            .create(createDataSourcePojo(t.getT1().getId(), t.getT2().tokenPojo().getId()))
            .map(ds -> new DataSourceDto(ds, t.getT1(), t.getT2())));

        expected.zipWhen(ds -> dataSourceRepository.getDto(ds.dataSource().getId()))
            .as(StepVerifier::create)
            .assertNext(t -> {
                assertThat(t.getT1()).usingRecursiveComparison().ignoringFields("token.showToken").isEqualTo(t.getT2());
                assertThat(t.getT2().token().showToken()).isFalse();
            })
            .verifyComplete();

        final Mono<DataSourceDto> expectedNoNamespace =
            tokenRepository.create(new TokenPojo().setValue(UUID.randomUUID().toString()))
                .flatMap(t -> dataSourceRepository
                    .create(createDataSourcePojo(null, t.tokenPojo().getId()))
                    .map(ds -> new DataSourceDto(ds, t)));

        expectedNoNamespace.zipWhen(ds -> dataSourceRepository.getDto(ds.dataSource().getId()))
            .as(StepVerifier::create)
            .assertNext(t -> {
                assertThat(t.getT1()).usingRecursiveComparison().ignoringFields("token.showToken").isEqualTo(t.getT2());
                assertThat(t.getT2().token().showToken()).isFalse();
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Gets a paginated list of data source dto objects with different attachments in terms of namespaces")
    public void listDtoTest() {
        final Mono<NamespacePojo> namespace1 = namespaceRepository.createByName(UUID.randomUUID().toString());
        final Mono<NamespacePojo> namespace2 = namespaceRepository.createByName(UUID.randomUUID().toString());
        final Mono<TokenDto> token = tokenRepository.create(new TokenPojo().setValue(UUID.randomUUID().toString()));

        final Mono<List<DataSourceDto>> created = Mono.zip(namespace1, namespace2, token)
            .map(t -> generateDataSources(t.getT1(), t.getT2(), t.getT3()))
            .flatMap(dtos -> dataSourceRepository
                .bulkCreate(dtos.values().stream().map(DataSourceDto::dataSource).toList())
                .map(ds -> {
                    final DataSourceDto dataSourceDto = dtos.get(ds.getId());
                    return new DataSourceDto(ds, dataSourceDto.namespace(), dataSourceDto.token());
                })
                .collectSortedList(Comparator.comparingLong(ds -> ds.dataSource().getId())))
            .cache();
    }

    @Test
    @DisplayName("Gets a paginated list of data source dto objects querying their names")
    public void listDtoNameQueryTest() {
    }

    private Map<Long, DataSourceDto> generateDataSources(final NamespacePojo namespace1,
                                                         final NamespacePojo namespace2,
                                                         final TokenDto token) {
        final Stream<DataSourceDto> namespace1DataSources = Stream
            .generate(namespace1::getId)
            .map(id -> createDataSourcePojo(id, token.tokenPojo().getId()))
            .map(ds -> new DataSourceDto(ds, namespace1, token))
            .limit(5);

        final Stream<DataSourceDto> namespace2DataSources = Stream
            .generate(namespace2::getId)
            .map(id -> createDataSourcePojo(id, token.tokenPojo().getId()))
            .map(ds -> new DataSourceDto(ds, namespace2, token))
            .limit(2);

        final Stream<DataSourceDto> noNamespaceDataSources = Stream
            .generate(() -> createDataSourcePojo(null, token.tokenPojo().getId()))
            .map(ds -> new DataSourceDto(ds, token))
            .limit(4);

        return Stream.of(namespace1DataSources, namespace2DataSources, noNamespaceDataSources)
            .flatMap(identity())
            .collect(Collectors.toMap(ds -> ds.dataSource().getId(), identity()));
    }

    private DataSourcePojo createDataSourcePojo(final Long namespaceId, final Long tokenId) {
        return new DataSourcePojo()
            .setName(UUID.randomUUID().toString())
            .setDescription(UUID.randomUUID().toString())
            .setActive(true)
            .setOddrn(UUID.randomUUID().toString())
            .setNamespaceId(namespaceId)
            .setTokenId(tokenId);
    }
}
