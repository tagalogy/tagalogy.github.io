import { loadingLine } from "../components/loading";

export async function load(promise: Promise<void>): Promise<void> {
    await loadingLine.enter();
    await promise;
    await loadingLine.exit();
    loadingLine.remove();
}
