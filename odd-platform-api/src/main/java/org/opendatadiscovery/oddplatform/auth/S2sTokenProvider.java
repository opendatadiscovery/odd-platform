package org.opendatadiscovery.oddplatform.auth;

import jakarta.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class S2sTokenProvider {
    @Value("${auth.s2s.token:#{null}}")
    private String s2sToken;
    @Value("${auth.s2s.enabled:false}")
    private boolean s2sEnabled;

    public boolean isValidToken(final String token) {
        if (StringUtils.isBlank(token)) {
            return false;
        }

        return s2sToken.equals(token);
    }

    @PostConstruct
    public void validate() {
        if (s2sEnabled && StringUtils.isBlank(s2sToken)) {
            throw new IllegalStateException("Long Term Token is not defined");
        }
    }
}
