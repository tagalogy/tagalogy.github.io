import {
    WORD
} from "./word.js";
let chain = Object.create(null);
function getNode(name) {
    let obj = chain[name];
    if(! obj) obj = chain[name] = Object.create(null);
    return obj;
}
function uprank(target, name) {
    let {
        [name]: val
    } = target;
    target[name] = val ? val + 1 : 1;
}
for(let word of WORD) {
    word = word.toUpperCase();
    uprank(getNode("start"), word[0]);
    for(let ind = 0, len = word.length; ind < len; ind ++) {
        let letter = word[ind];
        let next = word[ind + 1];
        let node = getNode(letter);
        if(next) {
            uprank(node, next);
        }else{
            uprank(node, "end");
        }
    }
}
function randomFrom(letter) {
    let node = getNode(letter);
    let total = 0;
    let meterName = [];
    let meterValue = [];
    for(let name in node) {
        let val = node[name];
        total += val;
        meterName.push(name);
        meterValue.push(val);
    }
    let runVal = 0;
    let rand = Math.random() * total;
    for(let ind = 0, len = meterValue.length; ind < len; ind ++) {
        runVal += meterValue[ind];
        if(runVal > rand) return meterName[ind];
    }
}
export default function genWord() {
    let letter = randomFrom("start");
    let word = "";
    do{
        word += letter;
        letter = randomFrom(letter);
    }while(letter != "end");
    return word;
}
debugger;
