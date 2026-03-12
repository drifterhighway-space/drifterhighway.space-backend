namespace NodeJS {
    export interface ProcessEnv {
        DEFAULT_QUERY_LIMIT: string;
        LOG_LEVEL: string;
        DB_HOST: string;
        DB_USER: string;
        DB_PASS: string;
        DB_NAME: string;
        BACKEND_PORT: string;
        SSL_CERT: string;
        SSL_PKEY: string;
        SSL_ENABLED: string;
        JWT_ISSUER: string;
        JWT_SECRET: string;
        SWAG_PAGE_TITLE: string;
        SWAG_PAGE_DESC: string;
        SWAG_VERSION: string;
        SWAG_HOST: string;
        SWAG_BASE_PATH: string;
        EVE_CLIENT_ID: string;
        EVE_SECRET_KEY: string;
        EVE_CALLBACK_URL: string;
        ADMIN_ID: string;
    }
}
