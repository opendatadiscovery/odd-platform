package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsResponse;
import reactor.core.publisher.Mono;

public interface TagService extends CRUDService<Tag, TagsResponse, TagFormData, TagFormData> {
    Mono<TagsResponse> listMostPopular(final String query, final int page, final int size);
}
