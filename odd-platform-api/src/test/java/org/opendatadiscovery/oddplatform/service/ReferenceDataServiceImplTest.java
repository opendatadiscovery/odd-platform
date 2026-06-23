package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTable;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFormData;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnDto;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.exception.UniqueConstraintException;
import org.opendatadiscovery.oddplatform.mapper.LookupTableDefinitionMapper;
import org.opendatadiscovery.oddplatform.mapper.LookupTableMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReferenceDataRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the reference-data / lookup-table service — validates F-026 (Lookup Tables /
 * Reference Data Management). Reads: a row-list or table by a missing id errors NotFound; a field by a
 * missing column errors NotFound; a field whose column belongs to a DIFFERENT table errors BadUserRequest
 * (the column-belongs-to-table invariant). Writes (odd-platform#1769): createLookupTable rejects a
 * normalised-name collision with UniqueConstraintException (defect a); and updateLookupTableField /
 * deleteLookupTableField now enforce the SAME column-belongs-to-table guard the read path does — a
 * column-id that does not belong to the path table errors BadUserRequest instead of mutating the wrong
 * table (defect b + its destructive delete twin). Exercised with Mockito + StepVerifier.
 *
 * @validates F-026
 */
@ExtendWith(MockitoExtension.class)
class ReferenceDataServiceImplTest {

    private static final long TABLE_ID = 1L;
    private static final long COLUMN_ID = 2L;
    private static final long OTHER_TABLE_ID = 99L;
    private static final long NAMESPACE_ID = 7L;

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

    // --- defect (a): createLookupTable normalised-name uniqueness pre-check (odd-platform#1769) ---

    @Test
    void createLookupTable_normalisedNameCollision_errorsUniqueConstraint() {
        when(namespaceRepository.getByName(any()))
            .thenReturn(Mono.just(new NamespacePojo().setId(NAMESPACE_ID).setName("ns")));
        when(tableRepository.existsByTableName(any())).thenReturn(Mono.just(true));

        StepVerifier.create(service.createLookupTable(new LookupTableFormData().name("My Table").namespaceName("ns")))
            .verifyError(UniqueConstraintException.class);
    }

    @Test
    void createLookupTable_uniqueName_proceeds() {
        when(namespaceRepository.getByName(any()))
            .thenReturn(Mono.just(new NamespacePojo().setId(NAMESPACE_ID).setName("ns")));
        when(tableRepository.existsByTableName(any())).thenReturn(Mono.just(false));
        when(referenceDataRepository.createLookupTable(any())).thenReturn(Mono.empty());
        when(lookupDataService.createLookupTable(any())).thenReturn(Mono.just(new LookupTable()));

        StepVerifier.create(service.createLookupTable(new LookupTableFormData().name("My Table").namespaceName("ns")))
            .expectNextCount(1)
            .verifyComplete();
    }

    // --- defect (b) + twin: write-side column-belongs-to-table guard mirrors the read path (odd-platform#1769) ---

    @Test
    void updateLookupTableField_columnBelongsToDifferentTable_errorsBadRequest() {
        when(lookupDataService.getLookupTableDefinitionById(any())).thenReturn(Mono.just(columnOf(OTHER_TABLE_ID)));

        StepVerifier.create(service.updateLookupTableField(TABLE_ID, COLUMN_ID, new LookupTableFieldUpdateFormData()))
            .verifyError(BadUserRequestException.class);
    }

    @Test
    void updateLookupTableField_columnBelongsToTable_proceeds() {
        when(lookupDataService.getLookupTableDefinitionById(any())).thenReturn(Mono.just(columnOf(TABLE_ID)));
        when(referenceDataRepository.updateLookupTableColumn(any(), any())).thenReturn(Mono.empty());
        when(lookupDataService.updateLookupTableColumn(any(), any())).thenReturn(Mono.just(new LookupTable()));

        StepVerifier.create(service.updateLookupTableField(TABLE_ID, COLUMN_ID, new LookupTableFieldUpdateFormData()))
            .expectNextCount(1)
            .verifyComplete();
    }

    @Test
    void deleteLookupTableField_columnBelongsToDifferentTable_errorsBadRequest() {
        when(lookupDataService.getLookupTableDefinitionById(any())).thenReturn(Mono.just(columnOf(OTHER_TABLE_ID)));

        StepVerifier.create(service.deleteLookupTableField(TABLE_ID, COLUMN_ID))
            .verifyError(BadUserRequestException.class);
    }

    @Test
    void deleteLookupTableField_columnBelongsToTable_proceeds() {
        when(lookupDataService.getLookupTableDefinitionById(any())).thenReturn(Mono.just(columnOf(TABLE_ID)));
        when(referenceDataRepository.deleteLookupTableField(any())).thenReturn(Mono.empty());
        when(lookupDataService.deleteLookupTableField(any())).thenReturn(Mono.empty());

        StepVerifier.create(service.deleteLookupTableField(TABLE_ID, COLUMN_ID))
            .verifyComplete();
    }

    private static LookupTableColumnDto columnOf(final long tableId) {
        return new LookupTableColumnDto(
            new LookupTablesPojo().setId(tableId).setName("t" + tableId),
            new LookupTablesDefinitionsPojo().setColumnName("col"));
    }
}
