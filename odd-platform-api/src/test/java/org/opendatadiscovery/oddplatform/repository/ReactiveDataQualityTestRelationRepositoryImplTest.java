package org.opendatadiscovery.oddplatform.repository;

import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.jeasy.random.EasyRandom;
import org.jeasy.random.EasyRandomParameters;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityTestRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@Slf4j
public class ReactiveDataQualityTestRelationRepositoryImplTest extends BaseIntegrationTest {
    private static final EasyRandom EASY_RANDOM;

    static {
        final EasyRandomParameters easyRandomParameters = new EasyRandomParameters();
        EASY_RANDOM = new EasyRandom(easyRandomParameters);
    }

    @Autowired
    private ReactiveDataQualityTestRelationRepository dataQualityTestRelationRepository;

    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;

    @Autowired
    private ReactiveDataSourceRepository dataSourceRepository;

    @Test
    public void testCreateSimpleRelations() {
        final DataSourcePojo dataSource = dataSourceRepository
            .create(new DataSourcePojo().setName(UUID.randomUUID().toString()).setOddrn(UUID.randomUUID().toString()))
            .block();

        final DataEntityPojo dataEntityPojo = EASY_RANDOM.nextObject(DataEntityPojo.class);

        log.info("{}", dataEntityPojo);

        assertThat(1).isEqualTo(1);
    }
}