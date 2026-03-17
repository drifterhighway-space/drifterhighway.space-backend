import { UserPermissions } from "./user.model";

/**
 * @description
 * Represents a JWT Payload for authentication.
 * This class handles the construction and parsing of JWT tokens used for API authentication.
 * JWT Registered Claims (RFC 7519) include: iss, aud, sub, exp, iat
 */
export class JWTPayload {
    /**
     * @description JWT Issuer (RFC 7519) - Identity of the issuer
     */
    // JWT Registered Claims (See: https://datatracker.ietf.org/doc/html/rfc7519#section-4.1)
    // issuer
    public iss: string;

    /**
     * @description JWT Audience (RFC 7519) - Intended recipients of the JWT
     */
    // audience
    public aud: string;

    /**
     * @description JWT Subject (RFC 7519) - The principal that is the subject of the JWT
     */
    // subject
    public sub: string;

    /**
     * @description JWT Expiration (RFC 7519) - Numeric date when JWT expires
     */
    // expiration
    public exp: Date;

    /**
     * @description JWT Issued At (RFC 7519) - Numeric date when JWT was issued
     */
    // issued at
    public iat: number;

    public permissions: UserPermissions[];

    public user?: { Name: string };

    /**
     * @constructor Initializes JWTPayload with JWT claims
     * @param json - JSON object containing JWT claims
     */
    public constructor(json: any) {
        this.sub = json.sub;
        this.exp = json.exp;
        this.iss = json.iss;
        this.aud = json.aud;
        this.iat = json.iat;
        this.user = json.user;
        this.permissions = json.permissions ?? [UserPermissions.Scouts];
    }

    /**
     * @description Creates a new JWT Payload for authentication
     * @param subject - Subject ID for the JWT
     * @param audience - Audience for the JWT (e.g., "https://esi.tech")
     * @param expiration - Token expiration time in minutes (default: 60)
     * @returns JWTPayload instance
     */
    public static make(
        subject: string,
        audience: string,
        expiration: number = 60,
    ): JWTPayload {
        return new JWTPayload({
            iat: new Date().getTime(),
            iss: process.env.JWT_ISSUER,
            sub: subject,
            aud: audience,
            exp: new Date().getTime() + expiration * 60 * 1000 * 1000,
        });
    }
}
