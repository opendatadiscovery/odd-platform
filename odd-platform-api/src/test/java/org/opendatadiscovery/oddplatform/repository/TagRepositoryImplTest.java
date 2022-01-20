package org.opendatadiscovery.oddplatform.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.springframework.beans.factory.annotation.Autowired;

@DisplayName("Integration tests for TagRepository")
class TagRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private TagRepository tagRepository;

    @Test
    void test() {
    }
}
