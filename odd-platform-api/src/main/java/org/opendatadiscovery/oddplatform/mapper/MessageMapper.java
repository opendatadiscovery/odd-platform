package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.opendatadiscovery.oddplatform.api.contract.model.Message;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannel;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageList;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;

@Mapper(config = MapperConfig.class)
public interface MessageMapper {
    @Mapping(target = "channel", source = ".", qualifiedByName = "opa")
    Message mapPojo(final MessagePojo messagePojo);

    default MessageList mapPojos(final List<MessagePojo> messagePojos) {
        return new MessageList().items(messagePojos.stream().map(this::mapPojo).toList());
    }

    @Named("opa")
    default MessageChannel messageChannel(final MessagePojo message) {
        return new MessageChannel()
            .channelId(message.getChannelId())
            .name(message.getChannelId());
    }
}
