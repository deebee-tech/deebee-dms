CREATE TABLE IF NOT EXISTS deebee_dms.organizations
(
    id serial NOT NULL,
    organization_identifier character varying(100) NOT NULL,
    organization_name character varying(200) NOT NULL,
    favicon_url character varying(1000),
    logo_url character varying(1000),
    is_default boolean NOT NULL DEFAULT false,
    PRIMARY KEY (id)
);