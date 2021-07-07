package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import com.provectus.oddplatform.model.tables.pojos.OwnershipPojo;
import com.provectus.oddplatform.model.tables.pojos.RolePojo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnershipDto {
    private OwnershipPojo ownership;
    private OwnerPojo owner;
    private RolePojo role;
}
