package org.opendatadiscovery.oddplatform.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.ErrorCode;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

/**
 * Unit test for the policy-JSON validator's error contract (#1762).
 *
 * <p>Invalid policy JSON is USER input (POST/PUT /api/policies), so a validation failure is a client
 * error (400) that should carry the actionable detail — not an opaque 500. Before the fix the validator
 * threw a raw {@link IllegalArgumentException}, which the ControllerAdvice catch-all re-branded
 * {@code 500 SYS001 "Internal Server Error"}. It now throws {@link BadUserRequestException}
 * ({@link ErrorCode#BAD_REQUEST}/USR001), the platform's typed signal the advice maps to 400.
 *
 * <p>RED on the pre-fix code: the thrown type is {@code IllegalArgumentException}, so
 * {@code assertThatExceptionOfType(BadUserRequestException.class)} fails.
 */
class PolicyJSONValidatorTest {

    private final PolicyJSONValidator validator = newValidator();

    private static PolicyJSONValidator newValidator() {
        try {
            return new PolicyJSONValidator(new ObjectMapper());
        } catch (final IOException e) {
            throw new IllegalStateException("could not load the policy schema for the test", e);
        }
    }

    @Test
    void schemaInvalidPolicyIsAClientError() {
        // valid JSON, but the document violates policy_schema.json (no statements; unknown property)
        assertThatExceptionOfType(BadUserRequestException.class)
            .as("schema-invalid policy JSON is user input -> 400, not an opaque 500")
            .isThrownBy(() -> validator.validate("{\"foo\":\"bar\"}"))
            .withMessageStartingWith("Policy is not valid:")
            .satisfies(ex -> assertThat(ex.getCode()).isEqualTo(ErrorCode.BAD_REQUEST));
    }

    @Test
    void malformedJsonIsAClientError() {
        assertThatExceptionOfType(BadUserRequestException.class)
            .as("unparseable policy JSON is user input -> 400, not an opaque 500")
            .isThrownBy(() -> validator.validate("{ this is not valid json"))
            .withMessageStartingWith("Policy is not valid:")
            .satisfies(ex -> assertThat(ex.getCode()).isEqualTo(ErrorCode.BAD_REQUEST));
    }

    @Test
    void validatorDetailContainingPercentDoesNotBreakFormatting() {
        // The detail is passed as a format ARG, never concatenated into the format string, so a schema
        // message that echoes a '%' (here an unknown property name) cannot throw inside String.format.
        // On a naive concatenation into BadUserRequestException's format string this would raise an
        // IllegalFormatException instead of the expected BadUserRequestException.
        assertThatExceptionOfType(BadUserRequestException.class)
            .isThrownBy(() -> validator.validate("{\"a%sb\":1}"))
            .withMessageStartingWith("Policy is not valid:")
            .satisfies(ex -> assertThat(ex.getCode()).isEqualTo(ErrorCode.BAD_REQUEST));
    }

    @Test
    void validPolicyPasses() {
        assertThatCode(() -> validator.validate(
            "{\"statements\":[{\"resource\":{\"type\":\"MANAGEMENT\"},\"permissions\":[\"POLICY_CREATE\"]}]}"))
            .doesNotThrowAnyException();
    }
}
