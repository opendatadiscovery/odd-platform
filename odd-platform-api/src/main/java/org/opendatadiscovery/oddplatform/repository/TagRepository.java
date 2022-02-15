package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

public interface TagRepository extends CRUDRepository<TagPojo> {
    List<TagPojo> listByNames(final Collection<String> names);

    List<TagPojo> listByDataEntityId(final long dataEntityId);

    Page<TagDto> listMostPopular(final String query, final int page, final int size);

    void deleteRelations(final long dataEntityId, final Collection<Long> tagIds);

    void createRelations(final long dataEntityId, final Collection<Long> tagIds);
}
