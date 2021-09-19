package com.provectus.oddplatform.container;

import org.testcontainers.containers.PostgreSQLContainer;

public class ODDPlatformDatabaseContainer extends PostgreSQLContainer<ODDPlatformDatabaseContainer> {
    private static final String IMAGE_VERSION = "postgres:13.2-alpine";
    private static ODDPlatformDatabaseContainer container;

    private ODDPlatformDatabaseContainer() {
        super(IMAGE_VERSION);
    }

    public static ODDPlatformDatabaseContainer getInstance() {
        if (null == container) {
            container = new ODDPlatformDatabaseContainer();
        }
        return container;
    }
}
