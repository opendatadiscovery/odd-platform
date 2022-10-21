package org.opendatadiscovery.oddplatform.datacollaboration.test;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PostMessageRequest {
    @JsonProperty("channel")
    public String channelId;
}
