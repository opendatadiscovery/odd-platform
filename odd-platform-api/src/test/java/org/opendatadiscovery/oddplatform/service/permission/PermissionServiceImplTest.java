package org.opendatadiscovery.oddplatform.service.permission;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.PermissionResourceType;

import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

/**
 * Unit test for the permission read surface's missing-extractor contract (#1762).
 *
 * <p>A missing extractor bean for a valid resource type is a SERVER wiring gap (a {@code PolicyTypeDto}
 * shipped without its extractor), not bad client input — so it stays a 5xx (the global handler's
 * catch-all logs it and returns 500), never a 400. This pins the exception CLASS:
 * {@link IllegalStateException} ("the server is in an illegal state"), not {@code IllegalArgumentException}.
 * The HTTP status is unchanged; the type makes the server-invariant intent explicit and keeps the case
 * out of any future blanket {@code IllegalArgumentException -> 400} mapping.
 *
 * <p>RED on the pre-fix code: {@code getExtractor} threw {@code IllegalArgumentException}, so this
 * assertion fails.
 */
class PermissionServiceImplTest {

    // No extractor beans wired -> getExtractor's orElseThrow fires for any valid resource type.
    private final PermissionService service = new PermissionServiceImpl(List.of(), List.of());

    @Test
    void missingExtractorIsAServerStateError() {
        // MANAGEMENT is a no-context type (PolicyTypeDto.MANAGEMENT(false)); with no NoContextPermissionExtractor
        // wired, getExtractor falls through to orElseThrow.
        assertThatExceptionOfType(IllegalStateException.class)
            .as("a missing extractor bean is a server wiring gap (5xx), thrown as IllegalStateException not "
                + "IllegalArgumentException, so it is never blanket-mapped to a client 400")
            .isThrownBy(() -> service.getNonContextualPermissionsForCurrentUser(PermissionResourceType.MANAGEMENT))
            .withMessageContaining("No extractor for resource type");
    }
}
