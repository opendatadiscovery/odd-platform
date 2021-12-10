package org.opendatadiscovery.oddplatform;

import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.junit.jupiter.Testcontainers;


/**
 * Base integration test configuration class.
 * If you want to create new Integration test,
 * your test should be extended from this base test
 *
 * @author matmalik
 */
@ActiveProfiles("integration-test")
@SpringBootTest
@Testcontainers
@ExtendWith(SpringExtension.class)
public abstract class BaseIntegrationTest {

}
