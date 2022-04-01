package org.opendatadiscovery.oddplatform.repository.util;

import io.r2dbc.spi.ConnectionFactory;
import lombok.RequiredArgsConstructor;
import org.jooq.Record;
import org.jooq.ResultQuery;
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

    private final ConnectionFactory connectionFactory;

    public Mono<? extends Record> mono(final ResultQuery<? extends Record> query) {
        return Mono.usingWhen(
            ConnectionFactoryUtils.getConnection(connectionFactory),
            c -> {
                DSL.using(c).attach(query);
                return Mono.from(query);
            },
            c -> TransactionContextManager
                .currentContext()
                .onErrorResume(NoTransactionException.class, e -> Mono.from(c.close()).then(Mono.empty()))
        );
    }

    public Flux<? extends Record> flux(final ResultQuery<? extends Record> query) {
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
}
