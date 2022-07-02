package org.opendatadiscovery.oddplatform.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.jooq.JSONB;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.opendatadiscovery.oddplatform.api.contract.model.Activity;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.CustomGroupActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClass;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldInformationActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldValuesActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.DescriptionActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalNameActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.TagActivityState;
import org.opendatadiscovery.oddplatform.api.contract.model.TermActivityState;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityCreateEvent;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.CustomGroupActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.DatasetFieldInformationActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.DatasetFieldValuesActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.DescriptionActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.InternalNameActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.OwnershipActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.TagActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.TermActivityStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ActivityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(config = MapperConfig.class, uses = {OffsetDateTimeMapper.class})
public abstract class ActivityMapper {

    @Autowired
    protected AssociatedOwnerMapper associatedOwnerMapper;

    @Autowired
    protected DataEntityMapper dataEntityMapper;

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
            case OWNERSHIP_CREATED, OWNERSHIP_UPDATED, OWNERSHIP_DELETED -> mapOwnerships(jsonb);
            case TAGS_ASSOCIATION_UPDATED -> mapTags(jsonb);
            case TERM_ASSIGNED, TERM_ASSIGNMENT_DELETED -> mapTerms(jsonb);
            case DESCRIPTION_UPDATED -> mapDescription(jsonb);
            case INTERNAL_NAME_UPDATED -> mapInternalName(jsonb);
            case CUSTOM_METADATA_CREATED, CUSTOM_METADATA_UPDATED, CUSTOM_METADATA_DELETED -> mapCustomMetadata(jsonb);
            case DATASET_FIELD_VALUES_UPDATED -> mapDatasetFieldValues(jsonb);
            case DATASET_FIELD_INFORMATION_UPDATED -> mapDatasetFieldInformation(jsonb);
            case CUSTOM_GROUP_CREATED, CUSTOM_GROUP_UPDATED, CUSTOM_GROUP_DELETED -> mapCustomGroup(jsonb);
            default -> new ActivityState();
        };
    }

    ActivityState mapOwnerships(final JSONB jsonb) {
        final List<OwnershipActivityStateDto> stateDtos = JSONSerDeUtils.deserializeJson(jsonb.data(),
            new TypeReference<List<OwnershipActivityStateDto>>() {
            });
        final List<OwnershipActivityState> ownershipActivityStates = stateDtos.stream()
            .map(this::mapOwnershipActivityState).toList();
        return new ActivityState().ownerships(ownershipActivityStates);
    }

    abstract OwnershipActivityState mapOwnershipActivityState(final OwnershipActivityStateDto dto);

    ActivityState mapTags(final JSONB jsonb) {
        final List<TagActivityStateDto> stateDtos = JSONSerDeUtils.deserializeJson(jsonb.data(),
            new TypeReference<List<TagActivityStateDto>>() {
            });
        final List<TagActivityState> tagActivityStates = stateDtos.stream()
            .map(this::mapTagActivityState).toList();
        return new ActivityState().tags(tagActivityStates);
    }

    abstract TagActivityState mapTagActivityState(final TagActivityStateDto dto);

    ActivityState mapTerms(final JSONB jsonb) {
        final List<TermActivityStateDto> stateDtos = JSONSerDeUtils.deserializeJson(jsonb.data(),
            new TypeReference<List<TermActivityStateDto>>() {
            });
        final List<TermActivityState> termActivityStates = stateDtos.stream()
            .map(this::mapTermActivityState).toList();
        return new ActivityState().terms(termActivityStates);
    }

    abstract TermActivityState mapTermActivityState(final TermActivityStateDto dto);

    ActivityState mapDescription(final JSONB jsonb) {
        final DescriptionActivityStateDto stateDto =
            JSONSerDeUtils.deserializeJson(jsonb.data(), DescriptionActivityStateDto.class);
        final DescriptionActivityState state = mapDescriptionActivityState(stateDto);
        return new ActivityState().description(state);
    }

    abstract DescriptionActivityState mapDescriptionActivityState(final DescriptionActivityStateDto dto);

    ActivityState mapInternalName(final JSONB jsonb) {
        final InternalNameActivityStateDto stateDto =
            JSONSerDeUtils.deserializeJson(jsonb.data(), InternalNameActivityStateDto.class);
        final InternalNameActivityState state = mapInternalNameActivityState(stateDto);
        return new ActivityState().internalName(state);
    }

    abstract InternalNameActivityState mapInternalNameActivityState(final InternalNameActivityStateDto dto);

    ActivityState mapDatasetFieldValues(final JSONB jsonb) {
        final DatasetFieldValuesActivityStateDto stateDto =
            JSONSerDeUtils.deserializeJson(jsonb.data(), DatasetFieldValuesActivityStateDto.class);
        return new ActivityState().datasetFieldValues(mapDatasetFieldValuesState(stateDto));
    }

    @Mapping(source = "dto.type", target = "type", qualifiedByName = "deserializeType")
    abstract DatasetFieldValuesActivityState mapDatasetFieldValuesState(final DatasetFieldValuesActivityStateDto dto);

    ActivityState mapDatasetFieldInformation(final JSONB jsonb) {
        final DatasetFieldInformationActivityStateDto stateDto =
            JSONSerDeUtils.deserializeJson(jsonb.data(), DatasetFieldInformationActivityStateDto.class);
        return new ActivityState().datasetFieldInformation(mapDatasetFieldInformation(stateDto));
    }

    @Mapping(source = "dto.type", target = "type", qualifiedByName = "deserializeType")
    abstract DatasetFieldInformationActivityState mapDatasetFieldInformation(
        final DatasetFieldInformationActivityStateDto dto);

    ActivityState mapCustomGroup(final JSONB jsonb) {
        final CustomGroupActivityStateDto stateDto =
            JSONSerDeUtils.deserializeJson(jsonb.data(), CustomGroupActivityStateDto.class);
        return new ActivityState().customGroup(mapCustomGroupActivityState(stateDto));
    }

    //todo map typeId
    @Mapping(source = "name", target = "internalName")
    abstract CustomGroupActivityState mapCustomGroupActivityState(final CustomGroupActivityStateDto dto);

    List<DataEntityClass> mapDataEntityClasses(final List<Integer> entityClassIds) {
        final Set<DataEntityClassDto> entityClasses =
            DataEntityClassDto.findByIds(entityClassIds.toArray(Integer[]::new));
        return entityClasses.stream().map(dataEntityMapper::mapEntityClass).toList();
    }

    @Named("deserializeType")
    DataSetFieldType deserializeType(final JSONB type) {
        return JSONSerDeUtils.deserializeJson(type.data(), DataSetFieldType.class);
    }

    ActivityState mapCustomMetadata(final JSONB jsonb) {
        return new ActivityState();
    }

    @Named("mapCreatedBy")
    AssociatedOwner mapUser(final ActivityDto activityDto) {
        return associatedOwnerMapper.mapAssociatedOwner(activityDto.activity().getCreatedBy(), activityDto.user());
    }
}
