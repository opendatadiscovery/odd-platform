package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.dto.alert.AlertDto;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

public interface AlertRepository {
    Page<AlertDto> listAll(final int page, final int size);

    Page<AlertDto> listByOwner(final int page, final int size, final long ownerId);

    Collection<AlertDto> getDataEntityAlerts(final long dataEntityId);

    Page<AlertDto> listDependentObjectsAlerts(final int page, final int size, final long ownerId);

    long count();

    long countByOwner(final long ownerId);

    long countDependentObjectsAlerts(final long ownerId);

    AlertPojo updateAlertStatus(final long alertId, final AlertStatusEnum status, final String userName);

    Collection<AlertPojo> createAlerts(final Collection<AlertPojo> alerts);
}
