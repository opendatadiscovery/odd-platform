package org.opendatadiscovery.oddplatform.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure-logic unit test for the hand-written CollectorMapper default methods — validates F-020 (Collector
 * Management): mapping a collector form together with its resolved namespace + token sets the foreign-key
 * ids null-safely (the ids come from the related pojos when present, and stay null when absent). Exercised
 * against the real generated CollectorMapperImpl (no mocks). No prior CollectorMapper unit test.
 *
 * @validates F-020
 */
class CollectorMapperImplTest {

    private CollectorMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new CollectorMapperImpl(new NamespaceMapperImpl(), new TokenMapperImpl(new DateTimeMapperImpl()));
    }

    @Test
    void mapForm_withNamespaceAndToken_setsForeignKeyIds() {
        final CollectorPojo pojo = mapper.mapForm(new CollectorFormData().name("c"),
            new NamespacePojo().setId(5L), new TokenPojo().setId(7L));
        assertThat(pojo.getNamespaceId()).isEqualTo(5L);
        assertThat(pojo.getTokenId()).isEqualTo(7L);
    }

    @Test
    void mapForm_withNullNamespaceAndToken_leavesForeignKeyIdsNull() {
        final CollectorPojo pojo = mapper.mapForm(new CollectorFormData().name("c"), null, null);
        assertThat(pojo.getNamespaceId()).isNull();
        assertThat(pojo.getTokenId()).isNull();
    }
}
