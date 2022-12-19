package org.opendatadiscovery.oddplatform.housekeeping.job;

import java.sql.Connection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.housekeeping.config.HousekeepingTTLProperties;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.model.Tables.ALERT_CHUNK;
import static org.opendatadiscovery.oddplatform.model.tables.Alert.ALERT;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlertHousekeepingJob implements HousekeepingJob {
    private final HousekeepingTTLProperties housekeepingTTLProperties;

    @Override
    public void doHousekeeping(final Connection connection) {
        DSL.using(connection).transaction(ctx -> {
            final DSLContext dslContext = ctx.dsl();

            final List<Long> alertsToDelete = dslContext.select(ALERT.ID)
                .from(ALERT)
                .where(ALERT.STATUS.eq(AlertStatusEnum.RESOLVED.getCode()))
                .or(ALERT.STATUS.eq(AlertStatusEnum.RESOLVED_AUTOMATICALLY.getCode()))
                .and(ALERT.STATUS_UPDATED_AT.lessOrEqual(
                    DSL.currentLocalDateTime().minus(housekeepingTTLProperties.getResolvedAlertsDays())))
                .fetch(ALERT.ID);

            dslContext.deleteFrom(ALERT_CHUNK)
                .where(ALERT_CHUNK.ALERT_ID.in(alertsToDelete))
                .execute();

            final int deletedResolvedAlerts = dslContext
                .deleteFrom(ALERT)
                .where(ALERT.ID.in(alertsToDelete))
                .execute();

            log.debug("Housekeeping job deleted {} resolved alerts", deletedResolvedAlerts);
        });
    }
}
