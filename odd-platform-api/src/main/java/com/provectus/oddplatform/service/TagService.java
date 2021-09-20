package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.Tag;
import com.provectus.oddplatform.api.contract.model.TagFormData;
import com.provectus.oddplatform.api.contract.model.TagsResponse;
import reactor.core.publisher.Mono;

public interface TagService extends CRUDService<Tag, TagsResponse, TagFormData, TagFormData> {

    Mono<TagsResponse> listMostPopular(final String query, final int page, final int size);

}
