package org.opendatadiscovery.oddplatform.auth;

import java.util.Set;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("auth.ldap")
@Data
public class ODDLDAPProperties {
    private String url;
    private String username;
    private String password;
    private String dnPattern;
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
}
