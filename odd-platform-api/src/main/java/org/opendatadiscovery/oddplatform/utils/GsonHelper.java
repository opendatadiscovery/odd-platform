package org.opendatadiscovery.oddplatform.utils;

import com.google.gson.Gson;
import com.slack.api.util.json.GsonFactory;
import lombok.experimental.UtilityClass;

@UtilityClass
public class GsonHelper {
    private static final Gson GSON = GsonFactory.createSnakeCase();

    public <T> T fromJson(final String json, final Class<T> clazz) {
        return GSON.fromJson(json, clazz);
    }

    public String toJson(final Object o) {
        return GSON.toJson(o);
    }
}
