package org.opendatadiscovery.oddplatform.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import org.jeasy.random.EasyRandom;
import org.jeasy.random.EasyRandomParameters;
import org.jeasy.random.randomizers.range.IntegerRangeRandomizer;
import org.jooq.JSONB;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.Activity;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClass;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.api.contract.model.Identity;
import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipActivityState;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityCreateEvent;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.BusinessNameActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.CustomGroupActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.DataEntityCreatedActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.DatasetFieldEnumValuesActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.DatasetFieldInformationActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.DatasetFieldLabelActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.DatasetFieldValuesActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.DescriptionActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.OwnershipActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.TagActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.TermActivityStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ActivityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.opendatadiscovery.oddplatform.utils.RecordFactory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
public class ActivityMapperTest {
    private static final Random RANDOM = new Random();

    private static final EasyRandom GENERATOR = new EasyRandom(new EasyRandomParameters()
        .randomize(Integer.class, new IntegerRangeRandomizer(1, 9))
        .objectFactory(new RecordFactory())
        .randomizationDepth(2)
    );

    @Mock
    DataEntityMapper dataEntityMapper;
    @Mock
    AssociatedOwnerMapper associatedOwnerMapper;

    @InjectMocks
    ActivityMapper activityMapper = new ActivityMapperImpl(new OffsetDateTimeMapperImpl());

    @ParameterizedTest
    @EnumSource(ActivityEventTypeDto.class)
    @DisplayName("Test mapping activity create event to activity pojo object")
    void testMapPojo(final ActivityEventTypeDto eventTypeDto) {
        final ActivityCreateEvent event = createEvent(eventTypeDto);
        final LocalDateTime activityTime = LocalDateTime.now();
        final String createdBy = "username";
        final ActivityPojo activityPojo = activityMapper.mapToPojo(event, activityTime, createdBy);
        assertThat(activityPojo.getCreatedAt()).isEqualTo(activityTime);
        assertThat(activityPojo.getEventType()).isEqualTo(event.getEventType().name());
        assertThat(activityPojo.getId()).isNull();
        assertThat(activityPojo.getDataEntityId()).isEqualTo(event.getDataEntityId());
        assertThat(activityPojo.getCreatedBy()).isEqualTo(createdBy);
        assertThat(activityPojo.getIsSystemEvent()).isEqualTo(event.isSystemEvent());
        assertThat(activityPojo.getOldState().data()).isEqualTo(event.getOldState());
        assertThat(activityPojo.getNewState().data()).isEqualTo(event.getNewState());
    }

    @ParameterizedTest
    @EnumSource(ActivityEventTypeDto.class)
    @DisplayName("Test mapping ActivityDto to Activity type for all type of events")
    void testMapToActivity(final ActivityEventTypeDto eventTypeDto) {
        final OwnerPojo owner = new OwnerPojo()
            .setId(RANDOM.nextLong())
            .setName(UUID.randomUUID().toString());
        final ActivityPojo activityPojo = createPojo(eventTypeDto);
        final DataEntityPojo dataEntityPojo = createDataEntityPojo(activityPojo.getDataEntityId());
        final DataEntityType dataEntityType = new DataEntityType().id(1).name(DataEntityType.NameEnum.TABLE);
        final DataEntityClass dataEntityClass = new DataEntityClass()
            .id(1)
            .name(DataEntityClass.NameEnum.SET);

        final AssociatedOwner identity = new AssociatedOwner()
            .owner(new Owner().id(owner.getId()).name(owner.getName()))
            .identity(new Identity().username(activityPojo.getCreatedBy()));

        lenient().when(associatedOwnerMapper.mapAssociatedOwner(activityPojo.getCreatedBy(), owner))
            .thenReturn(identity);

        lenient().when(dataEntityMapper.mapType(any(DataEntityTypeDto.class))).thenReturn(dataEntityType);
        lenient().when(dataEntityMapper.mapEntityClass(any(DataEntityClassDto.class))).thenReturn(dataEntityClass);

        final DataEntityRef ref = new DataEntityRef()
            .id(dataEntityPojo.getId())
            .oddrn(dataEntityPojo.getOddrn())
            .externalName(dataEntityPojo.getExternalName())
            .internalName(dataEntityPojo.getInternalName())
            .entityClasses(List.of(dataEntityClass))
            .manuallyCreated(dataEntityPojo.getManuallyCreated())
            .url("");
        lenient().when(dataEntityMapper.mapRef(dataEntityPojo)).thenReturn(ref);

        final ActivityDto activityDto = new ActivityDto(activityPojo, owner, dataEntityPojo);
        final Activity activity = activityMapper.mapToActivity(activityDto);
        assertThat(activity.getCreatedAt().toLocalDateTime()).isEqualTo(activityPojo.getCreatedAt());
        assertThat(activity.getEventType().name()).isEqualTo(activityPojo.getEventType());
        assertThat(activity.getCreatedBy()).isEqualTo(identity);
        assertThat(activity.getDataEntity()).isEqualTo(ref);
        assertThat(activity.getSystemEvent()).isEqualTo(activityPojo.getIsSystemEvent());
        switch (eventTypeDto) {
            case OWNERSHIP_CREATED, OWNERSHIP_UPDATED, OWNERSHIP_DELETED -> validateOwnerships(activity, activityPojo);
            default -> {
            }
        }
    }

