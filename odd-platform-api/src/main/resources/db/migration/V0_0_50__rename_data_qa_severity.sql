UPDATE data_quality_test_severity
SET severity = CASE
                   WHEN severity = 'MAJOR' THEN 'CRITICAL'
                   WHEN severity = 'AVERAGE' THEN 'MAJOR'
    END
WHERE severity IN ('AVERAGE', 'MAJOR');