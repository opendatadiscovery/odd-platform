package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.Tag;
import com.provectus.oddplatform.api.contract.model.TagFormData;
import com.provectus.oddplatform.api.contract.model.TagsResponse;

public interface TagService extends CRUDService<Tag, TagsResponse, TagFormData, TagFormData> {
}
