package org.opendatadiscovery.oddplatform.dto.security;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserProviderRole {
    ADMIN("Administrator"),
    USER("User");

    private final String value;
}