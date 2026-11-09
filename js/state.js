// =========================================================================
// MONTECITORIO - js/state.js
// Stato della Partita, Variabili Reattive, Accessor e Persistenza
// =========================================================================

import { FALLBACK_REGIONS, POLITICIANS, MINISTRIES, DOSSIERS, INITIAL_PARTIES, INITIAL_GOVERNORS } from './data.js';

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
      leader:{ name:"Giorgia Meloni", age:49, gender:"F", region:"Lazio", personalIdeo:3.3, prestige:84, internalSupport:82, compass:{ economic:0.9, social:1.4, ideoScore:3.3 }, history:["Presidente del Consiglio dei Ministri (Dal 2022)", "Deputato della Repubblica (Dal 2006)", "Ministro della Gioventù (2008–2011)"] },
      politicianHistoryMap:{},
      politicianRoleMap:{},
      politicianPartyMap:{},
      governors: JSON.parse(JSON.stringify(INITIAL_GOVERNORS)),
      regionalElectionCooldowns:{},
      playerPartyId:'fdi',
      partyRole:'secretary', // 'secretary' | 'member' | 'independent'
      funds:450,
      ap:100,
      govStability:76,
      spread:126,
      gdp:0.8,
      currentPM:"Giorgia Meloni",
      vicePremiers: ['salvini', 'tajani'], // PUNTO 4 (1.8.2): Carica accessoria di Vicepremier (es. Salvini e Tajani)
      currentGovCoalId:"cdx",
      isTechnicalGov:false,
      technocratPM:null,
      govPriority:'stabilità',
      lastElectionTurn:-999,
      legislature:19,
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
      president:{ name:"Sergio Mattarella", age:85, area:"Presidente della Repubblica", endDate:new Date(2029,1,2), trust:78, isPlayer:false },
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
        csx:{ id:'csx', name:'Campo Largo' },
        pld_c:{ id:'pld_c', name:'Polo Liberaldemocratico' },
        none:{ id:'none', name:'Non Coalizzati' }
      },
      // NOVITÀ 1.8: RITIRO VOLONTARIO, DECESSO NATURALE, LIMITE MANDATI, VARIETÀ PREMIER TECNICI, LOGO BUILDER E FILTRI
      isRetired:false,
      isDead:false,
      premierTermsServed:1,
      presTermsServed:1,
      pastTechPremiers:[],
      lastCongressTurn:-365,
      lawCategoryFilter:'all',
      customLogoDraft:{ bgColor:'#1d4ed8', ringStyle:'tricolor_ring', bannerStyle:'tricolor_wave', symbolId:'flame' },
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

export function getCoalName(cId) {
  if (!cId) return "Non Coalizzati";
  const key = String(cId).toLowerCase();
  return game.coalitions[key]?.name || game.coalitions[cId]?.name || cId || "Non Coalizzati";
}

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

    /* PUNTI 1, 2, 3, 4, 7 & 10: GESTIONE RUOLO DEL GIOCATORE, CRONOLOGIA CARRIERA UNIFORME E INCOMPATIBILITÀ ASSOLUTA TRA CARICHE */
