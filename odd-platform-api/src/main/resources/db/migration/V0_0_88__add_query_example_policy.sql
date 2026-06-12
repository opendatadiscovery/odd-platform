UPDATE policy
SET policy = 
    jsonb_pretty(
        regexp_replace(
            policy,
            '"statements": \[',
            '"statements": [{' || '"resource": {"type": "QUERY_EXAMPLE"}, "permissions": ["ALL"]},',
            'g'
        )::jsonb
    )
WHERE name = 'Administrator'; 