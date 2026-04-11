package org.opendatadiscovery.oddplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnershipDto {
    private OwnershipPojo ownership;
    private OwnerPojo owner;
    private TitlePojo title;
}
