package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCollectorRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.annotation.DirtiesContext;
import reactor.test.StepVerifier;

import static java.util.function.Function.identity;
import static org.assertj.core.api.Assertions.assertThat;

public class CollectorRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveCollectorRepository collectorRepository;

    @Autowired
    private ReactiveNamespaceRepository namespaceRepository;

    @Autowired
    private ReactiveTokenRepository tokenRepository;

    @Test
    public void getDtoTest() {
        final NamespacePojo namespace = namespaceRepository.createByName(UUID.randomUUID().toString())
            .blockOptional()
            .orElseThrow();
        final CollectorDto newDto = createDto(namespace);
        final CollectorDto createdCollector = collectorRepository
            .create(newDto.collectorPojo())
            .map(c -> new CollectorDto(c, namespace, newDto.tokenDto()))
            .blockOptional()
            .orElseThrow();

        collectorRepository.getDto(createdCollector.collectorPojo().getId())
            .as(StepVerifier::create)
            .assertNext(dto -> {
                assertThat(dto).usingRecursiveComparison().ignoringFields("tokenDto.showToken")
                    .isEqualTo(createdCollector);
                assertThat(dto.tokenDto().showToken()).isFalse();
            })
            .verifyComplete();
    }

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    public void listDtoWithoutName() {
        final var namespace1 = namespaceRepository.createByName(UUID.randomUUID().toString())
            .blockOptional()
            .orElseThrow();
        final var namespace2 = namespaceRepository.createByName(UUID.randomUUID().toString())
            .blockOptional()
            .orElseThrow();

        final Map<String, CollectorDto> collectorDtoMap = generateCollectors(namespace1, namespace2);
        final List<CollectorDto> dtos = collectorRepository.bulkCreate(
                collectorDtoMap.values().stream().map(CollectorDto::collectorPojo).toList()
            )
            .map(pojo -> {
                final CollectorDto collectorDto = collectorDtoMap.get(pojo.getName());
                return new CollectorDto(pojo, collectorDto.namespace(), collectorDto.tokenDto());
            })
            .collectList()
            .blockOptional()
            .orElseThrow();

        collectorRepository.listDto(1, 6, null)
            .as(StepVerifier::create)
            .assertNext(page -> {
                final List<String> names = page.getData().stream().map(dto -> dto.collectorPojo().getName()).toList();
                final List<CollectorDto> extractedDtos = dtos.stream()
                    .filter(dto -> names.contains(dto.collectorPojo().getName()))
                    .toList();

                assertThat(page.getTotal()).isEqualTo(11);
                assertThat(page.isHasNext()).isTrue();
                assertThat(page.getData())
                    .hasSize(6)
                    .usingRecursiveComparison()
                    .ignoringFields("tokenDto.showToken")
                    .ignoringCollectionOrder()
                    .isEqualTo(extractedDtos);
            })
            .verifyComplete();

        collectorRepository.listDto(2, 6, null)
            .as(StepVerifier::create)
            .assertNext(page -> {
                final List<String> names = page.getData().stream().map(dto -> dto.collectorPojo().getName()).toList();
                final List<CollectorDto> extractedDtos = dtos.stream()
                    .filter(dto -> names.contains(dto.collectorPojo().getName()))
                    .toList();

                assertThat(page.getTotal()).isEqualTo(11);
                assertThat(page.isHasNext()).isFalse();
                assertThat(page.getData())
                    .hasSize(5)
                    .usingRecursiveComparison()
                    .ignoringFields("tokenDto.showToken")
                    .ignoringCollectionOrder()
                    .isEqualTo(extractedDtos);
            })
            .verifyComplete();
    }

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    public void listDtoNameQueryTest() {
        final var namespace = namespaceRepository.createByName(UUID.randomUUID().toString())
            .blockOptional()
            .orElseThrow();
        final CollectorDto dto1 = createDto(namespace, "first");
        final CollectorDto dto2 = createDto(namespace, "first2");
        final CollectorDto dto3 = createDto(namespace, "first3");
        final CollectorDto dto4 = createDto(namespace, "second");
        final List<CollectorDto> dtos = List.of(dto1, dto2, dto3, dto4);
        final Map<String, CollectorDto> createdDtoMap = collectorRepository.bulkCreate(
                List.of(dto1.collectorPojo(), dto2.collectorPojo(), dto3.collectorPojo(), dto4.collectorPojo())
            )
            .collectMap(CollectorPojo::getName, pojo -> {
                final TokenDto tokenDto = dtos.stream().filter(d -> d.collectorPojo().getName().equals(pojo.getName()))
                    .findFirst()
                    .map(CollectorDto::tokenDto)
                    .orElseThrow();
                return new CollectorDto(pojo, namespace, tokenDto);
            })
            .blockOptional()
            .orElseThrow();
        final Long secondId = createdDtoMap.get(dto2.collectorPojo().getName()).collectorPojo().getId();
        collectorRepository.delete(secondId).blockOptional().orElseThrow();
        collectorRepository.listDto(1, 5, "first")
            .as(StepVerifier::create)
            .assertNext(page -> {
                assertThat(page.getTotal()).isEqualTo(2);
                assertThat(page.isHasNext()).isFalse();
                assertThat(page.getData())
                    .hasSize(2)
                    .extracting(dto -> dto.collectorPojo().getName())
                    .containsExactlyInAnyOrder(dto1.collectorPojo().getName(), dto3.collectorPojo().getName());
            })
            .verifyComplete();
    }

    @Test
    public void getByTokenTest() {
        final CollectorDto dto1 = createDto(null);
        final CollectorDto dto2 = createDto(null);
        final Map<String, CollectorPojo> pojos = collectorRepository.bulkCreate(
                List.of(dto1.collectorPojo(), dto2.collectorPojo())
            )
            .collectMap(CollectorPojo::getName, identity())
            .blockOptional()
            .orElseThrow();
        collectorRepository.getByToken(dto1.tokenDto().tokenPojo().getValue())
            .as(StepVerifier::create)
            .assertNext(pojo -> assertThat(pojo).isEqualTo(pojos.get(dto1.collectorPojo().getName())))
            .verifyComplete();
    }

    @Test
    public void existsByNamespaceTest() {
        final var namespace1 = namespaceRepository.createByName(UUID.randomUUID().toString())
            .blockOptional()
            .orElseThrow();
        final var namespace2 = namespaceRepository.createByName(UUID.randomUUID().toString())
            .blockOptional()
            .orElseThrow();
        final CollectorDto dto1 = createDto(namespace1);
        final CollectorDto dto2 = createDto(namespace2);
        final List<CollectorDto> dtos = List.of(dto1, dto2);
        final Map<String, CollectorDto> createdDtoMap = collectorRepository.bulkCreate(
                List.of(dto1.collectorPojo(), dto2.collectorPojo())
            )
            .collectMap(CollectorPojo::getName, pojo -> {
                final TokenDto tokenDto = dtos.stream().filter(d -> d.collectorPojo().getName().equals(pojo.getName()))
                    .findFirst()
                    .map(CollectorDto::tokenDto)
                    .orElseThrow();
                return new CollectorDto(pojo, null, tokenDto);
            })
            .blockOptional()
            .orElseThrow();
        final Long secondId = createdDtoMap.get(dto2.collectorPojo().getName()).collectorPojo().getId();
        collectorRepository.delete(secondId).blockOptional().orElseThrow();
        collectorRepository.existsByNamespace(namespace1.getId())
            .as(StepVerifier::create)
            .assertNext(b -> assertThat(b).isTrue())
            .verifyComplete();
        collectorRepository.existsByNamespace(namespace2.getId())
            .as(StepVerifier::create)
            .assertNext(b -> assertThat(b).isFalse())
            .verifyComplete();
    }

    private Map<String, CollectorDto> generateCollectors(final NamespacePojo namespace1,
                                                         final NamespacePojo namespace2) {
        final Stream<CollectorDto> namespace1Collectors = Stream
            .generate(() -> namespace1)
            .map(this::createDto)
            .limit(5);

        final Stream<CollectorDto> namespace2Collectors = Stream
            .generate(() -> namespace2)
            .map(this::createDto)
            .limit(2);

        final Stream<CollectorDto> noNamespaceCollectors = Stream
            .generate(() -> createDto(null))
            .limit(4);

        return Stream.of(namespace1Collectors, namespace2Collectors, noNamespaceCollectors)
            .flatMap(identity())
            .collect(Collectors.toMap(c -> c.collectorPojo().getName(), identity()));
    }

    private CollectorDto createDto(final NamespacePojo namespace) {
        return createDto(namespace, UUID.randomUUID().toString());
    }

    private CollectorDto createDto(final NamespacePojo namespace, final String name) {
        final TokenDto token = tokenRepository.create(new TokenPojo().setValue(UUID.randomUUID().toString()))
            .blockOptional()
            .orElseThrow();
        final CollectorPojo collectorPojo = new CollectorPojo()
            .setName(name)
            .setDescription(UUID.randomUUID().toString())
            .setNamespaceId(namespace != null ? namespace.getId() : null)
            .setTokenId(token.tokenPojo().getId());
        return new CollectorDto(collectorPojo, namespace, token);
    }
}
