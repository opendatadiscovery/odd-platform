package org.opendatadiscovery.oddplatform.service.ingestion.alert;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;

public abstract class AlertAction {
    @RequiredArgsConstructor
    public static class CreateAlertAction extends AlertAction {
        @Getter
        private final AlertPojo alertPojo;

        @Getter
        private final Map<AlertUniqueConstraint, List<AlertChunkPojo>> chunks;
    }

    @RequiredArgsConstructor
    public static class ResolveAutomaticallyAlertAction extends AlertAction {
        @Getter
        private final long alertId;
    }

    @RequiredArgsConstructor
    public static class StackAlertAction extends AlertAction {
        @Getter
        private final List<AlertChunkPojo> chunks;
    }

    // Unique constraint on Alert table
    public record AlertUniqueConstraint(String dataEntityOddrn, short type, String messengerEntityOddrn) {
        public static AlertUniqueConstraint fromAlert(final AlertPojo alertPojo) {
            return new AlertUniqueConstraint(
                alertPojo.getDataEntityOddrn(),
                alertPojo.getType(),
                alertPojo.getMessengerEntityOddrn()
            );
        }

        public AlertPojo toOpenAlert(final LocalDateTime createdAt) {
            return new AlertPojo()
                .setDataEntityOddrn(dataEntityOddrn)
                .setMessengerEntityOddrn(messengerEntityOddrn)
                .setType(type)
                .setStatus(AlertStatusEnum.OPEN.getCode())
                .setLastCreatedAt(createdAt)
                .setStatusUpdatedAt(createdAt);
        }
    }
}
