package org.opendatadiscovery.oddplatform.service;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.SLA;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.util.ResourceUtils;

@Component
public class CachingByteArraySLAResourceResolver implements SLAResourceResolver {
    private final Map<SLA, Resource> cache = initializeStorage();

    @Override
    public Resource resolve(final SLA sla) {
        final Resource resource = cache.get(sla);
        if (resource == null) {
            throw new IllegalArgumentException("Couldn't find a file for %s SLA in a cache".formatted(sla));
        }

        return resource;
    }

    private static Map<SLA, Resource> initializeStorage() {
        final Map<SLA, Resource> result = new HashMap<>();

        for (final SLA sla : SLA.values()) {
            final Path slaPath = resolveSLAImagePath(sla);

            final byte[] imageBytes;
            try {
                imageBytes = Files.readAllBytes(slaPath);
            } catch (final IOException e) {
                throw new IllegalStateException("Couldn't read a file for %s SLA in a classpath".formatted(sla), e);
            }

            result.put(sla, new ByteArrayResource(imageBytes));
        }

        return result;
    }

    private static Path resolveSLAImagePath(final SLA sla) {
        try {
            final File file = switch (sla) {
                case RED -> ResourceUtils.getFile("classpath:sla/sla_red.png");
                case YELLOW -> ResourceUtils.getFile("classpath:sla/sla_yellow.png");
                case GREEN -> ResourceUtils.getFile("classpath:sla/sla_green.png");
            };

            return file.toPath();
        } catch (final FileNotFoundException e) {
            throw new IllegalStateException("Couldn't resolve a file for %s SLA in a classpath".formatted(sla), e);
        }
    }
}
