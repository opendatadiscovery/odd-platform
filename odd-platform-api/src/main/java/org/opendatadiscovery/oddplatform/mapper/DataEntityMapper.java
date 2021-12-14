package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupLineageList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineage;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntitySubType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityTypeDictionary;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityGroupLineageDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityLineageDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTypePojo;

public interface DataEntityMapper
    extends ReadOnlyCRUDMapperWithList<DataEntity, DataEntityList, DataEntityDimensionsDto> {
    DataEntityDetails mapDtoDetails(final DataEntityDetailsDto dataEntityDetailsDto);

    DataEntity mapDataQualityTest(final DataEntityDetailsDto dto);

    DataEntityList mapDataQualityTests(final Collection<DataEntityDetailsDto> dtos);

    DataEntityType mapType(final DataEntityTypePojo type);

    DataEntitySubType mapSubType(final DataEntitySubtypePojo subtype);

    DataEntityTypeDictionary mapTypeDict(final Map<DataEntityTypePojo, List<DataEntitySubtypePojo>> typeDict);

    DataEntityLineage mapLineageDto(final DataEntityLineageDto dataEntityLineageDto);

    DataEntityGroupLineageList mapGroupLineageDto(final DataEntityGroupLineageDto dataEntityGroupLineageDto);

    DataEntityRef mapRef(final DataEntityDto dto);
}
