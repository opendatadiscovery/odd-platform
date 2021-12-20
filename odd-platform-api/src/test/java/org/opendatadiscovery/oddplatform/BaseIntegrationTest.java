package org.opendatadiscovery.oddplatform;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;


/**
 * Base integration test configuration class.
 * If you want to create new Integration test,
 * your test should be extended from this base test
 *
 * @author matmalik
 */
@ActiveProfiles("integration-test")
@SpringBootTest
public abstract class BaseIntegrationTest {
}
