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

WITH insertedTokenCTE AS (INSERT INTO token (value) SELECT 'change' FROM data_source RETURNING id),
     tokenRowCTE AS (SELECT id AS tokenID, row_number() OVER () AS row_number FROM insertedTokenCTE),
     dataSourceCTE AS (SELECT id, row_number() OVER () AS row_number, token_id FROM data_source)
UPDATE data_source ds
SET token_id = (
    SELECT tokenRowCTE.tokenID
    FROM tokenRowCTE
             JOIN dataSourceCTE ON tokenRowCTE.row_number = dataSourceCTE.row_number
    WHERE dataSourceCTE.id = ds.id
);