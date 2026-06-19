package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.LookupTableNameActivityStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.LookupTableRenamed;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the LOOKUP_TABLE_RENAMED activity handler (CTRIB-023 / #1753 Defect 2).
 * The handler reads the lookup table's display name keyed to its data-entity id — once before the
 * rename (old state) and once after (updated state) — so the activity aspect can emit
 * "Table name was updated from &lt;old&gt; to &lt;new&gt;". Exercised with Mockito + StepVerifier.
 *
 * @validates F-059
 */
@ExtendWith(MockitoExtension.class)
class LookupTableRenamedActivityHandlerTest {

    private static final long LOOKUP_TABLE_ID = 42L;
    private static final long DATA_ENTITY_ID = 7L;
    private static final Map<String, Object> PARAMS =
        Map.of(LookupTableRenamed.LOOKUP_TABLE_ID, LOOKUP_TABLE_ID);

    @Mock
    private ReactiveLookupTableRepository lookupTableRepository;

    private LookupTableRenamedActivityHandler handler;

    @BeforeEach
    void setUp() {
        handler = new LookupTableRenamedActivityHandler(lookupTableRepository);
    }

    @Test
    void handlesOnlyLookupTableRenamed() {
        assertThat(handler.isHandle(ActivityEventTypeDto.LOOKUP_TABLE_RENAMED)).isTrue();
        assertThat(handler.isHandle(ActivityEventTypeDto.BUSINESS_NAME_UPDATED)).isFalse();
    }

    @Test
    void contextInfoCarriesDataEntityIdAndOldName() {
        when(lookupTableRepository.get(LOOKUP_TABLE_ID)).thenReturn(Mono.just(pojo("Customer Lookups")));

        StepVerifier.create(handler.getContextInfo(PARAMS))
            .assertNext(info -> {
                assertThat(info.getDataEntityId()).isEqualTo(DATA_ENTITY_ID);
                assertThat(nameOf(info.getOldState())).isEqualTo("Customer Lookups");
            })
            .verifyComplete();
    }

    @Test
    void updatedStateReadsTheCurrentName() {
        when(lookupTableRepository.get(LOOKUP_TABLE_ID)).thenReturn(Mono.just(pojo("Customer Lookup Codes")));

        StepVerifier.create(handler.getUpdatedState(PARAMS, DATA_ENTITY_ID))
            .assertNext(state -> assertThat(nameOf(state)).isEqualTo("Customer Lookup Codes"))
            .verifyComplete();
    }

    private static LookupTablesPojo pojo(final String name) {
        return new LookupTablesPojo()
            .setId(LOOKUP_TABLE_ID)
            .setName(name)
            .setDataEntityId(DATA_ENTITY_ID);
    }

    private static String nameOf(final String stateJson) {
        return JSONSerDeUtils.deserializeJson(stateJson, LookupTableNameActivityStateDto.class).name();
    }
}