    private void validateOwnerships(final Activity activity, final ActivityPojo activityPojo) {
        final List<OwnershipActivityState> oldOwnerships = activity.getOldState().getOwnerships();
        final List<OwnershipActivityState> newOwnerships = activity.getNewState().getOwnerships();
        final List<OwnershipActivityStateDto> oldState =
            JSONSerDeUtils.deserializeJson(activityPojo.getOldState().data(), new TypeReference<>() {
            });
        final List<OwnershipActivityStateDto> newState =
            JSONSerDeUtils.deserializeJson(activityPojo.getNewState().data(), new TypeReference<>() {
            });
        assertThat(oldOwnerships)
            .extracting(OwnershipActivityState::getOwnerName)
            .containsExactlyInAnyOrder(
                oldState.stream().map(OwnershipActivityStateDto::ownerName).toArray(String[]::new));
        assertThat(oldOwnerships)
            .extracting(OwnershipActivityState::getRoleName)
            .containsExactlyInAnyOrder(
                oldState.stream().map(OwnershipActivityStateDto::roleName).toArray(String[]::new));
        assertThat(newOwnerships)
            .extracting(OwnershipActivityState::getOwnerName)
            .containsExactlyInAnyOrder(
                newState.stream().map(OwnershipActivityStateDto::ownerName).toArray(String[]::new));
        assertThat(newOwnerships)
            .extracting(OwnershipActivityState::getRoleName)
            .containsExactlyInAnyOrder(
                newState.stream().map(OwnershipActivityStateDto::roleName).toArray(String[]::new));
    }

    private ActivityPojo createPojo(final ActivityEventTypeDto eventTypeDto) {
        return new ActivityPojo()
            .setId(RANDOM.nextLong())
            .setCreatedAt(LocalDateTime.now())
            .setCreatedBy(UUID.randomUUID().toString())
            .setDataEntityId(RANDOM.nextLong())
            .setEventType(eventTypeDto.name())
            .setIsSystemEvent(RANDOM.nextBoolean())
            .setOldState(JSONB.jsonb(generateState(eventTypeDto)))
            .setNewState(JSONB.jsonb(generateState(eventTypeDto)));
    }

    private DataEntityPojo createDataEntityPojo(final Long id) {
        return new DataEntityPojo()
            .setId(id)
            .setManuallyCreated(false)
            .setIsDeleted(false)
            .setEntityClassIds(new Integer[] {1, 2, 3})
            .setTypeId(1)
            .setExternalName(UUID.randomUUID().toString())
            .setOddrn(UUID.randomUUID().toString());
    }

