package org.opendatadiscovery.oddplatform.dto.activity;

import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;

public record AlertStatusUpdatedActivityStateDto(AlertStatusEnum status, AlertTypeEnum type) {
}
