import axios from "axios";
import { Request, Response } from "express";
import routable from "../decorators/routable.decorator";
import CharacterModel, {
    CharacterDTX,
    CharacterStatus,
} from "../models/character.model";
import { JWTPayload } from "../models/jwtpayload.model";
import ConstellationModel from "../models/map/constellation";
import RegionModel, { RegionDTX } from "../models/map/region.model";
import SystemModel from "../models/map/system.model";
import { DbUtilities as DB } from "../utilities/db/mongo";
import controller from "./controller";

export default class MapsController implements controller {
    /**
     * Swagger tags for API documentation
     * Used to group this controller's endpoints under a "Maps" tag in Swagger/OpenAPI specs
     */
    public swaggerTags: string[] = [
        "Maps",
        "Regions",
        "Constellations",
        "Solar Systems",
    ];

    @routable({
        path: "/maps/regions",
        method: "get",
        auth: false,
    })
    public async GetRegions(
        req: Request,
        res: Response,
        jwt: JWTPayload,
    ): Promise<RegionDTX[]> {
        const regions = await DB.Query({}, RegionModel.GetFactory());
        const constellations = await DB.Query(
            {},
            ConstellationModel.GetFactory(),
        );
        const systems = await DB.Query({}, SystemModel.GetFactory());
        const chars = await DB.Query(
            { Status: CharacterStatus.Active },
            CharacterModel.GetFactory(),
        );

        const results: RegionDTX[] = [];

        for (let region of regions) {
            let s = systems.filter((s) => s.RegionID === region.ID);
            const r = {
                ID: region.ID,
                Name: region.Name,
                SystemCount: s.length ?? 0,
                ConstellationCount:
                    constellations.filter((c) => c.RegionID === region.ID)
                        .length ?? 0,
                ObservatoryCount:
                    systems.filter((s) => s.RegionID === region.ID && s.HasObs)
                        .length ?? 0,
                ScoutCount:
                    chars.filter((c) => s.find((s) => s.ID === c.Location?.ID))
                        .length ?? 0,
            } as RegionDTX;
            results.push(r);
        }

        res.status(200).send(results);
        return results;
    }

    @routable({
        path: "/maps/regions/:id",
        method: "get",
        auth: false,
    })
    public async GetRegion(
        req: Request,
        res: Response,
        jwt: JWTPayload,
    ): Promise<RegionDTX> {
        const region = await DB.Get(
            Number(req.params.id),
            RegionModel.GetFactory(),
        );
        const constellations = await DB.Query(
            `RegionID=${region.ID}`,
            ConstellationModel.GetFactory(),
            undefined,
            5000,
        );
        const systems = await DB.Query(
            `RegionID=${region.ID}`,
            SystemModel.GetFactory(),
            undefined,
            5000,
        );
        const chars = await DB.Query(
            `Status=${CharacterStatus.Active}`,
            CharacterModel.GetFactory(),
        );
        return {
            ID: region.ID,
            Name: region.Name,
            SystemCount: systems.length,
            ConstellationCount: constellations.length,
            ObservatoryCount: systems.filter((s) => s.HasObs).length,
            ScoutCount: 0, //FIX ME
        } as RegionDTX;
    }

    @routable({
        path: "/maps/regions/:id/scouts",
        method: "get",
        auth: false,
    })
    public async GetScoutsInRegion(
        req: Request,
        res: Response,
        jwt: JWTPayload,
    ): Promise<CharacterDTX[]> {
        const chars = await DB.Query(
            { "Location.Region.ID": Number(req.params.id) },
            CharacterModel.GetFactory(),
        );
        res.status(200).send(chars);
        return chars as unknown as CharacterDTX[];
    }

    @routable({
        path: "/maps/svg/:name",
        method: "get",
    })
    public async FetchBaseMapSVG(
        req: Request,
        res: Response,
        jwt: JWTPayload,
    ): Promise<void> {
        axios
            .get(`https://evemaps.dotlan.net/svg/${req.params.name}.light.svg`)
            .then((r) => {
                res.status(r.status).send(r.data);
            });
    }
}
