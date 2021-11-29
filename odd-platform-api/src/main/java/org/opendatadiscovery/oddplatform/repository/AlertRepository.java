package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.dto.AlertDto;
import org.opendatadiscovery.oddplatform.dto.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

public interface AlertRepository {
    Page<AlertDto> listAll(final int page, final int size);

    Page<AlertDto> listByOwner(final int page, final int size, final long ownerId);

    Collection<AlertDto> getDataEntityAlerts(long dataEntityId);

    long count();

    long countByOwner(final long ownerId);

    void updateAlertStatus(final long alertId, final AlertStatusEnum status);

    void createAlerts(final Collection<AlertPojo> alerts);
}
