// =========================================================================
// MONTECITORIO - js/main.js
// Entry Point, Inizializzazione Applicazione e Binding Window per Handlers
// =========================================================================

import * as Data from './data.js';
import * as State from './state.js';
import * as Engine from './engine.js';
import * as UI from './ui.js';

import {
  FALLBACK_REGIONS,
  PRESET_POLITICIANS,
  POLITICIANS,
  DOSSIERS,
  INITIAL_PARTIES,
  BLOCS,
  HOT_LAWS
} from './data.js';

import {
  game,
  charMode,
  selectedStartPartyId,
  getP,
  getPlayerMinistry,
  computePartyDrift,
  getPartyIdeoScore,
  ensurePlayerInPoliticians,
  recordPoliticianHistory,
  syncPartyNameWithLeader
} from './state.js';

import {
  initDemographicCalibrated,
  initRegOrg,
  initAllPairRelationsAndCabinet,
  recalcPolls,
  computeBlocMatch
} from './engine.js';

import {
  applyPresetPreview,
  renderSetupParties,
  loadOfficialISTATGeoJSON,
  initCustomSelectEngine,
  applyDynamicPartyTheme,
  updateAllUI,
  addFeed
} from './ui.js';

export function initSetupUI() {
      const regSel = document.getElementById('inRegion');
      regSel.innerHTML = FALLBACK_REGIONS.map(r => `<option value="${r.id}" ${r.id==='Lazio'?'selected':''}>${r.id} (${r.lean})</option>`).join('');
      const polSel = document.getElementById('selRealPolitician');
      polSel.innerHTML = PRESET_POLITICIANS.map(p => `<option value="${p.id}">${p.name} (${p.age}a) — ${p.role==='secretary'?'Segretario':(p.role==='member'?'Capocorrente/Big':'Indipendente')} [${p.partyId.toUpperCase()}]</option>`).join('');
      applyPresetPreview();
      renderSetupParties();
      loadOfficialISTATGeoJSON();
    }


