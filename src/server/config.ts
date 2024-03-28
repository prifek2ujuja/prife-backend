const config = {
    mongo_uri: process.env["MONGO_URI"] ?? "",
    environment: process.env["NODE_ENV"] ?? "",
    access_token_secret: process.env["ACCESS_TOKEN_SECRET"] ?? "",
    refresh_token_secret: process.env["REFRESH_TOKEN_SECRET"] ?? "",
}

export default config