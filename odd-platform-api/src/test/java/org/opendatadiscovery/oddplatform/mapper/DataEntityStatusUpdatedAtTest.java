package org.opendatadiscovery.oddplatform.mapper;

import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatusEnum;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Behavioural re-grounding of the former structural {@code @pins PLT-027} (CTRIB-053 / #1836 ST-2a;
 * general rule retrospectives/LSN-029).
 *
 * <p>{@code DataEntityMapperImpl.applyStatus} used to overwrite {@code pojo.setStatus(...)} BEFORE the
 * change guard {@code if (statusDto.getId() != pojo.getStatus())}, so the guard compared the new value
 * against itself, was always false, and {@code status_updated_at} never bumped on a transition. (The old
 * pin's TTL-purge rationale was itself mis-grounded: soft-delete stamps {@code status_updated_at} on a
 * separate path — {@code getDeleteChangedFields} — and housekeeping purges DELETED-only, so the bug is a
 * LATENT correctness defect, not a broken purge.) These cases pin the corrected behaviour directly — a
 * real transition bumps the timestamp, a no-op set does not: RED on the pre-fix mapper (the "bumps" case
 * stays null), GREEN on the fix.
 *
 * <p>{@code applyStatus} uses none of the mapper's injected collaborators, so an all-null instance suffices.
 */
@DisplayName("DataEntityMapperImpl.applyStatus - status_updated_at bump (PLT-027)")
class DataEntityStatusUpdatedAtTest {

    private final DataEntityMapperImpl mapper = new DataEntityMapperImpl(
        null, null, null, null, null, null, null, null, null, null, null);

    @Test
    void bumpsStatusUpdatedAt_onARealTransition() {
        final DataEntityPojo pojo = new DataEntityPojo().setStatus(DataEntityStatusDto.STABLE.getId());

        mapper.applyStatus(pojo, new DataEntityStatus(DataEntityStatusEnum.DEPRECATED));

        assertThat(pojo.getStatusUpdatedAt())
            .as("a STABLE -> DEPRECATED transition must bump status_updated_at")
            .isNotNull();
    }

    @Test
    void doesNotBumpStatusUpdatedAt_onANoOpStatusSet() {
        final LocalDateTime original = LocalDateTime.of(2020, 1, 1, 0, 0);
        final DataEntityPojo pojo = new DataEntityPojo()
            .setStatus(DataEntityStatusDto.STABLE.getId())
            .setStatusUpdatedAt(original);

        mapper.applyStatus(pojo, new DataEntityStatus(DataEntityStatusEnum.STABLE));

        assertThat(pojo.getStatusUpdatedAt())
            .as("re-setting the same status must NOT bump status_updated_at")
            .isEqualTo(original);
    }
}
