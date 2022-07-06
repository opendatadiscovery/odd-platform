package org.opendatadiscovery.oddplatform.utils;

import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DatasetServiceUtilsTest {

    @Test
    void testMapNewDatasetVersion() {
        final DataEntityIngestionDto dataEntityIngestionDto = new DataEntityIngestionDto();
        dataEntityIngestionDto.setDataSet(
            new DataEntityIngestionDto.DataSetIngestionDto(
                "parentOddrn", null, "structHash", 1L));
        final long expectedVersion = 1L;
        final EnrichedDataEntityIngestionDto enrichedDataEntityIngestionDto =
            new EnrichedDataEntityIngestionDto(expectedVersion, dataEntityIngestionDto);
        final DatasetVersionPojo actualDatasetVersionPojo =
            DatasetServiceUtils.mapNewDatasetVersion(enrichedDataEntityIngestionDto, expectedVersion);

        assertEquals(expectedVersion, actualDatasetVersionPojo.getVersion());
        assertEquals(enrichedDataEntityIngestionDto.getOddrn(), actualDatasetVersionPojo.getDatasetOddrn());
        assertEquals(enrichedDataEntityIngestionDto.getDataSet().structureHash(),
            actualDatasetVersionPojo.getVersionHash());
    }
}