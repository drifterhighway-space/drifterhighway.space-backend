/**
 * @description
 * Represents a Factory interface for creating model instances.
 * The Factory pattern is used to encapsulate the creation logic for model objects,
 * ensuring consistency in how instances are constructed and queried.
 */
export interface Factory<T> {
    /**
     * @description Creates a new instance of the model
     * @param json - JSON object containing the data for the new instance
     * @returns New instance of model type T
     */
    Make(json: any): T;

    /**
     * @description MongoDB collection name for the model
     * @type {string}
     */
    CollectionName: string;

    /**
     * @description Gets the URL for a model resource
     * @param id - Optional ID for the resource
     * @returns URL string for the model resource
     */
    GetURL(id?: string): string;
}
