package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.Value;

@Value
@RequiredArgsConstructor
@Setter
public class TagDto {
    TagPojo tagPojo;
    Long usedCount;

    @SuppressWarnings("unused") // used by jooq
    public TagDto(
        final Long id,
        final String name,
        final Boolean important,
        final Boolean isDeleted,
        final LocalDateTime createdAt,
        final LocalDateTime updatedAt,
        final Long usedCount
    ) {
        this.tagPojo = new TagPojo(id, name, important, isDeleted, createdAt, updatedAt);
        this.usedCount = usedCount;
    }
}
