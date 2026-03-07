import CorporationModel from "./corporation.model";
import { Factory } from "./factory.model";
import { Identifiable } from "./identifiable.model";
import Location from "./location.model";
import Ship from "./ship.model";
import Token from "./tokens.model";

/**
 * @description
 * Represents a Character entity in the system.
 * Characters are user accounts that belong to corporations and can own ships.
 */
export default class CharacterModel implements Identifiable {
    /**
     * @description MongoDB collection name for Character documents
     */
    public static CollectionName: string = "characters";

    /**
     * @description ID of the user who owns this character
     */
    public User: number;

    /**
     * @description Unique identifier for the character (primary key)
     */
    public ID: number;

    /**
     * @description Name of the character
     */
    public Name: string;

    /**
     * @description Corporation associated with this character
     */
    public Corporation: CorporationModel;

    /**
     * @description Optional refresh token for authentication
     */
    public RefreshToken?: Token;

    /**
     * @description Optional access token for authentication
     */
    public AccessToken?: Token;

    /**
     * @description Optional location data
     */
    public Location?: Location;

    /**
     * @description Optional ship owned by this character
     */
    public Ship?: Ship;

    /**
     * @description Status of the character (Active, Inactive, etc.)
     */
    public Status: CharacterStatus;

    /**
     * @constructor Creates a new CharacterModel instance
     * @param json - JSON object containing character data
     * @throws Error if required fields (ID, Name, User, Corporation, Status) are not provided
     */
    public constructor(json: any) {
        if (json.ID === undefined) throw new Error("Character requires ID");
        else this.ID = json.ID;

        if (json.Name === undefined) throw new Error("Character requires Name");
        else this.Name = json.Name;

        if (json.User === undefined) throw new Error("Character requires User");
        else this.User = json.User;

        if (json.Corporation === undefined)
            throw new Error("Character requires Corporation");
        else this.Corporation = json.Corporation;

        if (json.Status === undefined)
            throw new Error("Character requires Status");
        else this.Status = json.Status;

        this.Ship = json.Ship;
        this.RefreshToken = json.RefreshToken;
        this.AccessToken = json.AccessToken;
    }

    /**
     * @description Creates a new CharacterModel instance with default values
     * @param name - Name of the character
     * @param user - ID of the user who owns this character
     * @param refreshToken - Refresh token string
     * @param accessToken - Access token string
     * @param corp - Optional corporation ID
     * @param ship - Optional ship object
     * @returns New CharacterModel instance
     */
    public static Make(
        name: string,
        user: number,
        refreshToken: string,
        accessToken: string,
        corp?: number,
        ship?: Ship,
    ) {
        return new CharacterModel({
            ID: -1,
            Name: name,
            User: user,
            Corporation: new CorporationModel({ ID: corp }),
            Ship: ship,
            AccessToken: accessToken,
            RefreshToken: refreshToken,
            Status: CharacterStatus.Active,
        });
    }

    /**
     * @description Gets the factory instance for Character operations
     * @returns Factory<CharacterModel> instance for creating and querying characters
     */
    public static GetFactory(): Factory<CharacterModel> {
        return new (class implements Factory<CharacterModel> {
            Make = (json: any): CharacterModel => new CharacterModel(json);
            CollectionName = CharacterModel.CollectionName;
            GetURL = (id?: string) => CharacterModel.GetURL(id);
        })();
    }

    /**
     * @description Gets the URL for a character resource
     * @param id - Optional character ID
     * @returns URL string for the character resource
     */
    public static GetURL(id?: string) {
        return `/${this.CollectionName}` + (id ? `/${id}` : "");
    }
}

/**
 * @description Enumeration representing the status of a character
 */
export enum CharacterStatus {
    /**
     * @description Active character
     */
    Active,
    /**
     * @description Inactive character
     */
    Inactive,
    /**
     * @description Character with invalid token
     */
    InvalidToken,
    /**
     * @description Pending character
     */
    Pending,
    ManualAdd,
}
