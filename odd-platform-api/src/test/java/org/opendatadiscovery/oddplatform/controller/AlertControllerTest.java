package org.opendatadiscovery.oddplatform.controller;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.model.tables.Alert;

/**
 * Test for the {@link AlertController}.
 *
 * @author matmalik on 10.12.2021
 */
@Slf4j
class AlertControllerTest {

    @BeforeEach
    void setUp() {
    }

    @Test
    public void test() {
        log.info(Alert.ALERT.getSchema().getName() + "." + Alert.ALERT.getName().toString());
    }
}