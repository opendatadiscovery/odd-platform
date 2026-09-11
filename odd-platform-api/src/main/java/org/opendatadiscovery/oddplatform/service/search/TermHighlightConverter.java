package org.opendatadiscovery.oddplatform.service.search;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchHighlight;
import org.opendatadiscovery.oddplatform.dto.term.TermDetailsDto;
import org.opendatadiscovery.oddplatform.dto.term.TermOwnershipDto;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.ENTITY_FIELD_DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.GROUP_DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.RECORD_DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.UNBOUNDED;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.field;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.isMarked;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.stripMarks;

/**
 * The Term half of the per-kind "why it matched" (ST-12 / #1846): the document is exactly the fields a Term is
 * indexed on — name + definition ({@code term_vector}), the namespace name ({@code namespace_vector}), the tag
 * names ({@code tag_vector}) and each ownership's owner + title ({@code owner_vector}) — so every way a Term can
 * match has a section. Same wire shape as {@link DataEntityHighlightConverter} ({@link SearchHighlightDocument}).
 *
 * <p>Document: {@code name ␞ definition ␜ namespace ␜ tag₁ ␟ tag₂ ␜ owner₁ ␞ title₁ ␝ owner₂ ␞ title₂ ␜}
 */
@Component
@RequiredArgsConstructor
public class TermHighlightConverter {
    private final TagMapper tagMapper;

    public String convert(final TermDetailsDto details, final int fieldCap) {
        final TermPojo term = details.getTermDto().getTermRefDto().getTerm();
        final NamespacePojo namespace = details.getTermDto().getTermRefDto().getNamespace();
        final String termFields = String.join(RECORD_DELIMITER,
            field(term.getName(), fieldCap), field(term.getDefinition(), fieldCap));
        final String namespaceField = namespace == null ? "" : field(namespace.getName(), fieldCap);
        final String tagFields = CollectionUtils.isEmpty(details.getTags()) ? ""
            : details.getTags().stream()
                .map(t -> field(t.getName(), fieldCap))
                .collect(Collectors.joining(DELIMITER));
        final Collection<TermOwnershipDto> ownerships = details.getTermDto().getOwnerships();
        final String ownershipFields = CollectionUtils.isEmpty(ownerships) ? ""
            : ownerships.stream()
                .map(o -> String.join(RECORD_DELIMITER,
                    field(o.owner() == null ? null : o.owner().getName(), fieldCap),
                    field(o.title() == null ? null : o.title().getName(), fieldCap)))
                .collect(Collectors.joining(GROUP_DELIMITER));
        return String.join(ENTITY_FIELD_DELIMITER, termFields, namespaceField, tagFields, ownershipFields)
            + ENTITY_FIELD_DELIMITER;
    }

    /** Only the sections that carry a mark are populated; everything else stays null. */
    public TermSearchHighlight parse(final String highlighted, final TermDetailsDto details) {
        final String[] sections = highlighted.split(ENTITY_FIELD_DELIMITER, -1);
        final TermSearchHighlight highlight = new TermSearchHighlight();
        final String[] termFields = sections[0].split(RECORD_DELIMITER, -1);
        if (termFields.length > 0 && isMarked(termFields[0])) {
            highlight.setName(termFields[0]);
        }
        if (termFields.length > 1 && isMarked(termFields[1])) {
            highlight.setDefinition(termFields[1]);
        }
        if (sections.length > 1 && isMarked(sections[1])) {
            highlight.setNamespace(new NamespaceHighlight().name(sections[1]));
        }
        if (sections.length > 2 && isMarked(sections[2])) {
            highlight.setTags(parseTags(sections[2], details.getTags()));
        }
        if (sections.length > 3 && isMarked(sections[3])) {
            highlight.setOwners(parseOwnerships(sections[3]));
        }
        return highlight;
    }

    private List<Tag> parseTags(final String taggedSection, final Collection<TagPojo> originalTags) {
        final List<Tag> tags = new ArrayList<>();
        for (final String rawTag : taggedSection.split(DELIMITER, -1)) {
            if (!isMarked(rawTag)) {
                continue;
            }
            // Normalised-to-normalised: the parsed name went through field(), so the original is compared the
            // same way (a tag name carrying a stripped code point still resolves). A miss is skipped, never
            // thrown - a missing tag chip beats a broken tooltip.
            final String name = stripMarks(rawTag);
            originalTags.stream()
                .filter(t -> field(t.getName(), UNBOUNDED).equals(name))
                .findFirst()
                .ifPresent(pojo -> {
                    final Tag tag = tagMapper.mapToTag(pojo);
                    tag.setName(rawTag);
                    tags.add(tag);
                });
        }
        return tags;
    }

    private static List<OwnershipHighlight> parseOwnerships(final String ownershipSection) {
        final List<OwnershipHighlight> owners = new ArrayList<>();
        for (final String ownership : ownershipSection.split(GROUP_DELIMITER, -1)) {
            final String[] fields = ownership.split(RECORD_DELIMITER, -1);
            final String owner = fields.length > 0 ? fields[0] : "";
            final String title = fields.length > 1 ? fields[1] : "";
            if (isMarked(owner) || isMarked(title)) {
                owners.add(new OwnershipHighlight().owner(owner).title(title));
            }
        }
        return owners;
    }
}
