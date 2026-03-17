import { Utilities } from "../utilities/utilities";
import { Factory } from "./factory.model";
import { Identifiable } from "./identifiable.model";

export default class ConnectionModel implements Identifiable {
    public static CollectionName: string = "connections";

    public ID: string;
    public Origin: number;
    public Destination: number;
    public Added: Date;
    public AddedBy: number | string;
    public Status: ConnectionStatuses = ConnectionStatuses.Normal;
    public Type: ConnectionTypes = ConnectionTypes.Drifter;

    public constructor(json: any) {
        if (json.Origin === undefined)
            throw new Error("Origin is required for Connection");
        else this.Origin = json.Origin;
        if (json.Destination === undefined)
            throw new Error("Destination is required for Connection");
        else this.Destination = json.Destination;
        if (json.Added === undefined)
            throw new Error("Added is required for Connection");
        else this.Added = json.Added;
        if (json.AddedBy === undefined)
            throw new Error("AddedBy is required for Connection");
        else this.AddedBy = json.AddedBy;

        this.ID = json.ID ?? Utilities.newGuid();
        this.Status = json.Status;
        this.Type = json.Type;
    }

    public static Make(
        origin: number,
        dest: number,
        addedBy: number | string,
        type: ConnectionTypes,
        status: ConnectionStatuses = ConnectionStatuses.Normal,
    ): ConnectionModel {
        return new ConnectionModel({
            ID: Utilities.newGuid(),
            Origin: origin,
            Destination: dest,
            AddedBy: addedBy,
            Added: new Date(),
            Status: status,
            Type: type,
        });
    }

    public static GetURL(id?: string) {
        return `/${this.CollectionName}` + (id ? `/${id}` : "");
    }

    public static GetFactory(): Factory<ConnectionModel> {
        return new (class implements Factory<ConnectionModel> {
            Make = (json: any): ConnectionModel => new ConnectionModel(json);
            CollectionName = ConnectionModel.CollectionName;
            GetURL = (id?: string) => ConnectionModel.GetURL(id);
        })();
    }
}

export enum ConnectionStatuses {
    Fresh,
    Normal,
    EOL,
    Crit,
    Closed,
}

export enum ConnectionTypes {
    Drifter,
    Wormhole,
    Ansiblex,
}
