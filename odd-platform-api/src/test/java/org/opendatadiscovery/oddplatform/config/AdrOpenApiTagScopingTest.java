package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.yaml.snakeyaml.Yaml;

/**
 * ADR-0008 pin — OpenAPI tag-per-resource scoping.
 *
 * <p>Every operation in the platform spec carries EXACTLY one tag — the generator runs with
 * {@code useTags: true}, so one tag ⇒ one generated {@code *Api} interface ⇒ one controller (ADR-0001).
 * An untagged or multi-tagged operation would split or merge a resource's controller surface and break
 * the one-tag-one-Api mapping.
 *
 * <p>Idiom: parse the real spec ({@code ../odd-platform-specification/openapi.yaml} — the same source the
 * contract module generates from) with snakeyaml and walk paths → operations. Deterministic, no Spring
 * context; gradle runs tests with the module root as the working dir, so the sibling spec is one level up.
 *
 * @enforces ADR-0008
 */
class AdrOpenApiTagScopingTest {

    private static final Path SPEC = Path.of("../odd-platform-specification/openapi.yaml");
    private static final Set<String> OPERATION_VERBS =
        Set.of("get", "put", "post", "delete", "options", "head", "patch", "trace");

    @SuppressWarnings("unchecked")
    @Test
    void everyOperationCarriesExactlyOneTag() throws IOException {
        Assertions.assertThat(Files.exists(SPEC))
            .as("openapi.yaml must be readable at %s (the contract module's source spec, one level up "
                + "from the module root)", SPEC.toAbsolutePath())
            .isTrue();

        final Map<String, Object> spec;
        try (InputStream in = Files.newInputStream(SPEC)) {
            spec = new Yaml().load(in);
        }
        final Object pathsObj = spec.get("paths");
        Assertions.assertThat(pathsObj).as("the spec must declare a paths map").isInstanceOf(Map.class);
        final Map<String, Object> paths = (Map<String, Object>) pathsObj;
        Assertions.assertThat(paths).as("the spec must declare paths").isNotEmpty();

        final List<String> violations = new ArrayList<>();
        int operations = 0;
        for (final Map.Entry<String, Object> pathEntry : paths.entrySet()) {
            if (!(pathEntry.getValue() instanceof Map<?, ?> pathItem)) {
                continue;
            }
            for (final Map.Entry<?, ?> opEntry : pathItem.entrySet()) {
                if (!OPERATION_VERBS.contains(String.valueOf(opEntry.getKey()))) {
                    continue;
                }
                operations++;
                final Object tags = (opEntry.getValue() instanceof Map<?, ?> op) ? op.get("tags") : null;
                final int tagCount = (tags instanceof List<?> list) ? list.size() : 0;
                if (tagCount != 1) {
                    violations.add(pathEntry.getKey() + " " + opEntry.getKey() + " → " + tagCount + " tag(s)");
                }
            }
        }

        Assertions.assertThat(operations)
            .as("sanity: the path walk should find the platform's operations")
            .isGreaterThan(50);
        Assertions.assertThat(violations)
            .as("ADR-0008: every operation carries exactly one tag (useTags:true ⇒ one *Api per tag ⇒ one "
                + "controller). Untagged/multi-tagged operations break tag-per-resource scoping.")
            .isEmpty();
    }
}
