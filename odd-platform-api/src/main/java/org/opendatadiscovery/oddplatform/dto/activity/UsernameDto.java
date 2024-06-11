package org.opendatadiscovery.oddplatform.dto.activity;

import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;

public record UsernameDto(String username, OwnerPojo ownerPojo) {
}