import { Factory } from "../factory.model";
import { Identifiable } from "../identifiable.model";
import TranslatedField from "../translatedField.model";

export default class RegionModel implements Identifiable {
    public static CollectionName: string = "regions";

    public ID: number;
    public Name: TranslatedField;

    public constructor(json: any) {
        if (json.ID === undefined) throw new Error("Region requires ID");
        else this.ID = json.ID;

        if (json.Name === undefined) throw new Error("Region requires Name");
        else this.Name = json.Name;
    }

    public static make(id: number, name: TranslatedField): RegionModel {
        return new RegionModel({
            ID: id,
            Name: name,
        });
    }

    public static GetURL(id?: string) {
        return `/${this.CollectionName}` + (id ? `/${id}` : "");
    }

    public static GetFactory(): Factory<RegionModel> {
        return new (class implements Factory<RegionModel> {
            Make = (json: any): RegionModel => new RegionModel(json);
            CollectionName = RegionModel.CollectionName;
            GetURL = (id?: string) => RegionModel.GetURL(id);
        })();
    }
}

export interface RegionDTX {
    ID: number;
    Name: TranslatedField;
    SystemCount: number;
    ConstellationCount: number;
    ObservatoryCount: number;
    ScoutCount: number;
}
