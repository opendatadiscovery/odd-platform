package org.opendatadiscovery.oddplatform.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.SLA;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

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
            final byte[] bytes;
            try {
                bytes = resolveSLAImage(sla);
            } catch (final IOException e) {
                throw new IllegalStateException("Couldn't read a file of SLA %s".formatted(sla));
            }

            result.put(sla, new ByteArrayResource(bytes));
        }

        return result;
    }

    private static byte[] resolveSLAImage(final SLA sla) throws IOException {
        final ClassPathResource resource = switch (sla) {
            case RED -> new ClassPathResource("sla/sla_red.png");
            case YELLOW -> new ClassPathResource("sla/sla_yellow.png");
            case GREEN -> new ClassPathResource("sla/sla_green.png");
        };

        try (final InputStream stream = resource.getInputStream()) {
            return stream.readAllBytes();
        }
    }
}
