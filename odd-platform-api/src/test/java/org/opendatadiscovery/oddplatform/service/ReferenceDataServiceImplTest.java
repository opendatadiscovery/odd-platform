package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnDto;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.LookupTableDefinitionMapper;
import org.opendatadiscovery.oddplatform.mapper.LookupTableMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReferenceDataRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the reference-data / lookup-table reads — validates F-026 (Lookup Tables /
 * Reference Data Management): reading a row-list or a table by a missing id errors NotFound; reading a
 * field by a missing column errors NotFound; and requesting a field whose column belongs to a DIFFERENT
 * table errors BadUserRequest (the column-belongs-to-table invariant). Exercised with Mockito +
 * StepVerifier. No prior ReferenceDataServiceImpl unit test.
 *
 * @validates F-026
 */
@ExtendWith(MockitoExtension.class)
class ReferenceDataServiceImplTest {

    private static final long TABLE_ID = 1L;
    private static final long COLUMN_ID = 2L;
    private static final long OTHER_TABLE_ID = 99L;

    @Mock private LookupDataService lookupDataService;
    @Mock private ReferenceDataRepository referenceDataRepository;
    @Mock private ReactiveLookupTableRepository tableRepository;
    @Mock private ReactiveNamespaceRepository namespaceRepository;
    @Mock private LookupTableDefinitionMapper tableDefinitionMapper;
    @Mock private LookupTableMapper tableMapper;

    private ReferenceDataService service;

    @BeforeEach
    void setUp() {
        service = new ReferenceDataServiceImpl(lookupDataService, referenceDataRepository, tableRepository,
            namespaceRepository, tableDefinitionMapper, tableMapper);
    }

    @Test
    void getLookupTableById_nonExistent_errorsNotFound() {
        when(lookupDataService.getLookupTableById(any())).thenReturn(Mono.empty());
        StepVerifier.create(service.getLookupTableById(TABLE_ID)).verifyError(NotFoundException.class);
    }

    @Test
    void getLookupTableRowList_nonExistentTable_errorsNotFound() {
        when(lookupDataService.getLookupTableById(any())).thenReturn(Mono.empty());
        StepVerifier.create(service.getLookupTableRowList(TABLE_ID, 1, 10)).verifyError(NotFoundException.class);
    }

    @Test
    void getLookupTableField_nonExistentColumn_errorsNotFound() {
        when(lookupDataService.getLookupTableDefinitionById(any())).thenReturn(Mono.empty());
        StepVerifier.create(service.getLookupTableField(TABLE_ID, COLUMN_ID)).verifyError(NotFoundException.class);
    }

    @Test
    void getLookupTableField_columnBelongsToDifferentTable_errorsBadRequest() {
        final LookupTableColumnDto columnOfAnotherTable = new LookupTableColumnDto(
            new LookupTablesPojo().setId(OTHER_TABLE_ID).setName("other"),
            new LookupTablesDefinitionsPojo().setColumnName("col"));
        when(lookupDataService.getLookupTableDefinitionById(any())).thenReturn(Mono.just(columnOfAnotherTable));

        StepVerifier.create(service.getLookupTableField(TABLE_ID, COLUMN_ID))
            .verifyError(BadUserRequestException.class);
    }
}
