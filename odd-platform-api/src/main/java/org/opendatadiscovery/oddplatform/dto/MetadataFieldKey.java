package org.opendatadiscovery.oddplatform.dto;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Data
public class MetadataFieldKey {

    private final String fieldName;
    private final MetadataTypeEnum fieldType;

    public MetadataFieldKey(final String fieldName, final String fieldType) {
        this.fieldName = fieldName;
        this.fieldType = MetadataTypeEnum.valueOf(fieldType);
    }

    public enum MetadataTypeEnum {
        INTEGER(Integer.class),
        FLOAT(Float.class),
        ARRAY(ArrayList.class),
        STRING(String.class),
        BOOLEAN(Boolean.class),
        DATETIME(Date.class),
        UNKNOWN(Void.class);

        @Getter
        private final Class<?> clazz;

        MetadataTypeEnum(final Class<?> clazz) {
            this.clazz = clazz;
        }

        private static final Map<Class<?>, MetadataTypeEnum> MAP = Arrays.stream(MetadataTypeEnum.values())
            .collect(Collectors.toMap(MetadataTypeEnum::getClazz, Function.identity()));

        public static MetadataTypeEnum getMetadataType(final Class<?> clazz) {
            return MAP.getOrDefault(clazz, UNKNOWN);
        }
    }
}
