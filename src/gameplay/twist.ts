import {parseWord} from "../tagalog/parser";

class SyllableBlock {
    private pressed = false;

    constructor(private parentTwist: Twist, public syllable: string) {}
    unpress(): void {
        let {parentTwist: {formed}, pressed} = this;
        this.pressed = false;
        if (pressed) formed.splice(formed.indexOf(this), 1);
    }
    press(): void {
        let {parentTwist: {formed}, pressed} = this;
        this.pressed = true;
        if (!pressed) formed.push(this);
    }
}
class HyphenBlock {
    syllable = "-";

    constructor(private parentTwist: Twist) {}
    unpress(): void {
        const {parentTwist: {formed}} = this;
        formed.splice(formed.indexOf(this), 1);
    }
}
export class Twist {
    sourceWord: string;
    blocks: SyllableBlock[] = [];
    formed: (SyllableBlock | HyphenBlock)[] = [];

    constructor(public sourceBank: string[]) {
        const word = sourceBank[Math.floor(Math.random() * sourceBank.length)];
        this.sourceWord = word.toLowerCase();
        const syllables = parseWord(word).filter(word => word !== "-");
        syllables.sort(() => Math.random() - Math.random());
        for (const syllable of syllables) {
            this.blocks.push(new SyllableBlock(this, syllable.toLowerCase()));
        }
    }
    press(nth: number): void {
        this.blocks[nth]?.press();
    }
    clear(): void {
        for (const block of [...this.formed]) block.unpress();
    }
    addHyphen(): void {
        if (this.lastBlock instanceof HyphenBlock) return;
        this.formed.push(new HyphenBlock(this));
    }
    get isFilled(): boolean {
        return this.blocks.length - this.formed.filter(block => block instanceof SyllableBlock).length <= 0;
    }
    get formedWord(): string {
        return this.formed.map(block => block.syllable).join("");
    }
    get isValid(): boolean {
        const {isFilled, formedWord, sourceWord, sourceBank} = this;
        return isFilled && (formedWord === sourceWord || sourceBank.includes(formedWord.toUpperCase()));
    }
    get lastBlock(): SyllableBlock | HyphenBlock {
        let {formed} = this;
        return formed[formed.length - 1];
    }
}