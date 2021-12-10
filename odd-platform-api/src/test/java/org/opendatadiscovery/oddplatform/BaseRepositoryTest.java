package org.opendatadiscovery.oddplatform;

import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;

/**
 * Base test class for repository layer
 *
 * @author matmalik on 10.12.2021
 */
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public abstract class BaseRepositoryTest extends BaseIntegrationTest {

}
