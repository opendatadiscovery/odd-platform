package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataField;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldList;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldOrigin;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataObject;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;

import static org.assertj.core.api.Assertions.assertThat;

public class MetadataFieldMapperTest {

    private final MetadataFieldMapper mapper = new MetadataFieldMapperImpl();

    @Test
    public void testMapPojo() {
        final MetadataFieldPojo pojo = new MetadataFieldPojo()
            .setId(1L)
            .setName(UUID.randomUUID().toString())
            .setIsDeleted(false)
            .setOrigin(MetadataOrigin.INTERNAL.name())
            .setType(MetadataTypeEnum.JSON.name());
        final MetadataField metadataField = mapper.mapPojo(pojo);
        assertThat(pojo.getId()).isEqualTo(metadataField.getId());
        assertThat(pojo.getName()).isEqualTo(metadataField.getName());
        assertThat(MetadataFieldOrigin.fromValue(pojo.getOrigin())).isEqualTo(metadataField.getOrigin());
        assertThat(MetadataFieldType.fromValue(pojo.getType())).isEqualTo(metadataField.getType());
    }

    @Test
    public void mapPojosTest() {
        final MetadataFieldPojo firstPojo = new MetadataFieldPojo()
            .setId(1L)
            .setName(UUID.randomUUID().toString())
            .setIsDeleted(false)
            .setOrigin(MetadataOrigin.INTERNAL.name())
            .setType(MetadataTypeEnum.JSON.name());
        final MetadataFieldPojo secondPojo = new MetadataFieldPojo()
            .setId(2L)
            .setName(UUID.randomUUID().toString())
            .setIsDeleted(false)
            .setOrigin(MetadataOrigin.INTERNAL.name())
            .setType(MetadataTypeEnum.DATETIME.name());
        final MetadataFieldList metadataFieldList = mapper.mapPojos(List.of(firstPojo, secondPojo));
        assertThat(metadataFieldList.getPageInfo().getTotal()).isEqualTo(2);
        assertThat(metadataFieldList.getPageInfo().getHasNext()).isFalse();
        assertThat(metadataFieldList.getItems()).hasSize(2);
        final MetadataField firstField = metadataFieldList.getItems().stream()
            .filter(i -> i.getName().equals(firstPojo.getName()))
            .findFirst()
            .orElseThrow();
        assertThat(firstPojo.getId()).isEqualTo(firstField.getId());
        assertThat(firstPojo.getName()).isEqualTo(firstField.getName());
        assertThat(MetadataFieldOrigin.fromValue(firstPojo.getOrigin())).isEqualTo(firstField.getOrigin());
        assertThat(MetadataFieldType.fromValue(firstPojo.getType())).isEqualTo(firstField.getType());
        final MetadataField secondField = metadataFieldList.getItems().stream()
            .filter(i -> i.getName().equals(secondPojo.getName()))
            .findFirst()
            .orElseThrow();
        assertThat(secondPojo.getId()).isEqualTo(secondField.getId());
        assertThat(secondPojo.getName()).isEqualTo(secondField.getName());
        assertThat(MetadataFieldOrigin.fromValue(secondPojo.getOrigin())).isEqualTo(secondField.getOrigin());
        assertThat(MetadataFieldType.fromValue(secondPojo.getType())).isEqualTo(secondField.getType());
    }

    @Test
    public void mapObjectTest() {
        final MetadataObject object = new MetadataObject()
            .name(UUID.randomUUID().toString())
            .origin(MetadataFieldOrigin.INTERNAL)
            .type(MetadataFieldType.STRING)
            .value(UUID.randomUUID().toString());
        final MetadataFieldPojo pojo = mapper.mapObject(object);
        assertThat(object.getName()).isEqualTo(pojo.getName());
        assertThat(object.getType().getValue()).isEqualTo(pojo.getType());
        assertThat(object.getOrigin().getValue()).isEqualTo(pojo.getOrigin());
    }
}
