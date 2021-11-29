package org.opendatadiscovery.oddplatform.utils;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public final class Pair<L, R> {
    private final L left;
    private final R right;

    public static <L, R> Pair<L, R> of(final L left, final R right) {
        return new Pair<>(left, right);
    }
}
