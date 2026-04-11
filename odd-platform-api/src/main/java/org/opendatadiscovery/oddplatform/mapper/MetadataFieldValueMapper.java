package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.dto.metadata.DatasetFieldMetadataDto;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataDto;

public interface MetadataFieldValueMapper {
    MetadataFieldValue mapDto(final MetadataDto dto);

    MetadataFieldValue mapHighlightedDto(final MetadataDto dto,
                                         final String highlightedName,
                                         final String highlightedValue);

    List<MetadataFieldValue> mapDtos(final Collection<MetadataDto> dto);

    List<MetadataFieldValue> mapDatasetFieldDtos(final Collection<DatasetFieldMetadataDto> dto);
}
