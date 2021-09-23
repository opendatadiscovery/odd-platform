package com.provectus.oddplatform.dto;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.Value;

@Value
@RequiredArgsConstructor
public class TagDto {
    Long id;
    String name;
    Boolean important;
    Boolean isDeleted;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    Long usedCount;
}
