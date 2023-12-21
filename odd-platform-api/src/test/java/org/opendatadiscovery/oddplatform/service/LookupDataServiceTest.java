package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTable;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableField;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.Namespace;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnDto;
import org.opendatadiscovery.oddplatform.dto.LookupTableDto;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableDto;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldApiMapper;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldApiMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.DatasetVersionMapper;
import org.opendatadiscovery.oddplatform.mapper.DateTimeMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.LookupTableDefinitionMapper;
import org.opendatadiscovery.oddplatform.mapper.LookupTableDefinitionMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.LookupTableMapper;
import org.opendatadiscovery.oddplatform.mapper.LookupTableMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldValueMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.NamespaceMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.OwnerMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.OwnershipMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.TagMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.TermMapperImpl;
import org.opendatadiscovery.oddplatform.mapper.TitleMapperImpl;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableDefinitionRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddrn.Generator;
import org.opendatadiscovery.oddrn.model.ODDPlatformDataEntityLookupTablesPath;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_SET;

@ExtendWith(MockitoExtension.class)
public class LookupDataServiceTest {
    private final Generator oddrnGenerator = Generator.getInstance();

    private LookupDataService lookupDataService;
    private DataEntityLookupTableService dataEntityLookupTableService;
    @Mock
    private DatasetStructureService datasetStructureService;
    @Mock
    private ReactiveLookupTableRepository tableRepository;
    @Mock
    private ReactiveLookupTableDefinitionRepository tableDefinitionRepository;
    @Mock
    private ReactiveLookupTableSearchEntrypointRepository lookupTableSearchEntrypointRepository;
    @Mock
    private ReactiveDataEntityRepository reactiveDataEntityRepository;
    @Mock
    private ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;
    @Mock
    private ReactiveDatasetVersionRepository reactiveDatasetVersionRepository;
    @Mock
    private ReactiveDatasetFieldRepository reactiveDatasetFieldRepository;
    @Mock
    private DataEntityMapper dataEntityMapper;
    @Mock
    private DatasetVersionMapper datasetVersionMapper;

    private final LookupTableMapper tableMapper = new LookupTableMapperImpl();
    private final LookupTableDefinitionMapper tableDefinitionMapper = new LookupTableDefinitionMapperImpl();
    private final DatasetFieldApiMapper datasetFieldApiMapper = new DatasetFieldApiMapperImpl(
        new TagMapperImpl(),
        new MetadataFieldValueMapperImpl(new MetadataFieldMapperImpl()),
        new TermMapperImpl(new NamespaceMapperImpl(), new DateTimeMapperImpl(), new OwnershipMapperImpl(
            new OwnerMapperImpl(), new TitleMapperImpl()
        ))
    );

    @BeforeEach
    void setUp() {
        tableMapper.setDateTimeMapper(new DateTimeMapperImpl());
        tableMapper.setNamespaceMapper(new NamespaceMapperImpl());
        tableMapper.setLookupTableDefinitionMapper(tableDefinitionMapper);

        dataEntityLookupTableService = new DataEntityLookupTableServiceImpl(datasetStructureService,
            reactiveDatasetFieldRepository,
            reactiveDataEntityRepository,
            reactiveDatasetVersionRepository,
            reactiveSearchEntrypointRepository,
            dataEntityMapper,
            datasetFieldApiMapper,
            datasetVersionMapper);

        lookupDataService = new LookupDataServiceImpl(dataEntityLookupTableService,
            tableRepository,
            tableDefinitionRepository,
            lookupTableSearchEntrypointRepository,
            tableMapper,
            tableDefinitionMapper);
    }

