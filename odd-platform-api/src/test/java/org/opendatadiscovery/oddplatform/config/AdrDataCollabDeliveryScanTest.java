package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * ADR-0020 pin (structural) — decoupled outbound Slack delivery.
 *
 * <p>{@code DataCollaborationController} persists the message and returns 202 Accepted — there is NO
 * inline Slack call on the request thread. The {@code DataCollaborationMessageSenderJob} drains
 * asynchronously behind a BLOCKING leader-election advisory lock (single sender across replicas).
 * Coupling the Slack call into the request, or draining without the lock, would break the
 * decoupling + single-sender guarantees.
 *
 * <p>This is the unit/source-scan half of ADR-0020; the Postgres advisory-lock + drain-loop behaviour is
 * the integration complement. Idiom: source scan (sibling of {@link AdrContractScanTest}).
 *
 * @enforces ADR-0020
 */
class AdrDataCollabDeliveryScanTest {

    private static final String BASE = "src/main/java/org/opendatadiscovery/oddplatform/datacollaboration/";
    private static final Path CONTROLLER = Path.of(BASE + "controller/DataCollaborationController.java");
    private static final Path SENDER_JOB = Path.of(BASE + "job/DataCollaborationMessageSenderJob.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void postMessageReturns202Accepted_noInlineSlackCall() throws IOException {
        Assertions.assertThat(read(CONTROLLER))
            .as("ADR-0020: posting a collaboration message persists and returns 202 Accepted — the outbound Slack "
                + "call is decoupled from the request thread.")
            .contains("ResponseEntity.status(HttpStatus.ACCEPTED)");
    }

    @Test
    void senderJobDrainsBehindBlockingLeaderElectionLock() throws IOException {
        Assertions.assertThat(read(SENDER_JOB))
            .as("ADR-0020: the sender job drains asynchronously behind a BLOCKING leader-election advisory lock "
                + "(acquire(..., true)) — exactly one sender across replicas.")
            .contains("leaderElectionManager.acquire(dataCollaborationProperties"
                + ".getSenderMessageAdvisoryLockId(), true)");
    }
}
