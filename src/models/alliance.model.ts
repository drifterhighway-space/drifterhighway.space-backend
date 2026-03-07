import { Factory } from "./factory.model";
import { GroupEntity, GroupEntityType } from "./groupEntity.model";
import { Identifiable } from "./identifiable.model";

/**
 * @description
 * Represents an Alliance entity in the system.
 * Alliances are top-level organizational groups that can own other entities.
 */
export default class Alliance implements Identifiable, GroupEntity {
    /**
     * @description MongoDB collection name for Alliance documents
     */
    public static CollectionName: string = "alliances";

    /**
     * @description Unique identifier for the alliance (primary key)
     */
    public ID: number;

    /**
     * @description Name of the alliance
     */
    public Name: string;

    /**
     * @description Type of group entity (always Alliance type)
     */
    public Type: GroupEntityType = GroupEntityType.Alliance;

    /**
     * @constructor Creates a new Alliance instance
     * @param json - JSON object containing alliance data
     * @throws Error if ID or Name are not provided
     */
    public constructor(json: any) {
        if (json.ID === undefined) throw new Error("Alliance requires ID");
        else this.ID = json.ID;

        if (json.Name === undefined) throw new Error("Alliance requires Name");
        else this.Name = json.Name;
    }

    /**
     * @description Gets the factory instance for Alliance operations
     * @returns Factory<Alliance> instance for creating and querying alliances
     */
    public static GetFactory(): Factory<Alliance> {
        return new (class implements Factory<Alliance> {
            Make = (json: any): Alliance => new Alliance(json);
            CollectionName = Alliance.CollectionName;
            GetURL = (id?: string) => Alliance.GetURL(id);
        })();
    }

    /**
     * @description Gets the URL for an alliance resource
     * @param id - Optional alliance ID
     * @returns URL string for the alliance resource
     */
    public static GetURL(id?: string) {
        return `/${this.CollectionName}` + (id ? `/${id}` : "");
    }
}