export function ensurePlayerInPoliticians() {
      const pId = (game.partyRole === 'independent' || game.playerPartyId === 'ind') ? 'tech' : game.playerPartyId;
      const cleanLeader = String(game.leader.name || '').replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim();
      // Reset flag isPlayer su tutti i politici per evitare residui di partite precedenti
      POLITICIANS.forEach(x => { x.isPlayer = false; });

      // Cerca prima il politico reale corrispondente per nome (es. Luca Zaia, Ignazio La Russa, Sergio Mattarella, Giorgia Meloni)
      let realMatch = POLITICIANS.find(x => x.id !== 'player_leader_pol' && x.name.toLowerCase() === cleanLeader.toLowerCase());
      if (realMatch) {
        // Rimuovi eventuale clone fittizio player_leader_pol se il giocatore usa un personaggio reale
        const fakeIdx = POLITICIANS.findIndex(x => x.id === 'player_leader_pol');
        if (fakeIdx !== -1) POLITICIANS.splice(fakeIdx, 1);
        realMatch.isPlayer = true;
        realMatch.age = game.leader.age || realMatch.age;
        if (pId && pId !== 'tech') realMatch.partyId = pId;
        realMatch.comp = Math.max(75, Math.min(99, Math.round(game.leader.prestige || realMatch.comp || 85)));
        if (Array.isArray(realMatch.history) && realMatch.history.length > 0) {
          game.leader.history = [...realMatch.history];
        }
        return realMatch;
      }

      let existing = POLITICIANS.find(x => x.id === 'player_leader_pol');
      if (!existing) {
        existing = {
          id: 'player_leader_pol',
          name: game.leader.name,
          age: game.leader.age,
          partyId: pId,
          pref: 'esteri',
          isPlayer: true,
          comp: Math.max(76, Math.min(96, Math.round(game.leader.prestige))),
          clout: Math.max(75, Math.round(game.leader.prestige)),
          history: Array.isArray(game.leader.history) ? [...game.leader.history] : [`Dirigente Politico (Dal ${game?.date ? game.date.getFullYear() : 2026})`]
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

export function syncPartyNameWithLeader(party, newLeaderName) {
  if (!party || !newLeaderName) return;
  const cleanLeader = String(newLeaderName).replace(/\s*\(.*?\)/g, '').trim();
  const parts = cleanLeader.split(/\s+/);
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
  if (party.id === 'lega' || /Lega.*Premier/i.test(party.name)) {
    party.name = `Lega per ${lastName} Premier`;
  } else if (party.personalParty && party.founderLeader && party.name.includes(party.founderLeader.split(' ').pop())) {
    const oldLast = party.founderLeader.split(' ').pop();
    party.name = party.name.replace(oldLast, lastName);
  }
}

export function normalizeCareerTitle(rawEntry, newRole = null) {
  const src = String(newRole || rawEntry || '').trim();
  const full = String(rawEntry || '').trim();
  if (!src && !full) return '';

  // Se è un evento di fine mandato / sconfitta congressuale / uscita senza nuova carica istituzionale, ritorna marker di sola chiusura
  if (/^(?:Sfiduciato|Sconfitto al Congresso|Lascia la Segreteria|Restituisce la tessera|Lascia\s+\w+\s+e\s+aderisce|Cofondatore e Capocorrente|Aderisce a\s+)/i.test(full)
      || /^Capocorrente\b|^Ex Segretario\b|^Dirigente Nazionale\b|^Personalità Indipendente\b/i.test(src)) {
    return '__CLOSE_PARTY_LEADER__';
  }

  let s = src || full;
  // Rimuove emoji iniziali
  s = s.replace(/^[^\wÀ-ÿ]+/, '').trim();
  // Rimuove date o note tra parentesi finali (es. "(Governo Meloni)", "(3° scrutinio, 512 voti)", "(battuto ...)")
  s = s.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();

  if (/Presidente della Repubblica/i.test(s) || /Presidente della Repubblica/i.test(full)) {
    return 'Presidente della Repubblica';
  }
  if (/Presidente del Consiglio|Premier/i.test(s) || /Presidente del Consiglio/i.test(full)) {
    return 'Presidente del Consiglio dei Ministri';
  }
  if (/Presidente del Senato/i.test(s) || /Presidente del Senato/i.test(full)) {
    return 'Presidente del Senato della Repubblica';
  }
  if (/Presidente della Camera/i.test(s) || /Presidente della Camera/i.test(full)) {
    return 'Presidente della Camera dei Deputati';
  }
  const govMatch = (full + ' ' + s).match(/Presidente della Regione\s+([A-Za-zÀ-ÿ\s'-]+?)(?:\s*\(|$)/i);
  if (govMatch) {
    return `Presidente della Regione ${govMatch[1].trim()}`;
  }
  // Ministeri: converte "Ministero dell'Economia" o "Ministro: Economia" in "Ministro ..."
  if (/Ministro|Ministero/i.test(s) || /Ministro|Ministero/i.test(full)) {
    let mName = s.replace(/^.*?(?:Nominato|Nominata)\s+/i, '').replace(/^[^\wÀ-ÿ]+/, '').trim();
    mName = mName.replace(/^Ministero\b/i, 'Ministro').replace(/^Ministro:\s*/i, 'Ministro ').trim();
    if (!/^Ministro\b/i.test(mName)) mName = 'Ministro ' + mName;
    return mName;
  }
  // Segretario di partito
  const secMatch = s.match(/^(?:Segretario Nazionale|Segretario Fondatore)\s+([A-Za-z0-9À-ÿ'+-]+)/i)
                || full.match(/Segretario Nazionale di\s+([A-Za-z0-9À-ÿ'+-]+)/i)
                || full.match(/Congresso(?: Nazionale)? di\s+([A-Za-z0-9À-ÿ'+-]+)/i);
  if (secMatch) {
    return `Segretario Nazionale ${secMatch[1].trim()}`;
  }

  // Pulizia generica di fallback
  s = s.replace(/^(?:Eletto|Eletta|Nominato|Nominata|Rieletto|Rieletta|Confermato|Confermata|Assume la guida di|Subentra come)\s+/i, '').trim();
  return s;
}

function getOfficeCategory(title) {
  const low = title.toLowerCase().trim();
  if (low.includes('presidente della repubblica')) return 'quirinale';
  if (low.includes('presidente del consiglio') || low.includes('premier')) return 'pm';
  if (low.includes('presidente del senato')) return 'senate';
  if (low.includes('presidente della camera')) return 'chamber';
  if (low.includes('viceministr') || low.includes('sottosegretar')) return 'sub_ministry';
  if (low.includes('ministro')) return 'ministry';
  if (low.includes('presidente della regione') || low.includes('presidente regione') || low.includes('presidente provincia autonoma') || low.includes('governatore')) return 'governor';
  if (!low.includes('vice') && (low.startsWith('segretari') || low.startsWith('leader ') || low.startsWith('portavoce nazionale') || low.startsWith('presidente m5s') || low.startsWith('presidente pdf'))) return 'party_leader';
  if (low.includes('capogruppo')) return 'capogruppo';
  if (low.includes('deputat') || low.includes('senat') || low.includes('europarlamentare')) return 'mp';
  return 'other';
}

function closePreviousOngoingEntries(histList, newCategory, curYear) {
  if (!Array.isArray(histList)) return;
  for (let i = 0; i < histList.length; i++) {
    const item = histList[i];
    const m = item.match(/^(.*?)\s*\(Dal\s+(\d{4})\)$/i);
    if (!m) continue;
    const baseTitle = m[1].trim();
    const startYr = parseInt(m[2], 10);
    const cat = getOfficeCategory(baseTitle);
    // Le cariche esecutive/istituzionali di vertice (Quirinale, Premier, Ministro, Presidenti Camere, Governatore) sono mutuamente esclusive
    const isTopExclusive = ['quirinale', 'pm', 'senate', 'chamber', 'ministry', 'governor'].includes(newCategory)
                        && ['quirinale', 'pm', 'senate', 'chamber', 'ministry', 'governor'].includes(cat);
    const isSameCat = (cat === newCategory && cat !== 'other');
    // PUNTO 22: Segretario di partito e Governatore regionale sono incompatibili tra loro
    const isSecGovIncompatible = (newCategory === 'party_leader' && cat === 'governor')
                              || (newCategory === 'governor' && cat === 'party_leader');
    if (isTopExclusive || isSameCat || isSecGovIncompatible) {
      histList[i] = startYr >= curYear ? `${baseTitle} (${startYr})` : `${baseTitle} (${startYr}–${curYear})`;
    }
  }
}

export function recordPoliticianHistory(polIdOrName, entry, newRole = null) {
  if (!polIdOrName || !entry) return;
  const cleanTarget = String(polIdOrName).replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim();
  const p = getPoliticianById(polIdOrName)
         || getPoliticianById(cleanTarget)
         || POLITICIANS.find(x => x.name === cleanTarget || x.id === cleanTarget);

  const curYear = (game?.date instanceof Date && !isNaN(game.date.getFullYear())) ? game.date.getFullYear() : 2026;
  const cleanTitle = normalizeCareerTitle(entry, newRole);
  if (!cleanTitle) return;

  if (!game.politicianHistoryMap) game.politicianHistoryMap = {};
  if (!game.politicianRoleMap) game.politicianRoleMap = {};

  if (cleanTitle === '__CLOSE_PARTY_LEADER__') {
    if (p && Array.isArray(p.history)) {
      closePreviousOngoingEntries(p.history, 'party_leader', curYear);
      game.politicianHistoryMap[p.id] = [...p.history];
      if (newRole) {
        p.role = newRole;
        game.politicianRoleMap[p.id] = newRole;
      }
    }
    const leaderClean = String(game?.leader?.name || '').replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim();
    if ((cleanTarget === leaderClean || polIdOrName === 'player_leader_pol' || (p && p.isPlayer)) && Array.isArray(game.leader.history)) {
      closePreviousOngoingEntries(game.leader.history, 'party_leader', curYear);
    }
    return;
  }

  const fullEntry = `${cleanTitle} (Dal ${curYear})`;
  const newCat = getOfficeCategory(cleanTitle);

  if (p) {
    if (!Array.isArray(p.history)) p.history = [];
    // Se la stessa carica è già attiva in cima, non duplicarla
    const alreadyTop = p.history.some(h => h.toLowerCase().startsWith(cleanTitle.toLowerCase() + ' (dal '));
    if (!alreadyTop) {
      closePreviousOngoingEntries(p.history, newCat, curYear);
      if (!p.history.includes(fullEntry)) {
        p.history.unshift(fullEntry);
      }
    }
    game.politicianHistoryMap[p.id] = [...p.history];
    if (newRole) {
      p.role = newRole;
      game.politicianRoleMap[p.id] = newRole;
    }
  }

  // Se riguarda il giocatore, aggiorna anche game.leader.history
  const leaderClean = String(game?.leader?.name || '').replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim();
  if (cleanTarget === leaderClean || polIdOrName === 'player_leader_pol' || (p && p.isPlayer)) {
    if (!Array.isArray(game.leader.history)) {
      game.leader.history = p && Array.isArray(p.history) ? [...p.history] : [];
    }
    const alreadyLeaderTop = game.leader.history.some(h => h.toLowerCase().startsWith(cleanTitle.toLowerCase() + ' (dal '));
    if (!alreadyLeaderTop) {
      closePreviousOngoingEntries(game.leader.history, newCat, curYear);
      if (!game.leader.history.includes(fullEntry)) {
        game.leader.history.unshift(fullEntry);
      }
    }
  }
}

export function getPlayerMinistry() {
  if (game.isImprisoned) return null;
  // Se il giocatore è Presidente della Repubblica, Premier o Presidente di Camera/Senato, NON può essere contemporaneamente Ministro
  const cleanLeader = String(game.leader.name || '').replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim();
  const isPres = game.president && (game.president.isPlayer || String(game.president.name).replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim() === cleanLeader);
  const isPM = (game.currentPM === game.leader.name || game.currentPM === `${game.leader.name} (Tecnico)`);
  const isSpeaker = (game.senateSpeaker?.name === cleanLeader || game.chamberSpeaker?.name === cleanLeader);
  if (isPres || isPM || isSpeaker) return null;
  for (const m of MINISTRIES) {
    const holder = game.cabinet[m.id];
    if (holder && (holder.isPlayer || holder.name === game.leader.name || holder.id === 'player_leader_pol')) {
      return { id: m.id, name: m.name, weight: m.weight, ministry: m, pol: holder };
    }
  }
  return null;
}

export function getPlayerGovernorship() {
  if (!game.governors) return null;
  const cleanLeader = String(game.leader?.name || '').replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim();
  for (const [regId, gov] of Object.entries(game.governors)) {
    if (gov && String(gov.name || '').trim().toLowerCase() === cleanLeader.toLowerCase()) {
      return gov;
    }
  }
  return null;
}

export function vacateOfficesForPresident(target) {
  if (!target) return;
  const name = typeof target === 'object' ? target.name : target;
  const clean = String(name).replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim();

  // Aggiorna il ruolo e la storia del politico eletto al Quirinale (PUNTO 6, 7 & 8: rimuove "Garante della Costituzione" e NON toglie la segreteria di partito)
  const electedPol = POLITICIANS.find(p => p.name === clean || p.id === target?.id);
  let originLabel = "Presidente della Repubblica";
  if (electedPol) {
    const oldParty = game.parties?.find(pt => pt.id === electedPol.partyId);
    if (oldParty && oldParty.id !== 'tech' && oldParty.id !== 'ind') {
      originLabel = `Presidente della Repubblica (${oldParty.short})`;
    }
    electedPol.role = (game.stateForm === 'presidenziale')
      ? "Presidente della Repubblica e Capo dell'Esecutivo"
      : "Presidente della Repubblica";
    if (!game.politicianRoleMap) game.politicianRoleMap = {};
    game.politicianRoleMap[electedPol.id] = electedPol.role;
  }
  if (game.president && String(game.president.name).replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim() === clean) {
    game.president.area = (game.stateForm === 'presidenziale')
      ? "Presidente della Repubblica e dell'Esecutivo"
      : originLabel;
  }
  recordPoliticianHistory(clean, "Eletto Presidente della Repubblica al Quirinale", electedPol?.role || "Presidente della Repubblica");

  // Nel Presidenzialismo il Presidente della Repubblica È anche Capo del Governo! (PUNTO 21)
  if (game.stateForm === 'presidenziale') {
    game.currentPM = clean;
  } else {
    // 1. Incompatibilità con la Presidenza del Consiglio: se il Premier è eletto Presidente della Repubblica, nomina un successore autorevole di governo
    if (game.currentPM && game.currentPM.replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim() === clean) {
      const govPartyIds = (game.parties || []).filter(pt => pt.inGov).map(pt => pt.id);
      const successor = POLITICIANS.find(p => govPartyIds.includes(p.partyId) && p.name !== clean && !getPersonCurrentOffice(p.name))
                     || POLITICIANS.find(p => ['tajani_p', 'salvini_p', 'giorgetti_p', 'crosetto'].includes(p.id) && p.name !== clean);
      game.currentPM = successor ? successor.name : "Interim Istituzionale";
      if (successor) {
        recordPoliticianHistory(successor.name, "Nominato Presidente del Consiglio dei Ministri", "Presidente del Consiglio");
      }
      game.govStability = Math.max(35, game.govStability - 15);
    }
  }

  // 2. Incompatibilità Presidenza del Senato: scegli un senatore anziano che NON ricopra già un'altra carica di Stato!
  if (game.senateSpeaker && game.senateSpeaker.name.replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim() === clean) {
    const alt = POLITICIANS.find(p => (p.partyId === 'fdi' || p.partyId === 'fi') && p.name !== clean && p.age >= 50 && !getPersonCurrentOffice(p.name))
             || POLITICIANS.find(p => p.partyId === 'tech' && p.name !== clean && p.age >= 50 && !getPersonCurrentOffice(p.name));
    game.senateSpeaker = alt ? { id: alt.id, name: alt.name, partyId: alt.partyId } : { id: 'vice_sen', name: 'Vicepresidente Vicario del Senato', partyId: 'ind' };
    if (alt) recordPoliticianHistory(alt.name, "Eletto Presidente del Senato della Repubblica", "Presidente del Senato");
  }

  // 3. Incompatibilità Presidenza della Camera: scegli un deputato anziano che NON ricopra già un'altra carica di Stato!
  if (game.chamberSpeaker && game.chamberSpeaker.name.replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim() === clean) {
    const alt = POLITICIANS.find(p => (p.partyId === 'lega' || p.partyId === 'fdi') && p.name !== clean && p.age >= 45 && !getPersonCurrentOffice(p.name))
             || POLITICIANS.find(p => p.partyId === 'tech' && p.name !== clean && p.age >= 45 && !getPersonCurrentOffice(p.name));
    game.chamberSpeaker = alt ? { id: alt.id, name: alt.name, partyId: alt.partyId } : { id: 'vice_cam', name: 'Vicepresidente Vicario della Camera', partyId: 'ind' };
    if (alt) recordPoliticianHistory(alt.name, "Eletto Presidente della Camera dei Deputati", "Presidente della Camera");
  }

  // 4. Incompatibilità Ministeriale: se era ministro, riassegna il dicastero a un sostituto del partito o interim
  if (game.cabinet) {
    for (const mId of Object.keys(game.cabinet)) {
      const holder = game.cabinet[mId];
      if (holder && holder.name && holder.name.replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim() === clean) {
        const mObj = MINISTRIES.find(x => x.id === mId);
        const alt = POLITICIANS.find(p => p.partyId === holder.partyId && p.name !== clean && !getPersonCurrentOffice(p.name))
                 || POLITICIANS.find(p => p.partyId === 'tech' && p.name !== clean && !getPersonCurrentOffice(p.name));
        game.cabinet[mId] = alt || { id: `interim_${mId}`, name: 'Sottosegretario Vicario', partyId: holder.partyId || 'tech', competence: 75 };
        if (alt && mObj) {
          recordPoliticianHistory(alt.name, `Nominato Ministro: ${mObj.name.split(' (')[0]}`, `Ministro ${mObj.name.split(' (')[0]}`);
        }
      }
    }
  }

  // PUNTO 7: NON rimuovere la carica di Segretario Nazionale di partito se si viene eletti Presidente della Repubblica
  enforceSingleOfficeRule();
}

export function isSemestreBianco() {
  if (!game.president || !game.president.endDate) return false;
  const pEnd = new Date(game.president.endDate).getTime();
  const now = new Date(game.date).getTime();
  const sixMonthsMs = 182.5 * 24 * 3600 * 1000;
  const isPresidentLast6Months = (pEnd - now) <= sixMonthsMs && (pEnd - now) > 0;
  const legEnd = new Date(game.nextElectionDate).getTime();
  const isLegLast6Months = (legEnd - now) <= sixMonthsMs && (legEnd - now) > 0;
  return isPresidentLast6Months && !isLegLast6Months;
}

export function getPoliticiansForParty(partyId) {
  return POLITICIANS.filter(p => p.partyId === partyId);
}

export function getPoliticianById(id) {
  if (!id) return null;
  return POLITICIANS.find(p => p.id === id || p.name === id);
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
      if (ignoreSlot !== 'president' && !(game.stateForm === 'presidenziale' && ignoreSlot === 'pm') && game.president && matchPerson(null, game.president.name)) {
        return game.stateForm === 'presidenziale'
          ? "Presidente della Repubblica e Capo dell'Esecutivo"
          : 'Presidente della Repubblica (Quirinale)';
      }
      // 2. Presidente del Consiglio (Premier)
      const pmName = useDraft ? (typeof draftPMName !== 'undefined' ? draftPMName : game.currentPM) : game.currentPM;
      if (ignoreSlot !== 'pm' && !(game.stateForm === 'presidenziale' && ignoreSlot === 'president') && pmName && matchPerson(null, pmName)) {
        return game.stateForm === 'presidenziale'
          ? "Presidente della Repubblica e Capo dell'Esecutivo"
          : 'Presidente del Consiglio (Palazzo Chigi)';
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
      // 6. Presidente di Regione (Governatore) - Incompatibilità costituzionale Art. 122 Cost. e incompatibilità con Segretario di Partito (PUNTO 22)
      if (game.governors && ignoreSlot !== 'governor') {
        for (const [regId, gov] of Object.entries(game.governors)) {
          if (ignoreSlot === 'gov:' + regId) continue;
          if (gov && matchPerson(gov.polId, gov.name)) {
            return `Presidente della Regione ${regId}`;
          }
        }
      }
      // 7. PUNTO 22, 23 & PUNTO 6 (1.8.1): I Segretari Nazionali di partito non possono candidarsi a Governatore (incompatibilità con la carica)
      if (ignoreSlot === 'governor' || (typeof ignoreSlot === 'string' && ignoreSlot.startsWith('gov:'))) {
        const ledParty = (game.parties || []).find(pt => matchPerson(null, pt.leader));
        if (ledParty) return `Segretario Nazionale ${ledParty.short}`;
      }
      // Se non si sta controllando lo slot secretary, segnala se la persona è Segretario Nazionale di partito
      if (ignoreSlot !== 'secretary') {
        const ledParty = (game.parties || []).find(pt => matchPerson(null, pt.leader));
        if (ledParty) return `Segretario Nazionale ${ledParty.short}`;
      }
      return null;
    }

    /* PUNTO 6: SINCRONIZZAZIONE AUTOMATICA E CHIUSURA CARICHE CONCLUSE NEL CV DI TUTTI I POLITICI */
export function syncAllPoliticianCareersWithCurrentState() {
      const curYear = (game?.date instanceof Date && !isNaN(game.date.getFullYear())) ? game.date.getFullYear() : 2026;
      const norm = (s) => String(s || '').replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim().toLowerCase();

      const activePres = norm(game.president?.name);
      const activePM = norm(game.currentPM);
      const activeSen = norm(game.senateSpeaker?.name);
      const activeCham = norm(game.chamberSpeaker?.name);

      const activeMinMap = new Map();
      if (game.cabinet) {
        for (const m of MINISTRIES) {
          const holder = game.cabinet[m.id];
          if (holder && holder.name) {
            activeMinMap.set(norm(holder.name), `Ministro ${m.name.split(' (')[0]}`);
          }
        }
      }

      const activeGovMap = new Map();
      if (game.governors) {
        for (const [regId, gov] of Object.entries(game.governors)) {
          if (gov && gov.name) {
            activeGovMap.set(norm(gov.name), regId);
          }
        }
      }

      const activeLeaderMap = new Map();
      if (Array.isArray(game.parties)) {
        for (const pt of game.parties) {
          if (pt && pt.leader) {
            activeLeaderMap.set(norm(pt.leader), pt.short || pt.name);
          }
        }
      }

      const govPartyIds = new Set((game.parties || []).filter(pt => pt.inGov).map(pt => pt.id));
      if (!game.politicianHistoryMap) game.politicianHistoryMap = {};
      if (!game.politicianRoleMap) game.politicianRoleMap = {};

      const syncHistoryList = (histList, pNorm, partyId) => {
        if (!Array.isArray(histList)) return;
        for (let i = 0; i < histList.length; i++) {
          const item = histList[i];
          const m = item.match(/^(.*?)\s*\(Dal\s+(\d{4})\)$/i);
          if (!m) continue;
          const baseTitle = m[1].trim();
          const startYr = parseInt(m[2], 10);
          const cat = getOfficeCategory(baseTitle);
          let shouldClose = false;

          if (cat === 'quirinale' && pNorm !== activePres) shouldClose = true;
          else if (cat === 'pm' && pNorm !== activePM) shouldClose = true;
          else if (cat === 'senate' && pNorm !== activeSen) shouldClose = true;
          else if (cat === 'chamber' && pNorm !== activeCham) shouldClose = true;
          else if (cat === 'ministry' && !activeMinMap.has(pNorm)) shouldClose = true;
          else if (cat === 'sub_ministry' && (activeMinMap.has(pNorm) || pNorm === activePM || pNorm === activePres || (partyId && partyId !== 'tech' && govPartyIds.size > 0 && !govPartyIds.has(partyId)))) shouldClose = true;
          else if (cat === 'governor') {
            const curReg = activeGovMap.get(pNorm);
            if (!curReg || !baseTitle.toLowerCase().includes(curReg.toLowerCase())) shouldClose = true;
          }
          else if (cat === 'party_leader' && !activeLeaderMap.has(pNorm)) shouldClose = true;

          if (shouldClose) {
            histList[i] = startYr >= curYear ? `${baseTitle} (${startYr})` : `${baseTitle} (${startYr}–${curYear})`;
          }
        }
      };

      for (const pol of POLITICIANS) {
        const pNorm = norm(pol.name);
        if (!pNorm) continue;
        if (!Array.isArray(pol.history)) pol.history = [];
        syncHistoryList(pol.history, pNorm, pol.partyId);

        // Assicura che la carica attiva attuale sia registrata in cima a pol.history e aggiorna pol.role
        let currentLiveTitle = null;
        let currentRoleBadge = null;
        if (pNorm === activePres) {
          currentLiveTitle = 'Presidente della Repubblica';
          currentRoleBadge = game.stateForm === 'presidenziale' ? "Presidente della Repubblica e Capo dell'Esecutivo" : 'Presidente della Repubblica';
        } else if (pNorm === activePM) {
          currentLiveTitle = 'Presidente del Consiglio dei Ministri';
          currentRoleBadge = activeLeaderMap.has(pNorm) ? `Presidente del Consiglio & Segretario ${activeLeaderMap.get(pNorm)}` : 'Presidente del Consiglio dei Ministri';
        } else if (pNorm === activeSen) {
          currentLiveTitle = 'Presidente del Senato della Repubblica';
          currentRoleBadge = 'Presidente del Senato della Repubblica';
        } else if (pNorm === activeCham) {
          currentLiveTitle = 'Presidente della Camera dei Deputati';
          currentRoleBadge = 'Presidente della Camera dei Deputati';
        } else if (activeMinMap.has(pNorm)) {
          currentLiveTitle = activeMinMap.get(pNorm);
          currentRoleBadge = activeLeaderMap.has(pNorm) ? `${currentLiveTitle} & Segretario ${activeLeaderMap.get(pNorm)}` : currentLiveTitle;
        } else if (activeGovMap.has(pNorm)) {
          currentLiveTitle = `Presidente della Regione ${activeGovMap.get(pNorm)}`;
          currentRoleBadge = currentLiveTitle;
        } else if (activeLeaderMap.has(pNorm)) {
          currentLiveTitle = `Segretario Nazionale ${activeLeaderMap.get(pNorm)}`;
          currentRoleBadge = `Segretario Nazionale ${activeLeaderMap.get(pNorm)}`;
        } else if (pol.role && /^(?:Presidente del Consiglio|Ministro\b|Vicepremier|Presidente del Senato|Presidente della Camera|Presidente della Regione|Governatore|Segretario Nazionale)/i.test(pol.role)) {
          // Se aveva un ruolo esecutivo/governativo scaduto nel sottotitolo, aggiornalo a Parlamentare / Dirigente
          currentRoleBadge = pol.partyId === 'tech' ? 'Personalità Istituzionale / Tecnico' : 'Parlamentare & Dirigente Nazionale';
        }

        if (currentLiveTitle) {
          const hasOngoing = pol.history.some(h => {
            const low = h.toLowerCase();
            return low.includes('(dal ') && getOfficeCategory(h.replace(/\s*\(Dal.*$/i, '')) === getOfficeCategory(currentLiveTitle);
          });
          if (!hasOngoing) {
            pol.history.unshift(`${currentLiveTitle} (Dal ${curYear})`);
          }
        }
        if (currentRoleBadge) {
          pol.role = currentRoleBadge;
          game.politicianRoleMap[pol.id] = currentRoleBadge;
        }
        game.politicianHistoryMap[pol.id] = [...pol.history];
      }

      // Sincronizza anche game.leader.history
      const leaderNorm = norm(game.leader?.name);
      if (leaderNorm && Array.isArray(game.leader?.history)) {
        syncHistoryList(game.leader.history, leaderNorm, game.playerPartyId);
        const matchingPol = POLITICIANS.find(p => norm(p.name) === leaderNorm);
        if (matchingPol && Array.isArray(matchingPol.history) && matchingPol.history.length > 0) {
          game.leader.history = [...matchingPol.history];
        }
      }
    }

    /* PUNTO 1, 3, 7, 10, 22, 23, 28 & PUNTO 14, 16 (1.8.1): GARANZIA ANTI-DOPPIE CARICHE, ESCLUSIONE RITIRATI ED EX-PRESIDENTI */
export function enforceSingleOfficeRule() {
      const seenNames = new Set();
      const norm = (s) => String(s || '').replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim().toLowerCase();

      // PUNTI 14 & 16 (1.8.1): Gli Ex-Presidenti della Repubblica e chi è ritirato dalla vita politica (Modalità Spettatore) NON possono assumere ministeri o presidenza del consiglio
      const exPresNames = new Set(['sergio mattarella', 'mattarella', 'giorgio napolitano']);
      if (game.pastPresidents) {
        game.pastPresidents.forEach(p => exPresNames.add(norm(p)));
      }
      if (game.isRetired && game.leader?.name) {
        seenNames.add(norm(game.leader.name));
        if (norm(game.currentPM) === norm(game.leader.name)) {
          game.currentPM = 'Marta Cartabia (Tecnico)';
        }
        if (game.president?.isPlayer || norm(game.president?.name) === norm(game.leader.name)) {
          game.president.isPlayer = false;
          game.president.name = 'Marta Cartabia';
          game.president.area = 'Presidente della Repubblica';
        }
      }

      // 1. Presidente della Repubblica (Quirinale) ha priorità assoluta
      const presName = norm(game.president?.name);
      if (presName) seenNames.add(presName);

      // 2. Presidente del Consiglio (Palazzo Chigi)
      let pmName = norm(game.currentPM);
      if (pmName) {
        if (game.stateForm !== 'presidenziale' && seenNames.has(pmName)) {
          const govPartyIds = (game.parties || []).filter(pt => pt.inGov).map(pt => pt.id);
          const altPM = POLITICIANS.find(p => govPartyIds.includes(p.partyId) && !seenNames.has(norm(p.name)))
                     || POLITICIANS.find(p => p.partyId === 'tech' && !seenNames.has(norm(p.name)));
          if (altPM) {
            game.currentPM = game.isTechnicalGov ? `${altPM.name} (Tecnico)` : altPM.name;
            pmName = norm(altPM.name);
          }
        }
        seenNames.add(pmName);
      }

      // 3. Presidente del Senato (PUNTO 11 1.8.2: Richiede età minima 40 anni ex Art. 58 Cost. ed esclusione opposizione in governi tecnici)
      const senName = norm(game.senateSpeaker?.name);
      const senAge = game.senateSpeaker?.age || 50;
      const isPlayerOpposition = (game.senateSpeaker?.id === 'player_leader_pol' || senName === norm(game.leader?.name)) && !game.parties.find(x => x.id === game.playerPartyId)?.inGov && !game.isTechnicalGov;
      if (senName) {
        if (seenNames.has(senName) || senAge < 40 || isPlayerOpposition) {
          const govPartyIds = (game.parties || []).filter(pt => pt.inGov).map(pt => pt.id);
          const altSen = POLITICIANS.find(p => (govPartyIds.includes(p.partyId) || p.partyId === 'fdi') && p.age >= 50 && !seenNames.has(norm(p.name)))
                      || POLITICIANS.find(p => p.partyId === 'tech' && p.age >= 50 && !seenNames.has(norm(p.name)));
          if (altSen) {
            game.senateSpeaker = { id: altSen.id, name: altSen.name, age: altSen.age, partyId: altSen.partyId };
            seenNames.add(norm(altSen.name));
          }
        } else {
          seenNames.add(senName);
        }
      }

      // 4. Presidente della Camera
      const chamName = norm(game.chamberSpeaker?.name);
      if (chamName) {
        if (seenNames.has(chamName)) {
          const govPartyIds = (game.parties || []).filter(pt => pt.inGov).map(pt => pt.id);
          const altCham = POLITICIANS.find(p => (govPartyIds.includes(p.partyId) || p.partyId === 'lega') && p.age >= 40 && !seenNames.has(norm(p.name)))
                       || POLITICIANS.find(p => p.partyId === 'tech' && p.age >= 40 && !seenNames.has(norm(p.name)));
          if (altCham) {
            game.chamberSpeaker = { id: altCham.id, name: altCham.name, age: altCham.age, partyId: altCham.partyId };
            seenNames.add(norm(altCham.name));
          }
        } else {
          seenNames.add(chamName);
        }
      }

      // Nomi deiSegretari Nazionali di Partito (PUNTO 22 & 23: incompatibili con la carica di Governatore di Regione; la Segreteria Nazionale ha priorità!)
      const partySecretaryNames = new Set(
        (game.parties || []).map(pt => norm(pt?.leader)).filter(Boolean)
      );
      if (game.partyRole === 'secretary' && game.leader?.name) {
        partySecretaryNames.add(norm(game.leader.name));
      }

      // Nomi dei Governatori regionali attuali (che NON siano divenuti Segretari Nazionali) per evitare di assegnarli per errore a un Ministero automatico
      const activeGovernorNames = new Set(
        Object.values(game.governors || {})
          .map(g => norm(g?.name))
          .filter(n => n && !partySecretaryNames.has(n))
      );

      // 5. I 15 Ministeri del Governo: nessuno può essere contemporaneamente Presidente della Repubblica, Premier, Presidente di Camera/Senato, Governatore o doppio Ministro!
      if (game.cabinet) {
        const govPartyIds = (game.parties || []).filter(pt => pt.inGov).map(pt => pt.id);
        for (const m of MINISTRIES) {
          const holder = game.cabinet[m.id];
          const hName = norm(holder?.name);
          if (!holder || !hName || seenNames.has(hName) || activeGovernorNames.has(hName)) {
            const targetPartyId = game.isTechnicalGov ? 'tech' : (holder?.partyId || govPartyIds[0] || 'tech');
            let replacement = POLITICIANS.find(p => p.partyId === targetPartyId && p.pref === m.id && !seenNames.has(norm(p.name)) && !activeGovernorNames.has(norm(p.name)))
                           || POLITICIANS.find(p => p.partyId === targetPartyId && !seenNames.has(norm(p.name)) && !activeGovernorNames.has(norm(p.name)))
                           || POLITICIANS.find(p => govPartyIds.includes(p.partyId) && !seenNames.has(norm(p.name)) && !activeGovernorNames.has(norm(p.name)))
                           || POLITICIANS.find(p => p.partyId === 'tech' && !seenNames.has(norm(p.name)) && !activeGovernorNames.has(norm(p.name)));
            if (replacement) {
              game.cabinet[m.id] = replacement;
              seenNames.add(norm(replacement.name));
            }
          } else {
            seenNames.add(hName);
          }
        }
      }

      // 6. I 20 Governatori Regionali (PUNTI 22, 23 & 28):
      // - Se un Governatore è diventato Segretario Nazionale di partito o ha assunto una carica nazionale superiore (Quirinale, Premier, Camera/Senato, Ministro), lascia la Regione e subentra un nuovo Governatore!
      // - Se un Governatore ha cambiato partito (rimanendo semplice membro), aggiorna gov.partyId e gov.coalId col nuovo partito!
      if (game.governors) {
        for (const [regId, gov] of Object.entries(game.governors)) {
          if (!gov) continue;
          const gName = norm(gov.name);
          const polObj = POLITICIANS.find(p => p.id === gov.polId || norm(p.name) === gName);
          if (polObj && polObj.partyId && polObj.partyId !== 'tech' && polObj.partyId !== gov.partyId) {
            gov.partyId = polObj.partyId;
            const ptObj = (game.parties || []).find(pt => pt.id === polObj.partyId);
            if (ptObj && ptObj.coalId && ptObj.coalId !== 'none') gov.coalId = ptObj.coalId;
          }
          if (gName && (seenNames.has(gName) || partySecretaryNames.has(gName))) {
            const sub = POLITICIANS.find(p => p.partyId === gov.partyId && p.region === regId && !seenNames.has(norm(p.name)) && !partySecretaryNames.has(norm(p.name)))
                     || POLITICIANS.find(p => p.partyId === gov.partyId && !seenNames.has(norm(p.name)) && !partySecretaryNames.has(norm(p.name)))
                     || POLITICIANS.find(p => p.region === regId && p.partyId !== 'tech' && !seenNames.has(norm(p.name)) && !partySecretaryNames.has(norm(p.name)))
                     || POLITICIANS.find(p => p.partyId === 'tech' && !seenNames.has(norm(p.name)) && !partySecretaryNames.has(norm(p.name)));
            if (sub) {
              gov.polId = sub.id;
              gov.name = sub.name;
              gov.partyId = sub.partyId === 'tech' ? gov.partyId : sub.partyId;
              gov.termsServed = 1;
              seenNames.add(norm(sub.name));
            }
          } else if (gName) {
            seenNames.add(gName);
          }
        }
      }

      // 7. Sincronizza immediatamente i CV di tutti i politici (PUNTO 6)
      syncAllPoliticianCareersWithCurrentState();
    }

export function getP() {
      if (game.partyRole === 'independent' || game.playerPartyId === 'ind' || game.partyRole === 'president_rep') {
        return {
          id:'ind', name:`Indipendente (${game.leader.name})`, short:'IND', leader:game.leader.name,
          area:'Indipendente', coalId:'none', color:'#f8fafc', poll:+(game.leader.prestige * 0.05).toFixed(1),
          seats:0, inGov:(game.currentPM === game.leader.name || !!getPlayerMinistry()),
          credibility:game.leader.prestige, cohesion:100, orgStrength:35, stances:game.personalStances, baseStances:game.personalStances, vetoes:[]
        };
      }
      const partyList = (game.parties && game.parties.length > 0) ? game.parties : INITIAL_PARTIES;
      return partyList.find(p => p.id === game.playerPartyId) || partyList[0];
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

    // Ripristina la carriera dinamica, il ruolo e il partito dei politici salvati (PUNTI 1 & 16)
    if (game.politicianHistoryMap) {
      for (const [polId, hist] of Object.entries(game.politicianHistoryMap)) {
        const pol = POLITICIANS.find(x => x.id === polId);
        if (pol && Array.isArray(hist)) pol.history = [...hist];
      }
    }
    if (game.politicianRoleMap) {
      for (const [polId, role] of Object.entries(game.politicianRoleMap)) {
        const pol = POLITICIANS.find(x => x.id === polId);
        if (pol && role) pol.role = role;
      }
    }
    if ( game.politicianPartyMap) {
      for (const [polId, partyId] of Object.entries(game.politicianPartyMap)) {
        const pol = POLITICIANS.find(x => x.id === polId);
        if (pol && partyId) pol.partyId = partyId;
      }
    }
    if (!game.governors || Object.keys(game.governors).length === 0) {
      game.governors = JSON.parse(JSON.stringify(INITIAL_GOVERNORS));
    }
    if (!game.regionalElectionCooldowns) game.regionalElectionCooldowns = {};
    enforceSingleOfficeRule();

    return true;
  } catch (err) {
    console.error("Errore nel caricamento partita:", err);
    return false;
  }
}

export function hasSavedGame() {
  return !!localStorage.getItem('montecitorio_save_v6');
}


/* PUNTO 15 & 16 (1.8.1): DIMISSIONI VOLONTARIE DA QUALUNQUE CARICA E GESTIONE RITIRO POLITICO COMPLETO */
/* PUNTO 4 (1.8.2): GESTIONE DELLA CARICA ACCESSORIA DI VICEPREMIER */
export function isVicePremier(polOrId) {
  if (!game.vicePremiers || !polOrId) return false;
  const id = typeof polOrId === 'object' ? polOrId.id : polOrId;
  const name = typeof polOrId === 'object' ? polOrId.name : polOrId;
  if (game.vicePremiers.includes(id)) return true;
  return game.vicePremiers.some(vid => {
    const p = POLITICIANS.find(x => x.id === vid);
    return p && p.name === name;
  });
}

export function toggleVicePremier(polId) {
  if (!game.vicePremiers) game.vicePremiers = [];
  const idx = game.vicePremiers.indexOf(polId);
  if (idx >= 0) {
    game.vicePremiers.splice(idx, 1);
    return false;
  } else {
    if (game.vicePremiers.length >= 2) {
      game.vicePremiers.shift(); // Massimo 2 vicepremier consentiti
    }
    game.vicePremiers.push(polId);
    return true;
  }
}

export function getPlayerOfficesList() {
  const norm = (s) => String(s || '').replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim().toLowerCase();
  const leaderName = game.leader.name;
  const lNorm = norm(leaderName);
  const offices = [];

  // 1. Presidente del Consiglio
  if (norm(game.currentPM) === lNorm) {
    offices.push({ type: 'pm', label: 'Presidente del Consiglio dei Ministri (Palazzo Chigi)', desc: 'Apre la crisi di governo e rimette il mandato al Quirinale.' });
  }

  // 2. Presidente della Repubblica
  if (game.president?.isPlayer || norm(game.president?.name) === lNorm) {
    offices.push({ type: 'president', label: 'Presidente della Repubblica (Colle del Quirinale)', desc: 'Dimissioni anticipate dal Colle: supplenza al Presidente del Senato e convocazione elezioni.' });
  }

  // 3. Presidente del Senato
  if (norm(game.senateSpeaker?.name) === lNorm) {
    offices.push({ type: 'senate', label: 'Presidente del Senato della Repubblica (Palazzo Madama)', desc: 'Dimissioni dalla seconda carica dello Stato; subentra una nuova presidenza d\'aula.' });
  }

  // 4. Presidente della Camera
  if (norm(game.chamberSpeaker?.name) === lNorm) {
    offices.push({ type: 'chamber', label: 'Presidente della Camera dei Deputati (Montecitorio)', desc: 'Dimissioni dalla presidenza di Montecitorio; subentra una nuova presidenza d\'aula.' });
  }

  // 5. Ministro
  if (game.cabinet) {
    for (const m of MINISTRIES) {
      if (norm(game.cabinet[m.id]?.name) === lNorm) {
        offices.push({ type: 'minister', minId: m.id, label: `Ministro: ${m.name.split(' (')[0]}`, desc: `Riconsegna il portafoglio ministeriale; interim assunto dal Presidente del Consiglio.` });
      }
    }
  }

  // 6. Governatore Regionale
  if (game.governors) {
    for (const [regId, gov] of Object.entries(game.governors)) {
      if (norm(gov?.name) === lNorm || gov?.polId === 'player_leader_pol') {
        offices.push({ type: 'governor', regId, label: `Presidente della Regione ${regId} (Governatore)`, desc: `Dimissioni dalla guida della Regione: commissariamento ad acta e voto anticipato.` });
      }
    }
  }

  // 7. Segretario di Partito
  if (game.partyRole === 'secretary') {
    const p = getP();
    offices.push({ type: 'secretary', label: `Segretario Nazionale di ${p.name} (${p.short})`, desc: `Lascia la segreteria del partito e torni semplice militante/parlamentare della base.` });
  }

  return offices;
}

export function resignPlayerOffice(officeType) {
  const norm = (s) => String(s || '').replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim().toLowerCase();
  const leaderName = game.leader.name;
  const lNorm = norm(leaderName);
  let resigned = false;

  if (officeType === 'all' || officeType === 'pm') {
    if (norm(game.currentPM) === lNorm) {
      recordPoliticianHistory(leaderName, 'Rassegna le dimissioni da Presidente del Consiglio dei Ministri (Crisi di Governo)', 'Presidente del Consiglio');
      game.currentPM = 'In Consultazione (Quirinale)';
      game.govStability = 20;
      resigned = true;
    }
  }

  if (officeType === 'all' || officeType === 'president') {
    if (game.president?.isPlayer || norm(game.president?.name) === lNorm) {
      recordPoliticianHistory(leaderName, 'Rassegna le dimissioni anticipate da Presidente della Repubblica', 'Presidente della Repubblica');
      game.president.isPlayer = false;
      const senSpeaker = game.senateSpeaker?.name || 'Presidente del Senato';
      game.president.name = `${senSpeaker} (Reggente Supplenza Art. 86 Cost.)`;
      game.president.area = 'Supplenza Quirinale';
      game.president.endDate = new Date(game.date.getTime());
      resigned = true;
    }
  }

  if (officeType === 'all' || officeType === 'minister') {
    if (game.cabinet) {
      for (const m of MINISTRIES) {
        if (norm(game.cabinet[m.id]?.name) === lNorm) {
          recordPoliticianHistory(leaderName, `Rassegna le dimissioni da Ministro: ${m.name.split(' (')[0]}`, 'Ministro');
          delete game.cabinet[m.id];
          resigned = true;
        }
      }
    }
  }

  if (officeType === 'all' || officeType === 'senate') {
    if (norm(game.senateSpeaker?.name) === lNorm) {
      recordPoliticianHistory(leaderName, 'Rassegna le dimissioni da Presidente del Senato', 'Presidente del Senato');
      const altSen = POLITICIANS.find(p => p.partyId === 'tech' && p.age >= 50 && norm(p.name) !== lNorm)
                  || POLITICIANS.find(p => p.age >= 50 && norm(p.name) !== lNorm);
      if (altSen) {
        game.senateSpeaker = { id: altSen.id, name: altSen.name, age: altSen.age, partyId: altSen.partyId };
      }
      resigned = true;
    }
  }

  if (officeType === 'all' || officeType === 'chamber') {
    if (norm(game.chamberSpeaker?.name) === lNorm) {
      recordPoliticianHistory(leaderName, 'Rassegna le dimissioni da Presidente della Camera', 'Presidente della Camera');
      const altCham = POLITICIANS.find(p => p.partyId === 'tech' && p.age >= 40 && norm(p.name) !== lNorm)
                   || POLITICIANS.find(p => p.age >= 40 && norm(p.name) !== lNorm);
      if (altCham) {
        game.chamberSpeaker = { id: altCham.id, name: altCham.name, age: altCham.age, partyId: altCham.partyId };
      }
      resigned = true;
    }
  }

  if (officeType === 'all' || officeType === 'governor') {
    if (game.governors) {
      for (const [regId, gov] of Object.entries(game.governors)) {
        if (norm(gov?.name) === lNorm || gov?.polId === 'player_leader_pol') {
          recordPoliticianHistory(leaderName, `Rassegna le dimissioni da Presidente della Regione ${regId}`, 'Governatore');
          const sub = POLITICIANS.find(p => p.region === regId && p.partyId === gov.partyId && norm(p.name) !== lNorm)
                   || POLITICIANS.find(p => p.partyId === 'tech' && norm(p.name) !== lNorm);
          if (sub) {
            gov.polId = sub.id;
            gov.name = `${sub.name} (Commissario Straordinario)`;
            gov.partyId = sub.partyId;
            gov.termsServed = 1;
          }
          resigned = true;
        }
      }
    }
  }

  if (officeType === 'all' || officeType === 'secretary') {
    if (game.partyRole === 'secretary') {
      const p = getP();
      recordPoliticianHistory(leaderName, `Rassegna le dimissioni da Segretario Nazionale di ${p.short}`, 'Segretario');
      game.partyRole = 'member';
      const remaining = POLITICIANS.filter(pol => pol.partyId === p.id && norm(pol.name) !== lNorm && !pol.isPlayer);
      const newSec = [...remaining].sort((a,b) => (b.clout || b.prestige || 50) - (a.clout || a.prestige || 50))[0];
      if (newSec) {
        p.leader = newSec.name;
        p.leaderAge = newSec.age;
        syncPartyNameWithLeader(p, newSec.name);
        recordPoliticianHistory(newSec.name, `Eletto nuovo Segretario Nazionale di ${p.short} a seguito delle dimissioni di ${leaderName}`, `Segretario ${p.short}`);
      }
      resigned = true;
    }
  }

  enforceSingleOfficeRule();
  syncAllPoliticianCareersWithCurrentState();
  return resigned;
}
