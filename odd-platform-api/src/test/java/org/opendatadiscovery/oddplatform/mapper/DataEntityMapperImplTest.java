package org.opendatadiscovery.oddplatform.mapper;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableDto;
import org.opendatadiscovery.oddplatform.dto.attributes.LinkedUrlAttribute;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.service.DataEntityStaleDetector;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL unit test for DataEntityMapperImpl's per-class branch mapping — the first test of this
 * mapper's class-branch logic.
 *
 * <p>The null-details cases regress odd-platform#1755 (PLT-147): an entity whose {@code entity_class_ids}
 * carries a class with no matching {@code specific_attributes} block reaches the mapper with a NULL
 * class-specific details DTO (hydration at DataEntityServiceImpl.enrichEntityClassDetails iterates the
 * attribute KEYS; the mapper branches on the class ids — the two disagree on partially-ingested rows).
 * Pre-fix, mapPojo/mapDtoDetails dereferenced the null DTO — NullPointerException — and the catch-all
 * advice turned ONE bad row into a 500 SYS001 for the WHOLE search-results page / entity-detail page.
 * Each test here injects exactly that condition (class id set, details DTO null) and asserts the entity
 * maps with the class-specific fields simply absent, mirroring the DATA_ENTITY_GROUP guard that already
 * existed at mapPojo.
 *
 * <p>The populated-details cases lock the hydrated path: the guards must not change mapping when the
 * details DTOs ARE present.
 *
 * @regresses odd-platform#1755 (PLT-147)
 */
@ExtendWith(MockitoExtension.class)
class DataEntityMapperImplTest {

    private static final long ENTITY_ID = 42L;

    @Mock private DataSourceMapper dataSourceMapper;
    @Mock private DataSourceSafeMapper dataSourceSafeMapper;
    @Mock private OwnershipMapper ownershipMapper;
    @Mock private TagMapper tagMapper;
    @Mock private MetadataFieldValueMapper metadataFieldValueMapper;
    @Mock private DatasetVersionMapper datasetVersionMapper;
    @Mock private DataEntityRunMapper dataEntityRunMapper;
    @Mock private TermMapper termMapper;
    @Mock private DateTimeMapper dateTimeMapper;
    @Mock private DataEntityStatusMapper dataEntityStatusMapper;
    @Mock private DataEntityStaleDetector dataEntityStaleDetector;

