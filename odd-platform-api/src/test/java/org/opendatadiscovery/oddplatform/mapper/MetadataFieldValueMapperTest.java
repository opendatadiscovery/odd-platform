package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataField;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.dto.MetadataDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class MetadataFieldValueMapperTest {

    private MetadataFieldValueMapper mapper;

    @Mock
    private MetadataFieldMapper fieldMapper;

    @BeforeEach
    public void before() {
        mapper = new MetadataFieldValueMapperImpl(fieldMapper);
    }

    @Test
    public void testMapDto() {
        final MetadataFieldPojo fieldPojo = new MetadataFieldPojo();
        when(fieldMapper.mapPojo(fieldPojo)).thenReturn(new MetadataField());
        final MetadataFieldValuePojo valuePojo = new MetadataFieldValuePojo()
            .setDataEntityId(1L)
            .setValue(UUID.randomUUID().toString())
            .setMetadataFieldId(1L)
            .setActive(true);
        final MetadataDto metadataDto = new MetadataDto(fieldPojo, valuePojo);
        final MetadataFieldValue metadataFieldValue = mapper.mapDto(metadataDto);
        verify(fieldMapper, times(1)).mapPojo(fieldPojo);
        assertThat(valuePojo.getValue()).isEqualTo(metadataFieldValue.getValue());
    }

    @Test
    public void testMapDtos() {
        final MetadataFieldPojo fieldPojo = new MetadataFieldPojo();
        when(fieldMapper.mapPojo(fieldPojo)).thenReturn(new MetadataField());
        final MetadataFieldValuePojo firstPojo = new MetadataFieldValuePojo()
            .setDataEntityId(1L)
            .setValue(UUID.randomUUID().toString())
            .setMetadataFieldId(1L)
            .setActive(true);
        final MetadataFieldValuePojo secondPojo = new MetadataFieldValuePojo()
            .setDataEntityId(1L)
            .setValue(UUID.randomUUID().toString())
            .setMetadataFieldId(1L)
            .setActive(true);
        final MetadataDto metadataDto = new MetadataDto(fieldPojo, firstPojo);
        final MetadataDto secondDto = new MetadataDto(fieldPojo, secondPojo);
        final List<MetadataFieldValue> fieldValues = mapper.mapDtos(List.of(metadataDto, secondDto));
        verify(fieldMapper, times(2)).mapPojo(fieldPojo);
        assertThat(fieldValues).hasSize(2)
            .extracting(MetadataFieldValue::getValue)
            .containsExactlyInAnyOrder(firstPojo.getValue(), secondPojo.getValue());
    }
}
