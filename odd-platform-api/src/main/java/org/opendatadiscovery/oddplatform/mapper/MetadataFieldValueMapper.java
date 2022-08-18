package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataDto;

public interface MetadataFieldValueMapper {
    MetadataFieldValue mapDto(final MetadataDto dto);

    List<MetadataFieldValue> mapDtos(final Collection<MetadataDto> dto);
}
