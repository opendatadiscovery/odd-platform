package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import lombok.RequiredArgsConstructor;
import lombok.Value;

@Value
@RequiredArgsConstructor
public class TagDto {
    TagPojo tagPojo;
    Long usedCount;
}
