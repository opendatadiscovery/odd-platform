package org.opendatadiscovery.oddplatform.dto;

import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;

public record TokenDto(TokenPojo tokenPojo, boolean showToken) {
    public TokenDto(final TokenPojo pojo) {
        this(pojo, false);
    }
}