    private DataEntityMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new DataEntityMapperImpl(dataSourceMapper, dataSourceSafeMapper, ownershipMapper, tagMapper,
            metadataFieldValueMapper, datasetVersionMapper, dataEntityRunMapper, termMapper, dateTimeMapper,
            dataEntityStatusMapper, dataEntityStaleDetector);
    }

    // ---- mapPojo (the search-results / list path): class id present, details DTO null ----

    @Test
    void mapPojo_transformerClassWithNullDetailsDto_mapsEntityWithoutSourceTargetLists() {
        final DataEntity entity = mapper.mapPojo(dimensions(pojo(DataEntityClassDto.DATA_TRANSFORMER)));

        assertThat(entity.getId()).isEqualTo(ENTITY_ID);
        assertThat(entity.getSourceList()).isNull();
        assertThat(entity.getTargetList()).isNull();
    }

    @Test
    void mapPojo_qualityTestClassWithNullDetailsDto_mapsEntityWithoutTestFields() {
        final DataEntity entity = mapper.mapPojo(dimensions(pojo(DataEntityClassDto.DATA_QUALITY_TEST)));

        assertThat(entity.getId()).isEqualTo(ENTITY_ID);
        assertThat(entity.getLinkedUrlList()).isNull();
        assertThat(entity.getDatasetsList()).isNull();
    }

    @Test
    void mapPojo_consumerClassWithNullDetailsDto_mapsEntityWithoutInputList() {
        final DataEntity entity = mapper.mapPojo(dimensions(pojo(DataEntityClassDto.DATA_CONSUMER)));

        assertThat(entity.getId()).isEqualTo(ENTITY_ID);
        assertThat(entity.getInputList()).isNull();
    }

    @Test
    void mapPojo_dataInputClassWithNullDetailsDto_mapsEntityWithoutOutputList() {
        final DataEntity entity = mapper.mapPojo(dimensions(pojo(DataEntityClassDto.DATA_INPUT)));

        assertThat(entity.getId()).isEqualTo(ENTITY_ID);
        assertThat(entity.getOutputList()).isNull();
    }

    // ---- mapDtoDetails (the entity-detail path): class id present, details DTO null ----

    @Test
    void mapDtoDetails_transformerClassWithNullDetailsDto_mapsDetailsWithoutSourceTargetLists() {
        final DataEntityDetails details = mapper.mapDtoDetails(details(pojo(DataEntityClassDto.DATA_TRANSFORMER)));

        assertThat(details.getId()).isEqualTo(ENTITY_ID);
        assertThat(details.getSourceList()).isNull();
        assertThat(details.getTargetList()).isNull();
    }

    @Test
    void mapDtoDetails_qualityTestClassWithNullDetailsDto_mapsDetailsWithoutTestFields() {
        final DataEntityDetails details = mapper.mapDtoDetails(details(pojo(DataEntityClassDto.DATA_QUALITY_TEST)));

        assertThat(details.getId()).isEqualTo(ENTITY_ID);
        assertThat(details.getExpectation()).isNull();
        assertThat(details.getDatasetsList()).isNull();
        assertThat(details.getLinkedUrlList()).isNull();
        assertThat(details.getSuiteName()).isNull();
    }

    @Test
    void mapDtoDetails_consumerClassWithNullDetailsDto_mapsDetailsWithoutInputList() {
        final DataEntityDetails details = mapper.mapDtoDetails(details(pojo(DataEntityClassDto.DATA_CONSUMER)));

        assertThat(details.getId()).isEqualTo(ENTITY_ID);
        assertThat(details.getInputList()).isNull();
    }

    @Test
    void mapDtoDetails_dataInputClassWithNullDetailsDto_mapsDetailsWithoutOutputList() {
        final DataEntityDetails details = mapper.mapDtoDetails(details(pojo(DataEntityClassDto.DATA_INPUT)));

        assertThat(details.getId()).isEqualTo(ENTITY_ID);
        assertThat(details.getOutputList()).isNull();
    }

    @Test
    void mapDtoDetails_groupClassWithNullGroupsDto_mapsManuallyCreatedWithoutMembers() {
        final DataEntityDetails details =
            mapper.mapDtoDetails(details(pojo(DataEntityClassDto.DATA_ENTITY_GROUP).setManuallyCreated(true)));

        assertThat(details.getId()).isEqualTo(ENTITY_ID);
        assertThat(details.getEntities()).isNull();
        assertThat(details.getHasChildren()).isNull();
        assertThat(details.getManuallyCreated()).isTrue();
    }

    // ---- populated-details locks: the guards must not change the hydrated path ----

    @Test
    void mapPojo_transformerClassWithPopulatedDetailsDto_mapsSourceAndTargetRefs() {
        final DataEntityDimensionsDto dto = dimensions(pojo(DataEntityClassDto.DATA_TRANSFORMER));
        dto.setDataTransformerDetailsDto(new DataEntityDimensionsDto.DataTransformerDetailsDto(
            List.of(refPojo(7L)), List.of(refPojo(8L)), "https://job.example/src"));

        final DataEntity entity = mapper.mapPojo(dto);

        assertThat(entity.getSourceList()).hasSize(1);
        assertThat(entity.getSourceList().get(0).getId()).isEqualTo(7L);
        assertThat(entity.getTargetList()).hasSize(1);
        assertThat(entity.getTargetList().get(0).getId()).isEqualTo(8L);
    }

    @Test
    void mapDtoDetails_qualityTestClassWithPopulatedDetailsDto_mapsSuiteExpectationAndDatasets() {
        final DataEntityDetailsDto dto = details(pojo(DataEntityClassDto.DATA_QUALITY_TEST));
        dto.setDataQualityTestDetailsDto(new DataEntityDimensionsDto.DataQualityTestDetailsDto(
            "great_expectations_suite", "https://suite.example", List.of(refPojo(7L)),
            List.of(new LinkedUrlAttribute("runbook", "https://runbook.example")), "EXPECT_COLUMN_VALUES",
            null, Map.of()));

        final DataEntityDetails details = mapper.mapDtoDetails(dto);

        assertThat(details.getSuiteName()).isEqualTo("great_expectations_suite");
        assertThat(details.getSuiteUrl()).isEqualTo("https://suite.example");
        assertThat(details.getExpectation().getType()).isEqualTo("EXPECT_COLUMN_VALUES");
        assertThat(details.getDatasetsList()).hasSize(1);
        assertThat(details.getDatasetsList().get(0).getId()).isEqualTo(7L);
        assertThat(details.getLinkedUrlList()).hasSize(1);
        assertThat(details.getLinkedUrlList().get(0).getUrl()).isEqualTo("https://runbook.example");
        assertThat(details.getLinkedUrlList().get(0).getName()).isEqualTo("runbook");
    }

    @Test
    void mapDtoDetails_groupClassWithPopulatedGroupsDto_mapsMembersAndHasChildren() {
        final DataEntityDetailsDto dto = details(pojo(DataEntityClassDto.DATA_ENTITY_GROUP).setManuallyCreated(true));
        dto.setGroupsDto(new DataEntityDimensionsDto.DataEntityGroupDimensionsDto(Set.of(refPojo(7L)), 3, true));

        final DataEntityDetails details = mapper.mapDtoDetails(dto);

        assertThat(details.getEntities()).hasSize(1);
        assertThat(details.getEntities().get(0).getId()).isEqualTo(7L);
        assertThat(details.getHasChildren()).isTrue();
        assertThat(details.getManuallyCreated()).isTrue();
    }

    // ---- lookup-table description -> entity external_description propagation (CTRIB-032 / #1781) ----
    // A lookup table is a source auto-ingested into the catalog, so its description is the entity's
    // EXTERNAL description; the catalog-curated INTERNAL description (the About editor) stays independent
    // and must never be clobbered by a lookup-table edit. RED on base (neither method set a description).

    @Test
    void mapCreatedLookupTablePojo_setsExternalDescriptionFromTableDescription() {
        final ReferenceTableDto dto = ReferenceTableDto.builder()
            .name("countries")
            .tableName("n_1__countries")
            .tableDescription("ISO 3166 country reference")
            .build();

        final DataEntityPojo pojo = mapper.mapCreatedLookupTablePojo(dto, DataEntityClassDto.DATA_SET);

        assertThat(pojo.getExternalDescription()).isEqualTo("ISO 3166 country reference");
        assertThat(pojo.getInternalName()).isEqualTo("countries");
        assertThat(pojo.getInternalDescription()).isNull();
    }

    @Test
    void applyToPojo_referenceTable_updatesExternalDescriptionAndKeepsInternalDescription() {
        final DataEntityPojo existing = new DataEntityPojo()
            .setId(ENTITY_ID)
            .setInternalName("old-name")
            .setExternalDescription("old external description")
            .setInternalDescription("curated catalog note");
        final ReferenceTableDto dto = ReferenceTableDto.builder()
            .name("countries")
            .tableName("n_1__countries")
            .tableDescription("updated reference description")
            .build();

        final DataEntityPojo pojo = mapper.applyToPojo(existing, dto);

        assertThat(pojo.getExternalDescription()).isEqualTo("updated reference description");
        assertThat(pojo.getInternalName()).isEqualTo("countries");
        assertThat(pojo.getInternalDescription()).isEqualTo("curated catalog note");
    }

    // ---- fixtures ----

    private static DataEntityPojo pojo(final DataEntityClassDto... classes) {
        return new DataEntityPojo()
            .setId(ENTITY_ID)
            .setOddrn("//odd/ctrib009/entity")
            .setTypeId(DataEntityTypeDto.JOB.getId())
            .setEntityClassIds(Arrays.stream(classes).map(DataEntityClassDto::getId).toArray(Integer[]::new));
    }

    private static DataEntityPojo refPojo(final long id) {
        return new DataEntityPojo()
            .setId(id)
            .setOddrn("//odd/ctrib009/ref/" + id)
            .setEntityClassIds(new Integer[] {DataEntityClassDto.DATA_SET.getId()});
    }

    private static DataEntityDimensionsDto dimensions(final DataEntityPojo pojo) {
        return DataEntityDimensionsDto.dimensionsBuilder().dataEntity(pojo).build();
    }

    private static DataEntityDetailsDto details(final DataEntityPojo pojo) {
        final DataEntityDetailsDto dto = DataEntityDetailsDto.detailsBuilder().dataEntity(pojo).build();
        dto.setTerms(List.of());
        return dto;
    }
}
