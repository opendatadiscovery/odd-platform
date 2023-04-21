package org.opendatadiscovery.oddplatform.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationOverviewDto;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

import static java.util.function.Function.identity;

@UtilityClass
@Slf4j
public class IntegrationRegistryFactory {
    private static final ResourcePatternResolver RESOURCE_PATTERN_RESOLVER = new PathMatchingResourcePatternResolver();
    private static final String CLASSPATH_RESOURCE_LOCATION = "classpath*:META-INF/wizard/*.yaml";
    private static final ObjectMapper YAML_OBJ_MAPPER = new ObjectMapper(new YAMLFactory());

    public static IntegrationRegistry createResourceFilesIntegrationRegistry() {
        final Map<String, IntegrationOverviewDto> registry = readManifests()
            .stream()
            .collect(Collectors.toMap(o -> o.integration().id(), identity()));

        return new ResourceFilesIntegrationRegistry(registry);
    }

    private static List<IntegrationOverviewDto> readManifests() {
        try {
            return Arrays.stream(RESOURCE_PATTERN_RESOLVER.getResources(CLASSPATH_RESOURCE_LOCATION))
                .filter(Resource::isReadable)
                .map(IntegrationRegistryFactory::readManifest)
                .toList();
        } catch (final IOException e) {
            throw new IllegalStateException("Couldn't read wizard manifests", e);
        }
    }

    private static IntegrationOverviewDto readManifest(final Resource resource) {
        log.debug("Reading wizard manifest file: {}", resource.getFilename());

        try (final InputStream is = resource.getInputStream()) {
            return YAML_OBJ_MAPPER.readValue(is, IntegrationOverviewDto.class);
        } catch (final IOException e) {
            throw new IllegalStateException("Couldn't read wizard manifest: %s".formatted(resource.getFilename()), e);
        }
    }
}