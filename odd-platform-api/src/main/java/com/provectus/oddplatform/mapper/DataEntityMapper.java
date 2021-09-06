package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.DataEntity;
import com.provectus.oddplatform.api.contract.model.DataEntityDetails;
import com.provectus.oddplatform.api.contract.model.DataEntityLineage;
import com.provectus.oddplatform.api.contract.model.DataEntityList;
import com.provectus.oddplatform.api.contract.model.DataEntityRef;
import com.provectus.oddplatform.api.contract.model.DataEntitySubType;
import com.provectus.oddplatform.api.contract.model.DataEntityType;
import com.provectus.oddplatform.api.contract.model.DataEntityTypeDictionary;
import com.provectus.oddplatform.dto.DataEntityDetailsDto;
import com.provectus.oddplatform.dto.DataEntityDimensionsDto;
import com.provectus.oddplatform.dto.DataEntityDto;
import com.provectus.oddplatform.dto.DataEntityLineageDto;
import com.provectus.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTypePojo;
import java.util.List;
import java.util.Map;

public interface DataEntityMapper
        extends ReadOnlyCRUDMapperWithList<DataEntity, DataEntityList, DataEntityDimensionsDto> {
    DataEntityDetails mapDtoDetails(final DataEntityDetailsDto dataEntityDetailsDto);

    DataEntityType mapType(final DataEntityTypePojo type);

    DataEntitySubType mapSubType(final DataEntitySubtypePojo subtype);

    DataEntityTypeDictionary mapTypeDict(final Map<DataEntityTypePojo, List<DataEntitySubtypePojo>> typeDict);

    DataEntityLineage mapLineageDto(final DataEntityLineageDto dataEntityLineageDto);

    DataEntityRef mapRef(final DataEntityDto dto);
}
