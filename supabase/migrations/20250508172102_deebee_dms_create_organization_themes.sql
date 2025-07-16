CREATE TABLE IF NOT EXISTS deebee_dms.organization_themes
(
    id serial NOT NULL,
    organization_id integer NOT NULL,
    theme_name character varying(100) NOT NULL,
    css_text text NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT organization_themes_unique_theme UNIQUE (organization_id, theme_name),
    CONSTRAINT organization_themes_organizations FOREIGN KEY (organization_id)
        REFERENCES deebee_dms.organizations (id)
);