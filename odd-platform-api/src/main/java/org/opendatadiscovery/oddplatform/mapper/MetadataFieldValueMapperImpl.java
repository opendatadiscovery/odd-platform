package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataField;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.dto.metadata.DatasetFieldMetadataDto;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataDto;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MetadataFieldValueMapperImpl implements MetadataFieldValueMapper {
    private final MetadataFieldMapper mapper;

    @Override
    public MetadataFieldValue mapDto(final MetadataDto dto) {
        return new MetadataFieldValue()
            .field(mapper.mapPojo(dto.metadataField()))
            .value(dto.metadataFieldValue().getValue());
    }

    @Override
    public MetadataFieldValue mapHighlightedDto(final MetadataDto dto,
                                                final String highlightedName,
                                                final String highlightedValue) {
        final MetadataField metadataField = mapper.mapPojo(dto.metadataField());
        metadataField.setName(highlightedName);
        return new MetadataFieldValue()
            .field(metadataField)
            .value(highlightedValue);
    }

    @Override
    public List<MetadataFieldValue> mapDtos(final Collection<MetadataDto> dto) {
        if (CollectionUtils.isEmpty(dto)) {
            return List.of();
        }
        return dto.stream().map(this::mapDto).collect(Collectors.toList());
    }

    @Override
    public List<MetadataFieldValue> mapDatasetFieldDtos(final Collection<DatasetFieldMetadataDto> dto) {
        if (CollectionUtils.isEmpty(dto)) {
            return List.of();
        }
        return dto.stream().map(this::mapDatasetFieldMetadataDto).collect(Collectors.toList());
    }

    private MetadataFieldValue mapDatasetFieldMetadataDto(final DatasetFieldMetadataDto dto) {
        return new MetadataFieldValue()
            .field(mapper.mapPojo(dto.metadataField()))
            .value(dto.value().getValue());
    }
}
