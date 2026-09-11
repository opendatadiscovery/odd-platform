package org.opendatadiscovery.oddplatform.service.search;

import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchHighlight;
import org.opendatadiscovery.oddplatform.dto.term.TermDetailsDto;
import org.opendatadiscovery.oddplatform.dto.term.TermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermOwnershipDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermOwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.ENTITY_FIELD_DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.GROUP_DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.MARK_END;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.MARK_START;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.POLYMORPHIC_FIELD_CAP;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.RECORD_DELIMITER;

/**
 * The Term "why it matched" document and its parse (ST-12 / #1846): name + definition, namespace, tags and
 * ownerships — the five vectors a term is indexed on, each parsed back to its own section only when marked.
 *
 * @validates F-017 (F-017-UC-19)
 */
@ExtendWith(MockitoExtension.class)
class TermHighlightConverterTest {

    @Mock
    private TagMapper tagMapper;

    private TermHighlightConverter converter;

    @BeforeEach
    void setUp() {
        converter = new TermHighlightConverter(tagMapper);
        lenient().when(tagMapper.mapToTag(any(TagPojo.class)))
            .thenAnswer(inv -> new Tag().name(((TagPojo) inv.getArgument(0)).getName()).important(false));
    }

    private static TermDetailsDto details(final Set<TagPojo> tags, final Set<TermOwnershipDto> ownerships) {
        final TermRefDto ref = TermRefDto.builder()
            .term(new TermPojo().setName("Revenue").setDefinition("Money the company earned"))
            .namespace(new NamespacePojo().setName("finance"))
            .build();
        final TermDto term = TermDto.builder().termRefDto(ref).ownerships(ownerships).build();
        return TermDetailsDto.builder().termDto(term).tags(tags).terms(List.of()).build();
    }

    private static TermOwnershipDto ownership(final String owner, final String title) {
        return new TermOwnershipDto(new TermOwnershipPojo(), new OwnerPojo().setName(owner),
            new TitlePojo().setName(title));
    }

    private static String mark(final String word) {
        return MARK_START + word + MARK_END;
    }

    @Test
    void convert_orderIsTermNamespaceTagsOwnerships() {
        final String document = converter.convert(
            details(Set.of(new TagPojo().setName("pii")), Set.of(ownership("bob", "steward"))),
            POLYMORPHIC_FIELD_CAP);

        assertThat(document).isEqualTo(
            "Revenue" + RECORD_DELIMITER + "Money the company earned"
                + ENTITY_FIELD_DELIMITER + "finance"
                + ENTITY_FIELD_DELIMITER + "pii"
                + ENTITY_FIELD_DELIMITER + "bob" + RECORD_DELIMITER + "steward"
                + ENTITY_FIELD_DELIMITER);
    }

    @Test
    void convert_noTagsNoOwners_emitsEmptySections() {
        final String document = converter.convert(details(Set.of(), Set.of()), POLYMORPHIC_FIELD_CAP);

        assertThat(document)
            .endsWith(ENTITY_FIELD_DELIMITER + "" + ENTITY_FIELD_DELIMITER + "" + ENTITY_FIELD_DELIMITER);
    }

    @Test
    void parse_nameOnly() {
        final TermDetailsDto details = details(Set.of(), Set.of());
        final String highlighted = mark("Revenue") + RECORD_DELIMITER + "Money the company earned"
            + ENTITY_FIELD_DELIMITER + "finance" + ENTITY_FIELD_DELIMITER + "" + ENTITY_FIELD_DELIMITER + ""
            + ENTITY_FIELD_DELIMITER;

        final TermSearchHighlight highlight = converter.parse(highlighted, details);

        assertThat(highlight.getName()).isEqualTo(mark("Revenue"));
        assertThat(highlight.getDefinition()).isNull();
        assertThat(highlight.getNamespace()).isNull();
        assertThat(highlight.getTags()).isNull();
        assertThat(highlight.getOwners()).isNull();
    }

