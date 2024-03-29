const config = {
    mongo_uri: process.env["MONGO_URI"] ?? "",
    environment: process.env["NODE_ENV"] ?? "",
    access_token_secret: process.env["ACCESS_TOKEN_SECRET"] ?? "",
    refresh_token_secret: process.env["REFRESH_TOKEN_SECRET"] ?? "",
    frontend_url_dev: process.env["FRONTEND_URL_DEV"] ?? "",
    frontend_url_prod: process.env["FRONTEND_URL_PROD"] ?? "",
}

export default config