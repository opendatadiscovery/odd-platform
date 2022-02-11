package org.opendatadiscovery.oddplatform.repository.util;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TokenHelper {

    private final AuthIdentityProvider authIdentityProvider;

    public TokenPojo createTokenPojo(final DataSourceDto dto) {
        String username = authIdentityProvider.getUsername().block();
        return new TokenPojo()
            .setName(String.join(" ", "Default token name for Datasource:", dto.dataSource().getName()))
            .setDescription(String.join(" ", "Default token description for Datasource:", dto.dataSource().getName()))
            .setValue(RandomStringUtils.randomAlphanumeric(40))
            .setCreatedAt(LocalDateTime.now())
            .setCreatedBy("username")
            .setUpdatedAt(LocalDateTime.now())
            .setUpdatedBy("username");
    }

}
