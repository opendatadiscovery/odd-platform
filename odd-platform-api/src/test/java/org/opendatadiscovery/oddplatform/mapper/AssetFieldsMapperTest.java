package org.opendatadiscovery.oddplatform.mapper;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetFields;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceSafe;
import org.opendatadiscovery.oddplatform.api.contract.model.Ownership;
import org.opendatadiscovery.oddplatform.dto.AssetFieldDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.dto.attributes.DataConsumerAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataEntityAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataInputAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataQualityTestAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataSetAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataTransformerAttributes;
import org.opendatadiscovery.oddplatform.dto.term.TermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.mapper.AssetFieldsMapper.DataEntityExtras;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * ST-13a (#1847): the per-row projection follows two rules — a property is set ONLY when its column was requested
 * AND the row's kind / data-entity class carries the value; and every value comes from what the resolver already
 * loaded (the dimensions row, the batched term read, the per-page extras). Namespace / tag / date mapping runs
 * through the real MapStruct mappers; the composed ones (datasource, ownership, the ref) are mocked.
 */
@ExtendWith(MockitoExtension.class)
class AssetFieldsMapperTest {

    @Mock private DataSourceSafeMapper dataSourceSafeMapper;
    @Mock private OwnershipMapper ownershipMapper;
    @Mock private DataEntityMapper dataEntityMapper;

    private AssetFieldsMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new AssetFieldsMapper(new NamespaceMapperImpl(), dataSourceSafeMapper, ownershipMapper,
            new TagMapperImpl(), new DateTimeMapper() { }, dataEntityMapper);
    }

    @Test
    void forDataEntity_setsOnlyRequestedProperties() {
        final DataEntityDimensionsDto dto = dataset();
        final AssetFields fields = mapper.forDataEntity(dto, EnumSet.of(AssetFieldDto.NAMESPACE),
            DataEntityExtras.NONE);
        assertThat(fields.getNamespace()).isNotNull();
        assertThat(fields.getNamespace().getName()).isEqualTo("ns");
        // Everything else was NOT requested and stays absent — even though the row carries it.
        assertThat(fields.getUpdatedAt()).isNull();
        assertThat(fields.getCreatedAt()).isNull();
        assertThat(fields.getViewCount()).isNull();
        assertThat(fields.getRowsCount()).isNull();
        assertThat(fields.getDescription()).isNull();
        assertThat(fields.getOwners()).isNull();
        verifyNoInteractions(ownershipMapper, dataSourceSafeMapper);
    }

    @Test
    void forDataEntity_zeroCostValues_comeFromTheDimensionsRow() {
        final DataEntityDimensionsDto dto = dataset();
        when(ownershipMapper.mapDtos(anyList())).thenReturn(List.of(new Ownership().id(1L)));
        when(dataSourceSafeMapper.mapDto(any())).thenReturn(new DataSourceSafe().name("src"));

        final AssetFields fields = mapper.forDataEntity(dto, EnumSet.of(AssetFieldDto.OWNERS,
            AssetFieldDto.DATASOURCE, AssetFieldDto.CREATED_AT, AssetFieldDto.UPDATED_AT,
            AssetFieldDto.LAST_INGESTED_AT, AssetFieldDto.POPULARITY, AssetFieldDto.ROWS_COUNT,
            AssetFieldDto.FIELDS_COUNT, AssetFieldDto.DESCRIPTION), DataEntityExtras.NONE);

        assertThat(fields.getOwners()).hasSize(1);
        assertThat(fields.getDataSource().getName()).isEqualTo("src");
        assertThat(fields.getCreatedAt()).isNotNull();
        assertThat(fields.getUpdatedAt()).isNotNull();
        assertThat(fields.getLastIngestedAt()).isNull(); // the row has none -> "no value", not an error
        assertThat(fields.getViewCount()).isEqualTo(42L);
        assertThat(fields.getRowsCount()).isEqualTo(123456L);
        assertThat(fields.getFieldsCount()).isEqualTo(17L);
        assertThat(fields.getDescription()).as("platform-authored text first").isEqualTo("internal");
    }

    @Test
    void forDataEntity_description_fallsBackToTheSourceText_whenNoneWasWritten() {
        final DataEntityDimensionsDto dto = dataset();
        dto.getDataEntity().setInternalDescription("  ");
        assertThat(mapper.forDataEntity(dto, EnumSet.of(AssetFieldDto.DESCRIPTION), DataEntityExtras.NONE)
            .getDescription()).isEqualTo("external");
        dto.getDataEntity().setExternalDescription(null);
        assertThat(mapper.forDataEntity(dto, EnumSet.of(AssetFieldDto.DESCRIPTION), DataEntityExtras.NONE)
            .getDescription()).isNull();
    }

    @Test
    void forDataEntity_classSpecificValues_onlyForTheirClass() {
        final DataEntityDimensionsDto dataset = dataset();
        final Set<AssetFieldDto> classColumns = EnumSet.of(AssetFieldDto.ROWS_COUNT, AssetFieldDto.SUITE_URL,
            AssetFieldDto.SOURCES, AssetFieldDto.CONSUMERS_COUNT, AssetFieldDto.ENTITIES_COUNT);
        final DataEntityExtras extras = new DataEntityExtras(Map.of(), Map.of(),
            Map.of("//a", new DataEntityPojo().setOddrn("//a")), Map.of("//ds", 5L), Map.of("//grp", 2L),
            Map.of("//grp", 1L));
        final AssetFields datasetFields = mapper.forDataEntity(dataset, classColumns, extras);
        assertThat(datasetFields.getRowsCount()).isEqualTo(123456L);
        assertThat(datasetFields.getConsumersCount()).isEqualTo(5L);
        assertThat(datasetFields.getSuiteUrl()).as("a dataset has no suite").isNull();
        assertThat(datasetFields.getSources()).as("a dataset has no sources").isNull();
        assertThat(datasetFields.getEntitiesCount()).as("a dataset is not a group").isNull();

        final DataQualityTestAttributes dqta = new DataQualityTestAttributes();
        dqta.setSuiteUrl("https://suite");
        final DataEntityDimensionsDto test = entity(2L, "//qt", DataEntityClassDto.DATA_QUALITY_TEST,
            Map.of(DataEntityClassDto.DATA_QUALITY_TEST, dqta));
        final AssetFields testFields = mapper.forDataEntity(test, classColumns, extras);
        assertThat(testFields.getSuiteUrl()).isEqualTo("https://suite");
        assertThat(testFields.getRowsCount()).isNull();
        assertThat(testFields.getConsumersCount()).isNull();

        final DataTransformerAttributes dta = new DataTransformerAttributes();
        dta.setSourceOddrnList(Set.of("//a", "//missing"));
        final DataEntityDimensionsDto job = entity(3L, "//job", DataEntityClassDto.DATA_TRANSFORMER,
            Map.of(DataEntityClassDto.DATA_TRANSFORMER, dta));
        when(dataEntityMapper.mapRef(any(DataEntityPojo.class))).thenReturn(new DataEntityRef().id(9L));
        final AssetFields jobFields = mapper.forDataEntity(job, classColumns, extras);
        assertThat(jobFields.getSources()).as("a lineage oddrn the page could not load is skipped").hasSize(1);
        assertThat(jobFields.getTargets()).as("no target oddrns -> absent, not an empty list").isNull();

        final DataEntityDimensionsDto group = entity(4L, "//grp", DataEntityClassDto.DATA_ENTITY_GROUP, Map.of());
        assertThat(mapper.forDataEntity(group, classColumns, extras).getEntitiesCount())
            .as("direct members + child groups").isEqualTo(3L);
    }

    @Test
    void forDataEntity_batchedExtras_tagsAndGroups_onlyWhenRequestedAndPresent() {
        final DataEntityDimensionsDto dto = dataset();
        final DataEntityExtras extras = new DataEntityExtras(
            Map.of("//ds", Set.of(new DataEntityPojo().setOddrn("//grp"))),
            Map.of(1L, List.of(new TagPojo().setId(3L).setName("t"))), Map.of(), Map.of(), Map.of(), Map.of());
        when(dataEntityMapper.mapRef(any(DataEntityPojo.class))).thenReturn(new DataEntityRef().id(9L));

        final AssetFields fields = mapper.forDataEntity(dto, EnumSet.of(AssetFieldDto.TAGS, AssetFieldDto.GROUPS),
            extras);
        assertThat(fields.getTags()).extracting("name").containsExactly("t");
        assertThat(fields.getGroups()).hasSize(1);

        final AssetFields unrequested = mapper.forDataEntity(dto, EnumSet.of(AssetFieldDto.NAMESPACE), extras);
        assertThat(unrequested.getTags()).isNull();
        assertThat(unrequested.getGroups()).isNull();
    }

    @Test
    void forDataEntity_lineageLists_perClass_andAbsentWhenEmptyOrUnresolved() {
        final Set<AssetFieldDto> lineage = EnumSet.of(AssetFieldDto.SOURCES, AssetFieldDto.TARGETS,
            AssetFieldDto.INPUTS, AssetFieldDto.OUTPUTS);
        final DataEntityExtras extras = new DataEntityExtras(Map.of(), Map.of(),
            Map.of("//a", new DataEntityPojo().setOddrn("//a")), Map.of(), Map.of(), Map.of());
        when(dataEntityMapper.mapRef(any(DataEntityPojo.class))).thenReturn(new DataEntityRef().id(9L));

        // a transformer: sources AND targets, each de-duplicated; an unresolved-only list is absent
        final DataTransformerAttributes dta = new DataTransformerAttributes();
        dta.setSourceOddrnList(Set.of("//a"));
        dta.setTargetOddrnList(Set.of("//missing"));
        final AssetFields job = mapper.forDataEntity(
            entity(3L, "//job", DataEntityClassDto.DATA_TRANSFORMER, Map.of(DataEntityClassDto.DATA_TRANSFORMER, dta)),
            lineage, extras);
        assertThat(job.getSources()).hasSize(1);
        assertThat(job.getTargets()).as("every target oddrn unresolved -> absent").isNull();
        assertThat(job.getInputs()).isNull();
        assertThat(job.getOutputs()).isNull();

        // a consumer: inputs only; an input: outputs only
        final DataConsumerAttributes dca = new DataConsumerAttributes();
        dca.setInputListOddrn(Set.of("//a"));
        final AssetFields consumer = mapper.forDataEntity(
            entity(5L, "//c", DataEntityClassDto.DATA_CONSUMER, Map.of(DataEntityClassDto.DATA_CONSUMER, dca)),
            lineage, extras);
        assertThat(consumer.getInputs()).hasSize(1);
        assertThat(consumer.getSources()).isNull();
        final DataInputAttributes dia = new DataInputAttributes();
        dia.setOutputListOddrn(Set.of("//a"));
        final AssetFields input = mapper.forDataEntity(
            entity(6L, "//i", DataEntityClassDto.DATA_INPUT, Map.of(DataEntityClassDto.DATA_INPUT, dia)),
            lineage, extras);
        assertThat(input.getOutputs()).hasSize(1);
        assertThat(input.getInputs()).isNull();

        // the class without its attributes row (a hollow entity): the column applies but there is no value
        for (final DataEntityClassDto cls : List.of(DataEntityClassDto.DATA_TRANSFORMER,
            DataEntityClassDto.DATA_CONSUMER, DataEntityClassDto.DATA_INPUT, DataEntityClassDto.DATA_QUALITY_TEST,
            DataEntityClassDto.DATA_SET)) {
            final AssetFields hollow = mapper.forDataEntity(entity(7L, "//h", cls, Map.of()),
                EnumSet.allOf(AssetFieldDto.class), extras);
            assertThat(hollow.getSources()).isNull();
            assertThat(hollow.getInputs()).isNull();
            assertThat(hollow.getOutputs()).isNull();
            assertThat(hollow.getSuiteUrl()).isNull();
            assertThat(hollow.getRowsCount()).isNull();
        }
        // an empty oddrn list is absent too (never an empty list)
        dta.setSourceOddrnList(Set.of());
        assertThat(mapper.forDataEntity(
            entity(3L, "//job", DataEntityClassDto.DATA_TRANSFORMER, Map.of(DataEntityClassDto.DATA_TRANSFORMER, dta)),
            lineage, extras).getSources()).isNull();
    }

    @Test
    void forDataEntity_andForTerm_withNothingToShow_projectNothing() {
        // a row with no namespace, no datasource, no owners, no tags, no groups, no attributes, every column on
        final DataEntityPojo pojo = new DataEntityPojo().setId(8L).setOddrn("//bare")
            .setEntityClassIds(new Integer[] {DataEntityClassDto.DATA_SET.getId()}).setStatus((short) 1);
        final DataEntityDimensionsDto bare = DataEntityDimensionsDto.dimensionsBuilder()
            .dataEntity(pojo).hasAlerts(false).specificAttributes(null).ownership(List.of()).build();
        final DataEntityExtras extras = new DataEntityExtras(Map.of("//bare", Set.of()), Map.of(8L, List.of()),
            Map.of(), Map.of(), Map.of(), Map.of());
        final AssetFields fields = mapper.forDataEntity(bare, EnumSet.allOf(AssetFieldDto.class), extras);
        assertThat(fields.getNamespace()).isNull();
        assertThat(fields.getDataSource()).isNull();
        assertThat(fields.getOwners()).isNull();
        assertThat(fields.getTags()).as("an empty tag list is absent").isNull();
        assertThat(fields.getGroups()).as("an empty group set is absent").isNull();
        assertThat(fields.getDescription()).as("no text anywhere -> absent").isNull();
        assertThat(fields.getRowsCount()).isNull();
        assertThat(fields.getConsumersCount()).as("a dataset nobody consumes reads 0, not absent").isEqualTo(0L);

        final TermDto term = TermDto.builder()
            .termRefDto(TermRefDto.builder().term(new TermPojo().setId(9L).setDefinition(" ")).namespace(null).build())
            .ownerships(null)
            .build();
        final AssetFields termFields = mapper.forTerm(term, EnumSet.allOf(AssetFieldDto.class), List.of());
        assertThat(termFields.getNamespace()).isNull();
        assertThat(termFields.getOwners()).isNull();
        assertThat(termFields.getTags()).isNull();
        assertThat(termFields.getDescription()).as("a blank definition is absent").isNull();
        assertThat(mapper.forTerm(term, EnumSet.of(AssetFieldDto.TAGS), null).getTags()).isNull();
    }

    @Test
    void forTerm_andForQueryExample_projectTheirOwnRows() {
        final TermRefDto ref = TermRefDto.builder()
            .term(new TermPojo().setId(5L).setDefinition("def").setCreatedAt(LocalDateTime.now())
                .setUpdatedAt(LocalDateTime.now()))
            .namespace(new NamespacePojo().setId(1L).setName("ns"))
            .build();
        final TermDto term = TermDto.builder().termRefDto(ref).ownerships(Set.of()).build();
        final AssetFields all = mapper.forTerm(term, EnumSet.allOf(AssetFieldDto.class),
            List.of(new TagPojo().setId(1L).setName("tag")));
        assertThat(all.getNamespace().getName()).isEqualTo("ns");
        assertThat(all.getDescription()).isEqualTo("def");
        assertThat(all.getCreatedAt()).isNotNull();
        assertThat(all.getUpdatedAt()).isNotNull();
        assertThat(all.getTags()).hasSize(1);
        assertThat(all.getOwners()).as("no ownership rows -> absent, not an empty list").isNull();
        // A term never carries the data-entity-only values, whatever was requested.
        assertThat(all.getViewCount()).isNull();
        assertThat(all.getDataSource()).isNull();
        assertThat(all.getRowsCount()).isNull();

        final QueryExamplePojo qe = new QueryExamplePojo().setId(6L).setDefinition("qdef")
            .setCreatedAt(LocalDateTime.now()).setUpdatedAt(LocalDateTime.now());
        final AssetFields qeFields = mapper.forQueryExample(qe, EnumSet.allOf(AssetFieldDto.class));
        assertThat(qeFields.getDescription()).isEqualTo("qdef");
        assertThat(qeFields.getCreatedAt()).isNotNull();
        assertThat(qeFields.getNamespace()).isNull();
        assertThat(qeFields.getTags()).isNull();
        assertThat(mapper.forQueryExample(qe, EnumSet.of(AssetFieldDto.NAMESPACE)).getDescription()).isNull();
    }

    // ---- fixtures ------------------------------------------------------------------------------------------

    private static DataEntityDimensionsDto dataset() {
        final DataSetAttributes dsa = new DataSetAttributes();
        dsa.setRowsCount(123456L);
        dsa.setFieldsCount(17L);
        final DataEntityDimensionsDto dto = entity(1L, "//ds", DataEntityClassDto.DATA_SET,
            Map.of(DataEntityClassDto.DATA_SET, dsa));
        dto.getDataEntity()
            .setInternalDescription("internal")
            .setExternalDescription("external")
            .setViewCount(42L)
            .setSourceCreatedAt(LocalDateTime.now().minusDays(2))
            .setSourceUpdatedAt(LocalDateTime.now().minusDays(1));
        dto.setOwnership(List.of(mock(OwnershipDto.class)));
        return dto;
    }

    private static DataEntityDimensionsDto entity(final long id, final String oddrn, final DataEntityClassDto cls,
                                                   final Map<DataEntityClassDto, DataEntityAttributes> attrs) {
        final DataEntityPojo pojo = new DataEntityPojo().setId(id).setOddrn(oddrn)
            .setEntityClassIds(new Integer[] {cls.getId()}).setStatus((short) 1);
        return DataEntityDimensionsDto.dimensionsBuilder()
            .dataEntity(pojo)
            .hasAlerts(false)
            .specificAttributes(attrs)
            .namespace(new NamespacePojo().setId(1L).setName("ns"))
            .dataSource(new DataSourcePojo().setId(1L).setName("src"))
            .build();
    }
}