export function startGame() {
      game.isDictatorship = false;
      game.dictatorshipName = null;
      game.isImprisoned = false;
      game.prisonDaysLeft = 0;
      game.prisonReason = null;
      game.imprisonedLeader = null;
      game.inExile = false;
      game.exileHost = null;
      game.outlawedParties = [];
      game.dissolvedParties = [];
      game.turnActionsUsed = [];
      game.activeReferendum = null;
      game.lawCooldowns = {};
      game.referendumCooldowns = {};
      game.regCooldowns = {};
      game.politicianHistoryMap = {};
      game.politicianRoleMap = {};
      game.politicianPartyMap = {};
      game.president.isPlayer = false;
      game.parties = JSON.parse(JSON.stringify(INITIAL_PARTIES));
      // Salva le posizioni storiche fondative (baseStances, baseIdeo, initialPoll) per ogni partito (Punto 1 v6.2)
      game.parties.forEach(p => {
        p.baseStances = { ...p.stances };
        p.baseIdeo = getPartyIdeoScore(p);
        p.initialPoll = p.poll;
        p.lowPollWeeks = 0;
      });
      // Inizializza lo stato legale dei 16 temi caldi (Punto 9)
      HOT_LAWS.forEach(l => { game.lawStates[l.id] = l.currentIdx; });

      if (charMode === 'preset') {
        const pr = PRESET_POLITICIANS.find(x => x.id === document.getElementById('selRealPolitician').value) || PRESET_POLITICIANS[0];
        game.leader = { name:pr.name, age:pr.age, gender:pr.gender, region:pr.region, personalIdeo:pr.ideo, prestige:85, internalSupport:pr.role==='secretary'?82:58, history:[] };
        game.partyRole = pr.role;
        game.playerPartyId = pr.partyId;
        const pVal = Math.round(pr.ideo);
        DOSSIERS.forEach(d => game.personalStances[d.key] = Math.max(0, Math.min(4, pVal)));
        if (pr.partyId !== 'ind') {
          const p = game.parties.find(x => x.id === pr.partyId);
          if (p) {
            game.personalStances = { ...p.stances };
            if (pr.role === 'member') { p.wingLeader = pr.name; p.wingAge = pr.age; }
          }
        }
      } else {
        const name = document.getElementById('inName').value.trim() || "Marco Valeri";
        const age = parseInt(document.getElementById('inAge').value) || 44;
        const gender = document.getElementById('inGender').value;
        const region = document.getElementById('inRegion').value;
        const role = document.getElementById('inStartRole').value;

        if (role === 'independent') {
          const ideo = parseFloat(document.getElementById('inIndIdeo').value) || 2.0;
          game.leader = { name, age, gender, region, personalIdeo:ideo, prestige:74, internalSupport:50, history:[] };
          game.partyRole = 'independent';
          game.playerPartyId = 'ind';
          DOSSIERS.forEach(d => game.personalStances[d.key] = Math.max(0, Math.min(4, Math.round(ideo))));
        } else if (role === 'founder') {
          const cName = document.getElementById('cName').value.trim() || "Alleanza Civica Riformista";
          const cShort = (document.getElementById('cShort').value.trim() || "ACR").toUpperCase();
          const cArea = document.getElementById('cArea').value;
          const cEmblem = parseInt(document.getElementById('cEmblem').value) || 1;
          const cColor = DISTINCT_PALETTE[game.paletteIdx++ % DISTINCT_PALETTE.length];
          const areaMapVal = { "Estrema Sinistra":0, "Sinistra":1, "Centro-Sinistra":1, "Movimento":2, "Centro":2, "Centro-Destra":3, "Destra":3, "Estrema Destra":4 };
          const defVal = areaMapVal[cArea] ?? 2;
          const stances = {}; DOSSIERS.forEach(d => stances[d.key] = defVal);
          const customP = {
            id:'custom', name:cName, short:cShort, leader:name, leaderAge:age, leaderTrust:88, nextCongYear:2029,
            personalParty:true, founderLeader:name,
            area:cArea, coalId:'none', color:cColor, emblemType:cEmblem, poll:0.4, initialPoll:0.4, seats:0, inGov:false,
            credibility:68, cohesion:88, orgStrength:24, wingLeader:"Marco Cappato", wingAge:55, wingName:"Ala Radicale", wingArea:cArea,
            factions:[
              { name:`Area Fondatrice (${name})`, leader:name, share:65, desc:"Corrente guida del partito." },
              { name:"Ala Riformatrice", leader:"Marco Cappato", share:22, desc:"Spinta tematica e referendaria." },
              { name:"Circoli Territoriali", leader:"Amministratori Locali", share:13, desc:"Rete civica regionale." }
            ],
            splitName:"Cantiere Riformatore Italiano", splitShort:"CRI", bio:`Partito fondato da ${name}.`, vetoes:[], stances, baseStances:{...stances}, baseIdeo:defVal, lowPollWeeks:0, newlyFoundedGraceWeeks:52
          };
          game.parties.push(customP);
          game.playerPartyId = 'custom';
          game.partyRole = 'secretary';
          game.funds = 120;
          game.leader = { name, age, gender, region, personalIdeo:defVal, prestige:65, internalSupport:85, history:[] };
          game.personalStances = { ...stances };
        } else {
          game.playerPartyId = selectedStartPartyId;
          const p = game.parties.find(x => x.id === selectedStartPartyId);
          game.partyRole = role;
          const ideo = getPartyIdeoScore(p);
          game.leader = { name, age, gender, region, personalIdeo:ideo, prestige:role==='secretary'?82:70, internalSupport:role==='secretary'?80:52, history:[] };
          if (role === 'secretary') {
            p.wingLeader = p.leader; p.wingAge = p.leaderAge;
            p.leader = name; p.leaderAge = age;
            syncPartyNameWithLeader(p, name);
            if (p.id === 'fdi') game.currentPM = name;
          } else {
            p.wingLeader = name; p.wingAge = age;
          }
          game.personalStances = { ...p.stances };
        }
      }

      game.selectedMapRegion = game.leader.region;
      game.selectedDossierPartyId = game.playerPartyId === 'ind' ? 'fdi' : game.playerPartyId;
      ensurePlayerInPoliticians();
      initRegOrg();
      initDemographicCalibrated();
      initAllPairRelationsAndCabinet();

      const myMin = getPlayerMinistry();
      const startRoleSummary = game.partyRole === 'independent'
        ? 'Leader Indipendente nella XIX Legislatura'
        : (game.partyRole === 'secretary'
          ? `Segretario Nazionale di ${getP().name}${game.currentPM === game.leader.name ? ' e Presidente del Consiglio dei Ministri' : ''}`
          : `Capocorrente in ${getP().name}${myMin ? ` e ${myMin.ministry.name}` : ''}`);
      recordPoliticianHistory(game.leader.name, startRoleSummary, myMin ? myMin.ministry.name : undefined);

      document.getElementById('setupView').style.display = 'none';
      document.getElementById('appView').style.display = 'block';
      const ftd = document.getElementById('floatingTimeDock');
      if (ftd) ftd.style.display = 'flex';
      addFeed(`🏛️ Inizia la carriera politica di <strong>${game.leader.name} (${game.leader.age} anni)</strong> come <strong>${game.partyRole==='independent'?'Personalità Indipendente (Tema Bianco)':(game.partyRole==='secretary'?'Segretario Nazionale di '+getP().name:'Capocorrente interno in '+getP().name)}${myMin ? ` e 🏛️ ${myMin.ministry.name}` : ''}</strong>.`);
      updateAllUI();
    }

    /* PUNTO 12: MANUALE E GUIDA INTERATTIVA PER I NUOVI GIOCATORI */

// =========================================================================
// BINDING GLOBALE SU WINDOW (REGOLA CRITICA PER GESTORI INLINE HTML ONCLICK)
// =========================================================================
const targetScope = typeof window !== 'undefined' ? window : globalThis;
Object.assign(targetScope, Data);
Object.assign(targetScope, State);
Object.assign(targetScope, Engine);
Object.assign(targetScope, UI);

targetScope.initSetupUI = initSetupUI;
targetScope.startGame = startGame;
targetScope.openPoliticianCardModal = UI.openPoliticianCardModal;
targetScope.closePoliticianModal = UI.closePoliticianModal;
targetScope.formTechnicalGovernment = Engine.formTechnicalGovernment;
targetScope.exileAction = Engine.exileAction;

// Auto-inizializzazione immediata e robusta della schermata di setup
export function bootstrapApp() {
  try {
    initCustomSelectEngine();
  } catch (err) {
    console.error('Errore initCustomSelectEngine:', err);
  }
  try {
    initSetupUI();
  } catch (err) {
    console.error('Errore initSetupUI:', err);
  }
}

targetScope.bootstrapApp = bootstrapApp;

// Esegui immediatamente se il DOM è già disponibile (script a fine body)
if (typeof document !== 'undefined') {
  if (document.getElementById('selRealPolitician') || document.readyState === 'interactive' || document.readyState === 'complete') {
    bootstrapApp();
  } else {
    document.addEventListener('DOMContentLoaded', bootstrapApp);
    window.addEventListener('load', bootstrapApp);
  }
}
