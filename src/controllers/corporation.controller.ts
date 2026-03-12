// import { Request, Response } from "express";
// import routable from "../decorators/routable.decorator";
// import { GroupEntityType } from "../models/groupEntity.model";
// import { JWTPayload } from "../models/jwtpayload.model";
// import { DbUtilities as DB } from "../utilities/db/mongo";
// import controller from "./controller";

// export default class CorporationController implements controller {
//     public swaggerTags: string[] = ["Corporations"];

//     @routable({
//         path: "/corporations",
//         method: "get",
//         auth: true,
//     })
//     public async GetCorporations(req: Request, res: Response, jwt: JWTPayload) {
//         if (jwt.sub !== 0) {
//             res.sendStatus(401);
//             return;
//         }
//         let corporations = await DB.Query(
//             `Type = ${GroupEntityType.Corporation}`,
//             Corporation.GetFactory(),
//         );

//         if (corporations.length > 0) res.status(200).send(corporations);
//         else res.sendStatus(404);

//         return;
//     }
//     @routable({
//         path: "/corporations/:id",
//         method: "get",
//         auth: true,
//     })
//     public async GetCorporation(req: Request, res: Response, jwt: JWTPayload) {
//         if (jwt.sub !== 0 && jwt.sub !== Number(req.params.id)) {
//             res.sendStatus(401);
//             return;
//         }

//         res.status(200).send(
//             await DB.Get(Number(req.params.id), Corporation.GetFactory()),
//         );
//     }
//     @routable({
//         path: "/corporations/:id",
//         method: "put",
//         auth: true,
//     })
//     public async UpdateCorporation(
//         req: Request,
//         res: Response,
//         jwt: JWTPayload,
//     ) {
//         return;
//     }
//     @routable({
//         path: "/corporations/:id",
//         method: "delete",
//         auth: true,
//     })
//     public async DeleteCorporation(
//         req: Request,
//         res: Response,
//         jwt: JWTPayload,
//     ) {
//         if (jwt.sub !== 0 && jwt.sub !== Number(req.params.id)) {
//             res.sendStatus(401);
//             return;
//         }

//         let corporation = await DB.Get(
//             Number(req.params.id),
//             Corporation.GetFactory(),
//         );
//         corporation.Type = undefined as any;

//         await DB.Update(corporation, Corporation.GetFactory());

//         return;
//     }
// }
