export function get(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest;
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
export function getAll(urls: string[]): Promise<string[]> {
    return Promise.all(urls.map(url => get(url)));
}