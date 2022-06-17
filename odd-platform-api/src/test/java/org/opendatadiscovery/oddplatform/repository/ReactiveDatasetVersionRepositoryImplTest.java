package org.opendatadiscovery.oddplatform.repository;

import org.jeasy.random.EasyRandom;
import org.jeasy.random.EasyRandomParameters;
import org.jooq.JSONB;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.springframework.beans.factory.annotation.Autowired;

import static org.jeasy.random.FieldPredicates.ofType;

class ReactiveDatasetVersionRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    ReactiveDatasetVersionRepository reactiveDatasetVersionRepository;
    @Autowired
    private ReactiveDatasetFieldRepository reactiveDatasetFieldRepository;
    private static final EasyRandom EASY_RANDOM;

    static {
        final EasyRandomParameters easyRandomParameters = new EasyRandomParameters();
        easyRandomParameters.excludeField(ofType(JSONB.class));
        EASY_RANDOM = new EasyRandom(easyRandomParameters);
    }

    @Test
    @DisplayName("Test get DatasetVersion from database")
    void testGetDatasetVersion() {
        final DatasetVersionPojo datasetVersionPojo = new DatasetVersionPojo();
        reactiveDatasetVersionRepository.getDatasetVersion(datasetVersionPojo.getId());
    }
}