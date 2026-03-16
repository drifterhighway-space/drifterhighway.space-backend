import { Request, Response } from "express";
import JWT from "jsonwebtoken";
import routable from "../decorators/routable.decorator";
import CharacterModel from "../models/character.model";
import { GroupEntityType } from "../models/groupEntity.model";
import { JWTPayload } from "../models/jwtpayload.model";
import { TokenType } from "../models/token.model";
import UserModel from "../models/user.model";
import { DbUtilities as DB } from "../utilities/db/mongo";
import { ObjectNotFoundError } from "../utilities/errors";
import ESI from "../utilities/esi.utilities";
import controller from "./controller";

/**
 * AuthController handles authentication-related endpoints for the application.
 * This controller integrates with external authentication providers (EVE Online, Discord)
 * and manages user/character session tokens.
 *
 * @category Authentication
 * @category Controllers
 */
export default class AuthController implements controller {
    /**
     * Swagger tags for API documentation
     */
    public swaggerTags: string[] = ["Auth"];

    /**
     * EVE Online Login endpoint
     * Handles the OAuth callback from EVE Online authentication
     * Retrieves tokens, extracts character ID, and creates/updates user and character records
     *
     * @param {Request} req - Express request object containing the callback data
     * @param {Response} res - Express response object for sending responses
     * @param {JWTPayload} jwt - JWT payload object from authentication context
     * @param {string} req.body.code - OAuth authorization code from EVE Online
     *
     * @returns {Promise<void>} Resolves when login is complete with JWT token
     */
    @routable({
        path: "/auth/eve/login",
        method: "post",
        auth: false,
    })
    public async LoginEve(
        req: Request,
        res: Response,
        jwt: JWTPayload,
    ): Promise<void> {
        // Exchange OAuth code for EVE tokens
        const [access, refresh] = await ESI.GetTokens(
            req.body.code ?? req.query.code,
        );

        // Decode access token to get character ID
        const decodedAccess = JWT.decode(access) as AccessToken;
        const characterID = Number(decodedAccess.sub.split(":")[2]);

        let user = await DB.Get(characterID, UserModel.GetFactory()).catch(
            (e) => {
                if (e instanceof ObjectNotFoundError) return;
            },
        );

        // Create new user and character if character doesn't exist
        if (!user) {
            // Create new user record from EVE account name
            user = UserModel.Make(Number(characterID), decodedAccess.name);
            await DB.Insert(user, UserModel.GetFactory());
            user = await DB.Get(Number(characterID), UserModel.GetFactory());
        }

        // Create JWT payload with 30-minute expiration
        const payload = new JWTPayload({
            iss: process.env.JWT_ISSUER,
            aud: "drifterhighway.space",
            sub: characterID,
            exp: Date.now() + 60 * 60 * 30 * 1000,
            iat: new Date().getTime(),
            user: { Name: user.Name },
        });

        const token = JWT.sign(
            JSON.parse(JSON.stringify(payload)),
            process.env.JWT_SECRET,
        );

        console.log(payload, token);

        // Send JWT token to client
        res.status(200).send(token);

        return;
    }

