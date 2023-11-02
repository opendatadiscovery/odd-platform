package org.opendatadiscovery.oddplatform.repository.reactive;

import org.jooq.Record3;
import org.jooq.SelectSeekStep1;

public interface ReactiveDataQualityRunsRepository {

    SelectSeekStep1<Record3<String, String, Integer>, String> getLatestDataQualityRunsResults();
}
