package org.opendatadiscovery.oddplatform.repository.reactive;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * KNOWN-BUG PIN — LSN-020 (F-021 H-001): the activity actor-filter binds to the wrong column.
 *
 * <p>{@code ReactiveActivityRepositoryImpl.getCommonConditions} filters the {@code userIds} param —
 * meant to select activity by its ACTOR — with {@code USER_OWNER_MAPPING.OWNER_ID.in(userIds)}. But the
 * actor lives in {@code ACTIVITY.CREATED_BY} (the join is {@code OIDC_USERNAME = ACTIVITY.CREATED_BY});
 * binding the filter to {@code OWNER_ID} means "filter by user X" matches the wrong rows — the actor
 * filter is effectively unimplemented. Characterization pin: GREEN while bound to OWNER_ID, RED when the
 * filter is corrected to the actor identity.
 *
 * <p><b>Flip protocol</b> (on RED): confirm the userIds filter binds to the actor (not OWNER_ID), delete
 * this {@code @pins}, and close the finding. General rule: retrospectives/LSN-020, LSN-029.
 *
 * @pins LSN-020
 */
class ActivityActorFilterKnownBugTest {

    private static final Path REPO = Path.of(
        "src/main/java/org/opendatadiscovery/oddplatform/repository/reactive/ReactiveActivityRepositoryImpl.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void userIdActorFilterBindsToOwnerIdNotActor_knownBug_LSN020() throws IOException {
        Assertions.assertThat(read(REPO))
            .as("LSN-020 (F-021 H-001): the userIds actor-filter is applied as USER_OWNER_MAPPING.OWNER_ID.in("
                + "userIds) — but the actor is ACTIVITY.CREATED_BY, so the activity feed's 'by user' filter matches "
                + "the wrong rows. RED here = the filter was corrected to the actor identity; drop this @pins and "
                + "close the finding. See retrospectives/LSN-020, LSN-029.")
            .contains("USER_OWNER_MAPPING.OWNER_ID.in(userIds)");
    }
}
