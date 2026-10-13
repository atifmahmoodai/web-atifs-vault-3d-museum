/* The collection. Load order = array order (hero first, then alternating wings from the
   doorways outward). No Three.js dependency, so the no-WebGL fallback can use it too. */
export const CARS = [
  { key:'ferrari',   x:0,   z:0,    wing:'HERO', idx:'00', yOff:0.04,
    name:'Ferrari 288 GTO', len:4.6,
    blurb:'Born for a Group B era that never came — a twin-turbo V8 in the body that started the modern Ferrari supercar line. 272 built.' },

  { key:'charger',   x:-17, z: 3.2, wing:'A', idx:'01',
    name:'1969 Dodge Charger R/T', len:4.3,
    blurb:'The coke-bottle Mopar icon. Hidden headlights, 440 Magnum torque, and a silhouette every chase scene since has been chasing.' },

  { key:'aston',     x: 17, z: 3.2, wing:'B', idx:'01',
    name:'Aston Martin V12 Vantage', len:4.3,
    blurb:'Aston\u2019s smallest body stuffed with its biggest engine — a 5.9-litre V12 and one of the last great naturally aspirated GTs.' },

  { key:'camaro',    x:-24, z:-3.2, wing:'A', idx:'02',
    name:'1970 Camaro Pro Touring', len:4.3,
    blurb:'Second-gen F-body rebuilt to corner as hard as it launches — classic muscle skin over modern chassis thinking.' },

  { key:'bmw_m4',    x: 24, z:-3.2, wing:'B', idx:'02',
    name:'BMW M4 (F82)', len:4.3,
    blurb:'The first turbocharged M4 — a 3.0 twin-turbo straight-six and a chassis sharp enough to make the purists forgive the sound.' },

  { key:'challenger',file:'optimized/challenger.glb', x:-31, z: 3.2, wing:'A', idx:'03',
    name:'1971 Dodge Challenger', len:4.3,
    blurb:'Dodge\u2019s E-body brawler in triple black. Long hood, short deck, zero apologies.' },

  { key:'porsche',   x: 31, z: 3.2, wing:'B', idx:'03',
    name:'Porsche 911', len:4.3,
    blurb:'The rear-engined constant. Six decades of one silhouette, refined until physics gave up arguing.' },

  { key:'mustang',   x:-38, z:-3.2, wing:'A', idx:'04',
    name:'\u201969 Mustang · John Bowe', len:4.3,
    blurb:'A Trans-Am-bred \u201969 in touring-car legend John Bowe\u2019s race livery — built for circuits, not boulevards.' },

  { key:'amg_gt3',   x: 38, z:-3.2, wing:'B', idx:'04',
    name:'Mercedes-AMG GT3 Evo', len:4.3,
    blurb:'Customer racing, factory violence — a 6.3-litre V8 GT3 machine wearing full aero.' },

  { key:'hoonicorn', x:-45, z: 3.2, wing:'A', idx:'05',
    name:'Hoonicorn V2', len:4.3,
    blurb:'Ken Block\u2019s 1,400 hp AWD twin-turbo \u201965 Mustang — the internet\u2019s most famous tire destroyer.' },

  { key:'supra',     x: 45, z: 3.2, wing:'B', idx:'05',
    name:'Toyota Supra MK IV', len:4.3,
    blurb:'The 2JZ legend. Sequential turbos, a bulletproof block, and a tuner ceiling nobody has found yet.' },
];

export const WING_LABEL = { HERO:'LOBBY · HALO CAR', A:'WING A · AMERICAN MUSCLE', B:'WING B · EURO + JDM' };
