package org.opendatadiscovery.oddplatform.datacollaboration.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MapperConfig;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.opendatadiscovery.oddplatform.api.contract.model.SlackChannel;
import org.opendatadiscovery.oddplatform.api.contract.model.SlackChannelList;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.SlackChannelDto;

@Mapper
@MapperConfig(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DataCollaborationMapper {
    @Mapping(source = "id", target = "channelId")
    SlackChannel mapSlackChannel(final SlackChannelDto slackChannel);

    default SlackChannelList mapSlackChannelList(final List<SlackChannelDto> channels) {
        return new SlackChannelList().items(channels.stream().map(this::mapSlackChannel).toList());
    }
}
