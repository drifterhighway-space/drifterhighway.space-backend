/**
 * EVE Online Secure Interface (ESI) API Client
 *
 * This module provides a client interface for interacting with the EVE Online
 * Secure Interface (ESI) API. It handles authentication, authorization, and
 * provides convenient methods for making authenticated and unauthenticated API calls.
 *
 * @module utilities/esi.utilities
 */

import axios, { AxiosError } from "axios";

/**
 * ESI Client Class for interacting with the EVE Online API
 *
 * This class provides methods for making HTTP requests to the EVE Online ESI API,
 * including both unauthenticated public endpoints and authenticated endpoints that
 * require OAuth2 access tokens. It also handles OAuth2 token management and
 * authorization flows.
 */
export default class ESI {
    /**
     * User Agent string used for all ESI API requests
     * This identifies the application making requests to the ESI API
     */
    public static UserAgent =
        "Ibn Khatab - Drifter Highway (drifterhighway.space)";

    /**
     * Generates a Base64-encoded authentication string for OAuth2 token requests
     *
     * Creates the Basic Authentication header value by concatenating the
     * EVE client ID and secret key with a colon, then encoding to Base64.
     * This is used in the Authorization header for the OAuth2 token endpoint.
     *
     * @returns Base64-encoded string in format "base64(clientId:secretKey)"
     * @example
     * const authString = ESI.GetAuthString();
     * // Use in: Authorization: `Basic ${authString}`
     */
    public static GetAuthString = (): string =>
        Buffer.from(
            `${process.env.EVE_CLIENT_ID}:${process.env.EVE_SECRET_KEY}`,
            "ascii",
        ).toString("base64");

    //#region Base API Calls
    /**
     * Makes an unauthenticated GET request to an ESI endpoint
     *
     * Use this method for accessing public ESI endpoints that do not require
     * authentication. Automatically includes the User-Agent header.
     *
     * @param endpoint - The ESI API endpoint path (e.g., '/characters/123')
     * @returns Promise resolving to the parsed JSON response data
     * @example
     * const character = await ESI.GetUnauthenticated('/characters/{character_id}', characterId);
     */
    public static async GetUnauthenticated(endpoint: string) {
        return axios
            .get(endpoint, {
                headers: {
                    "User-Agent": this.UserAgent,
                },
            })
            .then((res) => res.data);
    }

    /**
     * Makes an unauthenticated POST request to an ESI endpoint
     *
     * Use this method for accessing public ESI endpoints that accept POST requests
     * and do not require authentication. Automatically includes the User-Agent header.
     *
     * @param endpoint - The ESI API endpoint path (e.g., '/characters/affiliation')
     * @param body - The request payload to send in the body
     * @returns Promise resolving to the parsed JSON response data
     * @example
     * const affiliations = await ESI.PostUnauthenticated(
     *     '/characters/affiliation',
     *     [123, 456, 789]
     * );
     */
    public static async PostUnauthenticated(endpoint: string, body: any) {
        return axios
            .post(endpoint, body, {
                headers: {
                    "User-Agent": this.UserAgent,
                },
            })
            .then((res) => res.data);
    }

    /**
     * Makes an authenticated GET request to an ESI endpoint
     *
     * Use this method for accessing ESI endpoints that require authentication.
     * The access_token parameter should be a valid OAuth2 access token obtained
     * through the OAuth2 flow.
     *
     * @param endpoint - The ESI API endpoint path (e.g., '/characters/{character_id}/location')
     * @param access_token - Valid OAuth2 access token for authentication
     * @returns Promise resolving to the parsed JSON response data
     * @example
     * const location = await ESI.GetAuthenticated(
     *     '/characters/{character_id}/location',
     *     'eyJhbGciOiJIUzI1NiIs...' // Access token
     * );
     */
    public static async GetAuthenticated(
        endpoint: string,
        access_token: string,
    ) {
        return axios
            .get(endpoint, {
                headers: {
                    "User-Agent": this.UserAgent,
                    Authorization: `BEARER ${access_token}`,
                },
            })
            .then((res) => res.data);
    }

