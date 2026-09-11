package org.opendatadiscovery.oddplatform.service.search;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleSearchHighlight;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.ENTITY_FIELD_DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.GROUP_DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.MARK_END;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.MARK_START;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.POLYMORPHIC_FIELD_CAP;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.RECORD_DELIMITER;

/**
 * The Query Example "why it matched" document and its parse (ST-12 / #1846): definition + query text + the linked
 * data entities' names — the three things a query example is indexed on.
 *
 * @validates F-017 (F-017-UC-19)
 */
class QueryExampleHighlightConverterTest {
    private final QueryExampleHighlightConverter converter = new QueryExampleHighlightConverter();

    private static QueryExampleDto dto(final String definition, final String query,
                                       final DataEntityPojo... linked) {
        return new QueryExampleDto(new QueryExamplePojo().setDefinition(definition).setQuery(query),
            List.of(linked), List.of());
    }

    private static String mark(final String word) {
        return MARK_START + word + MARK_END;
    }

    @Test
    void convert_orderIsDefinitionQueryThenLinkedEntities() {
        final String document = converter.convert(
            dto("orders by day", "select * from orders where a<b",
                new DataEntityPojo().setExternalName("orders").setInternalName("Orders table"),
                new DataEntityPojo().setExternalName("customers")),
            POLYMORPHIC_FIELD_CAP);

        assertThat(document).isEqualTo(
            "orders by day" + RECORD_DELIMITER + "select * from orders where a<b"
                + ENTITY_FIELD_DELIMITER
                + "orders" + RECORD_DELIMITER + "Orders table"
                + GROUP_DELIMITER
                + "customers" + RECORD_DELIMITER + ""
                + ENTITY_FIELD_DELIMITER);
    }

    @Test
    void convert_capsTheQueryText() {
        final String longSql = "select 1 -- " + "x".repeat(20_000);
        final String document = converter.convert(dto("d", longSql), POLYMORPHIC_FIELD_CAP);
        final String queryField = document.split(ENTITY_FIELD_DELIMITER, -1)[0].split(RECORD_DELIMITER, -1)[1];
        assertThat(queryField).hasSize(16_384);
    }

    @Test
    void parse_marksInDefinitionAndQuery_populateOnlyThose() {
        final String highlighted = "orders by " + mark("day") + RECORD_DELIMITER + "select " + mark("day") + " from t"
            + ENTITY_FIELD_DELIMITER + "orders" + RECORD_DELIMITER + "" + ENTITY_FIELD_DELIMITER;

        final QueryExampleSearchHighlight highlight = converter.parse(highlighted);

        assertThat(highlight.getDefinition()).isEqualTo("orders by " + mark("day"));
        assertThat(highlight.getQuery()).isEqualTo("select " + mark("day") + " from t");
        assertThat(highlight.getLinkedEntities()).isNull();
    }

    @Test
    void parse_markOnlyInALinkedEntityName_populatesLinkedEntitiesOnly() {
        final String highlighted = "orders by day" + RECORD_DELIMITER + "select 1"
            + ENTITY_FIELD_DELIMITER
            + mark("orders") + RECORD_DELIMITER + "Orders table"
            + GROUP_DELIMITER + "customers" + RECORD_DELIMITER + mark("Customers") + " table"
            + ENTITY_FIELD_DELIMITER;

        final QueryExampleSearchHighlight highlight = converter.parse(highlighted);

        assertThat(highlight.getDefinition()).isNull();
        assertThat(highlight.getQuery()).isNull();
        assertThat(highlight.getLinkedEntities()).hasSize(2);
        assertThat(highlight.getLinkedEntities().get(0).getExternalName()).isEqualTo(mark("orders"));
        assertThat(highlight.getLinkedEntities().get(0).getInternalName()).isNull();
        assertThat(highlight.getLinkedEntities().get(1).getExternalName()).isNull();
        assertThat(highlight.getLinkedEntities().get(1).getInternalName()).isEqualTo(mark("Customers") + " table");
    }

    @Test
    void parse_noMarks_everythingNull() {
        final QueryExampleSearchHighlight highlight =
            converter.parse(converter.convert(dto("d", "q", new DataEntityPojo().setExternalName("e")),
                POLYMORPHIC_FIELD_CAP));

        assertThat(highlight.getDefinition()).isNull();
        assertThat(highlight.getQuery()).isNull();
        assertThat(highlight.getLinkedEntities()).isNull();
    }
}
