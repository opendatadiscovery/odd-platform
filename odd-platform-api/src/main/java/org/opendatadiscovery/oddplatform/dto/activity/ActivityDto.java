package org.opendatadiscovery.oddplatform.dto.activity;

import org.opendatadiscovery.oddplatform.model.tables.pojos.ActivityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;

public record ActivityDto(ActivityPojo activity, OwnerPojo user, DataEntityPojo dataEntity) {
}
