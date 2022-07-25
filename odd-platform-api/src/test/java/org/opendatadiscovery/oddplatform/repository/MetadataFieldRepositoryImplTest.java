package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
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
