package org.opendatadiscovery.oddplatform.utils;

import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@Builder
public class Page<T> {
    private final List<T> data;
    private final long total;
    private final boolean hasNext;
}
