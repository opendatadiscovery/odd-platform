package org.opendatadiscovery.oddplatform.service.attachment;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * KNOWN-BUG PIN — PLT-086 (F-027 H-006): data-entity Link URLs are stored with NO scheme allowlist.
 *
 * <p>{@code LinkServiceImpl.save}/{@code update} map the form straight to a {@code LinkPojo} via the
 * MapStruct {@code LinkMapper} ({@code mapToPojo}/{@code applyToPojo}), which does no validation — so a
 * {@code javascript:} or {@code data:} URL is persisted raw and later rendered as a clickable link
 * (stored-XSS). This is a characterization pin of the MISSING validation: it asserts that neither the
 * service nor the mapper contains any URL-scheme guard today; GREEN while absent, RED when a guard is
 * added.
 *
 * <p><b>Flip protocol</b> (on RED): a scheme allowlist / validator was added (the discriminating
 * tokens below appear) — confirm the fix, delete this {@code @pins}, close PLT-086. General rule:
 * retrospectives/LSN-029.
 *
 * @pins PLT-086
 */
class AttachmentLinkSchemeKnownBugTest {

    private static final String BASE = "src/main/java/org/opendatadiscovery/oddplatform/";
    private static final Path LINK_SVC = Path.of(BASE + "service/attachment/LinkServiceImpl.java");
    private static final Path LINK_MAPPER = Path.of(BASE + "mapper/LinkMapper.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void linkUrlHasNoSchemeAllowlist_knownBug_PLT086() throws IOException {
        final String combined = read(LINK_SVC) + "\n" + read(LINK_MAPPER);
        // Absence pin: the save/update path applies no scheme validation, so javascript:/data: is stored raw.
        // The listed tokens are the discriminating markers a scheme-allowlist fix would introduce.
        Assertions.assertThat(combined)
            .as("PLT-086: the link save/update path applies NO URL scheme allowlist — a javascript:/data: URL is "
                + "stored raw (stored-XSS). RED here = a scheme guard was added; drop this @pins and close PLT-086. "
                + "See retrospectives/LSN-029.")
            .doesNotContain("getScheme")
            .doesNotContain("javascript")
            .doesNotContain("allowlist")
            .doesNotContain("allowList")
            .doesNotContain("allowedSchemes");
    }
}
