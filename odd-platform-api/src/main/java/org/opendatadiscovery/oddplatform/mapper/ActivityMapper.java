package org.opendatadiscovery.oddplatform.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.JSONB;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValueCheckStrategy;
import org.opendatadiscovery.oddplatform.api.contract.model.Activity;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.BusinessNameActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.CustomGroupActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClass;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldInformationActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldValuesActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.DescriptionActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.TagActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.TermActivityState;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityCreateEvent;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.BusinessNameActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.CustomGroupActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.DataEntityCreatedActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.DatasetFieldInformationActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.DatasetFieldValuesActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.DescriptionActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.OwnershipActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.TagActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.TermActivityStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ActivityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(config = MapperConfig.class, uses = {OffsetDateTimeMapper.class})
public abstract class ActivityMapper {

    private AssociatedOwnerMapper associatedOwnerMapper;

    private DataEntityMapper dataEntityMapper;

    @Autowired
    public void setDataEntityMapper(final DataEntityMapper dataEntityMapper) {
        this.dataEntityMapper = dataEntityMapper;
    }

    @Autowired
    public void setAssociatedOwnerMapper(final AssociatedOwnerMapper associatedOwnerMapper) {
        this.associatedOwnerMapper = associatedOwnerMapper;
    }

    @Mapping(source = "event.systemEvent", target = "isSystemEvent")
    public abstract ActivityPojo mapToPojo(final ActivityCreateEvent event, final LocalDateTime createdAt,
                                           final String createdBy);

    JSONB mapToJson(final String value) {
        if (value == null) {
            return null;
        }
        return JSONB.jsonb(value);
    }

    @Mapping(source = "activityDto.activity", target = "oldState", qualifiedByName = "mapActivityOldState")
    @Mapping(source = "activityDto.activity", target = "newState", qualifiedByName = "mapActivityNewState")
    @Mapping(source = "activityDto", target = "createdBy", qualifiedByName = "mapCreatedBy")
    @Mapping(source = "activityDto.activity", target = ".")
    @Mapping(source = "activityDto.activity.isSystemEvent", target = "systemEvent")
    public abstract Activity mapToActivity(final ActivityDto activityDto);

    DataEntityRef mapDataEntity(final DataEntityPojo dataEntityPojo) {
        return dataEntityMapper.mapRef(dataEntityPojo);
    }

    @Named("mapActivityOldState")
    ActivityState mapActivityOldState(final ActivityPojo pojo) {
        final ActivityEventTypeDto eventTypeDto = ActivityEventTypeDto.valueOf(pojo.getEventType());
        return mapState(pojo.getOldState(), eventTypeDto);
    }

    @Named("mapActivityNewState")
    ActivityState mapActivityNewState(final ActivityPojo pojo) {
        final ActivityEventTypeDto eventTypeDto = ActivityEventTypeDto.valueOf(pojo.getEventType());
        return mapState(pojo.getNewState(), eventTypeDto);
    }

    ActivityState mapState(final JSONB jsonb, final ActivityEventTypeDto eventTypeDto) {
        return switch (eventTypeDto) {
            case OWNERSHIP_CREATED, OWNERSHIP_UPDATED, OWNERSHIP_DELETED -> mapOwnershipsState(jsonb);
            case TAGS_ASSOCIATION_UPDATED -> mapTagsState(jsonb);
            case DATA_ENTITY_CREATED -> mapDataEntityCreatedState(jsonb);
            case TERM_ASSIGNED, TERM_ASSIGNMENT_DELETED -> mapTermsState(jsonb);
            case DESCRIPTION_UPDATED -> mapDescriptionState(jsonb);
            case BUSINESS_NAME_UPDATED -> mapBusinessNameState(jsonb);
            case DATASET_FIELD_VALUES_UPDATED -> mapDatasetFieldValuesState(jsonb);
            case DATASET_FIELD_DESCRIPTION_UPDATED, DATASET_FIELD_LABELS_UPDATED ->
                mapDatasetFieldInformationState(jsonb);
            case CUSTOM_GROUP_CREATED, CUSTOM_GROUP_UPDATED, CUSTOM_GROUP_DELETED -> mapCustomGroupState(jsonb);
            default -> new ActivityState();
        };
    }

    ActivityState mapOwnershipsState(final JSONB jsonb) {
        final List<OwnershipActivityStateDto> stateDtos = JSONSerDeUtils
            .deserializeJson(jsonb.data(), new TypeReference<>() {
            });
        final List<OwnershipActivityState> ownershipActivityStates = stateDtos.stream()
            .map(this::mapOwnershipActivityState).toList();
        return new ActivityState().ownerships(ownershipActivityStates);
    }

    abstract OwnershipActivityState mapOwnershipActivityState(final OwnershipActivityStateDto dto);

    ActivityState mapTagsState(final JSONB jsonb) {
        final List<TagActivityStateDto> stateDtos = JSONSerDeUtils
            .deserializeJson(jsonb.data(), new TypeReference<>() {
            });
        final List<TagActivityState> tagActivityStates = stateDtos.stream()
            .map(this::mapTagActivityState).toList();
        return new ActivityState().tags(tagActivityStates);
    }

