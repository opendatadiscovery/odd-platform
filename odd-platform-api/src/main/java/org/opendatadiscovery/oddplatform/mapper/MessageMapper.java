package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.Map;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.opendatadiscovery.oddplatform.api.contract.model.Message;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannel;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageList;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageChannelDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageUserDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;

@Mapper(config = MapperConfig.class)
public interface MessageMapper {
    @Mapping(target = "channel", source = ".", qualifiedByName = "messageChannel")
    Message mapPojo(final MessagePojo messagePojo);

    default MessageList mapPojos(final List<MessagePojo> messagePojos) {
        return new MessageList().items(messagePojos.stream().map(this::mapPojo).toList());
    }

    default MessageList mapPojos(final List<MessagePojo> messagePojos, final Map<String, MessageUserDto> messageUsers) {
        final List<Message> messages = messagePojos.stream()
            .map(messagePojo -> {
                final Message message = mapPojo(messagePojo);
                final MessageUserDto messageUserDto = messageUsers.get(messagePojo.getProviderMessageAuthor());
                if (messageUserDto != null) {
                    message.setUsername(messageUserDto.name());
                    message.setUsernameAvatar(messageUserDto.userAvatar());
                }
                return message;
            })
            .toList();

        return new MessageList().items(messages);
    }

    @Named("messageChannel")
    default MessageChannel messageChannel(final MessagePojo message) {
        return new MessageChannel()
            .channelId(message.getProviderChannelId())
            .name(message.getProviderChannelId());
    }

    @Mapping(source = "id", target = "channelId")
    MessageChannel mapSlackChannel(final MessageChannelDto slackChannel);

    default MessageChannelList mapSlackChannelList(final List<MessageChannelDto> channels) {
        return new MessageChannelList().items(channels.stream().map(this::mapSlackChannel).toList());
    }
}
