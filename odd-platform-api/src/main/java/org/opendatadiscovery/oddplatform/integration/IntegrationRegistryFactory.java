package org.opendatadiscovery.oddplatform.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.stream.Collectors;
import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;
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

        try (final var stream = Files.walk(classPathResource.getFile().toPath())) {
            integrationDtos = stream.filter(Files::isRegularFile)
                .map(path -> {
                    try {
                        // TODO: custom deserializer would look cleaner
                        //  https://www.baeldung.com/jackson-nested-values
                        final JsonNode jsonNode = YAML_OBJ_MAPPER.readTree(path.toFile());
                        return new IntegrationOverviewDto(new IntegrationDto(
                            jsonNode.get("id").asText(),
                            jsonNode.get("name").asText(),
                            jsonNode.get("synopsis").asText()),
                            jsonNode.get("description").asText());
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                })
                .toList();
        }

        return new ResourceFilesIntegrationRegistry(
            integrationDtos.stream().collect(Collectors.toMap(o -> o.integration().id(), identity())));
    }
}
