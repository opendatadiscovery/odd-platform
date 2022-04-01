package org.opendatadiscovery.oddplatform.repository;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.opendatadiscovery.oddplatform.annotation.BlockingTransactional;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.UserOwnerMappingPojo;
import org.springframework.stereotype.Repository;

import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.USER_OWNER_MAPPING;

@Repository
@RequiredArgsConstructor
public class UserOwnerMappingRepositoryImpl implements UserOwnerMappingRepository {
    private final DSLContext dslContext;
    private final OwnerRepository ownerRepository;

    @Override
    @BlockingTransactional
    public OwnerPojo createRelation(final String oidcUsername, final String ownerName) {
        final OwnerPojo owner = ownerRepository.createOrGet(new OwnerPojo().setName(ownerName));

        dslContext.selectFrom(USER_OWNER_MAPPING)
            .where(USER_OWNER_MAPPING.OIDC_USERNAME.eq(oidcUsername))
            .fetchOptionalInto(UserOwnerMappingPojo.class)
            .ifPresent(p -> dslContext.deleteFrom(USER_OWNER_MAPPING)
                .where(USER_OWNER_MAPPING.OIDC_USERNAME.eq(oidcUsername))
                .execute());

        dslContext.insertInto(USER_OWNER_MAPPING)
            .values(owner.getId(), oidcUsername)
            .onConflict(USER_OWNER_MAPPING.OWNER_ID).doUpdate()
            .set(USER_OWNER_MAPPING.OWNER_ID, owner.getId())
            .set(USER_OWNER_MAPPING.OIDC_USERNAME, oidcUsername)
            .execute();

        return owner;
    }

    @Override
    public Optional<OwnerPojo> getAssociatedOwner(final String oidcUsername) {
        return dslContext
            .select(OWNER.asterisk())
            .from(USER_OWNER_MAPPING)
            .join(OWNER).on(USER_OWNER_MAPPING.OWNER_ID.eq(OWNER.ID))
            .where(USER_OWNER_MAPPING.OIDC_USERNAME.eq(oidcUsername))
            .fetchOptionalInto(OwnerPojo.class);
    }
}
