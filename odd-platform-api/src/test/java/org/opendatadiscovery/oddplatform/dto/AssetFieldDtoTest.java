package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ST-13a (#1847): the {@code columns} token allow-list is fail-closed the way {@code sort} / {@code my_data} are —
 * unknown, client-only, fixed-column, blank, duplicate and differently-cased tokens never fail a request.
 */
class AssetFieldDtoTest {

    @Test
    void fromTokens_nullOrEmpty_isEmpty() {
        assertThat(AssetFieldDto.fromTokens(null)).isEmpty();
        assertThat(AssetFieldDto.fromTokens(List.of())).isEmpty();
    }

    @Test
    void fromTokens_keepsKnownTokens_caseInsensitively_andDedups() {
        final Set<AssetFieldDto> fields =
            AssetFieldDto.fromTokens(List.of("namespace", "OWNERS", " Updated_At ", "owners"));
        assertThat(fields).containsExactlyInAnyOrder(AssetFieldDto.NAMESPACE, AssetFieldDto.OWNERS,
            AssetFieldDto.UPDATED_AT);
    }

    @Test
    void fromTokens_dropsUnknownClientOnlyFixedAndBlankTokens() {
        final Set<AssetFieldDto> fields = AssetFieldDto.fromTokens(
            Arrays.asList("type", "status", "query", "name", "recently_viewed", "nope", "", "  ", null, "tags"));
        assertThat(fields).containsExactly(AssetFieldDto.TAGS);
    }

    @Test
    void everyTokenIsItsLowerCaseWireSpelling() {
        for (final AssetFieldDto field : AssetFieldDto.values()) {
            assertThat(field.token()).isEqualTo(field.name().toLowerCase());
            assertThat(AssetFieldDto.fromTokens(List.of(field.token()))).containsExactly(field);
        }
    }
}