    private ActivityCreateEvent createEvent(final ActivityEventTypeDto eventTypeDto) {
        return ActivityCreateEvent.builder()
            .dataEntityId(RANDOM.nextLong())
            .systemEvent(RANDOM.nextBoolean())
            .eventType(eventTypeDto)
            .oldState(generateState(eventTypeDto))
            .newState(generateState(eventTypeDto))
            .build();
    }

    private String generateState(final ActivityEventTypeDto eventTypeDto) {
        return switch (eventTypeDto) {
            case OWNERSHIP_CREATED, OWNERSHIP_UPDATED, OWNERSHIP_DELETED -> generateOwnershipState();
            case TERM_ASSIGNED, TERM_ASSIGNMENT_DELETED -> generateTermsState();
            case DATA_ENTITY_CREATED -> generateDataEntityCreatedState();
            case TAGS_ASSOCIATION_UPDATED -> generateTagsState();
            case DESCRIPTION_UPDATED -> generateDescriptionState();
            case BUSINESS_NAME_UPDATED -> generateBusinessNameState();
            case DATASET_FIELD_VALUES_UPDATED -> generateDatasetFieldValuesState();
            case DATASET_FIELD_DESCRIPTION_UPDATED, DATASET_FIELD_LABELS_UPDATED ->
                generateDatasetFieldInformationState();
            case CUSTOM_GROUP_CREATED, CUSTOM_GROUP_UPDATED, CUSTOM_GROUP_DELETED -> generateCustomGroupState();
            default -> "";
        };
    }

    private String generateOwnershipState() {
        final List<OwnershipActivityStateDto> state = GENERATOR.objects(OwnershipActivityStateDto.class, 5)
            .toList();
        return JSONSerDeUtils.serializeJson(state);
    }

    private String generateDataEntityCreatedState() {
        final DataEntityCreatedActivityStateDto state = GENERATOR.nextObject(DataEntityCreatedActivityStateDto.class);
        return JSONSerDeUtils.serializeJson(state);
    }

    private String generateTermsState() {
        final List<TermActivityStateDto> state = GENERATOR.objects(TermActivityStateDto.class, 5)
            .toList();
        return JSONSerDeUtils.serializeJson(state);
    }

    private String generateTagsState() {
        final List<TagActivityStateDto> state = GENERATOR.objects(TagActivityStateDto.class, 5)
            .toList();
        return JSONSerDeUtils.serializeJson(state);
    }

    private String generateDescriptionState() {
        final DescriptionActivityStateDto state = GENERATOR.nextObject(DescriptionActivityStateDto.class);
        return JSONSerDeUtils.serializeJson(state);
    }

    private String generateBusinessNameState() {
        final BusinessNameActivityStateDto state = GENERATOR.nextObject(BusinessNameActivityStateDto.class);
        return JSONSerDeUtils.serializeJson(state);
    }

    private String generateDatasetFieldValuesState() {
        final DatasetFieldValuesActivityStateDto state = new DatasetFieldValuesActivityStateDto(
            RANDOM.nextLong(),
            UUID.randomUUID().toString(),
            JSONB.jsonb("{\"type\": \"TYPE_INTEGER\", \"is_nullable\": true, \"logical_type\": \"integer\"}"),
            UUID.randomUUID().toString(),
            GENERATOR.objects(DatasetFieldEnumValuesActivityStateDto.class, 5).toList()
        );
        return JSONSerDeUtils.serializeJson(state);
    }

    private String generateDatasetFieldInformationState() {
        final DatasetFieldInformationActivityStateDto state = new DatasetFieldInformationActivityStateDto(
            RANDOM.nextLong(),
            UUID.randomUUID().toString(),
            JSONB.jsonb("{\"type\": \"TYPE_INTEGER\", \"is_nullable\": true, \"logical_type\": \"integer\"}"),
            UUID.randomUUID().toString(),
            GENERATOR.objects(DatasetFieldLabelActivityStateDto.class, 5).toList()
        );
        return JSONSerDeUtils.serializeJson(state);
    }

    private String generateCustomGroupState() {
        final CustomGroupActivityStateDto state = GENERATOR.nextObject(CustomGroupActivityStateDto.class);
        return JSONSerDeUtils.serializeJson(state);
    }
}
