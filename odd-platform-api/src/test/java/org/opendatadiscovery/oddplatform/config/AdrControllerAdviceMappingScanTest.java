package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * ADR-0007 pin (depth) — the single ControllerAdvice maps the exception hierarchy to HTTP status.
 *
 * <p>Distinct from {@link AdrContractScanTest}'s "exactly one @RestControllerAdvice" count: this pins
 * the actual exception→status contract — {@code BadUserRequest}/{@code UniqueConstraint}/
 * {@code CascadeDelete}/{@code WebExchangeBind} → 400, {@code NotFound} → 404, {@code GenAI} → 500, and a
 * final {@code Exception} → 500 catch-all. Changing a mapping (or dropping the catch-all) silently
 * changes the API's error contract.
 *
 * <p>Idiom: source scan (sibling of {@link AdrContractScanTest}).
 *
 * @enforces ADR-0007
 */
class AdrControllerAdviceMappingScanTest {

    private static final Path ADVICE = Path.of(
        "src/main/java/org/opendatadiscovery/oddplatform/controller/exception/ControllerAdvice.java");
    private static final Pattern HANDLER = Pattern.compile("@ExceptionHandler\\(");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void exceptionHierarchyMapsToStatus() throws IOException {
        final String src = read(ADVICE);
        Assertions.assertThat(HANDLER.matcher(src).results().count())
            .as("ADR-0007: the ControllerAdvice maps the whole exception hierarchy (>=7 handlers incl. the catch-all).")
            .isGreaterThanOrEqualTo(7L);
        Assertions.assertThat(src)
            .as("ADR-0007: the specific exception→status mappings — BadUserRequest→400, NotFound→404, GenAI→500, "
                + "the framework ResponseStatusException pass-through (#1760/#1761), "
                + "and a final Exception→500 catch-all.")
            .contains("@ExceptionHandler(BadUserRequestException.class)")
            .contains("@ExceptionHandler(NotFoundException.class)")
            .contains("@ExceptionHandler(GenAIException.class)")
            .contains("@ExceptionHandler(ResponseStatusException.class)")
            .contains("@ExceptionHandler(Exception.class)")
            .contains("HttpStatus.BAD_REQUEST")
            .contains("HttpStatus.NOT_FOUND")
            .contains("HttpStatus.INTERNAL_SERVER_ERROR");
    }
}