    @Test
    void parse_definitionAndNamespace() {
        final TermDetailsDto details = details(Set.of(), Set.of());
        final String highlighted = "Revenue" + RECORD_DELIMITER + "Money the " + mark("company") + " earned"
            + ENTITY_FIELD_DELIMITER + mark("finance") + ENTITY_FIELD_DELIMITER + "" + ENTITY_FIELD_DELIMITER + ""
            + ENTITY_FIELD_DELIMITER;

        final TermSearchHighlight highlight = converter.parse(highlighted, details);

        assertThat(highlight.getName()).isNull();
        assertThat(highlight.getDefinition()).isEqualTo("Money the " + mark("company") + " earned");
        assertThat(highlight.getNamespace().getName()).isEqualTo(mark("finance"));
    }

    @Test
    void parse_tagOnly_mapsTheOriginalTagWithTheMarkedName() {
        final TermDetailsDto details = details(Set.of(new TagPojo().setName("pii"), new TagPojo().setName("gdpr")),
            Set.of());
        final String highlighted = "Revenue" + RECORD_DELIMITER + "def"
            + ENTITY_FIELD_DELIMITER + "finance"
            + ENTITY_FIELD_DELIMITER + "pii" + DELIMITER + mark("gdpr")
            + ENTITY_FIELD_DELIMITER + "" + ENTITY_FIELD_DELIMITER;

        final TermSearchHighlight highlight = converter.parse(highlighted, details);

        assertThat(highlight.getTags()).hasSize(1);
        assertThat(highlight.getTags().get(0).getName()).isEqualTo(mark("gdpr"));
        assertThat(highlight.getName()).isNull();
        assertThat(highlight.getOwners()).isNull();
    }

    /** Normalised-to-normalised: a tag whose name carries a stripped code point still resolves. */
    @Test
    void parse_tagNameCarryingAStrippedCodePoint_stillResolves() {
        final TermDetailsDto details = details(Set.of(new TagPojo().setName("g" + MARK_START + "dpr")), Set.of());
        final String highlighted = "Revenue" + RECORD_DELIMITER + "def"
            + ENTITY_FIELD_DELIMITER + "finance"
            + ENTITY_FIELD_DELIMITER + mark("gdpr")
            + ENTITY_FIELD_DELIMITER + "" + ENTITY_FIELD_DELIMITER;

        final TermSearchHighlight highlight = converter.parse(highlighted, details);

        assertThat(highlight.getTags()).hasSize(1);
    }

    /** A marked tag the term does not carry is skipped, never thrown — a missing chip beats a broken tooltip. */
    @Test
    void parse_unknownMarkedTag_isSkippedNotThrown() {
        final TermDetailsDto details = details(Set.of(new TagPojo().setName("pii")), Set.of());
        final String highlighted = "Revenue" + RECORD_DELIMITER + "def"
            + ENTITY_FIELD_DELIMITER + "finance"
            + ENTITY_FIELD_DELIMITER + mark("ghost")
            + ENTITY_FIELD_DELIMITER + "" + ENTITY_FIELD_DELIMITER;

        final TermSearchHighlight highlight = converter.parse(highlighted, details);

        assertThat(highlight.getTags()).isEmpty();
        verify(tagMapper, never()).mapToTag(any(TagPojo.class));
    }

    @Test
    void parse_ownerTitleOnly_populatesOwnersOnly() {
        final TermDetailsDto details = details(Set.of(), Set.of(ownership("bob", "steward"), ownership("ann", "dev")));
        final String highlighted = "Revenue" + RECORD_DELIMITER + "def"
            + ENTITY_FIELD_DELIMITER + "finance"
            + ENTITY_FIELD_DELIMITER + ""
            + ENTITY_FIELD_DELIMITER + "bob" + RECORD_DELIMITER + mark("steward")
            + GROUP_DELIMITER + "ann" + RECORD_DELIMITER + "dev"
            + ENTITY_FIELD_DELIMITER;

        final TermSearchHighlight highlight = converter.parse(highlighted, details);

        assertThat(highlight.getOwners()).hasSize(1);
        assertThat(highlight.getOwners().get(0).getOwner()).isEqualTo("bob");
        assertThat(highlight.getOwners().get(0).getTitle()).isEqualTo(mark("steward"));
        assertThat(highlight.getName()).isNull();
        assertThat(highlight.getTags()).isNull();
    }

