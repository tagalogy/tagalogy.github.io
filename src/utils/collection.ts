import { SPACE } from "./regex";

export function toSet(source: string): Set<string> {
    return new Set(toArray(source));
}
export function toArray(source: string): string[] {
    return source.trim().split(SPACE);
}
