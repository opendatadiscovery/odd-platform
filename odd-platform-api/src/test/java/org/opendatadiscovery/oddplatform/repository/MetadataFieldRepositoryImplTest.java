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
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

public class MetadataFieldRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private MetadataFieldRepository metadataFieldRepository;

    @BeforeEach
    public void before() {
        final List<MetadataFieldPojo> list = metadataFieldRepository.list();
        metadataFieldRepository.delete(list.stream().map(MetadataFieldPojo::getId).toList());
    }

    @Test
    public void listTest() {
        final var first = createMetadataField(MetadataTypeEnum.STRING, MetadataOrigin.INTERNAL);
        final var second = createMetadataField(MetadataTypeEnum.FLOAT, MetadataOrigin.INTERNAL);
        final var third = createMetadataField(MetadataTypeEnum.INTEGER, MetadataOrigin.INTERNAL);
        final var fourth = createMetadataField(MetadataTypeEnum.DATETIME, MetadataOrigin.EXTERNAL);
        final var fifth = createMetadataField(MetadataTypeEnum.JSON, MetadataOrigin.EXTERNAL);
        metadataFieldRepository.bulkCreate(List.of(first, second, third, fourth, fifth));
        final List<MetadataFieldPojo> list = metadataFieldRepository.list(null);
        assertThat(list)
            .hasSize(3)
            .usingElementComparatorIgnoringFields("id", "isDeleted")
            .hasSameElementsAs(List.of(first, second, third));
        final MetadataFieldPojo thirdPojo = list.stream()
            .filter(pojo -> pojo.getName().equals(third.getName()))
            .findFirst()
            .orElseThrow();
        metadataFieldRepository.delete(thirdPojo.getId());
        final List<MetadataFieldPojo> secondList = metadataFieldRepository.list(null);
        assertThat(secondList).hasSize(2);
        final List<MetadataFieldPojo> filteredList = metadataFieldRepository.list(first.getName());
        assertThat(filteredList)
            .hasSize(1)
            .usingElementComparatorIgnoringFields("id", "isDeleted")
            .hasSameElementsAs(List.of(first));
    }

    @Test
    public void listByKeyTest() {
        final var first = createMetadataField(MetadataTypeEnum.STRING, MetadataOrigin.INTERNAL);
        final var second = createMetadataField(MetadataTypeEnum.FLOAT, MetadataOrigin.INTERNAL);
        final var third = createMetadataField(MetadataTypeEnum.DATETIME, MetadataOrigin.EXTERNAL);
        metadataFieldRepository.bulkCreate(List.of(first, second, third));
        final List<MetadataFieldPojo> emptyPojos = metadataFieldRepository.listByKey(List.of());
        assertThat(emptyPojos).isEmpty();
        final List<MetadataFieldPojo> wrongTypePojo =
            metadataFieldRepository.listByKey(List.of(new MetadataKey(first.getName(), MetadataTypeEnum.INTEGER)));
        assertThat(wrongTypePojo).isEmpty();
        final List<MetadataFieldPojo> metadataFieldPojos = metadataFieldRepository.listByKey(List.of(
            new MetadataKey(first.getName(), first.getType()),
            new MetadataKey(second.getName(), second.getType())
        ));
        assertThat(metadataFieldPojos)
            .hasSize(2)
            .extracting(MetadataFieldPojo::getName)
            .containsExactlyInAnyOrder(first.getName(), second.getName());
        final MetadataFieldPojo firstPojo = metadataFieldPojos.stream()
            .filter(pojo -> pojo.getName().equals(first.getName()))
            .findFirst()
            .orElseThrow();
        metadataFieldRepository.delete(firstPojo.getId());
        final List<MetadataFieldPojo> excludingDeletedMetadata = metadataFieldRepository.listByKey(List.of(
            new MetadataKey(first.getName(), first.getType()),
            new MetadataKey(second.getName(), second.getType()),
            new MetadataKey(third.getName(), third.getType())
        ));
        assertThat(excludingDeletedMetadata)
            .hasSize(2)
            .usingElementComparatorIgnoringFields("id", "isDeleted")
            .hasSameElementsAs(List.of(second, third));
    }

    @Test
    public void testCreateIfNotExist() {
        final var first = createMetadataField(MetadataTypeEnum.STRING, MetadataOrigin.EXTERNAL);
        final MetadataFieldPojo firstPojo = metadataFieldRepository.create(first);
        assertThat(firstPojo.getName()).isEqualTo(first.getName());
        final var firstInternal = createMetadataField(MetadataTypeEnum.valueOf(first.getType()),
            first.getName(), MetadataOrigin.INTERNAL);
        final var second = createMetadataField(MetadataTypeEnum.DATETIME, MetadataOrigin.INTERNAL);
        final List<MetadataFieldPojo> allPojos =
            metadataFieldRepository.createIfNotExist(List.of(firstInternal, second));
        assertThat(allPojos).hasSize(2);
        final MetadataFieldPojo existingPojo = allPojos.stream()
            .filter(p -> p.getName().equals(first.getName()))
            .findFirst()
            .orElseThrow();
        assertThat(existingPojo.getId()).isEqualTo(firstPojo.getId());
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
