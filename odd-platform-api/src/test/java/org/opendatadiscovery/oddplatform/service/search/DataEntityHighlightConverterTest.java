package org.opendatadiscovery.oddplatform.service.search;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntitySearchHighlight;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldValueMapper;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL unit test for search-result highlight serialisation — validates F-017 (the search flow):
 * DataEntityHighlightConverter is SearchServiceImpl's collaborator that flattens a data entity's searchable
 * fields into the delimited string Postgres ts_headline highlights, then parses the highlighted string back.
 * convert() concatenates the searchable fields (entity names/descriptions, data source, namespace, tags);
 * parseHighlightedString() round-trips a NON-highlighted string to an empty highlight (no bold-highlight
 * markers → no per-field highlight produced, and the tag/metadata mappers are never consulted here). No prior
 * DataEntityHighlightConverter unit test.
 *
 * @validates F-017
 */
@ExtendWith(MockitoExtension.class)
class DataEntityHighlightConverterTest {

    @Mock private TagMapper tagMapper;
    @Mock private MetadataFieldValueMapper metadataMapper;

    private DataEntityHighlightConverter converter;

    @BeforeEach
    void setUp() {
        converter = new DataEntityHighlightConverter(tagMapper, metadataMapper);
    }

    private static DataEntityDetailsDto details() {
        return DataEntityDetailsDto.detailsBuilder()
            .dataEntity(new DataEntityPojo()
                .setExternalName("orders")
                .setInternalName("orders_internal")
                .setExternalDescription("external description")
                .setInternalDescription("internal description"))
            .dataSource(new DataSourcePojo().setName("postgres").setOddrn("//pg/orders"))
            .namespace(new NamespacePojo().setName("analytics"))
            .tags(List.of(new TagDto(new TagPojo().setName("pii"), 0L, false)))
            .build();
    }

    private static DatasetStructureDto emptyStructure() {
        return DatasetStructureDto.builder().datasetFields(List.of()).build();
    }

    @Test
    void convert_populatedEntity_concatenatesSearchableFields() {
        final String result = converter.convert(details(), emptyStructure());

        assertThat(result)
            .contains("orders")
            .contains("postgres")
            .contains("analytics")
            .contains("pii");
    }

    @Test
    void parseHighlightedString_noHighlightMarkers_returnsEmptyHighlight() {
        final DataEntityDetailsDto details = details();
        final DatasetStructureDto structure = emptyStructure();
        final String plain = converter.convert(details, structure); // no <b> highlight markers present

        final DataEntitySearchHighlight highlight = converter.parseHighlightedString(plain, details, structure);

        assertThat(highlight).isNotNull();
        // nothing was highlighted, so the per-field data-entity highlight is absent
        assertThat(highlight.getDataEntity()).isNull();
    }
}
