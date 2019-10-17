export let supported = (() => {
    //https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
    let storage;
    try {
        storage = window.localStorage;
        let x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }catch(error) {
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
})();
let storage;
export default storage = {
    weakHasItem(name) {
        if(! supported) return false;
        return storage.weakGetItem(name) !== null;
    },
    weakGetItem(name) {
        if(! supported) return null;
        try{
            return JSON.parse(localStorage.getItem(name));
        }catch(error) {
            return null;
        }
    },
    weakSetItem(name, value) {
        if(! supported) return;
        localStorage.setItem(name, JSON.stringify(value));
    },
    weakRemoveItem(name) {
        if(! supported) return;
        localStorage.removeItem(name);
    },
    get map() {
        let {_map: map} = storage;
        if(map) return map;
        map = storage._map = new Map;
        if(! supported) return map;
        for(let ind = 0, len = localStorage.length; ind < len; ind ++) {
            let name = localStorage.key(ind);
            map.set(name, storage.weakGetItem(name));
        }
        return map;
    },
    hasItem(name) {
        return storage.map.has(name);
    },
    getItem(name) {
        return storage.map.get(name);
    },
    setItem(name, value) {
        storage.map.set(name, value);
        if(value == null) {
            storage.weakRemoveItem(name);
        }else{
            storage.weakSetItem(name, value);
        }
    },
    removeItem(name) {
        storage.setItem(name, null);
    },
    setDefault(name, value) {
        if(! storage.hasItem(name)) storage.setItem(name, value);
    },
    setAllDefault(option) {
        for(let name in option) storage.setDefault(name, option[name]);
    }
}