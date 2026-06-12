package org.opendatadiscovery.oddplatform.auth;

import jakarta.annotation.PostConstruct;
import java.util.Set;
import lombok.Data;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("auth.ldap")
@Data
public class ODDLDAPProperties {
    private String url;
    private String username;
    private String password;
    private String dnPattern;
    private String base;
    private UserFilter userFilter;
    private Group groups;
    private ActiveDirectory activeDirectory;

    @Data
    public static class UserFilter {
        private String searchBase;
        private String filter;
    }

    @Data
    public static class Group {
        private String searchBase;
        private String filter;
        private Set<String> adminGroups;
    }

    @Data
    public static class ActiveDirectory {
        private boolean enabled;
        private String domain;
    }

    @PostConstruct
    public void validate() {
        if (StringUtils.isEmpty(url)) {
            throw new IllegalStateException("LDAP server url is not defined");
        }
        if (StringUtils.isEmpty(dnPattern)
            && (userFilter == null || StringUtils.isEmpty(userFilter.getFilter()))) {
            throw new IllegalStateException("Both DN pattern and user filter are not defined");
        }
    }
}
