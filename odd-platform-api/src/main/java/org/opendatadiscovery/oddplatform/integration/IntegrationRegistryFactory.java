package org.opendatadiscovery.oddplatform.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationOverviewDto;
import org.springframework.core.io.ClassPathResource;

import static java.util.function.Function.identity;

@UtilityClass
public class IntegrationRegistryFactory {
    private static final String CLASSPATH_RESOURCE_LOCATION = "wizard";
    private static final ObjectMapper YAML_OBJ_MAPPER = new ObjectMapper(new YAMLFactory());

    @SneakyThrows
    public static IntegrationRegistry createResourceFilesIntegrationRegistry() {
        final ClassPathResource classPathResource = new ClassPathResource(CLASSPATH_RESOURCE_LOCATION);

        final List<IntegrationOverviewDto> integrationDtos;

        try (final Stream<Path> stream = Files.walk(classPathResource.getFile().toPath())) {
            integrationDtos = stream.filter(Files::isRegularFile)
                .map(path -> {
                    try {
                        return YAML_OBJ_MAPPER.readValue(path.toFile(), IntegrationOverviewDto.class);
                    } catch (final IOException e) {
                        throw new RuntimeException(e);
                    }
                })
                .toList();
        }

        return new ResourceFilesIntegrationRegistry(
            integrationDtos.stream().collect(Collectors.toMap(o -> o.integration().id(), identity())));
    }
}
