package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataKey;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMetadataFieldRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.CollectionUtils;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

public class ReactiveMetadataFieldRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveMetadataFieldRepository metadataFieldRepository;

    @BeforeEach
    public void before() {
        final List<MetadataFieldPojo> list = metadataFieldRepository.list().collectList().block();
        if (!CollectionUtils.isEmpty(list)) {
            metadataFieldRepository.delete(list.stream().map(MetadataFieldPojo::getId).toList()).blockLast();
        }
    }

    @Test
    void testListInternalMetadata() {
        final var first = createMetadataField(MetadataTypeEnum.STRING, MetadataOrigin.INTERNAL);
        final var second = createMetadataField(MetadataTypeEnum.FLOAT, MetadataOrigin.INTERNAL);
        final var third = createMetadataField(MetadataTypeEnum.INTEGER, MetadataOrigin.INTERNAL);
        final var fourth = createMetadataField(MetadataTypeEnum.DATETIME, MetadataOrigin.EXTERNAL);
        final var fifth = createMetadataField(MetadataTypeEnum.JSON, MetadataOrigin.EXTERNAL);
        metadataFieldRepository.bulkCreate(List.of(first, second, third, fourth, fifth)).blockLast();
        final Mono<List<MetadataFieldPojo>> listMono = metadataFieldRepository.listInternalMetadata(null);
        StepVerifier.create(listMono)
            .assertNext(list -> assertThat(list)
                .hasSize(3)
                .usingRecursiveFieldByFieldElementComparatorIgnoringFields("id", "isDeleted")
                .hasSameElementsAs(List.of(first, second, third)))
            .verifyComplete();

        listMono.map(list -> list.stream()
                .filter(pojo -> pojo.getName().equals(third.getName()))
                .findFirst()
                .orElseThrow())
            .flatMap(pojo -> metadataFieldRepository.delete(pojo.getId()))
            .block();

        final Mono<List<MetadataFieldPojo>> secondListMono = metadataFieldRepository.listInternalMetadata(null);
        StepVerifier.create(secondListMono)
            .assertNext(list -> assertThat(list).hasSize(2))
            .verifyComplete();

        final Mono<List<MetadataFieldPojo>> filtered = metadataFieldRepository.listInternalMetadata(first.getName());
        StepVerifier.create(filtered)
            .assertNext(list -> assertThat(list)
                .hasSize(1)
                .usingRecursiveFieldByFieldElementComparatorIgnoringFields("id", "isDeleted")
                .hasSameElementsAs(List.of(first)))
            .verifyComplete();
    }

    @Test
    void testListByKey() {
        final var first = createMetadataField(MetadataTypeEnum.STRING, MetadataOrigin.INTERNAL);
        final var second = createMetadataField(MetadataTypeEnum.FLOAT, MetadataOrigin.INTERNAL);
        final var third = createMetadataField(MetadataTypeEnum.DATETIME, MetadataOrigin.EXTERNAL);
        metadataFieldRepository.bulkCreate(List.of(first, second, third)).blockLast();
        final Mono<List<MetadataFieldPojo>> emptyPojos = metadataFieldRepository.listByKey(List.of());
        StepVerifier.create(emptyPojos)
            .assertNext(list -> assertThat(list.isEmpty()).isTrue())
            .verifyComplete();

        final Mono<List<MetadataFieldPojo>> wrongTypePojo =
            metadataFieldRepository.listByKey(List.of(new MetadataKey(first.getName(), MetadataTypeEnum.INTEGER)));
        StepVerifier.create(wrongTypePojo)
            .assertNext(list -> assertThat(list.isEmpty()).isTrue())
            .verifyComplete();

        final Mono<List<MetadataFieldPojo>> metadataFieldPojos = metadataFieldRepository.listByKey(List.of(
            new MetadataKey(first.getName(), first.getType()),
            new MetadataKey(second.getName(), second.getType())
        ));
        StepVerifier.create(metadataFieldPojos)
            .assertNext(list -> assertThat(list)
                .hasSize(2)
                .extracting(MetadataFieldPojo::getName)
                .containsExactlyInAnyOrder(first.getName(), second.getName()))
            .verifyComplete();

        metadataFieldPojos.map(list -> list.stream()
                .filter(pojo -> pojo.getName().equals(first.getName()))
                .findFirst()
                .orElseThrow())
            .flatMap(pojo -> metadataFieldRepository.delete(pojo.getId()))
            .block();

        final Mono<List<MetadataFieldPojo>> excludingDeletedMetadata = metadataFieldRepository.listByKey(List.of(
            new MetadataKey(first.getName(), first.getType()),
            new MetadataKey(second.getName(), second.getType()),
            new MetadataKey(third.getName(), third.getType())
        ));
        StepVerifier.create(excludingDeletedMetadata)
            .assertNext(list -> assertThat(list)
                .hasSize(2)
                .usingRecursiveFieldByFieldElementComparatorIgnoringFields("id", "isDeleted")
                .hasSameElementsAs(List.of(second, third)))
            .verifyComplete();
    }

    private MetadataFieldPojo createMetadataField(final MetadataTypeEnum type,
                                                  final MetadataOrigin origin) {
        return createMetadataField(type, UUID.randomUUID().toString(), origin);
    }

    private MetadataFieldPojo createMetadataField(final MetadataTypeEnum type,
                                                  final String name,
                                                  final MetadataOrigin origin) {
        return new MetadataFieldPojo()
            .setType(type.name())
            .setName(name)
            .setOrigin(origin.name());
    }
}
