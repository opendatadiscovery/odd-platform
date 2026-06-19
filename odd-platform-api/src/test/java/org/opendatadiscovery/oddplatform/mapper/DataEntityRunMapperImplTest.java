package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRun;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure-logic unit test for the hand-written DataEntityRunMapper.mapDataEntityRuns pagination wrapping —
 * validates F-040 (DQ Test Run History): the page total and hasNext flag are propagated into the response
 * PageInfo and an empty run page yields empty items. Exercised against the real generated
 * DataEntityRunMapperImpl (no mocks). No prior DataEntityRunMapper unit test.
 *
 * @validates F-040
 */
class DataEntityRunMapperImplTest {

    private DataEntityRunMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new DataEntityRunMapperImpl(new DateTimeMapperImpl());
    }

    @Test
    void mapDataEntityRuns_emptyPage_propagatesPageInfoWithEmptyItems() {
        final DataEntityRunList result = mapper.mapDataEntityRuns(1L, new Page<>(List.of(), 3L, false));
        assertThat(result.getPageInfo().getTotal()).isEqualTo(3L);
        assertThat(result.getPageInfo().getHasNext()).isFalse();
        assertThat(result.getItems()).isEmpty();
    }

    @Test
    void mapDataEntityRuns_runningStatus_mapsToRunning() {
        final DataEntityTaskRunPojo running = new DataEntityTaskRunPojo()
            .setOddrn("run-running")
            .setName("run-running")
            .setStatus("RUNNING");

        final DataEntityRunList result = mapper.mapDataEntityRuns(1L, new Page<>(List.of(running), 1L, false));

        // RUNNING is now a first-class wire value: the DB-side IngestionTaskRunStatus has always had it, and the
        // generated Enum.valueOf used to throw -> HTTP 500 on the runs page during an in-flight test (PLT-021).
        assertThat(result.getItems())
            .singleElement()
            .extracting(DataEntityRun::getStatus)
            .isEqualTo(DataEntityRunStatus.RUNNING);
    }

    @Test
    void mapRunStatus_nullStatus_returnsNull() {
        // MapStruct null-guards the field conversion, so the run-status mapper is reachable with null only by a
        // direct call — assert the defensive null path here (a null DB status maps to a null wire status).
        assertThat(mapper.mapRunStatus(null)).isNull();
    }

    @Test
    void mapDataEntityRuns_unmappableStatus_degradesToUnknownNotThrow() {
        final DataEntityTaskRunPojo future = new DataEntityTaskRunPojo()
            .setOddrn("run-future")
            .setName("run-future")
            .setStatus("SOME_FUTURE_STATUS");

        final DataEntityRunList result = mapper.mapDataEntityRuns(1L, new Page<>(List.of(future), 1L, false));

        // A status the wire enum does not (yet) model degrades to UNKNOWN instead of throwing and 500-ing the read.
        assertThat(result.getItems())
            .singleElement()
            .extracting(DataEntityRun::getStatus)
            .isEqualTo(DataEntityRunStatus.UNKNOWN);
    }
}
