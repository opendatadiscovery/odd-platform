package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Notification fan-out resilience — ADR-0042 (fail-soft per-sender) enforcement PLUS a
 * characterization pin of the documented gap that breaks it (PLT-016 / F-009 H-002).
 *
 * <p>ADR-0042 invariant ({@code enforcesFailSoftPerSenderLoop}): {@code AlertNotificationMessageProcessor.process}
 * iterates the senders and catches each one's {@code NotificationSenderException}, logs the
 * {@code receiverId()}, and continues — no rethrow, so one failing channel never aborts the WAL
 * message or the sibling senders.
 *
 * <p>The gap ({@code emailSenderEscapesFailSoft_knownBug_PLT016}): the contract holds ONLY if every
 * sender reports failure as a {@code NotificationSenderException}. {@code EmailNotificationSender.send}
 * instead wraps its checked failures in a RAW {@code RuntimeException}, which is NOT caught by the
 * processor's {@code NotificationSenderException}-only catch — so an email failure ESCAPES fail-soft,
 * aborting the WAL message and the remaining senders. This is a characterization pin: it asserts the
 * bug is STILL present (GREEN while broken), and goes RED when the sender is fixed.
 *
 * <p><b>Flip protocol</b> (when {@code emailSenderEscapesFailSoft_knownBug_PLT016} goes RED):
 * confirm {@code EmailNotificationSender} now throws {@code NotificationSenderException} (the PLT-016
 * fix). Then delete the {@code @pins} pin — fail-soft is now fully enforced by ADR-0042 — and close
 * PLT-016. If RED for any other reason, investigate before it ships. General rule: retrospectives/LSN-029.
 *
 * <p>Idiom: source scan of the real processor + sender (sibling of {@link AdrContractScanTest}) —
 * deterministic, no Spring context.
 *
 * @enforces ADR-0042
 * @pins PLT-016
 */
class NotificationFailSoftContractTest {

    private static final String BASE = "src/main/java/org/opendatadiscovery/oddplatform/notification/";
    private static final Path PROCESSOR = Path.of(BASE + "processor/AlertNotificationMessageProcessor.java");
    private static final Path EMAIL_SENDER = Path.of(BASE + "sender/EmailNotificationSender.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void enforcesFailSoftPerSenderLoop() throws IOException {
        Assertions.assertThat(read(PROCESSOR))
            .as("ADR-0042: the processor fans out over the senders and catches each NotificationSenderException, "
                + "logging the receiver and continuing — no rethrow, so one channel's failure does not abort the "
                + "WAL message or the sibling senders.")
            .contains("for (final NotificationSender")
            .contains("catch (final NotificationSenderException e)")
            .contains("log.error");
    }

    @Test
    void emailSenderEscapesFailSoft_knownBug_PLT016() throws IOException {
        // KNOWN-BUG PIN (PLT-016 / F-009 H-002): the email sender wraps failures in a RAW
        // RuntimeException, not a NotificationSenderException — so the processor's narrow catch
        // cannot stop it and the failure escapes fail-soft. GREEN = bug present; RED = sender fixed.
        Assertions.assertThat(read(EMAIL_SENDER))
            .as("PLT-016: EmailNotificationSender.send STILL wraps its checked failures in a raw "
                + "RuntimeException (not a NotificationSenderException) — so an email failure escapes the "
                + "processor's fail-soft catch. When this is RED, the sender was fixed: delete this @pins pin "
                + "(ADR-0042 now fully enforced) and close PLT-016. See retrospectives/LSN-029.")
            .contains("throw new RuntimeException(");
        Assertions.assertThat(read(PROCESSOR))
            .as("PLT-016: the fail-soft loop catches ONLY NotificationSenderException — a narrow catch — so the "
                + "email sender's raw RuntimeException is NOT caught and aborts the WAL message + remaining senders.")
            .contains("catch (final NotificationSenderException e)")
            .doesNotContain("catch (final Exception")
            .doesNotContain("catch (final RuntimeException");
    }
}
