package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

public class AlertRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private DataEntityRepository dataEntityRepository;

    @Test
    public void createAlertsTest() {
        final DataEntityPojo dataEntityPojo = dataEntityRepository
            .bulkCreate(List.of(new DataEntityPojo().setOddrn(UUID.randomUUID().toString()))).get(0);
        final AlertPojo firstAlert = createAlertPojo(dataEntityPojo.getOddrn());
        final AlertPojo secondAlert = createAlertPojo(dataEntityPojo.getOddrn());
        Collection<AlertPojo> alerts = alertRepository.createAlerts(List.of(firstAlert, secondAlert));
        assertThat(alerts)
            .allMatch(p -> p.getId() != null)
            .usingElementComparatorIgnoringFields("id", "createdAt")
            .hasSameElementsAs(List.of(firstAlert, secondAlert));
    }

    private AlertPojo createAlertPojo(final String dataEntityOddrn) {
        return new AlertPojo()
            .setType(AlertTypeEnum.BACKWARDS_INCOMPATIBLE_SCHEMA.name())
            .setDescription(UUID.randomUUID().toString())
            .setStatus(AlertStatusEnum.OPEN.name())
            .setDataEntityOddrn(dataEntityOddrn)
            .setMessengerEntityOddrn(dataEntityOddrn)
            .setStatusUpdatedAt(LocalDateTime.now());
    }


}
