package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import java.util.Collection;
import java.util.List;

public interface TagRepository extends CRUDRepository<TagPojo> {
    List<TagPojo> listByNames(final Collection<String> names);

    List<TagPojo> listByDataEntityId(final long dataEntityId);

    List<TagPojo> listMostPopular(String query, final int page, final int size);

    void deleteRelations(final long dataEntityId, final Collection<Long> tags);

    void createRelations(final long dataEntityId, final Collection<Long> tags);
}
