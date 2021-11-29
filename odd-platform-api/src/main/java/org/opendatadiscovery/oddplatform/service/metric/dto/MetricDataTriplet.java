package org.opendatadiscovery.oddplatform.service.metric.dto;

import lombok.Data;

@Data
public class MetricDataTriplet {
    public static final MetricDataTriplet ROWS_COUNT = new MetricDataTriplet(
        "oddplatform.dataset.rows_count",
        "Dataset's rows count metric",
        "oddplatform.dataset.rows_count"
    );

    public static final MetricDataTriplet TASK_RUN_DURATION = new MetricDataTriplet(
        "oddplatform.task_run.duration",
        "Task Run duration",
        "oddplatform.task_run.duration"
    );

    public static final MetricDataTriplet TASK_RUN_STATUS = new MetricDataTriplet(
        "oddplatform.task_run.status",
        "Task Run Status. 1 means success, 0 means any other status",
        "oddplatform.task_run.status"
    );

    public static final MetricDataTriplet DF_NULLS_COUNT = new MetricDataTriplet(
        "oddplatform.dataset_field.nulls_count",
        "Dataset's field nulls' count",
        "oddplatform.dataset_field.nulls_count"
    );

    public static final MetricDataTriplet DF_UNIQUE_COUNT = new MetricDataTriplet(
        "oddplatform.dataset_field.unique_count",
        "Dataset's field unique count",
        "oddplatform.dataset_field.unique_count"
    );

    public static final MetricDataTriplet DF_TRUE_COUNT = new MetricDataTriplet(
        "oddplatform.dataset_field.true_count",
        "Dataset's field true count",
        "oddplatform.dataset_field.true_count"
    );

    public static final MetricDataTriplet DF_FALSE_COUNT = new MetricDataTriplet(
        "oddplatform.dataset_field.false_count",
        "Dataset's field false count",
        "oddplatform.dataset_field.false_count"
    );

    public static final MetricDataTriplet DF_LOWEST_VALUE = new MetricDataTriplet(
        "oddplatform.dataset_field.lowest_value",
        "Dataset's field lowest value",
        "oddplatform.dataset_field.lowest_value"
    );

    public static final MetricDataTriplet DF_HIGHEST_VALUE = new MetricDataTriplet(
        "oddplatform.dataset_field.highest_value",
        "Dataset's field highest value",
        "oddplatform.dataset_field.highest_value"
    );

    public static final MetricDataTriplet DF_MEAN_VALUE = new MetricDataTriplet(
        "oddplatform.dataset_field.mean_value",
        "Dataset's field mean value",
        "oddplatform.dataset_field.mean_value"
    );

    public static final MetricDataTriplet DF_MEDIAN_VALUE = new MetricDataTriplet(
        "oddplatform.dataset_field.median_value",
        "Dataset's field median value",
        "oddplatform.dataset_field.median_value"
    );

    public static final MetricDataTriplet DF_MAX_LENGTH = new MetricDataTriplet(
        "oddplatform.dataset_field.max_length",
        "Dataset's field maximum length",
        "oddplatform.dataset_field.max_length"
    );

    public static final MetricDataTriplet DF_AVG_LENGTH = new MetricDataTriplet(
        "oddplatform.dataset_field.avg_length",
        "Dataset's field average length",
        "oddplatform.dataset_field.avg_length"
    );

    private final String name;
    private final String description;
    private final String unit;
}
