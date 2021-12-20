package org.opendatadiscovery.oddplatform.misc;

import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;

/**
 * Class is intended to prepare test data for tests.
 *
 * @author matmalik on 10.12.2021
 */
public class TestDataUtils {

    /**
     * Creates {@link NamespacePojo} for tests.
     *
     * @param name - namespace name
     * @param id   - namespace id
     * @return - {@link NamespacePojo}
     */
    public NamespacePojo createTestNamespacePojo(final String name, final long id) {
        final NamespacePojo expectedNamespacePojo = new NamespacePojo();
        expectedNamespacePojo.setName(name);
        expectedNamespacePojo.setId(id);
        return expectedNamespacePojo;
    }
}
