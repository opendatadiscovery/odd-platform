package org.opendatadiscovery.oddplatform.dto;

public enum FacetType {
    ENTITY_CLASSES,
    TYPES,
    NAMESPACES,
    DATA_SOURCES,
    OWNERS,
    TAGS;

    public static FacetType lookup(final String facetType) {
        for (final FacetType ft : FacetType.values()) {
            if (ft.name().equalsIgnoreCase(facetType)) {
                return ft;
            }
        }

        throw new IllegalArgumentException(String.format("No entry with type %s was found", facetType));
    }
}