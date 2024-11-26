/**
 * Utility function to get missing fields from an object based on specified keys
 * @param obj The object to validate (e.g., req.body)
 * @param keys Array of keys to check for missing values
 * @returns Array of missing field names
 */
function handleMissingFields(obj: Record<string, any>, keys: string[]): string[] {
    const missingFields: string[] = [];

    for (const key of keys) {
        const value = obj[key];
        if (value === undefined || value === null || value === "") {
            missingFields.push(key);
        }
    }

    return missingFields;
}

export default handleMissingFields;