UPDATE dataset_version
SET version_hash = NULL
WHERE (dataset_oddrn, version) IN
      (SELECT dataset_oddrn, max(version) AS "max"
       FROM dataset_version
       GROUP BY dataset_oddrn);