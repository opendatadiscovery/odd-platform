package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldList;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldTermsDto;

public interface DatasetFieldListMapper {
    DatasetFieldList mapPojos(List<DatasetFieldTermsDto> item);
}
