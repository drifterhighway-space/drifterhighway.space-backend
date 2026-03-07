import { Factory } from "./factory.model";
import { GroupEntity, GroupEntityType } from "./groupEntity.model";
import { Identifiable } from "./identifiable.model";

/**
 * @description
 * Represents a Corporation entity in the system.
 * Corporations are top-level organizational groups that can own other entities.
 */
export default class Corporation implements Identifiable, GroupEntity {
    /**
     * @description MongoDB collection name for Corporation documents
     */
    public static CollectionName: string = "corporations";

    /**
     * @description Unique identifier for the corporation (primary key)
     */
    public ID: number;

    /**
     * @description Name of the corporation
     */
    public Name: string;

    /**
     * @description Type of group entity (always Corporation type)
     */
    public Type: GroupEntityType = GroupEntityType.Corporation;

    /**
     * @description Optional parent group entity reference
     */
    public Parent?: GroupEntity;

    /**
     * @constructor Creates a new Corporation instance
     * @param json - JSON object containing corporation data
     * @throws Error if ID or Name are not provided
     */
    public constructor(json: any) {
        if (json.ID === undefined) throw new Error("Corporation requires ID");
        else this.ID = json.ID;

        if (json.Name === undefined)
            throw new Error("Corporation requires Name");
        else this.Name = json.Name;

        this.Parent = json.Parent;
    }

    /**
     * @description Gets the factory instance for Corporation operations
     * @returns Factory<Corporation> instance for creating and querying corporations
     */
    public static GetFactory(): Factory<Corporation> {
        return new (class implements Factory<Corporation> {
            Make = (json: any): Corporation => new Corporation(json);
            CollectionName = Corporation.CollectionName;
            GetURL = (id?: string) => Corporation.GetURL(id);
        })();
    }

    /**
     * @description Gets the URL for a corporation resource
     * @param id - Optional corporation ID
     * @returns URL string for the corporation resource
     */
    public static GetURL(id?: string) {
        return `/${this.CollectionName}` + (id ? `/${id}` : "");
    }
}
