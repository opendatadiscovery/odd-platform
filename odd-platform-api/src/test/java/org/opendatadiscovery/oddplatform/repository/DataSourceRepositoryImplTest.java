package org.opendatadiscovery.oddplatform.repository;

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
import org.springframework.test.annotation.DirtiesContext;
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
    @DisplayName("Gets a data source dto object with namespace from the database, assuming it has a token attached")
    public void getDtoWithNamespaceTest() {
        final NamespacePojo namespace = namespaceRepository.createByName(UUID.randomUUID().toString())
            .blockOptional()
            .orElseThrow();
        final TokenDto token = tokenRepository.create(new TokenPojo().setValue(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();
        final DataSourceDto createdDatasource = dataSourceRepository
            .create(createDataSourcePojo(namespace.getId(), token.tokenPojo().getId()))
            .map(ds -> new DataSourceDto(ds, namespace, token))
            .blockOptional()
            .orElseThrow();

        dataSourceRepository.getDto(createdDatasource.dataSource().getId())
            .as(StepVerifier::create)
            .assertNext(dto -> {
                assertThat(dto).usingRecursiveComparison().ignoringFields("token.showToken")
                    .isEqualTo(createdDatasource);
                assertThat(dto.token().showToken()).isFalse();
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Gets a data source dto object without namespace from the database, assuming it has a token attached")
    public void getDtoWithoutNamespaceTest() {
        final TokenDto token = tokenRepository.create(new TokenPojo().setValue(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();
        final DataSourceDto createdDatasource = dataSourceRepository
            .create(createDataSourcePojo(null, token.tokenPojo().getId()))
            .map(ds -> new DataSourceDto(ds, token))
            .blockOptional()
            .orElseThrow();

        dataSourceRepository.getDto(createdDatasource.dataSource().getId())
            .as(StepVerifier::create)
            .assertNext(dto -> {
                assertThat(dto).usingRecursiveComparison().ignoringFields("token.showToken")
                    .isEqualTo(createdDatasource);
                assertThat(dto.token().showToken()).isFalse();
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Gets a paginated list of data source dto objects with different attachments in terms of namespaces")
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    public void listDtoTest() {
        final var namespace1 = namespaceRepository.createByName(UUID.randomUUID().toString())
            .blockOptional()
            .orElseThrow();
        final var namespace2 = namespaceRepository.createByName(UUID.randomUUID().toString())
            .blockOptional()
            .orElseThrow();
        final var token = tokenRepository.create(new TokenPojo().setValue(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();

        final Map<String, DataSourceDto> dataSourceDtoMap = generateDataSources(namespace1, namespace2, token);
        final List<DataSourceDto> dtos = dataSourceRepository.bulkCreate(
                dataSourceDtoMap.values().stream().map(DataSourceDto::dataSource).toList()
            )
            .map(pojo -> {
                final DataSourceDto dataSourceDto = dataSourceDtoMap.get(pojo.getOddrn());
                return new DataSourceDto(pojo, dataSourceDto.namespace(), dataSourceDto.token());
            })
            .collectList()
            .blockOptional()
            .orElseThrow();

        dataSourceRepository.listDto(1, 6, null)
            .as(StepVerifier::create)
            .assertNext(page -> {
                final List<String> oddrns = page.getData().stream().map(dto -> dto.dataSource().getOddrn()).toList();
                final List<DataSourceDto> extractedDtos = dtos.stream()
                    .filter(dto -> oddrns.contains(dto.dataSource().getOddrn()))
                    .toList();

                assertThat(page.getTotal()).isEqualTo(11);
                assertThat(page.isHasNext()).isTrue();
                assertThat(page.getData())
                    .hasSize(6)
                    .usingRecursiveComparison()
                    .ignoringFields("token.showToken")
                    .ignoringCollectionOrder()
                    .isEqualTo(extractedDtos);
            })
            .verifyComplete();

        dataSourceRepository.listDto(2, 6, null)
            .as(StepVerifier::create)
            .assertNext(page -> {
                final List<String> oddrns = page.getData().stream().map(dto -> dto.dataSource().getOddrn()).toList();
                final List<DataSourceDto> extractedDtos = dtos.stream()
                    .filter(dto -> oddrns.contains(dto.dataSource().getOddrn()))
                    .toList();

                assertThat(page.getTotal()).isEqualTo(11);
                assertThat(page.isHasNext()).isFalse();
                assertThat(page.getData())
                    .hasSize(5)
                    .usingRecursiveComparison()
                    .ignoringFields("token.showToken")
                    .ignoringCollectionOrder()
                    .isEqualTo(extractedDtos);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Gets a paginated list of data source dto objects querying their names")
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    public void listDtoNameQueryTest() {
        final var namespace = namespaceRepository.createByName(UUID.randomUUID().toString())
            .blockOptional()
            .orElseThrow();
        final var token = tokenRepository.create(new TokenPojo().setValue(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();
        final DataSourcePojo pojo1 = createDataSourcePojo(namespace.getId(), token.tokenPojo().getId(),
            "first");
        final DataSourcePojo pojo2 = createDataSourcePojo(namespace.getId(), token.tokenPojo().getId(),
            "first2");
        final DataSourcePojo pojo3 = createDataSourcePojo(namespace.getId(), token.tokenPojo().getId(),
            "first3");
        final DataSourcePojo pojo4 = createDataSourcePojo(namespace.getId(), token.tokenPojo().getId(),
            "second");
        final Map<String, DataSourceDto> pojos = dataSourceRepository.bulkCreate(List.of(pojo1, pojo2, pojo3, pojo4))
            .collectMap(DataSourcePojo::getOddrn, pojo -> new DataSourceDto(pojo, namespace, token))
            .blockOptional()
            .orElseThrow();
        final Long secondId = pojos.get(pojo2.getOddrn()).dataSource().getId();
        dataSourceRepository.delete(secondId).blockOptional().orElseThrow();
        dataSourceRepository.listDto(1, 5, "first")
            .as(StepVerifier::create)
            .assertNext(page -> {
                assertThat(page.getTotal()).isEqualTo(2);
                assertThat(page.isHasNext()).isFalse();
                assertThat(page.getData())
                    .hasSize(2)
                    .extracting(dto -> dto.dataSource().getName())
                    .containsExactlyInAnyOrder(pojo1.getName(), pojo3.getName());
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Gets a data source dto by it's oddrn")
    public void getDtoByOddrnTest() {
        final var namespace = namespaceRepository.createByName(UUID.randomUUID().toString())
            .blockOptional()
            .orElseThrow();
        final var token = tokenRepository.create(new TokenPojo().setValue(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();
        final DataSourceDto createdDatasource = dataSourceRepository
            .create(createDataSourcePojo(namespace.getId(), token.tokenPojo().getId()))
            .map(ds -> new DataSourceDto(ds, namespace, token))
            .blockOptional()
            .orElseThrow();
        dataSourceRepository.getDtoByOddrn(createdDatasource.dataSource().getOddrn())
            .as(StepVerifier::create)
            .assertNext(dto -> {
                assertThat(dto).usingRecursiveComparison().ignoringFields("token.showToken")
                    .isEqualTo(createdDatasource);
                assertThat(dto.token().showToken()).isFalse();
            })
            .verifyComplete();
        dataSourceRepository.delete(createdDatasource.dataSource().getId()).blockOptional().orElseThrow();
        dataSourceRepository.getDtoByOddrn(createdDatasource.dataSource().getOddrn())
            .as(StepVerifier::create)
            .verifyComplete();
    }

    @Test
    @DisplayName("Gets list of data source dtos by their oddrns")
    public void getDtoByOddrnsTest() {
        final var namespace = namespaceRepository.createByName(UUID.randomUUID().toString())
            .blockOptional()
            .orElseThrow();
        final var token = tokenRepository.create(new TokenPojo().setValue(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();
        final DataSourcePojo pojo1 = createDataSourcePojo(namespace.getId(), token.tokenPojo().getId());
        final DataSourcePojo pojo2 = createDataSourcePojo(namespace.getId(), token.tokenPojo().getId());
        final DataSourcePojo pojo3 = createDataSourcePojo(namespace.getId(), token.tokenPojo().getId());
        final Map<String, DataSourceDto> dtos = dataSourceRepository.bulkCreate(List.of(pojo1, pojo2, pojo3))
            .collectMap(DataSourcePojo::getOddrn, pojo -> new DataSourceDto(pojo, namespace, token))
            .blockOptional()
            .orElseThrow();

        dataSourceRepository.getDtosByOddrns(List.of(pojo1.getOddrn(), pojo2.getOddrn()))
            .as(StepVerifier::create)
            .assertNext(dto -> {
                assertThat(dto).usingRecursiveComparison().ignoringFields("token.showToken")
                    .isEqualTo(dtos.get(dto.dataSource().getOddrn()));
                assertThat(dto.token().showToken()).isFalse();
            })
            .assertNext(dto -> {
                assertThat(dto).usingRecursiveComparison().ignoringFields("token.showToken")
                    .isEqualTo(dtos.get(dto.dataSource().getOddrn()));
                assertThat(dto.token().showToken()).isFalse();
            })
            .verifyComplete();

        final Long firstId = dtos.get(pojo1.getOddrn()).dataSource().getId();
        dataSourceRepository.delete(firstId).blockOptional().orElseThrow();

        dataSourceRepository.getDtosByOddrns(List.of(pojo1.getOddrn()))
            .as(StepVerifier::create)
            .verifyComplete();
    }

    @Test
    @DisplayName("Get only active datasources")
    public void listActiveTest() {
        final var token = tokenRepository.create(new TokenPojo().setValue(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();
        final DataSourcePojo pojo1 = new DataSourcePojo()
            .setName(UUID.randomUUID().toString())
            .setOddrn(UUID.randomUUID().toString())
            .setActive(false)
            .setTokenId(token.tokenPojo().getId());
        final DataSourcePojo pojo2 = new DataSourcePojo()
            .setName(UUID.randomUUID().toString())
            .setOddrn(UUID.randomUUID().toString())
            .setActive(true)
            .setTokenId(token.tokenPojo().getId());
        final DataSourcePojo pojo3 = new DataSourcePojo()
            .setName(UUID.randomUUID().toString())
            .setOddrn(UUID.randomUUID().toString())
            .setConnectionUrl(UUID.randomUUID().toString())
            .setActive(true)
            .setTokenId(token.tokenPojo().getId());
        final DataSourcePojo pojo4 = new DataSourcePojo()
            .setName(UUID.randomUUID().toString())
            .setOddrn(UUID.randomUUID().toString())
            .setConnectionUrl(UUID.randomUUID().toString())
            .setActive(true)
            .setTokenId(token.tokenPojo().getId());
        final Map<String, DataSourceDto> dtos = dataSourceRepository.bulkCreate(List.of(pojo1, pojo2, pojo3, pojo4))
            .collectMap(DataSourcePojo::getOddrn, pojo -> new DataSourceDto(pojo, token))
            .blockOptional()
            .orElseThrow();
        dataSourceRepository.delete(dtos.get(pojo3.getOddrn()).dataSource().getId()).blockOptional().orElseThrow();
        dataSourceRepository.listActive()
            .as(StepVerifier::create)
            .assertNext(dto -> {
                assertThat(dto).usingRecursiveComparison().ignoringFields("token.showToken")
                    .isEqualTo(dtos.get(dto.dataSource().getOddrn()));
                assertThat(dto.token().showToken()).isFalse();
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("Check if namespace has datasources")
    public void existsByNamespaceTest() {
        final var namespace1 = namespaceRepository.createByName(UUID.randomUUID().toString())
            .blockOptional()
            .orElseThrow();
        final var namespace2 = namespaceRepository.createByName(UUID.randomUUID().toString())
            .blockOptional()
            .orElseThrow();
        final var token = tokenRepository.create(new TokenPojo().setValue(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();
        final DataSourcePojo pojo1 = createDataSourcePojo(namespace1.getId(), token.tokenPojo().getId());
        final DataSourcePojo pojo2 = createDataSourcePojo(namespace2.getId(), token.tokenPojo().getId());
        final Map<String, DataSourceDto> dtos = dataSourceRepository.bulkCreate(List.of(pojo1, pojo2))
            .collectMap(DataSourcePojo::getOddrn, pojo -> new DataSourceDto(pojo, token))
            .blockOptional()
            .orElseThrow();
        dataSourceRepository.delete(dtos.get(pojo2.getOddrn()).dataSource().getId()).blockOptional().orElseThrow();
        dataSourceRepository.existsByNamespace(namespace1.getId())
            .as(StepVerifier::create)
            .assertNext(b -> assertThat(b).isTrue())
            .verifyComplete();
        dataSourceRepository.existsByNamespace(namespace2.getId())
            .as(StepVerifier::create)
            .assertNext(b -> assertThat(b).isFalse())
            .verifyComplete();
    }

    @Test
    @DisplayName("Updates oddrn for datasource")
    public void testInjectOddrn() {
        final var token = tokenRepository.create(new TokenPojo().setValue(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();
        final DataSourcePojo createdDatasource = dataSourceRepository
            .create(createDataSourcePojo(null, token.tokenPojo().getId()))
            .blockOptional()
            .orElseThrow();

        final String newOddrn = UUID.randomUUID().toString();
        dataSourceRepository.injectOddrn(createdDatasource.getId(), newOddrn)
            .as(StepVerifier::create)
            .assertNext(pojo -> {
                assertThat(pojo)
                    .usingRecursiveComparison()
                    .ignoringFields("oddrn", "updatedAt")
                    .isEqualTo(createdDatasource);
                assertThat(pojo.getOddrn()).isEqualTo(newOddrn);
                assertThat(pojo.getUpdatedAt()).isNotEqualTo(createdDatasource.getUpdatedAt());
            })
            .verifyComplete();
    }

    private Map<String, DataSourceDto> generateDataSources(final NamespacePojo namespace1,
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
            .collect(Collectors.toMap(ds -> ds.dataSource().getOddrn(), identity()));
    }

    private DataSourcePojo createDataSourcePojo(final Long namespaceId, final Long tokenId) {
        return createDataSourcePojo(namespaceId, tokenId, UUID.randomUUID().toString());
    }

    private DataSourcePojo createDataSourcePojo(final Long namespaceId, final Long tokenId,
                                                final String name) {
        return new DataSourcePojo()
            .setName(name)
            .setDescription(UUID.randomUUID().toString())
            .setActive(true)
            .setOddrn(UUID.randomUUID().toString())
            .setNamespaceId(namespaceId)
            .setTokenId(tokenId);
    }
}
