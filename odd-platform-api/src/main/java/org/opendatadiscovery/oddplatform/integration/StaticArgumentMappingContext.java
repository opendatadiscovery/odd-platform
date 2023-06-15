package org.opendatadiscovery.oddplatform.integration;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class StaticArgumentMappingContext {
    private static final String PLATFORM_URL_PARAM_NAME = "platform_url";

    private final Map<String, String> parameterToValue;

    public StaticArgumentMappingContext(
        @Value("${odd.platform-base-url:http://your.odd.platform}")
        final String platformUrl
    ) {
        this.parameterToValue = Map.of(PLATFORM_URL_PARAM_NAME, platformUrl);
    }

    public String get(final String parameter) {
        return parameterToValue.get(parameter);
    }
}