    @ParameterizedTest
    @MethodSource("lookupTableProvider")
    @DisplayName("Creates new lookupTable")
    public void createLookupTableTest(final ReferenceTableDto referenceTableDto,
                                      final LookupTable expected) {
        final long dataEntityId = 100L;
        final long datasetFieldId = 1000L;
        final long lookupTableId = 1L;

        final String datasetOddrn = generateOddrn(dataEntityId);

        when(dataEntityMapper.mapCreatedLookupTablePojo(any(ReferenceTableDto.class),
            any(DataEntityClassDto.class)))
            .thenReturn(new DataEntityPojo()
                .setInternalName(referenceTableDto.getName())
                .setExternalName(referenceTableDto.getTableName())
                .setNamespaceId(referenceTableDto.getNamespacePojo().getId())
                .setEntityClassIds(new Integer[] {DATA_SET.getId()})
                .setManuallyCreated(true));

        when(reactiveDataEntityRepository.create(any(DataEntityPojo.class)))
            .thenReturn(Mono.just(new DataEntityPojo().setId(dataEntityId)));

        when(reactiveDataEntityRepository.update(any(DataEntityPojo.class)))
            .thenReturn(Mono.just(new DataEntityPojo()
                .setId(dataEntityId)
                .setOddrn(datasetOddrn))
            );

        when(reactiveDatasetVersionRepository.create(any(DatasetVersionPojo.class)))
            .thenReturn(Mono.just(new DatasetVersionPojo()
                .setDatasetOddrn(datasetOddrn)
                .setVersion(1L)));

        when(tableRepository.create(any(LookupTablesPojo.class)))
            .thenReturn(Mono.just(new LookupTablesPojo()
                .setId(lookupTableId)
                .setDataEntityId(dataEntityId)
                .setName(referenceTableDto.getName())
                .setTableName(referenceTableDto.getTableName())
                .setNamespaceId(referenceTableDto.getNamespacePojo().getId()))
            );

        when(reactiveSearchEntrypointRepository.updateDataEntityVectors(anyLong())).thenReturn(Mono.empty());
        when(reactiveSearchEntrypointRepository.updateNamespaceVectorForDataEntity(anyLong()))
            .thenReturn(Mono.empty());

        mockGetLatestDatasetVersion(datasetOddrn, List.of());

        when(datasetStructureService
            .createDatasetStructureForSpecificEntity(any(DatasetVersionPojo.class), anyList()))
            .thenReturn(Mono.just(List.of(new DatasetFieldPojo().setId(datasetFieldId).setName("id"))));

        when(reactiveSearchEntrypointRepository.updateStructureVectorForDataEntitiesByOddrns(anyList()))
            .thenReturn(Mono.empty());

        when(tableDefinitionRepository.create(any(LookupTablesDefinitionsPojo.class)))
            .thenReturn(Mono.just(new LookupTablesDefinitionsPojo()
                .setId(1L)
                .setLookupTableId(lookupTableId)
                .setDatasetFieldId(datasetFieldId)
                .setColumnName("id")));

        when(tableRepository.getTableWithFieldsById(anyLong()))
            .thenReturn(Mono.just(new LookupTableDto(
                    new LookupTablesPojo()
                        .setId(lookupTableId)
                        .setName(referenceTableDto.getName())
                        .setDataEntityId(dataEntityId)
                        .setDescription("Descr")
                        .setTableName(referenceTableDto.getTableName())
                        .setNamespaceId(referenceTableDto.getNamespacePojo().getId()),
                    new NamespacePojo().setId(1L),
                    List.of(new LookupTablesDefinitionsPojo()
                        .setId(1L)
                        .setLookupTableId(lookupTableId)
                        .setColumnName("id")
                        .setDatasetFieldId(1L)
                        .setColumnType(LookupTableFieldType.INTEGER.getValue()))
                )
            ));

        when(lookupTableSearchEntrypointRepository.updateLookupTableVectors(anyLong())).thenReturn(
            Mono.empty());
        when(lookupTableSearchEntrypointRepository.updateNamespaceSearchVectors(anyLong())).thenReturn(
            Mono.empty());

        lookupDataService.createLookupTable(referenceTableDto)
            .as(StepVerifier::create)
            .assertNext(item -> validateLookupTable(expected, item)).verifyComplete();
    }

