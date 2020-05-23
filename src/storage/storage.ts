import {TypedStorage, enumConverterFactory, intConverter} from "./typed_storage";

interface StorageBody {
    theme: "dark" | "light";
    highscore_easy: number;
    highscore_medium: number;
    highscore_hard: number;
    highscore_veryHard: number;
}
export const storage = new TypedStorage<StorageBody>(localStorage, {
    theme: enumConverterFactory(["dark", "light"]),
    highscore_easy: intConverter,
    highscore_medium: intConverter,
    highscore_hard: intConverter,
    highscore_veryHard: intConverter,
});