package org.opendatadiscovery.oddplatform.utils;

import java.lang.reflect.Constructor;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.RecordComponent;
import java.lang.reflect.Type;
import java.lang.reflect.WildcardType;
import java.util.Collection;
import lombok.SneakyThrows;
import org.jeasy.random.EasyRandom;
import org.jeasy.random.ObjectCreationException;
import org.jeasy.random.ObjenesisObjectFactory;
import org.jeasy.random.api.RandomizerContext;

public class RecordFactory extends ObjenesisObjectFactory {

    private EasyRandom easyRandom;

    @Override
    public <T> T createInstance(final Class<T> type, final RandomizerContext context) {
        if (easyRandom == null) {
            easyRandom = new EasyRandom(context.getParameters());
        }

        if (type.isRecord()) {
            return createRandomRecord(type);
        } else {
            return super.createInstance(type, context);
        }
    }

    @SneakyThrows
    private <T> T createRandomRecord(final Class<T> recordType) {
        final RecordComponent[] recordComponents = recordType.getRecordComponents();
        final Object[] randomValues = new Object[recordComponents.length];
        for (int i = 0; i < recordComponents.length; i++) {
            if (Collection.class.isAssignableFrom(recordComponents[i].getType())) {
                randomValues[i] = generateCollectionField(recordComponents[i]);
            } else {
                randomValues[i] = easyRandom.nextObject(recordComponents[i].getType());
            }
        }
        try {
            return getCanonicalConstructor(recordType).newInstance(randomValues);
        } catch (final Exception e) {
            throw new ObjectCreationException("Unable to create a random instance of recordType " + recordType, e);
        }
    }

    private <T> Constructor<T> getCanonicalConstructor(final Class<T> recordType) {
        final RecordComponent[] recordComponents = recordType.getRecordComponents();
        final Class<?>[] componentTypes = new Class<?>[recordComponents.length];
        for (int i = 0; i < recordComponents.length; i++) {
            componentTypes[i] = recordComponents[i].getType();
        }
        try {
            return recordType.getDeclaredConstructor(componentTypes);
        } catch (final NoSuchMethodException e) {
            throw new RuntimeException("Invalid record definition", e);
        }
    }

    @SneakyThrows
    private Collection<?> generateCollectionField(final RecordComponent recordComponent) {
        final Type type = ((ParameterizedType) recordComponent.getGenericType()).getActualTypeArguments()[0];
        final String typeName;
        if (type instanceof WildcardType wildcardType) {
            if (wildcardType.getUpperBounds().length > 0) {
                typeName = wildcardType.getUpperBounds()[0].getTypeName();
            } else if (wildcardType.getLowerBounds().length > 0) {
                typeName = wildcardType.getLowerBounds()[0].getTypeName();
            } else {
                typeName = Object.class.getTypeName();
            }
        } else {
            typeName = type.getTypeName();
        }
        return easyRandom.objects(Class.forName(typeName), 5).toList();
    }
}
