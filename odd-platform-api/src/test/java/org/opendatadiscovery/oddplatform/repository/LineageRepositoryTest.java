package org.opendatadiscovery.oddplatform.repository;

import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLineageRepository;
import org.springframework.beans.factory.annotation.Autowired;

class LineageRepositoryTest extends BaseIntegrationTest {

    @Autowired
    ReactiveLineageRepository lineageRepository;

//    @Test
//    void replaceLineagePaths() {
//        var pojo = new LineagePojo();
//        lineageRepository.replaceLineagePaths(List.of(pojo));
//
//    }

    @Test
    void getTargetsCount() {
    }

    @Test
    void getLineageRelations() {
    }
}