package org.opendatadiscovery.oddplatform.config;

import io.r2dbc.spi.ConnectionFactories;
import io.r2dbc.spi.ConnectionFactory;
import io.r2dbc.spi.ConnectionFactoryOptions;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.r2dbc.connection.R2dbcTransactionManager;
import org.springframework.transaction.ReactiveTransactionManager;

@Configuration
public class R2DBCConfiguration {
    @Bean
    public ConnectionFactory connectionFactory(final DataSourceProperties dataSourceProperties) {
        final String r2dbcUrl = dataSourceProperties.getUrl().replace("jdbc", "r2dbc");
        return ConnectionFactories.get(
            ConnectionFactoryOptions.parse(r2dbcUrl).mutate()
                .option(ConnectionFactoryOptions.DRIVER, "pool")
                .option(ConnectionFactoryOptions.PROTOCOL, "postgresql")
                .option(ConnectionFactoryOptions.USER, dataSourceProperties.getUsername())
                .option(ConnectionFactoryOptions.PASSWORD, dataSourceProperties.getPassword())
                .build()
        );
    }

    @Bean
    public ReactiveTransactionManager reactiveTransactionManager(final ConnectionFactory connectionFactory) {
        return new R2dbcTransactionManager(connectionFactory);
    }
}
