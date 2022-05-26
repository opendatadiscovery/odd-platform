package org.opendatadiscovery.oddplatform.dto.lineage;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class LineageDepth {
    private final int depth;
    private final boolean empty;

    public static LineageDepth of(final int depth) {
        return new LineageDepth(depth, false);
    }

    public static LineageDepth empty() {
        return new LineageDepth(-1, true);
    }
}