    abstract TagActivityState mapTagActivityState(final TagActivityStateDto dto);

    ActivityState mapDataEntityCreatedState(final JSONB jsonb) {
        final DataEntityCreatedActivityStateDto stateDto =
            JSONSerDeUtils.deserializeJson(jsonb.data(), DataEntityCreatedActivityStateDto.class);
        return new ActivityState().dataEntity(mapDataEntityActivityState(stateDto));
    }

    @Mapping(source = "dto.typeId", target = "type", qualifiedByName = "mapDataEntityType",
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
    abstract DataEntityActivityState mapDataEntityActivityState(final DataEntityCreatedActivityStateDto dto);

    ActivityState mapTermsState(final JSONB jsonb) {
        final List<TermActivityStateDto> stateDtos = JSONSerDeUtils
            .deserializeJson(jsonb.data(), new TypeReference<>() {
            });
        final List<TermActivityState> termActivityStates = stateDtos.stream()
            .map(this::mapTermActivityState).toList();
        return new ActivityState().terms(termActivityStates);
    }

    @Mapping(source = "dto.termId", target = "id")
    @Mapping(source = "dto.term", target = "name")
    abstract TermActivityState mapTermActivityState(final TermActivityStateDto dto);

    ActivityState mapDescriptionState(final JSONB jsonb) {
        final DescriptionActivityStateDto stateDto =
            JSONSerDeUtils.deserializeJson(jsonb.data(), DescriptionActivityStateDto.class);
        final DescriptionActivityState state = mapDescriptionActivityState(stateDto);
        return new ActivityState().description(state);
    }

    abstract DescriptionActivityState mapDescriptionActivityState(final DescriptionActivityStateDto dto);

    ActivityState mapBusinessNameState(final JSONB jsonb) {
        final BusinessNameActivityStateDto stateDto =
            JSONSerDeUtils.deserializeJson(jsonb.data(), BusinessNameActivityStateDto.class);
        final BusinessNameActivityState state = mapInternalNameActivityState(stateDto);
        return new ActivityState().businessName(state);
    }

    abstract BusinessNameActivityState mapInternalNameActivityState(final BusinessNameActivityStateDto dto);

    ActivityState mapDatasetFieldValuesState(final JSONB jsonb) {
        final DatasetFieldValuesActivityStateDto stateDto =
            JSONSerDeUtils.deserializeJson(jsonb.data(), DatasetFieldValuesActivityStateDto.class);
        return new ActivityState().datasetFieldValues(mapDatasetFieldValues(stateDto));
    }

    @Mapping(source = "dto.type", target = "type", qualifiedByName = "deserializeDatasetFieldType")
    abstract DatasetFieldValuesActivityState mapDatasetFieldValues(final DatasetFieldValuesActivityStateDto dto);

    ActivityState mapDatasetFieldInformationState(final JSONB jsonb) {
        final DatasetFieldInformationActivityStateDto stateDto =
            JSONSerDeUtils.deserializeJson(jsonb.data(), DatasetFieldInformationActivityStateDto.class);
        return new ActivityState().datasetFieldInformation(mapDatasetFieldInformation(stateDto));
    }

    @Mapping(source = "dto.type", target = "type", qualifiedByName = "deserializeDatasetFieldType")
    abstract DatasetFieldInformationActivityState mapDatasetFieldInformation(
        final DatasetFieldInformationActivityStateDto dto);

    ActivityState mapCustomGroupState(final JSONB jsonb) {
        final CustomGroupActivityStateDto stateDto =
            JSONSerDeUtils.deserializeJson(jsonb.data(), CustomGroupActivityStateDto.class);
        return new ActivityState().customGroup(mapCustomGroupActivityState(stateDto));
    }

    @Mapping(source = "name", target = "internalName")
    @Mapping(source = "dto.typeId", target = "type", qualifiedByName = "mapDataEntityType",
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
    abstract CustomGroupActivityState mapCustomGroupActivityState(final CustomGroupActivityStateDto dto);

    List<DataEntityClass> mapDataEntityClasses(final List<Integer> entityClassIds) {
        if (CollectionUtils.isEmpty(entityClassIds)) {
            return List.of();
        }
        final Set<DataEntityClassDto> entityClasses =
            DataEntityClassDto.findByIds(entityClassIds.toArray(Integer[]::new));
        return entityClasses.stream().map(dataEntityMapper::mapEntityClass).toList();
    }

    @Named("mapDataEntityType")
    DataEntityType mapDataEntityType(final Integer typeId) {
        return DataEntityTypeDto.findById(typeId)
            .map(dataEntityMapper::mapType)
            .orElseThrow(() -> new IllegalArgumentException(String.format("No type with id %d was found", typeId)));
    }

    @Named("deserializeDatasetFieldType")
    DataSetFieldType deserializeDatasetFieldType(final JSONB type) {
        return JSONSerDeUtils.deserializeJson(type.data(), DataSetFieldType.class);
    }

    @Named("mapCreatedBy")
    AssociatedOwner mapUser(final ActivityDto activityDto) {
        return associatedOwnerMapper.mapAssociatedOwner(
            new AssociatedOwnerDto(activityDto.activity().getCreatedBy(), activityDto.user(), null));
    }
}
