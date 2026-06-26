package org.opendatadiscovery.oddplatform.dto.masking;

public enum MaskingRuleType {
    SHOW_LAST_4,
    SHOW_FIRST_4,
    HASH_SHA256,
    REDACT,
    EMAIL_MASK,
    PHONE_MASK,
    ID_CARD_MASK
}