    /**
     * Makes an authenticated POST request to an ESI endpoint
     *
     * Use this method for accessing ESI endpoints that require authentication
     * and accept POST requests. The access_token parameter should be a valid
     * OAuth2 access token obtained through the OAuth2 flow.
     *
     * @param endpoint - The ESI API endpoint path (e.g., '/characters/{character_id}/skills')
     * @param access_token - Valid OAuth2 access token for authentication
     * @returns Promise resolving to the parsed JSON response data
     * @example
     * const skills = await ESI.PostAuthenticated(
     *     '/characters/{character_id}/skills',
     *     'eyJhbGciOiJIUzI1NiIs...',
     *     { body }
     * );
     */
    public static async PostAuthenticated(
        endpoint: string,
        access_token: string,
    ) {
        return axios
            .post(endpoint, {
                headers: {
                    "User-Agent": this.UserAgent,
                    Authorization: `BEARER ${access_token}`,
                },
            })
            .then((res) => res.data);
    }
    //#endregion

    //#region OAuth Methods
    /**
     * Retrieves OAuth2 access and refresh tokens from an authorization code
     *
     * Exchanges an authorization code (obtained from the OAuth2 authorization flow)
     * for access tokens. The returned array contains [accessToken, refreshToken].
     *
     * @param code - The authorization code obtained from the redirect after OAuth2 approval
     * @returns Promise resolving to [accessToken, refreshToken] tuple
     * @example
     * const [accessToken, refreshToken] = await ESI.GetTokens(authorizationCode);
     */
    public static async GetTokens(
        code: string,
    ): Promise<[accessToken: string, refreshToken: string]> {
        const body = new URLSearchParams([
            ["grant_type", "authorization_code"],
            ["code", code],
        ]);

        try {
            const tokens = await axios.post(
                ESI_Endpoints.OAuth2.Token,
                body.toString(),
                {
                    headers: {
                        "User-Agent": this.UserAgent,
                        Authorization: `Basic ${ESI.GetAuthString()}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                },
            );

            return [tokens.data.access_token, tokens.data.refresh_token];
        } catch (e) {
            if (e instanceof AxiosError) {
                if (e.status === 500) {
                    console.error("INVALID TOKEN RESPONSE - 500");
                }
            }
            throw e;
        }
    }

    /**
     * Generates the OAuth2 authorization URL for initiating the OAuth2 flow
     *
     * Constructs the full authorization URL with appropriate query parameters
     * including response_type, client_id, redirect_uri, scope, and state.
     *
     * @param scopes - Optional array of ESI API scopes to request (e.g., ['char', 'corp', 'all'])
     * @returns Promise resolving to the full authorization URL
     * @example
     * const authUrl = await ESI.GetOAuthStartRedirect(['char', 'corp']);
     * // Redirect user to authUrl for OAuth2 approval
     */
    public static async GetOAuthStartRedirect(
        scopes: string[] = [],
    ): Promise<string> {
        const params = new URLSearchParams([
            ["response_type", "code"],
            ["client_id", process.env.EVE_CLIENT_ID],
            ["redirect_uri", process.env.EVE_CALLBACK_URL],
            ["scope", scopes.join(" ")],
            ["state", "asdf"],
        ]);
        return ESI_Endpoints.OAuth2.Authorization + "?" + params.toString();
    }
    //#endregion

    //#region Character Methods
    /**
     * Retrieves character affiliations for multiple characters
     *
     * Returns a list of character IDs associated with a given list of character IDs.
     * Each object in the response contains the character's current corporation
     * and alliance affiliations.
     *
     * @param character_ids - Array of EVE Online character IDs to query affiliations for
     * @returns Promise resolving to array of character affiliation objects
     * @example
     * const affiliations = await ESI.GetCharacterAffiliations([123, 456, 789]);
     */
    public static GetCharacterAffiliations = async (character_ids: number[]) =>
        this.PostUnauthenticated(
            ESI_Endpoints.Characters.Affiliation,
            character_ids,
        );

    /**
     * Retrieves public information for a specific character
     *
     * Returns publicly accessible information about a character including
     * their corporation, location, and avatar image.
     *
     * @param character_id - EVE Online character ID
     * @returns Promise resolving to character public information object
     * @example
     * const character = await ESI.GetCharacterPublicInformation(123456);
     */
    public static GetCharacterPublicInformation = async (
        character_id: number,
    ) =>
        this.GetUnauthenticated(
            ESI_Endpoints.Characters.PublicInformation.replace(
                "{character_id}",
                String(character_id),
            ),
        );

    /**
     * Retrieves the current solar system location for a character
     *
     * Returns detailed information about a character's current location
     * including solar system, station, and station name. Requires character
     * scope authentication.
     *
     * @param character_id - EVE Online character ID
     * @param access_token - Valid OAuth2 access token with char scope
     * @returns Promise resolving to character location information object
     * @example
     * const location = await ESI.GetCharacterCurrentLocation(123456, accessToken);
     */
    public static GetCharacterCurrentLocation = async (
        character_id: number,
        access_token: string,
    ) =>
        this.GetAuthenticated(
            ESI_Endpoints.Characters.CurrentLocation.replace(
                "{character_id}",
                String(character_id),
            ),
            access_token,
        );

    /**
     * Retrieves the current ship for a character
     *
     * Returns detailed information about a character's currently equipped
     * ship including ship name, ship type ID, and blueprint origin.
     * Requires character scope authentication.
     *
     * @param character_id - EVE Online character ID
     * @param access_token - Valid OAuth2 access token with char scope
     * @returns Promise resolving to character ship information object
     * @example
     * const ship = await ESI.GetCharacterCurrentShip(123456, accessToken);
     */
    public static GetCharacterCurrentShip = async (
        character_id: number,
        access_token: string,
    ) =>
        this.GetAuthenticated(
            ESI_Endpoints.Characters.CurrentShip.replace(
                "{character_id}",
                String(character_id),
            ),
            access_token,
        );
    //#endregion

    //#region Corporation Methods
    /**
     * Placeholder region for corporation-related ESI endpoints.
     * Can be implemented when corporation-specific functionality is needed.
     */
    //#endregion

    //#region Alliance Methods
    /**
     * Placeholder region for alliance-related ESI endpoints.
     * Can be implemented when alliance-specific functionality is needed.
     */
    //#endregion
}

/**
 * ESI API Endpoints Configuration
 *
 * Contains all ESI API endpoint URLs for authentication, characters,
 * and other available endpoints. This centralizes endpoint management
 * and makes it easy to update endpoint URLs if they change.
 */
export class ESI_Endpoints {
    /**
     * OAuth2 endpoint configuration
     * Contains URLs for OAuth2 token exchange, authorization,
     * token revocation, and account verification.
     */
    static OAuth2 = class {
        /**
         * URL for exchanging authorization code for tokens
         * Used in OAuth2 token grant flow
         */
        public static Token = "https://login.eveonline.com/v2/oauth/token";

        /**
         * URL for initiating OAuth2 authorization
         * Redirect users to this URL to grant API permissions
         */
        public static Authorization =
            "https://login.eveonline.com/v2/oauth/authorize";

        /**
         * URL for revoking access tokens
         * Use this endpoint to revoke a user's access token
         */
        public static Revoke = "https://login.eveonline.com/v2/oauth/revoke";
    };

    static Characters = class {
        public static Affiliation =
            "https://esi.evetech.net/characters/affiliation";
        public static PublicInformation =
            "https://esi.evetech.net/characters/{character_id}";
        public static CurrentLocation =
            "https://esi.evetech.net/characters/{character_id}/location";
        public static CurrentShip =
            "https://esi.evetech.net/characters/{character_id}/ship";
    };
}
