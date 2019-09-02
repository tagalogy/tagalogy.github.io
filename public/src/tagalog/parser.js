let allLetters = "qwertyuiopasdfghjklzxcvbnm".split("");
let adasd;
export default function wordParser(word) {
    let nodes = [];
    let cumm = "";
    for(let letter of word) {
        if(isVowel(letter)) {
            nodes.push(cumm);
            nodes.push(letter);
            cumm = "";
        }else{
            cumm += letter;
        }
    }
}
function isVowel(letter) {
    return letter == "a" || letter == "e" || letter == "i" || letter == "o" || letter == "u";
}
