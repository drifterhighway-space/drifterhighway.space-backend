import { Request, Response } from "express";
import routable from "../decorators/routable.decorator";
import { JWTPayload } from "../models/jwtpayload.model";
import UserModel, { UserStatus } from "../models/user.model";
import { DbUtilities as DB } from "../utilities/db-utilities";
import controller from "./controller";

export default class UsersController implements controller {
    public swaggerTags: string[] = ["Users"];

    @routable({
        path: "/users",
        method: "get",
        auth: true,
    })
    public async GetUsers(req: Request, res: Response, jwt: JWTPayload) {
        if (jwt.sub !== 0) {
            res.sendStatus(401);
            return;
        }
        let users = await DB.Query(
            `Status = ${UserStatus.Active}`,
            UserModel.GetFactory(),
        );

        if (users.length > 0) res.status(200).send(users);
        else res.sendStatus(404);

        return;
    }
    @routable({
        path: "/users/:id",
        method: "get",
        auth: true,
    })
    public async GetUser(req: Request, res: Response, jwt: JWTPayload) {
        if (jwt.sub !== 0 && jwt.sub !== Number(req.params.id)) {
            res.sendStatus(401);
            return;
        }

        res.status(200).send(
            await DB.Get(Number(req.params.id), UserModel.GetFactory()),
        );
    }
    // @routable({
    //     path: "/users",
    //     method: "post",
    // })
    // public async CreateUser(req: Request, res: Response, jwt: JWTPayload) {
    //     let insertResult = await DB.Insert(
    //         UserModel.Make(req.body.name),
    //         UserModel.GetFactory(),
    //     );
    //     let user = DB.Get(insertResult.insertId, UserModel.GetFactory());
    //     res.status(200).send(user);
    //     return;
    // }
    @routable({
        path: "/users/:id",
        method: "put",
        auth: true,
    })
    public async UpdateUser(req: Request, res: Response, jwt: JWTPayload) {
        return;
    }
    @routable({
        path: "/users/:id",
        method: "delete",
        auth: true,
    })
    public async DeleteUser(req: Request, res: Response, jwt: JWTPayload) {
        if (jwt.sub !== 0 && jwt.sub !== Number(req.params.id)) {
            res.sendStatus(401);
            return;
        }

        let user = await DB.Get(Number(req.params.id), UserModel.GetFactory());
        user.Status = UserStatus.Inactive;

        await DB.Update(user, UserModel.GetFactory());

        return;
    }
}
