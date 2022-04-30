package org.opendatadiscovery.oddplatform.repository.util;

import io.r2dbc.spi.Connection;
import io.r2dbc.spi.ConnectionFactory;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.ResultQuery;
import org.jooq.RowCountQuery;
import org.jooq.SQLDialect;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.springframework.r2dbc.connection.ConnectionFactoryUtils;
import org.springframework.stereotype.Component;
import org.springframework.transaction.NoTransactionException;
import org.springframework.transaction.reactive.TransactionContextManager;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class JooqReactiveOperations {
    private final DSLContext mappingDSLContext = DSL.using(SQLDialect.POSTGRES);

    private final ConnectionFactory connectionFactory;

    public Mono<Integer> mono(final RowCountQuery query) {
        return wrapMono(c -> {
            DSL.using(c).attach(query);
            return Mono.from(query);
        });
    }

    public <R extends Record> Mono<R> mono(final ResultQuery<R> query) {
        return wrapMono(c -> {
            DSL.using(c).attach(query);
            return Mono.from(query);
        });
    }

    public <R extends Record> Flux<R> flux(final ResultQuery<R> query) {
        return Flux.usingWhen(
            ConnectionFactoryUtils.getConnection(connectionFactory),
            c -> {
                DSL.using(c).attach(query);
                return Flux.from(query);
            },
            c -> TransactionContextManager
                .currentContext()
                .onErrorResume(NoTransactionException.class, e -> Mono.from(c.close()).then(Mono.empty()))
        );
    }

    public <R extends Record> R newRecord(final Table<R> table,
                                          final Object source) {
        return mappingDSLContext.newRecord(table, source);
    }

    private <T> Mono<T> wrapMono(final Function<Connection, Mono<T>> function) {
        return Mono.usingWhen(
            ConnectionFactoryUtils.getConnection(connectionFactory),
            function,
            c -> TransactionContextManager
                .currentContext()
                .onErrorResume(NoTransactionException.class, e -> Mono.from(c.close()).then(Mono.empty()))
        );
    }
}
