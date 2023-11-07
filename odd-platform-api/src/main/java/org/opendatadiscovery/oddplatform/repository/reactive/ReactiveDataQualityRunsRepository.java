package org.opendatadiscovery.oddplatform.repository.reactive;

import org.jooq.Record2;
import org.jooq.Record3;
import reactor.core.publisher.Flux;

public interface ReactiveDataQualityRunsRepository {

    Flux<Record3<String, String, Integer>> getLatestDataQualityRunsResults();

    Flux<Record2<Integer, String>> getLatestTablesHealth();

    Flux<Record2<Integer, String>> getMonitoredTables();
}
