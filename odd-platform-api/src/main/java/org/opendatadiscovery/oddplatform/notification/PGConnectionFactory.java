package org.opendatadiscovery.oddplatform.notification;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import lombok.RequiredArgsConstructor;
import org.postgresql.PGProperty;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.jdbc.CannotGetJdbcConnectionException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PGConnectionFactory {
    private final DataSourceProperties dataSourceProperties;

    public Connection getConnection() {
        return getConnection(false);
    }

    public Connection getConnection(final boolean replicationMode) {
        final String url = dataSourceProperties.getUrl();

        final Properties props = new Properties();

        PGProperty.USER.set(props, dataSourceProperties.getUsername());
        PGProperty.PASSWORD.set(props, dataSourceProperties.getPassword());
        if (replicationMode) {
            PGProperty.ASSUME_MIN_SERVER_VERSION.set(props, "13.2");
            PGProperty.REPLICATION.set(props, "database");
            PGProperty.PREFER_QUERY_MODE.set(props, "simple");
        }

        try {
            return DriverManager.getConnection(url, props);
        } catch (final SQLException ex) {
            throw new CannotGetJdbcConnectionException("Failed to obtain JDBC Connection", ex);
        } catch (final IllegalStateException ex) {
            throw new CannotGetJdbcConnectionException("Failed to obtain JDBC Connection: " + ex.getMessage());
        }
    }
}