    /**
     * Add EVE character endpoint
     * Used to add an EVE character if the user exists, or update refresh token
     *
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {JWTPayload} jwt - JWT payload object from authentication context
     *
     * @returns {Promise<void>} Resolves when character is added or refresh token is updated
     */
    @routable({
        path: "/auth/eve/login/add",
        method: "post",
        auth: true,
    })
    public async AddEve(
        req: Request,
        res: Response,
        jwt: JWTPayload,
    ): Promise<void> {
        console.log(jwt);
        // Exchange OAuth code for EVE tokens
        const [access, refresh] = await ESI.GetTokens(
            req.body.code ?? req.query.code,
        ).catch((e) => {
            throw e;
        });
        // Decode access token to get character ID
        const decodedAccess = JWT.decode(access) as AccessToken;
        const characterID = String(decodedAccess.sub.split(":")[2]);

        const user = await DB.Get(jwt.sub, UserModel.GetFactory());

        if (!user) {
            res.status(400).send("INVALID USER");
            return;
        }

        // Query database for existing character
        const character = await DB.Get(
            characterID,
            CharacterModel.GetFactory(),
        ).catch((e) => {
            if (e instanceof ObjectNotFoundError) {
                return null;
            }
        });

        // Fetch character affiliations from EVE API
        const affiliations = (
            await ESI.GetCharacterAffiliations([Number(characterID)])
        )[0];

        // Create new user and character if character doesn't exist
        if (!character) {
            // Create character record with affiliations
            const char = CharacterModel.Make(
                characterID,
                decodedAccess.name,
                jwt.sub,
                refresh,
                access,
                {
                    ID: affiliations.corporation_id,
                    Name: "",
                    Type: GroupEntityType.Corporation,
                },
            );
            await DB.Insert(char, CharacterModel.GetFactory())
                .then(() => {
                    res.status(201).send(char);
                })
                .catch((e) => {
                    if (e instanceof ObjectNotFoundError) {
                        res.status(500).send("FAILED TO INSERT CHARACTER");
                        console.error(e);
                        return;
                    }
                });
        } else {
            character.Corporation = {
                ID: affiliations.corporation_id,
                Type: GroupEntityType.Corporation,
                Name: "",
            };
            if (affiliations.alliance_id) {
                character.Corporation.Parent = {
                    ID: affiliations.alliance_id,
                    Name: "",
                    Type: GroupEntityType.Alliance,
                };
            }
            character.AccessToken = {
                Token: access,
                Type: TokenType.Access,
                Expires: new Date(Date.now() + 20 * 60 * 1000),
                Scopes: [],
            };
            character.RefreshToken = {
                Token: refresh,
                Type: TokenType.Refresh,
                Expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                Scopes: [],
            };

            await DB.Update(character, CharacterModel.GetFactory());

            res.status(202).send(character);
        }
        // TODO: Add character if not exist
        // TODO: Update refreshToken for existing character
        return;
    }

    /**
     * Discord Login endpoint
     * Handles OAuth callback from Discord authentication
     *
     * @param {Request} req - Express request object containing Discord OAuth data
     * @param {Response} res - Express response object for sending responses
     * @param {JWTPayload} jwt - JWT payload object from authentication context
     *
     * @returns {Promise<void>} Resolves when Discord authentication is complete
     */
    @routable({
        path: "/auth/discord/login",
        method: "post",
        auth: true,
    })
    public async LoginDiscord(
        req: Request,
        res: Response,
        jwt: JWTPayload,
    ): Promise<void> {
        console.log(jwt);

        // TODO: Add/discord tokens
        return;
    }
}

/**
 * EVE Online Access Token interface
 * Contains all claims from the EVE Online API access token
 * Used to extract character ID and user information from decoded token
 *
 * @category Types
 * @category Authentication
 * @category Interfaces
 */
interface AccessToken {
    /**
     * Authorization scope for the token
     */
    scp: string;

    /**
     * Unique identifier for this specific token
     */
    jti: string;

    /**
     * Key ID associated with the token
     */
    kid: string;

    /**
     * Subject - format: "https://eveonline.com/account#/userinfo"
     * Contains character ID as the last segment
     */
    sub: string;

    /**
     * Authorized party - the client application ID
     */
    azp: string;

    /**
     * EVE Online tenant identifier
     */
    tenant: string;

    /**
     * Access tier level (1-3)
     */
    tier: string;

    /**
     * Server region (US/EU)
     */
    region: string;

    /**
     * Audience array containing authorized parties
     */
    aud: string[];

    /**
     * EVE account name
     */
    name: string;

    /**
     * Account owner ID
     */
    owner: string;

    /**
     * Token expiration timestamp (Unix epoch in milliseconds)
     */
    exp: number;

    /**
     * Token issued at timestamp (Unix epoch in milliseconds)
     */
    iat: number;

    /**
     * Token issuer
     */
    iss: string;
}
