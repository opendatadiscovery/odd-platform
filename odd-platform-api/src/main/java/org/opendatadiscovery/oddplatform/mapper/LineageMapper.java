package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupLineageList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineage;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityGroupLineageDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityLineageDto;

public interface LineageMapper {
    DataEntityLineage mapLineageDto(final DataEntityLineageDto dataEntityLineageDto);

    DataEntityGroupLineageList mapGroupLineageDto(final DataEntityGroupLineageDto dataEntityGroupLineageDto);
}
