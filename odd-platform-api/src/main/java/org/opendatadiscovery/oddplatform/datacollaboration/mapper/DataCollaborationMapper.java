package org.opendatadiscovery.oddplatform.datacollaboration.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MapperConfig;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannel;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.SlackChannelDto;

@Mapper
@MapperConfig(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DataCollaborationMapper {
    @Mapping(source = "id", target = "channelId")
    MessageChannel mapSlackChannel(final SlackChannelDto slackChannel);

    default MessageChannelList mapSlackChannelList(final List<SlackChannelDto> channels) {
        return new MessageChannelList().items(channels.stream().map(this::mapSlackChannel).toList());
    }
}
