package org.opendatadiscovery.oddplatform.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure-logic unit test for the hand-written DataSourceMapper default methods — validates F-031 (Data
 * Source Lifecycle Management): mapForm TRIMS the oddrn (a leading/trailing-whitespace oddrn would
 * otherwise become a distinct, unmatchable identifier), and sets the namespace/token foreign-key ids
 * null-safely. Exercised against the real generated DataSourceMapperImpl (no mocks). No prior
 * DataSourceMapper unit test.
 *
 * @validates F-031
 */
class DataSourceMapperImplTest {

    private DataSourceMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new DataSourceMapperImpl(new NamespaceMapperImpl(), new TokenMapperImpl(new DateTimeMapperImpl()));
    }

    @Test
    void mapForm_trimsOddrnWhitespace() {
        final DataSourcePojo pojo = mapper.mapForm(new DataSourceFormData().name("ds").oddrn("  //src/x  "));
        assertThat(pojo.getOddrn()).isEqualTo("//src/x");
    }

    @Test
    void mapForm_withNamespace_setsNamespaceIdAndNullTokenWhenTokenAbsent() {
        final DataSourcePojo pojo = mapper.mapForm(new DataSourceFormData().name("ds").oddrn("//src/x"),
            new NamespacePojo().setId(5L), null);
        assertThat(pojo.getNamespaceId()).isEqualTo(5L);
        assertThat(pojo.getTokenId()).isNull();
    }

    @Test
    void mapForm_withNulls_leavesForeignKeyIdsNull() {
        final DataSourcePojo pojo = mapper.mapForm(new DataSourceFormData().name("ds").oddrn("//src/x"), null, null);
        assertThat(pojo.getNamespaceId()).isNull();
        assertThat(pojo.getTokenId()).isNull();
    }
}
