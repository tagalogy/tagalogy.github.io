type JSONNonNull = boolean | number | string | JSONValue[] | JSONObject;
type JSONValue = null | JSONNonNull;
interface JSONObject {
    [name: string]: JSONValue;
}
class JSONStorage {
    private _map: null | Map<string, JSONValue> = null;
    supported: boolean;
    constructor(private storage: Storage) {
        this.supported = this.checkSupport();
    }
    private checkSupport(): boolean {
        // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
        const {storage} = this;
        try {
            const x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (error) {
            return error instanceof DOMException && (
                // everything except Firefox
                error.code === 22 ||
                // Firefox
                error.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                error.name === 'QuotaExceededError' ||
                // Firefox
                error.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                (storage && storage.length !== 0);
        }
    }
    /*
    // unused code
    private weakHasItem(name: string) {
        if (!this.supported) return false;
        return this.weakGetItem(name) !== null;
    }
    */
    private weakGetItem(name: string): JSONValue {
        if (!this.supported) return null;
        const value = this.storage.getItem(name);
        if (value === null) return null;
        try {
            return JSON.parse(value) as JSONValue;
        } catch (error) {
            return null;
        }
    }
    private weakSetItem(name: string, value: JSONValue): void {
        if (!this.supported) return;
        try {
            this.storage.setItem(name, JSON.stringify(value));
        } catch (error) {}
    }
    private weakRemoveItem(name: string): void {
        if (!this.supported) return;
        this.storage.removeItem(name);
    }
    private get map(): Map<string, JSONValue> {
        let {_map: map, storage} = this;
        if (map) return map;
        map = this._map = new Map;
        if (!this.supported) return map;
        for (let index = 0; index < storage.length; index++) {
            const name = storage.key(index)!;
            map.set(name, this.weakGetItem(name));
        }
        return map;
    }
    hasItem(name: string): boolean {
        return this.map.has(name);
    }
    getItem(name: string): JSONValue {
        return this.map.get(name) ?? null;
    }
    setItem(name: string, value: JSONValue): void {
        this.map.set(name, value);
        if (value === null) {
            this.weakRemoveItem(name);
        } else {
            this.weakSetItem(name, value);
        }
    }
    removeItem(name: string): void {
        this.setItem(name, null);
    }
    setDefault(name: string, value: JSONValue): void {
        if (!this.hasItem(name)) this.setItem(name, value);
    }
    setAllDefault(option: JSONObject): void {
        for (const name of Object.keys(option)) this.setDefault(name, option[name]);
    }
}
export const storage = new JSONStorage(localStorage);