    @ParameterizedTest
    @MethodSource("updateLookupTableProvider")
    @DisplayName("Update lookupTable")
    public void updateLookupTableTest(final LookupTableDto dto,
                                      final ReferenceTableDto referenceTableDto,
                                      final LookupTable expected) {
        when(reactiveDataEntityRepository.get(anyLong()))
            .thenReturn(Mono.just(new DataEntityPojo()
                .setId(100L)
                .setExternalName(dto.tablesPojo().getTableName())
                .setInternalName(dto.tablesPojo().getName())));

        when(dataEntityMapper.applyToPojo(any(DataEntityPojo.class),
            any(ReferenceTableDto.class)))
            .thenReturn(new DataEntityPojo()
                .setInternalName(referenceTableDto.getName())
                .setExternalName(referenceTableDto.getTableName())
                .setNamespaceId(referenceTableDto.getNamespacePojo().getId())
                .setEntityClassIds(new Integer[] {DATA_SET.getId()})
                .setManuallyCreated(true));

        when(reactiveDataEntityRepository.update(any(DataEntityPojo.class)))
            .thenReturn(Mono.just(new DataEntityPojo()
                .setId(100L)
                .setInternalDescription(referenceTableDto.getName()))
            );

        when(tableRepository.update(any(LookupTablesPojo.class)))
            .thenReturn(Mono.just(
                new LookupTablesPojo()
                    .setId(1L)
                    .setDataEntityId(100L)
                    .setName(referenceTableDto.getName())
                    .setDescription(referenceTableDto.getTableDescription()))
            );

        when(tableRepository.getTableWithFieldsById(anyLong()))
            .thenReturn(Mono.just(new LookupTableDto(
                    new LookupTablesPojo()
                        .setId(1L)
                        .setDataEntityId(100L)
                        .setName(referenceTableDto.getName())
                        .setDescription(referenceTableDto.getTableDescription()),
                    new NamespacePojo().setId(1L),
                    List.of()
                )
            ));

        when(lookupTableSearchEntrypointRepository.updateLookupTableVectors(anyLong())).thenReturn(Mono.empty());
        when(reactiveSearchEntrypointRepository.updateDataEntityVectors(anyLong())).thenReturn(Mono.empty());
        when(reactiveSearchEntrypointRepository.updateNamespaceVectorForDataEntity(anyLong()))
            .thenReturn(Mono.empty());

        lookupDataService.updateLookupTable(dto, referenceTableDto)
            .as(StepVerifier::create)
            .assertNext(item -> validateLookupTable(expected, item)).verifyComplete();
    }

    @ParameterizedTest
    @MethodSource("lookupTableFieldsProvider")
    @DisplayName("Creates new lookupTable Fields")
    public void createLookupTableFieldsTest(final Long lookupTableId,
                                            final Long dataEntityId,
                                            final List<LookupTableFieldFormData> columns,
                                            final LookupTable expected) {
        final DatasetFieldDto datasetFieldDto = new DatasetFieldDto();
        datasetFieldDto.setDatasetFieldPojo(new DatasetFieldPojo().setId(1L).setName("id"));

        mockGetLatestDatasetVersion(generateOddrn(dataEntityId), List.of(datasetFieldDto));

        when(datasetStructureService
            .createDatasetStructureForSpecificEntity(any(DatasetVersionPojo.class), anyList()))
            .thenReturn(Mono.just(List.of(
                    new DatasetFieldPojo().setId(5L).setName("id"),
                    new DatasetFieldPojo().setId(1L).setName("name"),
                    new DatasetFieldPojo().setId(2L).setName("age"),
                    new DatasetFieldPojo().setId(3L).setName("dob"),
                    new DatasetFieldPojo().setId(4L).setName("passportId")
                )
            ));

        when(reactiveSearchEntrypointRepository.updateStructureVectorForDataEntitiesByOddrns(anyList()))
            .thenReturn(Mono.empty());

        when(tableDefinitionRepository.bulkCreate(anyList()))
            .thenReturn(Flux.just(
                new LookupTablesDefinitionsPojo().setId(1L).setDatasetFieldId(1001L).setColumnName("name")
                    .setDefaultValue("default").setColumnType(LookupTableFieldType.VARCHAR.getValue()),
                new LookupTablesDefinitionsPojo().setId(2L).setDatasetFieldId(1002L).setColumnName("age")
                    .setIsNullable(true).setColumnType(LookupTableFieldType.INTEGER.getValue()),
                new LookupTablesDefinitionsPojo().setId(3L).setDatasetFieldId(1003L).setColumnName("dob")
                    .setColumnType(LookupTableFieldType.DATE.getValue()),
                new LookupTablesDefinitionsPojo().setId(4L).setDatasetFieldId(1004L).setColumnName("passportId")
                    .setIsUnique(true).setColumnType(LookupTableFieldType.INTEGER.getValue())
            ));

        when(tableRepository.getTableWithFieldsById(anyLong()))
            .thenReturn(Mono.just(new LookupTableDto(
                    new LookupTablesPojo()
                        .setId(lookupTableId),
                    new NamespacePojo().setId(1L),
                    List.of(new LookupTablesDefinitionsPojo().setId(1L).setDatasetFieldId(1001L).setColumnName("name")
                            .setDefaultValue("default").setColumnType(LookupTableFieldType.VARCHAR.getValue()),
                        new LookupTablesDefinitionsPojo().setId(2L).setDatasetFieldId(1002L).setColumnName("age")
                            .setIsNullable(true).setColumnType(LookupTableFieldType.INTEGER.getValue()),
                        new LookupTablesDefinitionsPojo().setId(3L).setDatasetFieldId(1003L).setColumnName("dob")
                            .setColumnType(LookupTableFieldType.DATE.getValue()),
                        new LookupTablesDefinitionsPojo().setId(4L).setDatasetFieldId(1004L).setColumnName("passportId")
                            .setIsUnique(true).setColumnType(LookupTableFieldType.INTEGER.getValue()),
                        new LookupTablesDefinitionsPojo().setId(5L).setDatasetFieldId(1005L).setColumnName("id")
                            .setIsPrimaryKey(true).setColumnType(LookupTableFieldType.INTEGER.getValue())
                    )
                )
            ));

        when(lookupTableSearchEntrypointRepository.updateTableDefinitionSearchVectors(anyLong())).thenReturn(
            Mono.empty());

        lookupDataService.addColumnsToLookupTable(lookupTableId, dataEntityId, columns)
            .as(StepVerifier::create)
            .assertNext(item -> validateLookupTablesFields(expected, item))
            .verifyComplete();
    }

