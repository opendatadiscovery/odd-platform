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

    @Override
    public TokenPojo generateToken(final TokenPojo tokenPojo, final String username) {
        if (ObjectUtils.isEmpty(tokenPojo)) {
            return new TokenPojo()
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
