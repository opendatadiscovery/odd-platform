package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTypePojo;

public interface DataEntityTypeRepository {
    Map<DataEntityTypePojo, List<DataEntitySubtypePojo>> getTypes();

    DataEntityTypePojo findTypeByName(final String name);

    DataEntitySubtypePojo findSubtypeByName(final String name);
}
