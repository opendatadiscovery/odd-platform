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
        // generate random values for record components
        final RecordComponent[] recordComponents = recordType.getRecordComponents();
        final Object[] randomValues = new Object[recordComponents.length];
        for (int i = 0; i < recordComponents.length; i++) {
            if (Collection.class.isAssignableFrom(recordComponents[i].getType())) {
                final Type type =
                    ((ParameterizedType) recordComponents[i].getGenericType()).getActualTypeArguments()[0];
                final String typeName;
                if (type instanceof WildcardType) {
                    // naively assume that we only have wildcards with upper bounds
                    typeName = ((WildcardType) type).getUpperBounds()[0].getTypeName();
                } else {
                    typeName = type.getTypeName();
                }
                final Collection<?> collection =
                    easyRandom.objects(Class.forName(typeName), 5)
                        .toList();
                randomValues[i] = collection;
            } else {
                randomValues[i] = easyRandom.nextObject(recordComponents[i].getType());
            }
        }
        // create a random instance with random values
        try {
            return getCanonicalConstructor(recordType).newInstance(randomValues);
        } catch (Exception e) {
            throw new ObjectCreationException("Unable to create a random instance of recordType " + recordType, e);
        }
    }

    private <T> Constructor<T> getCanonicalConstructor(final Class<T> recordType) {
        final RecordComponent[] recordComponents = recordType.getRecordComponents();
        final Class<?>[] componentTypes = new Class<?>[recordComponents.length];
        for (int i = 0; i < recordComponents.length; i++) {
            // recordComponents are ordered, see javadoc:
            // "The components are returned in the same order that they are declared in the record header"
            componentTypes[i] = recordComponents[i].getType();
        }
        try {
            return recordType.getDeclaredConstructor(componentTypes);
        } catch (NoSuchMethodException e) {
            // should not happen, from Record javadoc:
            // "A record class has the following mandated members: a public canonical constructor ,
            // whose descriptor is the same as the record descriptor;"
            throw new RuntimeException("Invalid record definition", e);
        }
    }
}
