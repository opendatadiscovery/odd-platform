package org.opendatadiscovery.oddplatform.auth.util;

import java.net.URI;
import lombok.experimental.UtilityClass;
import org.springframework.security.web.util.UrlUtils;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

@UtilityClass
public final class UriUtils {
    public static URI getBaseUri(final URI requestUri) {
        final var fullUrl = UrlUtils.buildFullRequestUrl(requestUri.getScheme(),
            requestUri.getHost(), requestUri.getPort(),
            requestUri.getPath(), requestUri.getQuery());

        final UriComponents baseUrl = UriComponentsBuilder
            .fromHttpUrl(fullUrl)
            .replacePath("/")
            .replaceQuery(null)
            .fragment(null)
            .build();
        return baseUrl.toUri();
    }
}
