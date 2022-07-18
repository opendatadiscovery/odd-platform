package org.opendatadiscovery.oddplatform.utils;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public final class Pair<L, R> {
    private final L left;
    private final R right;

    @JsonCreator
    public Pair(@JsonProperty("left") L left, @JsonProperty("right") R right) {
        this.left = left;
        this.right = right;
    }

    public static <L, R> Pair<L, R> of(final L left, final R right) {
        return new Pair<>(left, right);
    }
}
