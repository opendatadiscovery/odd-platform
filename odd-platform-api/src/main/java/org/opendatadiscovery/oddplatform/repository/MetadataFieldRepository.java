package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;

public interface MetadataFieldRepository extends CRUDRepository<MetadataFieldPojo> {
    List<MetadataFieldPojo> createIfNotExist(final Collection<MetadataFieldPojo> entities);
}
