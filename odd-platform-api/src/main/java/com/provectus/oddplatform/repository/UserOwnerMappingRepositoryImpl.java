package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import com.provectus.oddplatform.model.tables.pojos.UserOwnerMappingPojo;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import static com.provectus.oddplatform.model.Tables.OWNER;
import static com.provectus.oddplatform.model.Tables.USER_OWNER_MAPPING;

@Repository
@RequiredArgsConstructor
public class UserOwnerMappingRepositoryImpl implements UserOwnerMappingRepository {
    private final DSLContext dslContext;
    private final OwnerRepository ownerRepository;

    @Override
    @Transactional
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
