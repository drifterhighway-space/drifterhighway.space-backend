import { Request, Response } from "express";
import routable from "../decorators/routable.decorator";
import CharacterModel, { CharacterStatus } from "../models/character.model";
import { JWTPayload } from "../models/jwtpayload.model";
import { DbUtilities as DB } from "../utilities/db-utilities";
import controller from "./controller";

export default class CharacterController implements controller {
    public swaggerTags: string[] = ["Characters"];

    @routable({
        path: "/characters",
        method: "get",
        auth: true,
    })
    public async GetCharacters(req: Request, res: Response, jwt: JWTPayload) {
        if (jwt.sub !== 0) {
            res.sendStatus(401);
            return;
        }
        let character = await DB.Query(
            `Status = ${CharacterStatus.Active}`,
            CharacterModel.GetFactory(),
        );

        if (character.length > 0) res.status(200).send(character);
        else res.sendStatus(404);

        return;
    }
    @routable({
        path: "/characters/:id",
        method: "get",
        auth: true,
    })
    public async GetCharacter(req: Request, res: Response, jwt: JWTPayload) {
        if (jwt.sub !== 0 && jwt.sub !== Number(req.params.id)) {
            res.sendStatus(401);
            return;
        }

        res.status(200).send(
            await DB.Get(Number(req.params.id), CharacterModel.GetFactory()),
        );
    }
    @routable({
        path: "/characters/:id",
        method: "put",
        auth: true,
    })
    public async UpdateCharacter(req: Request, res: Response, jwt: JWTPayload) {
        return;
    }
    @routable({
        path: "/characters/:id",
        method: "delete",
        auth: true,
    })
    public async DeleteCharacter(req: Request, res: Response, jwt: JWTPayload) {
        if (jwt.sub !== 0 && jwt.sub !== Number(req.params.id)) {
            res.sendStatus(401);
            return;
        }

        let user = await DB.Get(
            Number(req.params.id),
            CharacterModel.GetFactory(),
        );
        user.Status = CharacterStatus.Inactive;

        await DB.Update(user, CharacterModel.GetFactory());

        return;
    }
}
