package org.opendatadiscovery.oddplatform.auth.util;

import lombok.experimental.UtilityClass;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher;

@UtilityClass
public final class SecurityConstants {

    public static final String[] WHITELIST_PATHS = {
        "/actuator/**", "/favicon.ico", "/ingestion/**", "/img/**"
    };

    public static final ServerWebExchangeMatcher NAMESPACE_CREATE =
        new PathPatternParserServerWebExchangeMatcher("/api/namespaces/**", HttpMethod.POST);
    public static final ServerWebExchangeMatcher NAMESPACE_UPDATE =
        new PathPatternParserServerWebExchangeMatcher("/api/namespaces/**", HttpMethod.PUT);
    public static final ServerWebExchangeMatcher NAMESPACE_DELETE =
        new PathPatternParserServerWebExchangeMatcher("/api/namespaces/**", HttpMethod.DELETE);
    public static final ServerWebExchangeMatcher DATA_ENTITY_GROUP_CREATE =
        new PathPatternParserServerWebExchangeMatcher("/api/namespaces/**", HttpMethod.DELETE);
    public static final ServerWebExchangeMatcher TERM_CREATE =
        new PathPatternParserServerWebExchangeMatcher("/api/namespaces/**", HttpMethod.DELETE);
    public static final ServerWebExchangeMatcher DATA_SOURCE_CREATE =
        new PathPatternParserServerWebExchangeMatcher("/api/namespaces/**", HttpMethod.DELETE);
}
