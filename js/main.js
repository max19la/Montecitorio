// =========================================================================
// MONTECITORIO - js/main.js
// Entry Point, Inizializzazione Applicazione e Binding Window per Handlers
// =========================================================================

import * as Data from './data.js';
import * as State from './state.js';
import * as Engine from './engine.js';
import * as UI from './ui.js';

import {
  DISTINCT_PALETTE,
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
  getPlayerGovernorship,
  enforceSingleOfficeRule,
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
  computeBlocMatch,
  openRegionalElectionModal,
  runRegionalElectionVote,
  regionalGovAction,
  proposeRegionalCandidateModal
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
      if (regSel) regSel.innerHTML = FALLBACK_REGIONS.map(r => `<option value="${r.id}" ${r.id==='Lazio'?'selected':''}>${r.id} (${r.lean})</option>`).join('');
      const polSel = document.getElementById('selRealPolitician');
      if (polSel) {
        polSel.innerHTML = PRESET_POLITICIANS.map(p => {
          const roleTag = p.role === 'president'
            ? 'Presidente della Repubblica'
            : (p.role === 'secretary' ? 'Segretario' : (p.role === 'member' ? 'Capocorrente / Governatore' : 'Indipendente'));
          return `<option value="${p.id}">${p.name} (${p.age}a) — ${roleTag} [${p.partyId.toUpperCase()}]</option>`;
        }).join('');
      }
      const btnReal = document.getElementById('btnCharReal');
      if (btnReal) btnReal.textContent = `Politico Reale (${PRESET_POLITICIANS.length})`;

      // PUNTO 17 (1.8): Inizializza i selettori del Logo Builder nella schermata di Setup
      const bgSel = document.getElementById('cBgColor');
      if (bgSel && Data.LOGO_COLORS) {
        bgSel.innerHTML = Data.LOGO_COLORS.map(c => `<option value="${c.hex}">${c.name}</option>`).join('');
      }
      const ringSel = document.getElementById('cRingStyle');
      if (ringSel && Data.LOGO_RINGS) {
        ringSel.innerHTML = Data.LOGO_RINGS.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
      }
      const banSel = document.getElementById('cBannerStyle');
      if (banSel && Data.LOGO_BANNERS) {
        banSel.innerHTML = Data.LOGO_BANNERS.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
      }
      const symSel = document.getElementById('cSymbol');
      if (symSel && Data.LOGO_SYMBOLS) {
        symSel.innerHTML = Data.LOGO_SYMBOLS.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
      }

      // PUNTO 4 (1.8.1): Registra listener change su tutti i campi del Logo Builder
      ['cBgColor', 'cRingStyle', 'cBannerStyle', 'cSymbol', 'cShort'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => { if (UI.updateSetupLogoPreview) UI.updateSetupLogoPreview(); });
      });

      applyPresetPreview();
      renderSetupParties();
      loadOfficialISTATGeoJSON();
      if (UI.updateSetupLogoPreview) {
        UI.updateSetupLogoPreview();
      }
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
      game.regionalElectionCooldowns = {};
      game.politicianHistoryMap = {};
      game.politicianRoleMap = {};
      game.politicianPartyMap = {};
      game.president = {
        name: "Sergio Mattarella",
        age: 85,
        area: "Indipendente di Garanzia",
        trust: 78,
        endDate: new Date(2029, 1, 2),
        isPlayer: false,
        dissolutionDoneForCurrentCrisis: false
      };
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
        const matchPol = POLITICIANS.find(x => x.id === pr.id || x.name === pr.name);
        const hist = (matchPol?.history && matchPol.history.length)
          ? [...matchPol.history]
          : (pr.history && pr.history.length ? [...pr.history] : []);

        if (!hist.length && (pr.role === 'president' || pr.id === 'p_mattarella' || pr.name === 'Sergio Mattarella')) {
          hist.push(
            "Presidente della Repubblica Italiana (Dal 2015)",
            "Giudice della Corte Costituzionale (2011–2015)",
            "Ministro della Difesa (1999–2001)",
            "Vicepresidente del Consiglio dei Ministri (1998–1999)",
            "Ministro della Pubblica Istruzione (1989–1990)",
            "Ministro per i Rapporti con il Parlamento (1987–1989)",
            "Deputato della Repubblica Italiana (1983–2008)"
          );
        } else if (!hist.length) {
          hist.push(`Esponente politico della Repubblica Italiana (${game.date.getFullYear() - pr.age}–)`);
        }

        game.leader = { name:pr.name, age:pr.age, gender:pr.gender, region:pr.region, personalIdeo:pr.ideo, prestige:pr.role==='president'?92:85, internalSupport:pr.role==='secretary'?82:58, history: hist };
        if (pr.role === 'president' || pr.id === 'p_mattarella') {
          game.partyRole = 'independent';
          game.playerPartyId = 'ind';
          game.president.name = pr.name;
          game.president.age = pr.age;
          game.president.isPlayer = true;
          game.president.area = "Presidente della Repubblica";
        } else {
          game.partyRole = pr.role;
          game.playerPartyId = pr.partyId;
        }
        const pVal = Math.round(pr.ideo);
        DOSSIERS.forEach(d => game.personalStances[d.key] = Math.max(0, Math.min(4, pVal)));
        if (pr.partyId !== 'ind' && pr.role !== 'president') {
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

        if (role === 'president') {
          const ideo = parseFloat(document.getElementById('inIndIdeo').value) || 2.0;
          const presAge = Math.max(50, age);
          game.leader = {
            name, age: presAge, gender, region, personalIdeo: ideo, prestige: 90, internalSupport: 70,
            history: [
              'Presidente della Repubblica (Dal 2026)',
              'Giudice della Corte Costituzionale (2018–2026)',
              'Deputato della Repubblica (2008–2018)'
            ]
          };
          game.partyRole = 'independent';
          game.playerPartyId = 'ind';
          game.president.name = name;
          game.president.age = presAge;
          game.president.isPlayer = true;
          game.president.area = "Presidente della Repubblica";
          DOSSIERS.forEach(d => game.personalStances[d.key] = Math.max(0, Math.min(4, Math.round(ideo))));
        } else if (role === 'independent') {
          const ideo = parseFloat(document.getElementById('inIndIdeo').value) || 2.0;
          game.leader = {
            name, age, gender, region, personalIdeo:ideo, prestige:74, internalSupport:50,
            history: [
              'Senatore della Repubblica (Dal 2022)',
              'Deputato della Repubblica (2018–2022)'
            ]
          };
          game.partyRole = 'independent';
          game.playerPartyId = 'ind';
          DOSSIERS.forEach(d => game.personalStances[d.key] = Math.max(0, Math.min(4, Math.round(ideo))));
        } else if (role === 'founder') {
          const cName = document.getElementById('cName').value.trim() || "Alleanza Civica Riformista";
          const cShort = (document.getElementById('cShort').value.trim() || "ACR").toUpperCase().slice(0, 5);
          const cArea = document.getElementById('cArea').value;
          const cBgColor = document.getElementById('cBgColor')?.value || '#2563eb';
          const cRingStyle = document.getElementById('cRingStyle')?.value || 'tricolore';
          const cBannerStyle = document.getElementById('cBannerStyle')?.value || 'onda_tricolore';
          const cSymbol = document.getElementById('cSymbol')?.value || 'fiamma';
          const customLogoCfg = {
            bgColor: cBgColor,
            ringStyle: cRingStyle,
            bannerStyle: cBannerStyle,
            symbolId: cSymbol
          };
          const cColor = cBgColor;
          const areaMapVal = { "Estrema Sinistra":0, "Sinistra":1, "Centro-Sinistra":1, "Movimento":2, "Centro":2, "Centro-Destra":3, "Destra":3, "Estrema Destra":4 };
          const defVal = areaMapVal[cArea] ?? 2;
          const stances = {}; DOSSIERS.forEach(d => stances[d.key] = defVal);
          const customP = {
            id:'custom', name:cName, short:cShort, leader:name, leaderAge:age, leaderTrust:88, nextCongYear:2029,
            personalParty:true, founderLeader:name, customLogoCfg,
            area:cArea, coalId:'none', color:cColor, emblemType:1, poll:0.4, initialPoll:0.4, seats:0, inGov:false,
            credibility:68, cohesion:88, orgStrength:24, wingLeader:"Marco Cappato", wingAge:55, wingName:"Ala Radicale", wingArea:cArea,
            factions:[
              { name:`Area Fondatrice (${name})`, leader:name, share:65, desc:"Corrente guida del partito." },
              { name:"Ala Riformatrice", leader:"Marco Cappato", share:22, desc:"Spinta tematica e referendaria." },
              { name:"Circoli Territoriali", leader:"Amministratori Locali", share:13, desc:"Rete civica regionale." }
            ],
            splitName:"Cantiere Riformatore Italiano", splitShort:"CRI", bio:`Partito fondato da ${name}.`, vetoes:[], stances, baseStances:{...stances}, baseIdeo:defVal, lowPollWeeks:0, newlyFoundedGraceWeeks:52
          };
          game.parties.push(customP);
          // PUNTO 30 (1.8): Popola il nuovo partito con una gerarchia di 18 parlamentari e dirigenti
          Engine.populateNewPartyPoliticians('custom', 18);
          game.playerPartyId = 'custom';
          game.partyRole = 'secretary';
          game.funds = 120;
          game.leader = {
            name, age, gender, region, personalIdeo:defVal, prestige:65, internalSupport:85,
            history: [
              `Segretario Nazionale ${cShort} (Dal 2026)`,
              'Deputato della Repubblica (Dal 2022)'
            ]
          };
          game.personalStances = { ...stances };
        } else {
          game.playerPartyId = selectedStartPartyId;
          const p = game.parties.find(x => x.id === selectedStartPartyId);
          game.partyRole = role;
          const ideo = getPartyIdeoScore(p);
          const customHist = role === 'secretary'
            ? [
                ...(p.id === 'fdi' ? ['Presidente del Consiglio dei Ministri (Dal 2026)'] : []),
                `Segretario Nazionale ${p.short} (Dal 2026)`,
                'Deputato della Repubblica (Dal 2018)'
              ]
            : [
                'Deputato della Repubblica (Dal 2022)',
                `Consigliere Regionale ${region} (2018–2022)`
              ];
          game.leader = { name, age, gender, region, personalIdeo:ideo, prestige:role==='secretary'?82:70, internalSupport:role==='secretary'?80:52, history:customHist };
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
      enforceSingleOfficeRule();

      const myMin = getPlayerMinistry();
      const myGov = getPlayerGovernorship();
      const isSenSpeaker = (game.senateSpeaker?.name === game.leader.name);
      const isChamSpeaker = (game.chamberSpeaker?.name === game.leader.name);

      let officeLabel = '';
      if (game.president.isPlayer) {
        officeLabel = '🏛️ Presidente della Repubblica al Quirinale';
      } else if (game.currentPM === game.leader.name) {
        officeLabel = `👑 Presidente del Consiglio dei Ministri e Segretario Nazionale di ${getP().name}`;
      } else if (isSenSpeaker) {
        officeLabel = `🏛️ Presidente del Senato della Repubblica (${getP().short})`;
      } else if (isChamSpeaker) {
        officeLabel = `🔔 Presidente della Camera dei Deputati (${getP().short})`;
      } else if (myMin) {
        officeLabel = `🏛️ ${myMin.ministry.name} (${getP().short})`;
      } else if (myGov) {
        officeLabel = `🦁 Presidente della Regione ${myGov.regId} (${getP().short})`;
      } else if (game.partyRole === 'independent') {
        officeLabel = '📄 Personalità Indipendente della Repubblica';
      } else if (game.partyRole === 'secretary') {
        officeLabel = `👑 Segretario Nazionale di ${getP().name}`;
      } else {
        officeLabel = `⚔️ Capocorrente interno in ${getP().name}`;
      }

      document.getElementById('setupView').style.display = 'none';
      document.getElementById('appView').style.display = 'block';
      const ftd = document.getElementById('floatingTimeDock');
      if (ftd) ftd.style.display = 'flex';
      addFeed(`🏛️ Inizia la carriera politica di <strong>${game.leader.name} (${game.leader.age} anni)</strong> come <strong>${officeLabel}</strong>.`);
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
targetScope.openResignationModal = Engine.openResignationModal;
targetScope.resignPlayerOffice = State.resignPlayerOffice;
targetScope.updateSetupLogoPreview = UI.updateSetupLogoPreview;
targetScope.openRegionalCitizenVotingBoothModal = Engine.openRegionalCitizenVotingBoothModal;
targetScope.openNationalCitizenVotingBoothModal = Engine.openNationalCitizenVotingBoothModal;
targetScope.isVicePremier = State.isVicePremier;
targetScope.toggleVicePremier = State.toggleVicePremier;
targetScope.toggleVicePremierAction = Engine.toggleVicePremierAction;
targetScope.triggerDramaticGovFallModal = Engine.triggerDramaticGovFallModal;
targetScope.openCoalitionAdmissionRequestModal = Engine.openCoalitionAdmissionRequestModal;
targetScope.getRegionalCandidatesForElection = Engine.getRegionalCandidatesForElection;

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
