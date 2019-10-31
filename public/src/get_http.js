export function get(url) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest;
        xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
                resolve(xhr.responseText);
            } else {
                reject(xhr.status);
            }
        });
        xhr.addEventListener("error", () => {
            reject();
        });
        xhr.open("GET", url);
        xhr.send();
    });
}
export function getAll(urls) {
    return Promise.all(urls.map(url => get(url)));
}