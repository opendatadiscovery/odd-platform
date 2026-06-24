package org.opendatadiscovery.oddplatform.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTable;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.service.LookupDataSearchService;
import org.opendatadiscovery.oddplatform.service.ReferenceDataService;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit test for {@link ReferenceDataController} — the thin REST delegation layer for reference data. Pins
 * that the column write endpoints forward BOTH path ids (the table id AND the column id) to
 * {@link ReferenceDataService}: the previous code dropped the path {@code lookupTableId} on the PATCH and
 * DELETE column endpoints, letting a caller mutate a column on a DIFFERENT table (odd-platform#1769 defect
 * b + its delete twin). Plain Mockito — the project's WebTestClient harness is disabled in CI (see
 * {@code ActivityControllerTest} / {@code AlertControllerTest}).
 */
@ExtendWith(MockitoExtension.class)
class ReferenceDataControllerTest {

    private static final long TABLE_ID = 5L;
    private static final long COLUMN_ID = 9L;

    @Mock
    private ReferenceDataService referenceDataService;
    @Mock
    private LookupDataSearchService lookupDataSearchService;
    @InjectMocks
    private ReferenceDataController controller;

    @Test
    void updateLookupTableField_forwardsBothTableAndColumnIdsAndWraps200() {
        when(referenceDataService.updateLookupTableField(eq(TABLE_ID), eq(COLUMN_ID), any()))
            .thenReturn(Mono.just(new LookupTable()));

        StepVerifier.create(controller.updateLookupTableField(TABLE_ID, COLUMN_ID,
                Mono.just(new LookupTableFieldUpdateFormData().name("renamed")), null))
            .assertNext(response -> assertThat(response.getStatusCode().value()).isEqualTo(200))
            .verifyComplete();

        verify(referenceDataService).updateLookupTableField(eq(TABLE_ID), eq(COLUMN_ID), any());
    }

    @Test
    void deleteLookupTableField_forwardsBothTableAndColumnIdsAndWraps204() {
        when(referenceDataService.deleteLookupTableField(eq(TABLE_ID), eq(COLUMN_ID))).thenReturn(Mono.empty());

        StepVerifier.create(controller.deleteLookupTableField(TABLE_ID, COLUMN_ID, null))
            .assertNext(response -> assertThat(response.getStatusCode().value()).isEqualTo(204))
            .verifyComplete();

        verify(referenceDataService).deleteLookupTableField(TABLE_ID, COLUMN_ID);
    }
}
