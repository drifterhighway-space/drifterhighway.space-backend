import { Factory } from "./factory.model";
import { Identifiable } from "./identifiable.model";

/**
 * @description
 * Represents a User entity in the system.
 * Users are top-level account holders that own Character accounts.
 */
export default class UserModel implements Identifiable {
    /**
     * @description MongoDB collection name for User documents
     */
    public static CollectionName: string = "users";

    /**
     * @description Unique identifier for the user (primary key)
     */
    public ID: string;

    /**
     * @description Name of the user
     */
    public Name: string;

    /**
     * @description Status of the user (Active or Inactive)
     */
    public Status: UserStatus;

    /**
     * @description Optional Discord ID for the user
     */
    public DiscordID?: string;

    /**
     * @constructor Creates a new UserModel instance
     * @param json - JSON object containing user data
     * @throws Error if required fields (ID, Name, Status) are not provided
     */
    public constructor(json: any) {
        if (json.ID === undefined) throw new Error("User requires ID");
        else this.ID = json.ID;

        if (json.Name === undefined) throw new Error("User requires Name");
        else this.Name = json.Name;

        if (json.Status === undefined) throw new Error("User requires Status");
        else this.Status = json.Status;

        this.DiscordID = json.DiscordID;
    }

    /**
     * @description Creates a new UserModel instance with default values
     * @param name - Name of the user
     * @returns New UserModel instance
     */
    public static Make(name: string): UserModel {
        return new UserModel({
            ID: -1,
            Name: name,
            Status: UserStatus.Active,
        });
    }

    /**
     * @description Gets the factory instance for User operations
     * @returns Factory<UserModel> instance for creating and querying users
     */
    public static GetFactory(): Factory<UserModel> {
        return new (class implements Factory<UserModel> {
            Make = (json: any): UserModel => new UserModel(json);
            CollectionName = UserModel.CollectionName;
            GetURL = (id?: string) => UserModel.GetURL(id);
        })();
    }

    /**
     * @description Gets the URL for a user resource
     * @param id - Optional user ID
     * @returns URL string for the user resource
     */
    public static GetURL(id?: string) {
        return `/${this.CollectionName}` + (id ? `/${id}` : "");
    }
}

/**
 * @description Enumeration representing the status of a user
 */
export enum UserStatus {
    /**
     * @description Active user
     */
    Active,
    /**
     * @description Inactive user
     */
    Inactive,
}
