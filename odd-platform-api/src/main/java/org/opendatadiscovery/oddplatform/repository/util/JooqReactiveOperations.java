package org.opendatadiscovery.oddplatform.repository.util;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.Result;
import org.jooq.ResultQuery;
import org.jooq.RowCountQuery;
import org.jooq.SQLDialect;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class JooqReactiveOperations {
    private final DSLContext mappingDSLContext = DSL.using(SQLDialect.POSTGRES);

    private final DatabaseClient databaseClient;

    public Mono<Integer> mono(final RowCountQuery query) {
        return databaseClient.inConnection(c -> {
            DSL.using(c).attach(query);
            return Mono.from(query);
        });
    }

    public <R extends Record> Mono<R> mono(final ResultQuery<R> query) {
        return databaseClient.inConnection(c -> {
            DSL.using(c).attach(query);
            return Mono.from(query);
        });
    }

    public <R extends Record> Flux<R> flux(final ResultQuery<R> query) {
        return databaseClient.inConnectionMany(c -> {
            DSL.using(c).attach(query);
            return Flux.from(query);
        });
    }

    public <R extends Record> R newRecord(final Table<R> table,
                                          final Object source) {
        return mappingDSLContext.newRecord(table, source);
    }

    public <R extends Record> Result<Record> newResult(final Table<R> table, final List<R> records) {
        final Result<Record> result = mappingDSLContext.newResult(table.fields());
        result.addAll(records);
        return result;
    }
}
