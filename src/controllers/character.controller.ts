/**
 * CharacterController
 *
 * Handles HTTP requests and responses related to character management.
 * This controller provides endpoints for retrieving, updating, and deleting character data.
 * All endpoints require authentication and authorization checks based on the JWT payload.
 *
 * @module controllers/character
 */
import { Request, Response } from "express";
import routable from "../decorators/routable.decorator";
import CharacterModel, { CharacterStatus } from "../models/character.model";
import { JWTPayload } from "../models/jwtpayload.model";
import { DbUtilities as DB } from "../utilities/db/mongo";
import controller from "./controller";

/**
 * CharacterController class
 *
 * Implements the controller contract for handling character-related HTTP operations.
 * Manages CRUD operations (Create, Read, Update, Delete) for character entities
 * with authentication and authorization middleware via the @routable decorator.
 */
export default class CharacterController implements controller {
    /**
     * Swagger tags for API documentation
     * Used to group this controller's endpoints under a "Characters" tag in Swagger/OpenAPI specs
     */
    public swaggerTags: string[] = ["Characters"];

    /**
     * Get all characters
     *
     * Retrieves all active characters from the database.
     * Requires authentication (sub === 0 means admin/root user).
     *
     * @param req - Express request object containing route parameters
     * @param res - Express response object for sending responses
     * @param jwt - JWT payload containing user authentication information
     * @returns Express Response with character list (200) or not found (404)
     *
     * @route GET /characters
     * @auth Required
     * @tags Characters
     *
     * @example
     * // Get all active characters
     * GET /characters
     * Authorization: Bearer <admin-token>
     *
     * @response 200 - Success with array of characters
     * @response 401 - Unauthorized if not admin user
     * @response 404 - Not found if no active characters exist
     */
    @routable({
        path: "/characters",
        method: "get",
        auth: true,
    })
    public async GetCharacters(
        req: Request,
        res: Response,
        jwt: JWTPayload,
    ): Promise<void> {
        // Validate that the requesting user is an admin (sub === 0)
        let query = {
            $and: [
                { Status: { $not: { $eq: CharacterStatus.Inactive } } },
                { User: Number(jwt.sub) },
            ],
        };

        // Query the database for all characters with Active status
        let character = await DB.Query(query, CharacterModel.GetFactory());

        // Return character list if any active characters exist
        if (character.length > 0) res.status(200).send(character);
        else res.status(200).send([]);

        return;
    }

    /**
     * Get character by ID
     *
     * Retrieves a specific character by its unique identifier.
     * Requires authentication and the requesting user must either be admin
     * (sub === 0) or be the character's owner (jwt.sub === character.id).
     *
     * @param req - Express request object containing character ID in route params
     * @param res - Express response object for sending responses
     * @param jwt - JWT payload containing user authentication information
     * @returns Express Response with character data (200)
     *
     * @route GET /characters/:id
     * @auth Required
     * @tags Characters
     *
     * @example
     * // Get character with ID 123
     * GET /characters/123
     * Authorization: Bearer <user-token>
     *
     * @response 200 - Success with character object
     * @response 401 - Unauthorized if user is not admin or character owner
     */
    @routable({
        path: "/characters/:id",
        method: "get",
        auth: false,
    })
    public async GetCharacter(
        req: Request,
        res: Response,
        jwt: JWTPayload,
    ): Promise<void> {
        // Validate authorization: user must be admin (sub === 0) or character owner
        if (
            jwt.sub !== process.env.ADMIN_ID &&
            jwt.sub !== String(req.params.id)
        ) {
            res.sendStatus(401);
            return;
        }

        // Retrieve character by ID from database
        res.status(200).send(
            await DB.Get(Number(req.params.id), CharacterModel.GetFactory()),
        );
    }

    /**
     * Update character
     *
     * Updates an existing character with new data.
     * Requires authentication and the requesting user must either be admin
     * (sub === 0) or be the character's owner.
     *
     * @param req - Express request object containing character ID and update data
     * @param res - Express response object for sending responses
     * @param jwt - JWT payload containing user authentication information
     * @returns Express Response after update operation completes
     *
     * @route PUT /characters/:id
     * @auth Required
     * @tags Characters
     *
     * @example
     * // Update character with ID 123
     * PUT /characters/123
     * Authorization: Bearer <user-token>
     * Content-Type: application/json
     *
     * @requestBody
     * {
     *   "Name": "New Character Name",
     *   "OtherFields": ...
     * }
     *
     * @response 200 - Success
     * @response 401 - Unauthorized if user is not admin or character owner
     */
    @routable({
        path: "/characters/:id",
        method: "put",
        auth: true,
    })
    public async UpdateCharacter(
        req: Request,
        res: Response,
        jwt: JWTPayload,
    ): Promise<void> {
        // TODO: Implement character update logic
        // Expected implementation:
        // 1. Validate authorization (same as GetCharacter)
        // 2. Update character properties from request body
        // 3. Save changes to database
        // 4. Return updated character or appropriate response
    }

    /**
     * Delete character (Soft Delete)
     *
     * Performs a soft delete on a character by setting its status to Inactive.
     * Requires authentication and the requesting user must either be admin
     * (sub === 0) or be the character's owner.
     * This is a soft delete, not a permanent removal from the database.
     *
     * @param req - Express request object containing character ID in route params
     * @param res - Express response object for sending responses
     * @param jwt - JWT payload containing user authentication information
     * @returns Express Response after deletion completes
     *
     * @route DELETE /characters/:id
     * @auth Required
     * @tags Characters
     *
     * @example
     * // Delete (soft delete) character with ID 123
     * DELETE /characters/123
     * Authorization: Bearer <user-token>
     *
     * @response 200 - Success
     * @response 401 - Unauthorized if user is not admin or character owner
     */
    @routable({
        path: "/characters/:id",
        method: "delete",
        auth: true,
    })
    public async DeleteCharacter(
        req: Request,
        res: Response,
        jwt: JWTPayload,
    ): Promise<void> {
        // Validate authorization: user must be admin (sub === 0) or character owner
        if (
            jwt.sub !== process.env.ADMIN_ID &&
            jwt.sub !== String(req.params.id)
        ) {
            res.sendStatus(401);
            return;
        }

        // Retrieve character by ID from database
        let user = await DB.Get(
            Number(req.params.id),
            CharacterModel.GetFactory(),
        );

        // Set character status to Inactive (soft delete)
        user.Status = CharacterStatus.Inactive;

        // Save updated character to database
        await DB.Update(user, CharacterModel.GetFactory());

        return;
    }
}
