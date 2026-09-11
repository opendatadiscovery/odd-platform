package org.opendatadiscovery.oddplatform.service.search;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntitySearchHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructureHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataField;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataDto;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldValueMapper;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.MARK_END;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.MARK_START;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.POLYMORPHIC_FIELD_CAP;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.UNBOUNDED;

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

    @Test
    void convert_fieldWithSingleQuote_isNotQuoteDoubled() {
        final DataEntityDetailsDto details = DataEntityDetailsDto.detailsBuilder()
            .dataEntity(new DataEntityPojo()
                .setExternalName("O'Brien's orders")
                .setInternalName("")
                .setExternalDescription("")
                .setInternalDescription(""))
            .build();

        final String result = converter.convert(details, emptyStructure());

        // The assembled highlight text is bound as a SQL parameter downstream
        // (ReactiveDataEntityRepository.getHighlightedResult), so searchableString must pass single
        // quotes through verbatim. Doubling them here (the old behaviour) would render the doubled
        // quotes literally in the highlighted output.
        assertThat(result)
            .contains("O'Brien's orders")
            .doesNotContain("O''Brien''s orders");
    }

    // ---- ST-12 (#1846): the round trip over the sections the shallow cases above never touched — tags, owners,
    // metadata (both origins) and the dataset structure with column tags — with the marks the sink now emits, the
    // normalised-to-normalised lookups, and the cap parameter (unbounded on the legacy path, bounded on the new).

    private static String mark(final String word) {
        return MARK_START + word + MARK_END;
    }

    private static DataEntityDetailsDto richDetails() {
        return DataEntityDetailsDto.detailsBuilder()
            .dataEntity(new DataEntityPojo()
                .setExternalName("orders")
                .setInternalName("Orders table")
                .setExternalDescription("y".repeat(20_000))
                .setInternalDescription("internal"))
            .dataSource(new DataSourcePojo().setName("postgres").setOddrn("//pg/orders"))
            .namespace(new NamespacePojo().setName("analytics"))
            .tags(List.of(new TagDto(new TagPojo().setName("pii"), 0L, false),
                new TagDto(new TagPojo().setName("R&D" + MARK_START + "x"), 0L, false)))
            .ownership(List.of(OwnershipDto.builder()
                .owner(new OwnerPojo().setName("bob")).title(new TitlePojo().setName("steward")).build()))
            .metadata(Set.of(
                new MetadataDto(new MetadataFieldPojo().setName("retention").setOrigin("INTERNAL"),
                    new MetadataFieldValuePojo().setValue("30 days")),
                new MetadataDto(new MetadataFieldPojo().setName("engine").setOrigin("EXTERNAL"),
                    new MetadataFieldValuePojo().setValue("postgres"))))
            .build();
    }

    private static DatasetStructureDto richStructure() {
        return DatasetStructureDto.builder().datasetFields(List.of(
            DatasetFieldDto.builder()
                .datasetFieldPojo(new DatasetFieldPojo().setName("customer_id")
                    .setInternalDescription("the customer key").setExternalDescription("fk"))
                .tags(List.of(new TagDto(new TagPojo().setName("key"), 0L, false)))
                .build())).build();
    }

    @Test
    void convert_richEntity_capsOnlyOnThePolymorphicPath_andStripsAForgedMarkFromATagName() {
        final DataEntityDetailsDto details = richDetails();
        final DatasetStructureDto structure = richStructure();

        final String legacy = converter.convert(details, structure);
        final String polymorphic = converter.convert(details, structure, POLYMORPHIC_FIELD_CAP);

        assertThat(legacy).contains("y".repeat(20_000)).contains("R&Dx").doesNotContain(MARK_START);
        assertThat(polymorphic).contains("y".repeat(16_384)).doesNotContain("y".repeat(16_385));
        assertThat(legacy).contains("retention").contains("30 days").contains("engine").contains("postgres")
            .contains("customer_id").contains("the customer key").contains("fk").contains("key")
            .contains("bob").contains("steward");
        assertThat(converter.convert(details, structure, UNBOUNDED)).isEqualTo(legacy);
    }

    @Test
    void parse_marksInEverySection_resolveThroughTheNormalisedLookups() {
        final DataEntityDetailsDto details = richDetails();
        final DatasetStructureDto structure = richStructure();
        when(tagMapper.mapToHighlightedTag(any(TagDto.class), anyString()))
            .thenAnswer(inv -> new Tag().name(inv.getArgument(1)));
        when(metadataMapper.mapHighlightedDto(any(MetadataDto.class), anyString(), anyString()))
            .thenAnswer(inv -> new MetadataFieldValue().value(inv.getArgument(2)));

        // mark one word in every section of the document the converter itself produced
        final String document = converter.convert(details, structure, POLYMORPHIC_FIELD_CAP);
        final String highlighted = document
            .replace("orders", mark("orders"))               // the entity's external name
            .replace("postgres", mark("postgres"))           // the data source name AND the external metadata value
            .replace("analytics", mark("analytics"))         // the namespace
            .replace("R&Dx", mark("R&Dx"))                   // the tag whose name carried a forged mark
            .replace("steward", mark("steward"))             // the owner's title
            .replace("30 days", mark("30 days"))             // the internal metadata value
            .replace("customer_id", mark("customer_id"))     // the column name
            .replace("key", mark("key"));                    // the column's tag ("the customer key" too)

        final DataEntitySearchHighlight h = converter.parseHighlightedString(highlighted, details, structure);

        assertThat(h.getDataEntity().getExternalName()).isEqualTo(mark("orders"));
        assertThat(h.getDataSource().getName()).isEqualTo(mark("postgres"));
        assertThat(h.getNamespace().getName()).isEqualTo(mark("analytics"));
        assertThat(h.getTags()).extracting(Tag::getName).containsExactly(mark("R&Dx"));
        assertThat(h.getOwners()).hasSize(1);
        assertThat(h.getOwners().get(0).getTitle()).isEqualTo(mark("steward"));
        assertThat(h.getMetadata()).extracting(MetadataFieldValue::getValue)
            .containsExactlyInAnyOrder(mark("30 days"), mark("postgres"));
        assertThat(h.getDatasetStructure()).hasSize(1);
        assertThat(h.getDatasetStructure().get(0).getName()).isEqualTo(mark("customer_id"));
        assertThat(h.getDatasetStructure().get(0).getInternalDescription()).isEqualTo("the customer " + mark("key"));
        assertThat(h.getDatasetStructure().get(0).getTags()).extracting(Tag::getName).containsExactly(mark("key"));
    }

    @Test
    void parse_columnMatchedOnlyByItsExternalDescription_isReported() {
        final DataEntityDetailsDto details = richDetails();
        final DatasetStructureDto structure = richStructure();
        final String document = converter.convert(details, structure, POLYMORPHIC_FIELD_CAP);
        // "fk" is the column's EXTERNAL description and appears nowhere else in the document
        final String highlighted = document.replace("fk", mark("fk"));

        final DataEntitySearchHighlight h = converter.parseHighlightedString(highlighted, details, structure);

        assertThat(h.getDatasetStructure()).hasSize(1);
        assertThat(h.getDatasetStructure().get(0).getName()).isEqualTo("customer_id");
        assertThat(h.getDatasetStructure().get(0).getExternalDescription()).isEqualTo(mark("fk"));
        assertThat(h.getDatasetStructure().get(0).getInternalDescription()).isNull();
        assertThat(h.getDatasetStructure().get(0).getTags()).isNull();
        assertThat(h.getDataEntity()).isNull();
    }

    @Test
    void parse_richEntityWithNoMarks_yieldsNoSection() {
        final DataEntityDetailsDto details = richDetails();
        final DatasetStructureDto structure = richStructure();

        final DataEntitySearchHighlight h = converter.parseHighlightedString(
            converter.convert(details, structure, POLYMORPHIC_FIELD_CAP), details, structure);

        assertThat(h.getDataEntity()).isNull();
        assertThat(h.getDataSource()).isNull();
        assertThat(h.getNamespace()).isNull();
        assertThat(h.getTags()).isNull();
        assertThat(h.getOwners()).isNull();
        assertThat(h.getMetadata()).isEmpty();
        assertThat(h.getDatasetStructure()).isNull();
    }

    /** richDetails() plus a second owner and a second INTERNAL metadata entry — records that stay UNMARKED beside
     *  a marked one in the same section, the arm a single-record fixture can never take. */
    private static DataEntityDetailsDto richerDetails() {
        final DataEntityDetailsDto rich = richDetails();
        return DataEntityDetailsDto.detailsBuilder()
            .dataEntity(rich.getDataEntity()).dataSource(rich.getDataSource()).namespace(rich.getNamespace())
            .tags(rich.getTags())
            .ownership(List.of(rich.getOwnership().get(0), OwnershipDto.builder()
                .owner(new OwnerPojo().setName("ann")).title(new TitlePojo().setName("dev")).build()))
            .metadata(Stream.concat(rich.getMetadata().stream(), Stream.of(
                new MetadataDto(new MetadataFieldPojo().setName("owner_team").setOrigin("INTERNAL"),
                    new MetadataFieldValuePojo().setValue("data")))).collect(Collectors.toSet()))
            .build();
    }

    @Test
    void parse_dataSourceNameMarked_oddrnNot_reportsTheNameOnly() {
        final DataEntityDetailsDto details = richDetails();
        final DatasetStructureDto structure = emptyStructure();
        when(metadataMapper.mapHighlightedDto(any(MetadataDto.class), anyString(), anyString()))
            .thenAnswer(inv -> new MetadataFieldValue().value(inv.getArgument(2)));
        // "postgres" is the data source's name (and an external metadata value); the ODDRN "//pg/orders" stays plain
        final String highlighted = converter.convert(details, structure, POLYMORPHIC_FIELD_CAP)
            .replace("postgres", mark("postgres"));

        final DataEntitySearchHighlight h = converter.parseHighlightedString(highlighted, details, structure);

        assertThat(h.getDataSource().getName()).isEqualTo(mark("postgres"));
        assertThat(h.getDataSource().getOddrn()).isNull();
    }

    @Test
    void parse_theOtherArms_internalNameDescription_oddrn_ownerName_metadataName_columnByDescriptionOrTag() {
        final DataEntityDetailsDto details = richerDetails();
        final DatasetStructureDto structure = DatasetStructureDto.builder().datasetFields(List.of(
            DatasetFieldDto.builder()
                .datasetFieldPojo(new DatasetFieldPojo().setName("customer_id")
                    .setInternalDescription("the customer key").setExternalDescription("fk"))
                .tags(List.of(new TagDto(new TagPojo().setName("key"), 0L, false),
                    new TagDto(new TagPojo().setName("plain"), 0L, false)))
                .build(),
            DatasetFieldDto.builder()
                .datasetFieldPojo(new DatasetFieldPojo().setName("amount").setInternalDescription("gross amount"))
                .tags(List.of())
                .build(),
            DatasetFieldDto.builder()   // nothing of this column matches: it must not be reported
                .datasetFieldPojo(new DatasetFieldPojo().setName("created_at"))
                .tags(List.of())
                .build())).build();
        when(tagMapper.mapToHighlightedTag(any(TagDto.class), anyString()))
            .thenAnswer(inv -> new Tag().name(inv.getArgument(1)));
        when(metadataMapper.mapHighlightedDto(any(MetadataDto.class), anyString(), anyString()))
            .thenAnswer(inv -> new MetadataFieldValue()
                .field(new MetadataField().name(inv.getArgument(1))).value(inv.getArgument(2)));

        final String document = converter.convert(details, structure, POLYMORPHIC_FIELD_CAP);
        final String highlighted = document
            .replace("Orders table", mark("Orders") + " table")     // the entity's INTERNAL name
            .replace("internal", mark("internal"))                  // the entity's INTERNAL description
            .replace("//pg/orders", "//" + mark("pg") + "/orders")  // the data source's ODDRN, its name untouched
            .replace("bob", mark("bob"))                            // the owner's NAME, the title untouched
            .replace("retention", mark("retention"))                // a metadata field NAME, its value untouched
            .replace("gross amount", mark("gross") + " amount")     // a column matched ONLY by its internal description
            .replace("plain", mark("plain"));                       // a column matched ONLY by one of its two tags

        final DataEntitySearchHighlight h = converter.parseHighlightedString(highlighted, details, structure);

        assertThat(h.getDataEntity().getExternalName()).isNull();
        assertThat(h.getDataEntity().getInternalName()).isEqualTo(mark("Orders") + " table");
        assertThat(h.getDataEntity().getInternalDescription()).isEqualTo(mark("internal"));
        assertThat(h.getDataSource().getName()).isNull();
        assertThat(h.getDataSource().getOddrn()).isEqualTo("//" + mark("pg") + "/orders");
        assertThat(h.getNamespace()).isNull();
        assertThat(h.getOwners()).hasSize(1); // ann/dev is in the marked section but carries no mark: not reported
        assertThat(h.getOwners().get(0).getOwner()).isEqualTo(mark("bob"));
        assertThat(h.getOwners().get(0).getTitle()).isEqualTo("steward");
        assertThat(h.getMetadata()).hasSize(1); // owner_team/data shares the INTERNAL section, unmarked: not reported
        assertThat(h.getMetadata().get(0).getField().getName()).isEqualTo(mark("retention"));
        assertThat(h.getMetadata().get(0).getValue()).isEqualTo("30 days");
        assertThat(h.getDatasetStructure()).extracting(DataSetStructureHighlight::getName)
            .containsExactly("customer_id", "amount"); // created_at is not reported
        assertThat(h.getDatasetStructure().get(0).getInternalDescription()).isNull();
        assertThat(h.getDatasetStructure().get(0).getExternalDescription()).isNull();
        assertThat(h.getDatasetStructure().get(0).getTags()).extracting(Tag::getName).containsExactly(mark("plain"));
        assertThat(h.getDatasetStructure().get(1).getInternalDescription()).isEqualTo(mark("gross") + " amount");
        assertThat(h.getDatasetStructure().get(1).getTags()).isNull();
    }
}
