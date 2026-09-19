package org.opendatadiscovery.oddplatform.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.opendatadiscovery.oddplatform.api.contract.model.Asset;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetFields;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * The result-column projection is ABSENT when not asked for, never {@code null} (CTRIB-073 / #1847 ST-13a, ADR D9).
 *
 * <p>The platform serialises nulls (a search item today reads {@code "data_entity": null, "term": {...}}), which is
 * the contract every existing client parses and must keep byte for byte. The two ST-13a additions are the one place
 * that posture would leak: a request WITHOUT {@code columns} would grow every item by {@code "fields": null}, and a
 * request WITH {@code columns} would carry a 19-key object of nulls for everything unrequested or inapplicable —
 * while the contract says a property is present ONLY when its column was asked for AND the row carries it. So the
 * inclusion rule is narrowed to exactly {@code Asset.fields} and the properties of {@code AssetFields} through
 * Jackson mix-ins; the refs and every other model keep their nulls. Applied to the ONE {@code ObjectMapper} the
 * WebFlux codecs use, via the Boot customizer hook.
 */
@Configuration
public class AssetFieldsJsonConfiguration {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer assetFieldsNonNullCustomizer() {
        return builder -> builder
            .mixIn(AssetFields.class, NonNullProperties.class)
            .mixIn(Asset.class, AssetFieldsProperty.class);
    }

    /** Every property of {@link AssetFields} is written only when set. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    interface NonNullProperties {
    }

    /** Only {@link Asset#getFields()} — the refs of an {@link Asset} keep the platform's null posture. */
    interface AssetFieldsProperty {
        @JsonInclude(JsonInclude.Include.NON_NULL)
        AssetFields getFields();
    }
}
