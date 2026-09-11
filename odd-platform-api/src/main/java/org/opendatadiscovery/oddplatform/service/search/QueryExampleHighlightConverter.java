package org.opendatadiscovery.oddplatform.service.search;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleSearchHighlight;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.ENTITY_FIELD_DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.GROUP_DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.RECORD_DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.field;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.isMarked;

/**
 * The Query Example half of the per-kind "why it matched" (ST-12 / #1846): the document is exactly the fields a
 * Query Example is indexed on — its definition + its query text ({@code query_example_vector}) and the external +
 * internal names of its linked data entities ({@code data_entity_vector}). Same wire shape as the other converters
 * ({@link SearchHighlightDocument}); the query text is the field the per-field cap exists for.
 *
 * <p>Document: {@code definition ␞ query ␜ external₁ ␞ internal₁ ␝ external₂ ␞ internal₂ ␜}
 */
@Component
public class QueryExampleHighlightConverter {

    public String convert(final QueryExampleDto dto, final int fieldCap) {
        final QueryExamplePojo pojo = dto.queryExamplePojo();
        final String ownFields = String.join(RECORD_DELIMITER,
            field(pojo.getDefinition(), fieldCap), field(pojo.getQuery(), fieldCap));
        final String linkedEntities = CollectionUtils.isEmpty(dto.linkedEntities()) ? ""
            : dto.linkedEntities().stream()
                .map(e -> String.join(RECORD_DELIMITER,
                    field(e.getExternalName(), fieldCap), field(e.getInternalName(), fieldCap)))
                .collect(Collectors.joining(GROUP_DELIMITER));
        return String.join(ENTITY_FIELD_DELIMITER, ownFields, linkedEntities) + ENTITY_FIELD_DELIMITER;
    }

    /** Only the sections that carry a mark are populated; everything else stays null. */
    public QueryExampleSearchHighlight parse(final String highlighted) {
        final String[] sections = highlighted.split(ENTITY_FIELD_DELIMITER, -1);
        final QueryExampleSearchHighlight highlight = new QueryExampleSearchHighlight();
        final String[] ownFields = sections[0].split(RECORD_DELIMITER, -1);
        if (ownFields.length > 0 && isMarked(ownFields[0])) {
            highlight.setDefinition(ownFields[0]);
        }
        if (ownFields.length > 1 && isMarked(ownFields[1])) {
            highlight.setQuery(ownFields[1]);
        }
        if (sections.length > 1 && isMarked(sections[1])) {
            final List<DataEntityHighlight> linked = new ArrayList<>();
            for (final String entity : sections[1].split(GROUP_DELIMITER, -1)) {
                final String[] names = entity.split(RECORD_DELIMITER, -1);
                final String external = names.length > 0 ? names[0] : "";
                final String internal = names.length > 1 ? names[1] : "";
                if (isMarked(external) || isMarked(internal)) {
                    final DataEntityHighlight entityHighlight = new DataEntityHighlight();
                    if (isMarked(external)) {
                        entityHighlight.setExternalName(external);
                    }
                    if (isMarked(internal)) {
                        entityHighlight.setInternalName(internal);
                    }
                    linked.add(entityHighlight);
                }
            }
            highlight.setLinkedEntities(linked);
        }
        return highlight;
    }
}
