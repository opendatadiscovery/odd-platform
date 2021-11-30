package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.api.contract.model.Alert;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.dto.AlertDto;
import org.opendatadiscovery.oddplatform.utils.Page;

public interface AlertMapper {
    Alert mapAlert(final AlertDto alert);

    AlertList mapAlerts(final Page<AlertDto> alerts);

    AlertList mapAlerts(final Collection<AlertDto> alerts);
}
