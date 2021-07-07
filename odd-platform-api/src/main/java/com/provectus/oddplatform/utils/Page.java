package com.provectus.oddplatform.utils;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Data
@RequiredArgsConstructor
@Builder
public class Page<T> {
    private final List<T> data;
    private final long total;
    private final boolean hasNext;
}
