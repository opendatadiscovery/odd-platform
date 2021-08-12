package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.Alert;
import com.provectus.oddplatform.api.contract.model.AlertList;
import com.provectus.oddplatform.dto.AlertDto;
import com.provectus.oddplatform.utils.Page;

import java.util.Collection;

public interface AlertMapper {
    Alert mapAlert(final AlertDto alert);

    AlertList mapAlerts(final Page<AlertDto> alerts);

    AlertList mapAlerts(final Collection<AlertDto> alerts);
}
