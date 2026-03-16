import { Factory } from "./factory.model";
import { GroupEntity } from "./groupEntity.model";
import { Identifiable } from "./identifiable.model";
import Location from "./location.model";
import Token, { TokenType } from "./token.model";
import TranslatedField from "./translatedField.model";

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
    public User: string;

    /**
     * @description Unique identifier for the character (primary key)
     */
    public ID: string;

    /**
     * @description Name of the character
     */
    public Name: string;

    /**
     * @description Corporation associated with this character
     */
    public Corporation: GroupEntity;

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

    public LastUpdate: Date;

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

        if (json.LastUpdate === undefined)
            throw new Error("Character requires LastUpdate");
        else this.LastUpdate = json.LastUpdate;

        this.Ship = json.Ship;
        this.RefreshToken = json.RefreshToken;
        this.AccessToken = json.AccessToken;
        this.Location = json.Location;
    }

    /**
     * @description Creates a new CharacterModel instance with specified fields
     * @param id - Unique identifier for the character
     * @param name - Name of the character
     * @param user - ID of the user who owns this character
     * @param refreshToken - Refresh token string
     * @param accessToken - Access token string
     * @param corp - Optional corporation entity
     * @param ship - Optional ship object
     * @returns New CharacterModel instance with default Status set to Active
     */
    public static Make(
        id: number | string,
        name: string,
        user: string,
        refreshToken: string,
        accessToken: string,
        corp?: GroupEntity,
        ship?: Ship,
    ) {
        return new CharacterModel({
            ID: id,
            Name: name,
            User: user,
            Corporation: corp,
            Ship: ship,
            AccessToken: { Token: accessToken, Type: TokenType.Access },
            RefreshToken: { Token: refreshToken, Type: TokenType.Access },
            Status: CharacterStatus.Pending,
            LastUpdate: new Date(0),
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

export interface CharacterDTX {
    ID: number;
    Name: string;
    SolarSystemID: number;
    ShipHullID: number;
}

export interface Ship {
    ID: number;
    Name: string;
    TypeName: TranslatedField;
}
