CREATE TABLE IF NOT EXISTS token
(
    id          bigserial PRIMARY KEY,
    value       varchar(40) NOT NULL,
    created_at  timestamp without time zone NOT NULL DEFAULT NOW(),
    created_by  varchar(255),
    updated_at  timestamp without time zone NOT NULL DEFAULT NOW(),
    updated_by  varchar(255)
);

ALTER TABLE data_source
    ADD COLUMN IF NOT EXISTS token_id bigint,
    ADD CONSTRAINT data_source_fk_token FOREIGN KEY (token_id) REFERENCES token (id);

WITH insertedTokenCTE AS (INSERT INTO token (value) SELECT 'change' from data_source RETURNING id),
     tokenRowCTE as (SELECT id as tokenID, row_number() over () as row_number from insertedTokenCTE),
     dataSourceCTE as (select id, row_number() over () as row_number, token_id from data_source)
UPDATE data_source ds
SET token_id = (
    select tokenRowCTE.tokenID
    from tokenRowCTE
             join dataSourceCTE on tokenRowCTE.row_number = dataSourceCTE.row_number
    where dataSourceCTE.id = ds.id
);