package org.opendatadiscovery.oddplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.ldap.LdapAutoConfiguration;

@SpringBootApplication(exclude = LdapAutoConfiguration.class)
public class ODDPlatformApplication {
    public static void main(final String[] args) {
        SpringApplication.run(ODDPlatformApplication.class, args);
    }
}
