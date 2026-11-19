// Fabrique une petite banque SoundFont 2 en mémoire pour les tests : pas de fichier, contenu connu d'avance.
// (Un vrai fichier .sf2 pèserait des Mo et son contenu ne serait pas vérifiable note par note.)
const enc = (s, n) => { const b = new Uint8Array(n); for (let i = 0; i < Math.min(s.length, n - 1); i++) b[i] = s.charCodeAt(i); return b; };
const coller = l => { const n = l.reduce((s, b) => s + b.length, 0), o = new Uint8Array(n); let p = 0; for (const b of l) { o.set(b, p); p += b.length; } return o; };
const bloc = (id, d) => { const t = new Uint8Array(8 + d.length + (d.length & 1)); t.set(enc(id, 5).subarray(0, 4)); new DataView(t.buffer).setUint32(4, d.length, true); t.set(d, 8); return t; };
const liste = (id, l) => bloc('LIST', coller([enc(id, 5).subarray(0, 4), ...l]));
const u16 = v => { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, v & 0xffff, true); return b; };
const u32 = v => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, v >>> 0, true); return b; };
const gen = ([op, v]) => coller([u16(op), Array.isArray(v) ? new Uint8Array(v) : u16(v)]);

/** sons: [{ nom, data: Int16Array, sr, root, boucle: [a, b] }], instruments: [{ nom, zones: [[[op, val], …]] }], presets: [{ nom, banque, programme, zones }] */
export function fabriquerSF2({ sons, instruments, presets, version = 2 }) {
  const smpl = [], shdr = []; let pos = 0;
  for (const s of sons) {
    smpl.push(new Uint8Array(s.data.buffer.slice(s.data.byteOffset, s.data.byteOffset + s.data.length * 2)), new Uint8Array(92));
    const [a, b] = s.boucle || [0, 0];
    shdr.push(coller([enc(s.nom, 20), u32(pos), u32(pos + s.data.length), u32(pos + a), u32(pos + b), u32(s.sr), new Uint8Array([s.root ?? 60, 0]), u16(0), u16(1)]));
    pos += s.data.length + 46;
  }
  shdr.push(coller([enc('EOS', 20), new Uint8Array(26)]));
  const sacs = (objets, tailleNom) => {
    const tetes = [], bags = [], gens = []; let nb = 0, ng = 0;
    for (const o of objets) { tetes.push({ o, bag: nb }); for (const z of o.zones) { bags.push(coller([u16(ng), u16(0)])); for (const g of z) { gens.push(gen(g)); ng++; } nb++; } }
    bags.push(coller([u16(ng), u16(0)])); gens.push(new Uint8Array(4));
    return { tetes, fin: nb, bags: coller(bags), gens: coller(gens) };
  };
  const I = sacs(instruments), P = sacs(presets);
  const inst = coller([...I.tetes.map(t => coller([enc(t.o.nom, 20), u16(t.bag)])), coller([enc('EOI', 20), u16(I.fin)])]);
  const phdr = coller([...P.tetes.map(t => coller([enc(t.o.nom, 20), u16(t.o.programme), u16(t.o.banque), u16(t.bag), new Uint8Array(12)])), coller([enc('EOP', 20), u16(0), u16(0), u16(P.fin), new Uint8Array(12)])]);
  const riff = coller([enc('sfbk', 5).subarray(0, 4),
    liste('INFO', [bloc('ifil', coller([u16(version), u16(1)])), bloc('INAM', enc('Banque de test', 16))]),
    liste('sdta', [bloc('smpl', coller(smpl))]),
    liste('pdta', [bloc('phdr', phdr), bloc('pbag', P.bags), bloc('pmod', new Uint8Array(10)), bloc('pgen', P.gens), bloc('inst', inst), bloc('ibag', I.bags), bloc('imod', new Uint8Array(10)), bloc('igen', I.gens), bloc('shdr', coller(shdr))])]);
  return bloc('RIFF', riff).buffer;
}

// ─── La banque de test ───────────────────────────────────────────────────────
// Programme 0 « piano » : deux couches de vélocité. La couche forte porte en plus l'octave (harmonique 2),
// ce qui permet de vérifier à l'oreille… d'un test laquelle a joué. Son de 0,25 s bouclé, précédé de 30 ms de silence.
// Banque 128 « batterie » : touche 36 = clic sec, 42 et 46 = charleys de la même classe exclusive (46 long).
export const SR = 32000, SILENCE = Math.round(0.03 * SR);
export function banqueDeTest() {
  const f0 = 261.6256, per = SR / f0, tours = Math.round(0.25 * SR / per), n = Math.round(tours * per);
  const sinus = h2 => { const d = new Int16Array(SILENCE + n + 64); for (let i = 0; i < n + 64; i++) d[SILENCE + i] = Math.round(12000 * (Math.sin(2 * Math.PI * i / per) + h2 * Math.sin(4 * Math.PI * i / per))); return d; };
  const clic = () => { const d = new Int16Array(SILENCE + 3200); for (let i = 0; i < 3200; i++) d[SILENCE + i] = Math.round(20000 * Math.exp(-i / 300) * (i % 16 < 8 ? 1 : -1)); return d; };
  const souffle = long => { const N = long ? 16000 : 1600, d = new Int16Array(N); let x = 12345; for (let i = 0; i < N; i++) { x = (x * 1103515245 + 12345) & 0x7fffffff; d[i] = Math.round(((x / 0x3fffffff) - 1) * 9000 * Math.exp(-i / (N / 4))); } return d; };
  const boucle = [SILENCE + Math.round(per * 4), SILENCE + Math.round(per * 4) + Math.round(per * (tours - 8))];
  const sons = [{ nom: 'doux', data: sinus(0), sr: SR, root: 60, boucle }, { nom: 'fort', data: sinus(0.8), sr: SR, root: 60, boucle },
    { nom: 'clic', data: clic(), sr: SR, root: 60 }, { nom: 'hh ferme', data: souffle(false), sr: SR, root: 60 }, { nom: 'hh ouvert', data: souffle(true), sr: SR, root: 60 }];
  const lent = 0;      // relâche : 2^(0/1200) = 1 s pour 100 dB
  const instruments = [
    { nom: 'piano', zones: [[[54, 1], [38, lent - 2400]], [[44, [0, 79]], [53, 0]], [[44, [80, 127]], [53, 1]]] },          // zone globale : boucle + relâche courte
    { nom: 'kit', zones: [[[43, [36, 36]], [58, 36], [53, 2]], [[43, [42, 42]], [58, 42], [57, 1], [53, 3]], [[43, [46, 46]], [58, 46], [57, 1], [17, 250], [53, 4]]] }];
  const presets = [{ nom: 'Piano de test', banque: 0, programme: 0, zones: [[[41, 0]]] }, { nom: 'Kit de test', banque: 128, programme: 0, zones: [[[41, 1]]] }];
  return fabriquerSF2({ sons, instruments, presets });
}
