let blanko = /\s+/;
let mga_unahang_katinig = `
    b  c  d  f  g  h  j  k  l  m  n  p  ñ  ng  q  r  s  t  v  w  x  y  z
       ch                                            sh
    bl cl dl fl gl       kl          pl                 tl vl
    br cr dr fr gr       kr          pr                 tr vr
                                                        ts
`.toUpperCase().trim().split(blanko);
mga_unahang_katinig.push("");
let pang_unahan_at_hulihan = /^[BCDFGHJKLMNÑPQRSTVWXYZ]*|[BCDFGHJKLMNÑPQRSTVWXYZ]*$/g;
let pangkatinig_lahat = /^[BCDFGHJKLMNÑPQRSTVWXYZ]*$/;
let panggrupo = /[BCDFGHJKLMNÑPQRSTVWXYZ]+|[AEIOU]/g;
let pangpatinig = /[AEIOU]/;
let panggrupong_may_gitling = /[^\-]+|\-+/g;
function parseSingleWord(salita) {
    salita = salita.toUpperCase();
    if(pangkatinig_lahat.test(salita)) return [
        salita
    ];
    let [
        unahang_katinig,
        hulihang_katinig
    ] = salita.match(pang_unahan_at_hulihan);
    let kasalukuyang_katinig = unahang_katinig;
    let mga_pantig = [];
    for(let grupo of salita.replace(pang_unahan_at_hulihan, "").match(panggrupo)) {
        if(pangpatinig.test(grupo)) {
            mga_pantig.push(kasalukuyang_katinig + grupo);
            kasalukuyang_katinig = "";
        }else{
            for(let pang_ilan = 0, sukat = grupo.length; pang_ilan <= sukat; pang_ilan ++) {
                let kasalukuyang_hulihang_katinig = grupo.substring(0, pang_ilan);
                let kasalukuyang_unahang_katinig = grupo.substring(pang_ilan);
                if(mga_unahang_katinig.indexOf(kasalukuyang_unahang_katinig) >= 0) {
                    mga_pantig[mga_pantig.length - 1] += kasalukuyang_hulihang_katinig;
                    kasalukuyang_katinig = kasalukuyang_unahang_katinig;
                    break;
                }
            }
        }
    }
    mga_pantig[mga_pantig.length - 1] += hulihang_katinig;
    return mga_pantig;
}
export default function parseWord(salita) {
    let re = [];
    for(let grupo of salita.match(panggrupong_may_gitling)) {
        if(grupo == "-") {
            re.push("-");
        }else{
            for(let pantig of parseSingleWord(grupo)) re.push(pantig);
        }
    }
    return re;
}
