package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * ADR pins for the Activity stream — ADR-0021 (cursor pagination) and ADR-0022 (single enum
 * view-mode param).
 *
 * <p>ADR-0021: the activity feed pages by a {@code (lastEventId, lastEventDateTime)} cursor, NOT
 * offset/limit — so an append-heavy stream stays stable under concurrent writes. The controller +
 * service signatures carry the cursor params and no {@code page} offset (alerts + the data-entity
 * list keep offset/limit; the activity feed is the deliberate exception).
 *
 * <p>ADR-0022: {@code getActivity} dispatches a single {@code ActivityType} enum
 * ({@code ALL}/{@code MY_OBJECTS}/{@code DOWNSTREAM}/{@code UPSTREAM}); a null type ≡ ALL; there
 * are no separate per-mode endpoints. The service is one {@code switch (type)} with a
 * null→fetchAll guard.
 *
 * <p>Idiom: source scan of the real controller/service (sibling of {@link AdrContractScanTest}) —
 * deterministic, no Spring context; gradle runs tests with the module root as the working dir.
 *
 * @enforces ADR-0021
 * @enforces ADR-0022
 */
class AdrActivityContractScanTest {

    private static final Path CONTROLLER =
        Path.of("src/main/java/org/opendatadiscovery/oddplatform/controller/ActivityController.java");
    private static final Path SERVICE =
        Path.of("src/main/java/org/opendatadiscovery/oddplatform/service/activity/ActivityServiceImpl.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void activityFeedPagesByCursorNotOffset() throws IOException {
        final String controller = read(CONTROLLER);
        final String service = read(SERVICE);
        Assertions.assertThat(controller)
            .as("ADR-0021: ActivityController.getActivity must page by the (lastEventId, lastEventDateTime) "
                + "cursor. NOTE: the production param is spelled `lasEventId` (sic, an upstream typo).")
            .contains("lasEventId")
            .contains("lastEventDateTime");
        Assertions.assertThat(service)
            .as("ADR-0021: ActivityServiceImpl.getActivityList threads the (lastEventId, lastEventDateTime) "
                + "cursor through to the repository.")
            .contains("lastEventId")
            .contains("lastEventDateTime");
        // Scope the no-offset assertion to the FEED method itself: the actor-username enumeration endpoint
        // (getActivityUsers, added for the activity User-filter fix #1657) is an ordinary paginated LIST and
        // legitimately takes page+size — exactly like alerts and the data-entity list. ADR-0021's cursor rule
        // is about the activity feed stream, not every method on the controller.
        final int feedStart = controller.indexOf("getActivity(");
        final String getActivitySignature = controller.substring(feedStart, controller.indexOf(") {", feedStart));
        Assertions.assertThat(getActivitySignature)
            .as("ADR-0021: the activity FEED must NOT use offset pagination — getActivity has no `Integer page` "
                + "param (alerts/data-entity list keep page+size; the feed is the cursor exception). The "
                + "getActivityUsers enumeration endpoint is offset-paginated by design and is excluded here.")
            .doesNotContain("Integer page");
    }

    @Test
    void activityViewModeIsASingleEnumDispatch_nullMeansAll() throws IOException {
        final String service = read(SERVICE);
        Assertions.assertThat(service)
            .as("ADR-0022: getActivityList dispatches the single ActivityType enum via one switch covering "
                + "all four arms.")
            .contains("switch (type)")
            .contains("case MY_OBJECTS")
            .contains("case DOWNSTREAM")
            .contains("case UPSTREAM")
            .contains("case ALL");
        Assertions.assertThat(service)
            .as("ADR-0022: a null view-mode type is treated as ALL (the null-guard fetches all activities).")
            .contains("type == null");
    }

    @Test
    void activityControllerExposesOneEnumParam_noPerModeEndpoints() throws IOException {
        final String controller = read(CONTROLLER);
        Assertions.assertThat(controller)
            .as("ADR-0022: the controller takes a single `ActivityType type` param — view modes are one "
                + "parameterised endpoint, not separate per-mode routes.")
            .contains("ActivityType type");
        Assertions.assertThat(controller)
            .as("ADR-0022: there are no separate per-mode endpoints (no getMyObjects/getDownstream/getUpstream "
                + "activity methods on the controller).")
            .doesNotContain("getMyObjectsActivity")
            .doesNotContain("getDownstreamActivity")
            .doesNotContain("getUpstreamActivity");
    }
}