    @ParameterizedTest
    @MethodSource("updateLookupTableColumnProvider")
    @DisplayName("Update new lookupTable Fields")
    public void updateLookupTableColumnTest(final LookupTableColumnDto columnDto,
                                            final LookupTableFieldUpdateFormData formData,
                                            final LookupTable expected) {
        final DatasetFieldDto datasetFieldDto = new DatasetFieldDto();
        final String oddrn = generateOddrn(1L);
        datasetFieldDto.setDatasetFieldPojo(new DatasetFieldPojo()
            .setId(1000L)
            .setName("name")
            .setExternalDescription("descr")
            .setOddrn(oddrn + "/field/name"));

        mockGetLatestDatasetVersion(oddrn, List.of(datasetFieldDto));

        when(datasetStructureService
            .createDatasetStructureForSpecificEntity(any(DatasetVersionPojo.class), anyList()))
            .thenReturn(Mono.just(List.of(
                    new DatasetFieldPojo().setId(1000L)
                        .setName("updated_name")
                        .setExternalDescription("updated_desc")
                        .setOddrn(oddrn + "/field/updated_name"))
            ));

        when(reactiveSearchEntrypointRepository.updateStructureVectorForDataEntitiesByOddrns(anyList()))
            .thenReturn(Mono.empty());

        when(tableDefinitionRepository.update(any(LookupTablesDefinitionsPojo.class)))
            .thenReturn(Mono.just(new LookupTablesDefinitionsPojo()
                .setId(1L)
                .setLookupTableId(1L)
                .setDatasetFieldId(1000L)
                .setColumnName("updated_name")
                .setDescription("updated_desc")
                .setIsNullable(true)
                .setIsUnique(true)));

        when(tableRepository.getTableWithFieldsById(anyLong()))
            .thenReturn(Mono.just(new LookupTableDto(
                    new LookupTablesPojo()
                        .setId(1L)
                        .setName("test")
                        .setDataEntityId(1L)
                        .setDescription("Descr"),
                    new NamespacePojo().setId(1L),
                    List.of(new LookupTablesDefinitionsPojo()
                        .setId(1L)
                        .setLookupTableId(1L)
                        .setColumnName("updated_name")
                        .setDescription("updated_desc")
                        .setDatasetFieldId(1000L)
                        .setIsUnique(true)
                        .setIsNullable(true)
                        .setColumnType(LookupTableFieldType.VARCHAR.getValue()))
                )
            ));

        when(lookupTableSearchEntrypointRepository.updateTableDefinitionSearchVectors(anyLong())).thenReturn(
            Mono.empty());

        lookupDataService.updateLookupTableColumn(columnDto, formData)
            .as(StepVerifier::create)
            .assertNext(item -> validateLookupTablesFields(expected, item)).verifyComplete();
    }

