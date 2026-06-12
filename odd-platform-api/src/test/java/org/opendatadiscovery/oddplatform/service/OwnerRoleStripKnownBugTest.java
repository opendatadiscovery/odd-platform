package org.opendatadiscovery.oddplatform.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * KNOWN-BUG PIN — PLT-066 (F-019 H-003 / F-011 H-004): PUT /api/owners with {@code roles} omitted
 * silently strips ALL role bindings.
 *
 * <p>{@code OwnerServiceImpl.getRoleIdsList} collapses a null/empty {@code roles} field to
 * {@code List.of()} — there is no distinction between "don't touch roles" (PATCH intent) and "set
 * roles to empty" (PUT). {@code update()} then calls {@code deleteOwnerRelationsExcept(id, newRoles)}
 * with that (possibly empty) set, so an omitted {@code roles} hard-deletes every binding with no
 * confirm. This is a characterization pin of the PUT-vs-PATCH null≡empty bug: GREEN while it strips,
 * RED when omitted≠strip is honored.
 *
 * <p><b>Flip protocol</b> (on RED): confirm a null/omitted {@code roles} no longer strips bindings,
 * delete this {@code @pins}, close PLT-066. General rule: retrospectives/LSN-029.
 *
 * @pins PLT-066
 */
class OwnerRoleStripKnownBugTest {

    private static final Path OWNER_SVC =
        Path.of("src/main/java/org/opendatadiscovery/oddplatform/service/OwnerServiceImpl.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void putWithoutRolesStripsAllBindings_knownBug_PLT066() throws IOException {
        final String src = read(OWNER_SVC);
        Assertions.assertThat(src)
            .as("PLT-066: getRoleIdsList collapses a null/omitted roles field to an empty list — no PUT-vs-PATCH "
                + "distinction between 'leave roles' and 'clear roles'.")
            .contains("if (CollectionUtils.isEmpty(formData.getRoles()))")
            .contains("return List.of();");
        Assertions.assertThat(src)
            .as("PLT-066: update() then deletes every binding except that (possibly empty) set, so an omitted roles "
                + "field strips all bindings. RED here = omitted≠strip is now honored; drop this @pins and close "
                + "PLT-066. See retrospectives/LSN-029.")
            .contains("deleteOwnerRelationsExcept(owner.getId(), newRoles)");
    }
}
