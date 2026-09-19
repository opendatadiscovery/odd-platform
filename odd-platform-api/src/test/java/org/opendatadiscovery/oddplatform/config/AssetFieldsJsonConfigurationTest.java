package org.opendatadiscovery.oddplatform.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.Asset;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetFields;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.Namespace;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ST-13a (#1847): the wire posture of the projection — absent when not asked, only the set properties when asked,
 * and the pre-existing null posture of everything else untouched (ADR D9 "byte for byte").
 */
class AssetFieldsJsonConfigurationTest {

    private final ObjectMapper mapper = configured();

    private static ObjectMapper configured() {
        final Jackson2ObjectMapperBuilder builder = Jackson2ObjectMapperBuilder.json();
        new AssetFieldsJsonConfiguration().assetFieldsNonNullCustomizer().customize(builder);
        return builder.build();
    }

    @Test
    void assetWithoutFields_serialisesExactlyAsBeforeSt13a() throws Exception {
        final Asset asset = new Asset().assetKind(AssetKind.TERM).term(new TermRef().id(1L).name("t"));
        final String json = mapper.writeValueAsString(asset);
        assertThat(json).as("no fields key at all").doesNotContain("\"fields\"");
        assertThat(json).as("the refs keep the platform's null posture").contains("\"data_entity\":null")
            .contains("\"query_example\":null");
    }

    @Test
    void assetWithFields_writesOnlyTheSetProperties() throws Exception {
        final Asset asset = new Asset().assetKind(AssetKind.TERM).term(new TermRef().id(1L).name("t"))
            .fields(new AssetFields().namespace(new Namespace().id(2L).name("ns")));
        final String json = mapper.writeValueAsString(asset);
        assertThat(json).contains("\"fields\":{\"namespace\":{\"id\":2,\"name\":\"ns\"}}");
        assertThat(json).doesNotContain("\"owners\"").doesNotContain("\"rows_count\"").doesNotContain("\"tags\"");
    }

    @Test
    void assetWithEmptyFields_writesAnEmptyObject() throws Exception {
        // A requested projection with nothing applicable (e.g. a query example asked for a namespace) is `{}`,
        // not absent: the caller asked, the row has nothing — the UI reads both as "no value".
        final String json = mapper.writeValueAsString(new Asset().assetKind(AssetKind.QUERY_EXAMPLE)
            .fields(new AssetFields()));
        assertThat(json).contains("\"fields\":{}");
    }
}
