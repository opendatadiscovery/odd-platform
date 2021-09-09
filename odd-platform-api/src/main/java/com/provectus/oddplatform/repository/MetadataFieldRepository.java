package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.MetadataFieldKey;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldPojo;
import java.util.Collection;
import java.util.List;

public interface MetadataFieldRepository extends CRUDRepository<MetadataFieldPojo> {
    List<MetadataFieldPojo> listByKey(final Collection<MetadataFieldKey> keys);

    List<MetadataFieldPojo> createIfNotExist(final Collection<MetadataFieldPojo> entities);
}