    @Test
    void parse_noMarks_everythingNull() {
        final TermDetailsDto details = details(Set.of(new TagPojo().setName("pii")), Set.of(ownership("bob", "t")));
        final TermSearchHighlight highlight =
            converter.parse(converter.convert(details, POLYMORPHIC_FIELD_CAP), details);

        assertThat(highlight.getName()).isNull();
        assertThat(highlight.getDefinition()).isNull();
        assertThat(highlight.getNamespace()).isNull();
        assertThat(highlight.getTags()).isNull();
        assertThat(highlight.getOwners()).isNull();
    }

    @Test
    void convert_noNamespace_ownershipWithoutTitle_ownershipWithoutOwner_emitsEmptyFieldsNotNulls() {
        final TermRefDto ref = TermRefDto.builder()
            .term(new TermPojo().setName("Revenue").setDefinition("d"))
            .namespace(null)
            .build();
        final TermDto term = TermDto.builder().termRefDto(ref).ownerships(Set.of(
            new TermOwnershipDto(new TermOwnershipPojo(), new OwnerPojo().setName("bob"), null),
            new TermOwnershipDto(new TermOwnershipPojo(), null, new TitlePojo().setName("steward")))).build();
        final TermDetailsDto details = TermDetailsDto.builder().termDto(term).tags(Set.of()).terms(List.of()).build();

        final String[] sections = converter.convert(details, POLYMORPHIC_FIELD_CAP).split(ENTITY_FIELD_DELIMITER, -1);

        assertThat(sections[1]).isEmpty();
        assertThat(sections[3].split(GROUP_DELIMITER, -1))
            .containsExactlyInAnyOrder("bob" + RECORD_DELIMITER, RECORD_DELIMITER + "steward");
        assertThat(sections[3]).doesNotContain("null");
    }

    @Test
    void parse_ownerNameMarked_populatesTheOwnershipWithItsPlainTitle() {
        final TermDetailsDto details = details(Set.of(), Set.of(ownership("bob", "steward")));
        final String highlighted = "Revenue" + RECORD_DELIMITER + "d"
            + ENTITY_FIELD_DELIMITER + "finance"
            + ENTITY_FIELD_DELIMITER + ""
            + ENTITY_FIELD_DELIMITER + mark("bob") + RECORD_DELIMITER + "steward"
            + ENTITY_FIELD_DELIMITER;

        final TermSearchHighlight highlight = converter.parse(highlighted, details);

        assertThat(highlight.getOwners()).hasSize(1);
        assertThat(highlight.getOwners().get(0).getOwner()).isEqualTo(mark("bob"));
        assertThat(highlight.getOwners().get(0).getTitle()).isEqualTo("steward");
    }

    @Test
    void parse_textWithoutAnyDelimiter_readsItAsTheNameAndNothingElse() {
        // the whole string is section 0 / record 0: every later section and field is simply absent, not an error
        final TermDetailsDto details = details(Set.of(), Set.of());

        final TermSearchHighlight highlight = converter.parse(mark("Revenue"), details);

        assertThat(highlight.getName()).isEqualTo(mark("Revenue"));
        assertThat(highlight.getDefinition()).isNull();
        assertThat(highlight.getNamespace()).isNull();
        assertThat(highlight.getTags()).isNull();
        assertThat(highlight.getOwners()).isNull();
    }

    @Test
    void parse_ownershipRecordWithoutATitleField_readsAnEmptyTitle() {
        final TermDetailsDto details = details(Set.of(), Set.of(ownership("bob", "steward")));
        final String highlighted = "Revenue" + RECORD_DELIMITER + "d"
            + ENTITY_FIELD_DELIMITER + ""
            + ENTITY_FIELD_DELIMITER + ""
            + ENTITY_FIELD_DELIMITER + mark("bob")
            + ENTITY_FIELD_DELIMITER;

        final TermSearchHighlight highlight = converter.parse(highlighted, details);

        assertThat(highlight.getOwners()).hasSize(1);
        assertThat(highlight.getOwners().get(0).getOwner()).isEqualTo(mark("bob"));
        assertThat(highlight.getOwners().get(0).getTitle()).isEmpty();
    }
}
