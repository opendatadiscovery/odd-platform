package org.opendatadiscovery.oddplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SearchFilterDto {
    private long entityId;
    private String entityName;
    private boolean selected;
    private FacetType type;
    /**
     * ST-11 (#1845): {@code true} marks an EXCLUSION — an asset carrying this value is removed from the result.
     * Default {@code false} = a positive selection, which is what every request before the field existed sent, so a
     * session row stored before ST-11 deserialises with the same meaning it had. An excluded value is still
     * {@code selected} (it is an active part of the search — echoed, named, hidden from the option list); the
     * predicate readers take the positive views on {@link FacetStateDto} instead of the raw list.
     */
    private boolean exclude;
}
