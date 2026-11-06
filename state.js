// =========================================================================
// MONTECITORIO - js/state.js
// Stato della Partita, Variabili Reattive, Accessor e Persistenza
// =========================================================================

import { FALLBACK_REGIONS, POLITICIANS, MINISTRIES, DOSSIERS } from './data.js';

export function fmtDate(d) {
      if (!d || !(d instanceof Date)) return "03 Nov 2026";
      const days = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];
      const months = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
      return `${days[d.getDay()]} ${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

export let charMode = 'preset';
export function setCharModeState(m) { charMode = m; }

export let selectedStartPartyId = 'fdi';
export function setSelectedStartPartyIdState(id) { selectedStartPartyId = id; }

export const game = {
      turn:1,
      date:new Date(2026,10,3),
      nextElectionDate:new Date(2027,9,24),
      campaignActive:false,
      campaignDaysRemaining:0,
      // PUNTO 4: CAMPAGNA REFERENDARIA DI 30 GIORNI E COOLDOWN DI 1 ANNO PER TEMA
      activeReferendum:null,
      referendumCooldowns:{},
      // PUNTO 10 & 11: ANTI-SPAM AZIONI NELLO STESSO TURNO E COOLDOWN REGIONALE MAPPA
      turnActionsUsed:[],
      regCooldowns:{},
      lastNoConfidenceTurn:-999,
      leader:{ name:"Giorgia Meloni", age:49, gender:"F", region:"Lazio", personalIdeo:3.3, prestige:84, internalSupport:82 },
      playerPartyId:'fdi',
      partyRole:'secretary', // 'secretary' | 'member' | 'independent'
      funds:450,
      ap:100,
      govStability:76,
      spread:126,
      gdp:0.8,
      currentPM:"Giorgia Meloni",
      currentGovCoalId:"cdx",
      // ORDINAMENTO DELLO STATO E REGIME / GOLPE (PUNTI 4, 5, 8, 17)
      stateForm:'parlamentare', // 'parlamentare' | 'presidenziale' | 'premierato' | 'cancellierato' | 'federale' | 'assembleare'
      isDictatorship:false,
      dictatorshipName:null,
      revoltRisk:10,
      militaryLoyalty:30,
      isImprisoned:false,
      prisonDaysLeft:0,
      prisonReason:null,
      imprisonedLeader:null,
      inExile:false,
      exileHost:null,
      outlawedParties:[],
      // ALTE CARICHE DELLO STATO: QUIRINALE + PRESIDENTI DI SENATO E CAMERA (PUNTO 20)
      president:{ name:"Sergio Mattarella", age:85, area:"Garantista Costituzionale (Centro-Sinistra)", endDate:new Date(2029,1,2), trust:78, isPlayer:false },
      senateSpeaker:{ id:'larussa', name:"Ignazio La Russa", age:79, partyId:"fdi" },
      chamberSpeaker:{ id:'fontana_l', name:"Lorenzo Fontana", age:46, partyId:"lega" },
      // POLITICA ESTERA, UE & NATO (PUNTI 6 & 7)
      inEU:true,
      inNATO:true,
      defenseSpendGDP:1.6,
      foreignRels:{ usa:74, eu_com:72, ukraine:75, russia:18, china:44, med:68 },
      // LEGGI VIGENTI SUI 16 TEMI CALDI (PUNTO 9 + MORATORIA LEGISLATIVA v6.2.1)
      lawStates:{},
      lawCooldowns:{},
      referendumCooldowns:{},
      activeReferendum:null,
      regCooldowns:{},
      turnActionsUsed:[],
      coalitions:{
        cdx:{ id:'cdx', name:'Centrodestra' },
        csx:{ id:'csx', name:'Centrosinistra' },
        pld_c:{ id:'pld_c', name:'Polo Liberaldemocratico' },
        none:{ id:'none', name:'Non Coalizzati' }
      },
      parties:[],
      dissolvedParties:[],
      pairRelations:{},
      betrayalMemory:{},
      allySatisfaction:{},
      blocSympathy:{},
      personalStances:{ tax:2, work:2, pensions:2, welfare:2, rights:2, imm:2, justice:2, inst:2, eu:2, foreign:2, energy:2, infra:2, edu:2, industry:2 },
      issueSalience:{ tax:25, work:25, pensions:20, welfare:24, rights:16, imm:22, justice:16, inst:14, eu:16, foreign:16, energy:18, infra:15, edu:14, industry:18 },
      commStrategy:{ targetBloc1:'impiegati', targetBloc2:'piva', focusIssue:'tax', weeklyBudget:25 },
      flagshipIssues:new Set(['tax','work','welfare']),
      cabinet:{},
      budget:{ taxPressure:42.2, healthSpend:6.6, eduSpend:4.1, pensionSpend:16.2, investSpend:3.4, deficit:3.4, debtToGDP:137.8 },
      regOrg:{},
      regionPolls:{},
      geoRegions:FALLBACK_REGIONS,
      selectedMapRegion:"Lazio",
      selectedDossierPartyId:'fdi',
      seenEvents:new Set(),
      votedBills:new Set(),
      paletteIdx:0
    };


export let draftCabinet = {};
export function setDraftCabinet(val) { draftCabinet = val; }

export let draftSenateId = '';
export function setDraftSenateId(val) { draftSenateId = val; }

export let draftChamberId = '';
export function setDraftChamberId(val) { draftChamberId = val; }

export let draftGovParties = [];
export function setDraftGovParties(val) { draftGovParties = val; }

export let draftPMName = '';
export function setDraftPMName(val) { draftPMName = val; }

export let draftCoalKey = '';
export function setDraftCoalKey(val) { draftCoalKey = val; }

export function getPairRel(idA, idB) {
      if (idA === 'ind' || idB === 'ind') return 60;
      return game.pairRelations[idA]?.[idB] ?? 50;
    }
export function adjPairRel(idA, idB, delta) {
      if (idA === 'ind' || idB === 'ind') return;
      if (!game.pairRelations[idA]) game.pairRelations[idA] = {};
      if (!game.pairRelations[idB]) game.pairRelations[idB] = {};
      const v = Math.max(2, Math.min(100, getPairRel(idA, idB) + delta));
      game.pairRelations[idA][idB] = v;
      game.pairRelations[idB][idA] = v;
    }

export function getCoalName(cId) { return game.coalitions[cId]?.name || cId || "Non Coalizzati"; }

    /* PUNTO 10: BLOCCO SPAM AZIONI NELLO STESSO TURNO/GIORNO */
export function hasUsedTurnAction(key) {
      return Array.isArray(game.turnActionsUsed) && game.turnActionsUsed.includes(key);
    }
export function useTurnAction(key, label = "questa azione") {
      if (!Array.isArray(game.turnActionsUsed)) game.turnActionsUsed = [];
      if (game.turnActionsUsed.includes(key)) {
        alert(`⏳ Hai già svolto ${label} oggi (${fmtDate(game.date)})!\nFai avanzare il calendario di almeno +1 Giorno con la pulsantiera del tempo prima di ripetere la stessa azione.`);
        return false;
      }
      game.turnActionsUsed.push(key);
      return true;
    }

export function adjAllySat(delta) {
      game.parties.filter(p => p.inGov).forEach(p => {
        game.allySatisfaction[p.id] = Math.max(10, Math.min(100, (game.allySatisfaction[p.id] || 75) + delta));
      });
    }

    /* PUNTI 2, 12 & 17: GESTIONE RUOLO MINISTRO DEL GIOCATORE & INCOMPATIBILITÀ RIGOROSA TRA CARICHE DELLO STATO */
export function ensurePlayerInPoliticians() {
      const pId = (game.partyRole === 'independent' || game.playerPartyId === 'ind') ? 'tech' : game.playerPartyId;
      let existing = POLITICIANS.find(x => x.name === game.leader.name || x.id === 'player_leader_pol');
      if (!existing) {
        existing = {
          id: 'player_leader_pol',
          name: game.leader.name,
          age: game.leader.age,
          partyId: pId,
          pref: 'esteri',
          isPlayer: true,
          comp: Math.max(76, Math.min(96, Math.round(game.leader.prestige))),
          clout: Math.max(75, Math.round(game.leader.prestige))
        };
        POLITICIANS.unshift(existing);
      } else {
        existing.name = game.leader.name;
        existing.age = game.leader.age;
        existing.partyId = pId;
        existing.isPlayer = true;
        existing.comp = Math.max(75, Math.min(98, Math.round(game.leader.prestige || 82)));
      }
      return existing;
    }

export function getPlayerMinistry() {
      if (game.isImprisoned) return null;
      for (const m of MINISTRIES) {
        const holder = game.cabinet[m.id];
        if (holder && (holder.isPlayer || holder.name === game.leader.name || holder.id === 'player_leader_pol')) {
          return { id: m.id, name: m.name, weight: m.weight, ministry: m, pol: holder };
        }
      }
      return null;
    }

    /* Restituisce la carica già ricoperta da un politico (ignorando lo slot che si sta modificando), così NESSUNO può avere 2 cariche contemporaneamente! */
export function getPersonCurrentOffice(polOrIdOrName, ignoreSlot = null, useDraft = false) {
      if (!polOrIdOrName) return null;
      const polObj = typeof polOrIdOrName === 'object'
        ? polOrIdOrName
        : (POLITICIANS.find(x => x.id === polOrIdOrName || x.name === polOrIdOrName) || { id: polOrIdOrName, name: String(polOrIdOrName) });
      const cleanName = (polObj.name || '').replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim();
      if (!cleanName) return null;

      const matchPerson = (otherId, otherName) => {
        if (otherId && polObj.id && otherId === polObj.id) return true;
        if (!otherName) return false;
        const cOther = String(otherName).replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim();
        return cOther === cleanName;
      };

      // 1. Presidente della Repubblica
      if (ignoreSlot !== 'president' && game.president && matchPerson(null, game.president.name)) {
        return 'Presidente della Repubblica (Quirinale)';
      }
      // 2. Presidente del Consiglio (Premier)
      const pmName = useDraft ? (typeof draftPMName !== 'undefined' ? draftPMName : game.currentPM) : game.currentPM;
      if (ignoreSlot !== 'pm' && pmName && matchPerson(null, pmName)) {
        return 'Presidente del Consiglio (Palazzo Chigi)';
      }
      // 3. Presidente del Senato
      if (ignoreSlot !== 'senate') {
        const sId = useDraft ? (typeof draftSenateId !== 'undefined' ? draftSenateId : game.senateSpeaker?.id) : game.senateSpeaker?.id;
        const sPol = POLITICIANS.find(x => x.id === sId) || game.senateSpeaker;
        if (sPol && matchPerson(sPol.id, sPol.name)) return 'Presidente del Senato';
      }
      // 4. Presidente della Camera
      if (ignoreSlot !== 'chamber') {
        const cId = useDraft ? (typeof draftChamberId !== 'undefined' ? draftChamberId : game.chamberSpeaker?.id) : game.chamberSpeaker?.id;
        const cPol = POLITICIANS.find(x => x.id === cId) || game.chamberSpeaker;
        if (cPol && matchPerson(cPol.id, cPol.name)) return 'Presidente della Camera';
      }
      // 5. Titolare di uno dei 15 Ministeri
      for (const m of MINISTRIES) {
        if (ignoreSlot === m.id || ignoreSlot === 'min:' + m.id) continue;
        if (useDraft && typeof draftCabinet !== 'undefined') {
          const mPolId = draftCabinet[m.id];
          const mPol = POLITICIANS.find(x => x.id === mPolId);
          if (mPol && matchPerson(mPol.id, mPol.name)) return `Ministro: ${m.name.split(' (')[0]}`;
        } else {
          const mPol = game.cabinet?.[m.id];
          if (mPol && matchPerson(mPol.id, mPol.name)) return `Ministro: ${m.name.split(' (')[0]}`;
        }
      }
      return null;
    }

export function getP() {
      if (game.partyRole === 'independent' || game.playerPartyId === 'ind') {
        return {
          id:'ind', name:`Indipendente (${game.leader.name})`, short:'IND', leader:game.leader.name,
          area:'Indipendente', coalId:'none', color:'#f8fafc', poll:+(game.leader.prestige * 0.05).toFixed(1),
          seats:0, inGov:(game.currentPM === game.leader.name || !!getPlayerMinistry()),
          credibility:game.leader.prestige, cohesion:100, orgStrength:35, stances:game.personalStances, baseStances:game.personalStances, vetoes:[]
        };
      }
      return game.parties.find(p => p.id === game.playerPartyId) || game.parties[0];
    }

export function getPartyIdeoScore(p) {
      const st = p?.stances || game.personalStances;
      const vals = Object.values(st);
      return +(vals.reduce((a,b)=>a+b,0) / (vals.length || 1)).toFixed(2);
    }

export function getIdeoLabel(score) {
      if (score < 0.65) return "🚩 Estrema Sinistra / Rivoluzionaria";
      if (score < 1.25) return "🌹 Sinistra Radicale / Eco-Socialista";
      if (score < 1.75) return "🌿 Centro-Sinistra Progressista";
      if (score < 2.35) return "⚖️ Centro Liberale / Riformista";
      if (score < 2.85) return "🔵 Centro-Destra Popolare / Moderato";
      if (score < 3.45) return "🛡️ Destra Conservatrice / Sovranista";
      return "🦅 Estrema Destra / Nazionalista";
    }

export function computePartyDrift(p) {
      if (!p || p.id === 'ind' || !p.baseStances) return 0;
      let diff = 0;
      DOSSIERS.forEach(d => {
        diff += Math.abs((p.stances[d.key] ?? 2) - (p.baseStances[d.key] ?? 2));
      });
      return +(diff / DOSSIERS.length).toFixed(2);
    }

export function setBetrayal(idA, idB, days = 1825, reason = "Scissione / Tradimento politico") {
      if (!game.betrayalMemory[idA]) game.betrayalMemory[idA] = {};
      if (!game.betrayalMemory[idB]) game.betrayalMemory[idB] = {};
      game.betrayalMemory[idA][idB] = { days, reason };
      game.betrayalMemory[idB][idA] = { days, reason };
      adjPairRel(idA, idB, -60);
    }
export function getBetrayal(idA, idB) {
      const b = game.betrayalMemory[idA]?.[idB];
      return (b && b.days > 0) ? b : null;
    }

    /* PUNTO 1: RICALCOLO DINAMICO DEI VETI IN BASE AL PROGRAMMA EFFETTIVO! */
export function recalcDynamicVetoes() {
      game.parties.forEach(a => {
        if (!a.vetoes) a.vetoes = [];
        game.parties.forEach(b => {
          if (a.id === b.id) return;
          let diff = 0;
          DOSSIERS.forEach(d => diff += Math.abs((a.stances[d.key] ?? 2) - (b.stances[d.key] ?? 2)));
          const progScore = Math.max(0, Math.round(100 - (diff / 56) * 100));
          const ideoDist = Math.abs(getPartyIdeoScore(a) - getPartyIdeoScore(b));
          const hasBetrayal = !!getBetrayal(a.id, b.id);

          // Se due partiti ora hanno un programma molto simile (progScore >= 70% o ideoDist <= 0.75) e non c'è tradimento personale attivo, il vecchio veto ideologico CADE!
          if (!hasBetrayal && (progScore >= 70 || ideoDist <= 0.75)) {
            a.vetoes = a.vetoes.filter(v => v !== b.id);
            if (getPairRel(a.id, b.id) < 55) game.pairRelations[a.id][b.id] = 58;
          }
          // Viceversa, se si sono allontanati oltre 1.9 punti ideologici (o progScore < 28%), scatta il veto ideologico!
          else if (ideoDist >= 1.95 || progScore < 28) {
            if (!a.vetoes.includes(b.id)) a.vetoes.push(b.id);
          }
        });
      });
    }

// =========================================================================
// SALVATAGGIO E CARICAMENTO PARTITA (PERSISTENZA)
// =========================================================================
export function saveGame() {
  try {
    const serialized = {
      game: {
        ...game,
        date: game.date instanceof Date ? game.date.toISOString() : game.date,
        nextElectionDate: game.nextElectionDate instanceof Date ? game.nextElectionDate.toISOString() : game.nextElectionDate,
        president: game.president ? {
          ...game.president,
          endDate: game.president.endDate instanceof Date ? game.president.endDate.toISOString() : game.president.endDate
        } : null,
        seenEvents: Array.from(game.seenEvents || []),
        votedBills: Array.from(game.votedBills || []),
        flagshipIssues: Array.from(game.flagshipIssues || [])
      },
      charMode,
      selectedStartPartyId
    };
    localStorage.setItem('montecitorio_save_v6', JSON.stringify(serialized));
    return true;
  } catch (err) {
    console.error("Errore nel salvataggio partita:", err);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem('montecitorio_save_v6');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.game) return false;

    if (parsed.game.date) parsed.game.date = new Date(parsed.game.date);
    if (parsed.game.nextElectionDate) parsed.game.nextElectionDate = new Date(parsed.game.nextElectionDate);
    if (parsed.game.president && parsed.game.president.endDate) {
      parsed.game.president.endDate = new Date(parsed.game.president.endDate);
    }
    parsed.game.seenEvents = new Set(parsed.game.seenEvents || []);
    parsed.game.votedBills = new Set(parsed.game.votedBills || []);
    parsed.game.flagshipIssues = new Set(parsed.game.flagshipIssues || ['tax','work','welfare']);

    Object.assign(game, parsed.game);
    if (parsed.charMode) charMode = parsed.charMode;
    if (parsed.selectedStartPartyId) selectedStartPartyId = parsed.selectedStartPartyId;

    return true;
  } catch (err) {
    console.error("Errore nel caricamento partita:", err);
    return false;
  }
}

export function hasSavedGame() {
  return !!localStorage.getItem('montecitorio_save_v6');
}
