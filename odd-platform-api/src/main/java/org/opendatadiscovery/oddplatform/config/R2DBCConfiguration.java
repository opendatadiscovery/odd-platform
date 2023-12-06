package org.opendatadiscovery.oddplatform.config;

import io.r2dbc.pool.ConnectionPool;
import io.r2dbc.pool.ConnectionPoolConfiguration;
import io.r2dbc.spi.ConnectionFactories;
import io.r2dbc.spi.ConnectionFactory;
import io.r2dbc.spi.ConnectionFactoryOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.autoconfigure.r2dbc.R2dbcProperties;
import org.springframework.boot.context.properties.PropertyMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.r2dbc.connection.R2dbcTransactionManager;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.transaction.ReactiveTransactionManager;

@Configuration
public class R2DBCConfiguration {

    @Bean(destroyMethod = "dispose")
    @Primary
    public ConnectionPool connectionFactory(final DataSourceProperties dataSourceProperties,
                                            final R2dbcProperties properties) {
        final String r2dbcUrl = dataSourceProperties.getUrl().replace("jdbc", "r2dbc");
        final ConnectionFactory factory = ConnectionFactories.get(ConnectionFactoryOptions.parse(r2dbcUrl).mutate()
            .option(ConnectionFactoryOptions.PROTOCOL, "postgresql")
            .option(ConnectionFactoryOptions.USER, dataSourceProperties.getUsername())
            .option(ConnectionFactoryOptions.PASSWORD, dataSourceProperties.getPassword())
            .build());

        final R2dbcProperties.Pool pool = properties.getPool();
        final PropertyMapper map = PropertyMapper.get().alwaysApplyingWhenNonNull();
        final ConnectionPoolConfiguration.Builder builder = ConnectionPoolConfiguration.builder(factory);
        map.from(pool.getMaxIdleTime()).to(builder::maxIdleTime);
        map.from(pool.getMaxLifeTime()).to(builder::maxLifeTime);
        map.from(pool.getMaxAcquireTime()).to(builder::maxAcquireTime);
        map.from(pool.getMaxCreateConnectionTime()).to(builder::maxCreateConnectionTime);
        map.from(pool.getInitialSize()).to(builder::initialSize);
        map.from(pool.getMaxSize()).to(builder::maxSize);
        map.from(pool.getValidationQuery()).whenHasText().to(builder::validationQuery);
        map.from(pool.getValidationDepth()).to(builder::validationDepth);
        map.from(pool.getMinIdle()).to(builder::minIdle);
        map.from(pool.getMaxValidationTime()).to(builder::maxValidationTime);
        return new ConnectionPool(builder.build());
    }

    @Bean(destroyMethod = "dispose")
    @Qualifier("customConnectionPool")
    public ConnectionPool databaseClientForCustomSchema(
        @Value("${spring.custom-datasource.url}") final String url,
        @Value("${spring.custom-datasource.username}") final String username,
        @Value("${spring.custom-datasource.password}") final String password,
        final R2dbcProperties properties) {
        final String r2dbcUrl = url.replace("jdbc", "r2dbc");
        final ConnectionFactory factory = ConnectionFactories.get(ConnectionFactoryOptions.parse(r2dbcUrl).mutate()
            .option(ConnectionFactoryOptions.PROTOCOL, "postgresql")
            .option(ConnectionFactoryOptions.USER, username)
            .option(ConnectionFactoryOptions.PASSWORD, password)
            .build());

        System.out.println("TUTA " + url);

        final R2dbcProperties.Pool pool = properties.getPool();
        final PropertyMapper map = PropertyMapper.get().alwaysApplyingWhenNonNull();
        final ConnectionPoolConfiguration.Builder builder = ConnectionPoolConfiguration.builder(factory);
        map.from(pool.getMaxIdleTime()).to(builder::maxIdleTime);
        map.from(pool.getMaxLifeTime()).to(builder::maxLifeTime);
        map.from(pool.getMaxAcquireTime()).to(builder::maxAcquireTime);
        map.from(pool.getMaxCreateConnectionTime()).to(builder::maxCreateConnectionTime);
        map.from(pool.getInitialSize()).to(builder::initialSize);
        map.from(pool.getMaxSize()).to(builder::maxSize);
        map.from(pool.getValidationQuery()).whenHasText().to(builder::validationQuery);
        map.from(pool.getValidationDepth()).to(builder::validationDepth);
        map.from(pool.getMinIdle()).to(builder::minIdle);
        map.from(pool.getMaxValidationTime()).to(builder::maxValidationTime);

        return new ConnectionPool(builder.build());
    }

    @Bean
    public DatabaseClient databaseClient(final ConnectionFactory schema1ConnectionFactory) {
        return DatabaseClient.create(schema1ConnectionFactory);
    }

    @Bean
    @Qualifier("customDataClient")
    public DatabaseClient databaseClientCustomTables(
        @Qualifier("customConnectionPool") final ConnectionFactory connectionFactory) {
        return DatabaseClient.create(connectionFactory);
    }

    @Bean
    @Primary
    public ReactiveTransactionManager reactiveTransactionManager(final ConnectionFactory connectionFactory) {
        return new R2dbcTransactionManager(connectionFactory);
    }

    @Bean
    @Qualifier("customTransactionManager")
    public ReactiveTransactionManager reactiveCustomTransactionManager(
        @Qualifier("customConnectionPool") final ConnectionFactory connectionFactory) {
        return new R2dbcTransactionManager(connectionFactory);
    }
}
