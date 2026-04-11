package org.opendatadiscovery.oddplatform.datacollaboration.dto;

import lombok.Builder;

@Builder
public record MessageUserDto(String id, String name, String userAvatar) {
}
