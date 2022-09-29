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

    public static final ServerWebExchangeMatcher[] OWNER_ACCESS_PATHS = {
        new PathPatternParserServerWebExchangeMatcher("/api/dataentities/{data_entity_id}/**",
            HttpMethod.POST),
        new PathPatternParserServerWebExchangeMatcher("/api/dataentities/{data_entity_id}/**",
            HttpMethod.PUT),
        new PathPatternParserServerWebExchangeMatcher("/api/dataentities/{data_entity_id}/**",
            HttpMethod.DELETE),
        new PathPatternParserServerWebExchangeMatcher("/api/datasetfields/{dataset_field_id}/**",
            HttpMethod.POST),
        new PathPatternParserServerWebExchangeMatcher("/api/datasetfields/{dataset_field_id}/**",
            HttpMethod.PUT),
        new PathPatternParserServerWebExchangeMatcher("/api/alerts/{alert_id}/**",
            HttpMethod.PUT)
    };
}
