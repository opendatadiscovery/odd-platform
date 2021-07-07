package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTypePojo;

import java.util.List;
import java.util.Map;

public interface DataEntityTypeRepository {
    Map<DataEntityTypePojo, List<DataEntitySubtypePojo>> getTypes();

    DataEntityTypePojo findTypeByName(final String name);

    DataEntitySubtypePojo findSubtypeByName(final String name);
}
