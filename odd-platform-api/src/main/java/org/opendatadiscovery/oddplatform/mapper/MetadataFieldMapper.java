package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataField;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldList;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataObject;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;

public interface MetadataFieldMapper {
    MetadataField mapPojo(final MetadataFieldPojo pojo);

    MetadataFieldList mapPojos(final List<MetadataFieldPojo> pojos);

    MetadataFieldPojo mapObject(final MetadataObject object);
}
