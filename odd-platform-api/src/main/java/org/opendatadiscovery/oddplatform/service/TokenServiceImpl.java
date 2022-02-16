package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {
    private static final String DEFAULT_TOKEN_NAME_FOR_DATASOURCE = "default token name for Datasource";
    private static final String DEFAULT_TOKEN_DESCRIPTION_FOR_DATASOURCE = "default token description for Datasource";

    @Override
    public TokenPojo generateToken(final TokenPojo tokenPojo, final String username) {
        if (ObjectUtils.isEmpty(tokenPojo)) {
            return new TokenPojo()
                    .setName(DEFAULT_TOKEN_NAME_FOR_DATASOURCE)
                    .setDescription(DEFAULT_TOKEN_DESCRIPTION_FOR_DATASOURCE)
                    .setCreatedAt(LocalDateTime.now())
                    .setCreatedBy(username)
                    .setValue(RandomStringUtils.randomAlphanumeric(40))
                    .setUpdatedAt(LocalDateTime.now())
                    .setUpdatedBy(username);
        } else {
            return tokenPojo
                    .setValue(RandomStringUtils.randomAlphanumeric(40))
                    .setUpdatedAt(LocalDateTime.now())
                    .setUpdatedBy(username);
        }
    }
}
