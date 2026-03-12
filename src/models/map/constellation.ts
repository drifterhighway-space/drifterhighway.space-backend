import { Factory } from "../factory.model";
import { Identifiable } from "../identifiable.model";
import TranslatedField from "../translatedField.model";

export default class ConstellationModel implements Identifiable {
    public static CollectionName: string = "constellations";

    public ID: number;
    public Name: TranslatedField;
    public RegionID: number;

    public constructor(json: any) {
        if (json.ID === undefined) throw new Error("Constellation requires ID");
        else this.ID = json.ID;

        if (json.Name === undefined)
            throw new Error("Constellation requires Name");
        else this.Name = json.Name;

        if (json.RegionID === undefined)
            throw new Error("Constellation requires RegionID");
        else this.RegionID = json.RegionID;
    }

    public static make(
        ID: number,
        Name: TranslatedField,
        RegionID: number,
    ): ConstellationModel {
        return new ConstellationModel({
            ID,
            Name,
            RegionID,
        });
    }

    public static GetURL(id?: string) {
        return `/${this.CollectionName}` + (id ? `/${id}` : "");
    }

    public static GetFactory(): Factory<ConstellationModel> {
        return new (class implements Factory<ConstellationModel> {
            Make = (json: any): ConstellationModel =>
                new ConstellationModel(json);
            CollectionName = ConstellationModel.CollectionName;
            GetURL = (id?: string) => ConstellationModel.GetURL(id);
        })();
    }
}
