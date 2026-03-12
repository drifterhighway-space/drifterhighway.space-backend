/**
 * @description
 * Represents authentication Token entities in the system.
 * Tokens are used for JWT-based authentication (Refresh and Access tokens).
 */
export default interface Token {
    /**
     * @description The actual token string (JWT token)
     */
    Token: string;

    /**
     * @description Token expiration date and time
     */
    Expires: Date;

    /**
     * @description Array of scopes/grants associated with this token
     */
    Scopes: string[];

    /**
     * @description Type of token (Refresh or Access)
     */
    Type: TokenType;
}

/**
 * @description Enumeration representing the type of authentication token
 */
export enum TokenType {
    /**
     * @description Refresh token used to obtain new access tokens
     */
    Refresh,

    /**
     * @description Access token used for API authorization
     */
    Access,
}