    private static void validateLookupTable(final LookupTable expected, final LookupTable item) {
        assertEquals(expected.getTableId(), item.getTableId());
        assertEquals(expected.getFields().size(), item.getFields().size());
        assertEquals(expected.getDescription(), item.getDescription());
        assertEquals(expected.getNamespace().getId(), item.getNamespace().getId());
        assertEquals(expected.getName(), item.getName());
    }

    private static void validateLookupTablesFields(final LookupTable expected, final LookupTable item) {
        assertEquals(expected.getFields().size(), item.getFields().size());

        expected.getFields().forEach(expectedField -> {
            item.getFields().stream()
                .filter(actualField -> expectedField.getName().equals(actualField.getName()))
                .forEach(actualField -> {
                    assertEquals(expectedField.getFieldId(), actualField.getFieldId());
                    assertEquals(expectedField.getDefaultValue(), actualField.getDefaultValue());
                    assertEquals(expectedField.getDescription(), actualField.getDescription());
                    assertEquals(expectedField.getDatasetFieldId(), actualField.getDatasetFieldId());
                    assertEquals(expectedField.getFieldType(), actualField.getFieldType());
                    assertEquals(expectedField.getIsNullable(), actualField.getIsNullable());
                    assertEquals(expectedField.getIsUnique(), actualField.getIsUnique());
                    assertEquals(expectedField.getIsPrimaryKey(), actualField.getIsPrimaryKey());
                });
        });
    }

    private static Stream<Arguments> lookupTableProvider() {
        final NamespacePojo namespace = new NamespacePojo(1L, "namespace",
            LocalDateTime.now(), LocalDateTime.now(), null);

        final ReferenceTableDto referenceTableDto = ReferenceTableDto.builder()
            .name("test")
            .namespacePojo(namespace)
            .tableName(buildTableName("test", namespace))
            .tableDescription("Descr")
            .build();
        final LookupTable lookupTable = new LookupTable()
            .tableId(1L)
            .datasetId(100L)
            .name("test")
            .description("Descr")
            .namespace(new Namespace().id(1L).name("namespace"))
            .fields(List.of(
                new LookupTableField().fieldId(1L).datasetFieldId(1000L).name("id").isPrimaryKey(true)));

        return Stream.of(
            Arguments.arguments(referenceTableDto, lookupTable));
    }

    private static Stream<Arguments> updateLookupTableProvider() {
        final NamespacePojo namespace = new NamespacePojo(1L, "namespace",
            LocalDateTime.now(), LocalDateTime.now(), null);

        final LookupTableDto lookupTableDto = new LookupTableDto(
            new LookupTablesPojo()
                .setId(1L)
                .setDataEntityId(100L)
                .setName("name")
                .setTableName("table_name"),
            new NamespacePojo()
                .setId(1L)
                .setName("namespace"),
            List.of(new LookupTablesDefinitionsPojo()
                .setId(1L)
                .setColumnName("id"))
        );

        final ReferenceTableDto referenceTableDto = ReferenceTableDto.builder()
            .name("test")
            .namespacePojo(namespace)
            .tableName(buildTableName("test", namespace))
            .tableDescription("Descr")
            .build();

        final LookupTable lookupTable = new LookupTable()
            .tableId(1L)
            .datasetId(100L)
            .name("test")
            .description("Descr")
            .namespace(new Namespace().id(1L).name("namespace"))
            .fields(List.of());

        return Stream.of(
            Arguments.arguments(lookupTableDto, referenceTableDto, lookupTable));
    }

