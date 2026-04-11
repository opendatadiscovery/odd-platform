package org.opendatadiscovery.oddplatform.utils.lookup.validators;

import java.math.BigDecimal;
import java.sql.Date;
import java.util.UUID;
import org.jooq.JSONB;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
public class LookupTypesValidatorTest {
    private static final String JSON_STRING = """
            {
                "name": "name",
                "field_type": "VARCHAR",
                "is_nullable": false,
                "is_unique" : false,
                "default_value": "test"
                }""";
    public static final String UUID_EXAMPLE = "61ebf713-84ba-4b58-9a0d-5de556daa731";
    private final LookupBooleanValidator booleanValidator = new LookupBooleanValidator();
    private final LookupDateValidator dateValidator = new LookupDateValidator();
    private final LookupDecimalValidator decimalValidator = new LookupDecimalValidator();
    private final LookupJSONBValidator jsonbValidator = new LookupJSONBValidator();
    private final LookupUUIDValidator uuidValidator = new LookupUUIDValidator();

    @Test
    public void booleanValidatorTest() {
        assertEquals(true, booleanValidator.getValue("true", "column"));
        assertEquals(false, booleanValidator.getValue("false", "column"));

        assertThrows(BadUserRequestException.class, () -> booleanValidator.getValue("notboolean", "column"));
    }

    @Test
    public void dateValidatorTest() {
        assertEquals(Date.valueOf("2012-11-15"), dateValidator.getValue("2012-11-15", "column"));

        assertThrows(BadUserRequestException.class, () -> dateValidator.getValue("notdate", "column"));

        assertThrows(BadUserRequestException.class, () -> dateValidator.getValue("11-12-2016", "column"));
    }

    @Test
    public void decimalValidatorTest() {
        assertEquals(new BigDecimal("16.0"), decimalValidator.getValue("16.0", "column"));
        assertEquals(new BigDecimal("23.1"), decimalValidator.getValue("23.1", "column"));
        assertEquals(new BigDecimal("-15.1"), decimalValidator.getValue("-15.1", "column"));

        assertThrows(BadUserRequestException.class, () -> decimalValidator.getValue("notdecimal", "column"));
    }

    @Test
    public void jsonbValidatorTest() {
        assertEquals(JSONB.jsonb(JSON_STRING), jsonbValidator.getValue(JSON_STRING, "column"));

        assertThrows(BadUserRequestException.class, () -> jsonbValidator.getValue("notjson", "column"));
    }

    @Test
    public void uuidValidatorTest() {
        assertEquals(UUID.fromString(UUID_EXAMPLE), uuidValidator.getValue(UUID_EXAMPLE, "column"));

        assertThrows(BadUserRequestException.class, () -> jsonbValidator.getValue("not-uuid", "column"));
    }
}
