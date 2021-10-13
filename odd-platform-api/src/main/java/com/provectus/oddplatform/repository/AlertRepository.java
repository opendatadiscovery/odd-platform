package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.AlertDto;
import com.provectus.oddplatform.dto.AlertStatusEnum;
import com.provectus.oddplatform.model.tables.pojos.AlertPojo;
import com.provectus.oddplatform.utils.Page;
import java.util.Collection;

public interface AlertRepository {
    Page<AlertDto> listAll(final int page, final int size);

    Page<AlertDto> listByOwner(final int page, final int size, final long ownerId);

    Collection<AlertDto> getDataEntityAlerts(long dataEntityId);

    long count();

    long countByOwner(final long ownerId);

    void updateAlertStatus(final long alertId, final AlertStatusEnum status);

    void createAlerts(final Collection<AlertPojo> alerts);
}
