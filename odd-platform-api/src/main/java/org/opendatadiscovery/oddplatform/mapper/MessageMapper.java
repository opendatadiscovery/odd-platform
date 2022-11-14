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
import org.opendatadiscovery.oddplatform.api.contract.model.MessageState;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageChannelDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageUserDto;
import org.opendatadiscovery.oddplatform.dto.MessageDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;

@Mapper(config = MapperConfig.class)
public interface MessageMapper {
    @Mapping(target = "channel", source = ".", qualifiedByName = "messageChannel")
    @Mapping(target = "url", source = ".", qualifiedByName = "urlRef")
    @Mapping(target = "id", source = "uuid")
    @Mapping(
        target = "createdAt",
        expression = "java(messagePojo.getCreatedAt().withOffsetSameInstant(java.time.ZoneOffset.UTC))"
    )
    Message mapPojo(final MessagePojo messagePojo);

    default Message mapDto(final MessageDto messageDto) {
        if (messageDto == null || messageDto.message() == null) {
            return null;
        }

        return mapPojo(messageDto.message()).childrenMessagesCount(messageDto.childrenMessagesCount());
    }

    default MessageList mapDtos(final List<MessageDto> messageDtos, final Map<Long, String> ownerNameRepo) {
        return new MessageList().items(
            messageDtos.stream()
                .map(m -> mapDto(m).username(ownerNameRepo.get(m.message().getOwnerId())))
                .toList()
        );
    }

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
                } else {
                    message.setUsername(messagePojo.getProviderMessageAuthor());
                }
                return message;
            })
            .toList();

        return new MessageList().items(messages);
    }

    default MessageState mapMessageState(final Short messageStateCode) {
        final MessageStateDto messageState = MessageStateDto
            .fromCode(messageStateCode)
            .orElseThrow(
                () -> new IllegalStateException("There's no message state with code %d".formatted(messageStateCode)));

        return MessageState.fromValue(messageState.toString());
    }

    @Named("messageChannel")
    default MessageChannel messageChannel(final MessagePojo message) {
        return new MessageChannel()
            .channelId(message.getProviderChannelId())
            .name(message.getProviderChannelName());
    }

    @Named("urlRef")
    default String urlRef(final MessagePojo message) {
        return "/api/messages/%s/url".formatted(message.getUuid());
    }

    @Mapping(source = "id", target = "channelId")
    MessageChannel mapSlackChannel(final MessageChannelDto slackChannel);

    default MessageChannelList mapSlackChannelList(final List<MessageChannelDto> channels) {
        return new MessageChannelList().items(channels.stream().map(this::mapSlackChannel).toList());
    }
}
