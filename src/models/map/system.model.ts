import { Factory } from "../factory.model";
import { Identifiable } from "../identifiable.model";
import TranslatedField from "../translatedField.model";

export default class SystemModel implements Identifiable {
    public static CollectionName: string = "solarsystems";

    public ID: number;
    public Name: TranslatedField;
    public ConstellationID: number;
    public RegionID: number;
    public HasObs: boolean;
    public ConnectedSystems: number[] = [];

    public constructor(json: any) {
        if (json.ID === undefined) throw new Error("System requires ID");
        else this.ID = json.ID;

        if (json.Name === undefined) throw new Error("System requires Name");
        else this.Name = json.Name;

        if (json.ConstellationID === undefined)
            throw new Error("System requires ConstellationID");
        else this.ConstellationID = json.ConstellationID;

        if (json.RegionID === undefined)
            throw new Error("System requires RegionID");
        else this.RegionID = json.RegionID;

        if (json.HasObs === undefined)
            throw new Error("System requires HasObs");
        else this.HasObs = json.HasObs;
    }

    public static make(
        id: number,
        name: string,
        constID: number,
        regionID: number,
        obs: boolean,
    ): SystemModel {
        return new SystemModel({
            ID: id,
            Name: name,
            ConstellationID: constID,
            RegionID: regionID,
            HasObs: obs,
        });
    }

    public static GetURL(id?: string) {
        return `/${this.CollectionName}` + (id ? `/${id}` : "");
    }

    public static GetFactory(): Factory<SystemModel> {
        return new (class implements Factory<SystemModel> {
            Make = (json: any): SystemModel => new SystemModel(json);
            CollectionName = SystemModel.CollectionName;
            GetURL = (id?: string) => SystemModel.GetURL(id);
        })();
    }
}
