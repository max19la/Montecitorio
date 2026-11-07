// =========================================================================
// MONTECITORIO - js/data.js
// Dati Statici, Costanti, Liste Partiti, Leggi, Eventi e Configurazioni
// =========================================================================

export const DISTINCT_PALETTE = ["#e11d48","#7c3aed","#0d9488","#ea580c","#4f46e5","#65a30d","#db2777","#0284c7","#d97706","#9333ea","#059669","#dc2626","#2563eb","#ca8a04","#475569","#be123c","#0891b2","#c026d3"];

    /* GENERATORE EMBLEMI VETTORIALI REALI PER TUTTI I 24 PARTITI + FOGLIO BIANCO PER INDIPENDENTI (PUNTI 11 & 15) */
export function getPartySVG(id, short="IND", color="#f8fafc", emblemType=0) {
      // PUNTO 15: Icona tutta bianca con un foglio bianco con scritte per gli Indipendenti
      if (id === 'ind') {
        return `<svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="47" fill="#ffffff" stroke="#cbd5e1" stroke-width="3.5"/>
          <rect x="28" y="16" width="44" height="54" rx="4" fill="#f8fafc" stroke="#0f172a" stroke-width="2.8"/>
          <line x1="35" y1="27" x2="65" y2="27" stroke="#0f172a" stroke-width="2.8" stroke-linecap="round"/>
          <line x1="35" y1="36" x2="65" y2="36" stroke="#334155" stroke-width="2.4" stroke-linecap="round"/>
          <line x1="35" y1="45" x2="62" y2="45" stroke="#334155" stroke-width="2.4" stroke-linecap="round"/>
          <line x1="35" y1="54" x2="54" y2="54" stroke="#475569" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M54 61 Q60 56 66 62" stroke="#0f172a" stroke-width="2.2" fill="none"/>
          <text x="50" y="88" text-anchor="middle" fill="#0f172a" font-size="11.5" font-weight="900">INDIP.</text>
        </svg>`;
      }
      const L = {
        fdi:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#0d2240" stroke="#fff" stroke-width="3"/><path d="M50 15 C40 32,34 44,43 58 C45 42,55 42,57 58 C66 44,60 32,50 15 Z" fill="#009246"/><path d="M50 26 C45 38,44 48,50 59 C56 48,55 38,50 26 Z" fill="#ce2b37"/><rect x="20" y="64" width="60" height="5" fill="#009246"/><rect x="20" y="69" width="60" height="5" fill="#fff"/><rect x="20" y="74" width="60" height="5" fill="#ce2b37"/><text x="50" y="90" text-anchor="middle" fill="#fff" font-size="11" font-weight="900">FdI</text></svg>`,
        pd:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#fff" stroke="#e11d48" stroke-width="4"/><path d="M18 58 H42 V80 H18 Z" fill="#009246"/><path d="M42 58 H58 V80 H42 Z" fill="#fff"/><path d="M58 58 H82 V80 H58 Z" fill="#ce2b37"/><text x="50" y="48" text-anchor="middle" fill="#e11d48" font-size="27" font-weight="900">PD</text></svg>`,
        m5s:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#991b1b" stroke="#facc15" stroke-width="4"/><circle cx="24" cy="40" r="4.5" fill="#facc15"/><circle cx="37" cy="36" r="4.5" fill="#facc15"/><circle cx="50" cy="34" r="5" fill="#facc15"/><circle cx="63" cy="36" r="4.5" fill="#facc15"/><circle cx="76" cy="40" r="4.5" fill="#facc15"/><text x="50" y="72" text-anchor="middle" fill="#fff" font-size="17" font-weight="900">M5S</text></svg>`,
        fi:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#0284c7" stroke="#fff" stroke-width="3"/><path d="M22 30 Q50 22 78 30 L78 42 Q50 34 22 42 Z" fill="#009246"/><path d="M22 40 Q50 32 78 40 L78 52 Q50 44 22 52 Z" fill="#fff"/><path d="M22 48 Q50 40 78 48 L78 60 Q50 52 22 60 Z" fill="#ce2b37"/><text x="50" y="79" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">FI</text></svg>`,
        lega:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#15803d" stroke="#facc15" stroke-width="3.5"/><circle cx="50" cy="31" r="7" fill="#fff"/><path d="M39 53 L50 36 L61 53 Z" fill="#fff"/><rect x="18" y="56" width="64" height="18" rx="3" fill="#fff"/><text x="50" y="69" text-anchor="middle" fill="#15803d" font-size="14" font-weight="900">LEGA</text></svg>`,
        avs:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#10b981" stroke="#fff" stroke-width="3"/><path d="M50 3 A47 47 0 0 0 3 50 L50 50 Z" fill="#dc2626"/><circle cx="50" cy="50" r="24" fill="#fff"/><text x="50" y="55" text-anchor="middle" fill="#065f46" font-size="12" font-weight="900">AVS</text></svg>`,
        fn:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#1e1b4b" stroke="#d4af37" stroke-width="3.5"/><polygon points="50,16 58,38 82,38 62,52 70,74 50,60 30,74 38,52 18,38 42,38" fill="#d4af37"/><text x="50" y="88" text-anchor="middle" fill="#fff" font-size="10" font-weight="900">FN</text></svg>`,
        azione:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#06b6d4" stroke="#fff" stroke-width="3"/><path d="M25 65 L75 35 M58 35 L75 35 L75 52" stroke="#fff" stroke-width="4" fill="none"/><text x="50" y="82" text-anchor="middle" fill="#083344" font-size="12" font-weight="900">AZIONE</text></svg>`,
        iv:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#ec4899" stroke="#fff" stroke-width="3"/><path d="M28 38 Q50 18 72 38 Q50 52 28 38 Z" fill="#fff"/><text x="50" y="74" text-anchor="middle" fill="#fff" font-size="16" font-weight="900">IV</text></svg>`,
        piueu:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#1d4ed8" stroke="#facc15" stroke-width="3.5"/><text x="50" y="57" text-anchor="middle" fill="#facc15" font-size="18" font-weight="900">+EU</text></svg>`,
        nm:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#0ea5e9" stroke="#fff" stroke-width="3"/><circle cx="50" cy="36" r="10" fill="none" stroke="#fff" stroke-width="3"/><text x="50" y="74" text-anchor="middle" fill="#fff" font-size="15" font-weight="900">NM</text></svg>`,
        pld:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#f59e0b" stroke="#fff" stroke-width="3"/><path d="M25 62 L50 26 L75 62 Z" fill="none" stroke="#111" stroke-width="3.5"/><text x="50" y="82" text-anchor="middle" fill="#111" font-size="13" font-weight="900">PLD</text></svg>`,
        dsp:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#7f1d1d" stroke="#facc15" stroke-width="3"/><polygon points="50,18 56,36 75,36 60,47 65,65 50,54 35,65 40,47 25,36 44,36" fill="#facc15"/><text x="50" y="85" text-anchor="middle" fill="#facc15" font-size="13" font-weight="900">DSP</text></svg>`,
        scn:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#ca8a04" stroke="#1e3a8a" stroke-width="3.5"/><circle cx="50" cy="36" r="11" fill="#fde047"/><text x="50" y="75" text-anchor="middle" fill="#fff" font-size="14" font-weight="900">ScN</text></svg>`,
        svp:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#334155" stroke="#fff" stroke-width="3"/><path d="M25 58 L42 30 L58 50 L70 36 L82 58 Z" fill="#fff"/><text x="50" y="80" text-anchor="middle" fill="#fff" font-size="14" font-weight="900">SVP</text></svg>`,
        pap:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#991b1b" stroke="#fde047" stroke-width="3"/><polygon points="50,15 58,36 80,36 62,49 69,70 50,57 31,70 38,49 20,36 42,36" fill="#fde047"/><text x="50" y="87" text-anchor="middle" fill="#fff" font-size="12" font-weight="900">PaP</text></svg>`,
        prc:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#b91c1c" stroke="#fff" stroke-width="3"/><path d="M35 55 A16 16 0 1 1 62 34 M38 34 L64 60" stroke="#fde047" stroke-width="4.5" fill="none"/><text x="50" y="85" text-anchor="middle" fill="#fff" font-size="12.5" font-weight="900">PRC</text></svg>`,
        ptd:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#e11d48" stroke="#fde047" stroke-width="3"/><circle cx="50" cy="40" r="16" fill="none" stroke="#fff" stroke-width="3"/><line x1="50" y1="24" x2="50" y2="56" stroke="#fff" stroke-width="3"/><line x1="50" y1="40" x2="39" y2="51" stroke="#fff" stroke-width="3"/><line x1="50" y1="40" x2="61" y2="51" stroke="#fff" stroke-width="3"/><text x="50" y="82" text-anchor="middle" fill="#fde047" font-size="13" font-weight="900">PTD</text></svg>`,
        psi:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#dc2626" stroke="#fff" stroke-width="3"/><circle cx="50" cy="36" r="11" fill="#f43f5e" stroke="#fff" stroke-width="2"/><path d="M50 47 L50 64 M42 55 L58 55" stroke="#16a34a" stroke-width="3.5"/><text x="50" y="84" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">PSI</text></svg>`,
        ndc:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#1e40af" stroke="#fff" stroke-width="3"/><path d="M34 24 H66 V48 C66 60 50 68 50 68 C50 68 34 60 34 48 Z" fill="#fff"/><line x1="50" y1="28" x2="50" y2="62" stroke="#dc2626" stroke-width="5"/><line x1="38" y1="42" x2="62" y2="42" stroke="#dc2626" stroke-width="5"/><text x="50" y="87" text-anchor="middle" fill="#fff" font-size="12" font-weight="900">UDC</text></svg>`,
        itx:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#0f766e" stroke="#fde047" stroke-width="3.5"/><text x="50" y="46" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">NO UE</text><rect x="22" y="55" width="56" height="5" fill="#009246"/><rect x="22" y="60" width="56" height="5" fill="#fff"/><rect x="22" y="65" width="56" height="5" fill="#ce2b37"/><text x="50" y="86" text-anchor="middle" fill="#fde047" font-size="11.5" font-weight="900">ITX</text></svg>`,
        cpi:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#18181b" stroke="#ef4444" stroke-width="3.5"/><polygon points="50,18 76,58 24,58" fill="none" stroke="#fff" stroke-width="3.5"/><text x="50" y="82" text-anchor="middle" fill="#ef4444" font-size="13.5" font-weight="900">CPI</text></svg>`,
        fnv:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#09090b" stroke="#fff" stroke-width="3.5"/><path d="M50 18 L58 46 L50 64 L42 46 Z" fill="#dc2626"/><text x="50" y="84" text-anchor="middle" fill="#fff" font-size="12.5" font-weight="900">FNV</text></svg>`,
        pdf:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#be185d" stroke="#fff" stroke-width="3"/><circle cx="38" cy="36" r="6" fill="#fff"/><circle cx="62" cy="36" r="6" fill="#fff"/><circle cx="50" cy="46" r="4.5" fill="#fde047"/><text x="50" y="79" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">PdF</text></svg>`
      };
      if (L[id]) return L[id];
      const pObj = game?.parties?.find(x => x.id === id);
      const eType = emblemType || pObj?.emblemType || ((short.charCodeAt(0) % 6) + 1);
      const shapes = {
        1:`<polygon points="50,16 56,33 74,33 59,43 65,60 50,50 35,60 41,43 26,33 44,33" fill="#fde047"/><rect x="22" y="64" width="56" height="4" fill="#009246"/><rect x="22" y="68" width="56" height="4" fill="#fff"/><rect x="22" y="72" width="56" height="4" fill="#ce2b37"/>`,
        2:`<circle cx="50" cy="42" r="14" fill="#fde047"/><path d="M20 58 Q50 46 80 58" stroke="#fff" stroke-width="4" fill="none"/>`,
        3:`<path d="M35 24 H65 V48 C65 60 50 68 50 68 C50 68 35 60 35 48 Z" fill="none" stroke="#fff" stroke-width="3.5"/><path d="M50 30 L56 46 L44 46 Z" fill="#fde047"/>`,
        4:`<path d="M30 56 Q50 22 72 42" stroke="#86efac" stroke-width="4" fill="none"/><circle cx="48" cy="36" r="5" fill="#fde047"/><circle cx="62" cy="36" r="5" fill="#fff"/>`,
        5:`<circle cx="50" cy="40" r="16" fill="none" stroke="#fff" stroke-width="3"/><polygon points="50,22 55,40 50,58 45,40" fill="#fde047"/>`,
        6:`<path d="M22 48 Q38 22 50 40 Q62 22 78 48 Q50 58 22 48 Z" fill="#fff"/>`
      };
      return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="${color}" stroke="#fff" stroke-width="3.5"/>${shapes[eType]||shapes[1]}<text x="50" y="88" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">${short}</text></svg>`;
    }

    /* 48 PROTAGONISTI REALI DELLA POLITICA ITALIANA GIOCABILI (PUNTO 10 - INCLUSO VINCENZO DE LUCA E MOLTI ALTRI) */
export const PRESET_POLITICIANS = [
      // SEGRETARI E LEADER NAZIONALI DI PARTITO
      { id:'p_meloni', name:"Giorgia Meloni", age:49, gender:"F", region:"Lazio", partyId:"fdi", role:"secretary", ideo:3.3, desc:"Presidente del Consiglio e Segretaria di Fratelli d'Italia." },
      { id:'p_schlein', name:"Elly Schlein", age:41, gender:"F", region:"Emilia-Romagna", partyId:"pd", role:"secretary", ideo:1.1, desc:"Segretaria Nazionale del Partito Democratico, guida l'opposizione progressista." },
      { id:'p_conte', name:"Giuseppe Conte", age:62, gender:"M", region:"Puglia", partyId:"m5s", role:"secretary", ideo:1.0, desc:"Presidente del Movimento 5 Stelle, ex Presidente del Consiglio." },
      { id:'p_salvini', name:"Matteo Salvini", age:53, gender:"M", region:"Lombardia", partyId:"lega", role:"secretary", ideo:3.5, desc:"Segretario Federale della Lega, Vicepremier e Ministro MIT." },
      { id:'p_tajani', name:"Antonio Tajani", age:73, gender:"M", region:"Lazio", partyId:"fi", role:"secretary", ideo:2.5, desc:"Segretario Nazionale di Forza Italia, Vicepremier e Ministro degli Esteri." },
      { id:'p_fratoianni', name:"Nicola Fratoianni", age:54, gender:"M", region:"Toscana", partyId:"avs", role:"secretary", ideo:0.6, desc:"Leader di Sinistra Italiana e co-leader di Alleanza Verdi e Sinistra." },
      { id:'p_bonelli', name:"Angelo Bonelli", age:64, gender:"M", region:"Lazio", partyId:"avs", role:"member", ideo:0.8, desc:"Co-portavoce di Europa Verde in AVS." },
      { id:'p_vannacci', name:"Roberto Vannacci", age:58, gender:"M", region:"Toscana", partyId:"fn", role:"secretary", ideo:3.8, desc:"Leader di Futuro Nazionale, destra identitaria e sovranista." },
      { id:'p_calenda', name:"Carlo Calenda", age:53, gender:"M", region:"Lazio", partyId:"azione", role:"secretary", ideo:2.1, desc:"Segretario di Azione, leader liberal-riformista ed europeista." },
      { id:'p_renzi', name:"Matteo Renzi", age:51, gender:"M", region:"Toscana", partyId:"iv", role:"secretary", ideo:2.2, desc:"Leader fondatore di Italia Viva, ex Presidente del Consiglio." },
      { id:'p_magi', name:"Riccardo Magi", age:50, gender:"M", region:"Lazio", partyId:"piueu", role:"secretary", ideo:1.5, desc:"Segretario di +Europa, promotore di referendum sui diritti civili." },
      { id:'p_lupi', name:"Maurizio Lupi", age:67, gender:"M", region:"Lombardia", partyId:"nm", role:"secretary", ideo:2.6, desc:"Leader di Noi Moderati, pilastro centrista del Centrodestra." },
      { id:'p_marattin', name:"Luigi Marattin", age:47, gender:"M", region:"Emilia-Romagna", partyId:"pld", role:"secretary", ideo:2.3, desc:"Segretario del Partito Liberaldemocratico, economista liberale." },
      { id:'p_cateno', name:"Cateno De Luca", age:54, gender:"M", region:"Sicilia", partyId:"scn", role:"secretary", ideo:2.0, desc:"Leader fondatore di Sud chiama Nord, 'Scateno' sindacalista dei Comuni." },
      { id:'p_rizzo', name:"Marco Rizzo", age:67, gender:"M", region:"Piemonte", partyId:"dsp", role:"secretary", ideo:0.3, desc:"Leader di Democrazia Sovrana Popolare, comunista sovranista." },
      { id:'p_collot', name:"Marta Collot", age:33, gender:"F", region:"Veneto", partyId:"pap", role:"secretary", ideo:0.1, desc:"Portavoce nazionale di Potere al Popolo!, sinistra anticapitalista." },
      { id:'p_acerbo', name:"Maurizio Acerbo", age:60, gender:"M", region:"Abruzzo", partyId:"prc", role:"secretary", ideo:0.2, desc:"Segretario Nazionale di Rifondazione Comunista." },
      { id:'p_santoro', name:"Michele Santoro", age:75, gender:"M", region:"Campania", partyId:"ptd", role:"secretary", ideo:0.7, desc:"Fondatore di Pace Terra Dignità, movimento pacifista." },
      { id:'p_paragone', name:"Gianluigi Paragone", age:55, gender:"M", region:"Lombardia", partyId:"itx", role:"secretary", ideo:3.7, desc:"Leader di Italexit, battagliero per l'uscita dell'Italia dall'UE e dall'Euro." },
      { id:'p_iannone', name:"Gianluca Iannone", age:53, gender:"M", region:"Lazio", partyId:"cpi", role:"secretary", ideo:4.0, desc:"Presidente di CasaPound Italia, estrema destra nazionalista." },
      { id:'p_fiore', name:"Roberto Fiore", age:67, gender:"M", region:"Lazio", partyId:"fnv", role:"secretary", ideo:4.0, desc:"Segretario Nazionale di Forza Nuova, destra radicale." },
      { id:'p_adinolfi', name:"Mario Adinolfi", age:55, gender:"M", region:"Lazio", partyId:"pdf", role:"secretary", ideo:3.5, desc:"Leader del Popolo della Famiglia, movimento ultracattolico." },
      { id:'p_mastella', name:"Clemente Mastella", age:79, gender:"M", region:"Campania", partyId:"ndc", role:"secretary", ideo:2.4, desc:"Leader di Noi di Centro / UDC, veterano della Democrazia Cristiana." },
      { id:'p_maraio', name:"Enzo Maraio", age:47, gender:"M", region:"Campania", partyId:"psi", role:"secretary", ideo:1.4, desc:"Segretario Nazionale del Partito Socialista Italiano (PSI)." },

      // GOVERNATORI ("SCERIFFI" & "DOGI"), CAPICORRENTE E BIG DI PARTITO (PUNTO 10)
      { id:'p_vdeluca', name:"Vincenzo De Luca", age:77, gender:"M", region:"Campania", partyId:"pd", role:"member", ideo:1.7, desc:"'Lo Sceriffo' della Campania: capocorrente pragmatico nel PD, pronto a sfidare Schlein o creare una lista autonoma!" },
      { id:'p_zaia', name:"Luca Zaia", age:58, gender:"M", region:"Veneto", partyId:"lega", role:"member", ideo:2.6, desc:"'Il Doge' del Veneto: leader della Corrente Autonomista Nord nella Lega, può sfidare Salvini al Congresso!" },
      { id:'p_bonaccini', name:"Stefano Bonaccini", age:59, gender:"M", region:"Emilia-Romagna", partyId:"pd", role:"member", ideo:1.6, desc:"Leader di Energia Popolare (ala riformista del PD): sfida Schlein per la segreteria." },
      { id:'p_larussa', name:"Ignazio La Russa", age:79, gender:"M", region:"Sicilia", partyId:"fdi", role:"member", ideo:3.6, desc:"Presidente del Senato (2ª carica dello Stato) e colonnello storico della Destra." },
      { id:'p_fontana_l', name:"Lorenzo Fontana", age:46, gender:"M", region:"Veneto", partyId:"lega", role:"member", ideo:3.5, desc:"Presidente della Camera dei Deputati (3ª carica dello Stato), vicesegretario della Lega." },
      { id:'p_giorgetti', name:"Giancarlo Giorgetti", age:59, gender:"M", region:"Lombardia", partyId:"lega", role:"member", ideo:2.5, desc:"Ministro dell'Economia (MEF), guida l'ala governista e produttiva della Lega." },
      { id:'p_crosetto', name:"Guido Crosetto", age:63, gender:"M", region:"Piemonte", partyId:"fdi", role:"member", ideo:2.9, desc:"Ministro della Difesa e co-fondatore di Fratelli d'Italia, profilo istituzionale." },
      { id:'p_grillo', name:"Beppe Grillo", age:78, gender:"M", region:"Liguria", partyId:"m5s", role:"member", ideo:1.2, desc:"Il Fondatore e Garante ribelle del M5S: puoi sfidare Conte per riprenderti il Movimento delle origini!" },
      { id:'p_dibattista', name:"Alessandro Di Battista", age:48, gender:"M", region:"Lazio", partyId:"m5s", role:"member", ideo:0.7, desc:"Leader dell'ala movimentista, antimperialista e anti-sistema nel M5S." },
      { id:'p_appendino', name:"Chiara Appendino", age:42, gender:"F", region:"Piemonte", partyId:"m5s", role:"member", ideo:1.0, desc:"Ex Sindaca di Torino e capocorrente interna nel M5S." },
      { id:'p_raggi', name:"Virginia Raggi", age:48, gender:"F", region:"Lazio", partyId:"m5s", role:"member", ideo:1.3, desc:"Ex Sindaca di Roma, esponente dell'ala ortodossa 5 Stelle." },
      { id:'p_fico', name:"Roberto Fico", age:52, gender:"M", region:"Campania", partyId:"m5s", role:"member", ideo:0.7, desc:"Ex Presidente della Camera, leader dell'ala di sinistra del M5S." },
      { id:'p_bersani', name:"Pier Luigi Bersani", age:75, gender:"M", region:"Emilia-Romagna", partyId:"pd", role:"member", ideo:0.9, desc:"Padre nobile della sinistra del lavoro nel PD, campione di consenso popolare." },
      { id:'p_dalema', name:"Massimo D'Alema", age:77, gender:"M", region:"Puglia", partyId:"pd", role:"member", ideo:1.0, desc:"Ex Premier e stratega della sinistra, tessitore di alleanze e politica estera." },
      { id:'p_decaro', name:"Antonio Decaro", age:56, gender:"M", region:"Puglia", partyId:"pd", role:"member", ideo:1.3, desc:"Mister 500mila preferenze nel Mezzogiorno, astro nascente del PD." },
      { id:'p_sala', name:"Beppe Sala", age:68, gender:"M", region:"Lombardia", partyId:"pd", role:"member", ideo:1.8, desc:"Sindaco di Milano, punto di riferimento dell'area riformista-ecologista." },
      { id:'p_mberlusconi', name:"Marina Berlusconi", age:60, gender:"F", region:"Lombardia", partyId:"fi", role:"member", ideo:2.3, desc:"Erede dinastica: scendi in campo in Forza Italia per guidare i moderati liberali!" },
      { id:'p_occhiuto', name:"Roberto Occhiuto", age:57, gender:"M", region:"Calabria", partyId:"fi", role:"member", ideo:2.4, desc:"Governatore della Calabria e capocorrente riformista in Forza Italia." },
      { id:'p_bonino', name:"Emma Bonino", age:78, gender:"F", region:"Piemonte", partyId:"piueu", role:"member", ideo:1.6, desc:"Leader storica radicale ed europeista per gli Stati Uniti d'Europa." },
      { id:'p_isalis', name:"Ilaria Salis", age:42, gender:"F", region:"Lombardia", partyId:"avs", role:"member", ideo:0.2, desc:"Eurodeputata di AVS, punto di riferimento dei movimenti antagonisti e per il diritto all'abitare." },

      // PERSONALITÀ INDIPENDENTI E STATISTI DELLA REPUBBLICA
      { id:'p_draghi', name:"Mario Draghi", age:79, gender:"M", region:"Lazio", partyId:"ind", role:"independent", ideo:2.0, desc:"Indipendente di altissimo prestigio internazionale: può diventare Premier o Presidente della Repubblica." },
      { id:'p_panetta', name:"Fabio Panetta", age:67, gender:"M", region:"Lazio", partyId:"ind", role:"independent", ideo:2.1, desc:"Governatore di Bankitalia: potenziale Ministro MEF, Premier Tecnico o fondatore." },
      { id:'p_cartabia', name:"Marta Cartabia", age:63, gender:"F", region:"Lombardia", partyId:"ind", role:"independent", ideo:1.9, desc:"Presidente emerita della Consulta: figura chiave per Governi Istituzionali o Quirinale." },
      { id:'p_prodi', name:"Romano Prodi", age:87, gender:"M", region:"Emilia-Romagna", partyId:"ind", role:"independent", ideo:1.4, desc:"Il Professore, fondatore dell'Ulivo ed ex Presidente Commissione UE." },
      { id:'p_cottarelli', name:"Carlo Cottarelli", age:72, gender:"M", region:"Lombardia", partyId:"ind", role:"independent", ideo:2.2, desc:"Economista riformista indipendente, specialista di conti pubblici." },
      { id:'p_sgarbi', name:"Vittorio Sgarbi", age:74, gender:"M", region:"Emilia-Romagna", partyId:"ind", role:"independent", ideo:2.9, desc:"Critico d'arte e libero battitore della politica italiana." }
    ];

    /* 14 DOSSIER CON 5 OPZIONI IDEOLOGICHE CIASCUNO: 0 (Estrema Sx) -> 1 (Progressista) -> 2 (Centro) -> 3 (Conservatrice) -> 4 (Estrema Dx) (PUNTI 3 & 16) */
export const STANCE_LABELS = [
      { idx:0, cls:'sb-0', tag:'🚩 Estrema Sinistra / Radicale', short:'🚩 Estrema Sx' },
      { idx:1, cls:'sb-1', tag:'🌹 Progressista / Sinistra', short:'🌹 Progressista' },
      { idx:2, cls:'sb-2', tag:'⚖️ Centro / Riformista Moderato', short:'⚖️ Centro Mod.' },
      { idx:3, cls:'sb-3', tag:'🔵 Conservatrice / Destra', short:'🔵 Conservatrice' },
      { idx:4, cls:'sb-4', tag:'🦅 Estrema Destra / Sovranista', short:'🦅 Estrema Dx' }
    ];

export const DOSSIERS = [
      { key:'tax', title:'1. Fisco, Tasse e Patrimoniale', opts:[
        'Esproprio grandi rendite, Patrimoniale 5% sopra 1M€ e lotta dura al capitale',
        'Patrimoniale 2% sui super-ricchi, IRPEF progressiva e taglio tasse ai salari',
        'Taglio cuneo fiscale, lotta digitale all’evasione e aliquota media al 23%',
        'Flat Tax estesa al 15% per Partite IVA/famiglie e Pace Fiscale con l’Erario',
        'Flat Tax universale al 10%, condono tombale cartelle e abolizione limiti contante'
      ]},
      { key:'work', title:'2. Lavoro, Salari e Sindacati', opts:[
        '32 ore settimanali a parità di paga, Salario Minimo 12€/h e divieto delocalizzazioni',
        'Salario Minimo legale a 10€/h, abolizione stage precari e scala mobile',
        'Contrattazione collettiva detassata, partecipazione agli utili e incentivi assunzioni',
        'Flessibilità aziendale, premialità individuale, voucher e meno vincoli alle PMI',
        'Corporativismo nazionale, limitazione scioperi politici e deregolamentazione totale'
      ]},
      { key:'pensions', title:'3. Pensioni e Sistema INPS', opts:[
        'Pensione a 60 anni o 35 di contributi finanziata dalla tassazione sulle banche',
        'Pensione di garanzia per i giovani, uscita flessibile a 62 anni e Opzione Donna',
        'Rispetto rigoroso del sistema contributivo (Fornero) e previdenza integrativa',
        'Quota 41 per tutti, aumento pensioni minime a 1.000€ e incentivi a restare',
        'Previdenza sovrana fuori dai vincoli UE e priorità assoluta agli anziani italiani'
      ]},
      { key:'welfare', title:'4. Sanità Pubblica e Lotta alla Povertà', opts:[
        'Sanità 100% pubblica (bandita la privata convenzionata) e Reddito Universale',
        'Spesa SSN all’8% del PIL, piano assunzioni medici e Reddito di Cittadinanza',
        'Sanità mista pubblico-privata regolata, abbattimento liste d’attesa e Assegno Inclusione',
        'Autonomia sanitaria regionale, assicurazioni integrative e workfare obbligatorio',
        'Priorità nazionale negli ospedali e nei sussidi sociali riservata ai soli cittadini italiani'
      ]},
      { key:'rights', title:'5. Diritti Civili, Famiglia e Bioetica', opts:[
        'Piena legalizzazione droghe leggere, matrimonio egualitario, GPA solidale ed eutanasia libera',
        'Matrimonio egualitario con adozioni, legge sul fine vita e cannabis legale',
        'Tutela unioni civili vigenti, congedo paritario e potenziamento asili nido',
        'Difesa famiglia tradizionale uomo-donna, quoziente familiare e GPA reato universale',
        'Stato etico tradizionalista, restrizione aborto (L.194) e bando cosiddetta ideologia gender'
      ]},
      { key:'imm', title:'6. Immigrazione, Cittadinanza e Confini', opts:[
        'Abolizione legge Bossi-Fini, chiusura immediata CPR, Ius Soli puro e accoglienza aperta',
        'Ius Scholae (5 anni di scuola), corridoi umanitari europei e integrazione diffusa',
        'Quote flussi lavorativi programmate con le imprese e rimpatri mirati per chi delinque',
        'Centri migranti in Paesi terzi (modello Albania), stretta ONG e difesa confini',
        'Blocco navale militare totale, sospensione Schengen e piano di remigrazione forzata'
      ]},
      { key:'justice', title:'7. Giustizia, Magistratura e Carceri', opts:[
        'Carcere duro per reati finanziari/colletti bianchi, amnistia sociale e abolizione 41-bis',
        'Indipendenza assoluta dei PM, lotta alla corruzione, pene alternative e dignità carceri',
        'Giustizia rapida per le imprese, digitalizzazione tribunali e garantismo costituzionale',
        'Separazione delle carriere dei magistrati, stretta intercettazioni e Piano Carceri',
        'Tolleranza zero, lavori forzati per i detenuti, immunità forze dell’ordine e pugno di ferro'
      ]},
      { key:'inst', title:'8. Ordinamento dello Stato e Riforme', opts:[
        'Repubblica Assembleare monocamerale del popolo e nazionalizzazione settori strategici',
        'Parlamentarismo proporzionale puro, difesa Costituzione 1948 e stop Autonomia',
        'Cancellierato con sfiducia costruttiva e riforma dei regolamenti parlamentari',
        'Premierato elettivo diretto e Autonomia Differenziata per le Regioni',
        'Presidenzialismo forte con pieni poteri esecutivi al Capo dello Stato e Stato centralista'
      ]},
      { key:'eu', title:'9. Unione Europea e Moneta', opts:[
        'Rottura dei Trattati UE neoliberisti e socialismo mediterraneo fuori dall’austerity',
        'Stati Uniti d’Europa, bilancio federale, Eurobond e abolizione diritto di veto',
        'Integrazione europea pragmatica, rispetto del Patto di Stabilità e tutela BTP',
        'Europa delle Nazioni sovrane, revisione Green Deal e difesa confini esterni',
        'Italexit: referendum per l’uscita dall’Unione Europea e ritorno alla Lira sovrana'
      ]},
      { key:'foreign', title:'10. Politica Estera, NATO e Difesa', opts:[
        'Uscita immediata dalla NATO, chiusura basi USA in Italia e allineamento multipolare/BRICS',
        'Neutralità attiva, taglio spese militari, diplomazia di pace ONU e difesa europea',
        'Fermo ancoraggio euro-atlantico (UE + NATO) e spesa difesa intorno al 2% PIL',
        'Rafforzamento Forze Armate al 2.5% PIL, asse privilegiato con Washington e Piano Mattei',
        'Sovranismo geopolitico totale, fine sanzioni alla Russia e riarmo nazionale autonomo'
      ]},
      { key:'energy', title:'11. Energia, Clima e Nucleare', opts:[
        'Decrescita ecologica, esproprio multinazionali fossili e trasporto pubblico gratuito',
        '100% Energie Rinnovabili entro il 2035, stop trivelle e comunità energetiche',
        'Mix equilibrato Rinnovabili + Nucleare di nuova generazione (SMR) per tagliare i costi',
        'Hub del gas nel Mediterraneo, nucleare nazionale e stop al bando auto 2035',
        'Uscita dagli Accordi sul Clima di Parigi, riapertura centrali e sovranità energetica fossile'
      ]},
      { key:'infra', title:'12. Grandi Opere e Trasporti', opts:[
        'Stop TAV e Ponte sullo Stretto: tutti i fondi a case popolari, scuole e messa in sicurezza',
        'Priorità a treni pendolari, reti idriche al Sud e mobilità ciclabile/sostenibile',
        'Completamento opere PNRR, Alta Velocità ferroviaria e potenziamento porti',
        'Costruzione immediata del Ponte sullo Stretto di Messina e sblocco cantieri autostradali',
        'Grandi opere monumentali di Stato con commissari straordinari senza vincoli ambientali'
      ]},
      { key:'edu', title:'13. Scuola, Università e Cultura', opts:[
        'Università e libri 100% gratuiti, abolizione numero chiuso e stop finanziamenti alle private',
        'Stipendi docenti alla media europea, asili nido universali gratis e ricerca pubblica',
        'Filiere tecnico-scientifiche (ITS), merito universitario e incentivi rientro cervelli',
        'Scuola del merito e dell’autorità, voto in condotta severo e buono scuola per le paritarie',
        'Educazione patriottica e identitaria obbligatoria nelle scuole e difesa radici classiche'
      ]},
      { key:'industry', title:'14. Industria, Mercato e Banche', opts:[
        'Nazionalizzazione di banche, autostrade, telecomunicazioni e grande siderurgia',
        'Stato innovatore, tassa sugli extraprofitti bancari e tutela occupazionale',
        'Concorrenza, liberalizzazioni dei servizi, attrazione capitali esteri e Industria 5.0',
        'Protezione del Made in Italy, difesa concessioni balneari e ambulanti, dazi anti-dumping',
        'Autarchia strategica nazionale, controllo statale del credito e barriere doganali'
      ]}
    ];

    /* 12 BACINI SOCIALI ELETTORALI (INCLUSI GLI ESTREMISMI DI SINISTRA E DI DESTRA - PUNTO 3) */
export const BLOCS = [
      { id:'operai', name:'Operai, Logistica e Manifattura', share:13.5, prio:['work','pensions','imm','industry'], ideal:{work:1,pensions:3,imm:3,industry:1,tax:1} },
      { id:'impiegati', name:'Impiegati, Scuola e Pubblica Amm.', share:14.5, prio:['tax','welfare','edu','work'], ideal:{tax:1,welfare:1,edu:1,work:1,eu:1} },
      { id:'piva', name:'Artigiani, Commercianti e Partite IVA', share:14.5, prio:['tax','industry','justice','energy'], ideal:{tax:3,industry:3,justice:3,energy:3,work:3} },
      { id:'manager', name:'Industriali, Manager e Liberi Prof.', share:7.5, prio:['eu','industry','tax','infra'], ideal:{eu:2,industry:2,tax:2,infra:3,energy:2} },
      { id:'pensionati', name:'Pensionati e Terza Età', share:20.5, prio:['pensions','welfare','imm','tax'], ideal:{pensions:2,welfare:2,imm:3,tax:2,rights:3} },
      { id:'giovani', name:'Giovani e Universitari Under-30', share:8.0, prio:['work','rights','energy','edu'], ideal:{work:1,rights:1,energy:1,edu:1,eu:1} },
      { id:'fragili_sud', name:'Precari e Periferie Mezzogiorno', share:7.5, prio:['welfare','work','inst','infra'], ideal:{welfare:1,work:1,inst:1,infra:1,tax:1} },
      { id:'cattolici', name:'Cattolici Moderati e Terzo Settore', share:4.5, prio:['rights','welfare','edu','eu'], ideal:{rights:3,welfare:2,edu:3,eu:2,justice:2} },
      { id:'progressisti', name:'Progressisti Urbani ed Ecologisti', share:3.5, prio:['rights','energy','imm','tax'], ideal:{rights:1,energy:1,imm:1,tax:1,inst:1} },
      { id:'identitari', name:'Conservatori Sovranisti e Sicurezza', share:3.0, prio:['imm','eu','foreign','rights'], ideal:{imm:3,eu:3,foreign:3,rights:3,inst:3} },
      { id:'antagonisti', name:'Collettivi, Sindacati Base & Estrema Sx', share:1.5, prio:['work','tax','foreign','industry'], ideal:{work:0,tax:0,foreign:0,industry:0,rights:0,eu:0} },
      { id:'nazionalisti', name:'Ultranazionalisti, No-Euro & Estrema Dx', share:1.5, prio:['imm','eu','inst','rights'], ideal:{imm:4,eu:4,inst:4,rights:4,foreign:4,justice:4} }
    ];

    /* I 24 PARTITI POLITICI ITALIANI CON 3 CORRENTI INTERNE CIASCUNO (PUNTI 2, 3, 11) */
export const INITIAL_PARTIES = [
      { id:'fdi', name:"Fratelli d'Italia", short:"FdI", leader:"Giorgia Meloni", leaderAge:49, leaderTrust:86, nextCongYear:2028, area:"Destra", coalId:"cdx", color:"#2563eb", poll:29.2, seats:118, inGov:true, credibility:85, cohesion:88, orgStrength:89,
        wingLeader:"Fabio Rampelli", wingAge:66, wingName:"Gabbiani (Destra Sociale)", wingArea:"Centro-Destra",
        factions:[
          { name:"Fiamma Conservatrice (Maggioranza)", leader:"Giorgia Meloni", share:58, desc:"Linea governista, conservatrice nazionale ed euro-atlantica." },
          { name:"I Gabbiani (Destra Sociale)", leader:"Fabio Rampelli", share:24, desc:"Radici sociali, intervento pubblico e identità militante." },
          { name:"Ala Atlantista & Produttiva", leader:"Guido Crosetto", share:18, desc:"Dialogo con imprese, difesa ed establishment internazionale." }
        ],
        splitName:"Destra Sociale Italiana", splitShort:"DSI", bio:"Primo partito italiano e guida del Governo. Conservatore nazionale (ECR).",
        vetoes:['pd','avs','m5s','dsp','pap','prc','ptd'], stances:{tax:3,work:2,pensions:2,welfare:2,rights:3,imm:3,justice:3,inst:3,eu:3,foreign:3,energy:3,infra:3,edu:3,industry:3} },

      { id:'pd', name:"Partito Democratico", short:"PD", leader:"Elly Schlein", leaderAge:41, leaderTrust:76, nextCongYear:2027, area:"Centro-Sinistra", coalId:"csx", color:"#ef4444", poll:21.2, seats:85, inGov:false, credibility:79, cohesion:74, orgStrength:85,
        wingLeader:"Stefano Bonaccini", wingAge:59, wingName:"Energia Popolare (Riformisti)", wingArea:"Centro",
        factions:[
          { name:"Parte da Noi (Sinistra Dem)", leader:"Elly Schlein", share:48, desc:"Linea identitaria su diritti civili, salario minimo, clima e sanità." },
          { name:"Energia Popolare (Riformisti)", leader:"Stefano Bonaccini", share:32, desc:"Ala governista dei sindaci e amministratori, vicina ai ceti produttivi." },
          { name:"Corrente Pragmatica del Sud", leader:"Vincenzo De Luca", share:20, desc:"Realismo amministrativo, sicurezza, fondi Sud e lotta alle correnti romane." }
        ],
        splitName:"Democratici Riformisti", splitShort:"DR", bio:"Perno dell'opposizione progressista (S&D).",
        vetoes:['fdi','lega','fn','dsp','itx','cpi','fnv'], stances:{tax:1,work:1,pensions:1,welfare:1,rights:1,imm:1,justice:1,inst:1,eu:1,foreign:2,energy:1,infra:1,edu:1,industry:1} },

      { id:'m5s', name:"Movimento 5 Stelle", short:"M5S", leader:"Giuseppe Conte", leaderAge:62, leaderTrust:80, nextCongYear:2028, area:"Movimento", coalId:"csx", color:"#eab308", poll:11.4, seats:51, inGov:false, credibility:75, cohesion:76, orgStrength:71,
        founderLeader:"Giuseppe Conte",
        wingLeader:"Chiara Appendino", wingAge:42, wingName:"Ala Territoriale", wingArea:"Sinistra",
        factions:[
          { name:"Nuovo Corso Progressista", leader:"Giuseppe Conte", share:54, desc:"Forza progressista su reddito, salario minimo, giustizia e pacifismo." },
          { name:"Ortodossi delle Origini", leader:"Beppe Grillo", share:24, desc:"Ritorno allo spirito originario anti-casta, limite dei 2 mandati e democrazia diretta." },
          { name:"Ala Territoriale & Nord", leader:"Chiara Appendino", share:22, desc:"Radicamento locale, alleanze strutturali e attenzione alle PMI." }
        ],
        splitName:"Movimento delle Origini", splitShort:"M5O", bio:"Forza popolare progressista attenta al welfare, alla legalità e alla pace.",
        vetoes:['fdi','fi','lega','fn','iv','cpi','fnv'], stances:{tax:1,work:1,pensions:1,welfare:1,rights:1,imm:2,justice:1,inst:1,eu:1,foreign:1,energy:1,infra:1,edu:1,industry:1} },

      { id:'fi', name:"Forza Italia", short:"FI", leader:"Antonio Tajani", leaderAge:73, leaderTrust:81, nextCongYear:2027, area:"Centro-Destra", coalId:"cdx", color:"#38bdf8", poll:9.1, seats:45, inGov:true, credibility:82, cohesion:82, orgStrength:76,
        wingLeader:"Roberto Occhiuto", wingAge:57, wingName:"Ala Riformista & Sud", wingArea:"Centro",
        factions:[
          { name:"Popolari Europeisti (PPE)", leader:"Antonio Tajani", share:52, desc:"Linea moderata, atlantista, europeista e fedele al centrodestra di governo." },
          { name:"Ala Liberale & Diritti", leader:"Marina Berlusconi", share:26, desc:"Garantismo liberale, apertura sui diritti civili e tutela d'impresa." },
          { name:"Governatori & Mezzogiorno", leader:"Roberto Occhiuto", share:22, desc:"Riformismo amministrativo e rilancio infrastrutturale del Sud." }
        ],
        splitName:"Liberali Azzurri", splitShort:"LA", bio:"Pilastro liberale, garantista e popolare (PPE) del Centrodestra.",
        vetoes:['avs','m5s','dsp','pap','prc','cpi','fnv'], stances:{tax:3,work:2,pensions:3,welfare:2,rights:2,imm:2,justice:3,inst:2,eu:2,foreign:2,energy:2,infra:3,edu:2,industry:2} },

      { id:'lega', name:"Lega Salvini Premier", short:"Lega", leader:"Matteo Salvini", leaderAge:53, leaderTrust:70, nextCongYear:2027, area:"Destra", coalId:"cdx", color:"#16a34a", poll:8.3, seats:63, inGov:true, credibility:75, cohesion:68, orgStrength:82,
        wingLeader:"Luca Zaia", wingAge:58, wingName:"Corrente Autonomista Nord", wingArea:"Centro-Destra",
        factions:[
          { name:"Lega Nazionale Sovranista", leader:"Matteo Salvini", share:46, desc:"Destra sovranista, blocco navale, Pace Fiscale, Ponte sullo Stretto e Quota 41." },
          { name:"Liga Autonomista del Nord", leader:"Luca Zaia", share:34, desc:"Autonomia differenziata, federalismo fiscale e radicamento nel Nord produttivo." },
          { name:"Ala Governista & Imprese", leader:"Giancarlo Giorgetti", share:20, desc:"Pragmatismo economico, dialogo con l'UE e tutela della manifattura." }
        ],
        splitName:"Liga Autonomista del Nord", splitShort:"LAN", bio:"Forza autonomista e sovranista radicata nel Nord e nei ceti produttivi.",
        vetoes:['pd','avs','m5s','piueu','pap','prc','scn'], stances:{tax:3,work:3,pensions:3,welfare:3,rights:3,imm:4,justice:3,inst:3,eu:3,foreign:3,energy:3,infra:3,edu:3,industry:3} },

      { id:'avs', name:"Alleanza Verdi e Sinistra", short:"AVS", leader:"Nicola Fratoianni", leaderAge:54, leaderTrust:79, nextCongYear:2028, area:"Sinistra", coalId:"csx", color:"#10b981", poll:5.9, seats:12, inGov:false, credibility:77, cohesion:80, orgStrength:62,
        wingLeader:"Angelo Bonelli", wingAge:64, wingName:"Federazione Europa Verde", wingArea:"Sinistra",
        factions:[
          { name:"Sinistra Italiana", leader:"Nicola Fratoianni", share:46, desc:"Patrimoniale, giustizia sociale, lavoro, sanità pubblica e pacifismo." },
          { name:"Europa Verde", leader:"Angelo Bonelli", share:36, desc:"Transizione ecologica radicale, stop fossili e tutela del territorio." },
          { name:"Movimenti & Antagonismo", leader:"Ilaria Salis", share:18, desc:"Diritto all'abitare, antifascismo militante e abolizione carceri dure." }
        ],
        splitName:"Ecologisti Europei", splitShort:"EE", bio:"Polo rosso-verde eco-socialista della sinistra radicale.",
        vetoes:['fdi','lega','fi','fn','iv','azione','itx','cpi','fnv'], stances:{tax:0,work:0,pensions:1,welfare:0,rights:0,imm:0,justice:1,inst:1,eu:1,foreign:0,energy:0,infra:0,edu:0,industry:0} },

      { id:'fn', name:"Futuro Nazionale", short:"FN", leader:"Roberto Vannacci", leaderAge:58, leaderTrust:88, nextCongYear:2029, area:"Estrema Destra", coalId:"none", color:"#6366f1", poll:3.1, seats:3, inGov:false, credibility:72, cohesion:84, orgStrength:55,
        personalParty:true, founderLeader:"Roberto Vannacci",
        wingLeader:"Simone Pillon", wingAge:55, wingName:"Nucleo Tradizione", wingArea:"Destra",
        factions:[
          { name:"Mondo al Contrario", leader:"Roberto Vannacci", share:68, desc:"Patria, confini, sicurezza, sovranità energetica e stop ideologia woke." },
          { name:"Nucleo Famiglia & Tradizione", leader:"Simone Pillon", share:20, desc:"Difesa oltranzista di vita, famiglia naturale e radici cristiane." },
          { name:"Comitati Sovranisti", leader:"Claudio Borghi", share:12, desc:"Critica all'Eurozona e recupero della sovranità monetaria." }
        ],
        splitName:"Patria e Tradizione", splitShort:"PT", bio:"Movimento della destra identitaria, sovranista e nazionalista.",
        vetoes:['pd','avs','m5s','piueu','iv','pap','prc'], stances:{tax:3,work:3,pensions:3,welfare:3,rights:4,imm:4,justice:4,inst:4,eu:4,foreign:4,energy:4,infra:3,edu:4,industry:3} },

      { id:'azione', name:"Azione", short:"AZ", leader:"Carlo Calenda", leaderAge:53, leaderTrust:82, nextCongYear:2028, area:"Centro", coalId:"pld_c", color:"#06b6d4", poll:3.0, seats:9, inGov:false, credibility:77, cohesion:78, orgStrength:58,
        personalParty:true, founderLeader:"Carlo Calenda",
        wingLeader:"Ettore Rosato", wingAge:58, wingName:"Area Moderata", wingArea:"Centro",
        factions:[
          { name:"Fronte Repubblicano Pragmatico", leader:"Carlo Calenda", share:64, desc:"Industria 4.0, nucleare, sanità, atlantismo e rigore sui conti." },
          { name:"Area Moderata & Territori", leader:"Ettore Rosato", share:22, desc:"Dialogo coi moderati e radicamento parlamentare." },
          { name:"Liberali Europei", leader:"Elena Bonetti", share:14, desc:"Family Act, scuola e pari opportunità." }
        ],
        splitName:"Riformisti Repubblicani", splitShort:"RR", bio:"Partito liberal-riformista, industriale e pragmatico.",
        vetoes:['m5s','avs','fn','dsp','lega','pap','prc','cpi','fnv'], stances:{tax:2,work:2,pensions:2,welfare:2,rights:2,imm:2,justice:2,inst:2,eu:1,foreign:2,energy:2,infra:2,edu:2,industry:2} },

      { id:'iv', name:"Italia Viva", short:"IV", leader:"Matteo Renzi", leaderAge:51, leaderTrust:84, nextCongYear:2028, area:"Centro", coalId:"csx", color:"#ec4899", poll:2.1, seats:6, inGov:false, credibility:70, cohesion:79, orgStrength:54,
        personalParty:true, founderLeader:"Matteo Renzi",
        wingLeader:"Maria Elena Boschi", wingAge:45, wingName:"Ala Riformista", wingArea:"Centro",
        factions:[
          { name:"Leopolda Riformista", leader:"Matteo Renzi", share:66, desc:"Jobs Act, garantismo, taglio tasse e centralità parlamentare." },
          { name:"Ala Parlamentare", leader:"Maria Elena Boschi", share:22, desc:"Diritti civili, riforme istituzionali e dialogo col centrosinistra." },
          { name:"Liberi & Moderati", leader:"Raffaella Paita", share:12, desc:"Infrastrutture, sblocco cantieri e logistica." }
        ],
        splitName:"Centro Riformatore", splitShort:"CR", bio:"Forza centrista riformista e garantista fondata da Matteo Renzi.",
        vetoes:['fn','dsp','avs','pap','prc','cpi','fnv'], stances:{tax:2,work:2,pensions:2,welfare:2,rights:1,imm:2,justice:2,inst:3,eu:1,foreign:2,energy:2,infra:2,edu:2,industry:2} },

      { id:'piueu', name:"+Europa", short:"+EU", leader:"Riccardo Magi", leaderAge:50, leaderTrust:78, nextCongYear:2027, area:"Centro-Sinistra", coalId:"csx", color:"#3b82f6", poll:1.6, seats:2, inGov:false, credibility:76, cohesion:80, orgStrength:48,
        wingLeader:"Emma Bonino", wingAge:78, wingName:"Radicali Federalisti", wingArea:"Centro",
        factions:[
          { name:"Radicali & Diritti", leader:"Riccardo Magi", share:52, desc:"Referendum su cannabis, eutanasia, cittadinanza e diritti civili." },
          { name:"Stati Uniti d'Europa", leader:"Emma Bonino", share:32, desc:"Federalismo europeo integrale e difesa dello stato di diritto." },
          { name:"Liberali di Mercato", leader:"Benedetto Della Vedova", share:16, desc:"Concorrenza, libero mercato e rigore di bilancio." }
        ],
        splitName:"Radicali Italiani", splitShort:"RAD", bio:"Movimento radicale, liberale ed europeista federalista.",
        vetoes:['fdi','lega','fn','dsp','itx','cpi','fnv'], stances:{tax:2,work:2,pensions:2,welfare:2,rights:0,imm:0,justice:2,inst:2,eu:1,foreign:2,energy:2,infra:2,edu:2,industry:2} },

      { id:'nm', name:"Noi Moderati", short:"NM", leader:"Maurizio Lupi", leaderAge:67, leaderTrust:80, nextCongYear:2028, area:"Centro-Destra", coalId:"cdx", color:"#0ea5e9", poll:1.0, seats:2, inGov:true, credibility:75, cohesion:84, orgStrength:50,
        personalParty:true, founderLeader:"Maurizio Lupi",
        wingLeader:"Mara Carfagna", wingAge:50, wingName:"Centro Popolare", wingArea:"Centro-Destra",
        factions:[
          { name:"Popolari Cattolici", leader:"Maurizio Lupi", share:56, desc:"Sussidiarietà, famiglia, paritarie e moderatismo di governo." },
          { name:"Centro Meridionalista", leader:"Mara Carfagna", share:28, desc:"Tutela del Sud, diritti costituzionali ed europeismo PPE." },
          { name:"Autonomisti & Civici", leader:"Giovanni Toti", share:16, desc:"Sviluppo infrastrutturale e liste civiche regionali." }
        ],
        splitName:"Popolari Moderati", splitShort:"PM", bio:"Quarta gamba centrista e cattolico-popolare del Centrodestra.",
        vetoes:['avs','m5s','dsp','pap','prc'], stances:{tax:2,work:2,pensions:2,welfare:2,rights:3,imm:2,justice:2,inst:2,eu:2,foreign:2,energy:2,infra:2,edu:3,industry:2} },

      { id:'pld', name:"Partito Liberaldemocratico", short:"PLD", leader:"Luigi Marattin", leaderAge:47, leaderTrust:81, nextCongYear:2028, area:"Centro", coalId:"pld_c", color:"#f59e0b", poll:0.6, seats:1, inGov:false, credibility:74, cohesion:85, orgStrength:42,
        personalParty:true, founderLeader:"Luigi Marattin",
        wingLeader:"Andrea Marcucci", wingAge:61, wingName:"Liberali", wingArea:"Centro",
        factions:[
          { name:"Riformisti di Mercato", leader:"Luigi Marattin", share:65, desc:"Taglio spesa improduttiva, concorrenza, merito e fisco pro-crescita." },
          { name:"Liberali Garantisti", leader:"Andrea Marcucci", share:35, desc:"Cultura liberale ed europeismo." }
        ],
        splitName:"Liberisti Italiani", splitShort:"LI", bio:"Forza liberale di mercato e riformista.",
        vetoes:['m5s','avs','dsp','fn','pap','prc','cpi','fnv'], stances:{tax:2,work:3,pensions:2,welfare:2,rights:1,imm:2,justice:2,inst:2,eu:2,foreign:2,energy:2,infra:2,edu:2,industry:2} },

      { id:'scn', name:"Sud chiama Nord", short:"ScN", leader:"Cateno De Luca", leaderAge:54, leaderTrust:86, nextCongYear:2029, area:"Movimento", coalId:"none", color:"#ca8a04", poll:0.5, seats:1, inGov:false, credibility:71, cohesion:86, orgStrength:46,
        personalParty:true, founderLeader:"Cateno De Luca",
        wingLeader:"Laura Castelli", wingAge:40, wingName:"Ala Meridionalista", wingArea:"Centro",
        factions:[
          { name:"Liberazione dei Comuni", leader:"Cateno De Luca", share:70, desc:"Battaglia dei sindaci, difesa del Sud e autonomia siciliana." },
          { name:"Area Economica", leader:"Laura Castelli", share:30, desc:"Politiche fiscali e dialogo parlamentare." }
        ],
        splitName:"Movimento del Sud", splitShort:"MDS", bio:"Movimento civico autonomista e meridionalista.",
        vetoes:['lega'], stances:{tax:2,work:2,pensions:2,welfare:1,rights:2,imm:2,justice:2,inst:1,eu:2,foreign:2,energy:2,infra:1,edu:1,industry:2} },

      { id:'svp', name:"Südtiroler Volkspartei", short:"SVP", leader:"Philipp Achammer", leaderAge:41, leaderTrust:85, nextCongYear:2028, area:"Centro", coalId:"none", color:"#64748b", poll:0.4, seats:2, inGov:false, credibility:82, cohesion:90, orgStrength:62,
        wingLeader:"Arno Kompatscher", wingAge:55, wingName:"Autonomie", wingArea:"Centro",
        factions:[
          { name:"Stella Alpina Autonomista", leader:"Philipp Achammer", share:60, desc:"Tutela integrale dello Statuto d'Autonomia del Sudtirolo." },
          { name:"Ala Sociale & Dialogo", leader:"Arno Kompatscher", share:40, desc:"Cooperazione europea e welfare provinciale." }
        ],
        splitName:"Autonomia Alpina", splitShort:"AA", bio:"Rappresentanza storica delle autonomie speciali di Bolzano e Trento.",
        vetoes:['fn','dsp','cpi','fnv','itx'], stances:{tax:2,work:2,pensions:2,welfare:2,rights:2,imm:2,justice:2,inst:2,eu:1,foreign:2,energy:1,infra:2,edu:2,industry:2} },

      { id:'dsp', name:"Democrazia Sovrana Popolare", short:"DSP", leader:"Marco Rizzo", leaderAge:67, leaderTrust:82, nextCongYear:2028, area:"Estrema Sinistra", coalId:"none", color:"#991b1b", poll:0.5, seats:0, inGov:false, credibility:68, cohesion:82, orgStrength:44,
        personalParty:true, founderLeader:"Marco Rizzo",
        wingLeader:"Francesco Toscano", wingAge:47, wingName:"Sovranisti Popolari", wingArea:"Sinistra",
        factions:[
          { name:"Comunisti Sovranisti", leader:"Marco Rizzo", share:60, desc:"Socialismo statalista, uscita da UE e NATO, difesa dei lavoratori." },
          { name:"Ancora Italia", leader:"Francesco Toscano", share:40, desc:"Sovranità costituzionale, multipolarismo e critica alle élite." }
        ],
        splitName:"Fronte Popolare", splitShort:"FP", bio:"Movimento rosso-bruno sovranista popolare anti-UE e anti-NATO.",
        vetoes:['pd','fi','azione','iv','piueu','pld'], stances:{tax:0,work:0,pensions:0,welfare:0,rights:3,imm:3,justice:1,inst:0,eu:4,foreign:0,energy:4,infra:1,edu:0,industry:0} },

      { id:'pap', name:"Potere al Popolo!", short:"PaP", leader:"Marta Collot", leaderAge:33, leaderTrust:84, nextCongYear:2028, area:"Estrema Sinistra", coalId:"none", color:"#dc2626", poll:0.5, seats:0, inGov:false, credibility:70, cohesion:85, orgStrength:45,
        wingLeader:"Giuliano Granato", wingAge:39, wingName:"Collettivi Meridionali", wingArea:"Estrema Sinistra",
        factions:[
          { name:"Coordinamento Anticapitalista", leader:"Marta Collot", share:60, desc:"Salario minimo 12€, esproprio grandi rendite, stop armi e NATO." },
          { name:"Case del Popolo & Sud", leader:"Giuliano Granato", share:40, desc:"Mutualismo, lotte operaie e conflitto sociale." }
        ],
        splitName:"Fronte Anticapitalista", splitShort:"FAC", bio:"Movimento della sinistra radicale, comunista e anticapitalista.",
        vetoes:['fdi','lega','fi','fn','azione','iv','pld','nm','cpi','fnv','itx'], stances:{tax:0,work:0,pensions:0,welfare:0,rights:0,imm:0,justice:0,inst:0,eu:0,foreign:0,energy:0,infra:0,edu:0,industry:0} },

      { id:'prc', name:"Rifondazione Comunista", short:"PRC", leader:"Maurizio Acerbo", leaderAge:60, leaderTrust:79, nextCongYear:2028, area:"Estrema Sinistra", coalId:"none", color:"#b91c1c", poll:0.4, seats:0, inGov:false, credibility:71, cohesion:80, orgStrength:46,
        wingLeader:"Paolo Ferrero", wingAge:65, wingName:"Sinistra di Classe", wingArea:"Estrema Sinistra",
        factions:[
          { name:"Segreteria Comunista", leader:"Maurizio Acerbo", share:58, desc:"Rifondazione del movimento comunista, pace, ambiente e lavoro." },
          { name:"Sinistra di Classe", leader:"Paolo Ferrero", share:42, desc:"Opposizione sociale intransigente e unità della sinistra di classe." }
        ],
        splitName:"Comunisti Italiani", splitShort:"CI", bio:"Storico partito della sinistra comunista italiana.",
        vetoes:['fdi','lega','fi','fn','azione','iv','pld','cpi','fnv'], stances:{tax:0,work:0,pensions:0,welfare:0,rights:0,imm:0,justice:0,inst:0,eu:0,foreign:0,energy:0,infra:0,edu:0,industry:0} },

      { id:'ptd', name:"Pace Terra Dignità", short:"PTD", leader:"Michele Santoro", leaderAge:75, leaderTrust:82, nextCongYear:2029, area:"Sinistra", coalId:"none", color:"#f43f5e", poll:0.4, seats:0, inGov:false, credibility:72, cohesion:81, orgStrength:40,
        personalParty:true, founderLeader:"Michele Santoro",
        wingLeader:"Raniero La Valle", wingAge:94, wingName:"Costituzionalisti per la Pace", wingArea:"Sinistra",
        factions:[
          { name:"Movimento per la Pace", leader:"Michele Santoro", share:65, desc:"Stop immediato all'invio di armi, diplomazia e pluralismo informativo." },
          { name:"Comitati Costituzionali", leader:"Raniero La Valle", share:35, desc:"Attuazione dell'Articolo 11 della Costituzione." }
        ],
        splitName:"Lista per la Pace", splitShort:"LPP", bio:"Movimento pacifista ed ecologista fondato da Michele Santoro.",
        vetoes:['fdi','lega','fn','azione','iv','cpi','fnv'], stances:{tax:1,work:1,pensions:1,welfare:1,rights:1,imm:1,justice:1,inst:1,eu:1,foreign:0,energy:0,infra:0,edu:1,industry:1} },

      { id:'psi', name:"Partito Socialista Italiano", short:"PSI", leader:"Enzo Maraio", leaderAge:47, leaderTrust:80, nextCongYear:2028, area:"Centro-Sinistra", coalId:"csx", color:"#e11d48", poll:0.2, seats:0, inGov:false, credibility:73, cohesion:83, orgStrength:41,
        wingLeader:"bobo Craxi", wingAge:62, wingName:"Riformisti Socialisti", wingArea:"Centro-Sinistra",
        factions:[
          { name:"Avanti! Socialisti", leader:"Enzo Maraio", share:62, desc:"Socialismo riformista europeo nel solco del centrosinistra." },
          { name:"Area Autonomista", leader:"Bobo Craxi", share:38, desc:"Tradizione socialista autonomista e garantista." }
        ],
        splitName:"Socialisti Riformisti", splitShort:"SR", bio:"Erede della tradizione storica del socialismo riformista italiano.",
        vetoes:['fdi','lega','fn','cpi','fnv','dsp'], stances:{tax:1,work:1,pensions:1,welfare:1,rights:1,imm:1,justice:2,inst:2,eu:1,foreign:2,energy:1,infra:2,edu:1,industry:1} },

      { id:'ndc', name:"Noi di Centro - UDC", short:"UDC", leader:"Clemente Mastella", leaderAge:79, leaderTrust:84, nextCongYear:2028, area:"Centro-Destra", coalId:"none", color:"#1d4ed8", poll:0.2, seats:0, inGov:false, credibility:70, cohesion:82, orgStrength:44,
        personalParty:true, founderLeader:"Clemente Mastella",
        wingLeader:"Lorenzo Cesa", wingAge:74, wingName:"Scudo Crociato", wingArea:"Centro-Destra",
        factions:[
          { name:"Popolari di Centro", leader:"Clemente Mastella", share:55, desc:"Centralità parlamentare, moderatismo democristiano e radicamento al Sud." },
          { name:"Unione di Centro (Scudo Crociato)", leader:"Lorenzo Cesa", share:45, desc:"Valori cristiano-democratici e alleanza col centrodestra." }
        ],
        splitName:"Democristiani Uniti", splitShort:"DCU", bio:"Polo democristiano e centrista erede della tradizione dello Scudo Crociato.",
        vetoes:['avs','pap','prc','dsp','cpi','fnv'], stances:{tax:2,work:2,pensions:2,welfare:2,rights:3,imm:2,justice:2,inst:2,eu:2,foreign:2,energy:2,infra:2,edu:3,industry:2} },

      { id:'itx', name:"Italexit per l'Italia", short:"ITX", leader:"Gianluigi Paragone", leaderAge:55, leaderTrust:82, nextCongYear:2029, area:"Estrema Destra", coalId:"none", color:"#0d9488", poll:0.2, seats:0, inGov:false, credibility:66, cohesion:80, orgStrength:39,
        personalParty:true, founderLeader:"Gianluigi Paragone",
        wingLeader:"Nunzia Schilirò", wingAge:47, wingName:"Comitati Sovranità", wingArea:"Estrema Destra",
        factions:[
          { name:"Uscita dall'UE & Lira", leader:"Gianluigi Paragone", share:70, desc:"Referendum immediato per uscire da UE ed Eurozona, difesa PMI." },
          { name:"Libertà Costituzionali", leader:"Nunzia Schilirò", share:30, desc:"Opposizione ai vincoli sovranazionali." }
        ],
        splitName:"Sovranità Italiana", splitShort:"SI", bio:"Movimento sovranista ed euroscettico per l'uscita dell'Italia dall'UE.",
        vetoes:['pd','piueu','azione','iv','fi','avs'], stances:{tax:4,work:3,pensions:3,welfare:3,rights:3,imm:4,justice:3,inst:3,eu:4,foreign:4,energy:4,infra:3,edu:3,industry:4} },

      { id:'cpi', name:"CasaPound Italia", short:"CPI", leader:"Gianluca Iannone", leaderAge:53, leaderTrust:88, nextCongYear:2029, area:"Estrema Destra", coalId:"none", color:"#3f3f46", poll:0.2, seats:0, inGov:false, credibility:64, cohesion:90, orgStrength:48,
        wingLeader:"Simone Di Stefano", wingAge:49, wingName:"Sovranisti Nazionali", wingArea:"Estrema Destra",
        factions:[
          { name:"Tartaruga Frecciata", leader:"Gianluca Iannone", share:65, desc:"Nazionalismo sociale, mutuo sociale, blocco immigrazione e stato forte." },
          { name:"Ala Politica Nazionale", leader:"Simone Di Stefano", share:35, desc:"Partecipazione elettorale e fronte sovranista." }
        ],
        splitName:"Fronte Nazionale", splitShort:"FRN", bio:"Movimento politico della destra radicale e nazionalista.",
        vetoes:['pd','avs','m5s','piueu','azione','iv','fi','pap','prc','psi','svp'], stances:{tax:4,work:4,pensions:4,welfare:4,rights:4,imm:4,justice:4,inst:4,eu:4,foreign:4,energy:4,infra:4,edu:4,industry:4} },

      { id:'fnv', name:"Forza Nuova", short:"FNV", leader:"Roberto Fiore", leaderAge:67, leaderTrust:87, nextCongYear:2029, area:"Estrema Destra", coalId:"none", color:"#18181b", poll:0.1, seats:0, inGov:false, credibility:60, cohesion:89, orgStrength:42,
        personalParty:true, founderLeader:"Roberto Fiore",
        wingLeader:"Luca Castellini", wingAge:50, wingName:"Militanza", wingArea:"Estrema Destra",
        factions:[
          { name:"Ricostruzione Nazionale", leader:"Roberto Fiore", share:70, desc:"Nazionalismo intransigente, famiglia tradizionale, fuori da UE e NATO." },
          { name:"Nuclei Territoriali", leader:"Luca Castellini", share:30, desc:"Azione di piazza e radicamento militante." }
        ],
        splitName:"Ordine Nazionale", splitShort:"ON", bio:"Movimento di estrema destra ultranazionalista e tradizionalista.",
        vetoes:['pd','avs','m5s','piueu','azione','iv','fi','pap','prc','psi','svp'], stances:{tax:4,work:4,pensions:4,welfare:4,rights:4,imm:4,justice:4,inst:4,eu:4,foreign:4,energy:4,infra:4,edu:4,industry:4} },

      { id:'pdf', name:"Popolo della Famiglia", short:"PdF", leader:"Mario Adinolfi", leaderAge:55, leaderTrust:85, nextCongYear:2029, area:"Destra", coalId:"none", color:"#be185d", poll:0.1, seats:0, inGov:false, credibility:67, cohesion:86, orgStrength:38,
        personalParty:true, founderLeader:"Mario Adinolfi",
        wingLeader:"Nicola Di Matteo", wingAge:56, wingName:"Comitati Pro-Vita", wingArea:"Destra",
        factions:[
          { name:"Reddito di Maternità", leader:"Mario Adinolfi", share:72, desc:"Reddito di maternità universale, difesa della vita e stop aborto ed eutanasia." },
          { name:"Associazioni Cattoliche", leader:"Nicola Di Matteo", share:28, desc:"Impegno cristiano in politica." }
        ],
        splitName:"Alleanza per la Vita", splitShort:"APV", bio:"Movimento cristiano-conservatore focalizzato su natalità e principi non negoziabili.",
        vetoes:['avs','piueu','pd','pap','prc','iv'], stances:{tax:3,work:2,pensions:3,welfare:3,rights:4,imm:3,justice:3,inst:3,eu:3,foreign:3,energy:3,infra:3,edu:4,industry:3} }
    ];

    /* 16 TEMI CALDI E STATO LEGALE ATTUALE IN ITALIA (PUNTO 9 — CONSULTABILI E MODIFICABILI CON DDL O REFERENDUM) */
export const HOT_LAWS = [
      { id:'law_cannabis', title:'1. Cannabis e Droghe Leggere', dossier:'rights', currentIdx:1,
        options:[
          { idx:0, status:'🟢 LEGALE E VENDITA DI STATO', label:'Legalizzazione completa, vendita controllata (getito +€ 2.5mld) e autocoltivazione libera', targetStance:0, eff:(g)=>{ g.budget.taxPressure=+(g.budget.taxPressure-0.2).toFixed(1); shiftBloc(g.playerPartyId,'giovani',9); shiftBloc(g.playerPartyId,'progressisti',8); shiftBloc(g.playerPartyId,'identitari',-7); } },
          { idx:1, status:'🟡 ILLEGALE (Uso personale depenalizzato — DPR 309/90)', label:'vendita vietata, sanzioni amministrative per uso personale e stretta su Cannabis Light', targetStance:3, eff:(g)=>{ shiftBloc(g.playerPartyId,'cattolici',5); } },
          { idx:2, status:'🔴 TOLLERANZA ZERO E CARCERE', label:'Pugno di ferro: arresto anche per piccole dosi, ritiro patente a vita e chiusura negozi canapa', targetStance:4, eff:(g)=>{ shiftBloc(g.playerPartyId,'identitari',8); shiftBloc(g.playerPartyId,'nazionalisti',8); shiftBloc(g.playerPartyId,'giovani',-9); } }
        ]
      },
      { id:'law_marriage', title:'2. Matrimonio Egualitario e Adozioni', dossier:'rights', currentIdx:1,
        options:[
          { idx:0, status:'🟢 MATRIMONIO EGUALITARIO E ADOZIONI LEGALI', label:'Piena equiparazione del matrimonio per tutte le coppie e diritto all’adozione piena', targetStance:1, eff:(g)=>{ shiftBloc(g.playerPartyId,'giovani',8); shiftBloc(g.playerPartyId,'progressisti',10); shiftBloc(g.playerPartyId,'cattolici',-8); } },
          { idx:1, status:'🟡 SOLO UNIONI CIVILI (Legge Cirinnà 76/2016 — No Adozioni)', label:'Unioni Civili riconosciute tra persone dello stesso sesso, ma senza adozioni né matrimonio', targetStance:2, eff:(g)=>{ shiftBloc(g.playerPartyId,'impiegati',4); } },
          { idx:2, status:'🔴 ABOLIZIONE UNIONI CIVILI (Solo Famiglia Tradizionale)', label:'Abrogazione della Legge Cirinnà e riconoscimento esclusivo della famiglia naturale fondata sul matrimonio', targetStance:4, eff:(g)=>{ shiftBloc(g.playerPartyId,'cattolici',7); shiftBloc(g.playerPartyId,'nazionalisti',9); shiftBloc(g.playerPartyId,'progressisti',-10); } }
        ]
      },
      { id:'law_eutanasia', title:'3. Eutanasia Legale e Fine Vita', dossier:'rights', currentIdx:1,
        options:[
          { idx:0, status:'🟢 EUTANASIA LEGALE NEL SSN', label:'Legge sul Fine Vita: eutanasia legale e suicidio medicalmente assistito garantito dal SSN', targetStance:1, eff:(g)=>{ shiftBloc(g.playerPartyId,'giovani',7); shiftBloc(g.playerPartyId,'progressisti',9); shiftBloc(g.playerPartyId,'cattolici',-8); } },
          { idx:1, status:'🟡 SOLO SENTENZA CORTE COST. (Nessuna legge organica)', label:'vuoto legislativo colmato solo dai criteri ristretti della Consulta (Caso Cappato/Dj Fabo)', targetStance:2, eff:(g)=>{} },
          { idx:2, status:'🔴 DIVIETO PENALE ASSOLUTO DI FINE VITA', label:'Divieto totale di ogni forma di suicidio assistito e obbligo di mantenimento vitale', targetStance:4, eff:(g)=>{ shiftBloc(g.playerPartyId,'cattolici',8); shiftBloc(g.playerPartyId,'identitari',6); } }
        ]
      },
      { id:'law_weapons', title:'4. Diritto alle Armi e Legittima Difesa', dossier:'justice', currentIdx:1,
        options:[
          { idx:0, status:'🔴 RESTRIZIONE SEVERA ARMI PRIVATE', label:'Divieto porto d’armi per difesa/caccia privata e inasprimento controlli psicofisici', targetStance:0, eff:(g)=>{ shiftBloc(g.playerPartyId,'progressisti',8); shiftBloc(g.playerPartyId,'identitari',-8); } },
          { idx:1, status:'🟡 PORTO D’ARMI REGOLAMENTATO E LEGITTIMA DIFESA (L. 36/2019)', label:'licenza di Prefettura/Questura rigorosa e presunzione di legittima difesa domiciliare', targetStance:2, eff:(g)=>{} },
          { idx:2, status:'🟢 LIBERO PORTO D’ARMI E DIFESA INVIOLABILE ("Stand Your Ground")', label:'Liberalizzazione dell’acquisto di armi per i cittadini incensurati e non punibilità totale in casa/negozio', targetStance:4, eff:(g)=>{ shiftBloc(g.playerPartyId,'piva',8); shiftBloc(g.playerPartyId,'identitari',9); shiftBloc(g.playerPartyId,'nazionalisti',9); shiftBloc(g.playerPartyId,'progressisti',-9); } }
        ]
      },
      { id:'law_citizenship', title:'5. Cittadinanza (Ius Sanguinis vs Ius Soli / Scholae)', dossier:'imm', currentIdx:1,
        options:[
          { idx:0, status:'🟢 IUS SOLI / IUS SCHOLAE (5 Anni) IN VIGORE', label:'Cittadinanza italiana per chi nasce in Italia o completa 5 anni di scuola (dimezzato a 5 anni anche per gli adulti)', targetStance:1, eff:(g)=>{ shiftBloc(g.playerPartyId,'giovani',8); shiftBloc(g.playerPartyId,'progressisti',9); shiftBloc(g.playerPartyId,'identitari',-9); } },
          { idx:1, status:'🟡 IUS SANGUINIS E 10 ANNI DI RESIDENZA (Legge 91/1992)', label:'cittadinanza per discendenza di sangue, a 18 anni per i nati in Italia o dopo 10 anni di residenza', targetStance:2, eff:(g)=>{} },
          { idx:2, status:'🔴 STRETTA NAZIONALISTA (15 Anni + Revoca Cittadinanza)', label:'Innalzamento a 15 anni con esame severo di lingua/cultura e revoca immediata per qualsiasi reato', targetStance:4, eff:(g)=>{ shiftBloc(g.playerPartyId,'identitari',9); shiftBloc(g.playerPartyId,'nazionalisti',9); } }
        ]
      },
      { id:'law_minwage', title:'6. Salario Minimo Legale Orario', dossier:'work', currentIdx:1,
        options:[
          { idx:0, status:'🟢 SALARIO MINIMO LEGALE IN VIGORE (10 €/ora)', label:'Soglia minima inderogabile per legge a 10 €/ora indicizzata all’inflazione per tutti i lavoratori', targetStance:1, eff:(g)=>{ shiftBloc(g.playerPartyId,'operai',9); shiftBloc(g.playerPartyId,'fragili_sud',9); shiftBloc(g.playerPartyId,'giovani',8); shiftBloc(g.playerPartyId,'piva',-6); } },
          { idx:1, status:'🔴 ASSENTE (Solo Contrattazione Nazionale CCNL)', label:'nessun salario minimo orario per legge; retribuzioni fissate dai contratti collettivi', targetStance:3, eff:(g)=>{ shiftBloc(g.playerPartyId,'piva',5); } }
        ]
      },
      { id:'law_nuclear', title:'7. Centrali Nucleari in Italia', dossier:'energy', currentIdx:1,
        options:[
          { idx:0, status:'🔴 VIETATO IN ITALIA (Referendum 1987 e 2011)', label:'divieto di produzione elettronucleare sul suolo nazionale; puntare solo su rinnovabili', targetStance:1, eff:(g)=>{ shiftBloc(g.playerPartyId,'progressisti',7); } },
          { idx:1, status:'🟢 LEGALE — PIANO REATTORI NUCLEARI SMR AVVIATO', label:'Ritorno al Nucleare di nuova generazione (SMR/4ª Gen): tagli strutturali al costo energia (+0.3% PIL)', targetStance:3, eff:(g)=>{ g.gdp=Math.min(3.5,+(g.gdp+0.3).toFixed(2)); shiftBloc(g.playerPartyId,'manager',9); shiftBloc(g.playerPartyId,'piva',7); shiftBloc(g.playerPartyId,'progressisti',-7); } }
        ]
      },
      { id:'law_gpa', title:'8. Gestazione per Altri (Maternità Surrogata)', dossier:'rights', currentIdx:2,
        options:[
          { idx:0, status:'🟢 GPA SOLIDALE REGOLAMENTATA', label:'Regolamentazione della Gestazione per Altri in forma rigorosamente solidale e gratuita', targetStance:0, eff:(g)=>{ shiftBloc(g.playerPartyId,'progressisti',8); shiftBloc(g.playerPartyId,'cattolici',-9); } },
          { idx:1, status:'🟡 VIETATA IN ITALIA (Legge 40/2004)', label:'Vietata solo sul territorio italiano senza perseguibilità per chi vi ricorre legalmente all’estero', targetStance:2, eff:(g)=>{} },
          { idx:2, status:'🔴 REATO UNIVERSALE (Legge Varchi 2024 — Punibile anche all’estero)', label:'la maternità surrogata è reato universale perseguibile penalmente anche se praticata all’estero', targetStance:3, eff:(g)=>{ shiftBloc(g.playerPartyId,'cattolici',7); shiftBloc(g.playerPartyId,'identitari',8); } }
        ]
      },
      { id:'law_prostitution', title:'9. Prostituzione e Case Chiuse (Legge Merlin)', dossier:'rights', currentIdx:0,
        options:[
          { idx:0, status:'🟡 CASE CHIUSE VIETATE, NON REATO (Legge Merlin 1958)', label:'esercizio individuale non reato ma non tassato/regolamentato; vietate le case di tolleranza', targetStance:2, eff:(g)=>{} },
          { idx:1, status:'🟢 REGOLAMENTAZIONE E TASSAZIONE (Abrogazione Legge Merlin)', label:'Riapertura regolamentata, controlli sanitari, tutela previdenziale e tassazione (+€ 3 mld all’Erario)', targetStance:3, eff:(g)=>{ g.budget.taxPressure=+(g.budget.taxPressure-0.2).toFixed(1); shiftBloc(g.playerPartyId,'piva',6); shiftBloc(g.playerPartyId,'cattolici',-7); } },
          { idx:2, status:'🔴 MODELLO NORDICO / PROIBIZIONISTA (Multa e Reato per i Clienti)', label:'Criminalizzazione penale del cliente e divieto assoluto su strada e al chiuso', targetStance:1, eff:(g)=>{ shiftBloc(g.playerPartyId,'cattolici',6); } }
        ]
      },
      { id:'law_abortion', title:'10. Interruzione Volontaria di Gravidanza (Legge 194)', dossier:'rights', currentIdx:1,
        options:[
          { idx:0, status:'🟢 LEGGE 194 POTENZIATA (Obbligo Medici Non Obiettori)', label:'Diritto garantito in ogni ospedale con concorsi riservati a medici non obiettori e pillola RU486 in consultorio', targetStance:1, eff:(g)=>{ shiftBloc(g.playerPartyId,'giovani',8); shiftBloc(g.playerPartyId,'progressisti',9); shiftBloc(g.playerPartyId,'cattolici',-8); } },
          { idx:1, status:'🟢 LEGALE ENTRO 90 GIORNI CON OBIEZIONE DI COSCIENZA (L. 194/1978)', label:'aborto legale entro i primi 90 giorni con diritto all’obiezione di coscienza per i medici', targetStance:2, eff:(g)=>{} },
          { idx:2, status:'🔴 FORTE RESTRIZIONE L. 194 E QUOZIENTE NATALITÀ', label:'Restrizione severa dell’accesso all’IVG, ascolto obbligatorio del battito e fondi alle associazioni pro-vita', targetStance:4, eff:(g)=>{ shiftBloc(g.playerPartyId,'cattolici',7); shiftBloc(g.playerPartyId,'nazionalisti',8); shiftBloc(g.playerPartyId,'giovani',-9); } }
        ]
      },
      { id:'law_41bis', title:'11. Ergastolo Ostativo e Carcere Duro (Art. 41-bis)', dossier:'justice', currentIdx:1,
        options:[
          { idx:0, status:'🟡 SUPERAMENTO ERGASTOLO OSTATIVO (Riforma Garantista)', label:'Possibilità di permessi premio su valutazione del giudice anche senza collaborazione (linea CEDU)', targetStance:0, eff:(g)=>{ shiftBloc(g.playerPartyId,'progressisti',6); shiftBloc(g.playerPartyId,'identitari',-8); } },
          { idx:1, status:'🟢 41-BIS ED ERGASTOLO OSTATIVO BLINDATI', label:'carcere duro 41-bis intangibile per mafia e terrorismo e stretta sui benefici penitenziari', targetStance:3, eff:(g)=>{ shiftBloc(g.playerPartyId,'identitari',7); shiftBloc(g.playerPartyId,'pensionati',5); } }
        ]
      },
      { id:'law_autonomy', title:'12. Autonomia Differenziata delle Regioni', dossier:'inst', currentIdx:1,
        options:[
          { idx:0, status:'🔴 ABROGATA (Stato Unitario e Fondo Perequativo Sud)', label:'Abrogazione della Legge Calderoli: scuola, sanità, energia e trasporti restano uniformi a livello nazionale', targetStance:1, eff:(g)=>{ shiftBloc(g.playerPartyId,'fragili_sud',10); shiftBloc(g.playerPartyId,'impiegati',7); } },
          { idx:1, status:'🟡 LEGGE CALDEROLI CON VINCOLI CONSULTA SUI LEP', label:'legge approvata ma subordinata al finanziamento integrale dei Livelli Essenziali delle Prestazioni (LEP)', targetStance:3, eff:(g)=>{} },
          { idx:2, status:'🟢 FEDERALISMO FISCALE PIENO (23 Materie e Gettito alle Regioni)', label:'Devoluzione immediata di 23 materie e trattenimento del gettito fiscale nelle Regioni del Nord', targetStance:4, eff:(g)=>{ shiftBloc(g.playerPartyId,'piva',8); shiftBloc(g.playerPartyId,'manager',7); shiftBloc(g.playerPartyId,'fragili_sud',-11); } }
        ]
      },
      { id:'law_magistrates', title:'13. Separazione delle Carriere dei Magistrati (PM e Giudici)', dossier:'justice', currentIdx:0,
        options:[
          { idx:0, status:'🟡 CARRIERA UNICA E CSM UNICO (Assetto Costituzionale Storico)', label:'PM e Giudici appartengono a un unico ordine giudiziario con un solo CSM', targetStance:1, eff:(g)=>{ shiftBloc(g.playerPartyId,'impiegati',6); } },
          { idx:1, status:'🟢 SEPARAZIONE CARRIERE, DOPPIO CSM A SORTEGGIO E ALTA CORTE', label:'Riforma Nordio in vigore: carriere separate tra PM e Giudici, due CSM estratti a sorte e Alta Corte disciplinare', targetStance:3, eff:(g)=>{ shiftBloc(g.playerPartyId,'manager',8); shiftBloc(g.playerPartyId,'piva',7); } }
        ]
      },
      { id:'law_rdc', title:'14. Reddito di Cittadinanza vs Assegno di Inclusione', dossier:'welfare', currentIdx:1,
        options:[
          { idx:0, status:'🟢 REDDITO DI CITTADINANZA UNIVERSALE RIPRISTINATO', label:'Ripristino del sussidio universale contro la povertà anche per gli occupabili (+0.5% deficit)', targetStance:1, eff:(g)=>{ g.budget.deficit=+(g.budget.deficit+0.5).toFixed(1); shiftBloc(g.playerPartyId,'fragili_sud',12); shiftBloc(g.playerPartyId,'giovani',6); shiftBloc(g.playerPartyId,'piva',-7); } },
          { idx:1, status:'🟡 ASSEGNO DI INCLUSIONE (Solo Fragili/Non Occupabili)', label:'abolito il RdC per gli occupabili; attivo l’Assegno di Inclusione per famiglie con minori, disabili o over-60', targetStance:3, eff:(g)=>{ shiftBloc(g.playerPartyId,'piva',6); } }
        ]
      },
      { id:'law_wealth_tax', title:'15. Patrimoniale sulle Grandi Ricchezze vs Flat Tax', dossier:'tax', currentIdx:1,
        options:[
          { idx:0, status:'🟢 TASSA PATRIMONIALE 2% OLTRE 1 MILIONE DI EURO', label:'Imposta progressiva sui grandi patrimoni mobiliari e immobiliari per finanziare sanità e salari (-0.5% deficit)', targetStance:0, eff:(g)=>{ g.budget.deficit=+(g.budget.deficit-0.5).toFixed(1); shiftBloc(g.playerPartyId,'operai',8); shiftBloc(g.playerPartyId,'antagonisti',10); shiftBloc(g.playerPartyId,'manager',-10); shiftBloc(g.playerPartyId,'piva',-7); } },
          { idx:1, status:'🟡 IRPEF A 3 ALIQUOTE + FLAT TAX PARTITE IVA FINO A 85.000€', label:'IRPEF su 3 scaglioni per dipendenti/pensionati e regime forfettario al 15% per autonomi', targetStance:2, eff:(g)=>{} },
          { idx:2, status:'🟢 FLAT TAX UNIVERSALE AL 15% PER TUTTI', label:'Tassa piatta al 15% per famiglie, dipendenti e imprese (+0.7% deficit, +0.2% PIL)', targetStance:3, eff:(g)=>{ g.budget.deficit=+(g.budget.deficit+0.7).toFixed(1); g.gdp=Math.min(3.5,+(g.gdp+0.2).toFixed(2)); shiftBloc(g.playerPartyId,'piva',10); shiftBloc(g.playerPartyId,'manager',8); } }
        ]
      },
      { id:'law_greendeal', title:'16. Bando Auto Benzina/Diesel 2035 e Case Green', dossier:'energy', currentIdx:0,
        options:[
          { idx:0, status:'🟢 DIRETTIVA UE GREEN DEAL ATTIVA (Stop Motori Termici 2035)', label:'recepimento degli obiettivi europei di decarbonizzazione auto ed edilizia', targetStance:1, eff:(g)=>{ shiftBloc(g.playerPartyId,'progressisti',8); shiftBloc(g.playerPartyId,'giovani',6); } },
          { idx:1, status:'🔴 DEROGA NAZIONALE (Neutralità Tecnologica, Biocarburanti e No Bando)', label:'Sospensione unilaterale dei divieti su auto diesel/benzina e caldaie per tutelare la filiera automotive', targetStance:3, eff:(g)=>{ shiftBloc(g.playerPartyId,'operai',6); shiftBloc(g.playerPartyId,'piva',7); shiftBloc(g.playerPartyId,'identitari',7); } }
        ]
      }
    ];

    /* 6 GRANDI POTENZE E LEADER ESTERI CON INTERDIPENDENZA DINAMICA (PUNTI 6 & 7) */
export const FOREIGN_POWERS = [
      { id:'usa', flag:'🇺🇸', country:'Stati Uniti d’America', leader:'Donald Trump (Casa Bianca)', bloc:'Atlantista / NATO',
        desc:'Superpotenza guida della NATO. Chiede all’Italia di portare la spesa militare oltre il 2% del PIL e di limitare gli accordi tecnologici con Pechino e energetici con Mosca.',
        rivals:{ russia:-0.65, china:-0.75 }, allies:{ nato:0.7, ukraine:0.4 }
      },
      { id:'eu_com', flag:'🇪🇺', country:'Commissione UE & Eurogruppo', leader:'Ursula von der Leyen & Emmanuel Macron', bloc:'Unione Europea',
        desc:'Garante dei Trattati UE, del PNRR e della BCE. Vigila sul Deficit italiano; ostile al sovranismo anti-euro e a qualsiasi apertura verso Putin.',
        rivals:{ russia:-0.85 }, allies:{ ukraine:0.75, usa:0.45 }
      },
      { id:'ukraine', flag:'🇺🇦', country:'Ucraina', leader:'Volodymyr Zelensky (Kiev)', bloc:'Fronte Orientale Europeo',
        desc:'Chiede sostegno militare, finanziario e politico contro Mosca. Ogni avvicinamento italiano a Putin provoca una crisi immediata con Kiev e con le cancellerie europee.',
        rivals:{ russia:-1.1 }, allies:{ eu_com:0.65, usa:0.5 }
      },
      { id:'russia', flag:'🇷🇺', country:'Federazione Russa', leader:'Vladimir Putin (Cremlino)', bloc:'Eurasia / BRICS+',
        desc:'Offre forniture di gas e petrolio a basso costo e mercati per l’export se l’Italia rompe il fronte delle sanzioni UE/NATO, ma avvicinarsi a Mosca fa crollare le relazioni con Zelensky, Bruxelles e Washington!',
        rivals:{ ukraine:-1.1, eu_com:-0.8, usa:-0.7 }, allies:{ china:0.5 }
      },
      { id:'china', flag:'🇨🇳', country:'Repubblica Popolare Cinese', leader:'Xi Jinping (Pechino)', bloc:'Potenza Asiatica / BRICS+',
        desc:'Propone investimenti industriali, portuali e commerciali (Nuova Via della Seta), ma gli Stati Uniti osteggiano duramente la penetrazione strategica cinese in Italia.',
        rivals:{ usa:-0.8 }, allies:{ russia:0.45 }
      },
      { id:'med', flag:'🌍', country:'Lega Mediterranea & Nord Africa', leader:'Vertice Energia & Flussi (Piano Mattei)', bloc:'Mediterraneo Allargato',
        desc:'Partner cruciale per gli approvvigionamenti energetici da Sud (Algeria, Libia, Egitto, Golfo) e per il controllo delle partenze migratorie.',
        rivals:{}, allies:{}
      }
    ];

    /* ORDINAMENTI COSTITUZIONALI DELLO STATO ITALIANO (PUNTI 5 & 17) */
export const STATE_FORMS = [
      { id:'parlamentare', name:'Repubblica Parlamentare (Costituzione 1948)', icon:'🏛️', targetStance:1,
        desc:'Assetto classico: i cittadini eleggono il Parlamento; il Parlamento elegge il Capo dello Stato (ogni 7 anni) e vota la fiducia al Governo.' },
      { id:'presidenziale', name:'Repubblica Presidenziale (Elezione Diretta del Capo dello Stato)', icon:'🦅', targetStance:4,
        desc:'Riforma radicale: i cittadini italiani eleggono DIRETTAMENTE alle urne il Presidente della Repubblica (con ballottaggio), che diventa anche Capo del Governo senza bisogno di fiducia parlamentare (+18% Stabilità)!' },
      { id:'premierato', name:'Premierato Elettivo Diretto', icon:'👑', targetStance:3,
        desc:'Elezione diretta del Primo Ministro sulla scheda elettorale con premio di maggioranza blindato del 55% dei seggi (220 deputati) e divieto di ribaltoni o governi tecnici (+14% Stabilità).' },
      { id:'cancellierato', name:'Cancellierato Proporzionale con Sfiducia Costruttiva', icon:'⚖️', targetStance:2,
        desc:'Modello tedesco: sistema proporzionale con sbarramento al 4% e sfiducia costruttiva (il Parlamento può sfiduciare il Premier solo eleggendone simultaneamente un altro, +15% Stabilità).' },
      { id:'federale', name:'Repubblica Federale delle Regioni', icon:'🦁', targetStance:3,
        desc:'Forte federalismo fiscale e legislativo alle 20 Regioni (+0.3% PIL strutturale, ma tensioni perequative).' },
      { id:'assembleare', name:'Repubblica Popolare Assembleare & Democrazia Diretta', icon:'🚩', targetStance:0,
        desc:'Monocameralismo puro, referendum propositivi vincolanti senza quorum e controllo pubblico dei settori strategici.' }
    ];

export const PRES_CANDIDATES = [
      { id:'mattarella', name:"Sergio Mattarella (Bis)", age:85, area:"Centro-Sinistra", idealIdeo:1.5, trust:86, desc:"Garante supremo della Costituzione e dell'unità nazionale." },
      { id:'draghi', name:"Mario Draghi", age:79, area:"Centro", idealIdeo:2.0, trust:85, desc:"Prestigio internazionale ed europeismo: Spread -20 pt." },
      { id:'cartabia', name:"Marta Cartabia", age:63, area:"Centro", idealIdeo:1.9, trust:83, desc:"Costituzionalista bipartisan apprezzata trasversalmente." },
      { id:'prodi', name:"Romano Prodi", age:87, area:"Centro-Sinistra", idealIdeo:1.3, trust:77, desc:"Ex Presidente Commissione UE e padre dell'Ulivo." },
      { id:'gentiloni', name:"Paolo Gentiloni", age:72, area:"Centro-Sinistra", idealIdeo:1.4, trust:81, desc:"Profilo europeista e progressista sostenuto dal centrosinistra." },
      { id:'bersani', name:"Pier Luigi Bersani", age:75, area:"Sinistra", idealIdeo:0.9, trust:79, desc:"Candidato popolare della sinistra e del mondo del lavoro." },
      { id:'casellati', name:"Elisabetta Casellati", age:79, area:"Centro-Destra", idealIdeo:2.7, trust:76, desc:"Candidata istituzionale del Centrodestra." },
      { id:'larussa', name:"Ignazio La Russa", age:79, area:"Destra", idealIdeo:3.5, trust:73, desc:"Presidente del Senato e candidato identitario della Destra." },
      { id:'tajani_q', name:"Antonio Tajani", age:73, area:"Centro-Destra", idealIdeo:2.4, trust:80, desc:"Profilo moderato ed europeista (PPE) del Centrodestra." }
    ];

export const MINISTRIES = [
      { id:'mef', name:'Economia e Finanze (MEF)', weight:3, desc:'Bilancio, fisco, conti pubblici e rapporti UE.' },
      { id:'interni', name:'Interno (Viminale)', weight:3, desc:'Ordine pubblico, sicurezza, prefetture e flussi migratori.' },
      { id:'esteri', name:'Affari Esteri (Farnesina)', weight:3, desc:'Diplomazia internazionale, UE, NATO e trattati.' },
      { id:'difesa', name:'Difesa (Forze Armate)', weight:2, desc:'Esercito, Marina, Aeronautica, Carabinieri e sicurezza.' },
      { id:'giustizia', name:'Giustizia (Via Arenula)', weight:2, desc:'Codici, carceri, intercettazioni e CSM.' },
      { id:'mimit', name:'Imprese e Made in Italy (MIMIT)', weight:2, desc:'Politiche industriali e crisi aziendali.' },
      { id:'lavoro', name:'Lavoro e Politiche Sociali', weight:2, desc:'Contratti, salario, INPS e pensioni.' },
      { id:'salute', name:'Salute (SSN)', weight:2, desc:'Fondo Sanitario Nazionale e liste d’attesa.' },
      { id:'cultura', name:'Cultura (MiC — Collegio Romano)', weight:2, desc:'Patrimonio artistico, musei, cinema, spettacolo e beni culturali.' },
      { id:'mit', name:'Infrastrutture e Trasporti (MIT)', weight:2, desc:'Grandi opere, alta velocità, Ponte e porti.' },
      { id:'mase', name:'Ambiente e Sicurezza Energetica (MASE)', weight:1, desc:'Mix energetico, rinnovabili, gas e nucleare.' },
      { id:'mim', name:'Istruzione e Merito (MIM)', weight:1, desc:'Scuola primaria e secondaria, docenti e programmi scolastici.' },
      { id:'mur', name:'Università e Ricerca (MUR)', weight:1, desc:'Atenei, ricerca scientifica, CNR e diritto allo studio.' },
      { id:'agricoltura', name:'Agricoltura e Sovranità Alim. (MASAF)', weight:1, desc:'Fondi PAC e filiere agroalimentari.' },
      { id:'turismo', name:'Turismo', weight:1, desc:'Promozione turistica, demanio balneare e ospitalità.' }
    ];

export const POLITICIANS = [
  {"id": "meloni_p", "name": "Giorgia Meloni", "age": 49, "gender": "F", "region": "Lazio", "partyId": "fdi", "role": "Segretario Nazionale", "pref": "governo", "competence": 89, "comp": 89, "clout": 98, "skill": 98, "prestige": 98, "loyalty": 98, "compass": {"economic": 0.9, "social": 1.4, "ideoScore": 3.3}, "ideo": [0.9, 1.4, 3.3], "bio": "Presidente del Consiglio e leader di Fratelli d'Italia.", "history": ["Deputata dal 2006", "Ministro Gioventù (2008-2011)", "Premier dal 2022"]},
  {"id": "larussa", "name": "Ignazio La Russa", "age": 79, "gender": "M", "region": "Lombardia", "partyId": "fdi", "role": "Presidente del Senato / Colonnello", "pref": "difesa", "competence": 82, "comp": 82, "clout": 94, "skill": 94, "prestige": 94, "loyalty": 95, "compass": {"economic": 1.1, "social": 1.7, "ideoScore": 3.5}, "ideo": [1.1, 1.7, 3.5], "bio": "Presidente del Senato della Repubblica e fondatore storico di FdI.", "history": ["Deputato dal 1992", "Ministro Difesa (2008-2011)", "Pres. Senato dal 2022"]},
  {"id": "crosetto", "name": "Guido Crosetto", "age": 63, "gender": "M", "region": "Piemonte", "partyId": "fdi", "role": "Ministro Difesa / Riformatore", "pref": "difesa", "competence": 88, "comp": 88, "clout": 90, "skill": 90, "prestige": 90, "loyalty": 94, "compass": {"economic": 1.3, "social": 0.9, "ideoScore": 3.1}, "ideo": [1.3, 0.9, 3.1], "bio": "Ministro della Difesa, cofondatore ed esperto di geopolitica atlantica.", "history": ["Sottosegretario Difesa (2008-2011)", "Cofondatore FdI", "Ministro Difesa dal 2022"]},
  {"id": "nordio", "name": "Carlo Nordio", "age": 79, "gender": "M", "region": "Veneto", "partyId": "fdi", "role": "Ministro Giustizia / Giurista", "pref": "giustizia", "competence": 86, "comp": 86, "clout": 82, "skill": 82, "prestige": 82, "loyalty": 88, "compass": {"economic": 1.2, "social": 0.8, "ideoScore": 3.0}, "ideo": [1.2, 0.8, 3.0], "bio": "Ministro della Giustizia, già magistrato e procuratore.", "history": ["Procuratore Aggiunto Venezia", "Deputato dal 2022", "Ministro Giustizia dal 2022"]},
  {"id": "urso", "name": "Adolfo Urso", "age": 68, "gender": "M", "region": "Veneto", "partyId": "fdi", "role": "Ministro Imprese e Made in Italy", "pref": "mimit", "competence": 84, "comp": 84, "clout": 85, "skill": 85, "prestige": 85, "loyalty": 93, "compass": {"economic": 1.2, "social": 1.2, "ideoScore": 3.2}, "ideo": [1.2, 1.2, 3.2], "bio": "Ministro delle Imprese e del Made in Italy, già Presidente del Copasir.", "history": ["Deputato dal 1994", "Presidente Copasir (2021-2022)", "Ministro MIMIT dal 2022"]},
  {"id": "lollobrigida", "name": "Francesco Lollobrigida", "age": 54, "gender": "M", "region": "Lazio", "partyId": "fdi", "role": "Ministro Agricoltura / Fedelissimo", "pref": "agricoltura", "competence": 76, "comp": 76, "clout": 86, "skill": 86, "prestige": 86, "loyalty": 99, "compass": {"economic": 0.8, "social": 1.6, "ideoScore": 3.4}, "ideo": [0.8, 1.6, 3.4], "bio": "Ministro dell'Agricoltura e Sovranità Alimentare.", "history": ["Capogruppo Camera FdI (2018-2022)", "Ministro MASAF dal 2022"]},
  {"id": "santanche", "name": "Daniela Santanchè", "age": 65, "gender": "F", "region": "Piemonte", "partyId": "fdi", "role": "Ministro Turismo / Imprenditrice", "pref": "turismo", "competence": 78, "comp": 78, "clout": 83, "skill": 83, "prestige": 83, "loyalty": 91, "compass": {"economic": 1.4, "social": 1.1, "ideoScore": 3.2}, "ideo": [1.4, 1.1, 3.2], "bio": "Ministro del Turismo, imprenditrice e dirigente storica del centrodestra.", "history": ["Sottosegretario Attuazione Programma (2010-2011)", "Senatrice", "Ministro Turismo dal 2022"]},
  {"id": "schlein_p", "name": "Elly Schlein", "age": 41, "gender": "F", "region": "Emilia-Romagna", "partyId": "pd", "role": "Segretario Nazionale", "pref": "lavoro", "competence": 86, "comp": 86, "clout": 95, "skill": 95, "prestige": 95, "loyalty": 97, "compass": {"economic": -1.4, "social": -1.8, "ideoScore": 1.1}, "ideo": [-1.4, -1.8, 1.1], "bio": "Segretaria Nazionale del PD, guida l'opposizione progressista ed ecologista.", "history": ["Europarlamentare (2014-2019)", "Vicepresidente Emilia-Romagna (2020-2022)", "Segretaria PD dal 2023"]},
  {"id": "bonaccini", "name": "Stefano Bonaccini", "age": 59, "gender": "M", "region": "Emilia-Romagna", "partyId": "pd", "role": "Presidente del Partito / Ala Riformista", "pref": "mimit", "competence": 92, "comp": 92, "clout": 91, "skill": 91, "prestige": 91, "loyalty": 89, "compass": {"economic": -0.6, "social": -0.8, "ideoScore": 1.6}, "ideo": [-0.6, -0.8, 1.6], "bio": "Presidente del PD ed europarlamentare, leader dell'ala riformista e degli amministratori.", "history": ["Presidente Emilia-Romagna (2014-2024)", "Presidente PD dal 2023", "Eurodeputato dal 2024"]},
  {"id": "bersani", "name": "Pier Luigi Bersani", "age": 75, "gender": "M", "region": "Emilia-Romagna", "partyId": "pd", "role": "Padre Nobile / Ala Lavoro", "pref": "mef", "competence": 90, "comp": 90, "clout": 88, "skill": 88, "prestige": 88, "loyalty": 92, "compass": {"economic": -1.3, "social": -1.0, "ideoScore": 1.2}, "ideo": [-1.3, -1.0, 1.2], "bio": "Già segretario e ministro, icona della sinistra laburista e dei diritti sociali.", "history": ["Ministro Industria (1996-1999)", "Ministro Sviluppo (2006-2008)", "Segretario PD (2009-2013)"]},
  {"id": "decaro", "name": "Antonio Decaro", "age": 56, "gender": "M", "region": "Puglia", "partyId": "pd", "role": "Responsabile Enti Locali / Riformista", "pref": "infrastrutture", "competence": 88, "comp": 88, "clout": 90, "skill": 90, "prestige": 90, "loyalty": 91, "compass": {"economic": -0.7, "social": -1.0, "ideoScore": 1.4}, "ideo": [-0.7, -1.0, 1.4], "bio": "Europarlamentare, già presidente ANCI e sindaco di Bari amatissimo dai cittadini.", "history": ["Sindaco di Bari (2014-2024)", "Presidente ANCI (2016-2024)", "Eurodeputato record preferenze 2024"]},
  {"id": "dalema", "name": "Massimo D'Alema", "age": 77, "gender": "M", "region": "Puglia", "partyId": "pd", "role": "Stratega Internazionale / Capocorrente", "pref": "esteri", "competence": 93, "comp": 93, "clout": 85, "skill": 85, "prestige": 85, "loyalty": 84, "compass": {"economic": -0.9, "social": -0.6, "ideoScore": 1.5}, "ideo": [-0.9, -0.6, 1.5], "bio": "Ex Presidente del Consiglio e Ministro degli Esteri, tessitore politico e diplomatico.", "history": ["Presidente Consiglio (1998-2000)", "Ministro Esteri (2006-2008)", "Presidente Copasir (2010-2013)"]},
  {"id": "vdeluca", "name": "Vincenzo De Luca", "age": 77, "gender": "M", "region": "Campania", "partyId": "pd", "role": "Governatore Campania / Capocorrente Autonomo", "pref": "sanita", "competence": 85, "comp": 85, "clout": 92, "skill": 92, "prestige": 92, "loyalty": 70, "compass": {"economic": -0.4, "social": 0.4, "ideoScore": 1.9}, "ideo": [-0.4, 0.4, 1.9], "bio": "Lo 'Sceriffo': Governatore campano pragmatico, pronto alla sfida congressuale permanente.", "history": ["Sindaco di Salerno (1993-2001, 2006-2015)", "Presidente Regione Campania dal 2015"]},
  {"id": "serracchiani", "name": "Debora Serracchiani", "age": 56, "gender": "F", "region": "Friuli-Venezia Giulia", "partyId": "pd", "role": "Capogruppo alla Camera / Giustizia", "pref": "giustizia", "competence": 86, "comp": 86, "clout": 84, "skill": 84, "prestige": 84, "loyalty": 94, "compass": {"economic": -0.9, "social": -1.2, "ideoScore": 1.3}, "ideo": [-0.9, -1.2, 1.3], "bio": "Responsabile Giustizia del PD, già presidente di Regione e capogruppo a Montecitorio.", "history": ["Europarlamentare (2009-2013)", "Presidente FVG (2013-2018)", "Capogruppo Camera PD (2021-2023)"]},
  {"id": "conte_p", "name": "Giuseppe Conte", "age": 62, "gender": "M", "region": "Puglia", "partyId": "m5s", "role": "Presidente del Movimento", "pref": "governo", "competence": 88, "comp": 88, "clout": 96, "skill": 96, "prestige": 96, "loyalty": 96, "compass": {"economic": -1.2, "social": -0.9, "ideoScore": 1.0}, "ideo": [-1.2, -0.9, 1.0], "bio": "Presidente del Movimento 5 Stelle, 'l'Avvocato del Popolo', ex Premier.", "history": ["Presidente Consiglio (2018-2021)", "Leader M5S dal 2021", "Deputato dal 2022"]},
  {"id": "dibattista", "name": "Alessandro Di Battista", "age": 48, "gender": "M", "region": "Lazio", "partyId": "m5s", "role": "Capocorrente Movimentista / Radicale", "pref": "esteri", "competence": 76, "comp": 76, "clout": 88, "skill": 88, "prestige": 88, "loyalty": 75, "compass": {"economic": -1.5, "social": -0.4, "ideoScore": 0.7}, "ideo": [-1.5, -0.4, 0.7], "bio": "Leader dell'ala radicale, antimperialista e no-compromessi del Movimento.", "history": ["Deputato (2013-2018)", "Reporter e saggista", "Portavoce dell'ala dura"]},
  {"id": "grillo", "name": "Beppe Grillo", "age": 78, "gender": "M", "region": "Liguria", "partyId": "m5s", "role": "Garante Fondatore", "pref": "cultura", "competence": 80, "comp": 80, "clout": 89, "skill": 89, "prestige": 89, "loyalty": 65, "compass": {"economic": -1.0, "social": -0.8, "ideoScore": 1.2}, "ideo": [-1.0, -0.8, 1.2], "bio": "Il Fondatore e Garante storico del Movimento delle origini.", "history": ["Fondatore M5S (2009)", "Garante storico"]},
  {"id": "appendino", "name": "Chiara Appendino", "age": 42, "gender": "F", "region": "Piemonte", "partyId": "m5s", "role": "Vicepresidente / Ala Economica", "pref": "mef", "competence": 86, "comp": 86, "clout": 84, "skill": 84, "prestige": 84, "loyalty": 94, "compass": {"economic": -0.9, "social": -1.2, "ideoScore": 1.1}, "ideo": [-0.9, -1.2, 1.1], "bio": "Vicepresidente M5S, già sindaca di Torino, economista d'azienda.", "history": ["Sindaca di Torino (2016-2021)", "Vicepresidente M5S", "Deputata dal 2022"]},
  {"id": "raggi", "name": "Virginia Raggi", "age": 48, "gender": "F", "region": "Lazio", "partyId": "m5s", "role": "Capocorrente Civica e Legalità", "pref": "ambiente", "competence": 79, "comp": 79, "clout": 86, "skill": 86, "prestige": 86, "loyalty": 78, "compass": {"economic": -0.8, "social": -0.7, "ideoScore": 1.3}, "ideo": [-0.8, -0.7, 1.3], "bio": "Presidente della Commissione Expo a Roma, già prima donna Sindaca della Capitale.", "history": ["Sindaca di Roma Capitale (2016-2021)", "Consigliera Capitolina"]},
  {"id": "fico", "name": "Roberto Fico", "age": 52, "gender": "M", "region": "Campania", "partyId": "m5s", "role": "Presidente Comitato Garanzia / Ala Sinistra", "pref": "lavoro", "competence": 87, "comp": 87, "clout": 85, "skill": 85, "prestige": 85, "loyalty": 93, "compass": {"economic": -1.4, "social": -1.5, "ideoScore": 0.9}, "ideo": [-1.4, -1.5, 0.9], "bio": "Già Presidente della Camera, figura di riferimento dell'ala ortodossa progressista.", "history": ["Presidente Vigilanza RAI (2013-2018)", "Presidente Camera Deputati (2018-2022)"]},
  {"id": "patuanelli", "name": "Stefano Patuanelli", "age": 59, "gender": "M", "region": "Friuli-Venezia Giulia", "partyId": "m5s", "role": "Capogruppo al Senato / Ex Ministro", "pref": "mimit", "competence": 88, "comp": 88, "clout": 86, "skill": 86, "prestige": 86, "loyalty": 95, "compass": {"economic": -1.0, "social": -0.8, "ideoScore": 1.2}, "ideo": [-1.0, -0.8, 1.2], "bio": "Capogruppo M5S al Senato, già Ministro dello Sviluppo Economico e dell'Agricoltura.", "history": ["Ministro Sviluppo Economico (2019-2021)", "Ministro Agricoltura (2021-2022)", "Capogruppo Senato M5S"]},
  {"id": "tajani_p", "name": "Antonio Tajani", "age": 73, "gender": "M", "region": "Lazio", "partyId": "fi", "role": "Segretario Nazionale", "pref": "esteri", "competence": 92, "comp": 92, "clout": 94, "skill": 94, "prestige": 94, "loyalty": 98, "compass": {"economic": 1.2, "social": 0.4, "ideoScore": 2.5}, "ideo": [1.2, 0.4, 2.5], "bio": "Segretario Nazionale di Forza Italia, Vicepremier e Ministro degli Esteri.", "history": ["Presidente Parlamento Europeo (2017-2019)", "Vicepremier e Min. Esteri dal 2022"]},
  {"id": "bernini", "name": "Anna Maria Bernini", "age": 61, "gender": "F", "region": "Emilia-Romagna", "partyId": "fi", "role": "Vicesegretario / Ministro Ricerca", "pref": "mur", "competence": 85, "comp": 85, "clout": 84, "skill": 84, "prestige": 84, "loyalty": 95, "compass": {"economic": 1.1, "social": 0.3, "ideoScore": 2.4}, "ideo": [1.1, 0.3, 2.4], "bio": "Ministro dell'Università e della Ricerca, giurista e dirigente azzurra.", "history": ["Ministro Politiche UE (2011)", "Capogruppo Senato (2018-2022)", "Ministro dal 2022"]},
  {"id": "pichetto", "name": "Gilberto Pichetto Fratin", "age": 72, "gender": "M", "region": "Piemonte", "partyId": "fi", "role": "Ministro Ambiente ed Energia", "pref": "mase", "competence": 84, "comp": 84, "clout": 80, "skill": 80, "prestige": 80, "loyalty": 93, "compass": {"economic": 1.3, "social": 0.5, "ideoScore": 2.6}, "ideo": [1.3, 0.5, 2.6], "bio": "Ministro dell'Ambiente e Sicurezza Energetica, decano piemontese.", "history": ["Viceministro Sviluppo Economico (2021-2022)", "Ministro MASE dal 2022"]},
  {"id": "ronzulli", "name": "Licia Ronzulli", "age": 51, "gender": "F", "region": "Lombardia", "partyId": "fi", "role": "Capocorrente Territoriale", "pref": "sanita", "competence": 80, "comp": 80, "clout": 83, "skill": 83, "prestige": 83, "loyalty": 91, "compass": {"economic": 1.2, "social": 0.6, "ideoScore": 2.6}, "ideo": [1.2, 0.6, 2.6], "bio": "Vicepresidente del Senato, organizzatrice storica sul territorio lombardo.", "history": ["Eurodeputata (2009-2014)", "Capogruppo Senato (2022-2023)", "Vicepres. Senato dal 2023"]},
  {"id": "barelli", "name": "Paolo Barelli", "age": 72, "gender": "M", "region": "Lazio", "partyId": "fi", "role": "Capogruppo alla Camera", "pref": "sport", "competence": 82, "comp": 82, "clout": 85, "skill": 85, "prestige": 85, "loyalty": 96, "compass": {"economic": 1.0, "social": 0.7, "ideoScore": 2.6}, "ideo": [1.0, 0.7, 2.6], "bio": "Capogruppo di Forza Italia a Montecitorio, dirigente sportivo nazionale.", "history": ["Deputato dal 2006", "Capogruppo Camera FI dal 2023"]},
  {"id": "mberlusconi", "name": "Marina Berlusconi", "age": 60, "gender": "F", "region": "Lombardia", "partyId": "fi", "role": "Presidente Onoraria d'Area", "pref": "mimit", "competence": 89, "comp": 89, "clout": 88, "skill": 88, "prestige": 88, "loyalty": 92, "compass": {"economic": 1.4, "social": -0.3, "ideoScore": 2.3}, "ideo": [1.4, -0.3, 2.3], "bio": "Guida industriale della famiglia, garante dell'eredità liberale del fondatore.", "history": ["Presidente Fininvest e Mondadori", "Riferimento liberale"]},
  {"id": "gasparri", "name": "Maurizio Gasparri", "age": 70, "gender": "M", "region": "Lazio", "partyId": "fi", "role": "Capogruppo al Senato / Decano", "pref": "comunicazioni", "competence": 84, "comp": 84, "clout": 89, "skill": 89, "prestige": 89, "loyalty": 96, "compass": {"economic": 1.0, "social": 1.1, "ideoScore": 2.8}, "ideo": [1.0, 1.1, 2.8], "bio": "Capogruppo di Forza Italia al Senato, autore della storica Legge Gasparri sulle TV.", "history": ["Ministro Comunicazioni (2001-2005)", "Vicepresidente Senato (2013-2018)", "Capogruppo Senato"]},
  {"id": "salvini_p", "name": "Matteo Salvini", "age": 53, "gender": "M", "region": "Lombardia", "partyId": "lega", "role": "Segretario Federale", "pref": "mit", "competence": 84, "comp": 84, "clout": 96, "skill": 96, "prestige": 96, "loyalty": 97, "compass": {"economic": 0.8, "social": 1.8, "ideoScore": 3.5}, "ideo": [0.8, 1.8, 3.5], "bio": "Segretario Federale della Lega, Vicepremier e Ministro MIT.", "history": ["Eurodeputato (2004-2018)", "Ministro Interno (2018-2019)", "Vicepremier MIT dal 2022"]},
  {"id": "giorgetti_p", "name": "Giancarlo Giorgetti", "age": 59, "gender": "M", "region": "Lombardia", "partyId": "lega", "role": "Vicesegretario / Ministro Economia", "pref": "mef", "competence": 93, "comp": 93, "clout": 89, "skill": 89, "prestige": 89, "loyalty": 94, "compass": {"economic": 1.4, "social": 0.6, "ideoScore": 2.5}, "ideo": [1.4, 0.6, 2.5], "bio": "Ministro dell'Economia e delle Finanze, figura chiave del governismo produttivo.", "history": ["Presidente Bilancio Camera", "Ministro MISE (2021-2022)", "Ministro MEF dal 2022"]},
  {"id": "zaia", "name": "Luca Zaia", "age": 58, "gender": "M", "region": "Veneto", "partyId": "lega", "role": "Governatore Veneto / Capocorrente Autonomia", "pref": "agricoltura", "competence": 91, "comp": 91, "clout": 93, "skill": 93, "prestige": 93, "loyalty": 85, "compass": {"economic": 0.9, "social": 0.2, "ideoScore": 2.4}, "ideo": [0.9, 0.2, 2.4], "bio": "'Il Doge': amatissimo Governatore del Veneto, alfiere dell'autonomia regionale.", "history": ["Ministro Agricoltura (2008-2010)", "Presidente Regione Veneto dal 2010"]},
  {"id": "fontana_l", "name": "Lorenzo Fontana", "age": 46, "gender": "M", "region": "Veneto", "partyId": "lega", "role": "Presidente della Camera / Vicesegretario", "pref": "cultura", "competence": 82, "comp": 82, "clout": 87, "skill": 87, "prestige": 87, "loyalty": 95, "compass": {"economic": 0.7, "social": 1.9, "ideoScore": 3.6}, "ideo": [0.7, 1.9, 3.6], "bio": "Presidente della Camera dei Deputati, punto di riferimento cattolico identitario.", "history": ["Ministro Famiglia (2018-2019)", "Ministro Affari UE (2019)", "Pres. Camera dal 2022"]},
  {"id": "valditara", "name": "Giuseppe Valditara", "age": 65, "gender": "M", "region": "Lombardia", "partyId": "lega", "role": "Ministro Istruzione / Ideologo", "pref": "mim", "competence": 83, "comp": 83, "clout": 80, "skill": 80, "prestige": 80, "loyalty": 92, "compass": {"economic": 0.8, "social": 1.6, "ideoScore": 3.4}, "ideo": [0.8, 1.6, 3.4], "bio": "Ministro dell'Istruzione e del Merito, giurista e teorico del sovranismo moderato.", "history": ["Senatore (2001-2013)", "Capo Dipartimento MIUR", "Ministro dal 2022"]},
  {"id": "ceccardi", "name": "Susanna Ceccardi", "age": 39, "gender": "F", "region": "Toscana", "partyId": "lega", "role": "Responsabile Enti Locali / Eurodeputata", "pref": "interni", "competence": 79, "comp": 79, "clout": 83, "skill": 83, "prestige": 83, "loyalty": 94, "compass": {"economic": 0.9, "social": 1.7, "ideoScore": 3.6}, "ideo": [0.9, 1.7, 3.6], "bio": "Europarlamentare toscana, già sindaca sceriffo di Cascina, portavoce della Lega.", "history": ["Sindaca di Cascina (2016-2019)", "Eurodeputata dal 2019", "Candidata Gov. Toscana"]},
  {"id": "fedriga", "name": "Massimiliano Fedriga", "age": 45, "gender": "M", "region": "Friuli-Venezia Giulia", "partyId": "lega", "role": "Governatore FVG / Pres. Conferenza Regioni", "pref": "sanita", "competence": 89, "comp": 89, "clout": 90, "skill": 90, "prestige": 90, "loyalty": 88, "compass": {"economic": 1.1, "social": 0.5, "ideoScore": 2.7}, "ideo": [1.1, 0.5, 2.7], "bio": "Presidente del Friuli-Venezia Giulia e della Conferenza delle Regioni, voce moderata del Nord.", "history": ["Capogruppo Camera Lega (2014-2018)", "Presidente FVG dal 2018", "Pres. Conferenza Regioni"]},
  {"id": "fratoianni", "name": "Nicola Fratoianni", "age": 54, "gender": "M", "region": "Toscana", "partyId": "avs", "role": "Segretario Sinistra Italiana", "pref": "lavoro", "competence": 83, "comp": 83, "clout": 88, "skill": 88, "prestige": 88, "loyalty": 96, "compass": {"economic": -1.7, "social": -1.8, "ideoScore": 0.5}, "ideo": [-1.7, -1.8, 0.5], "bio": "Segretario Nazionale di Sinistra Italiana e co-leader AVS.", "history": ["Deputato dal 2013", "Segretario SI dal 2017", "Co-leader AVS"]},
  {"id": "bonelli", "name": "Angelo Bonelli", "age": 64, "gender": "M", "region": "Lazio", "partyId": "avs", "role": "Co-portavoce Europa Verde", "pref": "ambiente", "competence": 84, "comp": 84, "clout": 87, "skill": 87, "prestige": 87, "loyalty": 95, "compass": {"economic": -1.3, "social": -1.7, "ideoScore": 0.7}, "ideo": [-1.3, -1.7, 0.7], "bio": "Co-portavoce di Europa Verde, battagliero ecologista storico in Aula.", "history": ["Consigliere Regionale Lazio", "Presidente Verdi", "Deputato AVS"]},
  {"id": "isalis", "name": "Ilaria Salis", "age": 42, "gender": "F", "region": "Lombardia", "partyId": "avs", "role": "Eurodeputata / Movimenti Sociali", "pref": "giustizia", "competence": 74, "comp": 74, "clout": 86, "skill": 86, "prestige": 86, "loyalty": 92, "compass": {"economic": -1.8, "social": -1.9, "ideoScore": 0.2}, "ideo": [-1.8, -1.9, 0.2], "bio": "Europarlamentare per AVS, militante per il diritto all'abitare.", "history": ["Insegnante e attivista", "Eurodeputata dal 2024"]},
  {"id": "cucchi", "name": "Ilaria Cucchi", "age": 52, "gender": "F", "region": "Lazio", "partyId": "avs", "role": "Senatrice / Diritti Umani e Giustizia", "pref": "giustizia", "competence": 85, "comp": 85, "clout": 89, "skill": 89, "prestige": 89, "loyalty": 94, "compass": {"economic": -1.2, "social": -1.7, "ideoScore": 0.8}, "ideo": [-1.2, -1.7, 0.8], "bio": "Senatrice, paladina dei diritti umani, delle garanzie carcerarie e della legalità.", "history": ["Attivista per i diritti umani", "Senatrice della Repubblica dal 2022"]},
  {"id": "zanella", "name": "Luana Zanella", "age": 76, "gender": "F", "region": "Veneto", "partyId": "avs", "role": "Capogruppo alla Camera", "pref": "affari_sociali", "competence": 85, "comp": 85, "clout": 81, "skill": 81, "prestige": 81, "loyalty": 95, "compass": {"economic": -1.4, "social": -1.6, "ideoScore": 0.6}, "ideo": [-1.4, -1.6, 0.6], "bio": "Capogruppo di AVS alla Camera dei Deputati, storica femminista ed ecologista.", "history": ["Sottosegretaria all'Ambiente (2006-2008)", "Capogruppo Camera AVS dal 2022"]},
  {"id": "borrelli_f", "name": "Francesco Emilio Borrelli", "age": 52, "gender": "M", "region": "Campania", "partyId": "avs", "role": "Responsabile Legalità e Ambiente", "pref": "territorio", "competence": 81, "comp": 81, "clout": 88, "skill": 88, "prestige": 88, "loyalty": 89, "compass": {"economic": -1.1, "social": -1.0, "ideoScore": 1.1}, "ideo": [-1.1, -1.0, 1.1], "bio": "Deputato campano, celebre per le sue dirette contro la camorra e il degrado.", "history": ["Consigliere Regionale Campania", "Deputato dal 2022"]},
  {"id": "lucano", "name": "Domenico Lucano (Mimmo)", "age": 68, "gender": "M", "region": "Calabria", "partyId": "avs", "role": "Europarlamentare / Modello Riace", "pref": "solidarieta", "competence": 82, "comp": 82, "clout": 89, "skill": 89, "prestige": 89, "loyalty": 93, "compass": {"economic": -1.8, "social": -1.9, "ideoScore": 0.3}, "ideo": [-1.8, -1.9, 0.3], "bio": "Europarlamentare, storico sindaco di Riace e simbolo mondiale dell'accoglienza.", "history": ["Sindaco di Riace (2004-2018)", "Eurodeputato AVS dal 2024"]},
  {"id": "vannacci_p", "name": "Roberto Vannacci", "age": 57, "gender": "M", "region": "Toscana", "partyId": "fn", "role": "Generale e Fondatore", "pref": "difesa", "competence": 82, "comp": 82, "clout": 95, "skill": 95, "prestige": 95, "loyalty": 96, "compass": {"economic": 0.5, "social": 2.0, "ideoScore": 3.8}, "ideo": [0.5, 2.0, 3.8], "bio": "Generale dell'Esercito ed europarlamentare, autore del bestseller 'Il Mondo al Contrario'.", "history": ["Comandante Task Force 45", "Comandante Folgore", "Eurodeputato record preferenze 2024"]},
  {"id": "filzi", "name": "Fabio Filzi", "age": 46, "gender": "M", "region": "Lazio", "partyId": "fn", "role": "Ideologo e Vicesegretario", "pref": "cultura", "competence": 79, "comp": 79, "clout": 81, "skill": 81, "prestige": 81, "loyalty": 94, "compass": {"economic": 0.6, "social": 1.9, "ideoScore": 3.7}, "ideo": [0.6, 1.9, 3.7], "bio": "Saggista, teorico del sovranismo identitario e della civiltà classica europea.", "history": ["Saggista geopolitico", "Coordinatore Comitati Il Mondo al Contrario"]},
  {"id": "alemanno_g", "name": "Gianni Alemanno", "age": 68, "gender": "M", "region": "Lazio", "partyId": "fn", "role": "Capocorrente Sociale / Ex Ministro", "pref": "agricoltura", "competence": 85, "comp": 85, "clout": 88, "skill": 88, "prestige": 88, "loyalty": 88, "compass": {"economic": 0.4, "social": 1.8, "ideoScore": 3.6}, "ideo": [0.4, 1.8, 3.6], "bio": "Portavoce del Forum Indipendenza, già Ministro delle Politiche Agricole e Sindaco di Roma.", "history": ["Ministro Politiche Agricole (2001-2006)", "Sindaco di Roma (2008-2013)", "Leader Forum Indipendenza"]},
  {"id": "pillon", "name": "Simone Pillon", "age": 55, "gender": "M", "region": "Umbria", "partyId": "fn", "role": "Responsabile Famiglia e Tradizione", "pref": "famiglia", "competence": 80, "comp": 80, "clout": 84, "skill": 84, "prestige": 84, "loyalty": 96, "compass": {"economic": 0.7, "social": 2.0, "ideoScore": 3.9}, "ideo": [0.7, 2.0, 3.9], "bio": "Avvocato e già senatore, organizzatore dei Family Day e difensore della bioetica tradizionale.", "history": ["Senatore (2018-2022)", "Organizzatore Family Day", "Consigliere Pro-Vita"]},
  {"id": "ciarambino", "name": "Marco Ciarambino", "age": 42, "gender": "M", "region": "Campania", "partyId": "fn", "role": "Responsabile Tesseramento Sud", "pref": "sviluppo", "competence": 78, "comp": 78, "clout": 77, "skill": 77, "prestige": 77, "loyalty": 92, "compass": {"economic": 0.5, "social": 1.7, "ideoScore": 3.5}, "ideo": [0.5, 1.7, 3.5], "bio": "Coordinatore delle federazioni meridionali, attivo nella tutela dei lavoratori locali.", "history": ["Coordinatore territoriale", "Delegato confederale"]},
  {"id": "borghese_m", "name": "Mario Borghese", "age": 45, "gender": "M", "region": "Estero", "partyId": "fn", "role": "Coordinatore Italiani nel Mondo", "pref": "esteri", "competence": 81, "comp": 81, "clout": 80, "skill": 80, "prestige": 80, "loyalty": 93, "compass": {"economic": 0.8, "social": 1.5, "ideoScore": 3.4}, "ideo": [0.8, 1.5, 3.4], "bio": "Senatore eletto all'estero, difensore delle comunità italiane nel mondo e delle radici storiche.", "history": ["Deputato (2013-2022)", "Senatore della Repubblica dal 2022"]},
  {"id": "tovaglieri", "name": "Isabella Tovaglieri", "age": 39, "gender": "F", "region": "Lombardia", "partyId": "fn", "role": "Eurodeputata / Portavoce Identitaria", "pref": "industria", "competence": 82, "comp": 82, "clout": 85, "skill": 85, "prestige": 85, "loyalty": 93, "compass": {"economic": 0.9, "social": 1.8, "ideoScore": 3.6}, "ideo": [0.9, 1.8, 3.6], "bio": "Europarlamentare, avvocato penalista, attiva nella difesa dell'industria automotive e delle imprese.", "history": ["Consigliere Comunale Busto Arsizio", "Eurodeputata dal 2019"]},
  {"id": "calenda_p", "name": "Carlo Calenda", "age": 53, "gender": "M", "region": "Lazio", "partyId": "azione", "role": "Segretario Nazionale", "pref": "mimit", "competence": 88, "comp": 88, "clout": 93, "skill": 93, "prestige": 93, "loyalty": 98, "compass": {"economic": 1.3, "social": -0.6, "ideoScore": 2.1}, "ideo": [1.3, -0.6, 2.1], "bio": "Segretario Nazionale di Azione, già Ministro dello Sviluppo Economico e Rappresentante UE.", "history": ["Rappresentante Permanente UE (2016)", "Ministro MISE (2016-2018)", "Senatore dal 2022"]},
  {"id": "richetti", "name": "Matteo Richetti", "age": 52, "gender": "M", "region": "Emilia-Romagna", "partyId": "azione", "role": "Presidente del Partito / Capogruppo", "pref": "riforme", "competence": 86, "comp": 86, "clout": 88, "skill": 88, "prestige": 88, "loyalty": 96, "compass": {"economic": 1.1, "social": -0.7, "ideoScore": 2.0}, "ideo": [1.1, -0.7, 2.0], "bio": "Capogruppo di Azione alla Camera, già Presidente del Consiglio Regionale Emilia-Romagna.", "history": ["Presidente Consiglio Emilia-Romagna (2010-2012)", "Senatore (2018-2022)", "Capogruppo Camera"]},
  {"id": "gelmini", "name": "Mariastella Gelmini", "age": 53, "gender": "F", "region": "Lombardia", "partyId": "azione", "role": "Portavoce Riformista / Ex Ministra", "pref": "affari_regionali", "competence": 87, "comp": 87, "clout": 85, "skill": 85, "prestige": 85, "loyalty": 90, "compass": {"economic": 1.2, "social": 0.2, "ideoScore": 2.4}, "ideo": [1.2, 0.2, 2.4], "bio": "Già Ministro dell'Istruzione e Ministro per gli Affari Regionali nel Governo Draghi.", "history": ["Ministro Istruzione (2008-2011)", "Ministro Affari Regionali (2021-2022)", "Senatrice"]},
  {"id": "carfagna", "name": "Mara Carfagna", "age": 50, "gender": "F", "region": "Campania", "partyId": "azione", "role": "Capocorrente Meridionalista / Ex Ministra", "pref": "coesione", "competence": 88, "comp": 88, "clout": 86, "skill": 86, "prestige": 86, "loyalty": 89, "compass": {"economic": 1.1, "social": -0.1, "ideoScore": 2.3}, "ideo": [1.1, -0.1, 2.3], "bio": "Già Ministro per le Pari Opportunità e Ministro per il Sud, punto di riferimento liberale del Mezzogiorno.", "history": ["Ministro Pari Opportunità (2008-2011)", "Ministro per il Sud (2021-2022)", "Deputata"]},
  {"id": "castaldi_f", "name": "Fabrizio Castaldi", "age": 49, "gender": "M", "region": "Lazio", "partyId": "azione", "role": "Responsabile Organizzazione e Imprese", "pref": "infrastrutture", "competence": 80, "comp": 80, "clout": 78, "skill": 78, "prestige": 78, "loyalty": 94, "compass": {"economic": 1.4, "social": -0.4, "ideoScore": 2.2}, "ideo": [1.4, -0.4, 2.2], "bio": "Ingegnere gestionale e coordinatore dei tavoli programmatici sull'industria 5.0.", "history": ["Manager pubblico", "Responsabile Nazionale Organizzazione"]},
  {"id": "costa_e", "name": "Enrico Costa", "age": 57, "gender": "M", "region": "Piemonte", "partyId": "azione", "role": "Responsabile Giustizia e Garanzie", "pref": "giustizia", "competence": 89, "comp": 89, "clout": 84, "skill": 84, "prestige": 84, "loyalty": 95, "compass": {"economic": 1.3, "social": -0.2, "ideoScore": 2.2}, "ideo": [1.3, -0.2, 2.2], "bio": "Deputato piemontese, paladino del garantismo penale e della presunzione d'innocenza.", "history": ["Sottosegretario Giustizia (2014-2016)", "Ministro Affari Regionali (2016-2017)", "Deputato"]},
  {"id": "bonetti", "name": "Elena Bonetti", "age": 52, "gender": "F", "region": "Lombardia", "partyId": "azione", "role": "Vicepresidente del Partito / Ex Ministra Famiglia", "pref": "famiglia", "competence": 87, "comp": 87, "clout": 84, "skill": 84, "prestige": 84, "loyalty": 94, "compass": {"economic": 1.0, "social": -0.8, "ideoScore": 1.9}, "ideo": [1.0, -0.8, 1.9], "bio": "Matematica, già Ministro per le Pari Opportunità e la Famiglia, autrice del Family Act.", "history": ["Ministro Pari Opportunità e Famiglia (2019-2022)", "Deputata dal 2022"]},
  {"id": "renzi_p", "name": "Matteo Renzi", "age": 51, "gender": "M", "region": "Toscana", "partyId": "iv", "role": "Leader Nazionale", "pref": "governo", "competence": 90, "comp": 90, "clout": 94, "skill": 94, "prestige": 94, "loyalty": 98, "compass": {"economic": 1.3, "social": -0.8, "ideoScore": 1.9}, "ideo": [1.3, -0.8, 1.9], "bio": "Leader di Italia Viva, senatore ed ex Presidente del Consiglio dei Ministri.", "history": ["Presidente Provincia Firenze (2004-2009)", "Sindaco di Firenze (2009-2014)", "Premier (2014-2016)"]},
  {"id": "boschi", "name": "Maria Elena Boschi", "age": 45, "gender": "F", "region": "Toscana", "partyId": "iv", "role": "Capogruppo alla Camera", "pref": "riforme", "competence": 88, "comp": 88, "clout": 89, "skill": 89, "prestige": 89, "loyalty": 97, "compass": {"economic": 1.2, "social": -0.9, "ideoScore": 1.9}, "ideo": [1.2, -0.9, 1.9], "bio": "Capogruppo di Italia Viva alla Camera, già Ministro per le Riforme Costituzionali.", "history": ["Ministro Riforme e Rapporti Parlamento (2014-2016)", "Sottosegretario Presidenza Consiglio (2016-2018)"]},
  {"id": "bellanova", "name": "Teresa Bellanova", "age": 68, "gender": "F", "region": "Puglia", "partyId": "iv", "role": "Presidente del Partito / Sindacalista", "pref": "agricoltura", "competence": 87, "comp": 87, "clout": 85, "skill": 85, "prestige": 85, "loyalty": 95, "compass": {"economic": 1.0, "social": -0.9, "ideoScore": 1.8}, "ideo": [1.0, -0.9, 1.8], "bio": "Presidente di Italia Viva, già sindacalista bracciantile e Ministro dell'Agricoltura.", "history": ["Sottosegretario Lavoro (2014-2016)", "Ministro Politiche Agricole (2019-2021)"]},
  {"id": "paita", "name": "Raffaella Paita", "age": 51, "gender": "F", "region": "Liguria", "partyId": "iv", "role": "Coordinatrice Nazionale", "pref": "infrastrutture", "competence": 84, "comp": 84, "clout": 83, "skill": 83, "prestige": 83, "loyalty": 96, "compass": {"economic": 1.3, "social": -0.7, "ideoScore": 2.0}, "ideo": [1.3, -0.7, 2.0], "bio": "Senatrice e coordinatrice nazionale, esperta di cantieri, trasporti e logistica portuale.", "history": ["Assessore Infrastrutture Liguria", "Capogruppo Senato IV (2022-2024)"]},
  {"id": "faraone", "name": "Davide Faraone", "age": 51, "gender": "M", "region": "Sicilia", "partyId": "iv", "role": "Capogruppo e Responsabile Territorio", "pref": "lavoro", "competence": 83, "comp": 83, "clout": 84, "skill": 84, "prestige": 84, "loyalty": 95, "compass": {"economic": 1.1, "social": -0.7, "ideoScore": 2.0}, "ideo": [1.1, -0.7, 2.0], "bio": "Capogruppo alla Camera, dirigente storico e tessitore politico in Sicilia.", "history": ["Sottosegretario MIUR e Salute (2014-2018)", "Capogruppo Senato IV (2019-2022)"]},
  {"id": "marattin_iv", "name": "Luigi Marattin (IV)", "age": 47, "gender": "M", "region": "Emilia-Romagna", "partyId": "iv", "role": "Consigliere Economico", "pref": "mef", "competence": 91, "comp": 91, "clout": 85, "skill": 85, "prestige": 85, "loyalty": 90, "compass": {"economic": 1.5, "social": -0.7, "ideoScore": 2.0}, "ideo": [1.5, -0.7, 2.0], "bio": "Economista dell'Università di Bologna, consulente economico a Palazzo Chigi.", "history": ["Presidente Commissione Finanze Camera (2020-2022)", "Consigliere economico"]},
  {"id": "migliore", "name": "Gennaro Migliore", "age": 58, "gender": "M", "region": "Campania", "partyId": "iv", "role": "Responsabile Esteri e Sicurezza", "pref": "esteri", "competence": 86, "comp": 86, "clout": 82, "skill": 82, "prestige": 82, "loyalty": 94, "compass": {"economic": 1.1, "social": -1.0, "ideoScore": 1.8}, "ideo": [1.1, -1.0, 1.8], "bio": "Presidente emerito dell'Assemblea Parlamentare del Mediterraneo, diplomatico ed ex sottosegretario.", "history": ["Sottosegretario Giustizia (2016-2018)", "Presidente PAM (2021-2023)"]},
  {"id": "magi_p", "name": "Riccardo Magi", "age": 50, "gender": "M", "region": "Lazio", "partyId": "piueu", "role": "Segretario Nazionale", "pref": "riforme", "competence": 85, "comp": 85, "clout": 90, "skill": 90, "prestige": 90, "loyalty": 97, "compass": {"economic": 1.0, "social": -1.9, "ideoScore": 1.2}, "ideo": [1.0, -1.9, 1.2], "bio": "Segretario Nazionale di +Europa, storico militante per i diritti civili e l'antiproibizionismo.", "history": ["Presidente Radicali Italiani", "Deputato dal 2018", "Segretario +Europa"]},
  {"id": "bonino", "name": "Emma Bonino", "age": 78, "gender": "F", "region": "Piemonte", "partyId": "piueu", "role": "Leader Storica e Fondatrice", "pref": "esteri", "competence": 94, "comp": 94, "clout": 92, "skill": 92, "prestige": 92, "loyalty": 99, "compass": {"economic": 1.2, "social": -1.9, "ideoScore": 1.4}, "ideo": [1.2, -1.9, 1.4], "bio": "Icona radicale europea, già Commissaria UE, Ministro degli Esteri e Vicepresidente del Senato.", "history": ["Commissaria Europea (1995-1999)", "Ministro Commercio e Politiche UE (2006-2008)", "Ministro Esteri (2013-2014)"]},
  {"id": "dellavedova", "name": "Benedetto Della Vedova", "age": 64, "gender": "M", "region": "Lombardia", "partyId": "piueu", "role": "Presidente del Partito / Economista", "pref": "mef", "competence": 88, "comp": 88, "clout": 86, "skill": 86, "prestige": 86, "loyalty": 96, "compass": {"economic": 1.4, "social": -1.6, "ideoScore": 1.7}, "ideo": [1.4, -1.6, 1.7], "bio": "Economista liberale, già Sottosegretario agli Affari Esteri e segretario di +Europa.", "history": ["Europarlamentare (1999-2004)", "Sottosegretario Esteri (2014-2018, 2021-2022)"]},
  {"id": "cappato_m", "name": "Marco Cappato", "age": 55, "gender": "M", "region": "Lombardia", "partyId": "piueu", "role": "Tesoriere Associazione Coscioni", "pref": "sanita", "competence": 87, "comp": 87, "clout": 88, "skill": 88, "prestige": 88, "loyalty": 93, "compass": {"economic": 1.1, "social": -1.9, "ideoScore": 1.0}, "ideo": [1.1, -1.9, 1.0], "bio": "Leader dell'Associazione Luca Coscioni, promotore del referendum sul fine vita e cannabis.", "history": ["Europarlamentare (1999-2004, 2006-2009)", "Promotore Eutanasia Legale"]},
  {"id": "manzi_f", "name": "Federico Manzi", "age": 38, "gender": "M", "region": "Lombardia", "partyId": "piueu", "role": "Responsabile Giustizia e Digitale", "pref": "innovazione", "competence": 80, "comp": 80, "clout": 78, "skill": 78, "prestige": 78, "loyalty": 94, "compass": {"economic": 1.3, "social": -1.8, "ideoScore": 1.3}, "ideo": [1.3, -1.8, 1.3], "bio": "Avvocato internazionalista e specialista di diritto dell'innovazione tecnologica europea.", "history": ["Membro direzione +Europa", "Esperto diritto digitale"]},
  {"id": "scatigna", "name": "Carla Scatigna", "age": 44, "gender": "F", "region": "Puglia", "partyId": "piueu", "role": "Responsabile Territorio Mezzogiorno", "pref": "sviluppo", "competence": 79, "comp": 79, "clout": 75, "skill": 75, "prestige": 75, "loyalty": 93, "compass": {"economic": 1.1, "social": -1.7, "ideoScore": 1.5}, "ideo": [1.1, -1.7, 1.5], "bio": "Coordinatrice dei circoli del Sud, attivista per la trasparenza amministrativa e la parità di genere.", "history": ["Attivista civica", "Coordinatrice regionale"]},
  {"id": "soldo", "name": "Antonella Soldo", "age": 47, "gender": "F", "region": "Basilicata", "partyId": "piueu", "role": "Coordinatrice Campagna Meglio Legale", "pref": "diritti", "competence": 82, "comp": 82, "clout": 83, "skill": 83, "prestige": 83, "loyalty": 94, "compass": {"economic": 1.0, "social": -1.9, "ideoScore": 1.1}, "ideo": [1.0, -1.9, 1.1], "bio": "Giornalista e portavoce della campagna 'Meglio Legale' per la legalizzazione della cannabis.", "history": ["Presidente Radicali Italiani (2016-2018)", "Portavoce Meglio Legale"]},
  {"id": "lupi_p", "name": "Maurizio Lupi", "age": 67, "gender": "M", "region": "Lombardia", "partyId": "nm", "role": "Segretario Nazionale", "pref": "infrastrutture", "competence": 85, "comp": 85, "clout": 90, "skill": 90, "prestige": 90, "loyalty": 97, "compass": {"economic": 1.2, "social": 0.8, "ideoScore": 2.6}, "ideo": [1.2, 0.8, 2.6], "bio": "Leader di Noi Moderati, decano parlamentare e ministro delle Infrastrutture.", "history": ["Vicepresidente Camera (2008-2013)", "Ministro MIT (2013-2015)", "Leader NM dal 2022"]},
  {"id": "cesa_nm", "name": "Lorenzo Cesa", "age": 75, "gender": "M", "region": "Lazio", "partyId": "nm", "role": "Presidente del Partito", "pref": "esteri", "competence": 84, "comp": 84, "clout": 83, "skill": 83, "prestige": 83, "loyalty": 95, "compass": {"economic": 1.1, "social": 0.9, "ideoScore": 2.7}, "ideo": [1.1, 0.9, 2.7], "bio": "Segretario storico dell'UDC, pilastro centrista della coalizione di governo.", "history": ["Europarlamentare (2014-2019)", "Deputato dal 2006", "Presidente Delegazione NATO"]},
  {"id": "romano_s", "name": "Saverio Romano", "age": 62, "gender": "M", "region": "Sicilia", "partyId": "nm", "role": "Coordinatore Politico", "pref": "agricoltura", "competence": 81, "comp": 81, "clout": 80, "skill": 80, "prestige": 80, "loyalty": 94, "compass": {"economic": 1.1, "social": 0.7, "ideoScore": 2.5}, "ideo": [1.1, 0.7, 2.5], "bio": "Deputato siciliano, già Ministro dell'Agricoltura, esperto di enti locali.", "history": ["Ministro Politiche Agricole (2011)", "Deputato dal 2001"]},
  {"id": "bicchielli", "name": "Pino Bicchielli", "age": 58, "gender": "M", "region": "Campania", "partyId": "nm", "role": "Capogruppo alla Camera", "pref": "difesa", "competence": 80, "comp": 80, "clout": 78, "skill": 78, "prestige": 78, "loyalty": 93, "compass": {"economic": 1.0, "social": 0.8, "ideoScore": 2.6}, "ideo": [1.0, 0.8, 2.6], "bio": "Capogruppo di Noi Moderati alla Camera, membro della Commissione Difesa.", "history": ["Deputato dal 2022", "Vicecapogruppo"]},
  {"id": "toti_g", "name": "Giovanni Toti", "age": 58, "gender": "M", "region": "Liguria", "partyId": "nm", "role": "Capocorrente Territoriale Riformista", "pref": "comunicazioni", "competence": 83, "comp": 83, "clout": 82, "skill": 82, "prestige": 82, "loyalty": 85, "compass": {"economic": 1.3, "social": 0.3, "ideoScore": 2.4}, "ideo": [1.3, 0.3, 2.4], "bio": "Ex Governatore della Liguria, giornalista e leader riformatore centrista.", "history": ["Presidente Regione Liguria (2015-2024)", "Europarlamentare (2014-2015)"]},
  {"id": "colucci", "name": "Alessandro Colucci", "age": 52, "gender": "M", "region": "Lombardia", "partyId": "nm", "role": "Responsabile Organizzazione", "pref": "lavoro", "competence": 79, "comp": 79, "clout": 76, "skill": 76, "prestige": 76, "loyalty": 92, "compass": {"economic": 1.1, "social": 0.7, "ideoScore": 2.5}, "ideo": [1.1, 0.7, 2.5], "bio": "Deputato e responsabile organizzativo dei collegi lombardi e del Nord.", "history": ["Consigliere Regionale Lombardia", "Deputato dal 2018"]},
  {"id": "biancofiore", "name": "Michaela Biancofiore", "age": 56, "gender": "F", "region": "Trentino-Alto Adige", "partyId": "nm", "role": "Capogruppo al Senato / Popolare", "pref": "riforme", "competence": 82, "comp": 82, "clout": 84, "skill": 84, "prestige": 84, "loyalty": 94, "compass": {"economic": 1.2, "social": 0.8, "ideoScore": 2.6}, "ideo": [1.2, 0.8, 2.6], "bio": "Presidente del Gruppo Civici d'Italia-Noi Moderati al Senato, storica parlamentare altoatesina.", "history": ["Sottosegretario PA (2013)", "Deputata (2006-2022)", "Senatrice dal 2022"]},
  {"id": "marattin_pld", "name": "Luigi Marattin", "age": 47, "gender": "M", "region": "Emilia-Romagna", "partyId": "pld", "role": "Segretario Nazionale", "pref": "mef", "competence": 91, "comp": 91, "clout": 91, "skill": 91, "prestige": 91, "loyalty": 98, "compass": {"economic": 1.5, "social": -0.6, "ideoScore": 2.0}, "ideo": [1.5, -0.6, 2.0], "bio": "Fondatore e Segretario del Partito Liberal-Democratico, economista.", "history": ["Presidente Commissione Finanze Camera (2020-2022)", "Professore Economia UNIBO"]},
  {"id": "costa_and", "name": "Andrea Costa", "age": 55, "gender": "M", "region": "Liguria", "partyId": "pld", "role": "Presidente del Partito", "pref": "sanita", "competence": 83, "comp": 83, "clout": 81, "skill": 81, "prestige": 81, "loyalty": 94, "compass": {"economic": 1.3, "social": 0.1, "ideoScore": 2.3}, "ideo": [1.3, 0.1, 2.3], "bio": "Già Sottosegretario alla Salute nel Governo Draghi, organizzatore politico.", "history": ["Sottosegretario Salute (2021-2022)", "Consigliere Regionale Liguria"]},
  {"id": "giachetti", "name": "Roberto Giachetti", "age": 65, "gender": "M", "region": "Lazio", "partyId": "pld", "role": "Capogruppo alla Camera / Decano", "pref": "riforme", "competence": 88, "comp": 88, "clout": 87, "skill": 87, "prestige": 87, "loyalty": 95, "compass": {"economic": 1.2, "social": -1.0, "ideoScore": 1.8}, "ideo": [1.2, -1.0, 1.8], "bio": "Decano parlamentare radical-liberale, già Vicepresidente della Camera.", "history": ["Vicepresidente Camera (2013-2018)", "Candidato Sindaco Roma (2016)", "Deputato"]},
  {"id": "pastorella", "name": "Giulia Pastorella", "age": 39, "gender": "F", "region": "Lombardia", "partyId": "pld", "role": "Responsabile Digitale e Innovazione", "pref": "innovazione", "competence": 84, "comp": 84, "clout": 82, "skill": 82, "prestige": 82, "loyalty": 95, "compass": {"economic": 1.4, "social": -0.9, "ideoScore": 1.9}, "ideo": [1.4, -0.9, 1.9], "bio": "Deputata e vicepresidente, esperta europea di cybersicurezza e Big Tech.", "history": ["PhD London School of Economics", "Manager Big Tech", "Deputata dal 2022"]},
  {"id": "subranni", "name": "Paola Subranni", "age": 48, "gender": "F", "region": "Sicilia", "partyId": "pld", "role": "Responsabile Giustizia", "pref": "giustizia", "competence": 80, "comp": 80, "clout": 77, "skill": 77, "prestige": 77, "loyalty": 93, "compass": {"economic": 1.3, "social": -0.5, "ideoScore": 2.1}, "ideo": [1.3, -0.5, 2.1], "bio": "Avvocato cassazionista, portavoce dei principi della responsabilità civile dei magistrati.", "history": ["Avvocato foro Palermo", "Coordinatrice regionale PLD"]},
  {"id": "camilli", "name": "Nicola Camilli", "age": 43, "gender": "M", "region": "Toscana", "partyId": "pld", "role": "Responsabile Economia e PMI", "pref": "mimit", "competence": 81, "comp": 81, "clout": 78, "skill": 78, "prestige": 78, "loyalty": 94, "compass": {"economic": 1.5, "social": -0.4, "ideoScore": 2.1}, "ideo": [1.5, -0.4, 2.1], "bio": "Dottore commercialista, curatore del programma sulle detrazioni fiscali per gli investimenti privati.", "history": ["Consulente aziendale", "Responsabile economico"]},
  {"id": "marcucci", "name": "Andrea Marcucci", "age": 60, "gender": "M", "region": "Toscana", "partyId": "pld", "role": "Presidente Fondazione Riformista / Ex Capogruppo", "pref": "cultura", "competence": 87, "comp": 87, "clout": 85, "skill": 85, "prestige": 85, "loyalty": 93, "compass": {"economic": 1.3, "social": -0.7, "ideoScore": 2.1}, "ideo": [1.3, -0.7, 2.1], "bio": "Presidente di Liberali Democratici Europei, già capogruppo al Senato e sottosegretario ai Beni Culturali.", "history": ["Sottosegretario Beni Culturali (2006-2008)", "Capogruppo Senato PD (2018-2021)"]},
  {"id": "deluca_cat", "name": "Cateno De Luca", "age": 54, "gender": "M", "region": "Sicilia", "partyId": "scn", "role": "Sindaco d'Italia e Fondatore", "pref": "governo", "competence": 84, "comp": 84, "clout": 94, "skill": 94, "prestige": 94, "loyalty": 97, "compass": {"economic": -0.2, "social": 0.4, "ideoScore": 1.8}, "ideo": [-0.2, 0.4, 1.8], "bio": "'Scateno': Fondatore di Sud Chiama Nord, già sindaco di Messina e Taormina.", "history": ["Sindaco di Fiumedinisi, Santa Teresa, Messina e Taormina", "Deputato ARS"]},
  {"id": "castelli_l", "name": "Laura Castelli", "age": 39, "gender": "F", "region": "Piemonte", "partyId": "scn", "role": "Presidente del Partito / Ex Viceministra", "pref": "mef", "competence": 85, "comp": 85, "clout": 84, "skill": 84, "prestige": 84, "loyalty": 95, "compass": {"economic": -0.5, "social": -0.3, "ideoScore": 1.6}, "ideo": [-0.5, -0.3, 1.6], "bio": "Presidente di Sud Chiama Nord, già Viceministro dell'Economia e delle Finanze.", "history": ["Sottosegretario e Viceministro MEF (2018-2022)", "Deputata (2013-2022)"]},
  {"id": "lavardera", "name": "Ismaele La Vardera", "age": 32, "gender": "M", "region": "Sicilia", "partyId": "scn", "role": "Portavoce Antimafia / Giovani", "pref": "giustizia", "competence": 78, "comp": 78, "clout": 86, "skill": 86, "prestige": 86, "loyalty": 91, "compass": {"economic": -0.6, "social": -0.8, "ideoScore": 1.5}, "ideo": [-0.6, -0.8, 1.5], "bio": "Giornalista d'inchiesta, deputato all'ARS e vicepresidente Commissione Antimafia siciliana.", "history": ["Inviato Le Iene", "Deputato Regionale ARS dal 2022"]},
  {"id": "logiudice", "name": "Danilo Lo Giudice", "age": 38, "gender": "M", "region": "Sicilia", "partyId": "scn", "role": "Coordinatore Territoriale / Sindaco", "pref": "territorio", "competence": 80, "comp": 80, "clout": 79, "skill": 79, "prestige": 79, "loyalty": 94, "compass": {"economic": -0.1, "social": 0.3, "ideoScore": 1.9}, "ideo": [-0.1, 0.3, 1.9], "bio": "Sindaco di Santa Teresa di Riva e coordinatore delle liste civiche territoriali.", "history": ["Sindaco Santa Teresa di Riva", "Coordinatore regionale"]},
  {"id": "musolino", "name": "Dafne Musolino", "age": 51, "gender": "F", "region": "Sicilia", "partyId": "scn", "role": "Senatrice / Giurista", "pref": "ambiente", "competence": 82, "comp": 82, "clout": 81, "skill": 81, "prestige": 81, "loyalty": 95, "compass": {"economic": -0.3, "social": 0.1, "ideoScore": 2.0}, "ideo": [-0.3, 0.1, 2.0], "bio": "Senatrice della Repubblica, avvocato ed ex assessore al contenzioso di Messina.", "history": ["Assessore Comune Messina", "Senatrice della Repubblica dal 2022"]},
  {"id": "sciotto", "name": "Matteo Sciotto", "age": 47, "gender": "M", "region": "Sicilia", "partyId": "scn", "role": "Responsabile Enti Locali e Borghi", "pref": "agricoltura", "competence": 79, "comp": 79, "clout": 76, "skill": 76, "prestige": 76, "loyalty": 93, "compass": {"economic": -0.2, "social": 0.5, "ideoScore": 1.9}, "ideo": [-0.2, 0.5, 1.9], "bio": "Sindaco e coordinatore della rete dei piccoli comuni dell'entroterra contro lo spopolamento.", "history": ["Sindaco Gualtieri Sicamino", "Delegato ANCI"]},
  {"id": "lombardo_g", "name": "Giuseppe Lombardo", "age": 46, "gender": "M", "region": "Sicilia", "partyId": "scn", "role": "Deputato ARS / Welfare e Servizi", "pref": "affari_sociali", "competence": 80, "comp": 80, "clout": 78, "skill": 78, "prestige": 78, "loyalty": 93, "compass": {"economic": -0.3, "social": 0.3, "ideoScore": 1.9}, "ideo": [-0.3, 0.3, 1.9], "bio": "Deputato all'Assemblea Regionale Siciliana, già presidente di Messina Social City.", "history": ["Presidente Messina Social City", "Deputato ARS"]},
  {"id": "kompatscher", "name": "Arno Kompatscher", "age": 55, "gender": "M", "region": "Trentino-Alto Adige", "partyId": "svp", "role": "Landeshauptmann / Presidente", "pref": "autonomia", "competence": 92, "comp": 92, "clout": 93, "skill": 93, "prestige": 93, "loyalty": 98, "compass": {"economic": 1.0, "social": -0.3, "ideoScore": 2.2}, "ideo": [1.0, -0.3, 2.2], "bio": "Presidente della Provincia Autonoma di Bolzano e alfiere del modello di autonomia altoatesino.", "history": ["Presidente Provincia Autonoma Bolzano dal 2014", "Pres. Regione Trentino-Südtirol"]},
  {"id": "achammer", "name": "Philipp Achammer", "age": 41, "gender": "M", "region": "Trentino-Alto Adige", "partyId": "svp", "role": "Obmann del Partito", "pref": "istruzione", "competence": 87, "comp": 87, "clout": 89, "skill": 89, "prestige": 89, "loyalty": 96, "compass": {"economic": 0.9, "social": -0.2, "ideoScore": 2.3}, "ideo": [0.9, -0.2, 2.3], "bio": "Segretario politico (Obmann) della SVP e assessore provinciale alla cultura tedesca.", "history": ["Obmann SVP dal 2014", "Assessore provinciale scuola e cultura"]},
  {"id": "steger_d", "name": "Dieter Steger", "age": 62, "gender": "M", "region": "Trentino-Alto Adige", "partyId": "svp", "role": "Capogruppo a Roma / Giurista", "pref": "riforme", "competence": 88, "comp": 88, "clout": 86, "skill": 86, "prestige": 86, "loyalty": 97, "compass": {"economic": 1.1, "social": -0.1, "ideoScore": 2.4}, "ideo": [1.1, -0.1, 2.4], "bio": "Giurista e capogruppo delle Autonomie a Montecitorio, negoziatore dell'autonomia differenziata.", "history": ["Presidente Consiglio Provinciale Bolzano", "Deputato e Capogruppo"]},
  {"id": "gebhard", "name": "Renate Gebhard", "age": 49, "gender": "F", "region": "Trentino-Alto Adige", "partyId": "svp", "role": "Vicepresidente del Partito", "pref": "famiglia", "competence": 85, "comp": 85, "clout": 83, "skill": 83, "prestige": 83, "loyalty": 95, "compass": {"economic": 0.8, "social": -0.4, "ideoScore": 2.1}, "ideo": [0.8, -0.4, 2.1], "bio": "Avvocato e deputata, presidente della Commissione per le pari opportunità di Bolzano.", "history": ["Deputata dal 2013", "Vicepresidente SVP"]},
  {"id": "unterberger", "name": "Julia Unterberger", "age": 64, "gender": "F", "region": "Trentino-Alto Adige", "partyId": "svp", "role": "Presidente Gruppo Autonomie Senato", "pref": "giustizia", "competence": 89, "comp": 89, "clout": 87, "skill": 87, "prestige": 87, "loyalty": 96, "compass": {"economic": 1.0, "social": -0.7, "ideoScore": 2.0}, "ideo": [1.0, -0.7, 2.0], "bio": "Presidente del Gruppo per le Autonomie al Senato, difensore rigorosa dei diritti delle donne.", "history": ["Presidente Gruppo Autonomie Senato dal 2018", "Avvocato"]},
  {"id": "durnwalder_m", "name": "Meinhard Durnwalder", "age": 50, "gender": "M", "region": "Trentino-Alto Adige", "partyId": "svp", "role": "Senatore / Capocorrente Valli", "pref": "agricoltura", "competence": 83, "comp": 83, "clout": 81, "skill": 81, "prestige": 81, "loyalty": 94, "compass": {"economic": 1.2, "social": 0.1, "ideoScore": 2.5}, "ideo": [1.2, 0.1, 2.5], "bio": "Senatore di lingua tedesca, rappresentante dell'agricoltura montana e delle comunità alpine.", "history": ["Senatore della Repubblica dal 2018", "Rappresentante Bauernbund"]},
  {"id": "alfreider", "name": "Daniel Alfreider", "age": 45, "gender": "M", "region": "Trentino-Alto Adige", "partyId": "svp", "role": "Assessore Infrastrutture Ladine", "pref": "mit", "competence": 84, "comp": 84, "clout": 82, "skill": 82, "prestige": 82, "loyalty": 95, "compass": {"economic": 1.1, "social": -0.2, "ideoScore": 2.3}, "ideo": [1.1, -0.2, 2.3], "bio": "Ingegnere, vicepresidente della Provincia di Bolzano in rappresentanza della minoranza ladina.", "history": ["Deputato (2013-2018)", "Vicepresidente Provincia Bolzano"]},
  {"id": "rizzo_p", "name": "Marco Rizzo", "age": 67, "gender": "M", "region": "Piemonte", "partyId": "dsp", "role": "Coordinatore Nazionale", "pref": "lavoro", "competence": 84, "comp": 84, "clout": 92, "skill": 92, "prestige": 92, "loyalty": 98, "compass": {"economic": -1.8, "social": 1.8, "ideoScore": 2.0}, "ideo": [-1.8, 1.8, 2.0], "bio": "Leader di Democrazia Sovrana Popolare, storico dirigente comunista e antimperialista.", "history": ["Deputato (1994-2004)", "Europarlamentare (2004-2009)", "Presidente Onorario PC"]},
  {"id": "toscano_f", "name": "Francesco Toscano", "age": 47, "gender": "M", "region": "Calabria", "partyId": "dsp", "role": "Presidente / Direttore Visione TV", "pref": "comunicazioni", "competence": 81, "comp": 81, "clout": 88, "skill": 88, "prestige": 88, "loyalty": 96, "compass": {"economic": -1.6, "social": 1.9, "ideoScore": 1.8}, "ideo": [-1.6, 1.9, 1.8], "bio": "Giornalista d'inchiesta, fondatore di Visione TV e cofondatore di DSP.", "history": ["Direttore Visione TV", "Cofondatore DSP"]},
  {"id": "grimaldi_f", "name": "Fulvio Grimaldi", "age": 92, "gender": "M", "region": "Lazio", "partyId": "dsp", "role": "Decano del Giornalismo Antimperialista", "pref": "esteri", "competence": 85, "comp": 85, "clout": 83, "skill": 83, "prestige": 83, "loyalty": 94, "compass": {"economic": -1.9, "social": 1.6, "ideoScore": 1.5}, "ideo": [-1.9, 1.6, 1.5], "bio": "Decano dei reporter di guerra internazionali e storico inviato RAI.", "history": ["Inviato speciale RAI", "Saggista e documentarista"]},
  {"id": "bianchi_g", "name": "Giorgio Bianchi", "age": 50, "gender": "M", "region": "Lazio", "partyId": "dsp", "role": "Responsabile Esteri / Reporter", "pref": "esteri", "competence": 79, "comp": 79, "clout": 85, "skill": 85, "prestige": 85, "loyalty": 93, "compass": {"economic": -1.5, "social": 1.9, "ideoScore": 2.2}, "ideo": [-1.5, 1.9, 2.2], "bio": "Fotoreporter e documentarista indipendente dai fronti caldi del Donbass e Medio Oriente.", "history": ["Fotoreporter internazionale", "Saggista"]},
  {"id": "pennetta", "name": "Enzo Pennetta", "age": 65, "gender": "M", "region": "Lazio", "partyId": "dsp", "role": "Coordinatore Comitato Fermare la Guerra", "pref": "istruzione", "competence": 82, "comp": 82, "clout": 81, "skill": 81, "prestige": 81, "loyalty": 95, "compass": {"economic": -1.4, "social": 1.7, "ideoScore": 2.1}, "ideo": [-1.4, 1.7, 2.1], "bio": "Docente, saggista e portavoce della campagna referendaria contro l'invio di armi nei conflitti.", "history": ["Portavoce Referendum Ripudia la Guerra", "Saggista"]},
  {"id": "giovanardi_d", "name": "Daniele Giovanardi", "age": 76, "gender": "M", "region": "Emilia-Romagna", "partyId": "dsp", "role": "Responsabile Sanità e Libertà di Cura", "pref": "sanita", "competence": 80, "comp": 80, "clout": 78, "skill": 78, "prestige": 78, "loyalty": 92, "compass": {"economic": -1.3, "social": 1.5, "ideoScore": 2.3}, "ideo": [-1.3, 1.5, 2.3], "bio": "Medico primario di pronto soccorso a Modena, critico delle politiche vaccinali emergenziali.", "history": ["Primario Pronto Soccorso Policlinico Modena", "Membro direttivo DSP"]},
  {"id": "cresti", "name": "Antonello Cresti", "age": 48, "gender": "M", "region": "Toscana", "partyId": "dsp", "role": "Responsabile Cultura / Saggista", "pref": "cultura", "competence": 80, "comp": 80, "clout": 80, "skill": 80, "prestige": 80, "loyalty": 93, "compass": {"economic": -1.6, "social": 1.8, "ideoScore": 2.0}, "ideo": [-1.6, 1.8, 2.0], "bio": "Saggista, critico culturale ed etnomusicologo, portavoce contro la tecnocrazia e il transumanesimo.", "history": ["Saggista e conferenziere", "Delegato cultura DSP"]},
  {"id": "collot_p", "name": "Marta Collot", "age": 33, "gender": "F", "region": "Emilia-Romagna", "partyId": "pap", "role": "Portavoce Nazionale", "pref": "lavoro", "competence": 83, "comp": 83, "clout": 90, "skill": 90, "prestige": 90, "loyalty": 97, "compass": {"economic": -1.9, "social": -1.9, "ideoScore": 0.4}, "ideo": [-1.9, -1.9, 0.4], "bio": "Musicista e portavoce di Potere al Popolo, attiva nei picchetti operai e nella lotta al carovita.", "history": ["Candidata Presidente Emilia-Romagna", "Portavoce Nazionale PaP"]},
  {"id": "granato_g", "name": "Giuliano Granato", "age": 39, "gender": "M", "region": "Campania", "partyId": "pap", "role": "Co-portavoce Nazionale", "pref": "lavoro", "competence": 82, "comp": 82, "clout": 89, "skill": 89, "prestige": 89, "loyalty": 96, "compass": {"economic": -1.9, "social": -1.8, "ideoScore": 0.4}, "ideo": [-1.9, -1.8, 0.4], "bio": "Militante sindacale, animatore delle battaglie per il salario minimo e contro le delocalizzazioni.", "history": ["Co-portavoce PaP", "Animatore vertenze operaie"]},
  {"id": "cremaschi", "name": "Giorgio Cremaschi", "age": 78, "gender": "M", "region": "Lombardia", "partyId": "pap", "role": "Presidente Coordinamento Lotte / Ex FIOM", "pref": "industria", "competence": 86, "comp": 86, "clout": 85, "skill": 85, "prestige": 85, "loyalty": 95, "compass": {"economic": -2.0, "social": -1.7, "ideoScore": 0.3}, "ideo": [-2.0, -1.7, 0.3], "bio": "Storico presidente nazionale della FIOM-CGIL, riferimento indiscusso del sindacalismo di classe.", "history": ["Presidente Nazionale FIOM (2010-2012)", "Membro comitato PaP"]},
  {"id": "carofalo", "name": "Viola Carofalo", "age": 45, "gender": "F", "region": "Campania", "partyId": "pap", "role": "Filosofa / Prima Portavoce Storica", "pref": "istruzione", "competence": 84, "comp": 84, "clout": 83, "skill": 83, "prestige": 83, "loyalty": 94, "compass": {"economic": -1.8, "social": -1.9, "ideoScore": 0.5}, "ideo": [-1.8, -1.9, 0.5], "bio": "Ricercatrice universitaria in filosofia morale, prima portavoce nazionale di Potere al Popolo.", "history": ["Dottore di Ricerca UNIOR", "Portavoce fondatrice (2018-2021)"]},
  {"id": "patta", "name": "Antonello Patta", "age": 65, "gender": "M", "region": "Sardegna", "partyId": "pap", "role": "Responsabile Lavoro e Vertenze", "pref": "welfare", "competence": 81, "comp": 81, "clout": 79, "skill": 79, "prestige": 79, "loyalty": 93, "compass": {"economic": -1.9, "social": -1.8, "ideoScore": 0.4}, "ideo": [-1.9, -1.8, 0.4], "bio": "Coordinatore delle tutele per i rider, operai edili e precari della logistica.", "history": ["Sindacalista confederale", "Ufficio lavoro PaP"]},
  {"id": "suriano_s", "name": "Simona Suriano", "age": 45, "gender": "F", "region": "Sicilia", "partyId": "pap", "role": "Responsabile Giustizia Sociale ed Esteri", "pref": "giustizia", "competence": 83, "comp": 83, "clout": 81, "skill": 81, "prestige": 81, "loyalty": 94, "compass": {"economic": -1.8, "social": -1.7, "ideoScore": 0.6}, "ideo": [-1.8, -1.7, 0.6], "bio": "Già deputata a Montecitorio, oppositrice rigorosa della spesa militare NATO e dell'autonomia.", "history": ["Deputata (2018-2022)", "Membro Commissione Esteri"]},
  {"id": "leoni_g", "name": "Giuliano Leoni", "age": 42, "gender": "M", "region": "Lazio", "partyId": "pap", "role": "Coordinatore Diritto all'Abitare", "pref": "territorio", "competence": 80, "comp": 80, "clout": 78, "skill": 78, "prestige": 78, "loyalty": 93, "compass": {"economic": -1.9, "social": -1.8, "ideoScore": 0.3}, "ideo": [-1.9, -1.8, 0.3], "bio": "Attivista dei comitati per la casa a Roma, impegnato contro gli sfratti popolari.", "history": ["Attivista ASIA-USB", "Membro coordinamento nazionale"]},
  {"id": "acerbo_p", "name": "Maurizio Acerbo", "age": 61, "gender": "M", "region": "Abruzzo", "partyId": "prc", "role": "Segretario Nazionale", "pref": "lavoro", "competence": 84, "comp": 84, "clout": 91, "skill": 91, "prestige": 91, "loyalty": 98, "compass": {"economic": -1.9, "social": -1.9, "ideoScore": 0.5}, "ideo": [-1.9, -1.9, 0.5], "bio": "Segretario Nazionale di Rifondazione Comunista, storico oppositore del neoliberismo.", "history": ["Deputato (2006-2008)", "Consigliere Regionale Abruzzo", "Segretario PRC dal 2017"]},
  {"id": "mazzoni_e", "name": "Elena Mazzoni", "age": 49, "gender": "F", "region": "Lazio", "partyId": "prc", "role": "Segretaria Federazione Roma e Lavoro", "pref": "ambiente", "competence": 81, "comp": 81, "clout": 84, "skill": 84, "prestige": 84, "loyalty": 95, "compass": {"economic": -1.8, "social": -1.8, "ideoScore": 0.6}, "ideo": [-1.8, -1.8, 0.6], "bio": "Segretaria della federazione di Roma, ambientalista e animatrice delle vertenze dei servizi pubblici.", "history": ["Segretaria Federazione PRC Roma", "Comitato per l'Acqua Pubblica"]},
  {"id": "ferrero_p", "name": "Paolo Ferrero", "age": 65, "gender": "M", "region": "Piemonte", "partyId": "prc", "role": "Vicepresidente Sinistra Europea / Ex Ministro", "pref": "welfare", "competence": 88, "comp": 88, "clout": 86, "skill": 86, "prestige": 86, "loyalty": 95, "compass": {"economic": -1.9, "social": -1.8, "ideoScore": 0.5}, "ideo": [-1.9, -1.8, 0.5], "bio": "Già Ministro della Solidarietà Sociale nel Governo Prodi II e vicepresidente del Partito della Sinistra Europea.", "history": ["Ministro Solidarietà Sociale (2006-2008)", "Segretario PRC (2008-2017)"]},
  {"id": "greco_d", "name": "Dino Greco", "age": 73, "gender": "M", "region": "Lombardia", "partyId": "prc", "role": "Direttore Su la Testa / Ex Dirigente CGIL", "pref": "lavoro", "competence": 83, "comp": 83, "clout": 80, "skill": 80, "prestige": 80, "loyalty": 94, "compass": {"economic": -1.9, "social": -1.7, "ideoScore": 0.4}, "ideo": [-1.9, -1.7, 0.4], "bio": "Già segretario generale della CGIL di Brescia e direttore del periodico comunista 'Su la Testa'.", "history": ["Segretario Generale CGIL Brescia", "Direttore Su la Testa"]},
  {"id": "capelli", "name": "Giovanna Capelli", "age": 80, "gender": "F", "region": "Lombardia", "partyId": "prc", "role": "Responsabile Scuola e Università", "pref": "istruzione", "competence": 82, "comp": 82, "clout": 78, "skill": 78, "prestige": 78, "loyalty": 94, "compass": {"economic": -1.8, "social": -1.8, "ideoScore": 0.5}, "ideo": [-1.8, -1.8, 0.5], "bio": "Insegnante e senatrice storica del PRC, difensore della scuola pubblica laica.", "history": ["Senatrice della Repubblica (2006-2008)", "Membro Direzione Nazionale"]},
  {"id": "forenza", "name": "Eleonora Forenza", "age": 49, "gender": "F", "region": "Puglia", "partyId": "prc", "role": "Responsabile Esteri / Ex Eurodeputata", "pref": "esteri", "competence": 84, "comp": 84, "clout": 82, "skill": 82, "prestige": 82, "loyalty": 95, "compass": {"economic": -1.9, "social": -1.9, "ideoScore": 0.5}, "ideo": [-1.9, -1.9, 0.5], "bio": "Ricercatrice di italianistica, già parlamentare europea per il gruppo GUE/NGL e femminista.", "history": ["Europarlamentare (2014-2019)", "Portavoce femminista"]},
  {"id": "rinaldi_r", "name": "Rosa Rinaldi", "age": 69, "gender": "F", "region": "Lazio", "partyId": "prc", "role": "Ex Sottosegretaria Lavoro / Sindacalista", "pref": "lavoro", "competence": 85, "comp": 85, "clout": 83, "skill": 83, "prestige": 83, "loyalty": 94, "compass": {"economic": -1.9, "social": -1.8, "ideoScore": 0.5}, "ideo": [-1.9, -1.8, 0.5], "bio": "Storica dirigente nazionale FIOM e sottosegretaria al Ministero del Lavoro.", "history": ["Sottosegretaria Lavoro (2006-2008)", "Segretaria Nazionale PRC"]},
  {"id": "santoro_p", "name": "Michele Santoro", "age": 74, "gender": "M", "region": "Campania", "partyId": "ptd", "role": "Fondatore e Portavoce", "pref": "comunicazioni", "competence": 87, "comp": 87, "clout": 93, "skill": 93, "prestige": 93, "loyalty": 97, "compass": {"economic": -1.5, "social": -1.4, "ideoScore": 0.9}, "ideo": [-1.5, -1.4, 0.9], "bio": "Celebre giornalista televisivo, conduttore di Samarcanda e Annozero, fondatore della lista Pace Terra Dignità.", "history": ["Europarlamentare (2004-2005)", "Conduttore storico Rai e La7", "Leader PTD"]},
  {"id": "lavalle", "name": "Raniero La Valle", "age": 94, "gender": "M", "region": "Lazio", "partyId": "ptd", "role": "Presidente del Comitato Promotore", "pref": "esteri", "competence": 91, "comp": 91, "clout": 88, "skill": 88, "prestige": 88, "loyalty": 99, "compass": {"economic": -1.6, "social": -1.7, "ideoScore": 0.8}, "ideo": [-1.6, -1.7, 0.8], "bio": "Decano dei giornalisti cattolici progressisti, storico direttore del Popolo e già senatore indipendente.", "history": ["Direttore Il Popolo", "Senatore Sinistra Indipendente (1976-1992)"]},
  {"id": "bompiani", "name": "Ginevra Bompiani", "age": 86, "gender": "F", "region": "Lombardia", "partyId": "ptd", "role": "Scrittrice e Animatrice Culturale", "pref": "cultura", "competence": 85, "comp": 85, "clout": 84, "skill": 84, "prestige": 84, "loyalty": 95, "compass": {"economic": -1.6, "social": -1.8, "ideoScore": 0.7}, "ideo": [-1.6, -1.8, 0.7], "bio": "Scrittrice, editrice di Nottetempo e voce critica contro l'invio di armi e la belligeranza europea.", "history": ["Editrice Nottetempo", "Saggista"]},
  {"id": "odifreddi", "name": "Piergiorgio Odifreddi", "age": 75, "gender": "M", "region": "Piemonte", "partyId": "ptd", "role": "Matematico e Divulgatore", "pref": "ricerca", "competence": 88, "comp": 88, "clout": 85, "skill": 85, "prestige": 85, "loyalty": 94, "compass": {"economic": -1.4, "social": -1.9, "ideoScore": 1.0}, "ideo": [-1.4, -1.9, 1.0], "bio": "Matematico, logico e saggista, oppositore rigoroso di ogni spesa per il riarmo militare.", "history": ["Professore Ordinario Logica Matematica", "Saggista Premio Galilei"]},
  {"id": "cucurnia", "name": "Fiammetta Cucurnia", "age": 67, "gender": "F", "region": "Lazio", "partyId": "ptd", "role": "Inviata Speciale per la Pace", "pref": "esteri", "competence": 82, "comp": 82, "clout": 81, "skill": 81, "prestige": 81, "loyalty": 93, "compass": {"economic": -1.5, "social": -1.3, "ideoScore": 1.0}, "ideo": [-1.5, -1.3, 1.0], "bio": "Giornalista e corrispondente storica da Mosca, analista delle trattative di sicurezza eurasiatica.", "history": ["Corrispondente La Repubblica da Mosca", "Analista internazionale"]},
  {"id": "sabene", "name": "Benedetta Sabene", "age": 30, "gender": "F", "region": "Lazio", "partyId": "ptd", "role": "Portavoce Giovani e Diritti", "pref": "giovani", "competence": 79, "comp": 79, "clout": 83, "skill": 83, "prestige": 83, "loyalty": 92, "compass": {"economic": -1.7, "social": -1.8, "ideoScore": 0.6}, "ideo": [-1.7, -1.8, 0.6], "bio": "Giovane saggista e attivista, curatrice di analisi sui crimini di guerra e il diritto umanitario.", "history": ["Autrice e podcaster", "Candidata capolista PTD"]},
  {"id": "dorsi", "name": "Angelo d'Orsi", "age": 78, "gender": "M", "region": "Piemonte", "partyId": "ptd", "role": "Storico e Docente Universitario", "pref": "istruzione", "competence": 84, "comp": 84, "clout": 82, "skill": 82, "prestige": 82, "loyalty": 94, "compass": {"economic": -1.6, "social": -1.7, "ideoScore": 0.7}, "ideo": [-1.6, -1.7, 0.7], "bio": "Storico del pensiero politico, già ordinario all'Università di Torino e studioso di Gramsci.", "history": ["Professore Ordinario UniTO", "Direttore riviste storiche"]},
  {"id": "maraio_p", "name": "Enzo Maraio", "age": 47, "gender": "M", "region": "Campania", "partyId": "psi", "role": "Segretario Nazionale", "pref": "governo", "competence": 84, "comp": 84, "clout": 89, "skill": 89, "prestige": 89, "loyalty": 98, "compass": {"economic": -1.1, "social": -1.2, "ideoScore": 1.5}, "ideo": [-1.1, -1.2, 1.5], "bio": "Segretario Nazionale del Partito Socialista Italiano, erede della tradizione del garofano rosso.", "history": ["Consigliere Regionale Campania", "Assessore Turismo Salerno", "Segretario PSI dal 2019"]},
  {"id": "iorio_l", "name": "Luigi Iorio", "age": 43, "gender": "M", "region": "Campania", "partyId": "psi", "role": "Vicesegretario Nazionale / Giurista", "pref": "riforme", "competence": 81, "comp": 81, "clout": 80, "skill": 80, "prestige": 80, "loyalty": 95, "compass": {"economic": -1.0, "social": -1.1, "ideoScore": 1.6}, "ideo": [-1.0, -1.1, 1.6], "bio": "Avvocato, vicesegretario e coordinatore dell'iniziativa legislativa sui diritti dei lavoratori autonomi.", "history": ["Vicesegretario Nazionale PSI", "Coordinatore consulte giuridiche"]},
  {"id": "nencini_r", "name": "Riccardo Nencini", "age": 66, "gender": "M", "region": "Toscana", "partyId": "psi", "role": "Presidente Onorario / Ex Viceministro", "pref": "infrastrutture", "competence": 88, "comp": 88, "clout": 86, "skill": 86, "prestige": 86, "loyalty": 94, "compass": {"economic": -1.1, "social": -1.0, "ideoScore": 1.6}, "ideo": [-1.1, -1.0, 1.6], "bio": "Presidente del Gabinetto Vieusseux, già Viceministro alle Infrastrutture e Presidente del Consiglio Toscano.", "history": ["Presidente Consiglio Toscana", "Viceministro MIT (2014-2018)", "Senatore"]},
  {"id": "pisani_m", "name": "Maria Pisani", "age": 38, "gender": "F", "region": "Lazio", "partyId": "psi", "role": "Responsabile Pari Opportunità e Giovani", "pref": "giovani", "competence": 80, "comp": 80, "clout": 78, "skill": 78, "prestige": 78, "loyalty": 94, "compass": {"economic": -1.2, "social": -1.4, "ideoScore": 1.4}, "ideo": [-1.2, -1.4, 1.4], "bio": "Già presidente del Forum Nazionale dei Giovani, delegata alle politiche giovanili socialiste.", "history": ["Presidente Forum Nazionale Giovani", "Delegata europea"]},
  {"id": "biscardini", "name": "Roberto Biscardini", "age": 78, "gender": "M", "region": "Lombardia", "partyId": "psi", "role": "Coordinatore Fondazione Milano Socialista", "pref": "urbanistica", "competence": 82, "comp": 82, "clout": 79, "skill": 79, "prestige": 79, "loyalty": 92, "compass": {"economic": -1.2, "social": -1.1, "ideoScore": 1.5}, "ideo": [-1.2, -1.1, 1.5], "bio": "Architetto e urbanista, senatore storico, animatore del socialismo riformista lombardo.", "history": ["Senatore (2004-2006)", "Assessore Urbanistica Milano"]},
  {"id": "moffa", "name": "Silvano Moffa", "age": 74, "gender": "M", "region": "Lazio", "partyId": "psi", "role": "Responsabile Lavoro e Mezzogiorno", "pref": "lavoro", "competence": 83, "comp": 83, "clout": 81, "skill": 81, "prestige": 81, "loyalty": 91, "compass": {"economic": -0.8, "social": -0.6, "ideoScore": 1.8}, "ideo": [-0.8, -0.6, 1.8], "bio": "Già Presidente della Provincia di Roma e Presidente della Commissione Lavoro della Camera.", "history": ["Presidente Provincia di Roma (1998-2003)", "Presidente Commissione Lavoro Camera"]},
  {"id": "pastorelli_o", "name": "Oreste Pastorelli", "age": 70, "gender": "M", "region": "Lazio", "partyId": "psi", "role": "Tesoriere Nazionale / Decano", "pref": "ambiente", "competence": 82, "comp": 82, "clout": 80, "skill": 80, "prestige": 80, "loyalty": 93, "compass": {"economic": -1.0, "social": -1.0, "ideoScore": 1.6}, "ideo": [-1.0, -1.0, 1.6], "bio": "Storico parlamentare e tesoriere del PSI, difensore delle aree interne e dell'Appennino.", "history": ["Deputato (2013-2018)", "Tesoriere Nazionale PSI"]},
  {"id": "mastella_c", "name": "Clemente Mastella", "age": 78, "gender": "M", "region": "Campania", "partyId": "ndc", "role": "Segretario Nazionale e Fondatore", "pref": "governo", "competence": 86, "comp": 86, "clout": 95, "skill": 95, "prestige": 95, "loyalty": 98, "compass": {"economic": 0.2, "social": 0.4, "ideoScore": 2.3}, "ideo": [0.2, 0.4, 2.3], "bio": "Sindaco di Benevento, fondatore di Noi di Centro, già Guardasigilli e Ministro del Lavoro.", "history": ["Ministro Lavoro (1994-1995)", "Ministro Giustizia (2006-2008)", "Sindaco Benevento dal 2016"]},
  {"id": "lonardo", "name": "Sandra Lonardo Mastella", "age": 72, "gender": "F", "region": "Campania", "partyId": "ndc", "role": "Presidente del Partito", "pref": "affari_sociali", "competence": 82, "comp": 82, "clout": 84, "skill": 84, "prestige": 84, "loyalty": 96, "compass": {"economic": 0.3, "social": 0.5, "ideoScore": 2.4}, "ideo": [0.3, 0.5, 2.4], "bio": "Già Presidente del Consiglio Regionale della Campania e Senatrice della Repubblica.", "history": ["Presidente Consiglio Campania (2005-2010)", "Senatrice (2018-2022)"]},
  {"id": "cesa_l_udc", "name": "Lorenzo Cesa (UdC)", "age": 75, "gender": "M", "region": "Lazio", "partyId": "ndc", "role": "Leader Storico Scudo Crociato", "pref": "esteri", "competence": 85, "comp": 85, "clout": 83, "skill": 83, "prestige": 83, "loyalty": 95, "compass": {"economic": 0.5, "social": 0.8, "ideoScore": 2.6}, "ideo": [0.5, 0.8, 2.6], "bio": "Segretario nazionale dello Scudo Crociato, garante della tradizione democristiana popolare.", "history": ["Europarlamentare (2004-2006, 2014-2019)", "Deputato dal 2006"]},
  {"id": "binetti", "name": "Paola Binetti", "age": 82, "gender": "F", "region": "Lazio", "partyId": "ndc", "role": "Responsabile Bioetica e Famiglia", "pref": "sanita", "competence": 84, "comp": 84, "clout": 82, "skill": 82, "prestige": 82, "loyalty": 94, "compass": {"economic": 0.4, "social": 1.0, "ideoScore": 2.7}, "ideo": [0.4, 1.0, 2.7], "bio": "Neuropsichiatra infantile, già parlamentare, alfiere dei valori cattolici della vita e della famiglia.", "history": ["Deputata e Senatrice (2006-2022)", "Docente Università Campus Bio-Medico"]},
  {"id": "depoli", "name": "Antonio De Poli", "age": 63, "gender": "M", "region": "Veneto", "partyId": "ndc", "role": "Presidente Nazionale UdC / Questore Camera", "pref": "riforme", "competence": 84, "comp": 84, "clout": 85, "skill": 85, "prestige": 85, "loyalty": 96, "compass": {"economic": 0.6, "social": 0.7, "ideoScore": 2.5}, "ideo": [0.6, 0.7, 2.5], "bio": "Deputato Questore della Camera, dirigente storico del centro cattolico moderato in Veneto.", "history": ["Europarlamentare (2004-2005)", "Questore Camera Deputati"]},
  {"id": "sanza_a", "name": "Angelo Sanza", "age": 83, "gender": "M", "region": "Basilicata", "partyId": "ndc", "role": "Decano dei Popolari del Sud", "pref": "sviluppo", "competence": 82, "comp": 82, "clout": 78, "skill": 78, "prestige": 78, "loyalty": 92, "compass": {"economic": 0.3, "social": 0.6, "ideoScore": 2.4}, "ideo": [0.3, 0.6, 2.4], "bio": "Già Sottosegretario di Stato alla Presidenza del Consiglio e decano dei deputati lucani.", "history": ["Sottosegretario Presidenza Consiglio (1987-1992)", "Deputato per 8 legislature"]},
  {"id": "baruffi_l", "name": "Luigi Baruffi", "age": 81, "gender": "M", "region": "Lombardia", "partyId": "ndc", "role": "Responsabile Organizzazione Storica", "pref": "territorio", "competence": 81, "comp": 81, "clout": 77, "skill": 77, "prestige": 77, "loyalty": 92, "compass": {"economic": 0.4, "social": 0.6, "ideoScore": 2.4}, "ideo": [0.4, 0.6, 2.4], "bio": "Decano dell'organizzazione elettorale dello Scudo Crociato, già parlamentare europeo.", "history": ["Europarlamentare (1989-1994)", "Coordinatore collegi"]},
  {"id": "paragone_p", "name": "Gianluigi Paragone", "age": 54, "gender": "M", "region": "Lombardia", "partyId": "itx", "role": "Fondatore e Leader", "pref": "comunicazioni", "competence": 83, "comp": 83, "clout": 92, "skill": 92, "prestige": 92, "loyalty": 98, "compass": {"economic": 0.1, "social": 1.9, "ideoScore": 3.4}, "ideo": [0.1, 1.9, 3.4], "bio": "Giornalista, conduttore di 'La Gabbia', ex senatore e fondatore di Italexit.", "history": ["Direttore La Padania (2005-2007)", "Conduttore La7", "Senatore (2018-2022)"]},
  {"id": "schiliro", "name": "Nunzia Schilirò", "age": 47, "gender": "F", "region": "Sicilia", "partyId": "itx", "role": "Vicepresidente / Giurista", "pref": "giustizia", "competence": 82, "comp": 82, "clout": 85, "skill": 85, "prestige": 85, "loyalty": 95, "compass": {"economic": 0.2, "social": 1.8, "ideoScore": 3.2}, "ideo": [0.2, 1.8, 3.2], "bio": "Già vicequestore di polizia a Roma, portavoce dei movimenti contro il Green Pass e l'obbligo vaccinale.", "history": ["Vicequestore Polizia di Stato", "Saggista e conferenziera"]},
  {"id": "freccero", "name": "Carlo Freccero", "age": 78, "gender": "M", "region": "Liguria", "partyId": "itx", "role": "Ideologo della Comunicazione e Media", "pref": "cultura", "competence": 88, "comp": 88, "clout": 86, "skill": 86, "prestige": 86, "loyalty": 92, "compass": {"economic": -0.2, "social": 1.7, "ideoScore": 2.9}, "ideo": [-0.2, 1.7, 2.9], "bio": "Celebre autore televisivo, già direttore di Rai 2 e membro del CdA Rai, critico del pensiero unico.", "history": ["Direttore Rai 2 (1996-2002, 2018-2019)", "Membro CdA Rai"]},
  {"id": "puzzer", "name": "Stefano Puzzer", "age": 52, "gender": "M", "region": "Friuli-Venezia Giulia", "partyId": "itx", "role": "Portavoce Portuali e Lavoratori", "pref": "lavoro", "competence": 76, "comp": 76, "clout": 88, "skill": 88, "prestige": 88, "loyalty": 87, "compass": {"economic": 0.0, "social": 1.8, "ideoScore": 3.1}, "ideo": [0.0, 1.8, 3.1], "bio": "Leader della protesta dei portuali di Trieste contro i decreti governativi d'emergenza.", "history": ["Portavoce Coordinamento Portuali Trieste", "Animatore proteste"]},
  {"id": "donato_f", "name": "Francesca Donato", "age": 56, "gender": "F", "region": "Veneto", "partyId": "itx", "role": "Responsabile Affari Europei ed Eurodeputata", "pref": "esteri", "competence": 84, "comp": 84, "clout": 82, "skill": 82, "prestige": 82, "loyalty": 94, "compass": {"economic": 0.3, "social": 1.9, "ideoScore": 3.5}, "ideo": [0.3, 1.9, 3.5], "bio": "Europarlamentare, avvocato, fondatrice del Progetto Eurexit per il ripristino della sovranità monetaria.", "history": ["Presidente Progetto Eurexit", "Eurodeputata dal 2019"]},
  {"id": "pasquinelli", "name": "Moreno Pasquinelli", "age": 67, "gender": "M", "region": "Umbria", "partyId": "itx", "role": "Coordinatore Sovranismo Popolare", "pref": "sovranita", "competence": 80, "comp": 80, "clout": 77, "skill": 77, "prestige": 77, "loyalty": 91, "compass": {"economic": -0.1, "social": 1.8, "ideoScore": 3.3}, "ideo": [-0.1, 1.8, 3.3], "bio": "Saggista, fondatore del Fronte del Dissenso contro l'atlantismo e la gabbia dei trattati UE.", "history": ["Portavoce Fronte del Dissenso", "Saggista"]},
  {"id": "capitani", "name": "Gian Marco Capitani", "age": 51, "gender": "M", "region": "Toscana", "partyId": "itx", "role": "Portavoce Prisc-Italexit", "pref": "territorio", "competence": 78, "comp": 78, "clout": 80, "skill": 80, "prestige": 80, "loyalty": 92, "compass": {"economic": 0.1, "social": 1.9, "ideoScore": 3.3}, "ideo": [0.1, 1.9, 3.3], "bio": "Animatore delle mobilitazioni di piazza toscane in difesa della Costituzione e delle partite IVA.", "history": ["Portavoce comitati civici", "Membro direttivo"]},
  {"id": "iannone_p", "name": "Gianluca Iannone", "age": 52, "gender": "M", "region": "Lazio", "partyId": "cpi", "role": "Presidente e Fondatore", "pref": "sovranita", "competence": 81, "comp": 81, "clout": 93, "skill": 93, "prestige": 93, "loyalty": 99, "compass": {"economic": 0.3, "social": 2.0, "ideoScore": 3.9}, "ideo": [0.3, 2.0, 3.9], "bio": "Presidente e fondatore di CasaPound Italia, cantante del gruppo ZetaZeroAlfa.", "history": ["Fondatore CasaPound (2003)", "Leader storico nazionalpopolare"]},
  {"id": "distefano_s", "name": "Simone Di Stefano", "age": 48, "gender": "M", "region": "Lazio", "partyId": "cpi", "role": "Segretario Politico / Portavoce", "pref": "governo", "competence": 83, "comp": 83, "clout": 90, "skill": 90, "prestige": 90, "loyalty": 97, "compass": {"economic": 0.4, "social": 2.0, "ideoScore": 3.8}, "ideo": [0.4, 2.0, 3.8], "bio": "Già segretario nazionale e vicepresidente, volto televisivo e candidato premier del movimento.", "history": ["Vicepresidente CPI", "Fondatore Exit"]},
  {"id": "chiaraluce", "name": "Carlotta Chiaraluce", "age": 41, "gender": "F", "region": "Lazio", "partyId": "cpi", "role": "Portavoce Roma Litorale", "pref": "territorio", "competence": 80, "comp": 80, "clout": 84, "skill": 84, "prestige": 84, "loyalty": 94, "compass": {"economic": 0.3, "social": 1.9, "ideoScore": 3.8}, "ideo": [0.3, 1.9, 3.8], "bio": "Coordinatrice delle sezioni del litorale romano, animatrice delle battaglie per la casa agli italiani.", "history": ["Coordinatrice Roma X Municipio", "Membro direzione"]},
  {"id": "antonini_a", "name": "Andrea Antonini", "age": 54, "gender": "M", "region": "Lazio", "partyId": "cpi", "role": "Vicepresidente Nazionale", "pref": "esteri", "competence": 82, "comp": 82, "clout": 83, "skill": 83, "prestige": 83, "loyalty": 95, "compass": {"economic": 0.5, "social": 2.0, "ideoScore": 3.9}, "ideo": [0.5, 2.0, 3.9], "bio": "Vicepresidente di CasaPound Italia, curatore delle relazioni con i partiti nazionalisti europei.", "history": ["Vicepresidente CPI", "Consigliere XX Municipio"]},
  {"id": "marsella", "name": "Luca Marsella", "age": 39, "gender": "M", "region": "Lazio", "partyId": "cpi", "role": "Portavoce Comunale e Giovani", "pref": "giovani", "competence": 79, "comp": 79, "clout": 82, "skill": 82, "prestige": 82, "loyalty": 93, "compass": {"economic": 0.4, "social": 1.9, "ideoScore": 3.9}, "ideo": [0.4, 1.9, 3.9], "bio": "Consigliere municipale di Ostia, organizzatore del Blocco Studentesco.", "history": ["Consigliere Municipale X Municipio", "Leader Blocco Studentesco"]},
  {"id": "palladino_a", "name": "Alberto Palladino", "age": 38, "gender": "M", "region": "Lazio", "partyId": "cpi", "role": "Responsabile Esteri e Solidarietà", "pref": "esteri", "competence": 80, "comp": 80, "clout": 78, "skill": 78, "prestige": 78, "loyalty": 92, "compass": {"economic": 0.2, "social": 1.8, "ideoScore": 3.9}, "ideo": [0.2, 1.8, 3.9], "bio": "Coordinatore delle missioni umanitarie della onlus Solidarité Identités in Siria e Donbass.", "history": ["Reporter internazionale", "Coordinatore progetti solidali"]},
  {"id": "benedetti_v", "name": "Valerio Benedetti", "age": 43, "gender": "M", "region": "Lazio", "partyId": "cpi", "role": "Direttore Il Primato Nazionale", "pref": "cultura", "competence": 82, "comp": 82, "clout": 81, "skill": 81, "prestige": 81, "loyalty": 94, "compass": {"economic": 0.4, "social": 2.0, "ideoScore": 3.9}, "ideo": [0.4, 2.0, 3.9], "bio": "Giornalista, saggista e direttore del mensile sovranista 'Il Primato Nazionale'.", "history": ["Direttore Il Primato Nazionale", "Saggista"]},
  {"id": "fiore_p", "name": "Roberto Fiore", "age": 67, "gender": "M", "region": "Lazio", "partyId": "fnv", "role": "Segretario Nazionale", "pref": "esteri", "competence": 82, "comp": 82, "clout": 91, "skill": 91, "prestige": 91, "loyalty": 98, "compass": {"economic": 0.6, "social": 2.0, "ideoScore": 4.0}, "ideo": [0.6, 2.0, 4.0], "bio": "Segretario Nazionale di Forza Nuova, presidente dell'Alliance for Peace and Freedom europea.", "history": ["Europarlamentare (2008-2009)", "Segretario FN dal 1997"]},
  {"id": "castellino", "name": "Giuliano Castellino", "age": 49, "gender": "M", "region": "Lazio", "partyId": "fnv", "role": "Capocorrente Piazza e Mobilitazione", "pref": "piazza", "competence": 78, "comp": 78, "clout": 83, "skill": 83, "prestige": 83, "loyalty": 85, "compass": {"economic": 0.2, "social": 2.0, "ideoScore": 4.0}, "ideo": [0.2, 2.0, 4.0], "bio": "Protagonista delle proteste di piazza a Roma contro i decreti governativi.", "history": ["Leader romano", "Animatore comitati d'azione"]},
  {"id": "castellini_l", "name": "Luca Castellini", "age": 49, "gender": "M", "region": "Veneto", "partyId": "fnv", "role": "Vicesegretario / Responsabile Nord", "pref": "territorio", "competence": 79, "comp": 79, "clout": 82, "skill": 82, "prestige": 82, "loyalty": 94, "compass": {"economic": 0.7, "social": 2.0, "ideoScore": 4.0}, "ideo": [0.7, 2.0, 4.0], "bio": "Coordinatore dell'area veneta e della curva dell'Hellas Verona, figura di spicco a Verona.", "history": ["Coordinatore FN Nord Italia", "Portavoce identitario"]},
  {"id": "morsello_e", "name": "Massimo Morsello (Erede)", "age": 45, "gender": "M", "region": "Lazio", "partyId": "fnv", "role": "Responsabile Cultura Tradizionale", "pref": "cultura", "competence": 77, "comp": 77, "clout": 75, "skill": 75, "prestige": 75, "loyalty": 92, "compass": {"economic": 0.4, "social": 2.0, "ideoScore": 3.9}, "ideo": [0.4, 2.0, 3.9], "bio": "Custode della memoria musicale e comunitaria del cofondatore di Forza Nuova.", "history": ["Curatore archivio storico", "Militante"]},
  {"id": "ferrante_s", "name": "Salvatore Ferrante", "age": 52, "gender": "M", "region": "Sicilia", "partyId": "fnv", "role": "Responsabile Mezzogiorno", "pref": "agricoltura", "competence": 76, "comp": 76, "clout": 74, "skill": 74, "prestige": 74, "loyalty": 91, "compass": {"economic": 0.5, "social": 2.0, "ideoScore": 3.9}, "ideo": [0.5, 2.0, 3.9], "bio": "Coordinatore delle federazioni siciliane e calabresi contro lo spopolamento delle campagne.", "history": ["Coordinatore regionale", "Delegato agrario"]},
  {"id": "saija", "name": "Stefano Saija", "age": 48, "gender": "M", "region": "Liguria", "partyId": "fnv", "role": "Responsabile Legale e Ordine", "pref": "giustizia", "competence": 78, "comp": 78, "clout": 73, "skill": 73, "prestige": 73, "loyalty": 90, "compass": {"economic": 0.6, "social": 2.0, "ideoScore": 4.0}, "ideo": [0.6, 2.0, 4.0], "bio": "Avvocato, consulente per le tutele legali dei militanti nazionalisti.", "history": ["Avvocato foro Genova", "Membro direttivo"]},
  {"id": "cortese_l", "name": "Luigi Cortese", "age": 47, "gender": "M", "region": "Lombardia", "partyId": "fnv", "role": "Coordinatore Lombardia / Comunicazione", "pref": "comunicazioni", "competence": 79, "comp": 79, "clout": 78, "skill": 78, "prestige": 78, "loyalty": 93, "compass": {"economic": 0.6, "social": 2.0, "ideoScore": 4.0}, "ideo": [0.6, 2.0, 4.0], "bio": "Coordinatore di Forza Nuova a Milano e in Lombardia, responsabile delle campagne identitarie.", "history": ["Coordinatore regionale Lombardia", "Portavoce cittadino"]},
  {"id": "adinolfi_p", "name": "Mario Adinolfi", "age": 55, "gender": "M", "region": "Lazio", "partyId": "pdf", "role": "Presidente Nazionale", "pref": "famiglia", "competence": 83, "comp": 83, "clout": 90, "skill": 90, "prestige": 90, "loyalty": 98, "compass": {"economic": 0.7, "social": 1.8, "ideoScore": 3.5}, "ideo": [0.7, 1.8, 3.5], "bio": "Presidente del Popolo della Famiglia, giornalista, scrittore ed ex deputato.", "history": ["Deputato (2012-2013)", "Direttore La Croce", "Presidente PdF dal 2016"]},
  {"id": "amato_g", "name": "Gianfranco Amato", "age": 64, "gender": "M", "region": "Lombardia", "partyId": "pdf", "role": "Segretario Nazionale / Giurista", "pref": "giustizia", "competence": 85, "comp": 85, "clout": 84, "skill": 84, "prestige": 84, "loyalty": 96, "compass": {"economic": 0.8, "social": 1.9, "ideoScore": 3.6}, "ideo": [0.8, 1.9, 3.6], "bio": "Avvocato, presidente di Giuristi per la Vita, difensore della libertà d'educazione.", "history": ["Presidente Giuristi per la Vita", "Segretario PdF"]},
  {"id": "dimatteo_n", "name": "Nicola Di Matteo", "age": 68, "gender": "M", "region": "Emilia-Romagna", "partyId": "pdf", "role": "Vicepresidente Nazionale", "pref": "impresa", "competence": 81, "comp": 81, "clout": 79, "skill": 79, "prestige": 79, "loyalty": 94, "compass": {"economic": 1.1, "social": 1.7, "ideoScore": 3.4}, "ideo": [1.1, 1.7, 3.4], "bio": "Imprenditore, coordinatore delle attività del movimento a Bologna e al Nord.", "history": ["Imprenditore metalmeccanico", "Vicepresidente nazionale"]},
  {"id": "decarli_m", "name": "Mirko De Carli", "age": 42, "gender": "M", "region": "Emilia-Romagna", "partyId": "pdf", "role": "Coordinatore Nord Italia", "pref": "agricoltura", "competence": 80, "comp": 80, "clout": 81, "skill": 81, "prestige": 81, "loyalty": 95, "compass": {"economic": 0.9, "social": 1.8, "ideoScore": 3.5}, "ideo": [0.9, 1.8, 3.5], "bio": "Consigliere comunale a Riolo Terme, volto giovane e televisivo del Popolo della Famiglia.", "history": ["Consigliere comunale", "Coordinatore macroarea Nord"]},
  {"id": "fusi_e", "name": "Emanuele Fusi", "age": 46, "gender": "M", "region": "Lombardia", "partyId": "pdf", "role": "Responsabile Economia Sociale", "pref": "mef", "competence": 78, "comp": 78, "clout": 75, "skill": 75, "prestige": 75, "loyalty": 92, "compass": {"economic": 0.9, "social": 1.7, "ideoScore": 3.4}, "ideo": [0.9, 1.7, 3.4], "bio": "Consulente finanziario, estensore del 'Reddito di Maternità' a sostegno delle famiglie numerose.", "history": ["Consulente patrimoniale", "Ufficio economico PdF"]},
  {"id": "boddi_mv", "name": "Maria Verita Boddi", "age": 50, "gender": "F", "region": "Toscana", "partyId": "pdf", "role": "Responsabile Vita e Maternità", "pref": "sanita", "competence": 80, "comp": 80, "clout": 77, "skill": 77, "prestige": 77, "loyalty": 93, "compass": {"economic": 0.6, "social": 1.9, "ideoScore": 3.6}, "ideo": [0.6, 1.9, 3.6], "bio": "Medico pediatra, attiva nella tutela della vita nascente e degli asili nido gratuiti.", "history": ["Medico ospedaliero", "Coordinatrice regionale Toscana"]},
  {"id": "fiorin_m", "name": "Massimiliano Fiorin", "age": 58, "gender": "M", "region": "Veneto", "partyId": "pdf", "role": "Responsabile Bioetica e Famiglia", "pref": "affari_sociali", "competence": 79, "comp": 79, "clout": 76, "skill": 76, "prestige": 76, "loyalty": 92, "compass": {"economic": 0.8, "social": 1.8, "ideoScore": 3.5}, "ideo": [0.8, 1.8, 3.5], "bio": "Avvocato e saggista, autore di studi sulla difesa della genitorialità naturale e tutela dei minori.", "history": ["Avvocato foro Venezia", "Delegato bioetica PdF"]},
  {"id": "draghi_p", "name": "Mario Draghi", "age": 79, "gender": "M", "region": "Lazio", "partyId": "tech", "role": "Premier Tecnico Emerito / Ex Governatore BCE", "pref": "governo", "competence": 98, "comp": 98, "clout": 97, "skill": 97, "prestige": 97, "loyalty": 95, "compass": {"economic": 1.3, "social": -0.5, "ideoScore": 2.2}, "ideo": [1.3, -0.5, 2.2], "bio": "Economista e banchiere centrale, 'Whatever it takes', già Premier di Unità Nazionale.", "history": ["Governatore Bankitalia (2006-2011)", "Presidente BCE (2011-2019)", "Premier (2021-2022)"]},
  {"id": "panetta_p", "name": "Fabio Panetta", "age": 67, "gender": "M", "region": "Lazio", "partyId": "tech", "role": "Governatore Banca d'Italia", "pref": "mef", "competence": 95, "comp": 95, "clout": 90, "skill": 90, "prestige": 90, "loyalty": 96, "compass": {"economic": 1.2, "social": -0.2, "ideoScore": 2.3}, "ideo": [1.2, -0.2, 2.3], "bio": "Governatore della Banca d'Italia ed ex membro del Comitato Esecutivo BCE.", "history": ["Direttore Generale Bankitalia", "Membro Esecutivo BCE (2020-2023)", "Governatore dal 2023"]},
  {"id": "cartabia_p", "name": "Marta Cartabia", "age": 63, "gender": "F", "region": "Lombardia", "partyId": "tech", "role": "Presidente Emerita Corte Costituzionale", "pref": "giustizia", "competence": 96, "comp": 96, "clout": 88, "skill": 88, "prestige": 88, "loyalty": 98, "compass": {"economic": 0.9, "social": -0.6, "ideoScore": 2.0}, "ideo": [0.9, -0.6, 2.0], "bio": "Prima donna Presidente della Corte Costituzionale, già Ministro della Giustizia.", "history": ["Presidente Corte Costituzionale (2019-2020)", "Ministro Giustizia (2021-2022)"]},
  {"id": "cottarelli_p", "name": "Carlo Cottarelli", "age": 72, "gender": "M", "region": "Lombardia", "partyId": "tech", "role": "Economista / Taglio Spesa Pubblica", "pref": "mef", "competence": 94, "comp": 94, "clout": 87, "skill": 87, "prestige": 87, "loyalty": 95, "compass": {"economic": 1.6, "social": -0.4, "ideoScore": 2.4}, "ideo": [1.6, -0.4, 2.4], "bio": "Economista, già Direttore FMI e Commissario Straordinario alla Spending Review.", "history": ["Direttore FMI (2008-2013)", "Commissario Spending Review (2013-2014)", "Senatore (2022-2023)"]},
  {"id": "franco_p", "name": "Daniele Franco", "age": 73, "gender": "M", "region": "Veneto", "partyId": "tech", "role": "Ex Ministro Economia / Ragioniere Generale", "pref": "mef", "competence": 95, "comp": 95, "clout": 86, "skill": 86, "prestige": 86, "loyalty": 97, "compass": {"economic": 1.4, "social": -0.3, "ideoScore": 2.3}, "ideo": [1.4, -0.3, 2.3], "bio": "Già Ministro dell'Economia nel Governo Draghi e Ragioniere Generale dello Stato.", "history": ["Ragioniere Generale Stato (2013-2019)", "Direttore Generale Bankitalia", "Ministro MEF (2021-2022)"]},
  {"id": "piantedosi", "name": "Matteo Piantedosi", "age": 63, "gender": "M", "region": "Campania", "partyId": "tech", "role": "Prefetto / Ministro dell'Interno", "pref": "interni", "competence": 91, "comp": 91, "clout": 88, "skill": 88, "prestige": 88, "loyalty": 96, "compass": {"economic": 1.0, "social": 0.9, "ideoScore": 2.8}, "ideo": [1.0, 0.9, 2.8], "bio": "Prefetto di Roma e Bologna, già Capo di Gabinetto al Viminale, Ministro dell'Interno.", "history": ["Prefetto di Bologna e Roma", "Capo Gabinetto Viminale", "Ministro Interno dal 2022"]},
  {"id": "schillaci", "name": "Orazio Schillaci", "age": 60, "gender": "M", "region": "Lazio", "partyId": "tech", "role": "Medico / Ministro della Salute", "pref": "salute", "competence": 89, "comp": 89, "clout": 82, "skill": 82, "prestige": 82, "loyalty": 95, "compass": {"economic": 0.9, "social": 0.4, "ideoScore": 2.5}, "ideo": [0.9, 0.4, 2.5], "bio": "Medico nucleare, già Rettore dell'Università Tor Vergata, Ministro della Salute.", "history": ["Rettore Università Roma Tor Vergata", "Ministro della Salute dal 2022"]},
  {"id": "calderone", "name": "Marina Calderone", "age": 61, "gender": "F", "region": "Sardegna", "partyId": "tech", "role": "Consulente / Ministro del Lavoro", "pref": "lavoro", "competence": 88, "comp": 88, "clout": 83, "skill": 83, "prestige": 83, "loyalty": 94, "compass": {"economic": 1.1, "social": 0.6, "ideoScore": 2.6}, "ideo": [1.1, 0.6, 2.6], "bio": "Presidente Nazionale dell'Ordine dei Consulenti del Lavoro, Ministro del Lavoro.", "history": ["Presidente Consiglio Nazionale Consulenti Lavoro", "Ministro Lavoro dal 2022"]},
  {"id": "giuli_p", "name": "Alessandro Giuli", "age": 51, "gender": "M", "region": "Lazio", "partyId": "tech", "role": "Giornalista / Ministro della Cultura", "pref": "cultura", "competence": 85, "comp": 85, "clout": 84, "skill": 84, "prestige": 84, "loyalty": 94, "compass": {"economic": 0.9, "social": 1.2, "ideoScore": 3.2}, "ideo": [0.9, 1.2, 3.2], "bio": "Giornalista, saggista, già Presidente della Fondazione MAXXI e Ministro della Cultura.", "history": ["Presidente Fondazione MAXXI (2022-2024)", "Ministro Cultura dal 2024"]},
  {"id": "signorini_p", "name": "Luigi Federico Signorini", "age": 71, "gender": "M", "region": "Toscana", "partyId": "tech", "role": "Presidente IVASS / Finanza Pubblica", "pref": "mef", "competence": 92, "comp": 92, "clout": 82, "skill": 82, "prestige": 82, "loyalty": 96, "compass": {"economic": 1.5, "social": -0.3, "ideoScore": 2.3}, "ideo": [1.5, -0.3, 2.3], "bio": "Direttore Generale della Banca d'Italia e Presidente dell'Istituto di Vigilanza sulle Assicurazioni.", "history": ["Vicedirettore Generale Bankitalia", "Presidente IVASS"]},
  {"id": "cantone_p", "name": "Raffaele Cantone", "age": 63, "gender": "M", "region": "Campania", "partyId": "tech", "role": "Magistrato / Ex Presidente ANAC", "pref": "giustizia", "competence": 94, "comp": 94, "clout": 88, "skill": 88, "prestige": 88, "loyalty": 97, "compass": {"economic": 0.8, "social": -0.7, "ideoScore": 1.8}, "ideo": [0.8, -0.7, 1.8], "bio": "Procuratore della Repubblica a Perugia, già Presidente dell'Autorità Nazionale Anticorruzione.", "history": ["Magistrato DDA Napoli", "Presidente ANAC (2014-2019)", "Procuratore Perugia"]},
  {"id": "cassese_p", "name": "Sabino Cassese", "age": 91, "gender": "M", "region": "Campania", "partyId": "tech", "role": "Giudice Emerito Corte Costituzionale", "pref": "riforme", "competence": 97, "comp": 97, "clout": 89, "skill": 89, "prestige": 89, "loyalty": 99, "compass": {"economic": 1.1, "social": -0.5, "ideoScore": 2.1}, "ideo": [1.1, -0.5, 2.1], "bio": "Decano dei giuristi italiani, accademico dei Lincei e giudice emerito della Consulta.", "history": ["Ministro Funzione Pubblica (1993-1994)", "Giudice Corte Costituzionale (2005-2014)"]},
];

export const FALLBACK_REGIONS = [{"id": "Piemonte", "path": "M52.9,116.8 L54.6,110.8 L52.2,106.1 L56.5,106.9 L61.7,104.5 L68.5,101.3 L74.5,102.9 L79.6,100.8 L83.1,98.9 L82.5,93.4 L80.4,84.8 L86.6,76.6 L91.3,72.5 L92.3,65.5 L96.0,62.0 L99.8,57.7 L103.3,63.7 L103.3,68.5 L108.3,73.0 L113.0,78.4 L107.6,89.9 L110.4,94.9 L111.5,97.2 L111.1,98.6 L111.9,100.5 L112.4,102.3 L115.2,106.5 L117.5,111.1 L113.9,113.8 L108.9,113.1 L105.4,117.1 L105.5,118.1 L106.2,119.3 L106.1,120.8 L106.6,123.0 L110.0,127.9 L112.4,129.0 L114.7,130.5 L115.8,129.4 L119.9,129.4 L124.2,135.9 L129.5,140.2 L131.1,146.8 L129.5,152.3 L124.6,148.7 L122.3,147.5 L120.4,153.1 L116.8,153.6 L114.9,155.8 L110.6,152.1 L108.7,154.3 L103.5,155.0 L99.9,157.4 L93.9,156.4 L91.4,161.9 L89.7,165.6 L89.0,167.8 L89.1,172.0 L84.9,174.4 L84.2,176.0 L76.4,174.4 L76.5,177.1 L73.2,173.4 L67.7,174.3 L59.9,174.1 L53.1,171.2 L47.6,167.2 L43.7,160.2 L44.8,152.6 L45.8,148.4 L49.4,145.1 L41.8,138.0 L38.9,132.9 L35.0,128.0 L38.8,123.0 L46.0,121.3 L52.5,118.6 Z", "cx": 83, "cy": 117, "lean": "Centro-Destra"}, {"id": "Valle d'Aosta", "path": "M75.6,84.4 L77.5,84.2 L78.4,84.5 L80.4,84.8 L80.9,87.9 L80.5,88.6 L80.5,91.1 L82.5,93.4 L82.2,95.7 L82.3,96.9 L82.6,97.6 L83.2,98.9 L81.8,100.4 L81.9,101.1 L81.5,100.9 L79.8,100.7 L78.4,101.2 L77.1,102.2 L75.6,103.1 L74.8,102.9 L73.8,102.8 L71.8,102.2 L70.5,101.8 L69.2,101.1 L67.6,101.9 L65.5,101.8 L62.7,104.3 L61.8,104.8 L61.2,104.5 L60.0,105.0 L57.8,105.3 L57.2,105.9 L55.6,106.9 L53.7,106.4 L53.2,106.8 L52.9,104.9 L51.9,107.2 L49.5,107.0 L49.8,106.0 L48.8,105.9 L47.9,104.9 L47.6,103.6 L47.1,101.6 L47.4,99.3 L46.6,97.9 L44.2,96.9 L42.0,96.1 L40.8,93.6 L40.4,92.1 L40.5,90.9 L41.1,88.7 L42.4,88.9 L43.0,88.3 L43.5,88.2 L45.5,88.1 L48.0,86.1 L49.0,84.5 L51.3,86.7 L52.9,86.9 L53.9,86.9 L55.2,87.5 L56.7,86.0 L57.3,86.0 L58.6,84.7 L60.3,85.0 L62.3,85.7 L64.2,84.5 L65.7,83.6 L67.2,82.5 L68.3,82.0 L69.7,81.2 L70.1,82.0 L71.5,82.0 L73.1,81.9 L74.6,83.0 L75.0,84.4 Z", "cx": 61, "cy": 94, "lean": "Centro"}, {"id": "Liguria", "path": "M68.7,186.7 L73.0,179.8 L76.5,177.1 L75.4,174.9 L82.5,175.9 L85.8,176.2 L85.0,174.6 L88.3,174.0 L88.2,170.0 L88.8,167.3 L89.4,166.1 L91.1,163.9 L92.5,161.3 L93.8,156.3 L99.0,157.2 L100.9,155.8 L106.3,155.6 L108.7,154.3 L109.2,151.9 L113.2,152.4 L115.7,156.2 L116.8,153.7 L119.4,153.6 L119.9,150.0 L123.2,148.0 L124.5,148.5 L127.6,151.6 L132.1,150.2 L134.4,151.1 L137.1,151.9 L139.5,151.5 L141.5,152.9 L142.4,156.9 L140.7,160.2 L146.2,159.3 L150.3,162.9 L154.4,167.0 L156.0,169.5 L157.3,170.9 L157.9,172.9 L160.8,175.0 L163.3,175.7 L160.9,179.2 L156.9,177.2 L155.0,177.3 L152.9,177.4 L148.1,174.0 L145.9,172.6 L143.2,170.6 L140.7,169.2 L138.8,168.5 L136.9,166.1 L135.6,165.6 L132.1,164.3 L130.3,165.8 L126.9,162.6 L120.8,161.1 L117.9,160.2 L114.5,159.9 L111.7,161.3 L107.7,163.2 L104.4,165.2 L102.9,166.7 L102.4,169.4 L100.8,172.2 L95.7,174.6 L94.2,177.9 L92.2,181.0 L91.9,183.8 L88.7,186.5 L84.1,188.9 L79.6,190.3 L77.8,190.4 L74.3,191.5 L69.1,192.0 L66.7,189.1 Z M116.0,160.4 L115.8,160.6 L114.8,160.4 L115.5,160.5 L115.8,160.6 L115.8,160.5 L115.9,160.4 L116.1,160.2 L116.2,160.1 L116.4,160.1 L116.3,160.1 L116.2,160.1 L116.1,160.2 Z", "cx": 115, "cy": 170, "lean": "Centro-Destra"}, {"id": "Lombardia", "path": "M107.6,93.0 L113.3,79.1 L116.4,75.5 L117.8,81.8 L120.9,88.9 L125.0,88.4 L123.9,82.4 L127.4,74.0 L134.2,65.6 L134.0,57.2 L140.7,55.1 L144.2,65.1 L152.3,63.2 L160.4,62.4 L166.8,69.0 L167.3,61.1 L163.2,55.8 L166.8,49.7 L174.5,53.1 L181.6,55.6 L181.9,62.6 L183.2,68.6 L181.7,75.6 L179.6,82.0 L180.5,87.2 L183.7,90.8 L190.3,88.7 L192.0,90.9 L186.4,109.8 L188.6,114.3 L192.2,116.0 L199.3,123.0 L201.1,125.3 L206.5,126.6 L209.6,128.5 L213.7,132.1 L209.1,133.6 L198.7,133.7 L193.3,134.4 L188.4,132.2 L184.9,134.7 L178.1,133.9 L174.6,132.5 L169.5,129.2 L163.3,128.0 L160.9,124.2 L158.5,124.1 L157.1,127.2 L154.5,128.2 L151.7,127.1 L147.7,125.9 L145.8,125.7 L143.2,126.4 L137.6,129.6 L134.4,134.3 L136.7,140.6 L135.3,146.7 L130.1,142.5 L125.9,139.2 L120.2,131.2 L115.8,129.1 L114.7,130.6 L112.2,129.3 L109.4,126.5 L106.3,121.7 L105.5,119.7 L106.7,118.8 L105.9,117.0 L108.0,113.2 L114.5,113.0 L116.9,109.1 L113.1,105.5 L112.1,101.4 L110.7,98.9 L111.1,97.4 L110.5,95.1 Z", "cx": 159, "cy": 98, "lean": "Destra"}, {"id": "Trentino-Alto Adige", "path": "M237.8,52.7 L235.3,53.3 L232.1,54.3 L233.0,58.2 L230.6,61.8 L230.1,63.8 L233.0,66.7 L234.0,67.8 L234.5,69.7 L234.9,71.7 L230.4,75.1 L225.7,75.8 L224.6,78.7 L225.3,82.1 L221.8,82.0 L217.9,80.1 L213.4,83.4 L212.6,84.7 L210.7,84.2 L209.0,86.0 L208.4,87.8 L206.6,89.7 L206.2,91.2 L205.2,94.7 L203.9,95.9 L198.2,96.4 L196.3,96.6 L195.2,94.9 L195.0,92.0 L193.9,89.2 L190.6,88.5 L188.4,88.8 L183.5,91.0 L180.5,89.0 L180.0,86.3 L179.9,83.4 L178.8,80.1 L180.0,77.2 L182.6,72.5 L183.2,68.6 L181.2,63.2 L182.0,62.6 L184.8,58.1 L179.3,55.2 L179.9,51.0 L177.8,48.3 L176.1,45.8 L178.2,42.5 L179.6,37.2 L184.9,37.0 L190.4,39.0 L191.1,40.4 L193.4,41.3 L196.4,41.4 L199.9,41.6 L202.7,36.2 L206.0,32.0 L211.4,30.5 L216.2,30.9 L219.3,30.3 L221.4,30.0 L227.7,31.7 L234.7,28.2 L238.5,27.4 L241.4,26.2 L245.5,27.1 L242.8,28.9 L243.6,33.5 L245.8,36.2 L248.3,37.4 L249.6,41.1 L255.3,45.9 L251.6,48.4 L247.2,48.8 L244.6,50.0 L240.2,46.5 L239.0,51.1 Z", "cx": 215, "cy": 61, "lean": "Centro"}, {"id": "Veneto", "path": "M185.5,103.9 L193.3,89.0 L194.1,93.4 L196.1,96.1 L198.4,96.4 L204.5,95.7 L206.0,91.2 L206.7,89.7 L209.0,86.4 L210.8,84.2 L212.7,84.4 L216.4,81.4 L222.3,82.0 L225.2,79.2 L225.5,75.7 L231.5,74.8 L235.8,70.5 L234.0,67.8 L232.4,66.6 L230.3,61.6 L232.8,57.0 L234.1,53.7 L237.7,52.9 L239.9,46.6 L244.5,50.5 L250.1,48.7 L255.5,46.4 L261.2,47.3 L264.0,49.3 L261.2,54.9 L257.2,57.5 L253.5,62.8 L251.1,68.9 L254.0,70.6 L253.4,76.8 L253.0,79.5 L256.3,84.3 L258.0,87.5 L259.5,89.8 L261.9,90.5 L264.5,89.2 L267.9,89.6 L272.3,89.3 L274.3,89.4 L274.5,89.8 L275.2,93.2 L275.7,94.4 L276.9,95.9 L277.6,96.8 L278.1,97.7 L274.7,99.4 L263.5,104.8 L251.4,110.4 L249.0,119.4 L251.7,128.0 L256.5,134.9 L250.2,138.5 L247.7,133.8 L243.4,134.0 L237.5,132.0 L231.1,132.3 L227.4,133.3 L225.8,135.0 L221.5,135.3 L218.4,134.1 L215.5,133.0 L210.3,130.2 L209.4,128.1 L206.5,126.7 L203.2,125.2 L200.7,123.4 L197.3,120.5 L189.6,116.3 L188.4,114.8 L188.7,110.9 L185.7,106.7 Z", "cx": 231, "cy": 92, "lean": "Destra"}, {"id": "Friuli-Venezia Giulia", "path": "M294.8,61.2 L292.1,63.8 L290.0,66.6 L292.0,69.2 L296.6,70.7 L299.6,71.0 L299.2,73.7 L294.2,77.4 L293.9,81.1 L296.6,82.1 L298.2,85.6 L297.3,87.5 L298.8,90.7 L303.8,92.8 L306.4,94.9 L307.7,97.3 L307.5,101.1 L302.9,100.2 L305.8,100.0 L303.7,98.8 L303.0,95.9 L301.4,94.4 L296.3,91.5 L295.5,90.5 L295.9,91.4 L295.2,93.8 L293.0,95.3 L288.8,96.5 L283.5,95.0 L280.8,96.1 L278.4,97.9 L277.7,97.9 L277.5,97.4 L276.8,96.3 L276.9,95.9 L276.1,93.8 L275.5,94.4 L275.6,93.5 L274.8,90.8 L274.4,89.8 L274.7,89.7 L274.2,89.4 L273.3,89.0 L271.4,89.2 L268.3,89.1 L266.5,88.0 L264.5,89.2 L262.3,91.0 L261.8,89.6 L259.8,89.8 L258.6,89.0 L258.0,87.5 L256.8,85.4 L255.6,84.3 L253.4,81.3 L252.4,78.4 L253.4,76.9 L255.9,74.3 L254.1,70.1 L252.6,69.1 L249.5,66.7 L253.1,62.7 L256.1,59.6 L257.3,57.3 L262.1,57.0 L260.9,52.7 L264.1,49.7 L265.5,48.3 L268.9,49.7 L276.2,50.4 L284.0,52.3 L290.5,51.7 L294.7,52.9 L297.8,53.0 L301.9,56.4 L295.4,61.1 Z", "cx": 278, "cy": 74, "lean": "Destra"}, {"id": "Emilia-Romagna", "path": "M136.2,144.3 L135.4,137.2 L135.7,133.8 L137.6,128.5 L142.7,125.8 L144.6,124.5 L147.7,124.6 L149.7,127.5 L152.0,125.2 L155.2,127.5 L157.4,127.0 L158.4,124.0 L160.2,124.5 L162.3,126.9 L167.1,129.1 L171.5,130.7 L175.7,132.3 L178.9,134.0 L184.9,134.7 L188.1,132.7 L189.8,133.6 L195.1,135.3 L203.0,133.1 L213.1,133.2 L219.1,134.1 L221.6,135.7 L227.0,134.7 L229.0,132.8 L234.6,132.2 L241.5,132.9 L245.8,134.8 L248.4,138.0 L249.6,141.6 L247.0,140.3 L247.8,150.9 L249.8,163.9 L253.5,172.2 L263.7,182.3 L264.9,186.8 L261.1,190.4 L258.5,188.0 L255.9,185.5 L252.6,184.2 L253.6,187.7 L248.0,192.0 L246.1,193.5 L239.6,193.9 L234.0,191.2 L227.0,188.1 L225.2,183.3 L227.8,175.4 L221.5,175.7 L220.3,173.0 L216.6,170.6 L211.6,172.2 L206.9,173.7 L205.2,175.7 L199.8,176.1 L197.3,177.2 L194.2,176.3 L190.8,174.6 L185.0,174.2 L179.8,170.1 L171.5,167.7 L167.5,164.0 L162.2,161.9 L158.4,157.6 L153.3,159.7 L149.7,162.8 L144.4,159.8 L141.6,157.0 L141.5,152.9 L138.5,151.7 L134.9,150.7 L132.1,150.2 L132.4,146.1 L135.8,145.0 Z", "cx": 198, "cy": 158, "lean": "Centro-Sinistra"}, {"id": "Marche", "path": "M256.2,205.6 L252.2,206.1 L250.0,205.4 L251.0,201.8 L250.6,201.0 L248.6,202.2 L247.2,202.1 L244.4,199.8 L246.8,197.8 L248.8,195.8 L248.8,195.1 L250.0,197.6 L250.4,196.0 L250.9,195.5 L248.1,192.9 L250.3,191.4 L252.6,187.7 L255.1,186.6 L256.6,187.4 L258.5,188.0 L260.0,188.9 L261.1,190.4 L263.4,188.8 L264.7,187.4 L265.0,184.9 L267.7,183.2 L274.4,188.0 L279.7,192.3 L284.0,196.0 L289.1,199.2 L291.1,200.5 L293.9,200.4 L294.5,200.2 L297.0,203.1 L298.9,204.7 L299.9,208.8 L302.5,215.6 L304.8,220.2 L306.0,223.3 L307.4,228.4 L309.3,235.6 L308.3,237.4 L306.0,238.1 L303.3,239.0 L301.6,240.8 L298.9,241.3 L297.7,241.6 L295.2,242.1 L291.9,245.5 L290.4,247.3 L287.2,245.7 L285.2,244.9 L282.3,245.1 L282.5,244.0 L283.4,243.3 L285.2,241.4 L284.4,238.9 L281.0,240.1 L276.8,236.1 L274.2,237.3 L274.1,235.4 L272.5,234.1 L271.7,232.5 L271.1,230.9 L271.2,227.9 L270.6,225.6 L269.2,225.6 L269.6,224.0 L269.0,220.7 L268.1,218.2 L267.7,216.4 L266.6,214.2 L265.9,212.9 L266.3,210.3 L265.9,208.6 L264.2,209.9 L260.9,210.4 L257.1,206.6 Z", "cx": 276, "cy": 215, "lean": "Centro-Destra"}, {"id": "Toscana", "path": "M157.6,173.1 L156.2,172.1 L155.9,167.9 L151.1,164.5 L152.1,161.3 L154.6,157.9 L161.5,159.0 L165.1,163.9 L169.7,166.0 L174.7,167.8 L181.2,172.9 L186.9,173.6 L191.5,174.9 L195.3,176.7 L199.2,174.8 L200.5,176.5 L205.8,175.9 L207.1,173.7 L211.2,172.6 L215.3,169.3 L220.3,173.3 L221.7,175.1 L227.0,175.2 L224.0,182.4 L226.4,186.5 L231.4,191.0 L235.5,192.6 L243.5,193.4 L246.9,193.8 L250.8,196.4 L249.2,196.1 L246.5,197.4 L243.6,203.3 L241.1,206.7 L239.5,209.7 L240.2,211.7 L241.5,213.2 L245.6,216.7 L241.9,218.9 L238.3,221.9 L234.4,226.5 L235.4,228.4 L236.4,229.6 L235.4,234.4 L233.2,239.7 L228.5,240.8 L230.0,244.2 L230.0,248.9 L227.7,250.9 L224.6,253.1 L222.3,253.6 L222.3,257.3 L221.9,260.2 L217.1,261.6 L209.9,261.2 L207.4,262.7 L202.8,260.6 L205.5,260.2 L206.5,256.0 L203.3,252.1 L199.9,249.1 L191.8,243.1 L190.7,240.4 L186.7,234.2 L181.2,235.7 L180.5,232.3 L180.8,231.5 L181.6,221.2 L179.0,215.7 L178.0,212.7 L174.5,208.4 L173.3,202.9 L171.8,197.5 L170.5,187.8 L162.5,178.5 L161.2,176.1 L157.9,172.9 Z M171.5,244.7 L170.4,244.5 L169.6,245.4 L165.6,242.2 L170.6,242.5 L170.9,242.1 L171.8,241.2 L171.6,240.6 L172.7,240.9 L174.6,242.0 L176.2,239.7 L177.4,238.9 L177.5,243.2 L176.3,244.0 L177.0,244.7 L177.0,246.1 L174.9,243.9 L173.5,243.9 L173.5,245.0 L172.9,243.9 L172.4,244.7 Z M245.8,190.9 L246.0,191.0 L246.1,191.1 L246.3,192.1 L246.0,192.1 L244.8,192.9 L244.3,192.4 L244.0,192.1 L243.9,192.0 L243.7,191.1 L243.7,191.0 L243.9,190.9 L244.0,190.9 L244.2,191.1 L244.8,191.1 L245.2,191.2 L245.4,191.3 L245.5,191.3 L245.6,191.2 Z M164.5,251.0 L164.8,251.2 L164.7,251.9 L165.3,253.1 L164.8,253.6 L163.6,253.3 L163.3,253.2 L163.2,252.9 L163.2,252.7 L163.7,252.6 L163.8,252.6 L164.2,252.5 L164.3,252.3 L164.5,251.9 L164.6,251.6 L164.4,251.1 L164.5,251.0 Z M195.1,262.6 L195.9,263.3 L196.2,263.6 L196.4,264.5 L196.8,265.1 L196.7,265.6 L196.4,266.2 L195.4,265.4 L195.0,264.7 L194.8,264.4 L194.3,264.3 L194.4,263.7 L194.6,263.8 L194.8,263.7 L194.9,263.6 L194.8,262.7 L194.8,262.6 L195.0,262.6 L195.0,262.5 Z M203.5,268.9 L203.7,269.2 L203.8,269.3 L203.8,269.4 L203.8,269.5 L203.7,269.4 L203.5,269.3 L203.4,269.4 L203.2,269.7 L203.3,269.8 L203.4,269.8 L203.6,269.9 L203.6,270.0 L203.6,270.1 L203.5,270.2 L203.1,270.0 L202.9,269.5 L203.2,269.2 L203.3,269.2 L203.5,269.0 Z M154.8,228.1 L155.0,228.2 L155.2,229.0 L155.6,229.2 L155.6,229.6 L155.5,230.1 L155.2,230.5 L154.7,230.9 L154.5,231.3 L154.5,231.4 L154.3,231.6 L153.6,230.7 L153.7,230.5 L153.8,230.2 L153.9,229.6 L154.3,228.7 L154.5,228.4 L154.6,228.4 L154.7,228.3 L154.8,228.2 L154.8,228.1 Z M157.7,209.6 L158.0,209.8 L158.0,209.9 L157.9,210.3 L157.9,210.4 L157.7,210.6 L157.5,210.6 L157.3,210.4 L157.2,210.4 L157.2,210.3 L157.2,210.2 L157.3,210.2 L157.3,209.9 L157.4,209.8 L157.5,209.8 L157.6,209.8 L157.7,209.8 L157.7,209.7 L157.7,209.6 Z M173.3,264.5 L173.4,264.5 L173.8,264.9 L173.9,265.2 L173.9,265.3 L174.0,265.8 L174.0,266.0 L173.8,266.1 L173.7,266.1 L173.5,266.2 L173.5,266.3 L173.1,266.3 L172.7,266.3 L172.6,266.2 L172.5,266.1 L172.5,266.0 L172.4,265.9 L172.4,265.8 L172.5,265.1 L172.5,265.0 L172.6,264.8 L172.6,264.7 L172.8,264.6 L172.8,264.5 L172.9,264.5 L173.0,264.5 L173.0,264.6 L173.1,264.6 L173.3,264.5 Z", "cx": 200, "cy": 210, "lean": "Centro-Sinistra"}, {"id": "Umbria", "path": "M281.2,249.2 L278.5,250.2 L275.7,250.7 L272.2,251.7 L270.5,253.9 L266.7,255.4 L264.8,258.0 L262.3,259.9 L260.5,258.8 L259.1,262.6 L256.6,261.9 L254.6,262.2 L254.5,260.7 L253.0,260.5 L253.2,259.1 L253.3,257.8 L249.5,257.3 L247.8,256.6 L247.8,254.5 L246.5,252.1 L245.9,249.8 L242.0,249.4 L238.5,249.7 L235.1,247.0 L235.8,243.4 L233.6,239.5 L234.9,236.7 L235.3,233.3 L236.2,230.4 L236.6,229.3 L235.4,228.4 L234.8,228.9 L234.2,225.2 L237.1,222.7 L238.9,219.1 L241.7,219.0 L243.6,218.2 L244.6,216.0 L242.1,214.0 L241.0,213.0 L240.1,212.0 L239.7,211.5 L239.5,209.7 L241.4,208.5 L240.8,206.5 L242.8,205.0 L246.0,201.9 L248.3,202.2 L250.6,201.0 L251.3,202.2 L250.6,205.3 L253.3,204.8 L257.0,206.5 L260.9,210.5 L264.7,208.9 L266.5,209.2 L265.9,211.8 L266.5,213.7 L267.7,216.3 L268.1,218.2 L269.0,220.7 L269.5,224.0 L269.8,225.5 L270.8,226.7 L271.6,230.0 L271.6,232.4 L272.5,234.1 L274.2,235.5 L274.6,238.4 L278.9,237.2 L283.5,239.5 L285.1,241.1 L283.4,243.3 L282.7,244.2 L282.3,245.2 L281.7,247.6 Z", "cx": 259, "cy": 231, "lean": "Centro-Sinistra"}, {"id": "Lazio", "path": "M230.1,241.5 L234.5,242.9 L235.3,247.2 L240.1,249.1 L245.7,249.6 L246.4,253.5 L247.7,256.5 L249.6,257.3 L253.5,259.1 L253.0,260.6 L255.0,260.9 L256.1,262.0 L260.6,261.3 L261.8,259.5 L264.4,257.4 L268.4,255.1 L272.2,251.7 L276.4,250.3 L280.5,249.4 L282.1,246.9 L286.1,245.0 L289.3,249.5 L286.8,253.3 L282.4,253.1 L281.0,258.9 L282.1,265.2 L284.0,268.0 L288.3,272.4 L287.2,274.4 L282.6,274.3 L278.5,274.8 L278.6,281.8 L281.6,282.3 L287.5,285.2 L289.1,290.2 L292.4,291.3 L296.7,294.5 L299.2,293.1 L302.8,292.7 L305.8,294.7 L309.9,296.4 L312.6,299.9 L313.2,303.8 L314.1,306.2 L312.3,309.0 L308.4,312.6 L308.3,315.7 L306.9,319.6 L302.0,319.9 L297.5,320.1 L296.1,322.1 L292.5,320.2 L285.5,317.7 L280.3,319.6 L274.1,315.3 L267.5,311.6 L263.0,309.8 L256.0,302.9 L246.2,295.4 L245.0,291.0 L240.2,284.9 L236.0,281.6 L230.4,279.4 L228.3,276.6 L225.5,270.1 L216.4,262.3 L220.4,260.1 L222.8,258.2 L221.4,256.5 L222.6,254.1 L224.6,253.2 L227.3,251.6 L230.0,249.3 L230.4,244.7 L228.3,242.9 L229.9,242.1 Z M274.0,336.6 L273.7,337.8 L273.8,338.4 L273.4,338.8 L273.3,338.2 L273.4,338.0 L273.4,337.9 L273.1,337.9 L273.0,337.6 L273.2,336.8 L273.2,336.7 L273.6,336.6 L273.9,336.5 L273.9,336.3 L274.4,335.9 L274.7,335.9 L275.0,336.0 L274.8,336.2 L274.4,336.3 L274.3,336.3 Z M277.3,334.4 L277.1,334.4 L277.0,334.4 L276.9,334.3 L276.9,334.2 L276.9,334.1 L277.1,334.1 L277.2,334.0 L277.2,333.9 L277.3,334.0 L277.4,334.0 L277.5,334.1 L277.5,334.2 L277.5,334.3 L277.5,334.4 L277.4,334.4 L277.3,334.4 Z", "cx": 265, "cy": 281, "lean": "Destra"}, {"id": "Campania", "path": "M316.4,309.4 L319.7,307.5 L324.1,308.6 L326.0,309.7 L329.8,311.1 L331.6,312.9 L334.8,313.0 L338.3,312.6 L340.3,312.4 L342.3,310.3 L345.1,311.2 L350.3,309.0 L352.9,310.3 L354.5,311.5 L353.7,315.9 L355.8,317.3 L358.8,318.7 L360.7,319.2 L360.1,323.0 L361.9,327.7 L368.2,328.8 L372.6,332.5 L371.0,337.0 L368.9,339.0 L366.2,338.6 L364.6,339.1 L364.2,341.3 L365.6,344.0 L366.2,346.9 L370.1,349.6 L369.2,353.1 L371.0,355.0 L372.3,359.0 L377.8,364.0 L380.0,368.0 L381.1,371.9 L377.6,374.9 L376.1,379.0 L376.6,380.3 L374.7,379.3 L371.4,379.3 L365.6,383.1 L363.3,381.8 L361.1,381.5 L358.7,376.8 L354.4,374.3 L350.7,372.0 L348.7,371.3 L348.9,367.3 L349.9,365.7 L350.9,363.5 L346.0,353.0 L341.4,348.9 L334.8,352.1 L330.5,351.8 L326.2,354.0 L325.3,354.3 L326.9,351.4 L329.6,348.8 L331.2,347.0 L326.2,342.7 L323.3,340.5 L320.9,342.2 L319.6,342.7 L316.4,341.2 L316.1,343.3 L314.8,343.2 L314.8,339.6 L309.4,328.8 L304.1,321.3 L306.7,319.2 L308.3,315.6 L308.3,312.7 L311.6,309.2 L313.3,311.2 L317.1,312.4 Z M311.3,347.4 L311.3,347.7 L310.8,347.4 L310.5,347.6 L310.0,347.8 L309.4,347.7 L309.0,347.9 L308.5,347.8 L307.8,347.0 L307.8,346.6 L307.6,345.7 L307.8,345.8 L308.1,345.2 L307.8,344.9 L308.2,344.7 L308.5,344.8 L309.0,345.1 L310.4,345.4 L311.6,346.6 L311.7,347.2 L311.3,347.4 Z M313.8,344.3 L313.9,344.4 L314.4,344.5 L314.3,344.8 L314.3,344.7 L314.2,344.6 L313.9,344.8 L313.8,345.0 L313.7,345.2 L313.6,345.5 L313.6,345.6 L313.7,345.8 L313.6,345.7 L313.3,345.3 L313.0,345.7 L312.8,345.7 L312.8,345.4 L312.9,345.3 L313.1,345.4 L313.3,345.1 L313.4,344.3 Z M321.8,355.7 L321.2,355.8 L320.7,356.0 L320.6,356.0 L320.6,355.8 L320.6,355.1 L320.6,354.8 L320.7,354.8 L321.1,354.7 L321.3,354.8 L321.4,354.8 L321.8,354.8 L322.1,355.0 L322.3,355.0 L322.7,355.0 L322.8,354.9 L322.9,354.8 L322.9,354.7 L323.0,354.8 L323.1,354.8 L323.2,355.0 L322.9,355.5 L322.7,355.7 L322.4,355.5 L322.3,355.5 L321.9,355.6 L321.8,355.7 Z", "cx": 342, "cy": 345, "lean": "Movimento"}, {"id": "Abruzzo", "path": "M310.8,297.9 L309.9,296.4 L306.4,295.2 L303.5,293.8 L302.8,292.8 L301.0,292.1 L298.8,293.3 L297.0,294.5 L294.8,293.2 L292.3,291.1 L289.5,291.4 L289.7,287.2 L287.5,285.2 L284.5,283.7 L279.5,281.1 L278.7,281.8 L276.2,277.2 L278.5,273.6 L282.1,274.3 L284.2,275.7 L287.6,274.4 L288.8,273.2 L287.4,270.7 L284.0,268.0 L283.1,265.8 L281.4,263.7 L279.9,259.4 L281.3,255.9 L283.9,253.0 L286.3,253.5 L290.1,252.4 L288.8,248.9 L290.3,247.4 L291.9,245.6 L295.2,242.1 L297.9,241.5 L298.9,241.4 L301.7,240.7 L303.9,238.9 L306.1,238.0 L309.3,237.1 L310.5,239.9 L313.3,247.2 L316.6,252.9 L320.2,257.4 L324.3,261.1 L329.0,264.3 L330.1,266.8 L332.8,269.8 L337.6,272.5 L340.4,275.7 L341.3,278.0 L342.7,280.6 L341.0,281.8 L338.6,284.7 L338.4,285.6 L336.5,287.7 L335.8,289.4 L335.3,290.1 L334.4,291.3 L333.3,292.7 L331.6,294.3 L330.3,294.1 L328.3,288.9 L327.1,288.3 L325.7,288.3 L324.6,287.6 L321.6,288.7 L318.8,290.7 L320.0,293.6 L319.8,294.8 L319.6,294.0 L317.6,295.1 L317.7,295.8 L315.7,295.5 L314.4,297.2 L312.9,297.7 L310.9,297.9 Z", "cx": 309, "cy": 267, "lean": "Destra"}, {"id": "Molise", "path": "M329.0,310.7 L326.3,309.9 L324.8,309.3 L324.1,308.5 L321.2,307.5 L319.1,308.4 L316.3,309.3 L316.5,312.7 L314.0,311.6 L313.4,310.1 L312.1,307.8 L313.0,306.7 L313.3,305.5 L313.2,304.0 L313.5,302.7 L312.6,299.9 L311.1,297.7 L313.3,298.0 L314.6,297.3 L315.6,295.6 L317.6,296.3 L317.4,295.6 L319.2,294.5 L319.7,294.1 L320.4,294.4 L319.8,293.6 L319.8,290.0 L321.6,288.7 L324.5,287.5 L325.4,287.6 L326.8,288.6 L327.9,288.8 L330.3,292.5 L330.4,294.2 L331.9,293.9 L333.3,292.6 L334.5,291.3 L335.3,290.1 L335.8,289.6 L336.2,288.3 L338.0,286.6 L338.3,285.2 L339.2,283.9 L341.4,281.8 L342.7,280.4 L344.4,279.8 L350.8,281.9 L351.3,282.8 L353.5,284.7 L356.1,286.0 L356.0,287.1 L355.0,289.8 L355.4,291.7 L355.4,294.9 L355.4,295.9 L355.6,297.6 L354.9,298.4 L354.5,298.6 L354.2,298.6 L352.9,299.5 L352.1,300.5 L350.6,300.5 L349.1,302.8 L348.7,306.2 L350.4,308.7 L347.8,309.9 L345.2,311.2 L342.9,309.8 L342.3,310.5 L340.8,312.2 L339.5,311.9 L337.9,312.6 L335.5,314.0 L332.5,313.3 L331.4,312.6 L330.4,311.1 Z", "cx": 333, "cy": 296, "lean": "Centro-Destra"}, {"id": "Puglia", "path": "M354.7,312.9 L354.1,310.8 L350.0,306.8 L348.5,301.4 L352.6,300.5 L354.2,298.6 L354.9,298.4 L355.6,296.3 L355.3,292.0 L355.6,289.3 L356.7,286.0 L365.8,287.2 L378.9,286.5 L389.0,284.9 L394.1,286.5 L396.0,293.5 L391.8,296.8 L387.9,299.7 L385.0,302.0 L386.8,308.9 L396.4,314.5 L403.5,317.9 L410.1,321.3 L418.8,325.1 L421.9,325.4 L429.1,328.9 L436.6,333.7 L443.5,339.9 L451.0,343.8 L461.5,348.7 L462.8,349.5 L462.6,350.7 L465.2,351.4 L466.9,355.5 L471.4,359.2 L476.2,363.6 L481.6,370.1 L482.8,374.0 L482.5,381.0 L479.5,387.8 L479.5,392.1 L475.6,391.9 L467.1,387.0 L465.0,383.2 L463.7,380.1 L464.1,376.0 L460.7,370.5 L460.1,369.4 L457.3,368.4 L448.2,368.0 L443.1,366.3 L438.3,364.3 L435.1,358.9 L430.7,356.8 L421.9,362.7 L416.8,359.5 L415.7,355.4 L415.7,347.3 L412.6,345.0 L410.1,345.2 L406.0,346.9 L397.4,338.8 L394.1,336.8 L391.0,336.1 L390.1,332.6 L387.2,327.9 L384.0,325.6 L382.7,326.1 L380.2,328.4 L374.9,327.8 L371.5,329.2 L364.8,328.3 L358.9,324.7 L360.7,319.3 L358.5,318.4 L355.1,316.4 Z", "cx": 415, "cy": 338, "lean": "Centro-Sinistra"}, {"id": "Basilicata", "path": "M368.6,351.1 L369.8,349.5 L366.1,346.9 L365.4,345.0 L365.3,342.1 L363.8,340.9 L364.8,339.1 L365.6,338.9 L367.7,338.8 L368.8,338.8 L371.0,337.2 L371.4,336.0 L372.3,331.1 L371.5,328.9 L373.4,327.7 L378.5,327.8 L380.8,328.1 L382.2,326.7 L382.8,326.3 L383.9,325.7 L386.5,326.9 L387.6,327.9 L389.9,331.4 L389.2,333.9 L389.6,335.4 L393.5,337.8 L394.5,336.5 L397.0,337.5 L398.4,341.0 L403.5,346.1 L408.7,346.0 L410.4,345.9 L411.2,344.9 L413.5,345.8 L416.2,347.0 L415.8,351.3 L415.7,355.4 L416.8,357.6 L417.3,359.6 L421.0,362.5 L418.5,368.2 L415.0,375.4 L410.2,376.5 L407.6,376.8 L404.7,376.7 L403.9,380.4 L403.6,383.0 L402.3,385.4 L402.4,387.8 L398.2,386.6 L397.1,386.7 L396.8,388.2 L392.7,387.8 L390.3,387.3 L389.1,385.2 L390.2,383.9 L386.3,383.1 L383.4,383.1 L381.2,384.4 L380.6,384.8 L380.2,385.3 L379.4,386.4 L376.6,382.3 L376.2,380.5 L375.7,379.1 L376.9,378.5 L377.5,375.1 L379.0,372.8 L380.9,370.7 L379.7,367.9 L377.7,365.7 L374.8,361.6 L371.7,358.6 L371.4,355.7 L369.9,353.5 L368.1,352.2 Z", "cx": 392, "cy": 356, "lean": "Movimento"}, {"id": "Calabria", "path": "M387.9,409.9 L383.8,404.4 L381.6,397.3 L380.5,392.1 L380.9,390.6 L379.9,386.7 L380.3,385.0 L381.1,384.4 L384.3,383.2 L389.1,383.4 L389.8,384.3 L390.0,387.1 L393.4,387.8 L397.2,387.6 L397.9,386.8 L402.2,388.1 L402.4,385.4 L404.0,382.2 L404.5,378.4 L405.9,376.3 L410.3,376.6 L411.8,379.3 L412.7,384.7 L408.1,391.4 L408.1,396.4 L408.9,399.9 L413.0,402.2 L417.5,402.0 L420.2,404.8 L424.6,407.9 L427.9,409.4 L430.2,412.4 L432.7,413.2 L431.0,417.6 L431.4,421.8 L431.0,426.8 L431.8,429.6 L434.2,432.4 L431.0,438.0 L430.2,438.0 L427.8,438.1 L421.7,437.4 L414.7,441.1 L411.7,443.2 L410.1,446.2 L409.1,448.1 L410.4,453.9 L410.7,458.4 L409.4,463.8 L402.2,468.5 L400.6,470.0 L395.5,476.6 L394.3,482.4 L389.4,487.9 L383.2,487.9 L379.6,487.9 L377.3,486.4 L375.1,482.9 L375.6,481.5 L374.9,479.3 L375.0,473.3 L379.0,471.1 L383.6,464.5 L384.9,461.7 L385.0,461.4 L386.2,457.1 L383.7,453.8 L385.5,449.6 L389.5,447.3 L394.7,447.0 L397.3,440.1 L395.7,436.5 L393.6,433.4 L391.5,426.9 L390.9,419.3 L389.1,412.4 Z", "cx": 404, "cy": 432, "lean": "Centro-Destra"}, {"id": "Sicilia", "path": "M271.7,482.6 L277.1,480.3 L277.9,476.4 L281.3,474.9 L284.3,473.8 L287.5,473.6 L288.9,477.1 L295.4,478.3 L295.6,480.6 L301.9,484.6 L308.0,484.3 L313.8,482.0 L318.6,482.6 L325.4,483.3 L329.8,481.9 L334.1,480.9 L337.5,479.9 L342.8,476.3 L349.8,476.1 L354.4,477.8 L358.1,475.6 L359.9,470.5 L360.6,473.3 L371.6,468.7 L373.9,471.1 L372.7,474.2 L367.7,482.8 L364.1,488.2 L362.2,491.0 L361.2,493.1 L358.5,500.3 L356.4,506.9 L354.2,510.3 L357.1,519.7 L359.5,520.7 L359.5,523.4 L358.6,526.2 L360.1,527.0 L360.8,528.8 L361.2,531.4 L362.9,532.6 L361.4,534.0 L357.5,538.1 L355.7,541.2 L355.4,547.4 L355.4,550.7 L352.7,550.1 L347.2,548.0 L342.6,549.2 L341.2,548.4 L335.8,545.9 L331.7,545.1 L329.7,540.5 L325.0,533.2 L314.5,528.9 L307.6,528.2 L302.5,525.6 L298.8,522.5 L294.7,519.7 L291.3,518.6 L287.4,516.0 L283.2,511.0 L280.8,509.2 L275.7,508.7 L272.0,505.2 L265.2,505.5 L258.7,501.0 L255.1,498.3 L254.9,492.9 L254.8,488.8 L256.0,483.1 L261.0,480.4 L263.1,478.4 L264.9,474.4 L266.5,475.4 L270.3,481.7 Z M349.5,457.5 L349.5,457.6 L349.6,459.1 L349.6,459.3 L349.9,459.4 L350.0,459.4 L350.2,459.5 L350.2,459.7 L350.1,459.8 L349.6,459.8 L349.3,459.9 L349.2,460.1 L349.4,460.9 L349.4,461.6 L348.9,461.7 L347.8,460.5 L347.3,458.7 L347.4,458.1 L347.7,457.7 L348.2,457.6 L348.4,457.7 L348.8,457.7 Z M248.9,486.1 L248.9,486.3 L249.0,486.4 L249.6,487.3 L250.5,487.2 L250.5,487.3 L250.5,487.4 L250.7,487.7 L251.3,487.8 L251.3,488.0 L251.2,488.5 L251.1,488.6 L250.6,488.6 L250.0,487.9 L249.4,488.0 L248.1,488.1 L247.9,487.7 L247.8,486.7 L247.9,486.6 L248.1,486.7 L248.1,486.8 L248.9,486.1 Z M235.5,542.4 L236.4,542.9 L236.9,543.3 L237.5,543.2 L238.2,543.7 L238.7,544.2 L238.9,544.3 L239.3,545.4 L239.2,546.7 L238.4,547.5 L237.8,547.7 L237.0,547.5 L236.4,546.7 L236.1,546.1 L235.8,546.0 L235.6,545.6 L235.0,544.8 L234.5,544.1 L234.8,542.7 L235.0,542.8 L235.1,542.7 L235.1,542.6 L235.5,542.4 Z M334.0,454.4 L334.9,454.6 L335.1,455.0 L335.1,455.1 L335.0,455.2 L335.0,455.3 L335.1,455.5 L335.2,455.7 L335.3,455.7 L335.4,455.7 L335.5,455.7 L335.6,455.9 L335.5,455.9 L335.3,456.0 L335.2,455.9 L335.0,455.8 L334.6,455.7 L334.4,455.7 L333.8,455.3 L333.6,454.5 Z M345.2,456.8 L344.2,456.3 L343.5,455.9 L343.3,455.6 L343.2,455.6 L343.2,455.5 L343.4,455.0 L343.9,454.5 L344.9,454.6 L345.1,454.7 L345.2,454.7 L345.5,454.6 L345.9,454.5 L346.0,454.5 L346.1,454.8 L346.1,455.2 L346.0,456.0 L346.0,456.1 L346.0,456.6 L346.0,456.7 L345.9,456.9 L345.2,456.8 Z M349.5,462.1 L349.8,462.4 L349.7,462.6 L349.5,462.7 L350.4,463.4 L351.0,464.4 L351.1,465.2 L350.6,465.4 L350.3,465.4 L349.3,464.6 L349.0,464.1 L348.7,463.3 L349.2,462.8 L349.3,462.8 L349.3,462.7 L349.3,462.2 L349.4,462.1 Z M239.7,484.2 L239.7,484.3 L239.7,484.4 L240.2,485.8 L240.4,486.4 L240.5,486.4 L240.7,486.5 L240.3,486.6 L239.3,486.3 L239.0,485.9 L238.5,484.4 L238.4,484.5 L238.3,484.3 L238.4,484.2 L239.6,484.4 L239.6,484.2 L239.7,484.2 Z M257.8,608.5 L258.0,608.6 L258.7,608.7 L259.8,608.9 L260.3,608.7 L260.4,608.9 L260.6,608.9 L260.7,608.8 L261.1,608.9 L261.3,609.1 L261.2,609.2 L261.0,609.2 L261.1,609.7 L261.2,609.8 L261.3,609.9 L261.2,610.3 L261.0,610.3 L260.3,610.1 L260.2,609.8 L260.1,609.9 L260.0,610.1 L258.6,609.4 L257.3,609.2 L256.9,608.9 L257.2,608.5 L257.8,608.5 Z M326.8,455.9 L326.8,456.0 L326.9,456.1 L326.9,456.2 L327.0,456.2 L326.8,456.8 L326.7,457.1 L326.5,457.1 L326.3,457.1 L326.2,457.1 L326.1,457.0 L326.0,457.0 L326.0,456.8 L325.9,456.7 L325.9,456.4 L326.0,456.3 L326.1,456.1 L326.2,456.0 L326.3,456.0 L326.4,456.0 L326.7,455.9 L326.8,455.9 Z M254.5,488.7 L254.5,489.0 L254.3,489.1 L254.2,489.2 L254.4,490.3 L254.3,490.5 L254.3,490.7 L254.4,491.3 L254.3,491.5 L254.2,491.8 L254.1,491.7 L254.1,491.5 L253.8,489.9 L253.6,489.5 L253.5,489.3 L253.7,489.1 L253.9,489.1 L254.1,489.0 L254.3,489.0 L254.4,488.8 L254.5,488.7 Z M359.4,443.0 L360.0,443.2 L360.2,443.3 L360.2,443.4 L359.9,443.9 L359.7,444.1 L359.7,444.3 L359.5,444.7 L358.3,444.5 L358.1,444.1 L358.1,444.0 L358.1,443.8 L358.2,443.8 L358.3,443.7 L358.5,443.6 L358.8,443.4 L358.9,443.2 L359.0,443.0 L359.2,443.0 L359.3,442.9 L359.3,443.0 Z M353.7,451.3 L353.8,451.3 L353.9,451.4 L353.9,451.5 L353.9,451.8 L353.8,452.1 L353.7,452.2 L353.4,452.4 L353.1,452.4 L353.1,452.3 L353.1,451.8 L353.2,451.5 L353.3,451.4 L353.6,451.3 Z M282.0,447.6 L282.1,447.6 L282.1,447.7 L282.2,447.7 L282.2,447.8 L282.4,447.8 L282.5,447.9 L282.6,447.9 L282.7,447.9 L282.7,448.0 L282.8,448.0 L282.8,448.1 L282.7,448.2 L282.4,448.6 L282.1,448.8 L281.8,449.0 L281.6,449.1 L281.2,449.0 L281.1,449.0 L281.0,448.9 L280.9,448.7 L281.0,448.6 L281.2,448.2 L281.2,448.1 L281.3,447.9 L281.6,447.7 L281.7,447.7 L281.9,447.6 L282.0,447.6 Z M250.0,482.9 L250.2,483.7 L250.5,484.0 L250.6,484.1 L250.6,484.3 L250.6,484.5 L250.1,484.6 L250.1,484.7 L249.8,484.6 L249.7,484.5 L249.5,484.2 L249.5,484.1 L249.4,483.9 L249.4,483.8 L249.5,483.5 L249.6,483.5 L249.7,483.5 L249.7,483.4 L249.8,483.4 L249.8,483.3 L249.9,482.9 L250.0,482.9 Z M270.4,591.0 L270.5,591.1 L270.6,591.1 L270.6,591.2 L270.7,591.7 L270.7,591.8 L270.7,591.9 L270.7,592.0 L270.7,592.1 L270.6,592.1 L270.5,592.0 L270.0,592.0 L269.8,592.1 L269.8,592.0 L269.7,592.0 L269.6,591.7 L269.5,591.5 L269.5,591.2 L269.8,591.1 L270.0,591.1 L270.1,591.1 L270.3,591.1 L270.4,591.0 Z M255.1,490.4 L255.2,490.5 L255.2,490.6 L255.1,490.6 L255.1,490.7 L255.0,490.8 L254.9,490.8 L254.9,490.7 L254.9,490.5 L254.9,490.4 L255.0,490.4 L255.1,490.4 Z", "cx": 314, "cy": 509, "lean": "Centro-Destra"}, {"id": "Sardegna", "path": "M99.6,358.0 L97.2,353.4 L93.2,354.3 L92.0,353.6 L91.3,351.5 L93.2,348.3 L92.9,341.6 L94.5,336.6 L98.9,340.2 L103.0,341.7 L108.1,340.6 L112.4,336.9 L118.0,333.9 L119.3,331.8 L125.5,325.7 L129.9,324.1 L129.0,320.2 L133.8,322.7 L135.5,322.9 L136.8,322.2 L139.6,323.7 L143.2,325.4 L144.3,326.9 L144.0,329.3 L144.4,332.3 L147.9,332.6 L146.1,334.2 L143.9,336.2 L145.2,337.2 L147.5,338.5 L150.2,340.6 L149.1,342.5 L151.8,348.4 L152.5,353.4 L154.3,358.8 L147.2,370.5 L150.9,378.3 L149.6,385.6 L149.4,389.7 L149.1,396.7 L148.3,405.0 L147.6,411.5 L147.2,418.5 L145.1,424.0 L143.4,428.7 L140.2,427.2 L137.0,424.5 L132.5,422.1 L130.0,424.0 L124.3,426.0 L124.5,432.5 L117.4,439.5 L115.0,437.8 L111.1,438.6 L110.1,440.3 L108.7,438.3 L108.0,435.3 L107.0,431.2 L102.8,432.2 L99.8,432.3 L100.3,428.5 L103.7,430.5 L101.2,425.3 L101.8,419.8 L100.1,415.0 L101.3,408.4 L102.6,398.9 L104.2,397.3 L106.3,393.4 L105.3,387.8 L102.1,389.8 L100.6,384.1 L101.0,380.6 L103.7,376.7 L104.0,369.3 L100.0,365.0 Z M97.7,326.5 L98.3,327.6 L98.4,328.6 L97.4,329.7 L96.3,329.4 L95.7,329.8 L94.7,331.2 L94.6,331.4 L94.9,331.3 L95.4,332.1 L94.4,333.2 L93.6,333.0 L93.9,333.0 L94.1,331.9 L94.0,330.6 L94.2,330.4 L95.5,329.2 L96.4,328.8 L96.1,327.9 L96.1,327.4 L97.2,327.3 Z M141.4,320.3 L141.8,320.9 L141.9,321.6 L141.7,322.4 L141.6,322.7 L141.1,323.3 L141.1,323.4 L141.2,323.4 L141.3,323.3 L141.6,323.2 L141.8,323.2 L141.8,323.5 L141.4,323.7 L140.8,323.2 L140.7,322.9 L140.4,323.3 L140.1,323.5 L140.5,322.5 L140.8,322.6 L140.6,322.2 L141.3,320.3 Z M97.4,424.0 L97.4,424.1 L97.4,426.0 L97.3,426.2 L97.4,426.4 L97.4,427.3 L97.4,427.8 L96.6,428.7 L95.0,428.0 L95.3,427.4 L95.2,427.0 L94.5,426.3 L94.0,426.1 L94.0,426.0 L94.4,425.2 L94.9,425.2 L95.7,424.6 L96.7,424.4 L97.2,424.2 L97.3,424.0 Z M139.5,319.1 L139.6,319.2 L140.1,320.2 L139.9,321.0 L140.1,320.9 L140.5,320.8 L140.3,321.1 L140.3,321.0 L140.1,321.0 L140.1,321.1 L140.2,321.7 L139.4,321.8 L138.2,322.0 L137.7,321.3 L137.7,321.1 L137.9,320.8 L138.0,320.8 L138.7,320.4 L138.9,319.6 L138.9,319.8 L139.2,320.0 L139.3,319.7 L139.4,319.1 Z M151.4,336.5 L151.5,336.6 L151.6,336.6 L151.7,337.0 L151.7,337.1 L151.5,337.2 L151.1,337.3 L150.5,337.7 L150.3,337.9 L150.0,338.1 L149.9,338.2 L149.6,338.1 L149.5,338.1 L149.1,338.1 L149.3,338.0 L150.3,337.3 L150.5,337.1 L151.1,336.6 L151.2,336.5 L151.5,336.3 Z M145.4,329.2 L145.5,329.2 L145.5,329.4 L145.5,329.5 L145.4,329.5 L145.4,329.6 L145.3,329.5 L145.2,329.5 L145.1,329.4 L145.2,329.4 L145.3,329.3 L145.3,329.2 L145.4,329.2 Z", "cx": 122, "cy": 380, "lean": "Centro-Sinistra"}];

export const BILLS = [
      { id:'b_flat', title:'DDL Flat Tax 15% e Taglio Cuneo Fiscale', dossier:'tax', stanceTarget:3, desc:'Riduce le tasse su P.IVA e ceto medio (+0.5% deficit).', eff:(g)=>{ g.budget.taxPressure=+(g.budget.taxPressure-0.5).toFixed(1); shiftBloc(g.playerPartyId,'piva',8); } },
      { id:'b_wage', title:'DDL Salario Minimo Legale a 10 €/ora', dossier:'work', stanceTarget:1, desc:'Aumenta i salari bassi; forte presa su Operai e Giovani.', eff:(g)=>{ shiftBloc(g.playerPartyId,'operai',8); shiftBloc(g.playerPartyId,'giovani',7); shiftBloc(g.playerPartyId,'piva',-5); } },
      { id:'b_prem', title:'DDL Piano Straordinario Sicurezza & Carceri', dossier:'justice', stanceTarget:3, desc:'Rafforza presidi di polizia e nuovi padiglioni detentivi.', eff:(g)=>{ g.govStability=Math.min(100,g.govStability+8); shiftBloc(g.playerPartyId,'identitari',8); } },
      { id:'b_ssn', title:'DDL Piano Straordinario Liste d’Attesa SSN', dossier:'welfare', stanceTarget:1, desc:'+0.4% spesa sanitaria; piace a Pensionati e Dipendenti.', eff:(g)=>{ g.budget.healthSpend=+(g.budget.healthSpend+0.4).toFixed(1); shiftBloc(g.playerPartyId,'pensionati',7); } },
      { id:'b_nuc', title:'DDL Piano Industriale Energia & SMR', dossier:'energy', stanceTarget:2, desc:'Riduce i costi energetici (+0.25% PIL).', eff:(g)=>{ g.gdp=Math.min(3.2,+(g.gdp+0.25).toFixed(2)); shiftBloc(g.playerPartyId,'manager',8); } },
      { id:'b_ponte', title:'DDL Cantiere Ponte sullo Stretto & AV Sud', dossier:'infra', stanceTarget:3, desc:'Sblocca le grandi infrastrutture strategiche (+0.2% PIL).', eff:(g)=>{ g.gdp=Math.min(3.2,+(g.gdp+0.2).toFixed(2)); shiftBloc(g.playerPartyId,'piva',6); shiftBloc(g.playerPartyId,'manager',6); } }
    ];

    /* PUNTO 3: MOTORE DI EVENTI CONTESTUALI IMMERSIVI (DIFFERENZIATI PER PREMIER, MINISTRO, ALLEATO MAGGIORANZA, OPPOSIZIONE, INDIPENDENTE, QUIRINALE E PARTITO) */
export const WORLD_EVENTS = [
  {
    id: 'pm_budget_clash', role: 'pm', tag: "PALAZZO CHIGI • LEGGE DI BILANCIO",
    title: "Assalto dei Capigruppo alla Manovra di Bilancio",
    body: "I partiti della coalizione hanno depositato oltre 900 emendamenti alla Finanziaria. I leader chiedono mance elettorali e bonus, minacciando il voto di fiducia.",
    c: [
      { l: "Poni la Questione di Fiducia sul testo blindato del Governo", d: "Stabilità +10%, Prestigio +6%, ma Soddisfazione Alleati -8%", f: (g) => { g.govStability=Math.min(100,g.govStability+10); g.leader.prestige=Math.min(100,g.leader.prestige+6); (window.adjAllySat||adjAllySat)(-8); } },
      { l: "Concedi un tesoretto da 1.2 miliardi per gli emendamenti degli alleati", d: "Soddisfazione Alleati +12%, Stabilità +4%, Deficit +0.2%", f: (g) => { (window.adjAllySat||adjAllySat)(12); g.govStability=Math.min(100,g.govStability+4); g.budget.deficit=+(g.budget.deficit+0.2).toFixed(1); } }
    ]
  },
  {
    id: 'pm_eu_summit', role: 'pm', tag: "CONSIGLIO EUROPEO • BRUXELLES",
    title: "Scontro sui Vincoli del Patto di Stabilità",
    body: "A Bruxelles i Paesi frugali chiedono all'Italia di accelerare il rientro del debito con tagli alla spesa sociale, paventando una procedura d'infrazione.",
    c: [
      { l: "Firma il compromesso e accetta clausole di bilancio più restrittive", d: "Spread -20pt, Prestigio Internazionale +8%, ma Malcontento Popolare +5%", f: (g) => { g.spread=Math.max(60,g.spread-20); g.leader.prestige=Math.min(100,g.leader.prestige+8); g.revoltRisk=Math.min(100,g.revoltRisk+5); } },
      { l: "Punta i piedi e minaccia il veto italiano sul bilancio comunitario", d: "Consenso Sovranista/Nazionalista +8%, Prestigio Internazionale -5%, Spread +15pt", f: (g) => { g.spread=Math.min(350,g.spread+15); g.leader.prestige=Math.max(10,g.leader.prestige-5); } }
    ]
  },
  {
    id: 'pm_general_strike', role: 'pm', tag: "PALAZZO CHIGI • RELAZIONI INDUSTRIALI",
    title: "Sciopero Generale Proclamato dai Sindacati",
    body: "CGIL e UIL proclamano 24 ore di sciopero generale contro le misure sul lavoro e l'inflazione. Trasporti e scuole a rischio paralisi.",
    c: [
      { l: "Convoca d'urgenza i sindacati a Palazzo Chigi e apri un tavolo permanente", d: "Prestigio +5%, Consenso Operai +6%, Spesa Pubblica +€ 400M", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+5); g.budget.deficit=+(g.budget.deficit+0.05).toFixed(2); } },
      { l: "Firma la precettazione dei lavoratori dei servizi essenziali", d: "Fermezza Istituzionale +6%, ma Tensione Sociale e Rischio Rivolta +7%", f: (g) => { g.revoltRisk=Math.min(100,g.revoltRisk+7); g.govStability=Math.min(100,g.govStability+5); } }
    ]
  },
  {
    id: 'pm_energy_crisis', role: 'pm', tag: "CONSIGLIO DEI MINISTRI • ENERGIA",
    title: "Picco Straordinario dei Prezzi del Gas",
    body: "Tensioni geopolitiche nel Mediterraneo fanno impennare le bollette del 35%. Imprese e famiglie chiedono aiuti immediati di Stato.",
    c: [
      { l: "Vara un Decreto Taglia-Bollette da 3 miliardi a carico del bilancio", d: "Deficit +0.4%, Consenso Imprese e Famiglie +10%, Rischio Rivolta -6%", f: (g) => { g.budget.deficit=+(g.budget.deficit+0.4).toFixed(1); g.revoltRisk=Math.max(0,g.revoltRisk-6); } },
      { l: "Tassa gli extraprofitti delle società energetiche al 25%", d: "Introito Fiscale +€ 2.5mld, Tensione con Confindustria, Consenso Progressista +8%", f: (g) => { g.budget.deficit=+(g.budget.deficit-0.2).toFixed(1); } }
    ]
  },
  {
    id: 'pm_reshuffle_demand', role: 'pm', tag: "PALAZZO CHIGI • MAGGIORANZA",
    title: "Ultimatum del Vicepremier per un Rimpasto",
    body: "Il leader del secondo partito di coalizione chiede la sostituzione di due ministri 'troppo tecnici' con figure politiche del suo partito.",
    c: [
      { l: "Accetta il rimpasto politico per blindare la maggioranza parlamentare", d: "Stabilità Gov +8%, Soddisfazione Alleati +14%, ma Reputazione Tecnica -6%", f: (g) => { g.govStability=Math.min(100,g.govStability+8); (window.adjAllySat||adjAllySat)(14); g.leader.prestige=Math.max(10,g.leader.prestige-4); } },
      { l: "Rifiuta e dichiara la fiducia intoccabile: 'Non si cede a ricatti'", d: "Prestigio Premier +8%, ma Soddisfazione Alleati -12% e Rischio Crisi", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); (window.adjAllySat||adjAllySat)(-12); g.govStability=Math.max(20,g.govStability-10); } }
    ]
  },
  {
    id: 'pm_infrastructure_disaster', role: 'pm', tag: "PROTEZIONE CIVILE • STATO D'EMERGENZA",
    title: "Alluvione Devastante nel Centro-Nord",
    body: "Un'eccezionale ondata di maltempo distrugge ponti e argini fluviali. Centinaia di sfollati e miliardi di euro di danni infrastrutturali.",
    c: [
      { l: "Dichiara lo Stato d'Emergenza Nazionale e stanzia 1.5 miliardi dal Fondo Riserva", d: "Prestigio +8%, Consenso Territoriale +12%, Deficit +0.2%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); g.budget.deficit=+(g.budget.deficit+0.2).toFixed(1); } },
      { l: "Visita immediatamente le zone colpite in stivali da fango con la Protezione Civile", d: "Prestigio Popolare +10%, Popolarità nei Sondaggi +1.5%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } }
    ]
  },
  {
    id: 'pm_intelligence_leak', role: 'pm', tag: "SERVIZI SEGRETI • DIS",
    title: "Dossieraggio e Fughe di Notizie Istituzionali",
    body: "Una fuga di notizie riservate rivela intercettazioni su nomine pubbliche e appalti militari. L'opposizione grida allo scandalo di Stato.",
    c: [
      { l: "Istituisci una commissione d'inchiesta indipendente e rimuovi i vertici dei servizi", d: "Prestigio Etico +8%, Trasparenza +10%, ma Tensione con gli Apparati", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); } },
      { l: "Derubrica le carte a 'fango mediatico strumentale' e fai quadrato", d: "Stabilità di Facciata +4%, ma Opposizione all'Attacco e Sondaggi -1.0%", f: (g) => { g.govStability=Math.min(100,g.govStability+4); } }
    ]
  },
  {
    id: 'pm_g7_summit', role: 'pm', tag: "SUMMIT INTERNAZIONALE • G7",
    title: "L'Italia al Centro del Vertice dei Grandi",
    body: "L'Italia ospita il vertice dei leader mondiali. Sei chiamato a mediare un accordo storico sulle catene di fornitura e la transizione energetica.",
    c: [
      { l: "Conduci la mediazione tra USA e UE siglando la 'Dichiarazione di Roma'", d: "Prestigio Internazionale +14%, Credibilità Paese +10%, Spread -15pt", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+14); g.spread=Math.max(60,g.spread-15); } },
      { l: "Privilegia l'accordo bilaterale sul Piano Mattei per l'energia dal Mediterraneo", d: "Sicurezza Energetica +10%, Prestigio Nazionale +8%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); } }
    ]
  },
  {
    id: 'min_rgs_clash', role: 'minister', tag: "IL TUO MINISTERO • SCONTRO COL MEF",
    title: "La Ragioneria Generale Blocca la Tua Riforma",
    body: "La Ragioneria Generale dello Stato ha espresso parere negativo di copertura finanziaria sul tuo decreto ministeriale di punta.",
    c: [
      { l: "Vai allo scontro frontale col Ministro dell'Economia in Consiglio dei Ministri", d: "Autorità Ministeriale +10%, Prestigio +5%, ma attrito col MEF", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+5); } },
      { l: "Rimodula la spesa trovando coperture interne al tuo dicastero", d: "Efficienza Ministeriale +8%, Decreto Approvato senza deficit", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+6); } }
    ]
  },
  {
    id: 'min_question_time', role: 'minister', tag: "CAMERA DEI DEPUTATI • QUESTION TIME",
    title: "Agguato dell'Opposizione in Aula",
    body: "L'opposizione presenta un'interrogazione urgente su presunte irregolarità nelle consulenze esterne del tuo ministero.",
    c: [
      { l: "Rispondi punto su punto con dati tecnici in diretta televisiva", d: "Competenza Percepita +8%, Prestigio +6%, Polemica Chiusa", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+6); } },
      { l: "Attacca politicamente l'opposizione accusandola di sciacallaggio", d: "Entusiasmo della Base di Partito +8%, ma Critica dei Moderati", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+4); } }
    ]
  },
  {
    id: 'min_foreign_counterpart', role: 'minister', tag: "DIPLOMAZIA DI SETTORE • BRUXELLES",
    title: "Accordo Bilaterale con il Tuo Omologo Europeo",
    body: "Il ministro del principale Paese partner europeo propone un'alleanza strategica sui fondi UE dedicati al tuo settore.",
    c: [
      { l: "Sigla il protocollo congiunto portando fondi europei all'Italia", d: "Prestigio Ministeriale +10%, Finanziamenti +€ 600M", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } },
      { l: "Chiedi più tempo per tutelare gli standard delle imprese italiane", d: "Consenso Imprese Locali +8%, Profilo Sovranista Rinforzato", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+5); } }
    ]
  },
  {
    id: 'min_crisis_table', role: 'minister', tag: "TAVOLO DI CRISI • MINISTERO",
    title: "Vertice Sindacale su una Crisi Aziendale Strategica",
    body: "Una multinazionale annuncia la chiusura di due stabilimenti e 2.500 licenziamenti. I lavoratori presidiano il tuo ministero.",
    c: [
      { l: "Trova un nuovo acquirente industriale offrendo incentivi mirati", d: "Posti Salvi, Prestigio Personale +12%, Consenso Lavoratori +10%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+12); } },
      { l: "Attiva gli ammortizzatori sociali d'urgenza e proroga la cassa integrazione", d: "Tregua Sociale Garantita, ma Costo Pubblico +€ 150M", f: (g) => { g.budget.deficit=+(g.budget.deficit+0.05).toFixed(2); } }
    ]
  },
  {
    id: 'min_reform_bill', role: 'minister', tag: "GAZZETTA UFFICIALE • DECRETO",
    title: "Firma del Decreto Ministeriale di Semplificazione",
    body: "Hai pronto un testo che taglia decine di adempimenti burocratici nel tuo settore di competenza. Le categorie plaudono.",
    c: [
      { l: "Promulga il testo e lancia una campagna informativa nazionale", d: "Prestigio +8%, Gradimento Categorie Produttive +10%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); } },
      { l: "Condividi il merito con i parlamentari della commissione competente", d: "Rapporti col Parlamento +8%, Soddisfazione Maggioranza +6%", f: (g) => { g.govStability=Math.min(100,g.govStability+4); } }
    ]
  },
  {
    id: 'pres_art74_veto', role: 'president_rep', tag: "COLLE DEL QUIRINALE • ART. 74 COST.",
    title: "Decreto Controverso con Dubbi di Costituzionalità",
    body: "Il Parlamento approva in via definitiva una legge con evidenti profili di incostituzionalità e carenza di copertura finanziaria (Art. 81 Cost.).",
    c: [
      { l: "Rinvio alle Camere con messaggio motivato di incostituzionalità", d: "Prestigio Morale e Garanzia Costituzionale +12%, Tensione col Governo", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+12); g.president.trust=Math.min(100,g.president.trust+10); } },
      { l: "Promulga la legge accompagnandola con una lettera di rilievi interpretativi", d: "Evita lo scontro frontale col Governo, Stabilità Istituzionale mantenuta", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+4); } }
    ]
  },
  {
    id: 'pres_csm_clash', role: 'president_rep', tag: "PALAZZO DEI MARESCIALLI • CSM",
    title: "Scontro Magistratura-Governo al Plenum del CSM",
    body: "In qualità di Presidente del Consiglio Superiore della Magistratura, devi presiedere un plenum infuocato dopo duri attacchi del Guardasigilli ai giudici.",
    c: [
      { l: "Pronuncia un discorso solenne in difesa dell'indipendenza della Magistratura", d: "Plauso delle Toghe, Prestigio Istituzionale +10%, Raffreddamento Tensioni", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); g.president.trust=Math.min(100,g.president.trust+8); } },
      { l: "Esorta entrambe le parti alla leale collaborazione tra poteri dello Stato", d: "Equidistanza Super Partes Riconosciuta, Fiducia Cittadini +8%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); g.president.trust=Math.min(100,g.president.trust+6); } }
    ]
  },
  {
    id: 'pres_life_senator', role: 'president_rep', tag: "COLLE DEL QUIRINALE • ART. 59 COST.",
    title: "Nomina di un Senatore a Vita per Altissimi Meriti",
    body: "Si è liberato un seggio di Senatore a Vita. Hai la facoltà costituzionale di nominare un cittadino che ha illustrato la Patria per altissimi meriti.",
    c: [
      { l: "Nomina un illustre scienziato e ricercatore di fama mondiale", d: "Plauso Unanime della Società Civile, Prestigio della Repubblica +10%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); g.president.trust=Math.min(100,g.president.trust+8); } },
      { l: "Nomina un decano dell'economia e della finanza pubblica", d: "Rassicurazione dei Mercati Finanziari, Spread -10pt", f: (g) => { g.spread=Math.max(60,g.spread-10); g.leader.prestige=Math.min(100,g.leader.prestige+6); } }
    ]
  },
  {
    id: 'pres_state_visit', role: 'president_rep', tag: "DIPLOMAZIA DI STATO • VISITA UFFICIALE",
    title: "Visita di Stato e Ricevimento al Quirinale",
    body: "Accogli al Quirinale il Presidente degli Stati Uniti e i leader europei per un solenne vertice di cooperazione e sicurezza.",
    c: [
      { l: "Riafferma l'ancoraggio atlantico ed europeo con una storica prolusione", d: "Prestigio Internazionale +12%, Consenso delle Cancellerie Occidentali", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+12); } },
      { l: "Poni l'accento sulla pace nel Mediterraneo e la cooperazione culturale", d: "Prestigio Umanitario +10%, Accoglienza Entusiasta della Stampa", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } }
    ]
  },
  {
    id: 'pres_gov_crisis_consult', role: 'president_rep', tag: "QUIRINALE • STUDIO ALLA VETRATA",
    title: "Consultazioni per la Risoluzione della Crisi",
    body: "Il Governo si è dimesso e i partiti sono divisi. Salgono al Quirinale le delegazioni di tutti i gruppi parlamentari per le consultazioni.",
    c: [
      { l: "Affida un mandato esplorativo al Presidente del Senato per verificare una maggioranza politica", d: "Procedura Istituzionale Impeccabile, Prestigio +8%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); } },
      { l: "Indirizza i partiti verso un Governo Istituzionale di Salvezza Nazionale", d: "Fiducia dei Mercati, Spread -20pt, Prestigio Colle +10%", f: (g) => { g.spread=Math.max(60,g.spread-20); g.leader.prestige=Math.min(100,g.leader.prestige+10); } }
    ]
  },
  {
    id: 'ind_editorial_debate', role: 'ind', tag: "CORRIERE DELLA SERA • EDITORIALE",
    title: "Il Tuo Editoriale di Prima Pagina Infiamma il Dibattito",
    body: "Il principale quotidiano italiano pubblica in prima pagina la tua analisi sullo stato del Paese. Tutti i telegiornali riprendono le tue tesi.",
    c: [
      { l: "Rincara la dose con un manifesto civico per le riforme e la trasparenza", d: "Prestigio +12%, Gradimento Popolare +10%, Notorietà alle Stelle", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+12); } },
      { l: "Mantieni un profilo distaccato ed equidistante da tutti i partiti", d: "Autorevolezza Super Partes +10%, Riconoscimento Istituzionale +8%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } }
    ]
  },
  {
    id: 'ind_referendum_committee', role: 'ind', tag: "SOCIETÀ CIVILE • COMITATO PROMOTORE",
    title: "Offerta di Presidenza del Comitato Referendario",
    body: "Un vasto cartello di associazioni, costituzionalisti e sindacati ti chiede di guidare come figura di garanzia la campagna per un referendum nazionale.",
    c: [
      { l: "Accetta la presidenza guidando la mobilitazione pubblica", d: "Prestigio +14%, Visibilità Mediatica Enorme, Consenso Cittadini +12%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+14); } },
      { l: "Declina cortesemente per tutelare la tua indipendenza assoluta", d: "Reputazione di Imparzialità Rafforzata, Rispetto delle Istituzioni", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+6); } }
    ]
  },
  {
    id: 'ind_cernobbio_speech', role: 'ind', tag: "FORUM AMBROSETTI DI CERNOBBIO",
    title: "Keynote Speech davanti a Imprenditori e Capi di Stato",
    body: "Sei il relatore d'onore a Villa d'Este. La platea dei grandi industriali e banchieri internazionali ascolta la tua visione economica per l'Italia.",
    c: [
      { l: "Proponi un patto per la produttività, il merito e la riduzione del debito", d: "Plauso di Confindustria e Mercati, Prestigio Economico +10%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } },
      { l: "Fustiga la rendita finanziaria chiedendo salari equi e investimenti sui giovani", d: "Entusiasmo della Società Civile, Prestigio Popolare +12%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+12); } }
    ]
  },
  {
    id: 'ind_court_by_coalitions', role: 'ind', tag: "RETROSCENA POLITICI • SIRENE ELETTORALI",
    title: "I Leader di Coalizione Ti Offrono una Candidatura",
    body: "In vista dei prossimi passaggi elettorali, sia il polo di governo che l'opposizione ti sondano per guidare una lista civica di alto profilo.",
    c: [
      { l: "Ribadisci la tua autonomia: 'La mia voce resta libera e indipendente'", d: "Prestigio Etico +10%, Ruolo di Garante Riconosciuto da Tutti", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } },
      { l: "Dichiara disponibilità a un impegno pubblico solo per Governi di Alto Profilo", d: "Profilo da Premier Tecnico / Riserva della Repubblica Sbloccato (+12%)", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+12); } }
    ]
  },
  {
    id: 'ind_tv_talk_clash', role: 'ind', tag: "PRIMA SERATA TV • DIMARTEDÌ",
    title: "Duello Televisivo in Prima Serata: Record di Ascolti",
    body: "Ospite d'onore in prima serata televisiva, smonti punto su punto le promesse irrealizzabili della classe politica con numeri inoppugnabili.",
    c: [
      { l: "Difendi con passione i diritti dei cittadini comuni e dei contribuenti onesti", d: "Popolarità +15%, Consenso di Massa +10%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+15); } },
      { l: "Spiega con rigore scientifico il piano per rilanciare la sanità e la scuola", d: "Prestigio Tecnico +12%, Riconoscimento degli Esperti", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+12); } }
    ]
  },
  {
    id: 'ind_bestseller_book', role: 'ind', tag: "EDITORIA & CULTURA • BESTSELLER",
    title: "Il Tuo Libro Balza al Primo Posto delle Vendite Nazionali",
    body: "Il tuo saggio-denuncia sul futuro dell'Italia vende oltre 100.000 copie nelle prime tre settimane, diventando il caso culturale dell'anno.",
    c: [
      { l: "Gira l'Italia in un tour di presentazioni affollate nei teatri", d: "Rete Civica sul Territorio Fortissima, Prestigio +12%, Risorse Personali +€ 30k", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+12); g.budget.treasury=(g.budget.treasury||50000)+30000; } },
      { l: "Destina tutti i proventi a borse di studio per giovani ricercatori", d: "Ammirazione Nazionale Straordinaria, Prestigio Morale +15%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+15); } }
    ]
  },
  {
    id: 'opp_no_confidence_motion', role: 'opp', tag: "AULA DI MONTECITORIO • MOZIONE",
    title: "Mozione di Sfiducia Individuale a un Ministro Chiave",
    body: "Un grave conflitto d'interessi travolge un ministro del Governo. Hai raccolto le firme per depositare la mozione di sfiducia.",
    c: [
      { l: "Guida l'attacco parlamentare chiedendo le dimissioni immediate", d: "Prestigio Opposizione +10%, Stabilità del Governo -8%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); g.govStability=Math.max(10,g.govStability-8); } },
      { l: "Cerca la sponda dei franchi tiratori della maggioranza per affondare il ministro", d: "Tensione Massima nella Maggioranza, Stabilità Gov -12%, ma Rischio Boomerang se respinta", f: (g) => { g.govStability=Math.max(10,g.govStability-12); } }
    ]
  },
  {
    id: 'opp_mass_rally', role: 'opp', tag: "PIAZZA DEL POPOLO • MANIFESTAZIONE",
    title: "Grande Manifestazione Nazionale dell'Opposizione",
    body: "Centomila cittadini riempiono la piazza a Roma contro i decreti del Governo. Prendi la parola dal palco tra bandiere e applausi.",
    c: [
      { l: "Lancia una sfida elettorale diretta al Governo invocando le urne", d: "Mobilitazione della Base +12%, Sondaggi Partito +1.8%, Rischio Rivolta +5%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); g.revoltRisk=Math.min(100,g.revoltRisk+5); } },
      { l: "Presenta una piattaforma di governo alternativa seria e credibile", d: "Credibilità Istituzionale +10%, Attrazione Elettori Moderati +8%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } }
    ]
  },
  {
    id: 'opp_shadow_cabinet', role: 'opp', tag: "STATI GENERALI • OPPOSIZIONI",
    title: "Cantiere per il Patto di Alternativa di Governo",
    body: "I leader delle opposizioni si riuniscono per superare i rancori del passato e costruire una coalizione competitiva per le prossime elezioni.",
    c: [
      { l: "Proponiti come federatore della coalizione con un programma comune", d: "Prestigio da Leader del Polo +12%, Relazioni con gli Alleati d'Opposizione +15", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+12); } },
      { l: "Mantieni l'identità autonoma del tuo partito senza farti imbrigliare", d: "Identità Partitica Blindata, Fedeltà della Base +10%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+6); } }
    ]
  },
  {
    id: 'opp_filibuster_battle', role: 'opp', tag: "NOTTURNA ALLA CAMERA • OSTRUZIONISMO",
    title: "Maratona Ostruzionistica sul Decreto Blindato",
    body: "Il Governo vuole far passare un decreto liberticida prima della pausa estiva. I tuoi deputati occupano i banchi e intervengono a oltranza tutta la notte.",
    c: [
      { l: "Mantieni l'ostruzionismo fino all'esaurimento dei tempi di legge", d: "Governo Costretto a Trattare Modifiche, Prestigio Parlamentare +10%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); g.govStability=Math.max(10,g.govStability-6); } },
      { l: "Negozia un pacchetto di emendamenti qualificanti in cambio della fine dei lavori", d: "Vittoria Concreta di Merito, Prestigio Riformista +8%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); } }
    ]
  },
  {
    id: 'pmem_congress_challenge', role: 'party_member', tag: "CONGRESSO NAZIONALE • ASSISE",
    title: "Resa dei Conti Congressuale tra le Correnti",
    body: "L'ala minoritaria del partito presenta una mozione alternativa alla tua segreteria, criticando la linea strategica e la gestione del potere.",
    c: [
      { l: "Accetta la sfida a viso aperto con un discorso di fuoco ai delegati", d: "Vittoria Congressuale Netta, Leadership Blindata (+10%), Minori Fuori Gioco", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } },
      { l: "Tratta un accordo unitario integrando la minoranza nella segreteria nazionale", d: "Unità Interna Salvata, Soddisfazione Correnti +14%, Rischio Scissione Azzerato", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+6); } }
    ]
  },
  {
    id: 'pmem_territorial_tour', role: 'party_member', tag: "TERRITORIO • CAMPAGNA D'ASCOLTO",
    title: "Viaggio tra i Circoli e le Sezioni sul Territorio",
    body: "I militanti chiedono più presenza sui territori per contrastare il distacco tra la base e i vertici romani.",
    c: [
      { l: "Organizza una serie di assemblee aperte in 10 regioni in due settimane", d: "Entusiasmo della Base +12%, Forza Organizzativa Partito +8%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); } },
      { l: "Lancia una consultazione digitale tra tutti gli iscritti sulle priorità programmatiche", d: "Coinvolgimento Iscritti +10%, Modernizzazione Partito +8%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+6); } }
    ]
  },
  {
    id: 'ex_memoirs_impact', role: 'exile', tag: "LONDRA & PARIGI • MEMORIE DALL'ESILIO",
    title: "Pubblicazione delle Memorie Politiche all'Estero",
    body: "Dall'esilio all'estero pubblichi un memoriale clamoroso che svela i retroscena della congiura politica che ti ha estromesso dalla scena nazionale.",
    c: [
      { l: "Rilascia un'intervista esclusiva a BBC e Le Monde denunciando il regime", d: "Prestigio Internazionale +14%, Imbarazzo per il Governo Italiano", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+14); } },
      { l: "Inizia a costruire una rete di contatti con diplomatici per preparare il rientro", d: "Pressioni Diplomatiche sul Governo, Possibilità di Rientro +10%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } }
    ]
  },
  {
    id: 'ex_strasbourg_appeal', role: 'exile', tag: "CORTE DI STRASBURGO • DIRITTI UMANI",
    title: "Ricorso Accolto dalla Corte Europea",
    body: "La Corte dei Diritti Umani di Strasburgo dichiara illegittimi i provvedimenti punitivi emessi nei tuoi confronti.",
    c: [
      { l: "Chiedi il ripristino immediato di tutti i tuoi diritti civili e politici", d: "Vittoria Legale Storica, Prestigio +16%, Ritorno in Patria Vicino", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+16); } },
      { l: "Usa la sentenza per isolare politicamente i tuoi rivali al Governo", d: "Forte Danno Reputazionale per i Tuoi Oppositori", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+12); } }
    ]
  },
  {
    id: 'pm_bank_stability', role: 'pm', tag: "PALAZZO CHIGI • STABILITÀ FINANZIARIA",
    title: "Banca Regionale in Crisi di Liquidità",
    body: "Un istituto di credito di medie dimensioni rischia il default a causa di sofferenze creditizie. Bankitalia chiede un intervento urgente di garanzia pubblica.",
    c: [
      { l: "Vara un decreto salva-risparmiatori con garanzia statale", d: "Tutela Depositi, Panico Sventato, ma Deficit +0.1%", f: (g) => { g.budget.deficit=+(g.budget.deficit+0.1).toFixed(1); g.spread=Math.max(60,g.spread-5); } },
      { l: "Lascia che scatti il bail-in europeo a carico di azionisti e obbligazionisti", d: "Nessun Debito Pubblico, ma Proteste dei Risparmiatori e Sondaggi -1%", f: (g) => { g.revoltRisk=Math.min(100,g.revoltRisk+4); } }
    ]
  },
  {
    id: 'pm_referendum_gamble', role: 'pm', tag: "PALAZZO CHIGI • SFIDA POLITICA",
    title: "La Scommessa Referendaria sulle Riforme",
    body: "La riforma costituzionale del Governo è approdata alle urne referendarie. I consiglieri discutono se personalizzare la campagna legando il destino dell'esecutivo all'esito del voto.",
    c: [
      { l: "Personalizza la sfida: 'Se vince il NO, mi dimetto il giorno dopo'", d: "Mobilitazione Massima, se vinci Prestigio +20%, se perdi Crisi di Governo", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } },
      { l: "Mantieni il referendum sul piano tecnico-istituzionale senza legarvi la permanenza a Chigi", d: "Rischio Politico Neutralizzato, Dibattito Sereno", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+4); } }
    ]
  },
  {
    id: 'min_procurement_scandal', role: 'minister', tag: "ANTICORRUZIONE • APPALTI PUBBLICI",
    title: "Sospetto di Turbativa d'Asta in una Direzione Generale",
    body: "L'ANAC invia una segnalazione su un bando milionario gestito da un alto dirigente del tuo ministero. La stampa prepara l'inchiesta.",
    c: [
      { l: "Revoca immediatamente il bando in autotutela e solleva il dirigente", d: "Trasparenza Riconosciuta, Prestigio Etico +10%, Stop Infiltrazioni", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } },
      { l: "Attendi gli esiti formali delle indagini giudiziarie prima di agire", d: "Continuità Amministrativa Garantita, ma Attacco dei Media", f: (g) => { g.leader.prestige=Math.max(10,g.leader.prestige-4); } }
    ]
  },
  {
    id: 'min_budget_bonus', role: 'minister', tag: "IL TUO MINISTERO • RENDICONTO",
    title: "Efficienza di Spesa: Tesoretto Risparmiato",
    body: "Una razionalizzazione dei contratti di fornitura del tuo ministero ha generato 180 milioni di euro di risparmi non previsti a bilancio.",
    c: [
      { l: "Reinvesti subito i fondi nel potenziamento dei servizi e personale del ministero", d: "Efficienza dei Servizi +12%, Gradimento Utenti +10%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); } },
      { l: "Restituisci i risparmi al MEF per ridurre il debito pubblico nazionale", d: "Elogio del Ministro dell'Economia, Prestigio Istituzionale +10%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); g.budget.deficit=Math.max(0,+(g.budget.deficit-0.05).toFixed(2)); } }
    ]
  },
  {
    id: 'min_territory_inauguration', role: 'minister', tag: "OPERE PUBBLICHE • INAUGURAZIONE",
    title: "Taglio del Nastro per una Grande Infrastruttura",
    body: "Viene completata in anticipo sui tempi un'opera pubblica strategica promossa dal tuo dicastero. Tutta la stampa locale e nazionale è presente.",
    c: [
      { l: "Inaugura l'opera sottolineando l'eccellenza del lavoro italiano", d: "Prestigio +10%, Consenso Popolare Locale +14%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } },
      { l: "Ringrazia i lavoratori e le imprese dedicando l'opera alle future generazioni", d: "Profilo da Statista Consolidato, Stima Trasversale +8%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); } }
    ]
  },
  {
    id: 'pres_new_year_speech', role: 'president_rep', tag: "QUIRINALE • DISCORSO DI FINE ANNO",
    title: "Messaggio di Fine Anno agli Italiani a Reti Unificate",
    body: "La sera del 31 dicembre parli alla Nazione. Dieci milioni di famiglie italiane sono collegate in diretta televisiva per ascoltare il tuo messaggio.",
    c: [
      { l: "Poni al centro la coesione sociale, la difesa dei deboli e la speranza dei giovani", d: "Fiducia Popolare al Quirinale +14%, Unità della Repubblica Consolidata", f: (g) => { g.president.trust=Math.min(100,g.president.trust+10); g.leader.prestige=Math.min(100,g.leader.prestige+10); } },
      { l: "Fai un richiamo severo alla classe politica sulla responsabilità e il debito", d: "Monito Storico ai Partiti, Autorevolezza Morale Super Partes +15%", f: (g) => { g.president.trust=Math.min(100,g.president.trust+12); g.leader.prestige=Math.min(100,g.leader.prestige+12); } }
    ]
  },
  {
    id: 'pres_constitutional_reform', role: 'president_rep', tag: "QUIRINALE • EQUILIBRIO DEI POTERI",
    title: "Progetto di Riforma Costituzionale sul Premierato",
    body: "Il Governo avanza una proposta di riforma che tocca le prerogative presidenziali di nomina e scioglimento. I giuristi attendono un tuo segnale.",
    c: [
      { l: "Richiama pubblicamente al rispetto della Costituzione e del bilanciamento tra poteri", d: "Difesa delle Prerogative del Colle, Prestigio della Consulta +12%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+12); g.president.trust=Math.min(100,g.president.trust+10); } },
      { l: "Ribadisci la sovranità del Parlamento pur raccomandando massima cautela istituzionale", d: "Nessuna Invasione di Campo, Saggezza Istituzionale Esemplare", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); } }
    ]
  },
  {
    id: 'ind_academic_lecture', role: 'ind', tag: "ATENEO ACCADEMICO • LECTIO MAGISTRALIS",
    title: "Lectio Magistralis all'Università Bocconi / Sapienza",
    body: "Invitato a tenere la prolusione accademica inaugurale davanti a mille studenti e docenti internazionali, affronti le sfide dell'Italia nel 2030.",
    c: [
      { l: "Ispira i giovani laureati esortandoli a restare in Italia e lottare per il merito", d: "Entusiasmo della Comunità Accademica, Prestigio Intellettuale +10%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } },
      { l: "Presenta un piano di defiscalizzazione totale per i brevetti e le startup giovanili", d: "Attenzione di Startup e Fondi di Venture Capital, Credibilità +8%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); } }
    ]
  },
  {
    id: 'ind_petition_success', role: 'ind', tag: "CAMPAGNA DIGITALE • PETIZIONE",
    title: "Un Milione di Firme per la Tua Iniziativa Civica",
    body: "La campagna civica lanciata dalla tua associazione per la tutela del patrimonio naturale raggiunge un milione di sottoscrizioni online in 10 giorni.",
    c: [
      { l: "Deposita solennemente le firme a Montecitorio chiedendo una legge d'iniziativa popolare", d: "Trionfo della Cittadinanza Attiva, Prestigio Civico +14%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+14); } },
      { l: "Trasforma il comitato in un think-tank permanente di controllo civico", d: "Struttura Civica Consolidata, Riconoscimento Internazionale +10%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } }
    ]
  },
  {
    id: 'ind_foreign_thinktank', role: 'ind', tag: "GEOPOLITICA GLOBALE • DAVOS",
    title: "Invitato al World Economic Forum di Davos",
    body: "Sei invitato come personalità indipendente al summit mondiale di Davos per discutere di sostenibilità del debito sovrano e intelligenza artificiale.",
    c: [
      { l: "Rappresenta le istanze della manifattura e della cultura mediterranea", d: "Prestigio Internazionale +12%, Stima dei Grandi Leader Mondiali", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+12); } },
      { l: "Denuncia i rischi dell'oligopolio delle Big Tech sui mercati europei", d: "Leadership nel Dibattito sui Diritti Digitali, Notorietà Globale +10%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } }
    ]
  },
  {
    id: 'ind_nobel_nomination', role: 'ind', tag: "SOCIETÀ CIVILE • RICONOSCIMENTO",
    title: "Candidatura a un Prestigioso Premio Internazionale",
    body: "Una prestigiosa accademia europea annuncia di aver candidato il tuo nome per un alto riconoscimento internazionale alle scienze e alla pace.",
    c: [
      { l: "Accogli la notizia dedicando l'onore al popolo italiano e ai diritti fondamentali", d: "Orgoglio Nazionale, Prestigio al Massimo (+15%)", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+15); } },
      { l: "Approfitta della visibilità per lanciare un fondo di solidarietà per le periferie", d: "Impatto Sociale Straordinario, Stima di Tutta la Popolazione +12%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+12); } }
    ]
  },
  {
    id: 'opp_tv_primetime_debate', role: 'opp', tag: "DUELLO TV • PORTA A PORTA",
    title: "Confronto Televisivo con il Segretario di Maggioranza",
    body: "In prima serata tv ti trovi faccia a faccia col leader del principale partito di governo. Due milioni di spettatori seguono lo scontro.",
    c: [
      { l: "Incalza il rivale sulle promesse elettorali tradite e sull'aumento delle tasse", d: "Vittoria nel Duello TV (+10%), Spostamento di Voti dall'Elettorato Indeciso (+1.2%)", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } },
      { l: "Esponi con calma e autorevolezza il tuo contro-piano per il Paese", d: "Profilo di Statista Accreditato, Stima dei Moderati +8%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); } }
    ]
  },
  {
    id: 'opp_whistleblower_leak', role: 'opp', tag: "DOSSIER SEGRETO • INCHIESTA",
    title: "Una Talpa dei Ministeri Ti Consegna Documenti Esplosivi",
    body: "Un funzionario statale ti recapita le prove di uno spreco da 500 milioni di euro nascosto tra le pieghe del bilancio dei ministeri.",
    c: [
      { l: "Convoca una conferenza stampa d'urgenza denunciando lo scandalo alla Corte dei Conti", d: "Terremoto Mediatico sul Governo (-10% Stabilità), Prestigio Opposizione +12%", f: (g) => { g.govStability=Math.max(10,g.govStability-10); g.leader.prestige=Math.min(100,g.leader.prestige+12); } },
      { l: "Usa le carte in aula per costringere il Governo a cancellare lo spreco", d: "Vittoria Concreta Parlamentare, Risparmio per i Cittadini Riconosciuto", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } }
    ]
  },
  {
    id: 'pmem_fundraising_gala', role: 'party_member', tag: "FINANZIAMENTO • CENA ELETTORALE",
    title: "Cena di Autofinanziamento con Imprenditori e Sostenitori",
    body: "Ottocento sostenitori partecipano alla cena annuale di sottoscrizione per la campagna elettorale del tuo partito.",
    c: [
      { l: "Tieni un discorso galvanizzante e raccogli 120.000 euro per la cassa del partito", d: "Fondi Partito +€ 120k, Entusiasmo dei Finanziatori", f: (g) => { g.budget.treasury=(g.budget.treasury||50000)+120000; g.leader.prestige=Math.min(100,g.leader.prestige+6); } },
      { l: "Rifiuta le grandi donazioni e fissa un tetto etico di 50 euro a testa", d: "Trasparenza Esemplare, Prestigio Etico +10%, ma Risorse Ridotte", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } }
    ]
  },
  {
    id: 'pmem_youth_camp', role: 'party_member', tag: "SCUOLA POLITICA • GIOVANI",
    title: "Campo Estivo dei Giovani Militanti",
    body: "Cinquecento giovani militanti si riuniscono per tre giorni di seminari e formazione politica. Ti chiedono di tenere la lezione conclusiva.",
    c: [
      { l: "Forma la futura classe dirigente trasmettendo i valori storici del movimento", d: "Nuova Leva Entusiasta, Rinnovamento Partito +10%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+8); } },
      { l: "Dai spazio ai giovani affidando loro la gestione della comunicazione social del partito", d: "Svolta Digitale della Comunicazione, Sondaggi Giovani +6%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+6); } }
    ]
  },
  {
    id: 'ex_foreign_parliament', role: 'exile', tag: "BRUXELLES • AUDIZIONE PARLAMENTARE",
    title: "Audizione Ufficiale al Parlamento Europeo",
    body: "Il Parlamento Europeo ti invita a tenere una testimonianza sullo stato della democrazia e dello stato di diritto in Italia.",
    c: [
      { l: "Denuncia l'involuzione democratica chiedendo l'attivazione delle clausole di salvaguardia", d: "Pressione Internazionale Massima sull'Italia, Prestigio Globale +14%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+14); } },
      { l: "Difendi l'onore del popolo italiano distinguendo i cittadini dai governanti di turno", d: "Patriottismo Riconosciuto anche dagli Avversari, Prestigio +12%", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+12); } }
    ]
  },
  {
    id: 'ex_clandestine_broadcast', role: 'exile', tag: "ONDE CORTE & STREAMING • RETE CLANDESTINA",
    title: "Discorso Clandestino Trasmesso in Streaming Nazionale",
    body: "Una rete di volontari pirata ritrasmette il tuo messaggio audio-video che raggiunge centinaia di migliaia di schermi in tutta Italia.",
    c: [
      { l: "Lancia un appello alla resistenza civile e democratica", d: "Fiammata di Speranza nella Base, Notorietà Inalterata (+12%)", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+12); } },
      { l: "Annuncia la preparazione del tuo manifesto per la Repubblica del Futuro", d: "Guida Politica Riconfermata a Distanza, Speranza nel Futuro", f: (g) => { g.leader.prestige=Math.min(100,g.leader.prestige+10); } }
    ]
  },
];

export const NEW_FIRST_NAMES = ["Alessandro","Lorenzo","Matteo","Davide","Federico","Simone","Gabriele","Valerio","Edoardo","Tommaso","Giulia","Chiara","Francesca","Elena","Beatrice","Martina","Sofia","Camilla","Arianna","Caterina"];
export const NEW_LAST_NAMES = ["Ferraro","Lombardi","Moretti","Conti","Marchetti","Galli","Santoro","De Angelis","Rinaldi","Bellini","Silvestri","Valenti","Pellegrini","Donati","Farina","Battaglia","Sartori","Costantini","Pagano","Sorrentino"];


export const EXEC_DECREES = [
      { id:'dec_cuneo', icon:'💶', title:'Decreto Taglio Cuneo Fiscale & Buste Paga', costAP:22, costFunds:40,
        desc:'Riduce i contributi su stipendi medio-bassi e partite IVA (+0.15% PIL, +0.3% Deficit, +consenso Operai, Impiegati e P.IVA).',
        run:(g)=>{ g.gdp=Math.min(3.5,+(g.gdp+0.15).toFixed(2)); g.budget.deficit=+(g.budget.deficit+0.3).toFixed(1); shiftBloc(g.playerPartyId,'operai',6); shiftBloc(g.playerPartyId,'impiegati',6); shiftBloc(g.playerPartyId,'piva',5); }
      },
      { id:'dec_sanita', icon:'🏥', title:'Piano Straordinario Liste d’Attesa & Assunzioni SSN', costAP:22, costFunds:45,
        desc:'Sblocca il tetto di spesa per medici e infermieri e apre gli ambulatori nel weekend (+4% Stabilità Gov, +consenso Pensionati, Sud e Impiegati).',
        run:(g)=>{ g.govStability=Math.min(100,g.govStability+4); g.budget.healthSpend=+(g.budget.healthSpend+0.15).toFixed(2); shiftBloc(g.playerPartyId,'pensionati',7); shiftBloc(g.playerPartyId,'fragili_sud',6); shiftBloc(g.playerPartyId,'impiegati',5); }
      },
      { id:'dec_sicurezza', icon:'🚓', title:'Decreto Sicurezza Urbana, Stazioni & Forze dell’Ordine', costAP:20, costFunds:35,
        desc:'Assunzione di 10.000 agenti, sgomberi lampo e presidio militare nelle stazioni (+6% Fedeltà Apparati, +consenso Identitari, Nazionalisti e P.IVA).',
        run:(g)=>{ g.militaryLoyalty=Math.min(95,g.militaryLoyalty+6); shiftBloc(g.playerPartyId,'identitari',7); shiftBloc(g.playerPartyId,'nazionalisti',6); shiftBloc(g.playerPartyId,'piva',5); }
      },
      { id:'dec_cantieri', icon:'🚄', title:'Decreto Sblocco Cantieri, Infrastrutture & Alta Velocità', costAP:24, costFunds:50,
        desc:'Commissari straordinari per opere strategiche, reti idriche e ferroviarie (+0.22% PIL, -8 pt Spread, +consenso Manager e Operai).',
        run:(g)=>{ g.gdp=Math.min(3.5,+(g.gdp+0.22).toFixed(2)); g.spread=Math.max(60,g.spread-8); shiftBloc(g.playerPartyId,'manager',7); shiftBloc(g.playerPartyId,'operai',5); }
      },
      { id:'dec_energia', icon:'⚡', title:'Decreto Bollette, Sovranità Energetica & Famiglie', costAP:20, costFunds:40,
        desc:'Credito d’imposta per imprese energivore e scudo tariffe per le famiglie (+0.16% PIL, +5% Stabilità Gov).',
        run:(g)=>{ g.gdp=Math.min(3.5,+(g.gdp+0.16).toFixed(2)); g.govStability=Math.min(100,g.govStability+5); shiftBloc(g.playerPartyId,'manager',5); shiftBloc(g.playerPartyId,'pensionati',5); }
      },
      { id:'dec_fiducia', icon:'🏛️', title:'Questione di Fiducia sul Programma di Governo in Aula', costAP:25, costFunds:0,
        desc:'Compatta la maggioranza attorno a Palazzo Chigi (+14% Stabilità di Governo, +5% Prestigio Personale).',
        run:(g)=>{ g.govStability=Math.min(100,g.govStability+14); g.leader.prestige=Math.min(100,g.leader.prestige+5); }
      }
    ];

// =========================================================================
// POOL RICCO E PROCEDURALE DI NOMI E SIGLE PER SCISSIONI DI PARTITO (PUNTO 11)
// =========================================================================

// =========================================================================
// POOL RICCO E PROCEDURALE DI NOMI E SIGLE PER SCISSIONI DI PARTITO (PUNTO 11)
// =========================================================================
export const SPLIT_POOLS = {
  "destra": [
    {
      "name": "Riscossa Patriottica",
      "short": "RP",
      "area": "Destra Sovranista"
    },
    {
      "name": "Destra Sociale",
      "short": "DS",
      "area": "Destra Nazionale"
    },
    {
      "name": "Patto Nazionale",
      "short": "PN",
      "area": "Conservatori"
    },
    {
      "name": "Sovranità & Libertà",
      "short": "SeL",
      "area": "Sovranisti"
    },
    {
      "name": "Azione Patriottica",
      "short": "AP",
      "area": "Destra Sociale"
    },
    {
      "name": "Italia Prima",
      "short": "IP",
      "area": "Identitari"
    },
    {
      "name": "Identità e Tradizione",
      "short": "IeT",
      "area": "Tradizionalisti"
    },
    {
      "name": "Fronte Nazionale Popolare",
      "short": "FNP",
      "area": "Destra Radicale"
    }
  ],
  "centrodestra": [
    {
      "name": "Forza Liberale",
      "short": "FL",
      "area": "Centro-Destra Liberale"
    },
    {
      "name": "Popolari d'Italia",
      "short": "PdI",
      "area": "Centro-Destra Popolare"
    },
    {
      "name": "Rinascita Liberale",
      "short": "RL",
      "area": "Moderati"
    },
    {
      "name": "Moderati per l'Italia",
      "short": "MpI",
      "area": "Popolari Riformisti"
    },
    {
      "name": "Polo Moderato",
      "short": "PM",
      "area": "Centro Moderato"
    },
    {
      "name": "Alleanza Popolare",
      "short": "AP",
      "area": "Popolari Cristiani"
    },
    {
      "name": "Cristiano Democratici",
      "short": "CD",
      "area": "Centro-Destra"
    }
  ],
  "centro": [
    {
      "name": "Polo Riformista",
      "short": "PR",
      "area": "Centro Liberale"
    },
    {
      "name": "Azione Civica",
      "short": "AC",
      "area": "Liberal-Democratici"
    },
    {
      "name": "Liberali Italiani",
      "short": "LI",
      "area": "Centro Liberale"
    },
    {
      "name": "Voce Riformista",
      "short": "VR",
      "area": "Moderati Riformisti"
    },
    {
      "name": "Radicali Liberi",
      "short": "RL",
      "area": "Laici e Liberisti"
    },
    {
      "name": "Italia Aperta",
      "short": "IA",
      "area": "Europeisti Riformatori"
    },
    {
      "name": "Futuro Riformista",
      "short": "FR",
      "area": "Liberali"
    }
  ],
  "centrosinistra": [
    {
      "name": "Socialdemocrazia",
      "short": "SD",
      "area": "Centro-Sinistra Laburista"
    },
    {
      "name": "Unione Riformista",
      "short": "UR",
      "area": "Riformisti Progressisti"
    },
    {
      "name": "Movimento del Lavoro",
      "short": "MdL",
      "area": "Socialdemocratici"
    },
    {
      "name": "Progetto Progressista",
      "short": "PP",
      "area": "Eco-Socialisti"
    },
    {
      "name": "I Democratici",
      "short": "ID",
      "area": "Democratici Sociali"
    },
    {
      "name": "Avanti Sinistra",
      "short": "AS",
      "area": "Centro-Sinistra"
    },
    {
      "name": "Laboratorio Democratico",
      "short": "LD",
      "area": "Progressisti"
    }
  ],
  "sinistra": [
    {
      "name": "Sinistra e Lavoro",
      "short": "SeL",
      "area": "Sinistra di Classe"
    },
    {
      "name": "Fronte Popolare",
      "short": "FP",
      "area": "Anticapitalisti"
    },
    {
      "name": "Comunisti d'Italia",
      "short": "CdI",
      "area": "Comunisti"
    },
    {
      "name": "Lotta Sociale",
      "short": "LS",
      "area": "Sinistra Radicale"
    },
    {
      "name": "Rosso e Verde",
      "short": "ReV",
      "area": "Eco-Socialisti"
    },
    {
      "name": "Sinistra Rivoluzionaria",
      "short": "SR",
      "area": "Socialismo Radicale"
    },
    {
      "name": "Patto del Lavoro",
      "short": "PdL",
      "area": "Laburisti"
    }
  ],
  "m5s": [
    {
      "name": "Sovranità Popolare",
      "short": "SP",
      "area": "Populismo Costituzionale"
    },
    {
      "name": "Cittadini in Movimento",
      "short": "CiM",
      "area": "Civismo Radicale"
    },
    {
      "name": "La Rete Civica",
      "short": "LRC",
      "area": "Democrazia Diretta"
    },
    {
      "name": "Movimento 2050",
      "short": "M2050",
      "area": "Progressisti Civici"
    },
    {
      "name": "Italia a 5 Stelle",
      "short": "I5S",
      "area": "Beni Comuni"
    },
    {
      "name": "Beni Comuni e Legalità",
      "short": "BCL",
      "area": "Anticorruzione"
    }
  ],
  "autonomisti": [
    {
      "name": "Patto del Nord",
      "short": "PdN",
      "area": "Federalisti Padani"
    },
    {
      "name": "Lega Indipendente",
      "short": "LI",
      "area": "Autonomisti del Nord"
    },
    {
      "name": "Autonomia Veneta",
      "short": "AV",
      "area": "Autonomisti Veneti"
    },
    {
      "name": "Rinascita del Sud",
      "short": "RdS",
      "area": "Meridionalisti Autonomi"
    },
    {
      "name": "Movimento Territorio",
      "short": "MT",
      "area": "Comunità Locali"
    },
    {
      "name": "Federazione Popolare Autonoma",
      "short": "FPA",
      "area": "Regionalisti"
    }
  ]
};

// =========================================================================
// PROFILI TERRITORIALI E POLARIZZAZIONE REGIONALE REALISTICA (PUNTO 4)
// =========================================================================
export const REGIONAL_PROFILES = {
  "Piemonte": { lean: "Centro-Destra", businessWeight: 1.35, welfareWeight: 0.85, autonomyWeight: 1.15, favIssues: ['tax','industry','infra'] },
  "Valle d'Aosta": { lean: "Autonomisti", businessWeight: 1.05, welfareWeight: 1.0, autonomyWeight: 2.2, favIssues: ['inst','infra'] },
  "Lombardia": { lean: "Destra", businessWeight: 1.85, welfareWeight: 0.65, autonomyWeight: 1.5, favIssues: ['tax','industry','infra','imm'] },
  "Trentino-Alto Adige": { lean: "Autonomisti", businessWeight: 1.2, welfareWeight: 1.1, autonomyWeight: 2.4, favIssues: ['inst','welfare','energy'] },
  "Veneto": { lean: "Destra", businessWeight: 1.75, welfareWeight: 0.7, autonomyWeight: 1.95, favIssues: ['tax','inst','imm','industry'] },
  "Friuli-Venezia Giulia": { lean: "Destra", businessWeight: 1.4, welfareWeight: 0.8, autonomyWeight: 1.55, favIssues: ['tax','imm','infra'] },
  "Liguria": { lean: "Centro-Destra", businessWeight: 1.3, welfareWeight: 1.0, autonomyWeight: 1.0, favIssues: ['infra','tax','welfare'] },
  "Emilia-Romagna": { lean: "Centro-Sinistra", businessWeight: 1.25, welfareWeight: 1.6, autonomyWeight: 1.1, favIssues: ['welfare','work','rights','edu'] },
  "Toscana": { lean: "Centro-Sinistra", businessWeight: 1.0, welfareWeight: 1.7, autonomyWeight: 0.9, favIssues: ['welfare','work','rights','cultura'] },
  "Umbria": { lean: "Conteso", businessWeight: 1.05, welfareWeight: 1.3, autonomyWeight: 0.85, favIssues: ['welfare','work','infra'] },
  "Marche": { lean: "Centro-Destra", businessWeight: 1.4, welfareWeight: 1.05, autonomyWeight: 0.9, favIssues: ['industry','tax','infra'] },
  "Lazio": { lean: "Conteso", businessWeight: 1.15, welfareWeight: 1.25, autonomyWeight: 0.7, favIssues: ['inst','welfare','justice','tax'] },
  "Abruzzo": { lean: "Centro-Destra", businessWeight: 1.1, welfareWeight: 1.3, autonomyWeight: 0.9, favIssues: ['welfare','infra','tax'] },
  "Molise": { lean: "Centro-Destra", businessWeight: 0.9, welfareWeight: 1.45, autonomyWeight: 0.9, favIssues: ['welfare','infra'] },
  "Campania": { lean: "Centro-Sinistra / Populista", businessWeight: 0.75, welfareWeight: 1.95, autonomyWeight: 0.5, favIssues: ['welfare','work','sanita','justice'] },
  "Puglia": { lean: "Centro-Sinistra / Populista", businessWeight: 0.85, welfareWeight: 1.85, autonomyWeight: 0.6, favIssues: ['welfare','work','energy','agricoltura'] },
  "Basilicata": { lean: "Conteso", businessWeight: 0.9, welfareWeight: 1.65, autonomyWeight: 0.7, favIssues: ['energy','welfare','infra'] },
  "Calabria": { lean: "Centro-Destra / Assistenzialista", businessWeight: 0.7, welfareWeight: 2.1, autonomyWeight: 0.5, favIssues: ['welfare','infra','work','justice'] },
  "Sicilia": { lean: "Centro-Destra / Autonomista", businessWeight: 0.85, welfareWeight: 1.95, autonomyWeight: 1.45, favIssues: ['welfare','infra','inst','work'] },
  "Sardegna": { lean: "Conteso / Autonomista", businessWeight: 0.95, welfareWeight: 1.55, autonomyWeight: 1.65, favIssues: ['inst','energy','welfare'] }
};
