package org.opendatadiscovery.oddplatform.notification.processor;

import org.opendatadiscovery.oddplatform.notification.wal.DecodedWALMessage;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.model.Tables.ALERT;

@Component
public class AlertSlackNotificationMessageBuilder implements NotificationMessageBuilder {
    private static final String INSERT_TEMPLATE = """
        :warning:
        *Warning!* Alert has just been created!
                
        *Alert type*:
        %s
                
        *Description*:
        %s
                
        *Data Entity ODDRN*:
        %s
                
        *Alert ID*:
        %d
                
        """;

    private static final String UPDATE_TEMPLATE_WITH_UPDATED_BY = """
        %s
        Alert status has just been updated
                
        *Alert type*:
        %s
                
        *Description*:
        %s
                
        *Data Entity ODDRN*:
        %s
                
        *New status*:
        %s
                
        *Updated By*:
        %s
                
        *Alert ID*:
        %d
                
        """;

    private static final String UPDATE_TEMPLATE_WITHOUT_UPDATED_BY = """
        %s
        Alert status has just been updated
                
        *Alert type*:
        %s
                
        *Description*:
        %s
                
        *Data Entity ODDRN*:
        %s
                
        *New status*:
        %s
                
        *Alert ID*:
        %d
                
        """;

    @Override
    public String build(final DecodedWALMessage message) {
        final long alertId = Long.parseLong(message.columns().get(ALERT.ID.getName()).valueAsString());
        final String dataEntityOddrn = message.columns().get(ALERT.DATA_ENTITY_ODDRN.getName()).valueAsString();
        final String alertDescription = message.columns().get(ALERT.DESCRIPTION.getName()).valueAsString();
        final String alertType = message.columns().get(ALERT.TYPE.getName()).valueAsString();

        switch (message.operation()) {
            case INSERT:
                return INSERT_TEMPLATE.formatted(alertType, alertDescription, dataEntityOddrn, alertId);
            case UPDATE:
                final String updatedBy = message.columns().get(ALERT.STATUS_UPDATED_BY.getName()).valueAsString();
                final String status = message.columns().get(ALERT.STATUS.getName()).valueAsString();

                final String emoji = "RESOLVED".equals(status) ? ":white_check_mark:" : ":warning:";

                return updatedBy != null
                    ? UPDATE_TEMPLATE_WITH_UPDATED_BY.formatted(emoji, alertType, alertDescription,
                    dataEntityOddrn, status, updatedBy, alertId)
                    : UPDATE_TEMPLATE_WITHOUT_UPDATED_BY.formatted(emoji, alertType, alertDescription, dataEntityOddrn,
                    status, alertId);
            default:
                throw new IllegalArgumentException(
                    "Unsupported operation for building an alert message: %s".formatted(message.operation()));
        }
    }
}