    private static Stream<Arguments> lookupTableFieldsProvider() {
        final List<LookupTableFieldFormData> lookupTableFieldFormData = List.of(
            new LookupTableFieldFormData().name("name").fieldType(LookupTableFieldType.VARCHAR)
                .defaultValue("default"),
            new LookupTableFieldFormData().name("age").fieldType(LookupTableFieldType.INTEGER).isNullable(true),
            new LookupTableFieldFormData().name("dob").fieldType(LookupTableFieldType.DATE),
            new LookupTableFieldFormData().name("passportId").fieldType(LookupTableFieldType.INTEGER)
                .isUnique(true)
        );

        final LookupTable lookupTable = new LookupTable()
            .tableId(1L)
            .datasetId(1L)
            .name("test")
            .description("Descr")
            .namespace(new Namespace().id(1L).name("namespace"))
            .fields(List.of(
                    new LookupTableField().fieldId(1L).datasetFieldId(1001L).name("name")
                        .fieldType(LookupTableFieldType.VARCHAR).defaultValue("default"),
                    new LookupTableField().fieldId(2L).datasetFieldId(1002L).name("age")
                        .fieldType(LookupTableFieldType.INTEGER).isNullable(true),
                    new LookupTableField().fieldId(3L).datasetFieldId(1003L).name("dob")
                        .fieldType(LookupTableFieldType.DATE),
                    new LookupTableField().fieldId(4L).datasetFieldId(1004L).name("passportId")
                        .fieldType(LookupTableFieldType.INTEGER).isUnique(true),
                    new LookupTableField().fieldId(5L).datasetFieldId(1005L).name("id")
                        .fieldType(LookupTableFieldType.INTEGER).isPrimaryKey(true)
                )
            );

        return Stream.of(
            Arguments.arguments(1L, 100L, lookupTableFieldFormData, lookupTable));
    }

    private static Stream<Arguments> updateLookupTableColumnProvider() {
        final LookupTableColumnDto lookupTableColumnDto = new LookupTableColumnDto(
            new LookupTablesPojo()
                .setId(1L)
                .setDataEntityId(1L)
                .setName("test"),
            new LookupTablesDefinitionsPojo()
                .setId(1L)
                .setLookupTableId(1L)
                .setDatasetFieldId(1000L)
                .setColumnName("name")
                .setDescription("descr")
                .setColumnType(LookupTableFieldType.VARCHAR.getValue())
        );

        final LookupTableFieldUpdateFormData formData = new LookupTableFieldUpdateFormData()
            .name("updated_name")
            .description("updated_desc")
            .isNullable(true)
            .isUnique(true);

        final LookupTable lookupTable = new LookupTable()
            .tableId(1L)
            .datasetId(1L)
            .name("test")
            .fields(List.of(
                new LookupTableField()
                    .fieldId(1L)
                    .description("updated_desc")
                    .datasetFieldId(1000L)
                    .name("updated_name")
                    .fieldType(LookupTableFieldType.VARCHAR)
                    .isNullable(true)
                    .isUnique(true))
            );

        return Stream.of(
            Arguments.arguments(lookupTableColumnDto, formData, lookupTable));
    }

    private String generateOddrn(final long dataEntityId) {
        return oddrnGenerator.generate(ODDPlatformDataEntityLookupTablesPath.builder()
            .id(dataEntityId)
            .build());
    }

    private void mockGetLatestDatasetVersion(final String datasetOddrn, final List<DatasetFieldDto> dtos) {
        final DatasetStructureDto datasetStructureDto = new DatasetStructureDto();
        datasetStructureDto.setDatasetFields(dtos);
        datasetStructureDto.setDatasetVersion(new DatasetVersionPojo()
            .setId(1L)
            .setVersion(1L)
            .setDatasetOddrn(datasetOddrn));

        when(reactiveDatasetVersionRepository.getLatestDatasetVersion(anyLong()))
            .thenReturn(Mono.just(datasetStructureDto));

        when(datasetVersionMapper.mapDatasetVersion(anyString(), any(), anyLong()))
            .thenReturn(new DatasetVersionPojo()
                .setDatasetOddrn(datasetOddrn)
                .setVersion(2L));
    }

    private static String buildTableName(final String name, final NamespacePojo namespacePojo) {
        final String fixedName = name.toLowerCase().replace(" ", "_");
        return "n_" + namespacePojo.getId() + "__" + fixedName;
    }
}
