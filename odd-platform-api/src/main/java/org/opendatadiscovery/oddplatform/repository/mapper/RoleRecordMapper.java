package org.opendatadiscovery.oddplatform.repository.mapper;

import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.jooq.Record;
import org.opendatadiscovery.oddplatform.dto.RoleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.PolicyPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;

@Component
@RequiredArgsConstructor
public class RoleRecordMapper {
    private final JooqRecordHelper jooqRecordHelper;

    public RoleDto mapRecordToDto(final Record r, final String policyFieldName) {
        final RolePojo pojo = r.into(ROLE).into(RolePojo.class);
        final Set<PolicyPojo> policies = jooqRecordHelper.extractAggRelation(r, policyFieldName, PolicyPojo.class);
        return new RoleDto(pojo, policies);
    }

    public RoleDto mapCTERecordToDto(final Record r, final String cteName, final String policyFieldName) {
        final RolePojo rolePojo = jooqRecordHelper.remapCte(r, cteName, ROLE).into(RolePojo.class);
        final Set<PolicyPojo> policies = jooqRecordHelper.extractAggRelation(r, policyFieldName, PolicyPojo.class);
        return new RoleDto(rolePojo, policies);
    }
}
