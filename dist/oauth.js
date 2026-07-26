import { createHmac, randomBytes } from "node:crypto";
function encode(value) {
    return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}
function compareEncodedPairs(left, right) {
    const leftKey = encode(left[0]);
    const rightKey = encode(right[0]);
    if (leftKey !== rightKey) {
        return leftKey < rightKey ? -1 : 1;
    }
    const leftValue = encode(left[1]);
    const rightValue = encode(right[1]);
    if (leftValue === rightValue) {
        return 0;
    }
    return leftValue < rightValue ? -1 : 1;
}
export function createOAuthAuthorizationHeader(url, method, credentials, options = {}) {
    const oauthParameters = {
        oauth_consumer_key: credentials.consumerKey,
        oauth_nonce: options.nonce ?? randomBytes(16).toString("hex"),
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: String(options.timestamp ?? Math.floor(Date.now() / 1000)),
        oauth_token: credentials.accessToken,
        oauth_version: "1.0"
    };
    const parameters = [
        ...url.searchParams.entries(),
        ...Object.entries(oauthParameters)
    ].sort(compareEncodedPairs);
    const normalizedParameters = parameters
        .map(([key, value]) => `${encode(key)}=${encode(value)}`)
        .join("&");
    const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
    const signatureBaseString = [
        method.toUpperCase(),
        encode(baseUrl),
        encode(normalizedParameters)
    ].join("&");
    const signingKey = `${encode(credentials.consumerSecret)}&${encode(credentials.tokenSecret)}`;
    const signature = createHmac("sha1", signingKey)
        .update(signatureBaseString)
        .digest("base64");
    const headerParameters = {
        ...oauthParameters,
        oauth_signature: signature
    };
    const header = Object.entries(headerParameters)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => `${encode(key)}="${encode(value)}"`)
        .join(", ");
    return `OAuth ${header}`;
}
