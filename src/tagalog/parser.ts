import {NEWLINE} from "../utils/regex";
import {toSet} from "../utils/collection";

function parseSpecial(source: string): Map<string, [string, string]> {
    return new Map<string, [string, string]>(source.trim().split(NEWLINE).map(line => {
        const value = line.trim().split("/").map(string => string.trim());
        if (value.length < 2) throw new Error("invalid source");
        return [value.join(""), value] as [string, [string, string]];
    }));
}
const FIRST_CONSONANT = toSet(`\
B BL BR BW BY
K KL KR KW KY
D DR DY
G GL GR GW
H
L
M MY
N NY
Ŋ
P PL PR PY
R
S SH SW
T TR TS TY
W
Y`);
FIRST_CONSONANT.add("");
const LAST_CONSONANT = toSet(`\
B
K KS
D DS
G
L LD LM LP LS LT
M MP MS
N ND NK NKS NS NT
Ŋ ŊS
P PS
R RB RD RK RM RN RP RS RT
S SH SK SM ST
T TS
W WG WN
Y YK YL YM YN YR YS YT`);
LAST_CONSONANT.add("");
const SPECIAL = parseSpecial(`\
B/L
/BR
B/W
B/Y
/DR
D/S
D/SH
D/SW
D/Y
G/L
G/R
G/W
K/L
/KR
K/S
K/SH
K/SW
K/W
K/Y
L/D
L/DR
L/DY
L/M
L/MY
L/P
L/PL
L/PR
L/PY
L/S
L/SH
L/SW
L/T
L/TR
LT/S
LT/Y
M/P
M/PL
M/PR
M/PY
M/S
M/SH
M/SW
M/Y
N/D
N/DR
N/DY
N/K
N/KL
N/KR
NK/S
NK/SH
NK/SW
N/KW
N/KY
N/S
N/SH
N/SW
N/T
N/TR
N/TS
N/TY
N/Y
Ŋ/S
Ŋ/SH
Ŋ/SW
P/L
/PR
P/S
P/SH
P/SW
P/Y
R/B
R/BL
R/BR
R/BW
R/BY
R/D
R/DR
R/DY
R/K
R/KL
R/KR
R/KW
R/KY
R/M
RM/Y
R/N
RN/Y
R/P
R/PL
R/PR
R/PY
R/S
R/SH
R/SW
R/T
R/TR
RT/S
RT/Y
/SH
S/K
S/KL
S/KR
S/KW
S/KY
S/M
S/MY
S/T
S/TR
ST/S
ST/Y
S/W
/TR
/TS
T/SH
T/SW
T/Y
W/G
W/GL
W/GR
W/GW
W/N
W/NY
Y/K
Y/KL
Y/KR
Y/KW
Y/KY
Y/L
Y/M
Y/MY
Y/N
Y/NY
Y/R
Y/S
Y/SH
Y/SW
Y/T
Y/TR
Y/TS
Y/TY`);
function splitConsonant(consonant: string): [string, string] {
    if (consonant.length <= 0) return ["", ""];
    if (consonant.length <= 1) return ["", consonant];
    if (SPECIAL.has(consonant)) return SPECIAL.get(consonant)!;
    for (let i = 0; i <= consonant.length; i++) {
        const lastRaw = consonant.slice(0, i);
        const firstRaw = consonant.slice(i);
        if (FIRST_CONSONANT.has(firstRaw) && LAST_CONSONANT.has(lastRaw)) {
            const result: [string, string] = [lastRaw, firstRaw];
            SPECIAL.set(consonant, result);
            return result;
        }
    }
    throw new Error(`unable to split ${consonant}`);
}
const HYPHEN = /(\-)/;
const VOWEL = /([AEIOU])/;
const NG = /NG/g;
const ENG = /Ŋ/g;
export function parsePartialWord(word: string): string[] {
    word = word.toUpperCase().replace(NG, "Ŋ");
    const tokens = word.split(VOWEL);
    const sliced = [tokens[0]];
    for (const token of tokens.slice(1, -1)) {
        if (VOWEL.test(token)) {
            sliced.push(token);
            continue;
        }
        const [lastRaw, firstRaw] = splitConsonant(token);
        sliced.push(lastRaw);
        sliced.push(firstRaw);
    }
    sliced.push(tokens[tokens.length - 1]);
    const syllables: string[] = [];
    for (let ind = 0; ind < sliced.length; ind += 3) {
        syllables.push(sliced.slice(ind, ind + 3).join("").replace(ENG, "NG"));
    }
    return syllables;
}
export function parseWord(word: string): string[] {
    const result: string[] = [];
    for (const partialWord of word.split(HYPHEN)) {
        if (partialWord === "-") {
            result.push("-");
            continue;
        }
        for (const syllable of parsePartialWord(partialWord)) result.push(syllable);
    }
    return result;
}