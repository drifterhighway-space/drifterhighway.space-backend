import { Request, Response } from "express";
import routable from "../decorators/routable.decorator";
import ConnectionModel, {
    ConnectionStatuses,
} from "../models/connection.model";
import { JWTPayload } from "../models/jwtpayload.model";
import { DbUtilities as DB } from "../utilities/db/mongo";
import { ObjectNotFoundError } from "../utilities/errors";
import controller from "./controller";

export default class ConnectionsController implements controller {
    /**
     * Swagger tags for API documentation
     */
    public swaggerTags: string[] = ["Connections"];

    @routable({
        path: `/${ConnectionModel.CollectionName}`,
        method: "get",
        auth: false,
    })
    public async GetConnections(req: Request, res: Response, jwt: JWTPayload) {
        const connections = await DB.Query(
            { Status: { $not: { $eq: ConnectionStatuses.Closed } } },
            ConnectionModel.GetFactory(),
        ).catch((e) => {
            if (!(e instanceof ObjectNotFoundError)) throw e;
        });

        res.status(200).send(connections ?? []);
    }

    @routable({
        path: `/${ConnectionModel.CollectionName}`,
        method: "post",
        auth: false,
    })
    public async AddConnection(req: Request, res: Response, jwt: JWTPayload) {
        const newConn = ConnectionModel.Make(
            req.body.Origin,
            req.body.Destination,
            jwt.sub,
            req.body.Type,
            req.body.Status || ConnectionStatuses.Normal,
        );

        await DB.Insert(newConn, ConnectionModel.GetFactory());

        res.status(201).send(
            await DB.Get(newConn.ID, ConnectionModel.GetFactory()),
        );
    }
}
