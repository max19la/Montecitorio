// =========================================================================
// MONTECITORIO - js/engine.js
// Motore di Simulazione, Turni, Economia, Politica, Elezioni ed Eventi
// =========================================================================

import {
  BLOCS,
  DOSSIERS,
  FALLBACK_REGIONS,
  INITIAL_PARTIES,
  HOT_LAWS,
  FOREIGN_POWERS,
  STATE_FORMS,
  PRES_CANDIDATES,
  MINISTRIES,
  POLITICIANS,
  BILLS,
  WORLD_EVENTS,
  NEW_FIRST_NAMES,
  NEW_LAST_NAMES,
  EXEC_DECREES,
  DISTINCT_PALETTE,
  SPLIT_POOLS,
  REGIONAL_PROFILES,
  INITIAL_GOVERNORS,
  getPartySVG,
  LOGO_COLORS,
  LOGO_RINGS,
  LOGO_BANNERS,
  LOGO_SYMBOLS,
  renderCustomPartyLogoSVG,
  readablePartyColor
} from './data.js';

import {
  game,
  charMode,
  selectedStartPartyId,
  draftCabinet, setDraftCabinet,
  draftSenateId, setDraftSenateId,
  draftChamberId, setDraftChamberId,
  draftGovParties, setDraftGovParties,
  draftPMName, setDraftPMName,
  draftCoalKey, setDraftCoalKey,
  getP,
  getCoalName,
  hasUsedTurnAction,
  useTurnAction,
  adjAllySat,
  ensurePlayerInPoliticians,
  getPlayerMinistry,
  getPlayerGovernorship,
  getPersonCurrentOffice,
  enforceSingleOfficeRule,
  vacateOfficesForPresident,
  isSemestreBianco,
  getPoliticiansForParty,
  getPoliticianById,
  getPartyIdeoScore,
  getIdeoLabel,
  computePartyDrift,
  getPairRel,
  adjPairRel,
  setBetrayal,
  getBetrayal,
  recalcDynamicVetoes,
  fmtDate,
  recordPoliticianHistory,
  syncPartyNameWithLeader,
  syncAllPoliticianCareersWithCurrentState,
  resignPlayerOffice,
  getPlayerOfficesList
} from './state.js';

// Safe UI bridge delegators
const addFeed = (msg, type) => (typeof window !== 'undefined' && window.addFeed ? window.addFeed(msg, type) : console.log(msg));
const setTicker = (msg) => (typeof window !== 'undefined' && window.setTicker ? window.setTicker(msg) : null);
const openModal = (...args) => (typeof window !== 'undefined' && window.openModal ? window.openModal(...args) : null);
const closeModal = () => (typeof window !== 'undefined' && window.closeModal ? window.closeModal() : null);
const updateAllUI = () => (typeof window !== 'undefined' && window.updateAllUI ? window.updateAllUI() : null);

// PUNTO 30 (1.8): Assegna un roster completo di almeno 18 politici per ogni nuovo partito fondato o nato da scissione
export function populateNewPartyPoliticians(partyId, targetCount = 18) {
  const existing = POLITICIANS.filter(p => p.partyId === partyId);
  const needed = Math.max(0, targetCount - existing.length);
  for (let k = 0; k < needed; k++) {
    generateNewPolitician(partyId);
  }
}

// PUNTI 3, 15, 16 (1.8.1): Ritiro volontario (Modalità Spettatore) con azzeramento cariche e divieto di assunzione ruoli
export function togglePoliticalRetirement(retire = null) {
  if (retire === null) {
    game.isRetired = !game.isRetired;
  } else {
    game.isRetired = !!retire;
  }
  if (game.isRetired) {
    // Vacate all offices immediately
    resignPlayerOffice('all');
    addFeed(`🌅 <strong>RITIRO DALLA VITA POLITICA ATTIVA:</strong> <strong>${game.leader.name}</strong> annuncia il ritiro dall'agone politico. Attivata la <strong>Modalità Spettatore</strong>: tutti gli incarichi sono stati rimessi, non puoi assumere ministeri o presidenza e le azioni sono sospese fino a un eventuale ritorno!`, 'ok');
    setTicker(`MODALITÀ SPETTATORE: ${game.leader.name} si ritira dalla vita politica attiva.`);
  } else {
    addFeed(`🔥 <strong>RIENTRO NELL'ARENA POLITICA:</strong> <strong>${game.leader.name}</strong> torna in campo e riprende la piena attività politica!`, 'ok');
    setTicker(`RIENTRO IN CAMPO: ${game.leader.name} torna alla vita politica attiva!`);
  }
  enforceSingleOfficeRule();
  updateAllUI();
}

// PUNTO 33 (1.8): Morte naturale a 80+ anni con resoconto storico della carriera (Fine Partita)
export function triggerPlayerNaturalDeathModal() {
  game.isDead = true;
  const leaderPol = POLITICIANS.find(x => x.isPlayer || x.name === game.leader.name);
  recordPoliticianHistory(game.leader.name, `Scomparsa all'età di ${game.leader.age} anni dopo una lunga carriera istituzionale`, 'Deceduto');

  // PUNTO 18 (1.8.1): Recupero completo del CV e della carriera storica reale
  const historyList = [];
  if (Array.isArray(game.leader?.history)) {
    game.leader.history.forEach(h => {
      const s = typeof h === 'string' ? h : h.title;
      if (s && !historyList.includes(s)) historyList.push(s);
    });
  }
  if (Array.isArray(leaderPol?.history)) {
    leaderPol.history.forEach(h => {
      const s = typeof h === 'string' ? h : h.title;
      if (s && !historyList.includes(s)) historyList.push(s);
    });
  }
  if (game.leader.name === 'Sergio Mattarella' || leaderPol?.id === 'mattarella' || leaderPol?.id === 'p_mattarella') {
    const mattarellaRoles = [
      "Presidente della Repubblica Italiana (2015–" + game.date.getFullYear() + ")",
      "Giudice della Corte Costituzionale della Repubblica (2011–2015)",
      "Ministro della Difesa (1999–2001)",
      "Vicepresidente del Consiglio dei Ministri (1998–1999)",
      "Ministro della Pubblica Istruzione (1989–1990)",
      "Ministro per i Rapporti con il Parlamento (1987–1989)",
      "Deputato della Repubblica Italiana (1983–2008)"
    ];
    mattarellaRoles.forEach(r => {
      if (!historyList.some(existing => existing.includes(r.split(' (')[0]))) {
        historyList.push(r);
      }
    });
  }
  if (historyList.length === 0) {
    historyList.push(`Figura di rilievo della Repubblica Italiana (${game.date.getFullYear() - game.leader.age}–${game.date.getFullYear()})`);
  }

  addFeed(`🖤 <strong>ESEQUIE DI STATO PER ${game.leader.name.toUpperCase()}:</strong> Bandiere a mezz'asta su tutti gli edifici pubblici, campane a martello a Montecitorio e proclamazione del lutto nazionale di 3 giorni!`, 'cr');
  setTicker(`LUTTO NAZIONALE: Scomparso all'età di ${game.leader.age} anni ${game.leader.name}. Esequie di Stato solenni.`);

  const summaryHtml = `
    <div style="font-size:13px; line-height:1.6; color:var(--text);">
      <div style="background:rgba(226,185,59,0.12); border:1px solid var(--gold-bd); border-radius:10px; padding:14px; margin-bottom:14px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:var(--gold-lt); margin-bottom:4px;">🕊️ Esequie di Stato: ${game.leader.name}</div>
        <div style="font-size:12px; color:var(--muted);">${game.date.getFullYear() - game.leader.age} – ${game.date.getFullYear()} (Età: ${game.leader.age} anni) • Prestigio Storico: <strong style="color:var(--gold);">${game.leader.prestige}%</strong></div>
        <div style="margin-top:8px; font-size:12px; font-style:italic; color:var(--text-bright);">"Servitore rigoroso delle Istituzioni e testimone della Costituzione repubblicana."</div>
      </div>
      <div style="font-weight:800; color:var(--gold-lt); margin-bottom:8px;">📜 Resoconto Storico degli Incarichi Ricoperti nella Repubblica:</div>
      <div style="max-height:240px; overflow-y:auto; background:var(--bg-2); border:1px solid var(--border); border-radius:8px; padding:12px; margin-bottom:14px; display:flex; flex-direction:column; gap:8px;">
        ${historyList.map(item => `
          <div style="display:flex; align-items:flex-start; gap:8px; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:6px;">
            <span style="color:var(--gold);">🏛️</span>
            <div style="font-weight:700; color:var(--text);">${item}</div>
          </div>
        `).join('')}
      </div>
      <div style="background:rgba(255,255,255,0.03); border-radius:8px; padding:10px; font-size:12px; color:var(--muted); text-align:center;">
        Il feretro riceve gli onori dei Corazzieri e del Picchetto interforze. Si conclude qui la tua parabola politica.
      </div>
    </div>
  `;

  openModal(
    `🖤 Esequie di Stato di ${game.leader.name} — Conclusione della Partita`,
    summaryHtml,
    [
      {
        label: "🏛️ Torna al Menu Principale",
        fn: () => {
          if (typeof window !== 'undefined') window.location.reload();
        }
      }
    ]
  );
  updateAllUI();
}

// PUNTO 17 (1.8): Creatore Interattivo di Logo Partitico (Logo Builder)
export function updateCustomLogoPreview() {
  const pName = document.getElementById('custPartName')?.value || 'Nuovo Movimento';
  const pShort = (document.getElementById('custPartShort')?.value || 'NM').toUpperCase().slice(0, 5);
  const bgColor = document.getElementById('custPartBg')?.value || '#2563eb';
  const ringStyle = document.getElementById('custPartRing')?.value || 'tricolore';
  const bannerStyle = document.getElementById('custPartBanner')?.value || 'onda_tricolore';
  const symbolId = document.getElementById('custPartSymbol')?.value || 'fiamma';

  game.customLogoDraft = { bgColor, ringStyle, bannerStyle, symbolId };
  const prevBox = document.getElementById('custLogoPreviewBox');
  if (prevBox) {
    prevBox.innerHTML = renderCustomPartyLogoSVG(game.customLogoDraft, pShort, bgColor);
  }
}

export function openCustomPartyCreationModal(mode = 'found', parentParty = null, customStances = null) {
  const isSplit = (mode === 'split' && parentParty);
  const defaultName = isSplit ? `Alternativa ${parentParty.short}` : "Movimento Civico Nazionale";
  const defaultShort = isSplit ? `A${parentParty.short.slice(0, 3)}` : "MCN";
  const defaultColor = isSplit ? (parentParty.color || '#2563eb') : '#2563eb';

  game.customLogoDraft = {
    bgColor: defaultColor,
    ringStyle: 'tricolore',
    bannerStyle: 'onda_tricolore',
    symbolId: 'fiamma'
  };

  const modalTitle = isSplit ? `⚡ Guida una Scissione da ${parentParty.short} e Fonda un Nuovo Partito` : "🏛️ Fondazione Nuovo Partito Nazionale & Logo Builder";
  const bodyHtml = `
    <div style="font-size:13px; color:var(--text); line-height:1.5;">
      ${isSplit 
        ? `Definisci l'identità ufficiale, la sigla e il simbolo elettorale del tuo nuovo partito scissionista da <strong>${parentParty.name}</strong>:` 
        : `Investi <strong>€ 80k</strong> e <strong>35 ⚡</strong> per registrare il partito, depositare il contrassegno elettorale al Viminale e avviare il radicamento sul territorio:`}
      
      <div style="display:grid; grid-template-columns:1fr 140px; gap:16px; margin:14px 0; align-items:center; background:var(--bg-2); border:1px solid var(--border); border-radius:10px; padding:12px;">
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div>
            <label style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase;">Nome Ufficiale del Partito:</label>
            <input type="text" id="custPartName" value="${defaultName}" style="width:100%; padding:6px 8px; font-size:13px; font-weight:700;" oninput="updateCustomLogoPreview()">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase;">Sigla (max 5 lett.):</label>
              <input type="text" id="custPartShort" value="${defaultShort}" maxlength="5" style="width:100%; padding:6px 8px; font-size:13px; font-weight:800; text-transform:uppercase;" oninput="updateCustomLogoPreview()">
            </div>
            <div>
              <label style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase;">Colore Sfondo:</label>
              <select id="custPartBg" style="width:100%; padding:6px 8px; font-size:12px;" onchange="updateCustomLogoPreview()">
                ${LOGO_COLORS.map(c => `<option value="${c.hex}" ${c.hex === defaultColor ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase;">Bordo / Ghirlanda:</label>
              <select id="custPartRing" style="width:100%; padding:6px 8px; font-size:12px;" onchange="updateCustomLogoPreview()">
                ${LOGO_RINGS.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase;">Fascia / Motivo:</label>
              <select id="custPartBanner" style="width:100%; padding:6px 8px; font-size:12px;" onchange="updateCustomLogoPreview()">
                ${LOGO_BANNERS.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
              </select>
            </div>
          </div>
          <div>
            <label style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase;">Simbolo Politico Centrale:</label>
            <select id="custPartSymbol" style="width:100%; padding:6px 8px; font-size:12px;" onchange="updateCustomLogoPreview()">
              ${LOGO_SYMBOLS.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; font-weight:800; color:var(--gold-lt); margin-bottom:6px;">Anteprima Logo:</div>
          <div id="custLogoPreviewBox" style="display:inline-block; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.5));">
            ${renderCustomPartyLogoSVG(game.customLogoDraft, defaultShort, defaultColor)}
          </div>
        </div>
      </div>
    </div>
  `;

  openModal(
    modalTitle,
    bodyHtml,
    [
      {
        label: isSplit ? "⚡ Conferma Scissione e Fonda il Partito" : "🏛️ Fonda Ufficialmente il Partito",
        fn: () => {
          const pName = document.getElementById('custPartName')?.value.trim() || defaultName;
          const pShort = (document.getElementById('custPartShort')?.value.trim() || defaultShort).toUpperCase().slice(0, 5);
          const bgColor = document.getElementById('custPartBg')?.value || defaultColor;
          const ringStyle = document.getElementById('custPartRing')?.value || 'tricolore';
          const bannerStyle = document.getElementById('custPartBanner')?.value || 'onda_tricolore';
          const symbolId = document.getElementById('custPartSymbol')?.value || 'fiamma';
          const finalLogoCfg = { bgColor, ringStyle, bannerStyle, symbolId };

          closeModal();
          if (isSplit) {
            finishPartySplitWithCustomLogo(parentParty, pName, pShort, finalLogoCfg, customStances);
          } else {
            finishFoundPartyWithCustomLogo(pName, pShort, finalLogoCfg);
          }
        }
      },
      {
        label: "Annulla",
        fn: () => { closeModal(); }
      }
    ]
  );
}

function finishFoundPartyWithCustomLogo(pName, pShort, logoCfg) {
  game.funds -= 80;
  game.ap -= 35;
  const newId = 'founded_' + game.turn;
  const rising = generateNewPolitician(newId);
  const areaStr = getIdeoLabel(game.leader.personalIdeo).replace(/^[^\s]+\s/, '');
  const newP = {
    id: newId,
    name: pName,
    short: pShort,
    leader: game.leader.name,
    leaderAge: game.leader.age,
    leaderTrust: 90,
    nextCongYear: game.date.getFullYear() + 3,
    personalParty: true,
    founderLeader: game.leader.name,
    area: areaStr,
    coalId: 'none',
    color: logoCfg.bgColor || '#2563eb',
    customLogoCfg: logoCfg,
    emblemType: 1,
    poll: 0.4,
    initialPoll: 0.4,
    seats: 0,
    inGov: false,
    credibility: game.leader.prestige,
    cohesion: 92,
    orgStrength: 24,
    wingLeader: rising.name,
    wingAge: rising.age,
    wingName: "Area Civica",
    wingArea: areaStr,
    factions: [
      { name: `Area Fondatrice (${game.leader.name})`, leader: game.leader.name, share: 70, desc: "Linea ufficiale del fondatore." },
      { name: "Area Civica", leader: rising.name, share: 30, desc: "Rete territoriale." }
    ],
    splitName: `Alternativa ${pShort}`,
    splitShort: `A${pShort.slice(0, 2)}`,
    bio: `Partito fondato da ${game.leader.name}.`,
    vetoes: [],
    stances: { ...game.personalStances },
    baseStances: { ...game.personalStances },
    baseIdeo: game.leader.personalIdeo,
    lowPollWeeks: 0,
    newlyFoundedGraceWeeks: 52
  };
  game.parties.push(newP);
  game.blocSympathy[newId] = {};
  BLOCS.forEach(b => { game.blocSympathy[newId][b.id] = computeBlocMatch(newP, b) * 0.42; });
  FALLBACK_REGIONS.forEach(r => { game.regOrg[r.id][newId] = 28; });
  game.parties.forEach(p => adjPairRel(newId, p.id, 55));
  game.playerPartyId = newId;
  game.partyRole = 'secretary';
  game.selectedDossierPartyId = newId;
  document.body.classList.remove('theme-ind');
  const pPol = POLITICIANS.find(x => x.isPlayer || x.name === game.leader.name);
  if (pPol) {
    pPol.partyId = newId;
    if (!game.politicianPartyMap) game.politicianPartyMap = {};
    game.politicianPartyMap[pPol.id] = newId;
  }
  // PUNTO 30: 18 politici per il nuovo partito
  populateNewPartyPoliticians(newId, 18);
  recordPoliticianHistory(game.leader.name, `Fonda il nuovo partito politico ${pName} (${pShort})`, `Segretario Fondatore ${pShort}`);
  recalcPolls(true);
  addFeed(`🏛️ <strong>NUOVA FORZA POLITICA (0.4%):</strong> L'indipendente <strong>${game.leader.name}</strong> fonda <strong>${pName} (${pShort})</strong> con 18 dirigenti nazionali e logo ufficiale!`, 'ok');
  setTicker(`NUOVO PARTITO: Registrato al Viminale "${pName}" (${pShort}) di ${game.leader.name}!`);
  updateAllUI();
}

function finishPartySplitWithCustomLogo(parentParty, pName, pShort, logoCfg, customStances) {
  executePartySplit(parentParty, true, customStances, pName, pShort, logoCfg);
  updateAllUI();
}

// PUNTO 31 (1.8): Transfughismo parlamentare — richiesta di adesione al partito del giocatore
export function openDefectionOfferModal(pol, fromParty, toParty) {
  const p = getP();
  const seatsNotice = pol.role?.includes('Parlamentare') || pol.role?.includes('Deputato') || pol.role?.includes('Senatore') || pol.clout >= 70;
  
  openModal(
    `🤝 Richiesta di Tesseramento: ${pol.name} (${fromParty.short} → ${toParty.short})`,
    `<div style="font-size:13px; color:var(--text); line-height:1.55;">
      Il dirigente politico <strong>${pol.name}</strong> (${pol.age} anni, Prestigio: ${pol.clout}%, Comp.: ${pol.comp}%) è in aperto dissenso con la linea di <strong>${fromParty.name}</strong> e ha chiesto ufficialmente di aderire a <strong>${toParty.name}</strong>!<br><br>
      • <strong>Rango:</strong> ${pol.role || 'Dirigente Nazionale'}<br>
      • <strong>Impatto politico se accetti:</strong> ${seatsNotice ? '+1 Seggio a Montecitorio, ' : ''}+0.25% sondaggi per ${toParty.short}, ma -4% coesione interna per malumori delle correnti.<br>
      • <strong>Se rifiuti:</strong> I quadri storici di ${toParty.short} apprezzano la fermezza ideologica (+3% coesione interna).<br><br>
      Come Segretario Nazionale di ${toParty.short}, accogli la richiesta di passaggio?
    </div>`,
    [
      {
        label: `✅ Accetta ${pol.name} nel Partito (+Consenso${seatsNotice ? ', +1 Seggio' : ''})`,
        fn: () => {
          const matchPol = POLITICIANS.find(x => x.id === pol.id || x.name === pol.name) || pol;
          matchPol.partyId = toParty.id;
          pol.partyId = toParty.id;
          if (!game.politicianPartyMap) game.politicianPartyMap = {};
          game.politicianPartyMap[pol.id] = toParty.id;
          toParty.poll = Math.min(95, +(toParty.poll + 0.25).toFixed(1));
          if (seatsNotice && fromParty.seats > 0) {
            fromParty.seats = Math.max(0, fromParty.seats - 1);
            toParty.seats += 1;
          }
          toParty.cohesion = Math.max(20, (toParty.cohesion || 80) - 4);
          recordPoliticianHistory(pol.name, `Lascia ${fromParty.short} e passa al gruppo parlamentare di ${toParty.short}`, `Dirigente ${toParty.short}`);
          setBetrayal(fromParty.id, toParty.id, 365, `Passaggio di ${pol.name} da ${fromParty.short} a ${toParty.short}`);

          // PUNTO 7 (1.8.1): Se chi lascia era Segretario, il vecchio partito elegge SUBITO un nuovo Segretario!
          if (fromParty.leader === pol.name) {
            const remaining = POLITICIANS.filter(p => p.partyId === fromParty.id && p.id !== pol.id && !p.isPlayer);
            const newLead = [...remaining].sort((a,b) => (b.clout || b.prestige || 50) - (a.clout || a.prestige || 50))[0] || generateNewPolitician(fromParty.id);
            fromParty.leader = newLead.name;
            fromParty.leaderAge = newLead.age;
            syncPartyNameWithLeader(fromParty, newLead.name);
            recordPoliticianHistory(newLead.name, `Eletto nuovo Segretario Nazionale di ${fromParty.short} a seguito dell'addio di ${pol.name}`, `Segretario Nazionale ${fromParty.short}`);
          }

          // PUNTO 9 (1.8.1): Mantiene il bilanciamento del numero di membri generando un sostituto nel vecchio partito
          generateNewPolitician(fromParty.id);

          addFeed(`🔄 <strong>TRANSFUGHISMO A MONTECITORIO:</strong> <strong>${pol.name}</strong> lascia ${fromParty.short} ed entra ufficialmente in <strong>${toParty.name} (${toParty.short})</strong>!`, 'ok');
          setTicker(`TRANSFUGHI: ${pol.name} passa a ${toParty.short}!`);
          closeModal();
          recalcPolls(true);
          updateAllUI();
        }
      },
      {
        label: `❌ Respingi la Richiesta (Difendi la Coerenza Ideologica di ${toParty.short})`,
        fn: () => {
          toParty.cohesion = Math.min(100, (toParty.cohesion || 80) + 3);
          addFeed(`✋ <strong>TESSERAMENTO RESPINTO:</strong> Il Segretario ${game.leader.name} respinge la richiesta di adesione di ${pol.name} (+3% Coesione interna di ${toParty.short}).`);
          closeModal();
          updateAllUI();
        }
      }
    ]
  );
}


export function initDemographicCalibrated() {
      const targetSum = game.parties.reduce((s,p) => s + p.poll, 0);
      const targets = {};
      game.parties.forEach(p => { targets[p.id] = (p.poll / targetSum) * 100; });
      game.parties.forEach(p => {
        game.blocSympathy[p.id] = {};
        BLOCS.forEach(b => { game.blocSympathy[p.id][b.id] = Math.max(2, computeBlocMatch(p, b) * targets[p.id]); });
      });
      for (let i = 0; i < 20; i++) {
        recalcPolls(false);
        game.parties.forEach(p => {
          const scale = Math.pow(targets[p.id] / (p.poll || 0.08), 1 / 0.68);
          BLOCS.forEach(b => { game.blocSympathy[p.id][b.id] *= scale; });
        });
      }
      recalcPolls(true);
    }

export function computeBlocMatch(party, bloc) {
      let wSum = 0, mSum = 0;
      Object.keys(bloc.ideal).forEach(k => {
        const isPrio = bloc.prio.includes(k);
        const flag = (party.id === game.playerPartyId && game.flagshipIssues.has(k)) ? 1.35 : 1.0;
        const sal = (game.issueSalience[k] || 15) * (isPrio ? 2.2 : 1.0) * flag;
        const dist = Math.abs((party?.stances?.[k] ?? 2) - bloc.ideal[k]);
        mSum += Math.max(4, 100 - dist * 24) * sal;
        wSum += sal;
      });
      return mSum / (wSum || 1);
    }

export function shiftBloc(partyId, blocId, deltaPct) {
      if (partyId === 'ind') { game.leader.prestige = Math.max(10, Math.min(100, game.leader.prestige + Math.round(deltaPct * 0.6))); return; }
      if (!game.blocSympathy[partyId]) return;
      game.blocSympathy[partyId][blocId] = Math.max(0.5, (game.blocSympathy[partyId][blocId] || 15) * (1 + deltaPct / 100));
      recalcPolls(true);
    }

export function recalcPolls(roundVals = true) {
      const totals = {};
      game.parties.forEach(p => totals[p.id] = 0);
      BLOCS.forEach(bloc => {
        const scores = {}; let bSum = 0;
        game.parties.forEach(p => {
          const aff = computeBlocMatch(p, bloc);
          const symp = game.blocSympathy[p.id]?.[bloc.id] || 10;
          const cred = 0.45 + (p.credibility / 190);
          const org = 0.55 + (p.orgStrength / 240);
          // Penalità elettorale se il partito tradisce pesantemente la propria identità storica senza rifondazione!
          const drift = computePartyDrift(p);
          const driftPen = drift > 0.8 ? Math.max(0.28, 1 - (drift - 0.5) * 0.35) : 1.0;
          const val = Math.pow(aff, 1.35) * Math.pow(symp, 0.68) * cred * org * driftPen;
          scores[p.id] = val; bSum += val;
        });
        game.parties.forEach(p => { totals[p.id] += (scores[p.id] / (bSum || 1)) * bloc.share; });
      });
      game.parties.forEach(p => { p.poll = roundVals ? Math.max(0.1, +totals[p.id].toFixed(1)) : Math.max(0.05, totals[p.id]); });
      // PUNTO 17 (1.8.1): Realismo elettorale partiti territoriali - SVP circoscritta al bacino del Trentino-Alto Adige (0.3%–0.6% nazionale, max 0.7%)
      const svp = game.parties.find(p => p.id === 'svp');
      if (svp) {
        svp.poll = Math.min(0.6, Math.max(0.2, +svp.poll.toFixed(1)));
      }
      if (roundVals) updateRegPolls();
    }

export function initRegOrg() {
      FALLBACK_REGIONS.forEach(r => {
        game.regOrg[r.id] = {}; game.regionPolls[r.id] = {};
        game.parties.forEach(p => {
          let org = p.orgStrength * 0.6;
          if (r.lean === "Centro-Sinistra" && ['pd','avs','psi'].includes(p.id)) org += 22;
          if (r.lean === "Destra" && ['fdi','lega'].includes(p.id)) org += 20;
          if (['Veneto','Lombardia','Friuli-Venezia Giulia'].includes(r.id) && p.id === 'lega') org += 28;
          if (['Campania','Puglia','Sicilia','Calabria','Basilicata'].includes(r.id) && p.id === 'm5s') org += 25;
          if (r.id === 'Sicilia' && p.id === 'scn') org += 48;
          if (r.id === 'Trentino-Alto Adige' && p.id === 'svp') org += 78;
          if (r.id === game.leader.region && p.id === game.playerPartyId) org += 18;
          game.regOrg[r.id][p.id] = Math.min(100, Math.round(org));
        });
      });
    }

export function updateRegPolls() {
      FALLBACK_REGIONS.forEach(r => {
        const prof = (typeof REGIONAL_PROFILES !== 'undefined' && (REGIONAL_PROFILES[r.name] || REGIONAL_PROFILES[r.id])) || { lean:'Centro', businessWeight:1.0, welfareWeight:1.0, autonomyWeight:1.0, favIssues:[] };
        let sum = 0;
        const raw = {};
        game.parties.forEach(p => {
          const ideo = getPartyIdeoScore(p);
          let weight = 1.0;

          // 1. Allineamento Ideologico Territoriale
          if (prof.lean.includes('Destra') && ideo >= 2.5) {
            weight *= (1.20 + (ideo - 2.5) * 0.15);
          } else if (prof.lean.includes('Sinistra') && ideo <= 1.8) {
            weight *= (1.24 + (1.8 - ideo) * 0.18);
          } else if (prof.lean.includes('Centro') && ideo >= 1.8 && ideo <= 2.8) {
            weight *= 1.15;
          }

          // 2. Dossier Tematici Regionali
          if (prof.autonomyWeight > 1.3) {
            const instStance = p.stances?.inst ?? 2;
            if (instStance >= 3 || ['lega','svp','fn','sc_nord'].includes(p.id)) {
              weight *= (1.10 * prof.autonomyWeight);
            } else if (instStance === 0) {
              weight *= 0.85;
            }
          }
          if (prof.businessWeight > 1.3) {
            const taxStance = p.stances?.tax ?? 2;
            if (taxStance >= 3 || ['fdi','fi','az','iv','lega'].includes(p.id)) {
              weight *= (1.08 * prof.businessWeight);
            } else if (taxStance === 0) {
              weight *= 0.88;
            }
          }
          if (prof.welfareWeight > 1.4) {
            const welStance = p.stances?.welfare ?? 2;
            if (welStance <= 1 || ['m5s','pd','avs','prc'].includes(p.id)) {
              weight *= (1.12 * prof.welfareWeight);
            } else if (welStance >= 3) {
              weight *= 0.85;
            }
          }

          // 3. Roccaforti territoriali e partiti locali
          if (p.id === 'svp' && ((r.name && r.name.includes('Trentino')) || (r.id && r.id.includes('Trentino')) || r.id === 'taa')) weight *= 16.0;
          if (p.id === 'scn' && ((r.name && r.name.includes('Sicilia')) || (r.id && r.id.includes('Sicilia')) || r.id === 'sic')) weight *= 4.5;
          if (p.id === 'lega' && ['Veneto','Lombardia'].includes(r.id)) weight *= 1.45;
          if (p.id === 'pd' && ['Emilia-Romagna','Toscana'].includes(r.id)) weight *= 1.40;
          if (p.id === 'm5s' && ['Campania','Sicilia','Calabria'].includes(r.id)) weight *= 1.35;

          // Radicamento organizzativo
          const orgBonus = (game.regOrg[r.id]?.[p.id] || 50) / 50;
          weight *= Math.max(0.65, Math.min(1.4, orgBonus));

          raw[p.id] = Math.max(0.08, p.poll * weight);
          sum += raw[p.id];
        });

        if (!game.regionPolls[r.id]) game.regionPolls[r.id] = {};
        game.parties.forEach(p => {
          game.regionPolls[r.id][p.id] = (raw[p.id] / (sum || 1)) * 100;
        });
      });

      // PUNTO 17 (1.7): Riconciliazione demografica ponderata per popolazione ISTAT (Sinkhorn-Knopp / IPF)
      // La media ponderata dei sondaggi regionali (in base a popWeight di ogni regione) corrisponde esattamente al sondaggio nazionale p.poll!
      const totalPopW = FALLBACK_REGIONS.reduce((acc, r) => acc + (r.popWeight || REGIONAL_PROFILES[r.id]?.popWeight || 5.0), 0) || 100.0;
      for (let iter = 0; iter < 3; iter++) {
        // 1. Scala ogni partito affinché la sua media nazionale ponderata per popolazione coincida con p.poll
        game.parties.forEach(p => {
          let weightedAvg = 0;
          FALLBACK_REGIONS.forEach(r => {
            const pw = (r.popWeight || REGIONAL_PROFILES[r.id]?.popWeight || 5.0) / totalPopW;
            weightedAvg += (game.regionPolls[r.id]?.[p.id] || 0) * pw;
          });
          const scale = weightedAvg > 0.005 ? (p.poll / weightedAvg) : 1.0;
          FALLBACK_REGIONS.forEach(r => {
            if (game.regionPolls[r.id]) {
              game.regionPolls[r.id][p.id] = Math.max(0.05, (game.regionPolls[r.id][p.id] || 0.05) * scale);
            }
          });
        });
        // 2. Normalizza ciascuna regione a 100.0%
        FALLBACK_REGIONS.forEach(r => {
          let rSum = 0;
          game.parties.forEach(p => { rSum += (game.regionPolls[r.id]?.[p.id] || 0); });
          if (rSum > 0) {
            game.parties.forEach(p => {
              game.regionPolls[r.id][p.id] = (game.regionPolls[r.id][p.id] / rSum) * 100;
            });
          }
        });
      }

      // Arrotondamento finale a 1 cifra decimale
      FALLBACK_REGIONS.forEach(r => {
        game.parties.forEach(p => {
          if (game.regionPolls[r.id]) {
            game.regionPolls[r.id][p.id] = +((game.regionPolls[r.id][p.id] || 0).toFixed(1));
          }
        });
      });
    }

export function initAllPairRelationsAndCabinet() {
      game.parties.forEach(a => {
        game.pairRelations[a.id] = {};
        game.allySatisfaction[a.id] = 78;
        game.parties.forEach(b => {
          if (a.id === b.id) { game.pairRelations[a.id][b.id] = 100; return; }
          let diff = 0;
          DOSSIERS.forEach(d => diff += Math.abs((a.stances[d.key] ?? 2) - (b.stances[d.key] ?? 2)));
          let rel = Math.max(10, Math.min(92, 90 - diff * 1.6));
          if (a.coalId !== 'none' && a.coalId === b.coalId) rel = Math.max(75, rel);
          if (a.vetoes?.includes(b.id) || b.vetoes?.includes(a.id)) rel = Math.min(25, rel);
          game.pairRelations[a.id][b.id] = Math.round(rel);
        });
      });
      setBetrayal('lega', 'fn', 1460, "Scissione di Futuro Nazionale dalla Lega");
      const initM = {
        mef:'giorgetti_p', interni:'piantedosi', esteri:'tajani_p', difesa:'crosetto', giustizia:'nordio',
        mimit:'urso', lavoro:'calderone', salute:'schillaci', mit:'salvini_p', mase:'pichetto',
        mim:'valditara', cultura:'giuli_p', mur:'bernini', turismo:'santanche', agricoltura:'lollobrigida'
      };
      MINISTRIES.forEach(m => {
        const found = POLITICIANS.find(x => x.id === initM[m.id]);
        game.cabinet[m.id] = found ? { ...found } : { id:`fallback_${m.id}`, name:`Ministro (${m.name})`, partyId:'tech', competence:80 };
      });
      game.senateSpeaker = POLITICIANS.find(x => x.id === 'larussa') || { id:'larussa', name:'Ignazio La Russa', age:79, partyId:'fdi' };
      game.chamberSpeaker = POLITICIANS.find(x => x.id === 'fontana_l') || { id:'fontana_l', name:'Lorenzo Fontana', age:46, partyId:'lega' };
      game.governors = JSON.parse(JSON.stringify(INITIAL_GOVERNORS));
      game.regionalElectionCooldowns = {};

      // Collega il giocatore al politico reale corrispondente (es. Zaia = Governatore Veneto, La Russa = Pres. Senato, Meloni = Premier, Mattarella = Pres. Repubblica) senza assegnare ministeri fittizi!
      const plPol = ensurePlayerInPoliticians();
      // Solo se il giocatore ha creato un personaggio custom segretario nazionale di un partito minore di governo e non ha già alcuna carica, può assumere il dicastero del partito
      const pStart = getP();
      const isPremier = (game.currentPM === game.leader.name || game.currentPM === `${game.leader.name} (Tecnico)`);
      if (charMode === 'custom' && game.partyRole === 'secretary' && pStart && pStart.id !== 'ind' && pStart.inGov && !isPremier && !getPersonCurrentOffice(game.leader.name)) {
        const targetMinId = pStart.id === 'fi' ? 'esteri' : (pStart.id === 'lega' ? 'mit' : (pStart.id === 'nm' ? 'mur' : null));
        if (targetMinId && plPol) game.cabinet[targetMinId] = plPol;
      }
      enforceSingleOfficeRule();
    }

export function computeCompat(p1, p2) {
      if (!p1 || !p2 || p1.id === 'ind' || p2.id === 'ind') return { score:65, total:65, vetoed:false, hasVeto:false, progScore:65, rel:65 };
      const bet = getBetrayal(p1.id, p2.id);
      if (bet) {
        return { score:5, total:5, vetoed:true, hasVeto:true, progScore:10, rel:5, reason:`Rancore storico attivo (${bet.reason} — ancora ${Math.ceil(bet.days/365)} anni di gelo)` };
      }
      let diff = 0;
      DOSSIERS.forEach(d => diff += Math.abs((p1.stances[d.key] ?? 2) - (p2.stances[d.key] ?? 2)));
      const progScore = Math.max(0, Math.round(100 - (diff / 56) * 100));
      const ideoDist = Math.abs(getPartyIdeoScore(p1) - getPartyIdeoScore(p2));
      const rel = getPairRel(p1.id, p2.id);

      // Veto dinamico: se hanno lo stesso programma (progScore >= 70), il veto ideologico non blocca più!
      const hasStaticVeto = (p1.vetoes?.includes(p2.id) || p2.vetoes?.includes(p1.id)) && progScore < 68;
      if (hasStaticVeto || ideoDist > 1.85) {
        const sc = Math.min(35, Math.round(progScore * 0.5 + rel * 0.3));
        return { score:sc, total:sc, vetoed:true, hasVeto:true, progScore, rel, reason:`Incompatibilità ideologica e veto tra ${p1.short} e ${p2.short} (avvicina i programmi oltre il 68% per rimuovere il veto!)` };
      }
      const finalScore = Math.round(progScore * 0.65 + rel * 0.35);
      return { score:finalScore, total:finalScore, vetoed:false, hasVeto:false, progScore, rel };
    }

export function checkCoalitionAdmissionVote(coalId, applicantParty) {
      const members = game.parties.filter(p => p.coalId === coalId);
      if (members.length === 0) return { approved:true, details:[] };
      let yesWeight = 0, totalWeight = 0;
      const details = [];
      for (const m of members) {
        const bet = getBetrayal(m.id, applicantParty.id);
        if (bet) {
          return { approved:false, vetoBy:m, reason:`VETO ASSOLUTO di ${m.name} (${m.leader}) per "${bet.reason}" (rancore ancora per ${Math.ceil(bet.days/365)} anni)!` };
        }
        const comp = computeCompat(m, applicantParty);
        if (comp.vetoed || comp.score < 50) {
          return { approved:false, vetoBy:m, reason:`VETO POLITICO posto da ${m.name} (${m.leader}): compatibilità insufficiente (${comp.score}%).` };
        }
        const w = Math.max(1, m.poll);
        totalWeight += w;
        if (comp.score >= 58) { yesWeight += w; details.push(`${m.short}: SÌ (${comp.score}%)`); }
        else details.push(`${m.short}: NO (${comp.score}%)`);
      }
      const pct = Math.round((yesWeight / (totalWeight || 1)) * 100);
      return { approved: pct >= 65, pct, details, reason: pct >= 65 ? `Approvato dal tavolo della coalizione (${pct}% favorevoli)` : `Bocciato dal voto della coalizione (solo ${pct}% favorevoli: ${details.join(', ')})` };
    }

export function getCoalLeaderParty(coalId) {
      if (!coalId || coalId === 'none') return null;
      const mems = game.parties.filter(p => p.coalId === coalId).sort((a,b) => b.poll - a.poll || b.seats - a.seats);
      return mems[0] || null;
    }

    /* PUNTO 1: CONTROLLO DI COERENZA IDEOLOGICA, ESPULSIONE DALLA COALIZIONE E SFIDUCIA AL SEGRETARIO */
export function checkIdeologicalCoherenceAndConsequences(p) {
      if (!p || p.id === 'ind') return;

      // 1. Aggiorna i veti dinamici (se hai spostato il programma a destra, cade il veto coi partiti di destra e nasce quello a sinistra!)
      recalcDynamicVetoes();

      // 2. Verifica compatibilità con la Coalizione attuale (es. M5S nel Centrosinistra che sposta il programma a destra!)
      if (p.coalId !== 'none') {
        const allies = game.parties.filter(x => x.coalId === p.coalId && x.id !== p.id);
        if (allies.length > 0) {
          const coalLead = getCoalLeaderParty(p.coalId);
          const refPartner = (coalLead && coalLead.id !== p.id) ? coalLead : allies[0];
          let diff = 0;
          DOSSIERS.forEach(d => diff += Math.abs((p.stances[d.key] ?? 2) - (refPartner.stances[d.key] ?? 2)));
          const progCompat = Math.max(0, Math.round(100 - (diff / 56) * 100));
          const ideoDist = Math.abs(getPartyIdeoScore(p) - getPartyIdeoScore(refPartner));

          if (progCompat < 44 || ideoDist > 1.35) {
            const oldCoalName = getCoalName(p.coalId);
            if (coalLead && coalLead.id !== p.id) {
              // Il leader della coalizione (es. Schlein) espelle il partito del giocatore per tradimento programmatico!
              p.coalId = 'none';
              setBetrayal(p.id, coalLead.id, 1095, `Svolta ideologica incompatibile di ${p.short} ed espulsione da ${oldCoalName}`);
              if (p.inGov) {
                p.inGov = false;
                game.govStability = Math.max(0, game.govStability - 30);
              }
              addFeed(`🚨 <strong>ESPULSIONE DALLA COALIZIONE (${oldCoalName.toUpperCase()}):</strong> <strong>${coalLead.leader} (${coalLead.short})</strong> dichiara incompatibile la svolta programmatica di <strong>${p.name}</strong> (compatibilità scesa al ${progCompat}%) ed espelle ${p.short} dalla coalizione!`, 'cr');
              setTicker(`ROTTURA NEL ${oldCoalName.toUpperCase()}: ${coalLead.leader} espelle ${p.short} per deriva ideologica!`);
            } else {
              // Il giocatore era il 1° partito della coalizione ma ha stravolto il programma: tutti gli alleati lasciano la coalizione!
              allies.forEach(al => {
                if (Math.abs(getPartyIdeoScore(p) - getPartyIdeoScore(al)) > 1.25) {
                  al.coalId = 'none';
                  if (al.inGov) { al.inGov = false; game.govStability = Math.max(0, game.govStability - 20); }
                  setBetrayal(p.id, al.id, 1095, `Rottura programmatica in ${oldCoalName}`);
                }
              });
              addFeed(`💥 <strong>RIBBELLIONE DEGLI ALLEATI IN ${oldCoalName.toUpperCase()}:</strong> Dopo lo stravolgimento del programma di ${p.short}, gli alleati rompono il patto di coalizione!`, 'cr');
            }
          }
        }
      }

      // 3. Se la fiducia nella segreteria (leaderTrust) è crollata per il tradimento dello Statuto, scatta la Mozione di Sfiducia Interna!
      const drift = computePartyDrift(p);
      if (game.partyRole === 'secretary' && (p.leaderTrust <= 36 || drift >= 1.35) && !document.getElementById('modalBg').classList.contains('open')) {
        openSecretaryImpeachmentModal(p, drift);
      }
    }

export function openSecretaryImpeachmentModal(p, drift) {
      const challenger = p.wingLeader || "Coordinamento dei Garanti";
      document.getElementById('mTag').textContent = `RIVOLTA INTERNA E SFIDUCIA IN ${p.name.toUpperCase()}`;
      document.getElementById('mTitle').textContent = `⚠️ Mozione di Sfiducia contro il Segretario ${game.leader.name} per Tradimento del Manifesto!`;
      document.getElementById('mBody').innerHTML = `
        La Direzione Nazionale, i parlamentari e la base militante di <strong>${p.name}</strong> sono in rivolta aperta!<br><br>
        Hai spostato radicalmente il programma del partito lontano dai suoi valori fondativi (Scostamento dallo Statuto: <strong>${drift}</strong>, Fiducia interna crollata al <strong>${p.leaderTrust}%</strong>, Consenso attuale: <strong>${p.poll}%</strong>).<br>
        Il capocorrente <strong>${challenger}</strong> ha depositato una mozione di sfiducia immediata per destituirti da Segretario Nazionale.<br><br>
        Come rispondi all'ultimatum dell'Assemblea Nazionale?
      `;
      const box = document.getElementById('mChoices');
      box.innerHTML = '';

      // Opzione 1: Vai alla conta al Congresso Straordinario di Sfiducia
      const b1 = document.createElement('button');
      b1.className = 'm-btn';
      const winChance = Math.max(5, Math.min(85, Math.round(game.leader.internalSupport * 0.55 + p.leaderTrust * 0.45 - drift * 12)));
      b1.innerHTML = `<strong>⚔️ Affronta la Conta in Assemblea Nazionale (Chance di sopravvivenza: ~${winChance}%)</strong><span>Se perdi il voto, vieni destituito da Segretario e ${challenger} ripristina il programma originario di ${p.short}!</span>`;
      b1.onclick = () => {
        const roll = Math.random() * 100;
        if (roll <= winChance) {
          p.baseStances = { ...p.stances };
          p.baseIdeo = getPartyIdeoScore(p);
          p.leaderTrust = 62;
          // La minoranza scissionista abbandona il partito!
          closeModal();
          executePartySplit(p, false);
          addFeed(`👑 <strong>SOPRAVVISSUTO ALLA SFIDUCIA IN ${p.short}:</strong> ${game.leader.name} piega la fronda interna e impone la nuova linea ideologica, ma l'ala ortodossa di ${challenger} fa una scissione immediata!`, 'cr');
        } else {
          // SFIDUCIATO E DESTITUITO!
          const oldSec = game.leader.name;
          p.leader = challenger;
          p.leaderAge = p.wingAge || 48;
          p.wingLeader = oldSec;
          p.wingAge = game.leader.age;
          p.stances = { ...p.baseStances };
          p.leaderTrust = 82;
          p.cohesion = 78;
          game.partyRole = 'member';
          game.leader.internalSupport = 22;
          game.leader.prestige = Math.max(15, game.leader.prestige - 20);
          syncPartyNameWithLeader(p, challenger);
          recordPoliticianHistory(oldSec, `Sfiduciato da Segretario Nazionale di ${p.short} all'Assemblea Straordinaria`, `Capocorrente ${p.short}`);
          recordPoliticianHistory(challenger, `Eletto Segretario Nazionale di ${p.short} dopo sfiducia a ${oldSec}`, `Segretario Nazionale ${p.short}`);
          recalcDynamicVetoes();
          recalcPolls(true);
          addFeed(`🔨 <strong>SEGRETARIO SFIDUCIATO E DESTITUITO!</strong> L'Assemblea di <strong>${p.name}</strong> sfiducia <strong>${oldSec}</strong> per tradimento del programma! Eletto nuovo Segretario <strong>${challenger}</strong>, che ripristina immediatamente la linea storica del partito!`, 'cr');
          setTicker(`RIBALTONE IN ${p.short}: ${oldSec} sfiduciato dalla base! ${challenger} nuovo Segretario.`);
          closeModal();
        }
        updateAllUI();
      };
      box.appendChild(b1);

      // Opzione 2: Ritira la svolta e ripristina lo Statuto originario
      const b2 = document.createElement('button');
      b2.className = 'm-btn';
      b2.innerHTML = `<strong>🏳️ Fai Marcia Indietro: Ritira le modifiche e ripristina il Programma Storico di ${p.short}</strong><span>Salvi la poltrona di Segretario (Fiducia torna al 65%), ma perdi -15% Prestigio Personale e -12% Forza Corrente per l'umiliazione politica.</span>`;
      b2.onclick = () => {
        p.stances = { ...p.baseStances };
        p.leaderTrust = 65;
        p.cohesion = 75;
        game.leader.prestige = Math.max(15, game.leader.prestige - 15);
        game.leader.internalSupport = Math.max(20, game.leader.internalSupport - 12);
        recalcDynamicVetoes();
        recalcPolls(true);
        addFeed(`🏳️ <strong>RETROMARCIA IN DIREZIONE ${p.short}:</strong> Per evitare la destituzione, ${game.leader.name} ritira la svolta programmatica e ripristina il manifesto storico del partito.`, 'cr');
        closeModal(); updateAllUI();
      };
      box.appendChild(b2);

      // Opzione 3: Lascia il partito e fonda una scissione con le tue nuove idee
      const b3 = document.createElement('button');
      b3.className = 'm-btn';
      b3.innerHTML = `<strong>⚡ Strappa col Partito: Lascia ${p.short} al suo vecchio programma e guida una Scissione sulla tua nuova linea!</strong><span>${p.short} torna al suo programma originario con ${challenger}, mentre tu fondi un nuovo partito con i tuoi fedelissimi.</span>`;
      b3.onclick = () => {
        const myNewStances = { ...p.stances };
        p.stances = { ...p.baseStances };
        closeModal();
        executePartySplit(p, true, myNewStances);
        updateAllUI();
      };
      box.appendChild(b3);

      openModal();
    }

    /* PUNTO 1 (v6.2): NESSUNO SCIOGLIMENTO CASUALE DEI PARTITI PICCOLI!
       I partiti minori storici (initialPoll < 1.8%) hanno una propria nicchia militante e NON si sciolgono mai a caso.
       Uno scioglimento per crollo avviene SOLO se un partito che partiva da >= 1.8% crolla sotto lo 0.20%, ha 0 seggi e coesione < 35% per oltre 12 settimane consecutive. */
export function checkPartyExtinction() {
      const toDissolve = [];
      game.parties.forEach(p => {
        if (p.id === 'svp' || p.id === game.playerPartyId) return;
        if (p.newlyFoundedGraceWeeks && p.newlyFoundedGraceWeeks > 0) {
          p.newlyFoundedGraceWeeks--;
          return;
        }
        const initP = p.initialPoll ?? p.poll;
        // I partiti piccoli preesistenti (< 1.8% iniziale) sopravvivono sempre nella loro nicchia politica!
        if (initP < 1.8) {
          p.lowPollWeeks = 0;
          return;
        }
        if (p.poll <= 0.20 && p.seats === 0 && (p.cohesion || 70) < 35) {
          p.lowPollWeeks = (p.lowPollWeeks || 0) + 1;
          if (p.lowPollWeeks >= 12) toDissolve.push(p);
        } else {
          p.lowPollWeeks = 0;
        }
      });

      toDissolve.forEach(p => {
        if (game.parties.length <= 10) return;
        dissolveParty(p, "Crollo storico dei consensi dopo una lunga crisi interna");
      });
    }

export function dissolveParty(deadParty, reason, mergeIntoParty = null) {
      const others = game.parties.filter(x => x.id !== deadParty.id);
      if (others.length === 0) return;
      const heirParty = mergeIntoParty || others.sort((a,b) => Math.abs(getPartyIdeoScore(a) - getPartyIdeoScore(deadParty)) - Math.abs(getPartyIdeoScore(b) - getPartyIdeoScore(deadParty)))[0];

      if (deadParty.seats > 0 && heirParty) {
        heirParty.seats += deadParty.seats;
      }
      if (heirParty) {
        BLOCS.forEach(b => {
          game.blocSympathy[heirParty.id][b.id] = (game.blocSympathy[heirParty.id][b.id] || 10) + (game.blocSympathy[deadParty.id]?.[b.id] || 2) * 0.7;
        });
      }

      game.dissolvedParties.push({ name:deadParty.name, short:deadParty.short, color:deadParty.color||'#94a3b8', date:fmtDate(game.date), turn:game.turn, reason });
      game.parties = game.parties.filter(x => x.id !== deadParty.id);

      if (game.playerPartyId === deadParty.id) {
        game.playerPartyId = 'ind';
        game.partyRole = 'independent';
        document.body.classList.add('theme-ind');
        addFeed(`⚰️ <strong>SCIOGLIMENTO DEL TUO PARTITO (${deadParty.name}):</strong> ${reason}. Il partito chiude ufficialmente i battenti; prosegui la carriera politica come <strong>Indipendente</strong>!`, 'cr');
      } else {
        addFeed(`⚰️ <strong>MORTE POLITICA E SCIOGLIMENTO DI ${deadParty.name.toUpperCase()} (${deadParty.short}):</strong> ${reason}. La struttura si scioglie e gli ultimi iscritti confluiscono in <strong>${heirParty.name}</strong>!`, 'cr');
        setTicker(`ULTIM'ORA: ${deadParty.name} (${deadParty.short}) annuncia lo scioglimento definitivo!`);
      }
      if (game.selectedDossierPartyId === deadParty.id) {
        game.selectedDossierPartyId = game.parties[0].id;
      }
      recalcPolls(true);
    }

    /* BUG FIX 2: SE IL PREMIER LASCIA IL PROPRIO PARTITO O PASSA A UN ALTRO PARTITO/COALIZIONE, IL GOVERNO CADE! */
export function checkAndTriggerPremierDefectionCrisis(oldParty, actionDesc) {
      if (typeof oldParty === 'string') { actionDesc = oldParty; oldParty = getP(); }
      if (game.currentPM !== game.leader.name || game.isDictatorship) return;
      // Il giocatore era Presidente del Consiglio e ha appena lasciato il partito che guidava il governo!
      addFeed(`🚨 <strong>CRISI DI GOVERNO AL QUIRINALE!</strong> Il Presidente del Consiglio <strong>${game.leader.name}</strong> ha lasciato <strong>${oldParty.name}</strong> (${actionDesc}). La maggioranza parlamentare ritira immediatamente la fiducia!`, 'cr');
      setTicker(`CRISI A PALAZZO CHIGI: ${game.leader.name} lascia ${oldParty.short}, cade il Governo!`);

      // Il vecchio partito esce dal sostegno a chi lo ha tradito e il giocatore decade subito da Premier
      const oldCoalParties = game.parties.filter(x => x.coalId === oldParty.coalId && x.seats > 0);
      const oldCoalSeats = oldCoalParties.reduce((s,x)=>s+x.seats, 0);
      const newLeadParty = [...oldCoalParties].sort((a,b)=>b.seats-a.seats)[0] || oldParty;
      const curP = getP();
      if (curP && curP.id !== 'ind' && curP.coalId !== oldParty.coalId) curP.inGov = false;
      game.govStability = 15;
      game.currentPM = newLeadParty.leader;

      document.getElementById('mTag').textContent = "CRISI ISTITUZIONALE AL QUIRINALE (BUG FIX 2)";
      document.getElementById('mTitle').textContent = `💥 Cade il Governo ${game.leader.name} dopo l'addio a ${oldParty.name}!`;
      document.getElementById('mBody').innerHTML = `
        Avendo lasciato <strong>${oldParty.name}</strong> (${actionDesc}), i gruppi parlamentari di maggioranza ti hanno <strong>immediatamente sfiduciato</strong>.<br><br>
        Il Presidente della Repubblica <strong>${game.president.name}</strong> ti ha convocato al Quirinale per prendere atto della decadenza da Presidente del Consiglio.<br>
        Qual è l'esito delle consultazioni d'urgenza al Colle?
      `;
      const box = document.getElementById('mChoices');
      box.innerHTML = '';

      if (oldCoalSeats >= 201 && newLeadParty && game.stateForm !== 'premierato') {
        const b1 = document.createElement('button');
        b1.className = 'm-btn';
        b1.innerHTML = `<strong>🏛️ La vecchia maggioranza (${getCoalName(oldParty.coalId)}, ${oldCoalSeats} seggi) indica Premier ${newLeadParty.leader} (${newLeadParty.short})</strong><span>Nasce il Governo ${newLeadParty.leader} senza di te; tu passi ai banchi del tuo nuovo ruolo parlamentare (Art. 92 Cost.).</span>`;
        b1.onclick = () => {
          autoFormGovAI(oldCoalParties, newLeadParty.leader, oldParty.coalId);
          const cp = getP();
          if (cp.id !== 'ind' && cp.coalId !== oldParty.coalId) cp.inGov = false;
          closeModal(); updateAllUI();
        };
        box.appendChild(b1);
      } else {
        if (game.stateForm !== 'premierato') {
          const bTech = document.createElement('button');
          bTech.className = 'm-btn';
          bTech.innerHTML = `<strong>🏛️ Incarico Istituzionale al Quirinale: Forma un Governo Tecnico di Garanzia</strong><span>In assenza di una maggioranza politica (Art. 88 Cost.), il Presidente della Repubblica nomina un esecutivo tecnico evitando lo scioglimento immediato.</span>`;
          bTech.onclick = () => {
            closeModal();
            formTechnicalGovernment();
            updateAllUI();
          };
          box.appendChild(bTech);
        }
        const b2 = document.createElement('button');
        b2.className = 'm-btn';
        b2.innerHTML = `<strong>🗳️ ${game.stateForm === 'premierato' ? 'Simul Stabunt Simul Cadent (Premierato): Scioglimento automatico delle Camere' : 'Nessuna maggioranza in Parlamento: il Quirinale scioglie le Camere (Elezioni tra 45 giorni)'}</strong><span>Si torna al voto popolare solo per accertata impossibilità di formare una maggioranza parlamentare!</span>`;
        b2.onclick = () => {
          closeModal();
          startElectoralCampaign(`Crollo del Governo dopo lo strappo del Premier ${game.leader.name} da ${oldParty.short}!`);
        };
        box.appendChild(b2);
      }

      openModal();
    }

    /* BUG FIX 1: AVANZAMENTO DEL TEMPO SEMPRE VERITIERO AL 100% (+1G, +7G, +30G) + CAMPAGNA REFERENDARIA 30G (PUNTO 4) + RESET AZIONI GIORNALIERE (PUNTO 10) */
export function nextTurns(days) {
      if (game.isDead) {
        alert("La tua parabola politica e storica si è conclusa con la tua scomparsa terrena.");
        return;
      }
      let pendingWorldEvent = false;
      let justFreedFromPrison = false;
      let finishedRef = null;

      for (let i = 0; i < days; i++) {
        game.turn++;
        game.turnActionsUsed = [];
        const prevYear = game.date.getFullYear();
        game.date = new Date(game.date.getFullYear(), game.date.getMonth(), game.date.getDate() + 1);

        // PUNTO 33 (1.8): Controllo mortalità naturale sopra gli 80 anni
        if (game.leader.age >= 80 && !game.isDead) {
          const dailyMortalityChance = (game.leader.age - 78) * 0.00015;
          if (Math.random() < dailyMortalityChance) {
            triggerPlayerNaturalDeathModal();
            return;
          }
        }

        // Sconto giornaliero della pena se il giocatore è personalmente detenuto a Rebibbia
        if (game.isImprisoned && game.prisonDaysLeft > 0) {
          game.prisonDaysLeft--;
          if (game.prisonDaysLeft <= 0) {
            game.isImprisoned = false;
            game.prisonDaysLeft = 0;
            game.prisonReason = null;
            justFreedFromPrison = true;
            addFeed(`🔓 <strong>FINE PENA E SCARCERAZIONE DA REBIBBIA:</strong> <strong>${game.leader.name}</strong> ha scontato la condanna e torna un libero cittadino!`, 'ok');
            setTicker(`REBIBBIA: ${game.leader.name} scarcerato per fine pena. Torna nell'arena politica.`);
          }
        }

        // Punto 4 v6.2: Avanzamento giornaliero della Campagna Referendaria di 30 giorni
        if (game.activeReferendum && !game.isDictatorship) {
          game.activeReferendum.daysLeft--;
          const drift = (Math.random() - 0.49) * 0.6;
          game.activeReferendum.yesPct = Math.max(12, Math.min(88, +(game.activeReferendum.yesPct + drift).toFixed(1)));
          if (game.activeReferendum.daysLeft <= 0) {
            finishedRef = game.activeReferendum;
            game.activeReferendum = null;
            const rr = document.getElementById('refRibbon');
            if (rr) rr.style.display = 'none';
            break;
          }
        }

        // Decadimento lento dei rancori storici
        Object.keys(game.betrayalMemory).forEach(a => {
          Object.keys(game.betrayalMemory[a]).forEach(b => {
            if (game.betrayalMemory[a][b].days > 0) game.betrayalMemory[a][b].days--;
          });
        });

        if (game.date.getFullYear() > prevYear) {
          annualAgingAndSuccession();
        }

        // PUNTO 9 (1.7.1): SIMULAZIONE GIORNALIERA COMPLETA (Fondi, Capitale Politico ⚡, Sondaggi Nazionali e Regionali, Macroeconomia e Dinamiche IA ogni giorno!)
        weeklyCommStep();
        if (!game.isDictatorship) {
          weeklyAIDynamicsAndCoalitionEvolution();
          // Quando il giocatore non è al Governo, l'Esecutivo IA governa attivamente (probabilità giornaliera calibrata)
          if (!getP().inGov && Math.random() < 0.08) {
            weeklyAIGovernmentAction();
          }
        } else {
          weeklyDictatorshipStep();
        }
        weeklyMacroStep();
        if (game.turn % 7 === 0) {
          checkPartyExtinction();
        }

        // Gestione campagna elettorale (se non siamo in dittatura)
        if (!game.isDictatorship) {
          if (game.campaignActive) {
            game.campaignDaysRemaining--;
            if (game.campaignDaysRemaining <= 0) {
              game.campaignActive = false;
              document.getElementById('campRibbon').style.display = 'none';
              updateAllUI();
              triggerElections("Urne chiuse dopo i 45 giorni di campagna elettorale!");
              return;
            }
          } else {
            const daysLeft = Math.ceil((game.nextElectionDate - game.date) / (1000 * 3600 * 24));
            if (daysLeft <= 45) {
              startElectoralCampaign("Scadenza naturale della Legislatura a 45 giorni.");
            } else if (game.govStability <= 0) {
              // PUNTO 10 (1.8.2): Modal evidente e drammatico quando il governo cade!
              triggerDramaticGovFallModal("La stabilità della maggioranza parlamentare è crollata a zero (crisi politica irreversibile tra le forze di governo).");
            }
          }
        }

        // Segna se è maturato un evento casuale durante il salto temporale (solo se non sei in carcere)
        if (game.turn % 14 === 0 && !game.isImprisoned && !game.isRetired) {
          pendingWorldEvent = true;
        }
      }

      enforceSingleOfficeRule();
      updateAllUI();

      // A fine avanzamento (dopo aver completato tutti i giorni richiesti: +1, +7 o +30), verifica eventuali modal pendenti
      if (!document.getElementById('modalBg').classList.contains('open')) {
        const dueRegElection = !game.isDictatorship && !game.isImprisoned ? checkScheduledRegionalElections() : null;
        if (finishedRef) {
          resolveActiveReferendumModal(finishedRef);
        } else if (justFreedFromPrison) {
          openModal(
            "🔓 Scarcerazione da Rebibbia — Ritorno in Libertà",
            `<div style="font-size:13px; color:var(--text);">
              Hai terminato di scontare la tua condanna nel Carcere di Rebibbia.<br><br>
              I cancelli si aprono: torni alla vita pubblica come <strong>Libero Cittadino / Indipendente</strong> (poiché il tuo precedente partito eversivo era stato sciolto e messo fuori legge). Puoi ora ricostruire il tuo prestigio, iscriverti a un partito o fondare un nuovo movimento politico!
            </div>`,
            [{ label: "Torna nell'Arena Politica", fn: () => { closeModal(); updateAllUI(); } }]
          );
        } else if (!game.isDictatorship && !game.isImprisoned && game.date >= game.president.endDate) {
          if (game.stateForm === 'presidenziale') openDirectPresidentialElectionModal();
          else openQuirinaleBallotModal(1);
        } else if (dueRegElection) {
          openRegionalElectionModal(dueRegElection, false);
        } else if (pendingWorldEvent && !game.isImprisoned && !game.isRetired) {
          triggerWorldEvent();
        }
      }
    }

    /* PUNTO 4 (v6.2): SCRUTINIO FINALE DEL REFERENDUM POPOLARE DOPO I 30 GIORNI DI CAMPAGNA + COOLDOWN DI 1 ANNO (365 GIORNI) */
export function resolveActiveReferendumModal(ref) {
      const p = getP();
      const finalYes = Math.max(8, Math.min(92, Math.round(ref.yesPct + (Math.random() * 8 - 4))));
      const finalNo = 100 - finalYes;
      const won = finalYes >= 50;
      // Registra il blocco di 365 giorni (1 anno) sul tema referendario per impedire referendum opposti nello stesso giorno/mese!
      game.referendumCooldowns[ref.cooldownKey] = game.turn + 365;

      if (ref.kind === 'law') {
        const law = HOT_LAWS.find(x => x.id === ref.lawId);
        if (won && law) {
          game.lawStates[law.id] = ref.targetIdx;
          game.lawCooldowns[law.id] = game.turn + 365;
          const opt = law.options.find(o => o.idx === ref.targetIdx) || law.options[0];
          if (opt && opt.eff) opt.eff(game);
          if (opt && opt.targetStance !== undefined && p.id !== 'ind') {
            p.stances[law.dossier] = opt.targetStance;
          }
          game.leader.prestige = Math.min(100, game.leader.prestige + 8);
          if (p.id !== 'ind') {
            p.credibility = Math.min(100, p.credibility + 7);
            BLOCS.forEach(b => {
              const dist = Math.abs((opt?.targetStance ?? 2) - (b.ideal[law.dossier] ?? 2));
              if (dist <= 1) shiftBloc(p.id, b.id, 6);
              else if (dist >= 3) shiftBloc(p.id, b.id, -3);
            });
          }
          recalcPolls(true);
          addFeed(`🗳️ <strong>TRIONFO AL REFERENDUM POPOLARE SU "${law.title.toUpperCase()}"!</strong> Dopo 30 giorni di campagna vince il <strong>SÌ col ${finalYes}%</strong> (NO: ${finalNo}%)! Entra in vigore: <em>${opt?.status || ref.targetLabel}</em> (Tema bloccato per 1 anno).`, 'ok');
          setTicker(`REFERENDUM "${law.title.toUpperCase()}": Vince il SÌ col ${finalYes}%! Cambia la legge in Italia.`);
        } else if (law) {
          game.leader.prestige = Math.max(10, game.leader.prestige - 5);
          // PUNTO 20 (1.8): Se il quesito era sostenuto dal Governo in carica e perde, l'Esecutivo subisce un forte contraccolpo!
          if (ref.sponsoredByGov) {
            game.govStability = Math.max(0, game.govStability - 18);
            game.spread += 9;
            game.parties.filter(x => x.inGov).forEach(x => {
              x.credibility = Math.max(15, x.credibility - 6);
              x.poll = Math.max(0.5, +(x.poll - 0.5).toFixed(1));
            });
            addFeed(`💥 <strong>TERREMOTO POLITICO AL REFERENDUM:</strong> Il quesito sostenuto dal Governo è stato bocciato dai cittadini! Crolla la tenuta dell'Esecutivo (-18% Stabilità, +9 pt Spread)!`, 'cr');
          } else {
            addFeed(`❌ <strong>REFERENDUM BOCCIATO DALLE URNE SU "${law.title.toUpperCase()}":</strong> Dopo 30 giorni di campagna il SÌ si ferma al <strong>${finalYes}%</strong> (NO: ${finalNo}%). Resta in vigore la normativa attuale (Nuovo quesito vietato per 1 anno).`, 'cr');
          }
        }
      } else if (ref.kind === 'treaty') {
        if (won) {
          if (ref.treatyType === 'eu') {
            game.inEU = false;
            game.spread = Math.min(520, game.spread + 65);
            game.foreignRels.eu_com = Math.max(5, game.foreignRels.eu_com - 45);
            if (p.id !== 'ind') shiftBloc(p.id, 'autonomi', 8);
            addFeed(`🚨 <strong>VITTORIA STORICA AL REFERENDUM ITALEXIT (SÌ ${finalYes}% - NO ${finalNo}%)!</strong> I cittadini italiani votano l'uscita dall'Unione Europea!`, 'cr');
            setTicker(`SHOCK IN EUROPA: Vince il SÌ al Referendum Italexit (${finalYes}%)! L'Italia lascia l'UE.`);
          } else if (ref.treatyType === 'nato') {
            game.inNATO = false;
            game.foreignRels.usa = Math.max(5, game.foreignRels.usa - 45);
            game.foreignRels.russia = Math.min(100, game.foreignRels.russia + 20);
            addFeed(`🚨 <strong>VITTORIA AL REFERENDUM SULLA NEUTRALITÀ (SÌ ${finalYes}% - NO ${finalNo}%)!</strong> L'Italia esce ufficialmente dalla NATO!`, 'cr');
            setTicker(`SVOLTA GEOPOLITICA: Vince il SÌ (${finalYes}%), l'Italia esce dalla NATO!`);
          }
        } else {
          game.leader.prestige = Math.max(15, game.leader.prestige - 6);
          addFeed(`❌ <strong>BOCCIATO IL REFERENDUM ${ref.treatyType.toUpperCase()} (SÌ ${finalYes}% - NO ${finalNo}%):</strong> Gli italiani confermano la permanenza nei trattati internazionali.`, 'cr');
        }
      }

      document.getElementById('mTag').textContent = "RISULTATO UFFICIALE DEL REFERENDUM POPOLARE (CORTE DI CASSAZIONE)";
      document.getElementById('mTitle').textContent = `${won ? '✅ VITTORIA DEL SÌ' : '❌ VITTORIA DEL NO'} — ${ref.title}`;
      document.getElementById('mBody').innerHTML = `
        Si sono chiuse le urne dopo i <strong>30 giorni di Campagna Referendaria</strong> su: <strong>${ref.targetLabel}</strong>.<br><br>
        ${ref.yesExplanation ? `
        <div style="background:var(--bg-2); border:1px solid var(--border); border-radius:8px; padding:10px; margin:10px 0; font-size:12px;">
          <div><strong style="color:#34d399;">Votare SÌ comportava:</strong> ${ref.yesExplanation}</div>
          <div style="margin-top:4px;"><strong style="color:#f87171;">Votare NO comportava:</strong> ${ref.noExplanation}</div>
        </div>` : ''}
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; text-align:center; margin:10px 0;">
          <div class="box" style="border-color:${won?'#10b981':'var(--border)'};">
            <div style="font-size:11px; color:var(--muted);">VOTI FAVOREVOLI (SÌ)</div>
            <div style="font-size:24px; font-weight:900; color:#34d399;">${finalYes}%</div>
          </div>
          <div class="box" style="border-color:${!won?'#ef4444':'var(--border)'};">
            <div style="font-size:11px; color:var(--muted);">VOTI CONTRARI (NO)</div>
            <div style="font-size:24px; font-weight:900; color:#f87171;">${finalNo}%</div>
          </div>
        </div>
        <p style="font-size:12px; color:var(--muted);">🔒 Per legge costituzionale, questo stesso tema non potrà essere oggetto di un nuovo referendum prima di <strong>365 giorni (1 anno)</strong>.</p>
      `;
      document.getElementById('mChoices').innerHTML = `<button class="m-btn" onclick="closeModal();updateAllUI();"><strong>Prendi atto del verdetto delle urne</strong></button>`;
      openModal();
      updateAllUI();
    }

export function generateNewPolitician(partyId) {
      let fullName = '';
      let attempts = 0;
      let fn = 'Marco', ln = 'Rossi';
      do {
        fn = NEW_FIRST_NAMES[Math.floor(Math.random() * NEW_FIRST_NAMES.length)];
        ln = NEW_LAST_NAMES[Math.floor(Math.random() * NEW_LAST_NAMES.length)];
        fullName = `${fn} ${ln}`;
        attempts++;
      } while (POLITICIANS.some(x => x.name.toLowerCase() === fullName.toLowerCase()) && attempts < 250);
      if (POLITICIANS.some(x => x.name.toLowerCase() === fullName.toLowerCase())) {
        fullName = `${fn} ${ln} ${['Jr.', 'II', 'Berti', 'Neri', 'Galli'][game.turn % 5]}`;
      }
      const minObj = MINISTRIES[Math.floor(Math.random() * MINISTRIES.length)];
      const pObj = game.parties.find(x => x.id === partyId);
      const pScore = pObj ? getPartyIdeoScore(pObj) : 2.0;
      const compVal = 74 + Math.floor(Math.random() * 18);
      const cloutVal = 68 + Math.floor(Math.random() * 20);
      const newPol = {
        id:'gen_' + game.turn + '_' + Math.floor(Math.random()*9999),
        name:fullName,
        age:34 + Math.floor(Math.random() * 16),
        gender:['Giulia','Chiara','Elena','Francesca','Sara','Martina','Valentina','Federica','Alessia','Beatrice','Silvia','Laura','Roberta','Anna','Claudia','Monica','Paola','Serena','Ilaria','Camilla','Veronica','Arianna','Irene','Marta','Elisa','Caterina','Lucia','Giorgia','Sofia','Alice'].includes(fn) ? 'F' : 'M',
        region:FALLBACK_REGIONS[Math.floor(Math.random() * FALLBACK_REGIONS.length)]?.id || 'Lazio',
        partyId:partyId || 'tech',
        role:pObj ? `Parlamentare / Dirigente (${pObj.short})` : 'Esperto Tecnico',
        pref:minObj.id,
        comp:compVal,
        competence:compVal,
        skill:compVal,
        clout:cloutVal,
        prestige:cloutVal,
        loyalty:82,
        ideo:[+((pScore - 2.0) * 0.85).toFixed(2), +((pScore - 2.0) * 0.80).toFixed(2)],
        compass:{ economic:+((pScore - 2.0) * 0.85).toFixed(2), social:+((pScore - 2.0) * 0.80).toFixed(2), ideoScore:+pScore.toFixed(2) },
        bio:`Dirigente politico emergente di ${pObj ? pObj.name : 'area istituzionale'}.`,
        history:[`${fmtDate(game.date)}: Eletto nei quadri dirigenti di ${pObj ? pObj.name : 'Area Tecnica'}`]
      };
      POLITICIANS.push(newPol);
      return newPol;
    }

export function annualAgingAndSuccession() {
      const curYear = game.date.getFullYear();
      game.leader.age++;
      game.president.age = (game.president.age || 85) + 1;

      // PUNTO 12 (1.8.1): Il Presidente della Repubblica resta in carica per l'intero settennato naturale (Art. 85 Cost.)
      // Rimosso il check annuale arbitrario a 84 anni che provocava due elezioni consecutive premature al Quirinale!

      game.parties.forEach(p => {
        p.leaderAge = (p.leaderAge || 52) + 1;
        if (p.wingLeader) p.wingAge = (p.wingAge || 48) + 1;

        if (p.leader !== game.leader.name && p.leaderAge >= 77 && Math.random() < (p.leaderAge - 74) * 0.065) {
          const oldLead = p.leader;
          const oldAge = p.leaderAge;
          const rising = generateNewPolitician(p.id);
          p.leader = p.wingLeader || rising.name;
          p.leaderAge = p.wingAge || rising.age;
          p.wingLeader = rising.name;
          p.wingAge = rising.age;
          syncPartyNameWithLeader(p, p.leader);
          recordPoliticianHistory(p.leader, `Succede a ${oldLead} come Segretario Nazionale di ${p.short}`, `Segretario Nazionale ${p.short}`);
          if (game.currentPM === oldLead) {
            game.currentPM = p.leader;
            recordPoliticianHistory(p.leader, `Subentra come Presidente del Consiglio dei Ministri`, `Presidente del Consiglio`);
          }
          addFeed(`🖤 <strong>LUTTO NELLA POLITICA ITALIANA:</strong> Si è spento a ${oldAge} anni <strong>${oldLead}</strong>, leader di ${p.name}. La guida passa a <strong>${p.leader}</strong>.`, 'cr');
          // Se era un partito personale piccolo che dipendeva da quel leader, rischia il crollo!
          if (p.personalParty && p.poll < 3.5) {
            p.poll = +(p.poll * 0.45).toFixed(1);
            p.cohesion = 40;
          }
        }

        if (!game.isDictatorship && curYear >= (p.nextCongYear || 2028)) {
          p.nextCongYear = curYear + 3;
          if (p.id === game.playerPartyId && game.partyRole !== 'independent' && !document.getElementById('modalBg').classList.contains('open')) {
            setTimeout(() => openPartyCongressModal(p, "Scadenza naturale del mandato di Segreteria"), 50);
          } else if (p.id !== game.playerPartyId && p.leaderTrust < 52 && p.wingLeader) {
            const oldL = p.leader;
            p.leader = p.wingLeader;
            p.wingLeader = oldL;
            p.leaderTrust = 78;
            syncPartyNameWithLeader(p, p.leader);
            recordPoliticianHistory(p.leader, `Eletto Segretario Nazionale al Congresso di ${p.short} (battuto ${oldL})`, `Segretario Nazionale ${p.short}`);
            recordPoliticianHistory(oldL, `Sconfitto al Congresso di ${p.short}, guida la minoranza interna`, `Capocorrente ${p.short}`);
            addFeed(`🏛️ <strong>RIBALTONE AL CONGRESSO DI ${p.short}:</strong> I delegati eleggono nuovo Segretario <strong>${p.leader}</strong>, che batte l'uscente ${oldL}!`, 'ai');
          }
        }
      });

      POLITICIANS.forEach((pol, idx) => {
        pol.age = (pol.age || 55) + 1;
        // PUNTO 33 (1.8): Il giocatore non viene mai sostituito automaticamente!
        if (pol.isPlayer || pol.name === game.leader.name) return;
        if (pol.age >= 79 && Math.random() < (pol.age - 76) * 0.07) {
          const replacement = generateNewPolitician(pol.partyId);
          addFeed(`🌱 <strong>Ricambio Generazionale:</strong> Si ritira per motivi d'età <strong>${pol.name} (${pol.age}a)</strong>; emerge <strong>${replacement.name} (${replacement.age}a)</strong>.`);
          MINISTRIES.forEach(m => { if (game.cabinet[m.id]?.id === pol.id) game.cabinet[m.id] = replacement; });
          POLITICIANS[idx] = replacement;
        }
      });
    }

export function openPartyCongressModal(party, reason) {
      const isSec = (game.partyRole === 'secretary');
      const opponentName = isSec ? (party.wingLeader || "Sfidante Riformista") : party.leader;
      game.lastCongressTurn = game.turn;

      // PUNTI 2 & 15 (1.8): I leader storici e radicati godono del peso blindato dell'apparato di partito
      const isEntrenched = ['Matteo Salvini', 'Giorgia Meloni', 'Giuseppe Conte', 'Elly Schlein', 'Antonio Tajani', 'Carlo Calenda', 'Matteo Renzi'].includes(party.leader) || ((party.leaderTrust || 75) >= 70);
      const apparatusDefense = isEntrenched ? 32 : 16;

      document.getElementById('mTag').textContent = `CONGRESSO NAZIONALE DI ${party.name.toUpperCase()}`;
      document.getElementById('mTitle').textContent = `Elezione del Segretario Nazionale: ${game.leader.name} vs ${opponentName}`;
      document.getElementById('mBody').innerHTML = `
        <strong>${reason}</strong><br><br>
        I delegati regionali e gli iscritti di <strong>${party.name}</strong> sono riuniti al Congresso Nazionale per votare la mozione congressuale.<br>
        • <strong>Tuo Radicamento Interno (Forza Corrente):</strong> <span style="color:#34d399; font-weight:800;">${game.leader.internalSupport}%</span> (Prestigio: ${game.leader.prestige}%)<br>
        • <strong>Fiducia nella Segreteria (${party.leader}):</strong> <strong>${party.leaderTrust || 75}%</strong> ${isEntrenched ? '<span style="color:#f59e0b; font-size:11px;">[Leader Storico: apparato blindato]</span>' : ''}<br><br>
        Quale strategia congressuale adotti all'Assemblea dei Delegati?
      `;

      const box = document.getElementById('mChoices');
      box.innerHTML = '';

      const opts = [
        { l:`Mozione di Rilancio Identitario e Battaglia Politica (25 ⚡)`, d:`Mobilitazione dei circoli e dei militanti (+14% forza congressuale)`, bonus:14, costAP:25, costMoney:0 },
        { l:`Patto Federativo coi Grandi Elettori e Governatori (€ 50k)`, d:`Accordo tra correnti e cacicchi regionali (+18% voti delegati)`, bonus:18, costAP:0, costMoney:50 },
        { l:`Discorso di Unità del Partito (0 ⚡, € 0k)`, d:`Ti affidi al tuo attuale consenso interno (${game.leader.internalSupport}%)`, bonus:2, costAP:0, costMoney:0 }
      ];

      opts.forEach(o => {
        const btn = document.createElement('button');
        btn.className = 'm-btn';
        btn.innerHTML = `<strong>🗳️ ${o.l}</strong><span>${o.d}</span>`;
        btn.onclick = () => {
          if (game.ap < o.costAP || game.funds < o.costMoney) { alert("Risorse insufficienti per questa mozione!"); return; }
          game.ap -= o.costAP; game.funds -= o.costMoney;
          
          let myVoteShare;
          if (isSec) {
            const defensePower = (party.leaderTrust || 75) * 0.50 + game.leader.internalSupport * 0.40 + o.bonus;
            const challengerPower = (100 - (party.leaderTrust || 75)) * 0.50 + 20;
            myVoteShare = Math.min(95, Math.max(10, Math.round((defensePower / (defensePower + challengerPower)) * 100) + Math.floor(Math.random()*6 - 3)));
          } else {
            // Punti 2 & 15: Per spodestare leader radicati serve un'alta forza corrente e fiducia calata
            const incumbentPower = (party.leaderTrust || 75) * 0.60 + (party.factions?.[0]?.share || 60) * 0.35 + apparatusDefense;
            const challengerPower = game.leader.internalSupport * 0.65 + game.leader.prestige * 0.25 + o.bonus;
            myVoteShare = Math.min(92, Math.max(8, Math.round((challengerPower / (incumbentPower + challengerPower)) * 100) + Math.floor(Math.random()*6 - 3)));
          }

          if (myVoteShare >= 51) {
            if (!isSec) {
              party.wingLeader = party.leader;
              party.wingAge = party.leaderAge;
              party.leader = game.leader.name;
              party.leaderAge = game.leader.age;
              game.partyRole = 'secretary';
              recordPoliticianHistory(party.wingLeader, `Sconfitto al Congresso Nazionale di ${party.short}, guida la minoranza interna`, `Capocorrente ${party.short}`);
            }
            party.leaderTrust = 85;
            party.cohesion = Math.min(100, (party.cohesion || 75) + 10);
            game.leader.internalSupport = Math.min(95, myVoteShare);
            syncPartyNameWithLeader(party, game.leader.name);
            recordPoliticianHistory(game.leader.name, `Eletto Segretario Nazionale al Congresso di ${party.short} col ${myVoteShare}%`, `Segretario Nazionale ${party.short}`);
            addFeed(`👑 <strong>TRIONFO AL CONGRESSO DI ${party.short}:</strong> <strong>${game.leader.name}</strong> vince con il <strong>${myVoteShare}%</strong> dei delegati contro ${opponentName} ed è eletto <strong>Segretario Nazionale</strong>!`, 'ok');
            setTicker(`CONGRESSO ${party.short}: ${game.leader.name} eletto Segretario Nazionale col ${myVoteShare}%!`);
          } else {
            if (isSec) {
              party.leader = opponentName;
              party.wingLeader = game.leader.name;
              game.partyRole = 'member';
              syncPartyNameWithLeader(party, opponentName);
              recordPoliticianHistory(opponentName, `Eletto Segretario Nazionale al Congresso di ${party.short} col ${100 - myVoteShare}%`, `Segretario Nazionale ${party.short}`);
              recordPoliticianHistory(game.leader.name, `Sconfitto al Congresso di ${party.short}, guida la minoranza interna`, `Capocorrente ${party.short}`);
            }
            party.leaderTrust = Math.min(95, (party.leaderTrust || 75) + 5);
            game.leader.internalSupport = myVoteShare;
            addFeed(`⚠️ <strong>ESITO CONGRESSO ${party.short}:</strong> La mozione di ${opponentName} prevale col ${100 - myVoteShare}% (tu ottieni il ${myVoteShare}%). L'apparato del partito ha blindato la segreteria uscente!`, 'cr');
          }
          closeModal(); updateAllUI();
        };
        box.appendChild(btn);
      });
      openModal();
    }

export function startElectoralCampaign(reason) {
      if (game.campaignActive || game.isDictatorship) return;
      game.campaignActive = true;
      game.campaignDaysRemaining = 45;
      document.getElementById('campRibbon').style.display = 'block';
      addFeed(`🗳️ <strong>CAMERE SCIOLTE!</strong> ${reason} Parte la <strong>Campagna Elettorale di 45 giorni</strong>!`, 'cr');
      setTicker(`QUIRINALE: ${game.president.name} scioglie le Camere. Urne aperte tra 45 giorni!`);
      updateAllUI();
    }

export function weeklyCommStep() {
      const p = getP();
      const s = game.commStrategy;
      // PUNTO 9 (1.7.1): Aggiornamento GIORNALIERO calibrato a 1/7 del passo settimanale
      const dailyInc = (game.partyRole === 'independent' || game.president.isPlayer) ? 2 : Math.max(2, Math.round((14 + p.poll * 1.4) / 7));
      const dailySpend = (game.partyRole === 'independent' || game.president.isPlayer) ? 0 : Math.round((s.weeklyBudget || 0) / 7);
      game.funds = Math.max(0, Math.round(game.funds + dailyInc - dailySpend));
      game.ap = Math.min(100, game.ap + 3); // +3 ⚡ al giorno (+21 ⚡ a settimana)
      if (game.partyRole !== 'independent' && !game.president.isPlayer && game.funds > 0 && s.weeklyBudget > 0) {
        const pwr = (s.weeklyBudget / 35) * (p.credibility / 80);
        game.issueSalience[s.focusIssue] = Math.min(45, +((game.issueSalience[s.focusIssue] || 18) + (1.2 / 7)).toFixed(2));
        [s.targetBloc1, s.targetBloc2].forEach(bId => {
          const bloc = BLOCS.find(x => x.id === bId);
          if (bloc && computeBlocMatch(p, bloc) >= 48) shiftBloc(p.id, bId, (1.3 / 7) * pwr);
        });
      }
      // Oscillazione fisiologica giornaliera dei consensi nei bacini elettorali
      if (!game.isDictatorship && game.parties.length > 0) {
        const randParty = game.parties[game.turn % game.parties.length];
        const randBloc = BLOCS[(game.turn * 3) % BLOCS.length];
        if (randParty && randBloc && game.blocSympathy[randParty.id]) {
          const match = computeBlocMatch(randParty, randBloc);
          const microDelta = ((match - 60) * 0.0018) + ((Math.random() - 0.5) * 0.012);
          game.blocSympathy[randParty.id][randBloc.id] = Math.max(0.5, (game.blocSympathy[randParty.id][randBloc.id] || 15) * (1 + microDelta));
        }
      }
      recalcPolls(true);
    }

    /* PUNTO 17: DINAMICA GIORNALIERA DELLA DITTATURA (CONSENSO POPOLARE VS RISCHIO RIVOLTA) */
export function weeklyDictatorshipStep() {
      const p = getP();
      const popSupport = p.poll;
      let deltaRevolt = 0;

      // PUNTO 13 (1.8): Messa al bando dei partiti alimenta la resistenza clandestina e impedisce che il rischio rivolta resti bloccato al 2%!
      const outlawedCount = game.outlawedParties ? game.outlawedParties.length : 0;
      if (outlawedCount > 0) {
        deltaRevolt += (outlawedCount * 0.28) / 7;
        if (popSupport < 25) deltaRevolt += (3 / 7);
      } else {
        if (popSupport < 15) deltaRevolt += (6 / 7);
        else if (popSupport < 24) deltaRevolt += (3 / 7);
        else if (popSupport >= 34) deltaRevolt -= (2 / 7);
      }

      if (game.gdp < 0) deltaRevolt += (2 / 7);
      if (game.spread > 260) deltaRevolt += (2 / 7);
      if (game.militaryLoyalty >= 75) deltaRevolt -= (1 / 7);

      game.revoltRisk = Math.max(2, Math.min(100, +(game.revoltRisk + deltaRevolt).toFixed(1)));
      game.govStability = Math.max(5, 100 - Math.round(game.revoltRisk * 0.8));

      if (game.revoltRisk >= 75 && game.revoltRisk < 100 && game.turn % 7 === 0) {
        addFeed(`🔥 <strong>ALLARME RIVOLTA CONTRO IL REGIME (${Math.round(game.revoltRisk)}%):</strong> Scioperi generali clandestini e manifestazioni nelle piazze minacciano la tua Dittatura (Consenso popolare: ${popSupport.toFixed(1)}%)!`, 'cr');
      }
      if (game.revoltRisk >= 100) {
        triggerRegimeOverthrow();
      }
    }

export function triggerRegimeOverthrow() {
      game.isDictatorship = false;
      game.dictatorshipName = null;
      game.stateForm = 'parlamentare';
      game.outlawedParties = [];
      document.body.classList.remove('theme-regime');
      const regRibbon = document.getElementById('regimeRibbon');
      if (regRibbon) regRibbon.style.display = 'none';

      // Ripristina tutti i partiti democratici e costituzionali sciolti dalla dittatura
      INITIAL_PARTIES.forEach(ip => {
        if (!game.parties.some(p => p.id === ip.id)) {
          game.parties.push(JSON.parse(JSON.stringify(ip)));
        }
      });

      addFeed(`🗽 <strong>INSURREZIONE POPOLARE E CADUTA DELLA DITTATURA!</strong> Il popolo italiano e i reparti dell'Esercito rovesciano il regime di <strong>${game.leader.name}</strong> e restaurano la Repubblica Democratica Costituzionale! Tutti i partiti democratici tornano alla legalità.`, 'cr');
      setTicker(`LIBERAZIONE A ROMA: Crolla la Dittatura! Restaurata la Costituzione.`);
      openFailedCoupTrialModal("Rovesciamento della Dittatura da parte dell'insurrezione popolare e delle Forze Armate");
    }

export function weeklyAIDynamicsAndCoalitionEvolution() {
      // PUNTO 9 (1.7.1): Eseguito giornalmente con probabilità calibrate a 1/7 della frequenza settimanale
      if (Math.random() > 0.16) return;
      const aiList = game.parties.filter(p => p.id !== game.playerPartyId);
      const actor = aiList[Math.floor(Math.random() * aiList.length)];
      if (!actor) return;

      // 1. Uscita o rottura della coalizione per divergenza o insoddisfazione
      if (actor.coalId !== 'none') {
        const cLead = getCoalLeaderParty(actor.coalId);
        if (cLead && cLead.id !== actor.id) {
          if (Math.random() < 0.35) adjPairRel(actor.id, cLead.id, -2);
          const comp = computeCompat(actor, cLead);
          if (comp.score < 50 || getPairRel(actor.id, cLead.id) < 45 || (actor.inGov && (game.allySatisfaction[actor.id] || 75) < 42)) {
            const oldCoalName = getCoalName(actor.coalId);
            actor.coalId = 'none';
            setBetrayal(actor.id, cLead.id, 1095, `Rottura politica ed uscita di ${actor.short} da ${oldCoalName}`);
            if (actor.inGov) {
              actor.inGov = false;
              game.govStability = Math.max(0, game.govStability - 22);
            }
            addFeed(`💥 <strong>TERREMOTO NELLE COALIZIONI:</strong> <strong>${actor.leader} (${actor.short})</strong> rompe con ${cLead.leader} (${cLead.short}) ed esce da <strong>${oldCoalName}</strong>!`, 'cr');
            return;
          }
        }
      } else {
        const targetCoalIds = Array.from(new Set(game.parties.map(p=>p.coalId))).filter(c => c !== 'none');
        for (const cid of targetCoalIds) {
          const cLead = getCoalLeaderParty(cid);
          // PUNTO 12 (1.8.2): Compatibilità ideologica minima: partiti storicamente opposti non entrano a caso
          if (cLead) {
            const ideoDist = Math.abs(getPartyIdeoScore(actor) - getPartyIdeoScore(cLead));
            if (ideoDist > 1.25) continue;
          }
          const vote = checkCoalitionAdmissionVote(cid, actor);
          if (vote.approved && Math.random() < 0.30) {
            // Se il giocatore guida la coalizione, non si entra senza il suo consenso esplicito via modal!
            if (cLead && cLead.id === game.playerPartyId) {
              openCoalitionAdmissionRequestModal(actor, cid);
              break;
            } else {
              actor.coalId = cid;
              addFeed(`🤝 <strong>RICONFIGURAZIONE ALLEANZE:</strong> Con il voto favorevole dei membri (${vote.pct}%), <strong>${actor.name}</strong> entra in <strong>${getCoalName(cid)}</strong>!`, 'ai');
              break;
            }
          }
        }
      }

      // 2. Punto 3: Turnover e Congressi dei partiti controllati dall'IA
      if (Math.random() < 0.12 && (actor.cohesion < 55 || actor.poll < 4.0 || (game.turn % 24 === 0))) {
        const partyPols = getPoliticiansForParty(actor.id).filter(pol => pol.name !== actor.leader && !pol.isPlayer);
        if (partyPols.length > 0) {
          const challenger = [...partyPols].sort((a,b) => (b.clout + b.comp) - (a.clout + a.comp))[0];
          if (challenger && challenger.clout >= (actor.leaderTrust || 60) - 10) {
            const oldSec = actor.leader;
            actor.leader = challenger.name;
            actor.leaderAge = challenger.age;
            actor.wingLeader = oldSec;
            actor.leaderTrust = Math.min(95, challenger.clout + 5);
            actor.cohesion = Math.min(92, (actor.cohesion || 65) + 18);
            syncPartyNameWithLeader(actor, challenger.name);
            recordPoliticianHistory(challenger.name, `Eletto Segretario Nazionale al Congresso di ${actor.short} (succede a ${oldSec})`, `Segretario Nazionale ${actor.short}`);
            recordPoliticianHistory(oldSec, `Lascia la Segreteria Nazionale di ${actor.short} al Congresso`, `Ex Segretario / Capocorrente ${actor.short}`);

            if (challenger.compass) {
              const targetScore = challenger.compass.ideoScore ?? getPartyIdeoScore(actor);
              DOSSIERS.forEach(d => {
                if (Math.random() < 0.25) {
                  const cur = actor.stances[d.key] ?? 2;
                  actor.stances[d.key] = targetScore > 2.2 ? Math.min(4, cur + 1) : (targetScore < 1.8 ? Math.max(0, cur - 1) : cur);
                }
              });
              actor.area = getIdeoLabel(getPartyIdeoScore(actor)).replace(/^[^\s]+\s/, '');
            }

            addFeed(`🏛️ <strong>CONGRESSO NAZIONALE ${actor.short.toUpperCase()}:</strong> Cambio alla segreteria! <strong>${challenger.name}</strong> (${challenger.age}a) vince le primarie contro la linea di ${oldSec} e diventa il nuovo Segretario Nazionale di <strong>${actor.name}</strong>!`, 'ai');
            setTicker(`CONGRESSO ${actor.short}: ${challenger.name} eletto nuovo Segretario!`);
            return;
          }
        }
      }

      const r = Math.random();
      if (r < 0.40) {
        const hotKey = Object.keys(game.issueSalience).sort((a,b) => game.issueSalience[b] - game.issueSalience[a])[0];
        const baseVal = actor.baseStances?.[hotKey] ?? 2;
        const cur = actor.stances[hotKey] ?? 2;
        // L'IA oscilla vicino alla propria identità storica senza snaturarsi
        const nextVal = cur === baseVal ? (Math.random() > 0.5 ? Math.min(4, cur+1) : Math.max(0, cur-1)) : baseVal;
        actor.stances[hotKey] = nextVal;
      } else if (actor.poll >= 7.0 && actor.wingLeader && (actor.cohesion || 75) <= 28 && Math.random() < 0.18 && game.parties.length < 26) {
        // PUNTO 28 (1.8): Frequenza delle scissioni IA notevolmente ridotta e selettiva
        executePartySplit(actor, false);
      }

      // PUNTI 5, 7, 8, 9, 10 (1.8.1): Transfughismo universale e realistico (frequenza moderata: ~ogni 35 turni, affinità ideologica <= 0.8, no estremi opposti)
      if (game.turn % 35 === 0 && Math.random() < 0.45 && !document.getElementById('modalBg').classList.contains('open') && !game.isRetired) {
        triggerAiPoliticianDefection();
      }

      recalcDynamicVetoes();
      recalcPolls(true);
    }

export function executePartySplit(parentParty, isPlayerSplitting, customStances = null, customName = null, customShort = null, customLogoCfg = null) {
      const wasPM = (isPlayerSplitting && game.currentPM === game.leader.name);
      const splitId = 'split_' + parentParty.id + '_' + game.turn;
      const splitShare = 0.28;
      const movedSeats = Math.max(1, Math.round(parentParty.seats * splitShare));
      parentParty.seats = Math.max(0, parentParty.seats - movedSeats);
      parentParty.cohesion = 85;

      const usedColors = new Set(game.parties.map(p => p.color));
      const uniqueColor = DISTINCT_PALETTE.find(c => !usedColors.has(c)) || DISTINCT_PALETTE[game.paletteIdx++ % DISTINCT_PALETTE.length];
      const uniqueEmblem = (game.parties.length % 6) + 1;

      const newStances = customStances ? { ...customStances } : { ...parentParty.stances };
      if (!customStances) {
        const shiftDir = parentParty.wingArea?.includes('Centro') && parentParty.area === 'Destra' ? -1 : 1;
        ['eu','rights','tax','inst'].forEach(k => { newStances[k] = Math.max(0, Math.min(4, (newStances[k] ?? 2) + shiftDir)); });
      }

      const newLeaderName = isPlayerSplitting ? game.leader.name : (parentParty.wingLeader || generateNewPolitician(splitId).name);
      const newLeaderAge = isPlayerSplitting ? game.leader.age : (parentParty.wingAge || 46);
      const risingWing = generateNewPolitician(splitId);

      // Selezione procedurale autentica da SPLIT_POOLS per famiglia ideologica
      let fam = 'destra';
      if (parentParty.id === 'm5s') fam = 'm5s';
      else if (['svp','scn','liga'].includes(parentParty.id)) fam = 'autonomisti';
      else {
        const score = getPartyIdeoScore(parentParty);
        if (score < 1.15) fam = 'sinistra';
        else if (score < 1.75) fam = 'centrosinistra';
        else if (score < 2.35) fam = 'centro';
        else if (score < 2.95) fam = 'centrodestra';
        else fam = 'destra';
      }
      const pool = (typeof SPLIT_POOLS !== 'undefined' && SPLIT_POOLS[fam]) ? SPLIT_POOLS[fam] : [];
      const unusedEntry = pool.find(item => !game.parties.some(p => p.short === item.short || p.name === item.name)) || pool[0];

      const splitChosenName = customName || (unusedEntry ? unusedEntry.name : `Alternativa ${parentParty.short}`);
      const splitChosenShort = customShort || (unusedEntry ? unusedEntry.short : `N${parentParty.short.slice(0,2)}`);
      const splitChosenColor = (customLogoCfg && customLogoCfg.bgColor) || (unusedEntry && unusedEntry.color) || uniqueColor;
      const splitWingName = (unusedEntry && unusedEntry.wing) || "Area Riformista";

      const newParty = {
        id:splitId,
        name:splitChosenName,
        short:splitChosenShort,
        leader:newLeaderName,
        leaderAge:newLeaderAge,
        leaderTrust:88,
        personalParty:true,
        founderLeader:newLeaderName,
        nextCongYear:game.date.getFullYear() + 3,
        area:getIdeoLabel(getPartyIdeoScore({stances:newStances})).replace(/^[^\s]+\s/, ''),
        coalId:'none',
        color:splitChosenColor,
        customLogoCfg: customLogoCfg || null,
        emblemType:uniqueEmblem,
        poll:+(parentParty.poll * splitShare).toFixed(1),
        seats:movedSeats,
        inGov:false,
        credibility:76,
        cohesion:90,
        orgStrength:56,
        wingLeader:risingWing.name,
        wingAge:risingWing.age,
        wingName:splitWingName,
        wingArea:parentParty.area,
        factions:[
          { name:`Area Fondatrice (${newLeaderName})`, leader:newLeaderName, share:70, desc:"Nucleo guida della scissione." },
          { name:"Circoli Territoriali", leader:risingWing.name, share:30, desc:"Rete locale del nuovo partito." }
        ],
        splitName:splitChosenName,
        splitShort:splitChosenShort,
        bio:`Partito nato dalla scissione da ${parentParty.name} guidata da ${newLeaderName}.`,
        vetoes:[parentParty.id],
        stances:newStances,
        baseStances:{ ...newStances },
        baseIdeo:getPartyIdeoScore({stances:newStances}),
        lowPollWeeks:0
      };

      if (!parentParty.vetoes) parentParty.vetoes = [];
      parentParty.vetoes.push(newParty.id);

      game.parties.push(newParty);
      game.blocSympathy[newParty.id] = {};
      BLOCS.forEach(b => {
        game.blocSympathy[newParty.id][b.id] = (game.blocSympathy[parentParty.id][b.id] || 15) * splitShare;
        game.blocSympathy[parentParty.id][b.id] *= (1 - splitShare);
      });
      FALLBACK_REGIONS.forEach(r => { game.regOrg[r.id][newParty.id] = Math.round((game.regOrg[r.id][parentParty.id] || 50) * 0.75); });
      game.parties.forEach(p => { adjPairRel(newParty.id, p.id, 52); });

      setBetrayal(parentParty.id, newParty.id, 1825, `Scissione traumatica di ${newParty.short} da ${parentParty.short}`);

      const newWingForParent = generateNewPolitician(parentParty.id);
      if (isPlayerSplitting) {
        if (parentParty.leader === game.leader.name) {
          parentParty.leader = parentParty.wingLeader || newWingForParent.name;
          parentParty.leaderAge = parentParty.wingAge || newWingForParent.age;
          syncPartyNameWithLeader(parentParty, parentParty.leader);
          recordPoliticianHistory(parentParty.leader, `Assume la Segreteria Nazionale di ${parentParty.short} dopo la scissione di ${newParty.short}`, `Segretario Nazionale ${parentParty.short}`);
        }
        parentParty.wingLeader = newWingForParent.name;
        parentParty.wingAge = newWingForParent.age;
        game.playerPartyId = newParty.id;
        game.partyRole = 'secretary';
        game.selectedDossierPartyId = newParty.id;
      } else {
        parentParty.wingLeader = newWingForParent.name;
        parentParty.wingAge = newWingForParent.age;
      }

      // PUNTO 16 (1.7): Trasferimento effettivo dei politici nel nuovo partito scissionista + aggiornamento storico e affiliazione!
      if (!game.politicianPartyMap) game.politicianPartyMap = {};
      const leaderPolObj = POLITICIANS.find(x => x.name === newLeaderName || (isPlayerSplitting && x.isPlayer));
      if (leaderPolObj) {
        leaderPolObj.partyId = newParty.id;
        game.politicianPartyMap[leaderPolObj.id] = newParty.id;
      }
      recordPoliticianHistory(newLeaderName, `Guida la scissione da ${parentParty.short} e fonda ${newParty.name} (${newParty.short})`, `Segretario Fondatore ${newParty.short}`);
      recordPoliticianHistory(risingWing.name, `Cofondatore e Capocorrente di ${newParty.name} (${newParty.short})`, `Capocorrente ${newParty.short}`);

      // Trasferisce esponenti dal partito madre al nuovo partito scissionista
      const defectingPols = POLITICIANS.filter(x => x.partyId === parentParty.id && x.name !== parentParty.leader && !x.isPlayer).slice(0, 4);
      defectingPols.forEach(dp => {
        dp.partyId = newParty.id;
        if (!game.politicianPartyMap) game.politicianPartyMap = {};
        game.politicianPartyMap[dp.id] = newParty.id;
        recordPoliticianHistory(dp.name, `Lascia ${parentParty.short} e aderisce alla scissione di ${newParty.name} (${newParty.short})`, `Dirigente Nazionale ${newParty.short}`);
        generateNewPolitician(parentParty.id);
      });

      // PUNTO 30 (1.8): Assegna un roster completo di 18 politici per il nuovo partito scissionista
      populateNewPartyPoliticians(newParty.id, 18);

      // PUNTO 28 (1.8): Sincronizza i governatori se il leader scissionista era un governatore
      if (game.governors) {
        for (const [rId, gObj] of Object.entries(game.governors)) {
          if (gObj && (gObj.name === newLeaderName || gObj.polId === leaderPolObj?.id)) {
            gObj.partyId = newParty.id;
            gObj.coalId = 'none';
          }
        }
      }
      enforceSingleOfficeRule();

      recalcPolls(true);
      addFeed(`🚨 <strong>SCISSIONE TRAUMATICA IN PARLAMENTO!</strong> <strong>${newParty.leader}</strong> rompe con ${parentParty.name} e fonda <strong>${newParty.name} (${newParty.short})</strong> portando via ${movedSeats} deputati!`, 'cr');
      setTicker(`SCISSIONE: Nasce "${newParty.name}" (${newParty.short}) di ${newParty.leader} con ${movedSeats} deputati!`);

      if (wasPM) {
        checkAndTriggerPremierDefectionCrisis(parentParty, `scissione e fondazione di ${newParty.name}`);
      }
      return newParty;
    }

export function weeklyMacroStep() {
      const mins = Object.values(game.cabinet);
      const avgComp = mins.reduce((s,m)=>s+(m?.comp||78),0) / (mins.length||1);
      const b = game.budget;
      const fedBonus = game.stateForm === 'federale' ? 0.015 : 0;
      const russiaGasBonus = game.foreignRels.russia >= 60 ? 0.01 : 0;
      // PUNTO 9 (1.7.1): Evoluzione macroeconomica giornaliera (1/7 del passo settimanale)
      const dailyGdpDelta = ((b.investSpend - 3.2)*0.04 - (b.taxPressure - 42.0)*0.03 + (avgComp - 78)*0.004 + fedBonus + russiaGasBonus) / 7;
      game.gdp = Math.max(-2.8, Math.min(3.5, +(game.gdp + dailyGdpDelta).toFixed(2)));
      b.deficit = +(b.healthSpend + b.eduSpend + b.pensionSpend + b.investSpend + game.defenseSpendGDP + 12.9 - b.taxPressure).toFixed(1);
      b.debtToGDP = +(b.debtToGDP + ((b.deficit - game.gdp)*0.04) / 7).toFixed(2);
      const euPenalty = !game.inEU ? 35 : (game.foreignRels.eu_com < 40 ? 12 : 0);
      const dailySpreadDelta = ((b.deficit - 3.0)*3.2 + (70 - game.govStability)*0.20 - (avgComp - 80)*0.4 + euPenalty * 0.08) / 7 + (Math.random() - 0.5) * 0.9;
      game.spread = Math.max(60, Math.min(520, Math.round(game.spread + dailySpreadDelta)));

      // Aggiornamento giornaliero del gradimento dei Governatori Regionali (PUNTO 10)
      if (game.governors) {
        for (const [regId, gov] of Object.entries(game.governors)) {
          if (!gov) continue;
          const rPolls = game.regionPolls?.[regId] || {};
          const govPartyPoll = rPolls[gov.partyId] || 15;
          const healthFactor = (b.healthSpend - 6.5) * 0.06;
          const drift = ((govPartyPoll - 18) * 0.004 + healthFactor + (Math.random() - 0.5) * 0.25);
          gov.approval = Math.max(22, Math.min(85, Math.round((gov.approval || 55) + drift)));
        }
      }

      // Feedback macroeconomico realistico sulla tenuta del governo e consensi (calibrato sul passo settimanale)
      if (game.turn % 7 === 0) {
        if (game.spread > 200 || game.gdp < -0.5) {
          const severity = (game.spread > 260 || game.gdp < -1.2) ? 2 : 1;
          if (!game.isDictatorship) {
            game.govStability = Math.max(0, game.govStability - 3 * severity);
          }
          game.parties.filter(p=>p.inGov).forEach(p => {
            p.credibility = Math.max(20, p.credibility - 2 * severity);
            p.poll = Math.max(1.0, +(p.poll - 0.12 * severity).toFixed(1));
            game.allySatisfaction[p.id] = Math.max(15, (game.allySatisfaction[p.id] || 75) - 3 * severity);
          });
          if (game.spread > 230) {
            addFeed(`🚨 <strong>FIBRILLAZIONE ECONOMICA:</strong> Spread a <strong>${game.spread} pt</strong> e PIL a <strong>${game.gdp}%</strong>: la maggioranza trema, calano i consensi del Governo (-Stabilità, -Fiducia Alleati)!`, 'cr');
          }
        } else if (game.spread <= 110 && game.gdp >= 1.0) {
          game.govStability = Math.min(100, game.govStability + 2);
          game.parties.filter(p=>p.inGov).forEach(p => {
            p.credibility = Math.min(95, p.credibility + 1);
            p.poll = Math.min(45.0, +(p.poll + 0.1).toFixed(1));
            game.allySatisfaction[p.id] = Math.min(100, (game.allySatisfaction[p.id] || 75) + 2);
          });
        }
      }
    }

    /* PUNTO 8 & 12 (1.7): GOVERNO IA DINAMICO E ATTIVO QUANDO IL GIOCATORE NON È AL GOVERNO */
export function weeklyAIGovernmentAction() {
      const p = getP();
      if (p.inGov || game.isDictatorship || game.campaignActive) return;
      const govParties = game.parties.filter(pt => pt.inGov && pt.seats > 0);
      if (govParties.length === 0) return;
      const govSeats = govParties.reduce((s, x) => s + x.seats, 0);
      const govIdeo = govParties.reduce((s, x) => s + getPartyIdeoScore(x) * x.seats, 0) / Math.max(1, govSeats);
      const leadGovParty = [...govParties].sort((a,b) => b.seats - a.seats)[0] || govParties[0];

      const actionRoll = Math.random();
      // 1. Il Governo IA propone un DDL di Riforma su uno dei 16 Temi Caldi coerente con la propria ideologia (45% prob)
      const candidateLaws = HOT_LAWS.filter(law => {
        if ((game.lawCooldowns[law.id] || 0) > game.turn) return false;
        const curIdx = game.lawStates[law.id] ?? law.currentIdx;
        return law.options.some(o => o.idx !== curIdx && Math.abs((o.targetStance ?? 2) - govIdeo) <= 1.15);
      });

      if (actionRoll < 0.45 && candidateLaws.length > 0) {
        const law = candidateLaws[Math.floor(Math.random() * candidateLaws.length)];
        const curIdx = game.lawStates[law.id] ?? law.currentIdx;
        const targetOpt = [...law.options].filter(o => o.idx !== curIdx).sort((a,b) => Math.abs((a.targetStance ?? 2) - govIdeo) - Math.abs((b.targetStance ?? 2) - govIdeo))[0];
        if (targetOpt) {
          const passed = govSeats >= 201 && Math.random() < 0.78;
          game.lawCooldowns[law.id] = game.turn + 180;
          if (passed) {
            game.lawStates[law.id] = targetOpt.idx;
            if (targetOpt.eff) targetOpt.eff(game);
            const cleanSt = targetOpt.status.replace(/^(?:🟢|🟡|🔴)\s*/u, '');
            addFeed(`🏛️ <strong>RIFORMA DEL GOVERNO ${game.currentPM.toUpperCase()} APPROVATA IN AULA:</strong> La maggioranza (${govSeats} seggi, guida ${leadGovParty.short}) approva il DDL su <strong>${law.title}</strong> → entra in vigore: <em>${cleanSt}</em>! Puoi raccogliere le firme per un Referendum Abrogativo nella scheda Temi Caldi.`, 'ai');
            setTicker(`MONTECITORIO: Il Governo ${game.currentPM} approva la riforma su "${law.title}" (${cleanSt})!`);
          } else {
            game.govStability = Math.max(10, game.govStability - 6);
            addFeed(`⚡ <strong>FRANCHI TIRATORI CONTRO IL GOVERNO ${game.currentPM.toUpperCase()}:</strong> La maggioranza va sotto in Commissione sul DDL <strong>${law.title}</strong> (-6% Stabilità Governo)!`, 'cr');
            setTicker(`CAOS IN AULA: Il Governo ${game.currentPM} frena sul DDL ${law.title} per divisioni interne.`);
          }
          recalcPolls(true);
          return;
        }
      }

      // 2. Il Governo IA emana un Decreto-Legge economico/sociale da Palazzo Chigi (35% prob)
      if (actionRoll < 0.80 && EXEC_DECREES.length > 0) {
        const dec = EXEC_DECREES[Math.floor(Math.random() * EXEC_DECREES.length)];
        if (dec.id === 'dl_cuneo' || dec.id === 'dl_energia') {
          game.gdp = +(game.gdp + 0.05).toFixed(2);
          game.spread = Math.max(65, game.spread - 4);
          game.govStability = Math.min(98, game.govStability + 3);
        } else if (dec.id === 'dl_sanita') {
          game.budget.healthSpend = +(Math.min(10.0, game.budget.healthSpend + 0.1)).toFixed(1);
          game.govStability = Math.min(98, game.govStability + 2);
        } else if (dec.id === 'dl_sicurezza') {
          game.govStability = Math.min(98, game.govStability + 3);
        }
        addFeed(`🏛️ <strong>CDM A PALAZZO CHIGI (Governo ${game.currentPM}):</strong> Il Consiglio dei Ministri vara <strong>${dec.icon} ${dec.title}</strong>. Le opposizioni chiedono un'informativa urgente in Aula.`, 'ai');
        setTicker(`PALAZZO CHIGI: Il Governo ${game.currentPM} vara il decreto "${dec.title}".`);
        return;
      }

      // 3. Il Governo IA o la maggioranza avvia un Referendum o una manovra correttiva di bilancio (20% prob)
      if (!game.activeReferendum && candidateLaws.length > 0 && Math.random() < 0.45) {
        const law = candidateLaws[0];
        const curIdx = game.lawStates[law.id] ?? law.currentIdx;
        const targetOpt = law.options.find(o => o.idx !== curIdx) || law.options[0];
        if (targetOpt && (game.referendumCooldowns[law.id] || 0) <= game.turn) {
          const cleanLbl = targetOpt.status.replace(/^(?:🟢|🟡|🔴)\s*/u, '');
          game.activeReferendum = {
            kind: 'law',
            lawId: law.id,
            title: `Referendum Popolare su ${law.title}`,
            targetIdx: targetOpt.idx,
            targetLabel: cleanLbl,
            daysLeft: 30,
            yesPct: 49.0,
            cooldownKey: law.id
          };
          addFeed(`🗳️ <strong>IL GOVERNO E I COMITATI DI MAGGIORANZA LANCIANO UN REFERENDUM POPOLARE!</strong> Indetto il voto referendario tra 30 giorni su <strong>${law.title}</strong> (<em>${cleanLbl}</em>)! Schierati per il SÌ o per il NO nella scheda Temi Caldi.`, 'cr');
          setTicker(`INDETTO REFERENDUM POPOLARE SU "${law.title.toUpperCase()}": Urne aperte tra 30 giorni!`);
          return;
        }
      }

      // Manovra di bilancio IA
      if (govIdeo >= 2.6) {
        game.budget.taxPressure = +(Math.max(36.0, game.budget.taxPressure - 0.2)).toFixed(1);
        addFeed(`📊 <strong>NOTA DI AGGIORNAMENTO DEF (Governo ${game.currentPM}):</strong> Il MEF riduce la pressione fiscale al <strong>${game.budget.taxPressure}%</strong> puntando su imprese e autonomi.`, 'ai');
      } else {
        game.budget.healthSpend = +(Math.min(9.8, game.budget.healthSpend + 0.1)).toFixed(1);
        addFeed(`📊 <strong>NOTA DI AGGIORNAMENTO DEF (Governo ${game.currentPM}):</strong> Il MEF incrementa la spesa sanitaria e sociale al <strong>${game.budget.healthSpend}% del PIL</strong>.`, 'ai');
      }
    }

    /* PUNTI 3, 10, 12 & 13: EVENTI SETTIMANALI PROFONDAMENTE CONTESTUALI AL RUOLO E ALLE SCADENZE CHIAVE (MILESTONES) */
export function triggerWorldEvent() {
      const p = getP();
      const myMin = getPlayerMinistry();
      const isPM = (game.currentPM === game.leader.name || game.currentPM === `${game.leader.name} (Tecnico)`);
      const isPresident = !!game.president.isPlayer;
      const isExile = !!game.inExile;
      const isInd = (game.partyRole === 'independent' || game.playerPartyId === 'ind');
      const isMember = (game.partyRole === 'member');
      const isOpp = (!p.inGov && !isPresident);

      // PUNTO 13 (1.7): Priorità assoluta agli Eventi Milestone durante Campagna Elettorale, Referendum, Quirinale imminente o Crisi di Governo!
      const daysToQuirinale = Math.ceil((game.president.endDate - game.date) / (1000 * 3600 * 24));
      let milestoneRole = null;
      if (game.campaignActive) milestoneRole = 'milestone_election';
      else if (game.activeReferendum) milestoneRole = 'milestone_referendum';
      else if (daysToQuirinale <= 60 && daysToQuirinale >= 0) milestoneRole = 'milestone_quirinale';
      else if (game.govStability <= 42 && !game.isDictatorship) milestoneRole = 'milestone_crisis';

      if (milestoneRole && !isExile) {
        const msPool = WORLD_EVENTS.filter(e => e.role === milestoneRole && !game.seenEvents.has(e.id));
        if (msPool.length > 0) {
          const msEv = msPool[Math.floor(Math.random() * msPool.length)];
          game.seenEvents.add(msEv.id);
          document.getElementById('mTag').textContent = msEv.tag;
          document.getElementById('mTitle').textContent = msEv.title;
          document.getElementById('mBody').textContent = msEv.body;
          const box = document.getElementById('mChoices');
          box.innerHTML = '';
          msEv.c.forEach(ch => {
            const btn = document.createElement('button');
            btn.className = 'm-btn';
            btn.innerHTML = `<strong>${ch.l}</strong><span>${ch.d}</span>`;
            btn.onclick = () => { ch.f(game, p); recalcPolls(true); closeModal(); updateAllUI(); };
            box.appendChild(btn);
          });
          openModal();
          return;
        }
      }

      let allowedRoles = [];
      if (isExile) {
        allowedRoles = ['exile'];
      } else if (isPresident) {
        allowedRoles = ['president_rep'];
      } else if (isPM) {
        allowedRoles = ['pm'];
      } else if (myMin) {
        allowedRoles = ['minister'];
      } else if (isInd) {
        allowedRoles = ['ind'];
      } else if (isMember) {
        allowedRoles = ['party_member'];
      } else if (isOpp) {
        allowedRoles = ['opp', 'party_member'];
      } else {
        allowedRoles = ['party_member', 'gov_ally'];
      }

      // Filtra rigorosamente solo ed esclusivamente per il ruolo effettivo del giocatore!
      let pool = WORLD_EVENTS.filter(e => !game.seenEvents.has(e.id) && allowedRoles.includes(e.role));
      if (pool.length === 0) {
        // Resetta i visti unicamente per il ruolo del giocatore, evitando di mostrare eventi di altri ruoli
        WORLD_EVENTS.filter(e => allowedRoles.includes(e.role)).forEach(e => game.seenEvents.delete(e.id));
        pool = WORLD_EVENTS.filter(e => allowedRoles.includes(e.role));
      }
      if (pool.length === 0) return;
      const ev = pool[Math.floor(Math.random() * pool.length)];
      if (!ev) return;
      game.seenEvents.add(ev.id);

      document.getElementById('mTag').textContent = ev.tag;
      document.getElementById('mTitle').textContent = ev.title;
      document.getElementById('mBody').textContent = ev.body;
      const box = document.getElementById('mChoices');
      box.innerHTML = '';
      ev.c.forEach(ch => {
        const btn = document.createElement('button');
        btn.className = 'm-btn';
        btn.innerHTML = `<strong>${ch.l}</strong><span>${ch.d}</span>`;
        btn.onclick = () => { ch.f(game); addFeed(`Evento "${ev.title}": hai scelto <em>${ch.l}</em>.`); closeModal(); updateAllUI(); };
        box.appendChild(btn);
      });
      openModal();
    }

    /* PUNTO 5 & PUNTO 9 (v6.2): ELEZIONE DIRETTA DEL PRESIDENTE DELLA REPUBBLICA SE L'ITALIA È REPUBBLICA PRESIDENZIALE */
export function openDirectPresidentialElectionModal() {
      const player = getP();
      const sortedP = [...game.parties].sort((a,b) => b.poll - a.poll);
      const presTermLimitReached = (game.president.name === game.leader.name && (game.presTermsServed || 1) >= 2);
      const topCandidates = [
        ...(!presTermLimitReached ? [{ name:game.leader.name, age:game.leader.age, area:player.area, partyName:player.name, pollBase:Math.max(22, player.poll + game.leader.prestige * 0.22), isPlayer:true }] : []),
        ...sortedP.filter(x => x.id !== player.id).slice(0, 3).map(x => ({
          name:x.leader, age:x.leaderAge, area:x.area, partyName:x.name, pollBase:x.poll + 8, isPlayer:false
        }))
      ];

      document.getElementById('mTag').textContent = "REPUBBLICA PRESIDENZIALE • ELEZIONE DIRETTA DEL PRESIDENTE DELLA REPUBBLICA";
      document.getElementById('mTitle').textContent = "🗳️ I Cittadini Italiani Votano Direttamente il Presidente della Repubblica!";
      document.getElementById('mBody').innerHTML = `
        Grazie alla riforma costituzionale del <strong>Presidenzialismo</strong>, non è più il Parlamento ad eleggere il Presidente della Repubblica, ma direttamente il popolo italiano a suffragio universale!<br><br>
        Il Presidente eletto guiderà anche l'Esecutivo per i prossimi 5 anni. Chi sostieni alle urne presidenziali?
      `;
      const box = document.getElementById('mChoices');
      box.innerHTML = '';

      topCandidates.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'm-btn';
        btn.innerHTML = `<strong>🗳️ ${c.isPlayer ? `👑 Candidati in prima persona: ${c.name}` : `Sostieni ${c.name}`} (${c.partyName})</strong><span>Consenso stimato al ballottaggio: ~${Math.min(64, Math.round(c.pollBase + 14))}%</span>`;
        btn.onclick = () => {
          const won = c.isPlayer ? (c.pollBase + Math.random()*14 >= topCandidates[1].pollBase) : true;
          const winner = won ? c : topCandidates[1];
          vacateOfficesForPresident(winner.name);
          game.president.name = winner.name;
          game.president.age = winner.age;
          game.president.area = `Presidente della Repubblica e Capo dell'Esecutivo (${winner.partyName})`;
          game.president.endDate = new Date(game.date.getFullYear() + 5, game.date.getMonth(), game.date.getDate());
          game.president.trust = 86;
          game.president.isPlayer = !!winner.isPlayer;
          game.currentPM = winner.name;
          game.govStability = 88;
          const isReelected = (winner.name === game.president.name);
          game.presTermsServed = isReelected ? ((game.presTermsServed || 1) + 1) : 1;
          recordPoliticianHistory(winner.name, `Eletto direttamente dai cittadini Presidente della Repubblica e Capo dell'Esecutivo (${game.presTermsServed}° Mandato)`, `Presidente della Repubblica`);
          addFeed(`🦅 <strong>ELEZIONI PRESIDENZIALI DIRETTE:</strong> Il popolo italiano elegge <strong>${winner.name}</strong> Presidente della Repubblica${winner.isPlayer ? ' (SEI SALITO AL QUIRINALE E GUIDI L\'ESECUTIVO!)' : ''}!`);
          setTicker(`QUIRINALE PRESIDENZIALE: ${winner.name} eletto direttamente dai cittadini italiani!`);
          closeModal(); updateAllUI();
        };
        box.appendChild(btn);
      });
      openModal();
    }

    /* PUNTI 4, 6, 7, 8 & 9: ELEZIONE DEL PRESIDENTE DELLA REPUBBLICA (ARTT. 83-84 COST.) CON PARTITO DI APPARTENENZA ESPLICITO E UNICITÀ RIGOROSA DELLE CARICHE */
export function openQuirinaleBallotModal(ballotNum = 1) {
      if (game.inExile) {
        alert("❌ SEI IN ESILIO ALL'ESTERO:\nUn latitante in esilio non può candidarsi al Quirinale né partecipare al voto dei Grandi Elettori!");
        return;
      }
      const player = getP();
      const quorum = ballotNum <= 3 ? 267 : 201;
      const myIdeo = game.leader.personalIdeo ?? getPartyIdeoScore(player);
      const isIndependentWithoutSeats = (game.partyRole === 'independent' || player.id === 'ind') && (player.seats === 0);

      // Helper per ricavare il partito attuale di qualsiasi candidato (Punto 4)
      const resolveCandPartyInfo = (polOrCand) => {
        const pId = polOrCand.partyId || POLITICIANS.find(x => x.name === polOrCand.name)?.partyId || 'ind';
        const partyObj = game.parties.find(pt => pt.id === pId);
        if (partyObj) {
          return {
            partyId: partyObj.id,
            partyShort: partyObj.short,
            partyName: partyObj.name,
            partyBadge: `Partito: ${partyObj.name} (${partyObj.short})`
          };
        }
        return {
          partyId: pId,
          partyShort: null,
          partyName: 'Indipendente / Super Partes',
          partyBadge: 'Indipendente / Super Partes (Nessun partito)'
        };
      };

      // PUNTO 5 & 6 (1.8.2): RISOLUZIONE DEFINITIVA QUIRINALE
      // - Chi ha 0 seggi (extraparlamentare) NON può votare nell'urna, solo rilasciare endorsement o assistere
      // - Eliminazione totale degli scrutini infiniti: dal 4° scrutinio convergenza progressiva, con fumata bianca garantita entro il 5° o 6° scrutinio
      const isExtraParliamentary = (player.seats === 0);

      // Punto 8: Candidati PdR dinamici da POLITICIANS con age >= 50 e alto profilo
      const eligiblePols = POLITICIANS.filter(p => p.age >= 50 && (p.clout >= 65 || p.comp >= 82) && !p.isPlayer);
      const dynamicCands = eligiblePols.slice(0, 10).map(p => {
        const pInfo = resolveCandPartyInfo(p);
        return {
          id: p.id,
          name: p.name,
          age: p.age,
          partyId: pInfo.partyId,
          partyShort: pInfo.partyShort,
          partyBadge: pInfo.partyBadge,
          area: pInfo.partyBadge,
          idealIdeo: p.compass?.ideoScore ?? 2.0,
          trust: Math.max(75, Math.round((p.clout + p.comp) / 2)),
          desc: p.bio || `${p.name}, figura di garanzia e prestigio istituzionale.`
        };
      });

      // Candidatura del giocatore se ha almeno 50 anni (Art. 84 Cost.)
      const canPlayerCandidate = (game.leader.age >= 50);
      const playerCand = canPlayerCandidate ? {
        id: 'player_cand',
        name: game.leader.name,
        age: game.leader.age,
        partyId: game.partyRole === 'independent' ? 'ind' : player.id,
        partyShort: game.partyRole === 'independent' ? null : player.short,
        partyBadge: game.partyRole === 'independent' ? 'Indipendente / Super Partes (Nessun partito)' : `Partito: ${player.name} (${player.short})`,
        area: game.partyRole === 'independent' ? 'Indipendente / Super Partes' : `Partito: ${player.name} (${player.short})`,
        idealIdeo: myIdeo,
        trust: Math.max(78, game.leader.prestige),
        isPlayer: true,
        desc: `La tua candidatura al Quirinale (Prestigio: ${game.leader.prestige}%, Grandi Elettori: ${player.seats}).`
      } : null;

      const baseCandidates = (dynamicCands.length ? dynamicCands : PRES_CANDIDATES).map(c => {
        if (c.partyBadge) return c;
        const pInfo = resolveCandPartyInfo(c);
        return { ...c, partyId: pInfo.partyId, partyShort: pInfo.partyShort, partyBadge: pInfo.partyBadge };
      });
      const allCandidates = playerCand ? [playerCand, ...baseCandidates.filter(c => c.name !== game.leader.name)] : baseCandidates;
      const aiSupport = {};
      allCandidates.forEach(c => aiSupport[c.id] = []);

      game.parties.filter(p => p.id !== player.id && p.seats > 0).forEach(p => {
        const pIdeo = getPartyIdeoScore(p);
        const bestCand = [...baseCandidates].sort((a,b) => Math.abs(a.idealIdeo - pIdeo) - Math.abs(b.idealIdeo - pIdeo))[0];
        if (bestCand && aiSupport[bestCand.id]) aiSupport[bestCand.id].push(p);
      });

      // Calcolo bonus di convergenza: a partire dal 4° scrutinio il Parlamento converge verso una figura condivisa
      const convergenceBonus = ballotNum <= 2 ? 0 : (ballotNum === 3 ? 35 : (ballotNum === 4 ? 75 : (ballotNum === 5 ? 130 : 210)));

      document.getElementById('mTag').textContent = `🗳️ ELEZIONE DEL PRESIDENTE DELLA REPUBBLICA • ${ballotNum}° SCRUTINIO (QUORUM: ${quorum} SU 400)`;
      document.getElementById('mTitle').textContent = `👑 Elezione del Presidente della Repubblica — ${ballotNum}° Scrutinio (Parlamento in Seduta Comune)`;
      document.getElementById('mBody').innerHTML = `
        <div style="background:rgba(226,185,59,0.12); border:1px solid var(--gold-bd); border-radius:8px; padding:9px 12px; margin-bottom:8px;">
          <strong style="color:var(--gold-lt);">🏛️ SONO IN CORSO LE ELEZIONI DEL PRESIDENTE DELLA REPUBBLICA ITALIANA (ART. 83 COST.)</strong><br>
          Il Parlamento in seduta comune e i delegati regionali (presieduti da <strong>${game.chamberSpeaker?.name || 'il Presidente della Camera'}</strong>) sono riuniti a Montecitorio per eleggere il nuovo <strong>Presidente della Repubblica</strong> per un mandato di 7 anni.<br>
          • <strong>1°–3° Scrutinio:</strong> richiesta la maggioranza qualificata dei <strong>2/3 (267 voti)</strong>.<br>
          • <strong>Dal 4° Scrutinio:</strong> sufficiente la <strong>maggioranza assoluta (201 voti)</strong>.
        </div>
        ${isExtraParliamentary
          ? `<div style="background:rgba(239,68,68,0.12); border:1px solid #ef4444; border-radius:8px; padding:8px 11px; margin-bottom:8px; font-size:12px; color:var(--text);">
              ⚠️ <strong>PREROGATIVA PARLAMENTARE (Art. 83 Cost.):</strong><br>
              Non fai parte del Parlamento (<strong>0 Grandi Elettori</strong>): in quanto esponente extraparlamentare o civico senza seggi a Montecitorio <strong>non puoi votare nell'urna</strong>.<br>
              Puoi però rilasciare un <strong>Endorsement Pubblico</strong> a sostegno di un candidato per orientare il voto dei parlamentari o assistere all'esito dello scrutinio d'Aula!
            </div>`
          : `Controlli direttamente <strong>${player.seats} grandi elettori</strong> (${game.partyRole === 'independent' ? 'Indipendente' : player.name}). Scegli quale candidato votare nell'urna di Montecitorio per la <strong>Presidenza della Repubblica</strong>:`
        }
      `;

      const box = document.getElementById('mChoices');
      box.innerHTML = '';

      const computedCands = allCandidates.map(cand => {
        let baseSup = aiSupport[cand.id] || [];
        let baseVotes = baseSup.reduce((s,p) => s + p.seats, 0);
        let allies = [];
        if (cand.isPlayer) {
          const prestigeReach = 0.8 + (game.leader.prestige / 95) + (ballotNum >= 4 ? 0.55 : 0);
          allies = game.parties.filter(p => p.id !== player.id && p.seats > 0 && !getBetrayal(player.id, p.id) && (
            (player.coalId !== 'none' && p.coalId === player.coalId) ||
            (getPairRel(player.id, p.id) >= 55 && Math.abs(getPartyIdeoScore(p) - myIdeo) <= prestigeReach)
          ));
        } else {
          const reach = 1.25 + (ballotNum >= 4 ? 0.65 : 0);
          allies = game.parties.filter(p => p.id !== player.id && p.seats > 0 && !baseSup.includes(p) && Math.abs(getPartyIdeoScore(p) - cand.idealIdeo) <= reach);
        }
        const playerContributedSeats = isExtraParliamentary ? 0 : player.seats;
        const prestigeVotes = cand.isPlayer ? Math.round(game.leader.prestige * 0.65) : Math.round((cand.trust || 75) * 0.45);
        const estTotal = Math.min(385, baseVotes + allies.reduce((s,p)=>s+p.seats,0) + (cand.isPlayer ? playerContributedSeats : 0) + prestigeVotes + convergenceBonus);
        return { cand, baseSup, allies, estTotal };
      });

      const electWinner = (winnerCand, votes, noteTxt = '') => {
        vacateOfficesForPresident(winnerCand.name);

        game.president.name = winnerCand.name;
        game.president.age = winnerCand.age;
        // PUNTO 8 (1.8): Dicitura istituzionale fattuale senza filler o formule enfatiche
        game.president.area = winnerCand.partyShort
          ? `Presidente della Repubblica (Area ${winnerCand.partyShort})`
          : 'Presidente della Repubblica — Super Partes';
        game.president.endDate = new Date(game.date.getFullYear() + 7, game.date.getMonth(), game.date.getDate());
        game.president.trust = winnerCand.trust || 85;
        game.president.isPlayer = !!winnerCand.isPlayer;
        if (winnerCand.id === 'draghi' || winnerCand.id === 'draghi_p') game.spread = Math.max(65, game.spread - 22);

        recordPoliticianHistory(winnerCand.name, `Eletto Presidente della Repubblica Italiana (${ballotNum}° scrutinio, ${votes} voti)`, 'Presidente della Repubblica');

        if (winnerCand.isPlayer) {
          // PUNTI 7 & 29 (1.8): L'elezione al Quirinale NON revoca la Segreteria di Partito (game.partyRole rimane intatto)!
          game.president.isPlayer = true;
          game.leader.prestige = Math.min(100, game.leader.prestige + 16);
          addFeed(`👑 <strong>STORICA FUMATA BIANCA AL ${ballotNum}° SCRUTINIO (${votes} voti)!</strong> <strong>${game.leader.name}</strong> è eletto <strong>Presidente della Repubblica Italiana</strong>! Ti insedi al Colle per il settennato (poteri presidenziali sbloccati nella scheda Parlamento & Colle)!`, 'ok');
          setTicker(`HABEMUS PRAESIDENTEM: ${game.leader.name} eletto Presidente della Repubblica con ${votes} voti!`);
        } else {
          addFeed(`🔔 <strong>FUMATA BIANCA AL ${ballotNum}° SCRUTINIO (${votes} voti)!</strong> <strong>${winnerCand.name} (${winnerCand.age}a)</strong> è eletto Presidente della Repubblica! ${noteTxt}`);
          setTicker(`QUIRINALE: ${winnerCand.name} eletto Presidente della Repubblica al ${ballotNum}° scrutinio (${votes} voti)!`);
        }
        syncAllPoliticianCareersWithCurrentState();
        closeModal();
        updateAllUI();
      };

      // PUNTO 13 (1.8.1) & PUNTI 5-6 (1.8.2): Scrutinio Segreto reale di tutti i 400 Grandi Elettori del Parlamento
      computedCands.forEach(({ cand, baseSup, allies, estTotal }) => {
        const btn = document.createElement('button');
        btn.className = 'm-btn';
        btn.style.borderColor = cand.isPlayer ? 'var(--gold)' : '';
        const actionLabel = isExtraParliamentary
          ? (cand.isPlayer ? `👑 AUTOCANDIDATURA DA INDIPENDENTE: ${cand.name}` : `📣 Endorsement Pubblico per ${cand.name}`)
          : (cand.isPlayer ? `👑 CANDIDATI TU STESSO AL QUIRINALE: ${cand.name}` : `🗳️ Vota ${cand.name}`);

        btn.innerHTML = `
          <strong>${actionLabel} (${cand.age}a) — [${cand.partyBadge || cand.area}] — Seggi Base: ~${estTotal}</strong>
          <span>${cand.isPlayer ? `Grandi elettori convergenti: ${allies.map(p=>p.short).join(', ') || 'Trasversali'} — ${cand.desc}` : `Voti stimati area: ${baseSup.map(p=>p.short).join(', ') || 'Trasversali'} ${allies.length ? `• Convergenza: +${allies.map(p=>p.short).join(', ')}` : ''} — ${cand.desc}`}</span>
        `;
        btn.onclick = () => {
          if (isExtraParliamentary) {
            addFeed(`📣 <strong>DICHIARAZIONE PUBBLICA:</strong> Da esponente extraparlamentare, ${game.leader.name} rilascia un endorsement pubblico a favore di <strong>${cand.name}</strong> per il Quirinale!`);
          }

          // Simulazione dello scrutinio segreto dell'intero Parlamento (400 Grandi Elettori)
          const candidateVotes = {};
          computedCands.forEach(c => { candidateVotes[c.cand.id] = 0; });
          let blankVotes = 0;

          // 1. I seggi del giocatore vanno al candidato scelto solo se ha seggi parlamentari
          if (!isExtraParliamentary && player.seats > 0) {
            candidateVotes[cand.id] = (candidateVotes[cand.id] || 0) + player.seats;
          }

          // 2. Convergenza parlamentare progressiva e fine degli scrutini infiniti
          // Nei ballottaggi 4-6, i partiti convergono rapidamente sui 2 candidati più votati
          const topTwo = [...computedCands].sort((a,b) => b.estTotal - a.estTotal).slice(0, 2);
          const topOne = topTwo[0]?.cand;
          const topTwoCand = topTwo[1]?.cand;

          game.parties.filter(p => p.id !== player.id && p.seats > 0).forEach(p => {
            const pIdeo = getPartyIdeoScore(p);

            // Nei primi 2 scrutini, tatticismo con schede bianche
            if (ballotNum <= 2 && Math.random() < 0.25) {
              blankVotes += p.seats;
              return;
            }

            // Dal 4° scrutinio in poi: polarizzazione sui 2 candidati di vertice
            if (ballotNum >= 4) {
              const d1 = Math.abs(topOne.idealIdeo - pIdeo);
              const d2 = topTwoCand ? Math.abs(topTwoCand.idealIdeo - pIdeo) : 999;
              const chosenTarget = (d1 <= d2) ? topOne : topTwoCand;
              // Snipers minimi (1-3%)
              const snipers = Math.round(p.seats * 0.02);
              blankVotes += snipers;
              const loyal = Math.max(0, p.seats - snipers);
              candidateVotes[chosenTarget.id] = (candidateVotes[chosenTarget.id] || 0) + loyal;
              return;
            }

            // Scrutini 1-3: voto al candidato più vicino
            let bestMatch = null, minDist = 999;
            computedCands.forEach(c => {
              const dist = Math.abs(c.cand.idealIdeo - pIdeo);
              if (dist < minDist) { minDist = dist; bestMatch = c.cand; }
            });
            const snipers = Math.round(p.seats * 0.05);
            blankVotes += snipers;
            const loyalVotes = Math.max(0, p.seats - snipers);
            if (bestMatch && minDist <= 1.6) {
              candidateVotes[bestMatch.id] = (candidateVotes[bestMatch.id] || 0) + loyalVotes;
            } else {
              blankVotes += loyalVotes;
            }
          });

          // PUNTO 6 (1.8.2): Garanzia costituzionale al 5°-6° scrutinio:
          // Se si è arrivati al 5° scrutinio senza vincitore, scatta l'intesa tra le forze parlamentari sul candidato di garanzia istituzionale
          if (ballotNum >= 5) {
            let maxVotes = Math.max(...Object.values(candidateVotes));
            if (maxVotes < quorum) {
              const boostNeed = (quorum - maxVotes) + Math.floor(Math.random() * 18) + 6;
              const bestCandToElect = (cand.isPlayer && (candidateVotes[cand.id] || 0) >= 120) ? cand : (topOne || cand);
              candidateVotes[bestCandToElect.id] = (candidateVotes[bestCandToElect.id] || 0) + boostNeed;
              blankVotes = Math.max(0, blankVotes - boostNeed);
            }
          }

          // Trova il candidato con il maggior numero di voti in questo scrutinio
          let topCandObj = null, topVotes = -1;
          computedCands.forEach(c => {
            const v = candidateVotes[c.cand.id] || 0;
            if (v > topVotes) { topVotes = v; topCandObj = c.cand; }
          });

          // Verifica se il top candidate ha raggiunto il quorum
          if (topVotes >= quorum && topCandObj) {
            electWinner(topCandObj, topVotes, `(Eletto a scrutinio segreto superando il quorum di ${quorum} con ${topVotes} voti!)`);
          } else {
            // Fumata Nera!
            const chosenVotes = candidateVotes[cand.id] || 0;
            const sortedResults = computedCands
              .map(c => ({ name: c.cand.name, votes: candidateVotes[c.cand.id] || 0 }))
              .filter(r => r.votes > 0)
              .sort((a,b) => b.votes - a.votes);

            const resultsSummary = sortedResults.slice(0, 4)
              .map(r => `• <strong>${r.name}:</strong> ${r.votes} voti`).join('<br>');

            openModal(
              `💨 Fumata Nera al ${ballotNum}° Scrutinio (Quorum: ${quorum})`,
              `<div style="font-size:13px; line-height:1.55; color:var(--text);">
                Nessun candidato ha raggiunto il quorum richiesto di <strong>${quorum} voti</strong> su 400 Grandi Elettori.<br><br>
                <strong>Esito dello scrutinio dall'urna di Montecitorio:</strong><br>
                ${resultsSummary}<br>
                • <strong>Schede Bianche / Nulle:</strong> ${blankVotes} schede<br><br>
                ${isExtraParliamentary ? `<em>Hai assistito alle operazioni di spoglio da personalità extraparlamentare.</em>` : (cand.isPlayer ? `Hai ottenuto <strong>${chosenVotes} voti</strong>.` : `Il candidato votato dal tuo gruppo (${cand.name}) ha ottenuto <strong>${chosenVotes} voti</strong>.`)}<br>
                ${ballotNum === 3 ? `<span style="color:var(--gold-lt); font-weight:800;">🔔 Dal 4° scrutinio il quorum scende alla maggioranza assoluta (201 voti)!</span><br>` : ''}
                I capigruppo parlamentari sono riconvocati in Aula per il ${ballotNum + 1}° scrutinio.
              </div>`,
              [
                {
                  label: `🗳️ Procedi al ${ballotNum + 1}° Scrutinio`,
                  fn: () => {
                    closeModal();
                    openQuirinaleBallotModal(ballotNum + 1);
                  }
                }
              ]
            );
            addFeed(`💨 <strong>FUMATA NERA AL ${ballotNum}° SCRUTINIO:</strong> Nessun candidato raggiunge il quorum di ${quorum} voti (in testa ${topCandObj?.name || 'dispersi'} con ${topVotes} voti).`);
          }
        };
        box.appendChild(btn);
      });

      const btnBlank = document.createElement('button');
      btnBlank.className = 'm-btn';
      btnBlank.innerHTML = `<strong>🏳️ ${isExtraParliamentary ? 'Assisti Neutrale allo Scrutinio' : 'Scheda Bianca Tattica'} (${ballotNum >= 4 ? 'I Grandi Elettori votano il candidato di convergenza' : `Passa al ${ballotNum + 1}° Scrutinio`})</strong>`;
      btnBlank.onclick = () => {
        if (ballotNum >= 4) {
          const bestAI = [...computedCands].filter(x => !x.cand.isPlayer).sort((a,b) => b.estTotal - a.estTotal)[0] || computedCands[0];
          electWinner(bestAI.cand, Math.max(218, bestAI.estTotal), "(Eletto dal Parlamento con convergenza istituzionale)");
        } else {
          openQuirinaleBallotModal(ballotNum + 1);
        }
      };
      box.appendChild(btnBlank);
      openModal();
    }

export function triggerElections(reason, hasVotedCitizen = false) {
      // PUNTO 11 (1.8.1): Cabina elettorale del cittadino per le Elezioni Politiche della Repubblica
      if (!hasVotedCitizen && !game.isImprisoned && !game.inExile) {
        openNationalCitizenVotingBoothModal(reason, (votedParty) => {
          triggerElections(reason, true);
        });
        return;
      }
      game.lastElectionTurn = game.turn;
      game.legislature = (game.legislature || 19) + 1;
      game.parties.forEach(p => p.seats = 0);
      const coalMap = {};
      game.parties.forEach(p => {
        const key = p.coalId === 'none' ? `SOLO_${p.id}` : p.coalId;
        if (!coalMap[key]) coalMap[key] = { key, label: p.coalId === 'none' ? p.name : getCoalName(p.coalId), members: [], pollSum: 0, seats: 0 };
        coalMap[key].members.push(p);
        coalMap[key].pollSum += p.poll;
      });

      const allCoals = Object.values(coalMap).sort((a,b) => b.pollSum - a.pollSum);
      const topCoal = allCoals[0], secondCoal = allCoals[1] || topCoal;

      // Rispetta l'ordinamento dello Stato vigente (Punto 5: Premierato premio 55%, Cancellierato proporzionale puro, Rosatellum misto)
      if (game.stateForm === 'premierato') {
        const winSeats = 222; // Premio di governabilità del 55.5% garantito alla 1ª coalizione
        const remSeats = 400 - winSeats;
        const sSum = topCoal.members.reduce((s,m)=>s+m.poll,0) || 1;
        let g = 0;
        topCoal.members.sort((a,b)=>b.poll-a.poll).forEach((m,i) => {
          const sh = (i === topCoal.members.length - 1) ? (winSeats - g) : Math.round((m.poll / sSum) * winSeats);
          m.seats += Math.max(0, sh); g += Math.max(0, sh);
        });
        const others = game.parties.filter(p => !topCoal.members.includes(p) && p.poll >= 2.5);
        const oSum = others.reduce((s,p)=>s+p.poll,0) || 1;
        let og = 0;
        others.sort((a,b)=>b.poll-a.poll).forEach((p,i) => {
          const sh = (i === others.length - 1) ? (remSeats - og) : Math.round((p.poll / oSum) * remSeats);
          p.seats += Math.max(0, sh); og += Math.max(0, sh);
        });
      } else {
        const uniTot = game.stateForm === 'cancellierato' ? 0 : 148;
        if (uniTot > 0) {
          const topUni = Math.round(uniTot * Math.min(0.76, Math.max(0.45, 0.52 + (topCoal.pollSum - secondCoal.pollSum) * 0.022)));
          const secUni = Math.round((uniTot - topUni) * 0.82);
          const remUni = Math.max(0, uniTot - topUni - secUni);
          const distUni = (c, n) => {
            const sSum = c.members.reduce((s,m)=>s+m.poll,0) || 1;
            let g = 0;
            c.members.sort((a,b)=>b.poll-a.poll).forEach((m,i) => {
              const sh = (i === c.members.length - 1) ? (n - g) : Math.round((m.poll / sSum) * n);
              m.seats += Math.max(0, sh); g += Math.max(0, sh);
            });
          };
          distUni(topCoal, topUni);
          if (secondCoal !== topCoal) distUni(secondCoal, secUni);
          if (allCoals[2]) distUni(allCoals[2], remUni);
        }

        const propTot = 400 - uniTot;
        const thresh = game.stateForm === 'cancellierato' ? 3.5 : 3.0;
        const elig = game.parties.filter(p => p.poll >= thresh || (p.coalId !== 'none' && p.poll >= 1.0 && coalMap[p.coalId]?.pollSum >= 10.0) || ['svp','scn'].includes(p.id));
        const pSum = elig.reduce((s,p)=>s+p.poll,0) || 1;
        let pAss = 0;
        elig.sort((a,b)=>b.poll-a.poll).forEach((p,i) => {
          const s = (i === elig.length - 1) ? (propTot - pAss) : Math.round((p.poll / pSum) * propTot);
          p.seats += Math.max(0, s); pAss += Math.max(0, s);
        });
      }

      allCoals.forEach(c => {
        c.members.sort((a,b) => b.seats - a.seats || b.poll - a.poll);
        c.seats = c.members.reduce((s,m)=>s+m.seats,0);
        c.leadParty = c.members[0];
      });
      allCoals.sort((a,b) => b.seats - a.seats);

      const winC = allCoals[0];
      const winLead = winC.leadParty;
      const player = getP();
      const sortedP = [...game.parties].sort((a,b)=>b.seats-a.seats);
      const isPlayerInWin = winC.members.some(m => m.id === player.id);

      document.getElementById('mTag').textContent = `CONSULTAZIONI AL QUIRINALE CON ${game.president.name.toUpperCase()}`;
      document.getElementById('mTitle').textContent = "Risultati Definitivi delle Elezioni Politiche — 400 Deputati";
      document.getElementById('mBody').innerHTML = `
        <strong>${reason}</strong><br><br>
        <strong>1ª Coalizione: ${winC.label} (${winC.seats} seggi)</strong> — 1° Partito: <strong>${winLead.name} (${winLead.poll}%, ${winLead.seats} seggi, Segretario: ${winLead.leader})</strong>.<br>
        ${game.partyRole === 'independent' ? `Sei una personalità <strong>Indipendente</strong> (Prestigio: ${game.leader.prestige}%).` : `Il tuo partito (<strong>${player.name}</strong>) ha ottenuto il <strong>${player.poll}%</strong> e <strong>${player.seats} seggi</strong>.`}<br><br>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px; background:var(--bg-2); padding:9px; border-radius:8px; margin-bottom:9px;">
          ${sortedP.filter(p=>p.seats>0).map(p => `<div><span style="color:${p.color};">●</span> <strong>${p.short}:</strong> ${p.poll}% (<strong>${p.seats}</strong> seggi) — <em>${getCoalName(p.coalId)}</em></div>`).join('')}
        </div>
        Per prassi costituzionale (Art. 92 Cost.), il Presidente della Repubblica conferisce l'incarico di formare il Governo (con riserva) a <strong>${winLead.leader}</strong>.
      `;

      const box = document.getElementById('mChoices');
      box.innerHTML = '';

      if (winC.seats >= 201) {
        const govMems = winC.members.filter(m => m.seats > 0);
        if (isPlayerInWin) {
          const isPlayerPremier = (winLead.id === player.id && game.partyRole === 'secretary');
          const btn = document.createElement('button');
          btn.className = 'm-btn';
          btn.innerHTML = isPlayerPremier
            ? `<strong>🇮🇹 Accetta l'Incarico con Riserva dal Quirinale: Componi Manualmente la Lista dei Ministri e i Presidenti delle Camere!</strong><span>Governo ${game.leader.name} sostenuto da ${govMems.map(m=>m.short).join('-')} (${winC.seats} seggi).</span>`
            : `<strong>🤝 Entra al Tavolo di Coalizione del Governo ${winLead.leader} (${govMems.map(m=>m.short).join('-')} — ${winC.seats} seggi)</strong><span>Negozia e scegli manualmente i Ministri e i Presidenti di Camera e Senato!</span>`;
          btn.onclick = () => {
            openManualGovernmentFormationModal(govMems, isPlayerPremier ? game.leader.name : winLead.leader, winC.key);
          };
          box.appendChild(btn);
        } else {
          const btnOpp = document.createElement('button');
          btnOpp.className = 'm-btn';
          btnOpp.innerHTML = `<strong>🔴 Prendi atto della nascita del Governo ${winLead.leader} (${winC.label}, ${winC.seats} seggi)</strong><span>Inizia la nuova legislatura dai banchi dell'Opposizione.</span>`;
          btnOpp.onclick = () => { autoFormGovAI(govMems, winLead.leader, winC.key); if (player.id !== 'ind') player.inGov = false; closeModal(); updateAllUI(); };
          box.appendChild(btnOpp);
        }
      } else {
        if (game.partyRole === 'independent' && game.leader.prestige >= 70) {
          const btnIndPM = document.createElement('button');
          btnIndPM.className = 'm-btn';
          btnIndPM.innerHTML = `<strong>🇮🇹 IL QUIRINALE TI CONVOCA: Accetta l'incarico di Premier di un Governo Istituzionale e scegli i Ministri!</strong><span>Grazie al tuo prestigio da Indipendente (${game.leader.prestige}%), ${game.president.name} ti affida la guida dell'Esecutivo!</span>`;
          btnIndPM.onclick = () => {
            openManualGovernmentFormationModal(sortedP.slice(0,3), game.leader.name, 'none');
          };
          box.appendChild(btnIndPM);
        }

        const ext = game.parties.filter(p => !winC.members.some(m=>m.id===p.id) && p.seats > 0 && !computeCompat(winLead,p).vetoed && computeCompat(winLead,p).score >= 58).sort((a,b)=>b.seats-a.seats);
        const expMems = [...winC.members.filter(m=>m.seats>0)];
        let sc = winC.seats;
        for (const x of ext) { if (sc < 201) { expMems.push(x); sc += x.seats; } }
        expMems.sort((a,b) => b.seats - a.seats);
        const topP = expMems[0];
        const playerInExp = expMems.some(m => m.id === player.id);

        const btn = document.createElement('button');
        btn.className = 'm-btn';
        btn.innerHTML = sc >= 201
          ? `<strong>🏛️ Parlamento senza maggioranza: forma il Governo di Coalizione Allargata guidato da ${topP.leader} (${expMems.map(m=>m.short).join('-')}, ${sc} seggi)</strong><span>${playerInExp ? 'Passa alla nomina manuale dei Ministri e dei Presidenti delle Camere!' : 'Nasce la maggioranza allargata.'}</span>`
          : `<strong>⚖️ Stallo Totale: il Quirinale nomina un Governo Tecnico del Presidente</strong><span>Ritorno alle urne tra 1 anno.</span>`;
        btn.onclick = () => {
          if (sc >= 201) {
            if (playerInExp) openManualGovernmentFormationModal(expMems, topP.leader, winC.key);
            else { autoFormGovAI(expMems, topP.leader, winC.key); closeModal(); updateAllUI(); }
          } else {
            formTechnicalGovernment(null, 'stabilità');
            game.nextElectionDate = new Date(game.date.getFullYear()+2, game.date.getMonth(), game.date.getDate());
            closeModal(); updateAllUI();
          }
        };
        box.appendChild(btn);
      }
      openModal();
    }

    /* PUNTO 1 (1.7.1): GOVERNO TECNICO DI SALVEZZA NAZIONALE (ESCLUSIONE RIGOROSA DEL PRESIDENTE DELLA REPUBBLICA E DELLE ALTRE CARICHE) */
export function formTechnicalGovernment(techId = null, priority = 'stabilità') {
      const normName = (s) => String(s || '').replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim().toLowerCase();
      const presName = normName(game.president?.name);
      const senName = normName(game.senateSpeaker?.name);
      const chamName = normName(game.chamberSpeaker?.name);
      const govNames = new Set(Object.values(game.governors || {}).map(g => normName(g?.name)).filter(Boolean));

      const isUnavailable = (p) => {
        if (!p) return true;
        const n = normName(p.name);
        // PUNTO 14 & 16 (1.8.1): Ex-Presidenti (come Mattarella) e ritirati esclusi tassativamente dal Governo
        if (game.isRetired && (p.isPlayer || n === normName(game.leader.name))) return true;
        if (p.id === 'p_mattarella' || p.id === 'mattarella' || n.includes('mattarella') || p.role === 'president' || p.role === 'senatore_a_vita') return true;
        if (game.pastPresidents && game.pastPresidents.some(past => normName(past) === n)) return true;
        return n === presName || n === senName || n === chamName || govNames.has(n);
      };

      const technocrats = POLITICIANS.filter(p => p.partyId === 'tech' && p.age >= 50 && !isUnavailable(p));

      // PUNTO 10 (1.8): Varietà nei Premier Tecnici (15 personalità di altissimo profilo senza ripetersi sempre su Draghi/Panetta)
      if (!game.pastTechPremiers) game.pastTechPremiers = [];
      const techPremierPool = [
        'cartabia_p', 'cottarelli_p', 'colao_p', 'franco_p', 'cingolani_p',
        'reichlin_p', 'severino_p', 'giovannini_p', 'visco_p', 'cipollone_p',
        'draghi_p', 'panetta_p', 'cassese_p', 'fornero_p', 'amato_p'
      ];
      let pmCandidate = (techId && technocrats.find(p => p.id === techId));
      if (!pmCandidate) {
        const unpickedIds = techPremierPool.filter(tid => !game.pastTechPremiers.includes(tid));
        const poolToSearch = unpickedIds.length > 0 ? unpickedIds : techPremierPool;
        for (const tid of poolToSearch) {
          const found = technocrats.find(p => p.id === tid);
          if (found) { pmCandidate = found; break; }
        }
      }
      if (!pmCandidate) pmCandidate = technocrats[0] || POLITICIANS.find(p => p.partyId === 'tech');

      if (pmCandidate) {
        game.pastTechPremiers.push(pmCandidate.id);
        if (game.pastTechPremiers.length > 10) game.pastTechPremiers.shift();
      }

      game.isTechnicalGov = true;
      game.technocratPM = pmCandidate ? pmCandidate.id : 'cartabia_p';
      const cleanPmName = pmCandidate ? pmCandidate.name : 'Marta Cartabia';
      game.currentPM = `${cleanPmName} (Tecnico)`;
      game.currentGovCoalId = 'none';
      game.govPriority = priority;
      game.govStability = 84;
      game.spread = Math.max(65, game.spread - 25);
      game.gdp = Math.min(3.5, +(game.gdp + 0.25).toFixed(2));

      // I partiti moderati e istituzionali danno la fiducia esterna
      const broadParties = game.parties.filter(p => ['fi','pd','azione','iv','piueu','nm'].includes(p.id) || p.seats >= 35);
      game.parties.forEach(p => {
        p.inGov = broadParties.some(bp => bp.id === p.id);
      });

      // Nomina dei 15 ministri con tecnici di assoluto prestigio
      const used = new Set([pmCandidate ? pmCandidate.id : 'cartabia_p']);
      const techExperts = POLITICIANS.filter(p => p.partyId === 'tech' && (!pmCandidate || p.id !== pmCandidate.id) && !isUnavailable(p));
      setDraftCabinet({});
      recordPoliticianHistory(cleanPmName, `Presidente del Consiglio dei Ministri (Governo Tecnico)`, `Presidente del Consiglio (Tecnico)`);
      MINISTRIES.forEach(m => {
        const mClean = m.name.split(' (')[0];
        const expert = techExperts.find(x => !used.has(x.id) && x.pref === m.id)
          || techExperts.find(x => !used.has(x.id))
          || POLITICIANS.find(x => !used.has(x.id) && !isUnavailable(x));
        if (expert) {
          game.cabinet[m.id] = expert;
          used.add(expert.id);
          recordPoliticianHistory(expert.name, `Ministro ${mClean} (Governo Tecnico)`, `Ministro ${mClean}`);
        }
      });

      // PUNTO 11 (1.8.2): Regole costituzionali rigorose per Presidenti di Senato e Camera durante Governo Tecnico:
      // - Senato: Art. 58 Costituzione -> età minima 40 anni tassativa!
      // - No opposizione: solo figure tecniche (partyId === 'tech') o esponenti di partiti che sostengono il governo (inGov === true).
      // - Figure tecniche di alto profilo istituzionale/giuridico (Cassese, Severino, Flick, ecc.) privilegiate.
      const isEligibleGovSpeaker = (p, isSenate) => {
        if (!p || used.has(p.id) || isUnavailable(p)) return false;
        if (isSenate && (p.age < 40)) return false;
        if (p.partyId !== 'tech') {
          const pt = game.parties.find(x => x.id === p.partyId);
          if (!pt || !pt.inGov) return false;
        }
        return true;
      };

      const techSen = POLITICIANS.filter(p => p.partyId === 'tech' && isEligibleGovSpeaker(p, true));
      const polSen = POLITICIANS.filter(p => p.partyId !== 'tech' && isEligibleGovSpeaker(p, true));
      const senateChoice = techSen[0] || polSen[0] || POLITICIANS.find(p => p.partyId === 'tech' && p.age >= 40) || game.senateSpeaker;

      if (senateChoice) {
        game.senateSpeaker = senateChoice;
        used.add(senateChoice.id);
        recordPoliticianHistory(senateChoice.name, `Presidente del Senato della Repubblica (Fase Tecnica)`, `Presidente del Senato`);
      }

      const techCham = POLITICIANS.filter(p => p.partyId === 'tech' && isEligibleGovSpeaker(p, false));
      const polCham = POLITICIANS.filter(p => p.partyId !== 'tech' && isEligibleGovSpeaker(p, false));
      const chamberChoice = techCham[0] || polCham[0] || POLITICIANS.find(p => p.partyId === 'tech' && p.id !== game.senateSpeaker?.id) || game.chamberSpeaker;

      if (chamberChoice) {
        game.chamberSpeaker = chamberChoice;
        used.add(chamberChoice.id);
        recordPoliticianHistory(chamberChoice.name, `Presidente della Camera dei Deputati (Fase Tecnica)`, `Presidente della Camera`);
      }

      enforceSingleOfficeRule();
      syncAllPoliticianCareersWithCurrentState();
      addFeed(`🏛️ <strong>GOVERNO TECNICO DEL PRESIDENTE:</strong> Il Quirinale conferisce l'incarico a <strong>${cleanPmName}</strong> per guidare un Esecutivo di alto profilo istituzionale e salvezza nazionale! Lo Spread scende a ${game.spread} pt e la stabilità risale all'84%.`, 'ok');
      setTicker(`GOVERNO TECNICO: Giuramento al Quirinale dell'Esecutivo presieduto da ${cleanPmName}!`);
      closeModal();
      updateAllUI();
    }

    /* PUNTI 2, 12, 16, 17 (v6.2) & PUNTO 1, 3, 7 (1.7.1): FORMAZIONE DEL GOVERNO A 15 MINISTERI CON UNICITÀ RIGOROSA DELLE CARICHE */
export function setDraftOfficeSlot(slotKey, polId) {
      const pol = POLITICIANS.find(x => x.id === polId);
      if (!pol) return;
      const conflict = getPersonCurrentOffice(pol, slotKey, true);
      if (conflict) {
        alert(`⛔ Cumulo delle cariche vietato! ${pol.name} ricopre già l'incarico di "${conflict}". Ogni personalità può avere una sola carica istituzionale!`);
        renderManualGovModalContent();
        return;
      }
      if (slotKey === 'senate') setDraftSenateId(polId);
      else if (slotKey === 'chamber') setDraftChamberId(polId);
      else draftCabinet[slotKey] = polId;
      renderManualGovModalContent();
    }

export function generateCencelliDraft(govParties) {
      const playerPol = ensurePlayerInPoliticians();
      const ids = new Set(govParties.map(p => p.id));
      const sortedG = [...govParties].sort((a,b)=>b.seats-a.seats);
      const totS = sortedG.reduce((s,p)=>s+p.seats,0) || 1;
      const numMin = MINISTRIES.length;
      const bag = [];
      sortedG.forEach(p => {
        const q = Math.max(1, Math.round((p.seats / totS) * numMin));
        for (let k=0; k<q; k++) bag.push(p);
      });
      while (bag.length < numMin) bag.push(sortedG[0]);

      const used = new Set();
      const normName = (s) => String(s || '').replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim().toLowerCase();
      const activeGovNames = new Set(Object.values(game.governors || {}).map(g => normName(g?.name)).filter(Boolean));
      const isForbidden = (x) => !x || used.has(x.id) || normName(x.name) === normName(game.president?.name) || (draftPMName && normName(x.name) === normName(draftPMName)) || activeGovNames.has(normName(x.name));

      // 1. Assegna prima Presidente del Senato e Presidente della Camera (distinti da Premier, Presidente della Repubblica, Governatori e Ministri)
      const senParty = sortedG[0];
      const chParty = sortedG[1] || sortedG[0];
      const senCand = POLITICIANS.find(x => !isForbidden(x) && !x.isPlayer && x.partyId === senParty.id)
        || POLITICIANS.find(x => !isForbidden(x) && !x.isPlayer && ids.has(x.partyId))
        || POLITICIANS.find(x => !isForbidden(x));
      if (senCand) { setDraftSenateId(senCand.id); used.add(senCand.id); }

      const chCand = POLITICIANS.find(x => !isForbidden(x) && !x.isPlayer && x.partyId === chParty.id)
        || POLITICIANS.find(x => !isForbidden(x) && !x.isPlayer && ids.has(x.partyId))
        || POLITICIANS.find(x => !isForbidden(x));
      if (chCand) { setDraftChamberId(chCand.id); used.add(chCand.id); }

      setDraftCabinet({});

      // 2. Se il giocatore fa parte della coalizione di Governo ma NON è Presidente della Repubblica, Premier, Presidente di Camera/Senato o Governatore Regionale, riceve un Ministero!
      let playerAssignedMinId = null;
      const playerBusyOffice = getPersonCurrentOffice(playerPol, null, true);
      if (playerPol && ids.has(game.playerPartyId) && !playerBusyOffice && draftPMName !== game.leader.name && !game.president.isPlayer && !game.isImprisoned) {
        const preferredOrder = [playerPol.pref, 'esteri', 'interni', 'mef', 'mimit', 'difesa', 'giustizia', 'cultura', 'mit', 'lavoro', 'mur', 'turismo'];
        const targetM = preferredOrder.find(mId => mId && MINISTRIES.some(m => m.id === mId)) || 'esteri';
        draftCabinet[targetM] = playerPol.id;
        used.add(playerPol.id);
        playerAssignedMinId = targetM;
      }

      // 3. Assegna tutti gli altri 15 Ministeri senza alcun duplicato!
      MINISTRIES.forEach((m, idx) => {
        if (m.id === playerAssignedMinId) return;
        const tp = bag[idx] || sortedG[0];
        const cand = POLITICIANS.find(x => !isForbidden(x) && x.partyId === tp.id && x.pref === m.id)
          || POLITICIANS.find(x => !isForbidden(x) && x.partyId === tp.id)
          || POLITICIANS.find(x => !isForbidden(x) && ids.has(x.partyId))
          || POLITICIANS.find(x => !isForbidden(x) && x.partyId === 'tech')
          || POLITICIANS.find(x => !isForbidden(x));
        if (cand) {
          draftCabinet[m.id] = cand.id;
          used.add(cand.id);
        }
      });
    }

export function openManualGovernmentFormationModal(govParties, pmName, coalKey) {
      setDraftGovParties(govParties);
      setDraftPMName(pmName);
      setDraftCoalKey(coalKey);
      generateCencelliDraft(govParties);
      renderManualGovModalContent();
      openModal();
    }

export function renderManualGovModalContent() {
      ensurePlayerInPoliticians();
      const govParties = draftGovParties;
      const ids = new Set(govParties.map(p => p.id));
      const totS = govParties.reduce((s,p)=>s+p.seats,0) || 1;
      const pool = POLITICIANS.filter(pol => pol.partyId === 'tech' || ids.has(pol.partyId) || pol.isPlayer);
      const totalCencelliWeight = MINISTRIES.reduce((s,m)=>s+m.weight, 0) + 6;

      const senPol = POLITICIANS.find(x => x.id === draftSenateId) || POLITICIANS[0];
      const chPol = POLITICIANS.find(x => x.id === draftChamberId) || POLITICIANS[1];

      const cencelliRows = govParties.map(p => {
        const expW = Math.round((p.seats / totS) * totalCencelliWeight);
        let actW = MINISTRIES.filter(m => {
          const pol = POLITICIANS.find(x => x.id === draftCabinet[m.id]);
          return pol && pol.partyId === p.id;
        }).reduce((s,m)=>s+m.weight, 0);
        if (senPol && senPol.partyId === p.id) actW += 3;
        if (chPol && chPol.partyId === p.id) actW += 3;
        const estSat = Math.max(20, Math.min(100, Math.round(78 + (actW - expW) * 5)));
        return { p, expW, actW, estSat };
      });

      const mefPol = POLITICIANS.find(x => x.id === draftCabinet['mef']);
      const estPol = POLITICIANS.find(x => x.id === draftCabinet['esteri']);
      const mefParty = game.parties.find(x => x.id === mefPol?.partyId);
      const estParty = game.parties.find(x => x.id === estPol?.partyId);
      const quirinaleWarning = ((mefParty && mefParty.stances.eu === 4) || (estParty && estParty.stances.foreign === 0 && game.inNATO))
        ? `⚠️ <strong>RILIEVO DEL QUIRINALE (Art. 92 Cost.):</strong> Il Presidente ${game.president.name} esprime preoccupazione per un profilo anti-trattati al MEF o alla Farnesina (-10% Fiducia Colle se confermato).`
        : `✅ <strong>GRADIMENTO DEL QUIRINALE (Art. 92 Cost.):</strong> Il Presidente della Repubblica ${game.president.name} è pronto a firmare i decreti di nomina dei ${MINISTRIES.length} Ministri.`;

      document.getElementById('mTag').textContent = `FORMAZIONE DEL GOVERNO ${draftPMName.toUpperCase()} • SCIOGLIMENTO DELLA RISERVA`;
      document.getElementById('mTitle').textContent = `🏛️ Componi il Consiglio dei ${MINISTRIES.length} Ministri ed Eleggi i Presidenti delle Camere`;
      document.getElementById('mBody').innerHTML = `
        Nella realtà costituzionale italiana (Art. 92 Cost.), il Presidente del Consiglio incaricato (<strong>${draftPMName}</strong>) propone al Presidente della Repubblica la <strong>lista dei ${MINISTRIES.length} Ministri</strong>, mentre la maggioranza elegge i <strong>Presidenti di Senato e Camera</strong>. <em>Ogni personalità può ricoprire una sola carica istituzionale!</em><br>
        <div style="margin:8px 0; padding:8px; border-radius:8px; background:var(--bg-2); border:1px solid var(--gold-bd);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; flex-wrap:wrap; gap:6px;">
            <strong style="color:var(--gold-lt);">⚖️ Equilibrio Manuale Cencelli (${MINISTRIES.length} Ministeri + Presidenze Camere):</strong>
            <button class="btn" style="padding:3px 9px; font-size:11px;" onclick="generateCencelliDraft(draftGovParties);renderManualGovModalContent()">✨ Ribilancia Automaticamente</button>
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            ${cencelliRows.map(r => `<span style="background:var(--bg-1); padding:3px 8px; border-radius:6px; border:1px solid ${r.actW>=r.expW-2?'#10b981':'#ef4444'};"><strong style="color:${r.p.color};">${r.p.short}</strong> (${r.p.seats} seggi): Peso <strong>${r.actW}/${r.expW}</strong> • Soddisf.: <strong>${r.estSat}%</strong></span>`).join('')}
          </div>
          <div style="margin-top:6px; font-size:11.5px;">${quirinaleWarning}</div>
        </div>

        <!-- SEZIONE PRESIDENTI DI SENATO E CAMERA (UNICITÀ CARICHE PUNTO 2 & 12) -->
        <div class="grid2" style="margin-bottom:10px;">
          <div class="box" style="border-color:var(--gold-bd);">
            <h4 style="color:var(--gold-lt);">🏛️ Presidente del Senato (Palazzo Madama — 2ª Carica)</h4>
            <p style="font-size:11px; margin-bottom:4px;">Supplente del Presidente della Repubblica (+3 Peso Cencelli al partito scelto).</p>
            <select onchange="setDraftOfficeSlot('senate', this.value)" style="font-size:12px; padding:6px;">
              ${POLITICIANS.filter(x=>ids.has(x.partyId)).map(pol => {
                const pO = game.parties.find(x=>x.id===pol.partyId);
                const busy = getPersonCurrentOffice(pol, 'senate', true);
                return `<option value="${pol.id}" ${pol.id===draftSenateId?'selected':''} ${busy?'disabled':''}>${pol.name} (${pol.age}a, ${pO?pO.short:'Magg.'})${busy?` [Già: ${busy}]`:''}</option>`;
              }).join('')}
            </select>
          </div>
          <div class="box" style="border-color:var(--gold-bd);">
            <h4 style="color:var(--gold-lt);">🪑 Presidente della Camera (Montecitorio — 3ª Carica)</h4>
            <p style="font-size:11px; margin-bottom:4px;">Controlla il calendario dei DDL in Aula (+3 Peso Cencelli, +10% voto leggi).</p>
            <select onchange="setDraftOfficeSlot('chamber', this.value)" style="font-size:12px; padding:6px;">
              ${POLITICIANS.filter(x=>ids.has(x.partyId)).map(pol => {
                const pO = game.parties.find(x=>x.id===pol.partyId);
                const busy = getPersonCurrentOffice(pol, 'chamber', true);
                return `<option value="${pol.id}" ${pol.id===draftChamberId?'selected':''} ${busy?'disabled':''}>${pol.name} (${pol.age}a, ${pO?pO.short:'Magg.'})${busy?` [Già: ${busy}]`:''}</option>`;
              }).join('')}
            </select>
          </div>
        </div>

        <!-- SEZIONE 15 MINISTRI SCELTI MANUALMENTE (PUNTI 2, 12, 16, 17) -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; max-height:310px; overflow-y:auto; padding-right:4px;">
          ${MINISTRIES.map(m => {
            const curId = draftCabinet[m.id];
            return `
              <div class="box" style="padding:8px; margin-bottom:0;">
                <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:3px;">
                  <strong style="color:var(--gold-lt);">${m.name}</strong>
                  <span style="color:var(--muted);">Peso ${m.weight}</span>
                </div>
                <select onchange="setDraftOfficeSlot('${m.id}', this.value)" style="font-size:11.5px; padding:5px;">
                  ${pool.map(pol => {
                    const pO = game.parties.find(x=>x.id===pol.partyId);
                    const busy = getPersonCurrentOffice(pol, m.id, true);
                    return `<option value="${pol.id}" ${pol.id===curId?'selected':''} ${busy?'disabled':''}>${pol.isPlayer?'👤 [TU] ':''}${pol.name} (${pO?pO.short:'Tecnico'} • Comp.${pol.comp})${pol.pref===m.id?' ⭐':''}${busy?` [Già: ${busy}]`:''}</option>`;
                  }).join('')}
                </select>
              </div>
            `;
          }).join('')}
        </div>
      `;

      const box = document.getElementById('mChoices');
      box.innerHTML = '';
      const btnConfirm = document.createElement('button');
      btnConfirm.className = 'btn-gold';
      btnConfirm.style.marginTop = '8px';
      btnConfirm.innerHTML = `🇮🇹 Sciogli la Riserva, Giura nelle mani di ${game.president.name} e Vota la Fiducia alle Camere →`;
      btnConfirm.onclick = () => {
        finalizeManualGovernment();
      };
      box.appendChild(btnConfirm);
    }

export function finalizeManualGovernment() {
      const ids = new Set(draftGovParties.map(p => p.id));
      const totS = draftGovParties.reduce((s,p)=>s+p.seats,0) || 1;
      const totalCencelliWeight = MINISTRIES.reduce((s,m)=>s+m.weight, 0) + 6;
      game.parties.forEach(p => { p.inGov = ids.has(p.id); });
      game.currentPM = draftPMName;
      game.currentGovCoalId = draftCoalKey;
      game.isTechnicalGov = false;
      game.govStability = 80;
      game.nextElectionDate = new Date(game.date.getFullYear() + 5, game.date.getMonth(), game.date.getDate());

      recordPoliticianHistory(draftPMName, `Presidente del Consiglio dei Ministri`, `Presidente del Consiglio`);

      MINISTRIES.forEach(m => {
        const minPol = POLITICIANS.find(x => x.id === draftCabinet[m.id]) || POLITICIANS[0];
        const mClean = m.name.split(' (')[0];
        game.cabinet[m.id] = minPol;
        if (minPol) {
          recordPoliticianHistory(minPol.name, `Ministro ${mClean}`, `Ministro ${mClean}`);
        }
      });
      game.senateSpeaker = POLITICIANS.find(x => x.id === draftSenateId) || POLITICIANS[0];
      game.chamberSpeaker = POLITICIANS.find(x => x.id === draftChamberId) || POLITICIANS[1];
      if (game.senateSpeaker) {
        recordPoliticianHistory(game.senateSpeaker.name, `Presidente del Senato della Repubblica`, `Presidente del Senato`);
      }
      if (game.chamberSpeaker) {
        recordPoliticianHistory(game.chamberSpeaker.name, `Presidente della Camera dei Deputati`, `Presidente della Camera`);
      }
      enforceSingleOfficeRule();

      draftGovParties.forEach(p => {
        const expW = Math.round((p.seats / totS) * totalCencelliWeight);
        let actW = MINISTRIES.filter(m => game.cabinet[m.id]?.partyId === p.id).reduce((s,m)=>s+m.weight, 0);
        if (game.senateSpeaker?.partyId === p.id) actW += 3;
        if (game.chamberSpeaker?.partyId === p.id) actW += 3;
        game.allySatisfaction[p.id] = Math.max(20, Math.min(100, Math.round(78 + (actW - expW) * 5)));
      });

      // PUNTO 4 (1.8.2): Nomina di 1 o 2 Vicepremier tra i ministri più di spicco dei partiti alleati
      if (!game.isTechnicalGov) {
        const pmPartyId = POLITICIANS.find(x => x.name === draftPMName)?.partyId || game.playerPartyId;
        const alliedGovParties = draftGovParties.filter(p => p.id !== pmPartyId).sort((a,b) => b.seats - a.seats || b.poll - a.poll);
        const newVPs = [];
        for (const ap of alliedGovParties) {
          if (newVPs.length >= 2) break;
          const leaderPol = POLITICIANS.find(x => x.name === ap.leader && x.partyId === ap.id);
          const leaderHasMin = leaderPol && Object.values(game.cabinet).some(m => m && m.id === leaderPol.id);
          if (leaderHasMin) {
            newVPs.push(leaderPol.id);
          } else {
            const apMinisters = Object.values(game.cabinet).filter(m => m && m.partyId === ap.id);
            if (apMinisters.length > 0) {
              apMinisters.sort((a,b) => (b.clout || 0) - (a.clout || 0));
              newVPs.push(apMinisters[0].id);
            }
          }
        }
        game.vicePremiers = newVPs;
      } else {
        game.vicePremiers = [];
      }

      const myMin = getPlayerMinistry();
      addFeed(`🏛️ <strong>GIURAMENTO AL QUIRINALE E FIDUCIA:</strong> Nasce il <strong>Governo ${game.currentPM}</strong>! Eletti <strong>${game.senateSpeaker.name}</strong> Presidente del Senato e <strong>${game.chamberSpeaker.name}</strong> Presidente della Camera.${myMin && game.currentPM !== game.leader.name ? ` <strong>Il Premier ${game.currentPM} ti ha nominato Ministro (${myMin.ministry.name})!</strong>` : ''}`, 'ok');
      setTicker(`NUOVO GOVERNO: ${game.currentPM} giura al Quirinale. ${game.senateSpeaker.name} al Senato, ${game.chamberSpeaker.name} alla Camera.`);
      closeModal();
      updateAllUI();
    }

export function autoFormGovAI(govParties, pmName, coalKey) {
      setDraftGovParties(govParties);
      setDraftPMName(pmName);
      setDraftCoalKey(coalKey);
      generateCencelliDraft(govParties);
      finalizeManualGovernment();
    }


export function prisonAction(mode) {
      if (!game.isImprisoned) return;
      if (mode === 'memoir') {
        if (game.ap < 20) { alert("Servono 20 ⚡!"); return; }
        if (!useTurnAction('prison_memoir', 'Memoriale da Rebibbia')) return;
        game.ap -= 20;
        game.leader.prestige = Math.min(100, game.leader.prestige + 5);
        game.prisonDaysLeft = Math.max(0, game.prisonDaysLeft - 120);
        addFeed(`📖 <strong>MEMORIALE DA REBIBBIA:</strong> Il libro scritto in cella da <strong>${game.leader.name}</strong> riaccende il dibattito nel Paese (+5% Prestigio, -120 giorni di pena per buona condotta).`);
      } else if (mode === 'appeal') {
        if (game.ap < 30 || game.funds < 25) { alert("Servono € 25k e 30 ⚡ per il collegio difensivo in Cassazione/CEDU!"); return; }
        if (!useTurnAction('prison_appeal', 'Ricorso in Cassazione/CEDU')) return;
        game.ap -= 30;
        game.funds -= 25;
        game.prisonDaysLeft = Math.max(0, game.prisonDaysLeft - 365);
        addFeed(`⚖️ <strong>SENTENZA DI REVISIONE:</strong> Il collegio difensivo ottiene uno sconto di pena di 1 anno per <strong>${game.leader.name}</strong>!`);
      } else if (mode === 'pardon') {
        if (game.ap < 40) { alert("Servono 40 ⚡!"); return; }
        if (game.prisonDaysLeft > 730 && game.president.trust < 65) {
          alert(`Il Quirinale respinge l'istanza: devi aver ridotto la pena residua sotto i 2 anni (730 giorni, attuali: ${game.prisonDaysLeft}g) o avere almeno il 65% di Fiducia al Colle!`);
          return;
        }
        if (!useTurnAction('prison_pardon', 'Istanza di Grazia')) return;
        game.ap -= 40;
        game.isImprisoned = false;
        game.prisonDaysLeft = 0;
        game.prisonReason = null;
        addFeed(`🕊️ <strong>GRAZIA PRESIDENZIALE DEL QUIRINALE:</strong> Il Presidente ${game.president.name} firma il decreto di Grazia per <strong>${game.leader.name}</strong>! Torni in libertà come Indipendente.`, 'ok');
      } else if (mode === 'escape') {
        if (game.ap < 45 || game.funds < 45) { alert("Servono € 45k e 45 ⚡ per organizzare un piano di evasione clandestina!"); return; }
        if (!useTurnAction('prison_escape', 'Piano di Evasione')) return;
        game.ap -= 45;
        game.funds -= 45;
        if (Math.random() < 0.45) {
          game.isImprisoned = false;
          game.prisonDaysLeft = 0;
          game.inExile = true;
          game.exileHost = (game.foreignRels.russia || 18) >= 50 ? "Mosca (Russia)" : "Sudamerica";
          addFeed(`🚁 <strong>CLAMOROSA EVASIONE DA REBIBBIA!</strong> <strong>${game.leader.name}</strong> evade con l'aiuto di un commando esterno e ripara in esilio politico a <strong>${game.exileHost}</strong>!`, 'cr');
        } else {
          game.prisonDaysLeft += 365;
          game.leader.prestige = Math.max(5, game.leader.prestige - 10);
          addFeed(`🚓 <strong>EVASIONE SVENTATA A REBIBBIA!</strong> La Polizia Penitenziaria blocca il tentativo di fuga di <strong>${game.leader.name}</strong>: +1 anno di carcere duro!`, 'cr');
        }
      }
      if (game.isImprisoned && game.prisonDaysLeft <= 0) {
        game.isImprisoned = false;
        game.prisonDaysLeft = 0;
        game.prisonReason = null;
        addFeed(`🔓 <strong>SCARCERAZIONE DA REBIBBIA:</strong> <strong>${game.leader.name}</strong> ha scontato l'intera pena e torna in libertà!`, 'ok');
      }
      updateAllUI();
    }

export function indAction(type) {
      if (game.isImprisoned) { alert("Sei detenuto a Rebibbia! Devi prima uscire dal carcere."); return; }
      if (type === 'saggio') {
        if (game.ap < 20) { alert("Servono 20 ⚡!"); return; }
        if (!useTurnAction('ind_saggio', 'Pubblica Saggio Programmatico')) return;
        game.ap -= 20; game.leader.prestige = Math.min(100, game.leader.prestige + 6);
        addFeed(`📘 Il nuovo libro-manifesto di <strong>${game.leader.name}</strong> scala le classifiche (+6% Prestigio).`);
      } else if (type === 'cernobbio') {
        if (game.ap < 25) { alert("Servono 25 ⚡!"); return; }
        if (!useTurnAction('ind_cernobbio', 'Relazione al Forum di Cernobbio')) return;
        game.ap -= 25; game.funds += 40; game.leader.prestige = Math.min(100, game.leader.prestige + 8);
        addFeed(`🎙️ Applausi al Forum Ambrosetti di Cernobbio per l'intervento di <strong>${game.leader.name}</strong> (+8% Prestigio, +€ 40k).`);
      } else if (type === 'found_party') {
        if (game.funds < 80 || game.ap < 35) { alert("Servono € 80k e 35 ⚡ per fondare un nuovo partito nazionale!"); return; }
        if (!useTurnAction('ind_found_party', 'Fondazione Partito')) return;
        openCustomPartyCreationModal('found');
        return;
      } else alert("Risorse insufficienti!");
      updateAllUI();
    }

export function internalPartyAction(mode) {
      const p = getP();
      if (mode === 'build_faction') {
        if (game.funds < 25 || game.ap < 20) { alert("Servono € 25k e 20 ⚡!"); return; }
        if (!useTurnAction('party_build_faction', 'Raduna i Circoli della Tua Corrente')) return;
        game.funds -= 25; game.ap -= 20;
        game.leader.internalSupport = Math.min(95, game.leader.internalSupport + 8);
        if (game.partyRole === 'member') p.leaderTrust = Math.max(25, (p.leaderTrust || 75) - 6);
        addFeed(`🤝 Assemblea nazionale della tua corrente in <strong>${p.short}</strong>: il tuo peso interno sale al <strong>${game.leader.internalSupport}%</strong>!`);
      } else if (mode === 'challenge_congress') {
        const curY = game.date.getFullYear();
        const nextCongY = p.nextCongYear || (curY + 2);
        const turnsSinceLastCong = game.turn - (game.lastCongressTurn || -365);
        const isCrisis = ((p.leaderTrust || 75) <= 42 || game.leader.internalSupport >= 68);
        if (curY < nextCongY && !isCrisis) {
          alert(`⏳ CONGRESSO ORDINARIO NON ANCORA CONVOCABILE (Art. 12 Statuto):\nIl prossimo Congresso Ordinario di ${p.short} è previsto nel ${nextCongY}.\nPer convocare un Congresso Straordinario anticipato serve una grave crisi interna (Fiducia della Segreteria <= 42% o tua Forza Corrente >= 68%)!`);
          return;
        }
        if (turnsSinceLastCong < 180) {
          alert(`⏳ Hai già celebrato un Congresso di recente in ${p.short}! Devono trascorrere almeno 180 giorni tra due assisi congressuali (ancora ${180 - turnsSinceLastCong} giorni).`);
          return;
        }
        if (game.ap < 35) { alert("Servono 35 ⚡ per raccogliere le firme dei delegati e convocare il Congresso!"); return; }
        if (!useTurnAction('party_challenge_congress', 'Convocazione Congresso')) return;
        game.ap -= 35;
        openPartyCongressModal(p, `Raccolta firme promossa da ${game.leader.name} per sfidare la segreteria di ${p.leader}`);
      } else if (mode === 'pacify') {
        if (game.ap < 20) { alert("Servono 20 ⚡!"); return; }
        if (!useTurnAction('party_pacify', 'Patto Interno coi Capicorrente')) return;
        game.ap -= 20;
        p.cohesion = Math.min(100, (p.cohesion || 75) + 10);
        p.leaderTrust = Math.min(95, (p.leaderTrust || 75) + 8);
        addFeed(`🕊️ Accordo unitario in direzione nazionale di <strong>${p.short}</strong> (+10% Coesione, +8% Fiducia Base).`);
      } else if (mode === 'split') {
        if (game.ap < 40) { alert("Servono 40 ⚡!"); return; }
        if (!useTurnAction('party_split', 'Guida una Scissione')) return;
        game.ap -= 40;
        openCustomPartyCreationModal('split', p);
        return;
      } else if (mode === 'go_ind') {
        if (!useTurnAction('party_go_ind', 'Uscita dal Partito')) return;
        const oldP = p;
        const wasPM = (game.currentPM === game.leader.name);
        const wasFounderOrPersonal = (oldP.personalParty || oldP.founderLeader === game.leader.name || oldP.poll < 3.5) && game.partyRole === 'secretary';
        if (game.partyRole === 'secretary') {
          const r = generateNewPolitician(oldP.id);
          oldP.leader = oldP.wingLeader || r.name;
          oldP.leaderAge = oldP.wingAge || r.age;
          syncPartyNameWithLeader(oldP, oldP.leader);
          recordPoliticianHistory(oldP.leader, `Assume la Segreteria Nazionale di ${oldP.short} dopo l'uscita di ${game.leader.name}`, `Segretario Nazionale ${oldP.short}`);
        }
        game.partyRole = 'independent';
        game.playerPartyId = 'ind';
        const pPolInd = POLITICIANS.find(x => x.isPlayer || x.name === game.leader.name);
        if (pPolInd) {
          pPolInd.partyId = 'ind';
          if (!game.politicianPartyMap) game.politicianPartyMap = {};
          game.politicianPartyMap[pPolInd.id] = 'ind';
        }
        recordPoliticianHistory(game.leader.name, `Restituisce la tessera di ${oldP.name} (${oldP.short}) e diventa Indipendente`, `Personalità Indipendente`);
        document.body.classList.add('theme-ind');
        addFeed(`📄 <strong>USCITA DAL PARTITO:</strong> <strong>${game.leader.name}</strong> restituisce la tessera di ${oldP.name} e prosegue l'attività politica da <strong>Indipendente</strong>!`);
        if (wasPM) {
          checkAndTriggerPremierDefectionCrisis(oldP, "uscita dal partito per diventare Indipendente");
        } else if (wasFounderOrPersonal) {
          openPersonalPartyFateModal(oldP, null);
        }
      }
      updateAllUI();
    }

export function joinPartyAsMember(targetId) {
      if (game.inExile) {
        alert("❌ SEI IN ESILIO ALL'ESTERO:\nNon puoi tesserarti in un partito italiano mentre sei ricercato o rifugiato all'estero! Richiedi prima l'amnistia o la riabilitazione al Quirinale.");
        return;
      }
      if (game.ap < 30) { alert("Servono 30 ⚡!"); return; }
      const target = game.parties.find(x => x.id === targetId);
      if (!target) return;

      // Punto 20: Bussola Politica Personale e compatibilità statutaria
      const myIdeo = game.leader.compass?.ideoScore ?? game.leader.personalIdeo ?? 2.0;
      const targetIdeo = getPartyIdeoScore(target);
      const ideoDist = Math.abs(myIdeo - targetIdeo);
      if (ideoDist > 1.85) {
        alert(`❌ TESSERAMENTO RESPINTO DALLA DIREZIONE NAZIONALE DI ${target.short.toUpperCase()}:\n` +
              `La tua collocazione politica personale (${getIdeoLabel(myIdeo)}) è incompatibile con lo statuto di ${target.name} (${getIdeoLabel(targetIdeo)})!\n` +
              `Distanza ideologica eccessiva (${ideoDist.toFixed(1)} pt). Rivedi le tue posizioni o rivolgiti a una forza politica affine.`);
        return;
      }

      if (!useTurnAction('join_party', 'Cambio di Partito')) return;
      game.ap -= 30;

      const oldP = (game.partyRole !== 'independent' && game.playerPartyId !== 'ind') ? getP() : null;
      const wasPM = (oldP && game.currentPM === game.leader.name);
      const wasFounderOrPersonal = oldP && (oldP.personalParty || oldP.founderLeader === game.leader.name || oldP.poll < 3.8) && game.partyRole === 'secretary';

      if (oldP) {
        if (game.partyRole === 'secretary') {
          const r = generateNewPolitician(oldP.id);
          oldP.leader = oldP.wingLeader || r.name;
          oldP.leaderAge = oldP.wingAge || r.age;
          syncPartyNameWithLeader(oldP, oldP.leader);
          recordPoliticianHistory(oldP.leader, `Assume la Segreteria Nazionale di ${oldP.short} dopo l'addio di ${game.leader.name}`, `Segretario Nazionale ${oldP.short}`);
        }
        setBetrayal(oldP.id, target.id, 1460, `Passaggio di ${game.leader.name} da ${oldP.short} a ${target.short}`);
        addFeed(`⚡ <strong>CAMBIO DI PARTITO:</strong> <strong>${game.leader.name}</strong> lascia <strong>${oldP.short}</strong> ed entra in <strong>${target.short}</strong>!`, 'cr');
      }

      game.playerPartyId = target.id;
      game.selectedDossierPartyId = target.id;
      game.partyRole = 'member';
      document.body.classList.remove('theme-ind');
      target.wingLeader = game.leader.name;
      target.wingAge = game.leader.age;
      game.leader.internalSupport = 42;
      const pPolJoin = POLITICIANS.find(x => x.isPlayer || x.name === game.leader.name);
      if (pPolJoin) {
        pPolJoin.partyId = target.id;
        if (!game.politicianPartyMap) game.politicianPartyMap = {};
        game.politicianPartyMap[pPolJoin.id] = target.id;
      }
      recordPoliticianHistory(game.leader.name, `Aderisce a ${target.name} (${target.short}) come Capocorrente nazionale`, `Capocorrente ${target.short}`);
      addFeed(`➡️ <strong>INGRESSO IN ${target.short}:</strong> <strong>${game.leader.name}</strong> entra nella direzione nazionale di <strong>${target.name}</strong> (guidato da ${target.leader}) come Capocorrente col 42% dei delegati!`);
      updateAllUI();

      // Se era Presidente del Consiglio (es. Meloni che passa da FdI a Italia Viva), il Governo CADE immediatamente! (Bug Fix 2)
      if (wasPM) {
        checkAndTriggerPremierDefectionCrisis(oldP, `passaggio a ${target.name} (${getCoalName(target.coalId)})`);
      }
      // Se ha lasciato un partito personale che dipendeva da lui (es. Renzi che lascia Italia Viva per tornare nel PD), decidi la sorte di Italia Viva! (Punto 2)
      else if (wasFounderOrPersonal) {
        openPersonalPartyFateModal(oldP, target);
      }
    }

    /* PUNTO 2: MODAL PER LA CHIUSURA O TRASFORMAZIONE RADICALE DI UN PARTITO QUANDO LA SUA FIGURA DI SPICCO SE NE VA */
export function openPersonalPartyFateModal(oldParty, destParty) {
      document.getElementById('mTag').textContent = `CRISI ESISTENZIALE DI ${oldParty.name.toUpperCase()} (PUNTO 2)`;
      document.getElementById('mTitle').textContent = `⚰️ Il Destino di ${oldParty.name} senza ${game.leader.name}`;
      document.getElementById('mBody').innerHTML = `
        <strong>${oldParty.name} (${oldParty.short})</strong> era fortemente legato alla tua figura carismatica e alla tua leadership.<br><br>
        Ora che hai lasciato il partito ${destParty ? `per entrare in <strong>${destParty.name}</strong>` : 'per diventare Indipendente'}, la struttura di ${oldParty.short} (${oldParty.poll}%, ${oldParty.seats} seggi) è allo sbando.<br>
        Cosa succede a <strong>${oldParty.name}</strong>?
      `;
      const box = document.getElementById('mChoices');
      box.innerHTML = '';

      if (destParty) {
        const b1 = document.createElement('button');
        b1.className = 'm-btn';
        b1.innerHTML = `<strong>⚰️ Sciogli ${oldParty.name} e fai confluire parlamentari, elettori e tesoreria in ${destParty.name}!</strong><span>${oldParty.short} chiude ufficialmente i battenti; porti in dote a ${destParty.short} +${oldParty.seats} seggi e la tua Forza Corrente in ${destParty.short} sale subito al 58%!</span>`;
        b1.onclick = () => {
          game.leader.internalSupport = Math.min(90, game.leader.internalSupport + 16);
          dissolveParty(oldParty, `Scioglimento e confluenza in ${destParty.name} guidata da ${game.leader.name}`, destParty);
          closeModal(); updateAllUI();
        };
        box.appendChild(b1);
      }

      const b2 = document.createElement('button');
      b2.className = 'm-btn';
      b2.innerHTML = `<strong>🔄 Trasformazione Radicale dei Superstiti (guidati da ${oldParty.leader})</strong><span>${oldParty.name} cambia radicalmente nome in "${oldParty.splitName || ('Riformisti ex-' + oldParty.short)}", perde il 60% dei consensi e tenta di sopravvivere senza di te.</span>`;
      b2.onclick = () => {
        const oldName = oldParty.name;
        oldParty.name = oldParty.splitName || `Nuova ${oldParty.short}`;
        oldParty.short = oldParty.splitShort || (`N${oldParty.short.slice(0,2)}`);
        oldParty.personalParty = false;
        BLOCS.forEach(b => { game.blocSympathy[oldParty.id][b.id] = (game.blocSympathy[oldParty.id][b.id] || 5) * 0.4; });
        if (destParty && oldParty.seats > 1) {
          const moved = Math.ceil(oldParty.seats * 0.5);
          oldParty.seats -= moved;
          destParty.seats += moved;
        }
        recalcPolls(true);
        addFeed(`🔄 <strong>MUTAZIONE RADICALE:</strong> Rimasto orfano di ${game.leader.name}, <strong>${oldName}</strong> perde oltre metà dei consensi e si trasforma in <strong>${oldParty.name} (${oldParty.short})</strong> sotto ${oldParty.leader}!`, 'cr');
        closeModal(); updateAllUI();
      };
      box.appendChild(b2);

      const b3 = document.createElement('button');
      b3.className = 'm-btn';
      b3.innerHTML = `<strong>💀 Scioglimento Immediato di ${oldParty.name} per fine dell'esperienza politica</strong><span>Il partito chiude definitivamente e i suoi elettori si disperdono negli altri partiti affini.</span>`;
      b3.onclick = () => {
        dissolveParty(oldParty, `Chiusura definitiva dopo l'addio del leader fondatore ${game.leader.name}`, destParty);
        closeModal(); updateAllUI();
      };
      box.appendChild(b3);

      openModal();
    }


export function campAct(t) {
      const p = getP();
      if (t==='duello') {
        if (game.funds < 40 || game.ap < 25) { alert("Fondi o Capitale Politico insufficienti!"); return; }
        if (!useTurnAction('camp_duello', 'Confronto Finale su Rai 1')) return;
        game.funds-=40; game.ap-=25; shiftBloc(p.id,game.commStrategy.targetBloc1,6); shiftBloc(p.id,game.commStrategy.targetBloc2,6); addFeed(`📺 Duello TV su Rai 1 vinto da ${game.leader.name}!`);
      } else if (t==='piazza') {
        if (game.funds < 65 || game.ap < 30) { alert("Fondi o Capitale Politico insufficienti!"); return; }
        if (!useTurnAction('camp_piazza', 'Chiusura a Piazza San Giovanni')) return;
        game.funds-=65; game.ap-=30; BLOCS.forEach(b=>shiftBloc(p.id,b.id,3.5)); addFeed(`🇮🇹 Piazza San Giovanni gremita per ${p.name}!`);
      }
      updateAllUI();
    }

export function orgAct(t) {
      const p = getP();
      if (t==='funds') {
        if (game.ap < 25) { alert("Capitale Politico insufficiente!"); return; }
        if (!useTurnAction('org_funds', 'Tesseramento / Donazioni')) return;
        game.ap-=25; game.funds+=95; addFeed(`💶 Raccolti +€ 95k per la struttura politica.`);
      } else if (t==='cred') {
        if (game.ap < 30) { alert("Capitale Politico insufficiente!"); return; }
        if (!useTurnAction('org_cred', 'Conferenza Programmatica')) return;
        game.ap-=30;
        game.leader.prestige = Math.min(100, game.leader.prestige + 5);
        if (p.id !== 'ind') p.credibility = Math.min(100, p.credibility + 5);
        recalcPolls(true);
        addFeed(`🏛️ Conferenza Programmatica: salgono Prestigio (${game.leader.prestige}%) e Credibilità.`);
      }
      updateAllUI();
    }

    /* PUNTI 1, 3, 16: PROGRAMMA A 5 POSIZIONI CON ORIENTAMENTO CHIARO DA ESTREMA SINISTRA A ESTREMA DESTRA + COERENZA STATUTARIA */

export function launchIdeologicalConstituent() {
      const p = getP();
      if (game.partyRole !== 'secretary') { alert("Solo il Segretario Nazionale può convocare una Costituente Ideologica!"); return; }
      if (game.leader.internalSupport < 70) { alert(`Serve almeno il 70% di Forza Corrente per imporre una Rifondazione Ideologica (hai il ${game.leader.internalSupport}%)!`); return; }
      if (game.ap < 45) { alert("Servono 45 ⚡!"); return; }
      if (!useTurnAction('constituent', 'Costituente di Rifondazione Ideologica')) return;
      game.ap -= 45;
      p.baseStances = { ...p.stances };
      p.baseIdeo = getPartyIdeoScore(p);
      p.area = getIdeoLabel(p.baseIdeo).replace(/^[^\s]+\s/, '');
      p.leaderTrust = 80;
      addFeed(`🔥 <strong>COSTITUENTE IDEOLOGICA DI ${p.short}:</strong> ${game.leader.name} rifonda ufficialmente lo Statuto su posizioni <strong>${p.area}</strong>! L'ala tradizionalista rompe e fonda una scissione.`, 'cr');
      executePartySplit(p, false);
      checkIdeologicalCoherenceAndConsequences(p);
      updateAllUI();
    }

export function setStance(key, idx) {
      const p = getP();
      // Punto 13: Il programma ufficiale può essere modificato solo dal Segretario Nazionale!
      if (game.partyRole === 'member') {
        alert(`❌ PREROGATIVA STATUTARIA DI ${p.short}:\n` +
              `Come semplice membro/militante non hai il potere statutario di modificare la linea del Programma Elettorale!\n` +
              `Questa funzione appartiene esclusivamente al Segretario Nazionale (${p.leader}).\n` +
              `Puoi sfidare il Segretario al prossimo Congresso Nazionale o promuovere una scissione per fondare un tuo movimento.`);
        return;
      }
      const cost = 12;
      if (p.stances[key] === idx) return;
      if (game.ap < cost) { alert(`Servono ${cost} ⚡ di Capitale Politico!`); return; }
      if (!useTurnAction('stance_' + key, `Modifica Dossier ${key.toUpperCase()}`)) return;
      game.ap -= cost;

      if (game.partyRole === 'independent') {
        game.personalStances[key] = idx;
        game.leader.personalIdeo = getPartyIdeoScore(p);
        addFeed(`📜 Aggiornata la tua piattaforma programmatica personale su <em>${key.toUpperCase()}</em> (${STANCE_LABELS[idx].tag}).`);
      } else {
        const oldVal = p.stances[key] ?? 2;
        const baseVal = p.baseStances?.[key] ?? oldVal;
        const distFromBase = Math.abs(idx - baseVal);
        const wasCloserToBase = Math.abs(oldVal - baseVal) > distFromBase;

        p.stances[key] = idx;
        game.personalStances[key] = idx;
        game.leader.personalIdeo = +(game.leader.personalIdeo * 0.75 + getPartyIdeoScore(p) * 0.25).toFixed(2);
        p.area = getIdeoLabel(getPartyIdeoScore(p)).replace(/^[^\s]+\s/, '');

        if (wasCloserToBase) {
          // Riavvicinarsi alla linea storica del partito ricuce lo strappo con la base
          p.leaderTrust = Math.min(92, (p.leaderTrust || 75) + 4);
          p.cohesion = Math.min(95, (p.cohesion || 75) + 3);
        } else if (distFromBase >= 2) {
          // PUNTO 1: Tradire la linea storica su un Dossier fa crollare Fiducia del Segretario, Forza Corrente e Coesione!
          const trustHit = distFromBase >= 3 ? 13 : 8;
          p.leaderTrust = Math.max(10, (p.leaderTrust || 78) - trustHit);
          game.leader.internalSupport = Math.max(12, game.leader.internalSupport - Math.round(trustHit * 0.75));
          p.cohesion = Math.max(15, (p.cohesion || 80) - 9);
          addFeed(`⚠️ <strong>PROTESTA DELLA BASE DI ${p.short}:</strong> La svolta su <em>${key.toUpperCase()}</em> (${STANCE_LABELS[idx].short}) tradisce la linea storica del partito! Fiducia nel Segretario scesa al <strong>${p.leaderTrust}%</strong>.`, 'cr');
        } else {
          p.cohesion = Math.max(20, (p.cohesion || 80) - 3);
        }

        recalcPolls(true);
        checkIdeologicalCoherenceAndConsequences(p);
        if (p.cohesion <= 38 && p.wingLeader && p.poll >= 4.5 && !document.getElementById('modalBg').classList.contains('open')) {
          executePartySplit(p, false);
        }
      }
      updateAllUI();
    }

export function toggleFlag(key) {
      if (game.flagshipIssues.has(key)) game.flagshipIssues.delete(key);
      else {
        if (game.flagshipIssues.size >= 3) { alert("Massimo 3 Promesse Bandiera contemporaneamente!"); return; }
        game.flagshipIssues.add(key);
      }
      recalcPolls(true);
      updateAllUI();
    }

    // =========================================================================
    // TAB 4: TEMI CALDI, STATO LEGALE IN ITALIA & REFERENDUM (PUNTO 9 + ADATTAMENTO DITTATURA)
    // =========================================================================

export function campaignReferendumAction(side) {
      if (!game.activeReferendum) return;
      const used = game.activeReferendum.ralliesUsed || 0;
      const maxR = game.activeReferendum.maxRallies || 3;
      if (used >= maxR) {
        alert(`🛑 Hai già tenuto il massimo di ${maxR} grandi mobilitazioni nazionali in questa campagna referendaria! Ora attendi il verdetto delle urne.`);
        return;
      }
      if (game.ap < 18) { alert("Servono 18 ⚡ per organizzare una mobilitazione referendaria nazionale!"); return; }
      if (!useTurnAction('ref_campaign_act', 'Mobilitazione Campagna Referendaria')) return;
      game.ap -= 18;
      game.activeReferendum.ralliesUsed = used + 1;

      // PUNTO 1 (1.8.2): Bilanciamento impatto comizio in proporzione al peso elettorale del partito e carisma del leader
      const p = getP();
      const pollShare = (p && p.id !== 'ind' && game.partyRole !== 'independent') ? (p.poll || 2.0) : Math.max(1.0, (game.leader.prestige || 50) * 0.08);
      // Formula: partito all'1% sposta ~0.5% - 0.7%; partito al 10% sposta ~2.0%; partito al 30% sposta ~5.0% (max 6.0%)
      const baseShift = Math.max(0.4, Math.min(6.0, +(0.25 + (pollShare * 0.15) + ((game.leader.prestige || 50) * 0.015)).toFixed(1)));
      const delta = side === 'yes' ? baseShift : -baseShift;
      game.activeReferendum.yesPct = Math.max(10, Math.min(88, +(game.activeReferendum.yesPct + delta).toFixed(1)));
      addFeed(`📣 <strong>CAMPAGNA REFERENDARIA (${game.activeReferendum.title} — Comizio ${game.activeReferendum.ralliesUsed}/${maxR}):</strong> Mobilitazione di ${game.leader.name} (${p?.short || 'Indipendente'}, ${pollShare.toFixed(1)}% consensi) per il <strong>${side === 'yes' ? 'SÌ' : 'NO'}</strong>! Spostamento opinione pubblica: <strong>${delta > 0 ? '+' : ''}${delta.toFixed(1)}%</strong>. I sondaggi sul SÌ sono ora al <strong>${game.activeReferendum.yesPct.toFixed(1)}%</strong>.`);
      updateAllUI();
    }

export function imposeHotLawByDecree(lawId, targetIdx) {
      if (game.isImprisoned) return;
      const law = HOT_LAWS.find(l => l.id === lawId);
      if (!law) return;
      if (game.ap < 15) { alert("Servono 15 ⚡!"); return; }
      if (!useTurnAction('decree_law_' + lawId, `Decreto su ${law.title}`)) return;
      game.ap -= 15;
      const opt = law.options.find(o => o.idx === targetIdx);
      if (!opt) return;
      game.lawStates[law.id] = targetIdx;
      game.lawCooldowns[law.id] = game.turn + 180;
      if (opt.eff) opt.eff(game);
      game.revoltRisk = Math.min(100, game.revoltRisk + 4);
      recalcPolls(true);
      addFeed(`🦅 <strong>DECRETO DITTATORIALE:</strong> ${game.leader.name} impone senza voto parlamentare la nuova legge su <em>"${law.title}"</em> → <strong>${opt.status}</strong>! (+4% Tensione/Rivolta)`);
      updateAllUI();
    }

    /* PUNTI 3 & 4 (v6.2.1): COERENZA PROGRAMMATICA OBBLIGATORIA SUI DDL E MORATORIA LEGISLATIVA DI 180 GIORNI */
export function proposeHotLawParliament(lawId, targetIdx, forceAgainstParty = false) {
      if (game.isImprisoned) { alert("Sei detenuto a Rebibbia!"); return; }
      // PUNTO 9 (1.8): Il Presidente della Repubblica è garante neutrale e non propone DDL di parte
      if (game.president.isPlayer && game.stateForm !== 'presidenziale') {
        alert("❌ PREROGATIVA COSTITUZIONALE (Art. 87 Cost.):\nIn qualità di Presidente della Repubblica rappresenti la Nazione e sei super partes!\nNon puoi presentare DDL di parte in Parlamento; puoi esercitare la Moral Suasion o rinviare le leggi prive di copertura alle Camere (Art. 74 Cost.).");
        return;
      }
      const law = HOT_LAWS.find(l => l.id === lawId);
      if (!law) return;

      const lawCdLeft = Math.max(0, (game.lawCooldowns[lawId] || 0) - game.turn);
      if (lawCdLeft > 0) {
        alert(`⏳ Moratoria Legislativa in vigore su "${law.title}"!\nQuesta legge è già stata votata o modificata di recente: per regolamento parlamentare devono trascorrere ancora ${lawCdLeft} giorni prima di poter calendarizzare un nuovo DDL sullo stesso tema.`);
        return;
      }

      const opt = law.options.find(o => o.idx === targetIdx);
      if (!opt) return;
      const targetStance = opt.targetStance ?? 2;

      const p = getP();
      const isInd = (game.partyRole === 'independent' || p.id === 'ind');

      // Punti 14 & 15: Prerogativa parlamentare (Art. 71 Cost.) - servono seggi o carica esecutiva!
      if (p.seats === 0 && game.currentPM !== game.leader.name && !getPlayerMinistry()) {
        alert("❌ PREROGATIVA COSTITUZIONALE (Art. 71 Cost.):\n" +
              "Non hai parlamentari a Montecitorio o al Senato (0 seggi) e non fai parte dell'Esecutivo!\n" +
              "Non puoi presentare direttamente Disegni di Legge (DDL) in Aula.\n\n" +
              "Strumenti civici a tua disposizione:\n" +
              "• Raccolta firme per indire un Referendum Popolare (500.000 firme);\n" +
              "• Proposta di Legge d'Iniziativa Popolare (50.000 firme certificate);\n" +
              "• Pressione mediatica e mobilitazione pubblica.");
        return;
      }

      const dObj = DOSSIERS.find(d => d.key === law.dossier);
      const dTitle = dObj ? dObj.title : law.dossier.toUpperCase();
      const myPartyStance = isInd ? (game.personalStances[law.dossier] ?? 2) : (p.stances[law.dossier] ?? Math.round(getPartyIdeoScore(p)));
      const myDist = Math.abs(myPartyStance - targetStance);

      // Punto 4 (v6.2.1): Il DDL deve essere in linea con il Programma vigente del partito!
      if (!isInd && myDist >= 2 && !forceAgainstParty) {
        openModal(
          `⛔ Veto dei Capigruppo di ${p.short}: DDL Contrario al Programma Vigente!`,
          `<div style="font-size:13px; color:var(--txt); line-height:1.55;">
            I Capigruppo parlamentari di <strong>${p.name}</strong> alla Camera e al Senato rifiutano di sottoscrivere e depositare il DDL <strong>«${opt.status}»</strong> su <em>${law.title}</em> perché è in <strong>aperto contrasto con il Programma vigente del tuo partito</strong>!<br><br>
            <div class="box" style="background:var(--bg-2); border-color:#ef4444; margin-bottom:10px;">
              • <strong>Dossier programmatico:</strong> ${dTitle}<br>
              • <strong>Posizione attuale nel Programma di ${p.short}:</strong> <span style="color:#fde047; font-weight:800;">${STANCE_LABELS[myPartyStance].tag}</span> ${dObj ? `— <em>"${dObj.opts[myPartyStance]}"</em>` : ''}<br>
              • <strong>Posizione richiesta dal DDL proposto:</strong> <span style="color:#f87171; font-weight:800;">${STANCE_LABELS[targetStance].tag}</span> — <em>"${opt.label}"</em>
            </div>
            <strong>Come funziona la disciplina programmatica in Parlamento?</strong><br>
            1. <strong>Modifica prima il Programma (Consigliato):</strong> vai nella scheda <strong>📜 Programma (14 Dossier)</strong> e sposta la posizione ufficiale di <strong>${p.short}</strong> sul dossier <em>${dTitle}</em> verso una linea compatibile con questo DDL (distanza &le; 1), assumendotene gli effetti su correnti ed elettorato.<br>
            2. <strong>Forzatura in Aula contro il partito:</strong> se forzi comunque la calendarizzazione oggi <em>senza</em> aver cambiato il Programma di ${p.short}, <strong>i parlamentari del tuo stesso partito voteranno CONTRO il DDL</strong> in Aula seguendo il programma ufficiale e subirai <strong>-12% Fiducia della Base</strong>!
          </div>`,
          [
            { label: `🔙 Ritira il DDL (0 ⚡ spesi)`, fn: () => { closeModal(); } },
            { label: `📜 Vai a 'Programma (14 Dossier)' per cambiare la linea di ${p.short}`, fn: () => { closeModal(); showTab('tProg', document.querySelectorAll('.nav-item')[2]); } },
            { label: `⚠️ Forza comunque il voto in Aula contro il Programma di ${p.short} (25 ⚡ • I tuoi deputati voteranno NO!)`, fn: () => { closeModal(); proposeHotLawParliament(lawId, targetIdx, true); } }
          ]
        );
        return;
      }

      if (game.ap < 25) { alert("Servono 25 ⚡ di Capitale Politico per calendarizzare e mettere ai voti il DDL a Montecitorio!"); return; }
      if (!useTurnAction('ddl_' + lawId, `DDL su ${law.title}`)) return;
      game.ap -= 25;

      if (!isInd && myDist >= 2 && forceAgainstParty) {
        p.leaderTrust = Math.max(10, (p.leaderTrust ?? 78) - 12);
        p.cohesion = Math.max(15, (p.cohesion ?? 80) - 8);
      }

      let yesVotes = 0;
      let noVotes = 0;
      let breakdown = [];

      game.parties.forEach(pt => {
        if (!pt.seats) return;
        const ptStance = pt.stances[law.dossier] ?? Math.round(getPartyIdeoScore(pt));
        const dist = Math.abs(ptStance - targetStance);
        const sameCoal = !isInd && ((p.inGov && pt.inGov) || (p.coalId !== 'none' && pt.coalId === p.coalId));
        // La disciplina di coalizione scatta solo se il DDL proposto è coerente col programma del partito proponente (myDist <= 1)!
        const validCoalBill = sameCoal && myDist <= 1;
        let yesShare = 0.02;

        if (pt.id === game.playerPartyId && !isInd) {
          // I deputati del tuo partito votano secondo il PROGRAMMA VIGENTE del partito (ptStance) e la coesione rispetto allo Statuto!
          const baseSt = (pt.baseStances && pt.baseStances[law.dossier] !== undefined) ? pt.baseStances[law.dossier] : ptStance;
          const statutoDrift = Math.abs(baseSt - targetStance);
          const rebelDrag = statutoDrift >= 3 ? Math.max(0, (90 - (pt.cohesion || 80)) * 0.006 + 0.16) : (statutoDrift === 2 ? 0.06 : 0);
          if (dist === 0) {
            yesShare = Math.max(0.60, Math.min(0.98, 0.82 + (pt.cohesion || 80) * 0.0020 - rebelDrag));
          } else if (dist === 1) {
            yesShare = Math.max(0.55, Math.min(0.95, 0.78 + (pt.cohesion || 80) * 0.0020 - rebelDrag));
          } else if (dist === 2) {
            yesShare = 0.04;
          } else {
            yesShare = 0.01;
          }
        } else {
          const satFactor = Math.max(0.75, Math.min(1.08, (game.allySatisfaction[pt.id] ?? 78) / 76));
          if (dist === 0) {
            yesShare = validCoalBill ? 0.96 : 0.74;
          } else if (dist === 1) {
            yesShare = validCoalBill ? Math.min(0.93, 0.88 * satFactor) : 0.16;
          } else if (dist === 2) {
            // Un alleato moderato di governo (es. FI su un DDL di FdI/Lega) vota in parte per disciplina di coalizione, ma con franchi tiratori
            yesShare = validCoalBill ? Math.min(0.74, 0.66 * satFactor) : 0.03;
          } else {
            yesShare = 0.01;
          }
        }

        // Il bonus dei Presidenti di Camera/Senato aiuta solo nei gruppi parlamentari ideologicamente compatibili (dist <= 1)
        if (dist <= 1 && myDist <= 1) {
          if (game.chamberSpeaker?.partyId === game.playerPartyId || (validCoalBill && game.parties.find(x=>x.id===game.chamberSpeaker?.partyId)?.inGov)) {
            yesShare = Math.min(0.98, yesShare + 0.04);
          }
          if (game.senateSpeaker?.partyId === game.playerPartyId || (validCoalBill && game.parties.find(x=>x.id===game.senateSpeaker?.partyId)?.inGov)) {
            yesShare = Math.min(0.98, yesShare + 0.03);
          }
        }

        const y = Math.round(pt.seats * yesShare);
        const n = pt.seats - y;
        yesVotes += y;
        noVotes += n;
        if (pt.seats >= 5) breakdown.push(`${pt.short}: ${y} SÌ / ${n} NO`);
      });

      const passed = yesVotes >= 201;
      if (passed) {
        game.lawStates[law.id] = targetIdx;
        // Punto 3 (v6.2.1): Moratoria legislativa di 180 giorni dopo l'approvazione di una legge per impedire cambi continui avanti e indietro!
        game.lawCooldowns[law.id] = game.turn + 180;
        if (opt.eff) opt.eff(game);
        game.leader.prestige = Math.min(100, game.leader.prestige + 7);
        recalcPolls(true);
        addFeed(`🏛️ <strong>RIFORMA APPROVATA DAL PARLAMENTO (${yesVotes} SÌ - ${noVotes} NO):</strong> Cambia la legge italiana su <em>"${law.title}"</em> → <strong>${opt.status}</strong>! (Moratoria legislativa: 180 giorni)`, 'ok');
      } else {
        // Se bocciato, il regolamento della Camera impedisce di ripresentare lo stesso DDL per 90 giorni
        game.lawCooldowns[law.id] = game.turn + 90;
        addFeed(`❌ <strong>DDL BOCCIATO DALL'AULA (${yesVotes} SÌ - ${noVotes} NO):</strong> La proposta di ${game.leader.name} su <em>"${law.title}"</em> viene respinta a Montecitorio (Non riproponibile in Aula per 90 giorni).`, 'cr');
      }

      openModal(
        passed ? `🏛️ Legge Approvata: ${law.title}` : `❌ DDL Respinto in Aula: ${law.title}`,
        `<div style="font-size:13px; color:var(--text);">
          Proposta messa ai voti: <strong style="color:var(--gold-lt);">${opt.status}</strong><br>
          <span style="color:var(--muted); font-size:12px;">${opt.label}</span>
          ${!isInd && myDist >= 2 ? `<div style="margin-top:6px; padding:6px 8px; border-radius:6px; background:rgba(239,68,68,0.16); border:1px solid #ef4444; color:#fca5a5; font-size:11.5px;">⚠️ <strong>Ribellione del Gruppo Parlamentare ${p.short}:</strong> poiché il DDL era contrario al Programma vigente del partito su <em>${dTitle}</em>, i deputati di ${p.short} hanno votato in massa CONTRO (-12% Fiducia Base)!</div>` : ''}
          <div style="display:flex; justify-content:space-around; background:rgba(8,13,24,0.85); border:1px solid var(--bd); border-radius:9px; padding:12px; margin:12px 0;">
            <div style="text-align:center;"><div style="font-size:11px; color:var(--muted);">FAVOREVOLI (SÌ)</div><div style="font-size:24px; font-weight:900; color:#34d399;">${yesVotes}</div></div>
            <div style="text-align:center;"><div style="font-size:11px; color:var(--muted);">QUORUM AULA</div><div style="font-size:20px; font-weight:700; color:var(--gold-lt);">201</div></div>
            <div style="text-align:center;"><div style="font-size:11px; color:var(--muted);">CONTRARI (NO)</div><div style="font-size:24px; font-weight:900; color:#f87171;">${noVotes}</div></div>
          </div>
          <div style="font-size:11px; color:var(--muted);"><strong>Spaccato Voti Gruppi (in base al Programma di ciascun partito su ${dTitle}):</strong><br>${breakdown.join(' • ')}</div>
        </div>`,
        [{ label: "Chiudi Tabellone Elettronico", fn: () => { closeModal(); updateAllUI(); } }]
      );
      updateAllUI();
    }

    /* PUNTO 4 (v6.2): INDIZIONE DEL REFERENDUM CON 30 GIORNI DI CAMPAGNA REFERENDARIA E COOLDOWN DI 365 GIORNI */
export function launchHotLawReferendum(lawId, targetIdx) {
      if (game.isImprisoned) { alert("Sei detenuto a Rebibbia!"); return; }
      if (game.activeReferendum) {
        alert(`⏳ C'è già una Campagna Referendaria nazionale in corso su "${game.activeReferendum.title}" (urne tra ${game.activeReferendum.daysLeft} giorni)! Attendi lo scrutinio prima di depositare un nuovo quesito.`);
        return;
      }
      const cdLeft = Math.max(0, (game.referendumCooldowns[lawId] || 0) - game.turn);
      if (cdLeft > 0) {
        alert(`⛔ Non puoi indire un nuovo referendum su questo stesso tema subito dopo averne celebrato uno! Per legge costituzionale devono trascorrere almeno 365 giorni (ancora ${cdLeft} giorni).`);
        return;
      }
      const lawCdLeft = Math.max(0, (game.lawCooldowns[lawId] || 0) - game.turn);
      if (lawCdLeft > 0) {
        alert(`⏳ Questa legge è appena stata modificata dal Parlamento! Devono trascorrere ancora ${lawCdLeft} giorni di moratoria prima di poter indire un referendum abrogativo sulla nuova norma.`);
        return;
      }
      const law = HOT_LAWS.find(l => l.id === lawId);
      if (!law) return;
      if (game.ap < 30 || game.funds < 45) {
        alert("Servono € 45k e 30 ⚡ per raccogliere 500.000 firme autenticate e aprire i 30 giorni di Campagna Referendaria!");
        return;
      }
      if (!useTurnAction('launch_ref', 'Indizione Referendum Popolare')) return;
      game.ap -= 30;
      game.funds -= 45;

      const opt = law.options.find(o => o.idx === targetIdx);
      if (!opt) return;
      const targetStance = opt.targetStance ?? 2;

      let weightedSupport = 0;
      let totalWeight = 0;
      game.parties.forEach(pt => {
        const ptStance = pt.stances[law.dossier] ?? Math.round(getPartyIdeoScore(pt));
        const dist = Math.abs(ptStance - targetStance);
        const s = dist === 0 ? 82 : (dist === 1 ? 58 : (dist === 2 ? 32 : 12));
        weightedSupport += s * pt.poll;
        totalWeight += pt.poll;
      });
      const leaderBonus = (game.leader.prestige - 55) * 0.14;
      const initYesPct = Math.max(24, Math.min(74, +(weightedSupport / Math.max(1, totalWeight) + leaderBonus).toFixed(1)));

      const curOpt = law.options.find(o => o.idx === (game.lawStates[law.id] ?? law.currentIdx)) || law.options[0];
      const isGovSponsored = !!(p.inGov || game.currentPM === game.leader.name || getPlayerMinistry());
      game.activeReferendum = {
        kind: 'law',
        lawId: law.id,
        targetIdx: targetIdx,
        cooldownKey: law.id,
        title: law.title,
        targetLabel: `${opt.status} (${opt.label})`,
        currentLabel: `${curOpt.status} (${curOpt.label})`,
        yesExplanation: `Introduce la riforma: "${opt.status}" — ${opt.label}`,
        noExplanation: `Mantiene la normativa attuale: "${curOpt.status}" — ${curOpt.label}`,
        sponsoredByGov: isGovSponsored,
        daysLeft: 30,
        yesPct: initYesPct,
        ralliesUsed: 0,
        maxRallies: 3
      };

      const rr = document.getElementById('refRibbon');
      if (rr) rr.style.display = 'block';

      addFeed(`🗳️ <strong>INDETTO REFERENDUM POPOLARE SU "${law.title.toUpperCase()}"!</strong> La Cassazione convalida le 500.000 firme: parte la <strong>Campagna Referendaria di 30 giorni</strong> verso <em>${opt.status}</em> (SÌ iniziale nei sondaggi: ${initYesPct}%)!`, 'ok');
      setTicker(`CAMPAGNA REFERENDARIA (30 GIORNI): Urne convocate su "${law.title}" (${opt.status})!`);
      updateAllUI();
    }

    // =========================================================================
    // TAB 5: PARTITI, COALIZIONI, VETI DINAMICI & MESSA FUORILEGGE IN DITTATURA
    // =========================================================================

export function requestJoinExistingCoalition(targetCoalId) {
      if (game.isImprisoned || game.partyRole === 'independent') return;
      if (game.ap < 20) { alert("Servono 20 ⚡ per negoziare l'ingresso al tavolo della coalizione!"); return; }
      const p = getP();
      const vote = checkCoalitionAdmissionVote(targetCoalId, p);
      if (!vote.approved) {
        alert(`⛔ Richiesta d'ingresso in ${getCoalName(targetCoalId)} respinta!\nMotivo: ${vote.reason}`);
        return;
      }
      if (!useTurnAction('join_coal_' + targetCoalId, `Ingresso in ${getCoalName(targetCoalId)}`)) return;
      game.ap -= 20;
      p.coalId = targetCoalId;
      addFeed(`🤝 <strong>INGRESSO IN COALIZIONE:</strong> Con il voto favorevole degli alleati, <strong>${p.name}</strong> entra ufficialmente in <strong>${getCoalName(targetCoalId)}</strong>!`, 'ok');
      updateAllUI();
    }

export function expelCoalitionMember(allyId) {
      if (game.isImprisoned || game.partyRole === 'independent') return;
      const p = getP();
      const ally = game.parties.find(x => x.id === allyId);
      if (!ally || ally.coalId !== p.coalId) return;
      if (!useTurnAction('expel_' + allyId, `Espulsione di ${ally.short}`)) return;
      const cName = getCoalName(p.coalId);
      ally.coalId = 'none';
      if (ally.inGov && p.inGov) {
        ally.inGov = false;
        game.govStability = Math.max(10, game.govStability - 18);
      }
      setBetrayal(p.id, ally.id, 730, `Espulsione di ${ally.short} da ${cName} decisa da ${game.leader.name}`);
      addFeed(`🚨 <strong>ESPULSIONE DAL POLO:</strong> ${game.leader.name} espelle <strong>${ally.name} (${ally.short})</strong> da <strong>${cName}</strong>!`, 'cr');
      updateAllUI();
    }

export function outlawPartyByRegime(targetId) {
      if (!game.isDictatorship) return;
      if (game.ap < 15) { alert("Servono 15 ⚡ per firmare il Decreto di Scioglimento e Messa Fuorilegge!"); return; }
      const target = game.parties.find(x => x.id === targetId);
      if (!target) return;
      game.ap -= 15;
      const p = getP();
      const revoltHit = Math.max(2, Math.round(target.poll * 0.8));
      game.funds += 35;
      game.revoltRisk = Math.min(100, game.revoltRisk + revoltHit);
      game.outlawedParties.push({ id: target.id, name: target.name, short: target.short, leader: target.leader });
      const gainedSeats = target.seats;
      dissolveParty(target, `Messo fuori legge e sciolto dal Regime di ${game.leader.name} (seggi e beni confiscati)`, p);
      recalcPolls(true);
      addFeed(`🚫 <strong>PARTITO MESSO FUORI LEGGE:</strong> Il Tribunale Speciale scioglie <strong>${target.name} (${target.short})</strong>! Confiscati +€ 35k e assegnati +${gainedSeats} seggi a ${p.short}. I militanti di ${target.leader} entrano in clandestinità (+${revoltHit}% Rischio Rivolta).`, 'cr');
      if (game.revoltRisk >= 100) triggerRegimeOverthrow();
      updateAllUI();
    }

export function outlawAllOppositionParties() {
      if (!game.isDictatorship) return;
      if (game.ap < 40) { alert("Servono 40 ⚡ per promulgare il Decreto sul Partito Unico!"); return; }
      const p = getP();
      const others = game.parties.filter(x => x.id !== p.id);
      if (others.length === 0) return;
      game.ap -= 40;
      let totalRevolt = 0;
      others.forEach(target => {
        totalRevolt += Math.round(target.poll * 0.55);
        game.funds += 15;
        game.outlawedParties.push({ id: target.id, name: target.name, short: target.short, leader: target.leader });
        dissolveParty(target, `Messo fuori legge col Decreto sul Partito Unico di ${game.leader.name}`, p);
      });
      p.seats = 400;
      p.poll = 100.0;
      game.revoltRisk = Math.min(98, game.revoltRisk + Math.max(12, totalRevolt));
      addFeed(`🦅 <strong>DECRETO SUL PARTITO UNICO:</strong> ${game.leader.name} mette fuori legge tutti i partiti d'opposizione! <strong>${p.name}</strong> detiene ora tutti i 400 seggi dell'Assemblea Nazionale (Rischio Rivolta salito al ${game.revoltRisk}%).`, 'cr');
      updateAllUI();
    }

export function renamePlayerCoalition() {
      const p = getP();
      const inp = document.getElementById('customCoalInput');
      if (!inp || !inp.value.trim()) return;
      const newName = inp.value.trim();
      if (p.coalId === 'none') {
        const cid = 'coal_' + p.id;
        game.coalitions[cid] = { id: cid, name: newName };
        p.coalId = cid;
        addFeed(`🤝 <strong>NUOVA COALIZIONE:</strong> ${game.leader.name} fonda la coalizione <strong>"${newName}"</strong>!`, 'ok');
      } else if (game.coalitions[p.coalId]) {
        const leader = getCoalLeaderParty(p.coalId);
        if (leader && leader.id !== p.id) {
          openModal("Azione non consentita", `<p>Soltanto il partito capofila della coalizione (<strong>${leader.name}</strong>, ${leader.poll.toFixed(1)}%) ha il rango e l'autorità politica per modificarne la denominazione ufficiale.</p>`);
          return;
        }
        game.coalitions[p.coalId].name = newName;
        addFeed(`🤝 <strong>NUOVO NOME DEL POLO:</strong> ${game.leader.name} ribattezza ufficialmente la coalizione in <strong>"${newName}"</strong>!`, 'ok');
      }
      updateAllUI();
    }

export function leaveCurrentCoalition() {
      const p = getP();
      const oldC = getCoalName(p.coalId);
      p.coalId = 'none';
      if (p.inGov) {
        p.inGov = false;
        game.govStability = Math.max(10, game.govStability - 30);
      }
      addFeed(`🚪 <strong>ROTTURA D'ALLEANZA:</strong> ${p.name} lascia <strong>${oldC}</strong> e corre come forza autonoma!`);
      checkAndTriggerPremierDefectionCrisis(p, "Uscita dalla coalizione di maggioranza");
      updateAllUI();
    }

export function diploAct(targetId, mode) {
      if (game.isImprisoned) return;
      const p = getP();
      const o = game.parties.find(x => x.id === targetId);
      if (!o) return;
      if (mode === 'summit') {
        if (game.ap < 12) { alert("Servono 12 ⚡!"); return; }
        if (!useTurnAction(`diplo_summit_${targetId}`, `Vertice con ${o.short}`)) return;
        game.ap -= 12;
        adjPairRel(p.id, o.id, 12);
        recalcDynamicVetoes();
        addFeed(`🤝 Vertice bilaterale tra ${game.leader.name} e ${o.leader} (${o.short}): +12 relazione bilaterale.`);
      } else if (mode === 'liftVeto') {
        if (game.ap < 20) { alert("Servono 20 ⚡ per siglare il Patto di Disgelo!"); return; }
        if (!useTurnAction(`diplo_lift_${targetId}`, `Patto di Disgelo con ${o.short}`)) return;
        game.ap -= 20;
        p.vetoes = (p.vetoes || []).filter(v => v !== o.id);
        o.vetoes = (o.vetoes || []).filter(v => v !== p.id);
        if (game.betrayalMemory[p.id]) delete game.betrayalMemory[p.id][o.id];
        if (game.betrayalMemory[o.id]) delete game.betrayalMemory[o.id][p.id];
        adjPairRel(p.id, o.id, 18);
        addFeed(`🕊️ <strong>PATTO DI DISGELO STORICO:</strong> Grazie alla convergenza programmatica, <strong>${p.short}</strong> e <strong>${o.short}</strong> rimuovono ufficialmente i veti incrociati!`);
      } else if (mode === 'attack') {
        if (game.ap < 10) { alert("Servono 10 ⚡!"); return; }
        if (!useTurnAction(`diplo_attack_${targetId}`, `Attacco politico a ${o.short}`)) return;
        game.ap -= 10;
        adjPairRel(p.id, o.id, -15);
        game.leader.prestige = Math.min(100, game.leader.prestige + 2);
        recalcPolls(true);
        addFeed(`⚔️ Duro scontro politico tra ${game.leader.name} e ${o.leader} (${o.short}): cala il feeling ma si compatta la base.`);
      } else if (mode === 'invite') {
        if (game.ap < 22) { alert("Servono 22 ⚡!"); return; }
        const comp = computeCompat(p, o);
        if (comp.vetoed) {
          alert(`❌ INVITO RESPINTO: Tra ${p.short} e ${o.short} vige un veto insormontabile! Sigla prima un Patto di Disgelo.`);
          return;
        }
        if (comp.score < 48) {
          alert(`❌ INVITO RESPINTO: L'affinità programmatica tra ${p.short} e ${o.short} è insufficiente (${comp.score}%). Serve almeno il 48% di convergenza sui dossier chiave per federarsi.`);
          return;
        }
        if (o.coalId !== 'none') {
          const curLead = getCoalLeaderParty(o.coalId);
          const curRel = curLead ? getPairRel(o.id, curLead.id) : 60;
          const myRel = getPairRel(o.id, p.id);
          if (curRel > myRel + 8 && (game.allySatisfaction[o.id] || 70) >= 50) {
            alert(`❌ INVITO RESPINTO: ${o.leader} rifiuta l'invito: ${o.short} è fedele all'alleanza "${getCoalName(o.coalId)}" (Relazione con alleati: ${curRel} vs con te: ${myRel}). Riduci la compatibilità dei loro vertici o intensifica i contatti bilaterali prima di riprovare.`);
            return;
          }
        }
        if (!useTurnAction(`diplo_invite_${targetId}`, `Patto di Coalizione con ${o.short}`)) return;
        game.ap -= 22;
        if (p.coalId === 'none') {
          const cid = 'coal_' + p.id;
          game.coalitions[cid] = { id: cid, name: `Alleanza ${p.short}-${o.short}` };
          p.coalId = cid;
        }
        o.coalId = p.coalId;
        addFeed(`🎉 <strong>PATTO DI COALIZIONE:</strong> ${o.name} entra ufficialmente in <strong>${getCoalName(p.coalId)}</strong>!`);
      }
      updateAllUI();
    }

    // =========================================================================
    // TAB 6: CONSIGLIO DEI 15 MINISTRI, DICASTERO DEL GIOCATORE & PRESIDENTI DI CAMERA E SENATO (PUNTI 2, 16, 17)
    // =========================================================================

export function playerMinistryAction(mode) {
      const myMin = getPlayerMinistry();
      if (!myMin || game.isImprisoned) return;
      const p = getP();
      if (mode === 'directive') {
        if (game.ap < 18) { alert("Servono 18 ⚡!"); return; }
        if (!useTurnAction('min_directive', 'Direttiva Ministeriale')) return;
        game.ap -= 18;
        game.leader.prestige = Math.min(100, game.leader.prestige + 5);
        if (p.id !== 'ind') {
          shiftBloc(p.id, 'impiegati', 4);
          shiftBloc(p.id, 'manager', 4);
        }
        addFeed(`💼 <strong>DIRETTIVA DEL ${myMin.ministry.name.toUpperCase()}:</strong> Il Ministro <strong>${game.leader.name}</strong> firma un decreto attuativo di grande impatto (+5% Prestigio e +consenso)!`, 'ok');
      } else if (mode === 'funds') {
        if (game.ap < 20 || game.funds < 25) { alert("Servono € 25k e 20 ⚡!"); return; }
        if (!useTurnAction('min_funds', 'Sblocco Cantieri del Ministero')) return;
        game.ap -= 20;
        game.funds -= 25;
        game.gdp = Math.min(3.5, +(game.gdp + 0.08).toFixed(2));
        game.govStability = Math.min(100, game.govStability + 4);
        addFeed(`🏗️ <strong>PIANO D'INVESTIMENTO DEL ${myMin.ministry.name.toUpperCase()}:</strong> Il Ministro <strong>${game.leader.name}</strong> sblocca i cantieri del dicastero (+0.08% PIL, +4% Stabilità)!`, 'ok');
      } else if (mode === 'media') {
        if (game.ap < 14) { alert("Servono 14 ⚡!"); return; }
        if (!useTurnAction('min_media', 'Conferenza Stampa al Ministero')) return;
        game.ap -= 14;
        if (p.id !== 'ind') p.credibility = Math.min(100, (p.credibility || 75) + 4);
        game.leader.prestige = Math.min(100, game.leader.prestige + 3);
        recalcPolls(true);
        addFeed(`🎙️ <strong>CONFERENZA STAMPA AL ${myMin.ministry.name.toUpperCase()}:</strong> Il Ministro <strong>${game.leader.name}</strong> presenta i risultati del dicastero (+4% Credibilità).`);
      }
      updateAllUI();
    }

export function callSpeakerElectionVote(chamberType) {
      if (game.isImprisoned) return;
      const selEl = document.getElementById(chamberType === 'senate' ? 'selCandSenate' : 'selCandChamber');
      if (!selEl || !selEl.value) return;
      const pol = POLITICIANS.find(x => x.id === selEl.value);
      if (!pol) return;

      const curSpeaker = chamberType === 'senate' ? game.senateSpeaker : game.chamberSpeaker;
      if (curSpeaker && curSpeaker.id === pol.id) {
        alert(`${pol.name} ricopre già questa carica!`);
        return;
      }

      // Punto 2 v6.2: Controllo rigoroso contro il cumulo delle cariche!
      const conflict = getPersonCurrentOffice(pol, chamberType, false);
      if (conflict) {
        alert(`⛔ Cumulo delle cariche vietato! ${pol.name} ricopre già l'incarico di "${conflict}". Scegli una personalità libera da altri incarichi istituzionali o ministeriali!`);
        renderMinTab();
        return;
      }

      const cost = game.isDictatorship ? 15 : 25;
      if (game.ap < cost) { alert(`Servono ${cost} ⚡ per convocare l'Aula ed eleggere il nuovo Presidente!`); return; }
      if (!useTurnAction('speaker_vote_' + chamberType, `Voto Presidente ${chamberType==='senate'?'Senato':'Camera'}`)) return;
      game.ap -= cost;

      if (game.isDictatorship) {
        if (chamberType === 'senate') game.senateSpeaker = { id: pol.id, name: pol.name, age: pol.age, partyId: pol.partyId };
        else game.chamberSpeaker = { id: pol.id, name: pol.name, age: pol.age, partyId: pol.partyId };
        addFeed(`🦅 <strong>NOMINA DEL REGIME:</strong> <strong>${pol.name}</strong> insediato alla guida ${chamberType==='senate'?'del Senato':'della Camera'}.`);
        updateAllUI();
        return;
      }

      // Reazione del partito a cui viene tolta la Presidenza di Camera o Senato
      const oldPartyId = curSpeaker?.partyId;
      if (oldPartyId && oldPartyId !== pol.partyId) {
        game.allySatisfaction[oldPartyId] = Math.max(15, (game.allySatisfaction[oldPartyId] ?? 75) - 22);
        adjPairRel(game.playerPartyId, oldPartyId, -18);
      }

      // Scrutinio segreto in Aula (su 400 equivalenti parlamentari): i partiti di maggioranza votano in base alla loro soddisfazione Cencelli
      let yesVotes = 0;
      let blankOrOppVotes = 0;
      game.parties.forEach(pt => {
        if (!pt.seats) return;
        if (pt.inGov) {
          const sat = game.allySatisfaction[pt.id] ?? 78;
          const loyaltyRate = pt.id === pol.partyId ? 0.96 : Math.max(0.45, Math.min(0.94, sat / 100));
          const y = Math.round(pt.seats * loyaltyRate);
          yesVotes += y;
          blankOrOppVotes += (pt.seats - y);
        } else {
          blankOrOppVotes += pt.seats;
        }
      });

      const passed = yesVotes >= 201;
      const chamberTitle = chamberType === 'senate' ? 'Presidente del Senato (Palazzo Madama)' : 'Presidente della Camera (Montecitorio)';
      const candParty = game.parties.find(x => x.id === pol.partyId);

      if (passed) {
        if (chamberType === 'senate') game.senateSpeaker = { id: pol.id, name: pol.name, age: pol.age, partyId: pol.partyId };
        else game.chamberSpeaker = { id: pol.id, name: pol.name, age: pol.age, partyId: pol.partyId };
        if (pol.partyId) game.allySatisfaction[pol.partyId] = Math.min(100, (game.allySatisfaction[pol.partyId] ?? 75) + 12);
        recordPoliticianHistory(pol.name, `Eletto ${chamberTitle} con ${yesVotes} voti a scrutinio segreto`, chamberType === 'senate' ? 'Presidente del Senato' : 'Presidente della Camera');
        addFeed(`🏛️ <strong>FUMATA BIANCA A SCRUTINIO SEGRETO (${yesVotes} voti su 400):</strong> <strong>${pol.name} (${candParty?.short||'Magg.'})</strong> è eletto nuovo <strong>${chamberTitle}</strong>!`, 'ok');
      } else {
        game.govStability = Math.max(10, game.govStability - 14);
        addFeed(`❌ <strong>FUMATA NERA E FRANCHI TIRATORI (${yesVotes} voti, quorum 201):</strong> La maggioranza va sotto nello scrutinio segreto per eleggere ${pol.name} come ${chamberTitle}! Resta in carica ${curSpeaker?.name}.`, 'cr');
      }

      openModal(
        passed ? `🏛️ Fumata Bianca: Eletto ${pol.name}` : `❌ Fumata Nera nello Scrutinio Segreto`,
        `<div style="font-size:13px; color:var(--text);">
          Scrutinio segreto per l'elezione del <strong>${chamberTitle}</strong>:<br>
          Candidato della Maggioranza: <strong style="color:var(--gold-lt);">${pol.name} (${candParty?.name || 'Maggioranza'})</strong>
          <div style="display:flex; justify-content:space-around; background:rgba(8,13,24,0.85); border:1px solid var(--bd); border-radius:9px; padding:12px; margin:12px 0;">
            <div style="text-align:center;"><div style="font-size:11px; color:var(--muted);">VOTI A ${pol.name.toUpperCase()}</div><div style="font-size:24px; font-weight:900; color:${passed?'#34d399':'#f87171'};">${yesVotes}</div></div>
            <div style="text-align:center;"><div style="font-size:11px; color:var(--muted);">QUORUM MAGGIORANZA</div><div style="font-size:20px; font-weight:700; color:var(--gold-lt);">201</div></div>
            <div style="text-align:center;"><div style="font-size:11px; color:var(--muted);">OPPOSIZIONE / FRANCHI TIRATORI</div><div style="font-size:24px; font-weight:900; color:var(--muted);">${blankOrOppVotes}</div></div>
          </div>
          <p style="font-size:12px; color:var(--muted);">${passed ? `${pol.name} sale sullo scranno più alto dell'Assemblea tra gli applausi della maggioranza!` : 'I franchi tiratori dei partiti alleati scontenti hanno affossato la candidatura nel segreto dell’urna (-14% Stabilità di Governo).'}</p>
        </div>`,
        [{ label: "Chiudi", fn: () => { closeModal(); updateAllUI(); } }]
      );
      updateAllUI();
    }

export function assignMin(minId, polId) {
      if (!polId || game.isImprisoned) return;
      // PUNTO 2 (1.8.1): Prerogativa esclusiva del Presidente del Consiglio (Art. 92 Cost.)
      const isPlayerPM = (game.currentPM === game.leader.name || game.currentPM === `${game.leader.name} (Tecnico)`);
      if (!isPlayerPM) {
        alert("❌ PREROGATIVA COSTITUZIONALE ESCLUSIVA (Art. 92 Cost.):\nSolo il Presidente del Consiglio dei Ministri può proporre la nomina e il rimpasto dei Ministri dell'Esecutivo!");
        return;
      }
      if (game.isRetired) {
        alert("❌ MODALITÀ SPETTATORE:\nSei ritirato dalla vita politica attiva e non puoi nominare ministri!");
        return;
      }
      if (game.ap < 12) { alert("Servono 12 ⚡ per un rimpasto ministeriale!"); return; }
      const pol = POLITICIANS.find(x => x.id === polId);
      const mInfo = MINISTRIES.find(m => m.id === minId);
      if (!pol || !mInfo) return;

      // Punto 2 v6.2: Controllo rigoroso contro il cumulo delle cariche!
      const conflict = getPersonCurrentOffice(pol, minId, false);
      if (conflict) {
        alert(`⛔ Cumulo delle cariche vietato! ${pol.name} ricopre già l'incarico di "${conflict}". Ogni personalità può avere una sola carica istituzionale o ministeriale!`);
        renderMinTab();
        return;
      }

      // Verifica che il candidato appartenga davvero alla maggioranza di governo o sia un tecnico
      const candParty = game.parties.find(x => x.id === pol.partyId);
      if (pol.partyId !== 'tech' && (!candParty || !candParty.inGov)) {
        alert("Nella realtà costituzionale non puoi nominare Ministro un esponente di un partito che siede all'Opposizione!");
        return;
      }

      if (!useTurnAction('assign_min_' + minId, `Rimpasto ${mInfo.name}`)) return;

      if (!game.isDictatorship && game.stateForm !== 'presidenziale' && (minId === 'mef' || minId === 'esteri' || minId === 'giustizia') && pol.comp < 68 && game.president.trust < 70 && !game.president.isPlayer) {
        game.president.trust = Math.max(15, game.president.trust - 10);
        alert(`⚠️ ALTOLÀ DEL QUIRINALE (Art. 92 Cost.): Il Presidente della Repubblica ${game.president.name} oppone rilievi costituzionali sulla nomina di ${pol.name} a ${mInfo.name}!`);
        addFeed(`🏛️ <strong>RILIEVO DEL QUIRINALE (Art. 92 Cost.):</strong> Il Presidente della Repubblica blocca la nomina di ${pol.name} a ${mInfo.name}!`, 'cr');
        updateAllUI();
        return;
      }

      const prevMin = game.cabinet[minId];
      if (prevMin && prevMin.partyId && prevMin.partyId !== 'tech' && prevMin.partyId !== pol.partyId) {
        const hit = mInfo.weight * 6;
        game.allySatisfaction[prevMin.partyId] = Math.max(15, (game.allySatisfaction[prevMin.partyId] ?? 78) - hit);
        const oldP = game.parties.find(x => x.id === prevMin.partyId);
        if (oldP) addFeed(`⚠️ <strong>TENSIONE CENCELLI:</strong> ${oldP.short} protesta per la perdita del dicastero ${mInfo.name} (-${hit}% soddisfazione alleato).`, 'cr');
      }
      if (pol.partyId && pol.partyId !== 'tech') {
        game.allySatisfaction[pol.partyId] = Math.min(100, (game.allySatisfaction[pol.partyId] ?? 75) + mInfo.weight * 4);
      }

      game.ap -= 12;
      game.cabinet[minId] = pol;
      recordPoliticianHistory(pol.name, `Nominato ${mInfo.name} (Governo ${game.currentPM})`, mInfo.name);
      if ((minId === 'interni' || minId === 'difesa') && pol.partyId === game.playerPartyId) {
        game.militaryLoyalty = Math.min(95, game.militaryLoyalty + 8);
      }
      addFeed(`🏛️ <strong>RIMPASTO MINISTERIALE:</strong> ${game.stateForm === 'presidenziale' ? 'Per decreto presidenziale diretto' : 'Su proposta del Governo'}, ${pol.name} (${candParty ? candParty.short : 'Tecnico'}) assume l'incarico di Ministro (${mInfo.name}).`);
      updateAllUI();
    }

    // =========================================================================
    // TAB 7: GOVERNO, SLIDER CONTINUI, DECRETI ESECUTIVI PALAZZO CHIGI, STATO & GOLPE

export function updateBudgetPreview() {
      const spend = game.budget.healthSpend + game.budget.investSpend + game.budget.eduSpend + game.budget.pensionSpend;
      const rev = game.budget.taxPressure * 0.72;
      const estDef = +(Math.max(0.8, Math.min(7.5, spend - rev))).toFixed(2);
      const el = document.getElementById('lblEstDeficit');
      if (el) {
        el.innerText = estDef + '%';
        el.style.color = estDef > 4.0 ? '#f87171' : '#34d399';
      }
    }


export function executeGovDecree(decreeId) {
      if (game.isImprisoned) return;
      const p = getP();
      if (!p.inGov) { alert("Solo il Governo in carica può emanare Decreti-Legge da Palazzo Chigi!"); return; }
      const dec = EXEC_DECREES.find(x => x.id === decreeId);
      if (!dec) return;
      if (game.ap < dec.costAP || game.funds < dec.costFunds) {
        alert(`Servono ${dec.costFunds > 0 ? '€ ' + dec.costFunds + 'k e ' : ''}${dec.costAP} ⚡ per varare questo Decreto-Legge!`);
        return;
      }
      if (!useTurnAction('exec_dec_' + decreeId, dec.title)) return;
      game.ap -= dec.costAP;
      game.funds -= dec.costFunds;
      dec.run(game);
      recalcPolls(true);
      addFeed(`🏛️ <strong>CONSIGLIO DEI MINISTRI:</strong> Varato il <strong>${dec.title}</strong> su impulso di ${game.leader.name}!`, 'ok');
      openModal(
        `🏛️ Decreto-Legge Varato a Palazzo Chigi: ${dec.title}`,
        `<div style="font-size:13px; color:var(--text); line-height:1.55;">
          Il Consiglio dei Ministri ha approvato all'unanimità il <strong>${dec.icon} ${dec.title}</strong> su proposta di <strong>${game.leader.name}</strong>.<br><br>
          ${dec.desc}<br><br>
          • Il provvedimento è stato pubblicato in Gazzetta Ufficiale ed entra in vigore immediatamente con forza di legge.
        </div>`,
        [{ label: "Prendi Atto del Decreto", fn: () => { closeModal(); updateAllUI(); } }]
      );
      updateAllUI();
    }

    // --- RIFORME DELL'ORDINAMENTO DELLO STATO (PUNTO 5) ---
export function proposeConstitutionalReform(targetFormId) {
      if (game.isImprisoned) return;
      const sf = STATE_FORMS.find(s => s.id === targetFormId);
      if (!sf) return;
      const cost = game.isDictatorship ? 25 : 35;
      if (game.ap < cost) { alert(`Servono ${cost} ⚡ per avviare la Riforma dell'Ordinamento dello Stato!`); return; }
      if (!useTurnAction('const_ref_' + targetFormId, `Riforma Costituzionale (${sf.name})`)) return;
      game.ap -= cost;

      if (game.isDictatorship) {
        applyStateFormChange(sf);
        addFeed(`🦅 <strong>NUOVO ORDINAMENTO IMPOSTO DAL REGIME:</strong> ${game.leader.name} proclama il passaggio a <strong>${sf.name}</strong>!`);
        updateAllUI();
        return;
      }

      const p = getP();
      let yesSeats = 0;
      let noSeats = 0;

      game.parties.forEach(pt => {
        if (!pt.seats) return;
        const ptInst = pt.stances.inst ?? Math.round(getPartyIdeoScore(pt));
        const dist = Math.abs(ptInst - sf.targetStance);
        let share = 0.08;
        if (pt.id === game.playerPartyId && game.partyRole !== 'independent') share = 0.96;
        else if (pt.coalId === p.coalId && p.coalId !== 'none') share = dist <= 1 ? 0.88 : 0.64;
        else if (dist === 0) share = 0.76;
        else if (dist === 1) share = 0.42;
        else share = 0.05;

        if (game.senateSpeaker?.partyId === game.playerPartyId || game.chamberSpeaker?.partyId === game.playerPartyId) {
          share = Math.min(0.98, share + 0.06);
        }
        const y = Math.round(pt.seats * share);
        yesSeats += y;
        noSeats += (pt.seats - y);
      });

      if (yesSeats >= 267) {
        applyStateFormChange(sf);
        openModal(
          `🏛️ Riforma Costituzionale Approvata coi 2/3 (${yesSeats}/400)!`,
          `<div style="font-size:13px; color:var(--text);">
            Storico voto in Parlamento! Con <strong>${yesSeats} voti favorevoli su 400</strong> (oltre i 2/3 richiesti dall'Art. 138 Cost.), la riforma <strong>"${sf.name}"</strong> entra immediatamente in vigore senza bisogno di Referendum confermativo!<br><br>
            <div style="background:rgba(16,185,129,0.12); border:1px solid #10b981; border-radius:8px; padding:10px;">
              <strong>Nuovo Ordinamento della Repubblica:</strong> ${sf.icon} ${sf.name}<br>
              <span style="font-size:12px; color:var(--muted);">${sf.desc}</span>
            </div>
          </div>`,
          [{ label: "Viva la Nuova Repubblica!", fn: () => { closeModal(); updateAllUI(); } }]
        );
      } else if (yesSeats >= 201) {
        openModal(
          `📜 Approvazione a Maggioranza Assoluta (${yesSeats}/400) — Referendum Costituzionale`,
          `<div style="font-size:13px; color:var(--text);">
            Le Camere hanno approvato la riforma <strong>"${sf.name}"</strong> con <strong>${yesSeats} SÌ e ${noSeats} NO</strong> (maggioranza assoluta, ma sotto la soglia dei 2/3 di 267 deputati).<br><br>
            Ai sensi dell'<strong>Art. 138 della Costituzione</strong>, la riforma passa ora al <strong>Referendum Costituzionale Confermativo</strong> (valido senza quorum).
          </div>`,
          [{ label: "🗳️ Celebra il Referendum Costituzionale", fn: () => { closeModal(); runConstitutionalReferendum(sf, yesSeats); } }]
        );
      } else {
        addFeed(`❌ <strong>RIFORMA COSTITUZIONALE BOCCIATA (${yesSeats} SÌ - ${noSeats} NO):</strong> La proposta di passare a <em>"${sf.name}"</em> si ferma sotto i 201 seggi.`);
        openModal(
          `❌ Riforma Costituzionale Respinta dall'Aula (${yesSeats}/400)`,
          `<p>La proposta di trasformare la Repubblica in <strong>${sf.name}</strong> ha ottenuto <strong>${yesSeats} SÌ</strong> contro <strong>${noSeats} NO</strong> (servivano almeno 201 voti per il Referendum o 267 per l'approvazione diretta).</p>`,
          [{ label: "Chiudi", fn: closeModal }]
        );
      }
      updateAllUI();
    }

export function runConstitutionalReferendum(sf, parlYesSeats) {
      const p = getP();
      const baseYes = (parlYesSeats / 400) * 100;
      const leaderFactor = (game.leader.prestige - 52) * 0.22 + (p.poll - 14) * 0.25;
      const qFactor = (game.president.trust - 55) * 0.12;
      const yesPct = Math.max(24, Math.min(78, +(baseYes + leaderFactor + qFactor + (Math.random() * 8 - 4)).toFixed(1)));
      const noPct = +(100 - yesPct).toFixed(1);
      const passed = yesPct > 50.0;

      if (passed) {
        applyStateFormChange(sf);
        game.leader.prestige = Math.min(100, game.leader.prestige + 12);
        addFeed(`🗳️ <strong>TRIONFO AL REFERENDUM COSTITUZIONALE (${yesPct}% SÌ):</strong> I cittadini approvano il passaggio a <strong>${sf.name}</strong>!`);
      } else {
        game.leader.prestige = Math.max(15, game.leader.prestige - 10);
        if (p.inGov) game.govStability = Math.max(15, game.govStability - 20);
        addFeed(`🗳️ <strong>REFERENDUM COSTITUZIONALE BOCCIATO (${noPct}% NO):</strong> Gli elettori respingono la riforma <em>"${sf.name}"</em>.`);
      }

      openModal(
        passed ? `🎉 Referendum Costituzionale Approvato (${yesPct}% SÌ)!` : `❌ Referendum Costituzionale Respinto (${noPct}% NO)`,
        `<div style="font-size:13px; color:var(--text);">
          Quesito Costituzionale: <strong>Passaggio a ${sf.icon} ${sf.name}</strong>
          <div style="display:flex; justify-content:space-around; background:rgba(8,13,24,0.85); border:1px solid var(--bd); border-radius:9px; padding:12px; margin:12px 0;">
            <div style="text-align:center;"><div style="font-size:11px; color:var(--muted);">SÌ (RIFORMA)</div><div style="font-size:26px; font-weight:900; color:#34d399;">${yesPct}%</div></div>
            <div style="text-align:center;"><div style="font-size:11px; color:var(--muted);">NO (STATUS QUO)</div><div style="font-size:26px; font-weight:900; color:#f87171;">${noPct}%</div></div>
          </div>
          <p style="font-size:12px; color:var(--muted);">${passed ? `Entra ufficialmente in vigore il nuovo ordinamento: <strong>${sf.name}</strong>!` : 'La riforma viene respinta dagli elettori; resta in vigore l’attuale assetto costituzionale.'}</p>
        </div>`,
        [{ label: "Chiudi", fn: () => { closeModal(); updateAllUI(); } }]
      );
      updateAllUI();
    }

export function applyStateFormChange(sfOrId) {
      const sf = typeof sfOrId === 'string' ? (STATE_FORMS.find(x => x.id === sfOrId) || { id: sfOrId, name: sfOrId }) : sfOrId;
      if (!sf) return;
      game.stateForm = sf.id;
      if (sf.id === 'presidenziale') {
        // PUNTO 21 (1.7): Nella Repubblica Presidenziale il Presidente della Repubblica e il Capo dell'Esecutivo si unificano!
        game.govStability = Math.min(100, game.govStability + 18);
        game.isTechnicalGov = false;
        const p = getP();
        if (p.inGov || game.currentPM === game.leader.name || game.president.isPlayer) {
          vacateOfficesForPresident(game.leader.name);
          game.president.name = game.leader.name;
          game.president.age = game.leader.age;
          game.president.area = `Presidente della Repubblica e Capo dell'Esecutivo (${p.short || 'Eletto'})`;
          game.president.isPlayer = true;
          game.currentPM = game.leader.name;
          recordPoliticianHistory(game.leader.name, `Assume la guida unificata di Presidente della Repubblica e Capo dell'Esecutivo (Riforma Presidenziale)`, `Presidente della Repubblica`);
        } else {
          game.president.name = game.currentPM.replace(/\s*\(Tecnico\)/i, '');
          game.president.area = `Presidente della Repubblica e Capo dell'Esecutivo`;
          game.president.isPlayer = false;
        }
        addFeed(`🦅 <strong>REPUBBLICA PRESIDENZIALE IN VIGORE:</strong> Unificati i ruoli di Presidente della Repubblica e Capo dell'Esecutivo (${game.president.name})! Abolita la fiducia parlamentare (separazione dei poteri): il Presidente nomina e revoca direttamente i Segretari di Stato/Ministri.`);
      } else if (sf.id === 'premierato') {
        game.govStability = Math.min(100, game.govStability + 15);
        game.isTechnicalGov = false;
        addFeed(`👑 <strong>PREMIERATO ELETTIVO IN VIGORE:</strong> Elezione diretta del Primo Ministro con premio di governabilità del 55%, divieto di governi tecnici e ribaltoni (norma antiribaltone <em>simul stabunt, simul cadent</em>)!`);
      } else if (sf.id === 'cancellierato') {
        game.govStability = Math.min(100, game.govStability + 15);
        addFeed(`⚖️ <strong>CANCELLIERATO IN VIGORE:</strong> Introdotta la <strong>Sfiducia Costruttiva</strong>: il Parlamento può sfiduciare il Cancelliere solo eleggendone contestualmente un altro a maggioranza assoluta!`);
      } else if (sf.id === 'federale') {
        game.gdp = Math.min(3.5, +(game.gdp + 0.3).toFixed(2));
        game.lawStates['law_autonomy'] = 2;
        addFeed(`🏛️ <strong>REPUBBLICA FEDERALE DELLE AUTONOMIE IN VIGORE:</strong> Devoluzione fiscale e legislativa alle 20 Regioni e Senato Federale delle Regioni!`);
      } else {
        addFeed(`🇮🇹 <strong>REPUBBLICA PARLAMENTARE CLASSICA IN VIGORE:</strong> Ripristinato il modello costituzionale del 1948.`);
      }
    }

    // --- GOLPE, SCIOGLIMENTO PARTITO EVERSIVO & PROCESSO PERSONALE (PUNTI 4, 8, 17) ---
export function prepareCoupAction(type) {
      if (game.isImprisoned) return;
      if (type === 'security') {
        if (game.ap < 22 || game.funds < 45) { alert("Servono € 45k e 22 ⚡ per infiltrare i vertici degli apparati di sicurezza!"); return; }
        if (!useTurnAction('coup_prep_sec', 'Infiltra Apparati Sicurezza')) return;
        game.ap -= 22;
        game.funds -= 45;
        game.militaryLoyalty = Math.min(95, game.militaryLoyalty + 12);
        addFeed(`🪖 <strong>DOSSIER RISERVATO:</strong> Contatti segreti con alti gradi delle Forze Armate portano la fedeltà degli apparati al ${game.militaryLoyalty}%.`);
      } else {
        if (game.ap < 18) { alert("Servono 18 ⚡!"); return; }
        if (!useTurnAction('coup_prep_mil', 'Mobilitazione Piazze & Milizie')) return;
        game.ap -= 18;
        game.militaryLoyalty = Math.min(95, game.militaryLoyalty + 7);
        addFeed(`🔥 <strong>MOBILITAZIONE RADICALE:</strong> Comitati d'azione e militanti presidiano le piazze strategiche della Capitale.`);
      }
      updateAllUI();
    }

export function attemptCoupDetat(chance) {
      if (game.isImprisoned) { alert("Sei detenuto nel Carcere di Rebibbia! Non puoi tentare un colpo di Stato dalla cella."); return; }
      if (game.ap < 45) { alert("Servono 45 ⚡ per lanciare un Colpo di Stato!"); return; }
      game.ap -= 45;

      const p = getP();
      const pIdeo = getPartyIdeoScore(p);
      const isModerate = (pIdeo > 1.25 && pIdeo < 2.75);
      const roll = Math.random() * 100;

      if (roll <= chance) {
        // GOLPE RIUSCITO -> DITTATURA (Punti 4 & 17)
        game.isDictatorship = true;
        game.isImprisoned = false;
        game.prisonDaysLeft = 0;
        game.prisonReason = null;
        game.imprisonedLeader = null;
        game.inExile = false;
        game.dictatorshipName = pIdeo <= 1.2 ? `Repubblica Popolare Rivoluzionaria (${p.short})` : `Stato Nazionale d'Eccezione (${p.short})`;
        game.parties.forEach(pt => pt.inGov = (pt.id === p.id));
        game.currentPM = game.leader.name;
        game.currentGovCoalId = p.coalId;
        game.govStability = 95;
        game.revoltRisk = p.poll >= 25 ? 16 : 46;
        game.militaryLoyalty = Math.max(68, game.militaryLoyalty + 15);
        game.foreignRels.eu_com = Math.max(5, (game.foreignRels.eu_com || 70) - 45);
        game.foreignRels.usa = Math.max(10, (game.foreignRels.usa || 70) - 30);
        game.spread = Math.min(550, game.spread + 75);

        addFeed(`🦅 <strong>COLPO DI STATO RIUSCITO A ROMA!</strong> ${game.leader.name} (${p.short}) occupa Palazzo Chigi, il Viminale e la RAI, esautora le Camere e instaura <strong>${game.dictatorshipName}</strong>!`);
        openModal(
          "🦅 COLPO DI STATO RIUSCITO — INSTAURAZIONE DELLA DITTATURA",
          `<div style="font-size:13px; color:var(--text);">
            Nella notte i reparti fedeli e i militanti di <strong>${p.name}</strong> hanno preso il controllo di Palazzo Chigi, Montecitorio e delle reti televisive.<br><br>
            Hai sospeso le garanzie costituzionali e instaurato <strong>${game.dictatorshipName}</strong>.<br>
            <ul style="font-size:12px; color:var(--muted); margin:8px 0;">
              <li><strong>Nuovi Poteri nei Menu:</strong> Nella scheda <em>Partiti & Coalizioni</em> puoi ora <strong>mettere fuori legge gli altri partiti</strong> e confiscarne i seggi; nella scheda <em>Temi Caldi</em> puoi legiferare per <strong>Decreto Dittatoriale</strong>!</li>
              <li><strong>Consenso Popolare attuale:</strong> ${p.poll.toFixed(1)}% • <strong>Rischio Rivolta:</strong> ${game.revoltRisk}%</li>
              <li><strong>Reazione Internazionale:</strong> Sanzioni da Bruxelles e Washington (+75 pt Spread).</li>
            </ul>
          </div>`,
          [
            { label: "🦅 Assumi i Pieni Poteri (Mantieni Opposizioni Vigilate)", fn: () => { closeModal(); updateAllUI(); } },
            { label: "🚫 Emana Subito il Decreto di Partito Unico (Metti Fuori Legge Tutti i Partiti!)", fn: () => { closeModal(); game.ap += 40; outlawAllOppositionParties(); } }
          ]
        );
      } else {
        // GOLPE FALLITO -> SCIOGLIMENTO E MESSA FUORILEGGE DEL PARTITO EVERSIVO + ARRESTO PERSONALE DEL LEADER!
        const whyFailed = isModerate
          ? `Essendo <strong>${p.name}</strong> un partito moderato/centrista, i cittadini e le Forze Armate si sono rifiutati di appoggiare un'avventura eversiva nonostante il tuo ${p.poll.toFixed(1)}% nei sondaggi!`
          : `I reparti fedeli alla Costituzione e al Quirinale hanno circondato i palazzi romani e sventato il tentativo eversivo.`;

        addFeed(`🚓 <strong>GOLPE FALLITO A ROMA!</strong> Il tentativo di colpo di Stato di ${game.leader.name} viene sventato dall'Esercito e dai Carabinieri! La Magistratura dispone lo <strong>scioglimento immediato di ${p.name} per eversione</strong> e l'arresto di ${game.leader.name}!`, 'cr');
        openFailedCoupTrialModal(whyFailed);
      }
      updateAllUI();
    }

export function openFailedCoupTrialModal(whyFailed) {
      const oldP = getP();
      const oldPartyName = oldP && oldP.id !== 'ind' ? oldP.name : "Movimento Eversivo";
      const canExileRussia = (game.foreignRels.russia || 18) >= 58;
      const canExileChina = (game.foreignRels.china || 44) >= 68;

      // 1) IL PARTITO CHE HA TENTATO IL GOLPE VIENE IMMEDIATAMENTE MESSO FUORI LEGGE E SCIOLTO!
      if (oldP && oldP.id !== 'ind') {
        game.outlawedParties.push({ id: oldP.id, name: oldP.name, short: oldP.short, leader: game.leader.name });
        dissolveParty(oldP, `Messo fuori legge e sciolto per tentato Colpo di Stato (Art. 283 c.p.) da parte di ${game.leader.name}`);
      }
      game.partyRole = 'independent';
      game.playerPartyId = 'ind';
      game.funds = Math.min(game.funds, 35); // Confisca dei fondi del partito eversivo!
      recalcPolls(true);

      openModal(
        "⚖️ CORTE D'ASSISE DI ROMA — PARTITO MESSO FUORI LEGGE & PROCESSO PER ALTO TRADIMENTO",
        `<div style="font-size:13px; color:var(--text);">
          <div style="background:rgba(239,68,68,0.16); border:1px solid #ef4444; border-radius:8px; padding:10px; margin-bottom:10px;">
            🚓 <strong>GOLPE SVENTATO E PARTITO SCIOLTO:</strong> ${whyFailed}<br><br>
            🚫 Con decreto d'urgenza e sentenza della Magistratura, <strong>${oldPartyName} è stato dichiarato organizzazione eversiva, messo fuori legge e sciolto</strong> (sedi e tesoreria confiscate dallo Stato).<br><br>
            ⛓️ <strong>TU (${game.leader.name})</strong> sei stato arrestato in flagranza per <strong>Attentato contro la Costituzione dello Stato (Art. 283 c.p.)</strong> e <strong>Insurrezione armata (Art. 284 c.p.)</strong>. Il gioco resta legato alla tua persona:
          </div>
          Quale linea adotti davanti alla Corte d'Assise di Roma?
        </div>`,
        [
          {
            label: `⛓️ Reclusione nel Carcere di Rebibbia da Prigioniero Politico Irredento (Condanna a 4 Anni / 1.460 giorni in cella)`,
            fn: () => {
              game.isImprisoned = true;
              game.prisonDaysLeft = 1460;
              game.prisonReason = `Art. 283 c.p. — Tentato Golpe alla guida del disciolto ${oldPartyName}`;
              game.leader.prestige = Math.max(15, game.leader.prestige - 20);
              closeModal();
              addFeed(`⛓️ <strong>CONDANNA E DETENZIONE A REBIBBIA:</strong> <strong>${game.leader.name}</strong> viene tradotto nel carcere di Rebibbia (1.460 giorni di pena) mentre ${oldPartyName} è messo fuori legge!`, 'cr');
              showTab('tCareer', document.querySelectorAll('.nav-item')[0]);
              updateAllUI();
            }
          },
          {
            label: "⚖️ Patteggiamento, Dissociazione Costituzionale & Collaborazione (Pena ridotta a 18 Mesi / 540 giorni, -45% Prestigio)",
            fn: () => {
              game.isImprisoned = true;
              game.prisonDaysLeft = 540;
              game.prisonReason = `Art. 283 c.p. (Patteggiamento e dissociazione) — Ex ${oldPartyName}`;
              game.leader.prestige = Math.max(8, game.leader.prestige - 45);
              closeModal();
              addFeed(`⚖️ <strong>PATTEGGIAMENTO IN CORTE D'ASSISE:</strong> <strong>${game.leader.name}</strong> ripudia il tentativo eversivo ottenendo una condanna ridotta a 540 giorni di detenzione (-45% Prestigio).`, 'cr');
              showTab('tCareer', document.querySelectorAll('.nav-item')[0]);
              updateAllUI();
            }
          },
          ...(canExileRussia || canExileChina ? [{
            label: `✈️ Esfiltrazione Clandestina prima della Sentenza: Fuga in Esilio a ${canExileRussia ? 'Mosca' : 'Pechino'}`,
            fn: () => {
              game.isImprisoned = false;
              game.prisonDaysLeft = 0;
              game.inExile = true;
              game.exileHost = canExileRussia ? "Mosca (Russia)" : "Pechino (Cina)";
              game.leader.prestige = Math.max(12, game.leader.prestige - 25);
              closeModal();
              addFeed(`✈️ <strong>LATITANZA ED ESILIO A ${game.exileHost.toUpperCase()}:</strong> Mentre ${oldPartyName} viene messo fuori legge in Italia, <strong>${game.leader.name}</strong> sfugge alla cattura riparando all'estero!`, 'cr');
              showTab('tCareer', document.querySelectorAll('.nav-item')[0]);
              updateAllUI();
            }
          }] : [])
        ]
      );
    }

export function regimeAction(mode) {
      const p = getP();
      if (mode === 'welfare') {
        if (game.ap < 25 || game.funds < 60) { alert("Servono € 60k e 25 ⚡!"); return; }
        if (!useTurnAction('regime_welfare', 'Decreto Sociale del Regime')) return;
        game.ap -= 25;
        game.funds -= 60;
        p.poll = Math.min(98, +(p.poll + 2.2).toFixed(1));
        game.revoltRisk = Math.max(0, game.revoltRisk - 14);
        addFeed(`🍞 <strong>DECRETO POPOLARE DEL REGIME:</strong> Sussidi straordinari e calmieri sui prezzi aumentano il consenso (+2.2%) e riducono il rischio rivolta al ${game.revoltRisk}%.`);
      } else if (mode === 'propaganda') {
        if (game.ap < 20) { alert("Servono 20 ⚡!"); return; }
        if (!useTurnAction('regime_propaganda', 'Propaganda a Reti Unificate')) return;
        game.ap -= 20;
        p.poll = Math.min(98, +(p.poll + 1.2).toFixed(1));
        game.revoltRisk = Math.max(0, game.revoltRisk - 10);
        addFeed(`📺 <strong>PROPAGANDA A RETI UNIFICATE:</strong> Le celebrazioni nazionali riducono il rischio insurrezione (-10%).`);
      } else if (mode === 'purge') {
        if (game.ap < 22) { alert("Servono 22 ⚡!"); return; }
        if (!useTurnAction('regime_purge', 'Polizia Segreta & Coprifuoco')) return;
        game.ap -= 22;
        game.militaryLoyalty = Math.min(100, game.militaryLoyalty + 12);
        game.revoltRisk = Math.max(0, game.revoltRisk - 18);
        p.poll = Math.max(3, +(p.poll - 1.0).toFixed(1));
        addFeed(`🕵️ <strong>STATO D'ASSEDIO E POLIZIA SEGRETA:</strong> Repressi i nuclei clandestini (-18% rischio rivolta, +12% fedeltà militare), ma cala la simpatia popolare.`);
      } else if (mode === 'restoreDemo') {
        if (game.ap < 30) { alert("Servono 30 ⚡!"); return; }
        if (!useTurnAction('regime_restore', 'Ripristino Democrazia')) return;
        game.ap -= 30;
        game.isDictatorship = false;
        game.dictatorshipName = null;
        game.revoltRisk = 0;
        game.leader.prestige = Math.min(100, game.leader.prestige + 15);
        addFeed(`🕊️ <strong>RITORNO ALLA DEMOCRAZIA COSTITUZIONALE:</strong> ${game.leader.name} scioglie il Consiglio Supremo e ripristina le libertà parlamentari!`);
      }
      updateAllUI();
    }

export function passBudget() {
      if (game.isImprisoned) return;
      if (game.ap < 30) { alert("Servono 30 ⚡!"); return; }
      if (!useTurnAction('pass_budget', 'Approva Legge di Bilancio')) return;
      game.ap -= 30;
      const spend = game.budget.healthSpend + game.budget.investSpend + game.budget.eduSpend + game.budget.pensionSpend;
      const rev = game.budget.taxPressure * 0.72;
      game.budget.deficit = +(Math.max(0.8, Math.min(7.5, spend - rev))).toFixed(2);

      if (game.budget.deficit > 4.0) {
        game.spread += 16;
        game.foreignRels.eu_com = Math.max(10, (game.foreignRels.eu_com || 70) - 8);
        addFeed(`📜 Legge di Bilancio approvata in deficit (${game.budget.deficit}%): bene i consumi ma Bruxelles avverte Roma (+16 pt Spread).`);
      } else {
        game.spread = Math.max(65, game.spread - 12);
        game.foreignRels.eu_com = Math.min(100, (game.foreignRels.eu_com || 70) + 6);
        addFeed(`📜 Legge di Bilancio approvata con conti in ordine (Deficit ${game.budget.deficit}%): plauso di mercati e UE (-12 pt Spread).`);
      }
      // PUNTO 4 (1.8): Modal di esito della Legge di Bilancio
      openModal(
        `📜 Approvazione Legge di Bilancio (Deficit: ${game.budget.deficit}%)`,
        `<div style="font-size:13px; color:var(--text); line-height:1.55;">
          Il Parlamento ha approvato in via definitiva la <strong>Manovra di Bilancio</strong>.<br><br>
          • <strong>Deficit Programmato:</strong> <strong>${game.budget.deficit}%</strong> del PIL.<br>
          • <strong>Reazione dei Mercati:</strong> Spread attestato a <strong>${game.spread} pt</strong> (${game.budget.deficit > 4.0 ? '+16 pt per sforamento parametri' : '-12 pt per rispetto dei conti'}).<br>
          • <strong>Relazioni con Bruxelles:</strong> Fiducia Commissione UE a <strong>${game.foreignRels.eu_com || 70}/100</strong>.
        </div>`,
        [{ label: "Prendi Atto della Manovra", fn: () => { closeModal(); updateAllUI(); } }]
      );
      recalcPolls(true);
      updateAllUI();
    }

export function govVerifica() {
      if (game.isImprisoned) return;
      if (game.ap < 20) { alert("Servono 20 ⚡!"); return; }
      if (!useTurnAction('gov_verifica', 'Verifica di Maggioranza')) return;
      game.ap -= 20;
      game.govStability = Math.min(100, game.govStability + 15);
      addFeed(`🤝 Vertice di maggioranza a Palazzo Chigi: rilanciato il patto di coalizione (+15% Stabilità).`);
      openModal(
        "🤝 Vertice di Maggioranza — Esito Verifica a Palazzo Chigi",
        `<div style="font-size:13px; color:var(--text); line-height:1.55;">
          Si è concluso a tarda notte il vertice di maggioranza a Palazzo Chigi.<br><br>
          • <strong>Patto di Coalizione Rilanciato:</strong> Superati i nodi programmatici, la <strong>Stabilità dell'Esecutivo risale al ${game.govStability}%</strong> (+15%).<br>
          • <strong>Clima tra gli Alleati:</strong> Accordo raggiunto su nomine e calendario dei decreti.
        </div>`,
        [{ label: "Chiudi Vertice", fn: () => { closeModal(); updateAllUI(); } }]
      );
      updateAllUI();
    }

export function openCrisis() {
      if (game.isImprisoned) return;
      const p = getP();

      // PUNTO 21 (1.7): Nella Repubblica Presidenziale non esistono crisi parlamentari di governo (separazione dei poteri)!
      if (game.stateForm === 'presidenziale') {
        openManualGovernmentFormationModal(game.parties.filter(x => x.inGov && x.seats > 0), game.currentPM, game.currentGovCoalId);
        return;
      }

      // PUNTO 21 (1.7): Nel Premierato Elettivo vige la clausola "Simul Stabunt, Simul Cadent" (niente ribaltoni né governi tecnici!)
      if (game.stateForm === 'premierato') {
        game.govStability = 10;
        addFeed(`💣 <strong>CRISI NEL PREMIERATO ELETTIVO:</strong> Per la norma costituzionale <em>Simul Stabunt, Simul Cadent</em> non sono ammessi ribaltoni o governi tecnici!`, 'cr');
        openModal(
          "👑 Crisi nel Premierato Elettivo — Norma Antiribaltone (Simul Stabunt, Simul Cadent)",
          `<p>Nella forma di stato del <strong>Premierato Elettivo</strong>, la Costituzione vieta ribaltoni parlamentari o governi tecnici: puoi procedere a un <strong>rimpasto immediato nella stessa coalizione eletta</strong> oppure si procede allo <strong>scioglimento automatico delle Camere</strong> per tornare subito al voto dei cittadini!</p>`,
          [
            {
              label: `🏛️ Rimpasto Esecutivo nella Coalizione Eletta (${getCoalName(p.coalId)})`,
              fn: () => { closeModal(); openManualGovernmentFormationModal(game.parties.filter(x => x.coalId === p.coalId && x.seats > 0), game.currentPM, p.coalId); }
            },
            {
              label: "🗳️ Simul Stabunt, Simul Cadent: Dimissioni del Premier Eletto e Scioglimento Automatico delle Camere (45g)",
              fn: () => { closeModal(); startElectoralCampaign("Dimissioni del Premier eletto (clausola Simul Stabunt, Simul Cadent)"); }
            }
          ]
        );
        updateAllUI();
        return;
      }

      game.govStability = 10;
      addFeed(`💣 <strong>CRISI DI GOVERNO UFFICIALE:</strong> ${game.leader.name} apre formalmente la crisi a Palazzo Chigi! Il Presidente della Repubblica ${game.president.name} avvia le consultazioni al Quirinale.`);
      
      const myCoalMems = game.parties.filter(x => x.coalId === p.coalId && x.seats > 0);
      const myCoalSeats = myCoalMems.reduce((s, x) => s + x.seats, 0);
      const turnsSinceLastElec = game.turn - (game.lastElectionTurn || -999);
      // PUNTO 2 (1.7): Nella realtà costituzionale italiana (Art. 88 Cost.), quando cade un governo NON si può andare arbitrariamente subito alle urne se in Parlamento esiste una maggioranza politica (>= 201 seggi) o istituzionale/tecnica praticabile!
      // Lo scioglimento anticipato è consentito SOLO se non esiste una maggioranza politica coesa (< 201 seggi) E sono passate almeno 26 settimane dalle ultime elezioni fuori dal Semestre Bianco!
      const hasViableMajority = myCoalSeats >= 201;
      const canDissolve = !hasViableMajority && !isSemestreBianco() && turnsSinceLastElec >= 26;

      const choices = [
        {
          label: `🏛️ Consultazioni Politiche al Quirinale: Forma Governo di Maggioranza / Rimpasto (${myCoalSeats} seggi)`,
          fn: () => { closeModal(); openManualGovernmentFormationModal(myCoalMems.length ? myCoalMems : game.parties.filter(x => x.inGov && x.seats > 0), game.leader.name, p.coalId); }
        },
        {
          label: "🛡️ Incarico Istituzionale del Presidente della Repubblica: Governo Tecnico di Garanzia",
          fn: () => { closeModal(); formTechnicalGovernment(null, 'stabilità'); }
        }
      ];

      if (canDissolve) {
        choices.push({
          label: "🗳️ Paralisi Parlamentare Accertata (Art. 88 Cost.): Scioglimento delle Camere ed Elezioni (45g)",
          fn: () => { closeModal(); startElectoralCampaign("Impossibilità di formare una maggioranza parlamentare dopo la crisi di governo"); }
        });
      } else {
        const blockReason = isSemestreBianco()
          ? 'Semestre Bianco ex Art. 88 c.2 Cost.'
          : (hasViableMajority
            ? `Esiste una maggioranza parlamentare (${myCoalSeats}/400 seggi): il Quirinale rifiuta elezioni anticipate arbitrarie`
            : `Elezioni celebrate da poco (${turnsSinceLastElec}/26 settimane): obbligo di governo parlamentare o tecnico`);
        choices.push({
          label: `🔒 Elezioni Anticipate Rifiutate dal Quirinale (${blockReason})`,
          fn: () => { alert(`⚖️ PREROGATIVA COSTITUZIONALE DEL QUIRINALE (Art. 88 Cost.):\nNella Repubblica Parlamentare italiana i partiti non possono imporre il ritorno arbitrario alle urne ad ogni caduta di governo!\nIl Presidente della Repubblica ${game.president.name} scioglie le Camere solo come extrema ratio quando è oggettivamente impossibile formare qualsiasi maggioranza politica o tecnica in Parlamento (${blockReason}).`); }
        });
      }

      openModal(
        "🏛️ Consultazioni al Quirinale — Crisi di Governo (Art. 88 e 92 Cost.)",
        `<p>Hai aperto formalmente la crisi a Palazzo Chigi. Il <strong>Presidente della Repubblica ${game.president.name}</strong> avvia le consultazioni al Quirinale. Per dettato costituzionale, il Presidente della Repubblica verifica l'esistenza di una maggioranza parlamentare o di garanzia prima di qualsiasi ipotesi di scioglimento delle Camere:</p>`,
        choices
      );
      updateAllUI();
    }

export function oppHearing() {
      if (game.isImprisoned) return;
      if (game.president.isPlayer && game.stateForm !== 'presidenziale') {
        alert("❌ PREROGATIVA COSTITUZIONALE (Art. 87 Cost.):\nIl Presidente della Repubblica non partecipa al Question Time d'opposizione contro il Governo!");
        return;
      }
      const p = getP();
      if (p.seats === 0) {
        alert("❌ NESSUN SEGGIO IN PARLAMENTO:\nNon hai deputati a Montecitorio (0 seggi)!\nIl Question Time e le interrogazioni a risposta immediata sono riservate ai parlamentari eletti.\nUsa i comizi territoriali e i social media per fare opposizione civica.");
        return;
      }
      if (game.ap < 15) { alert("Servono 15 ⚡!"); return; }
      if (!useTurnAction('opp_hearing', 'Question Time a Montecitorio')) return;
      game.ap -= 15;
      game.govStability = Math.max(5, game.govStability - 7);
      game.leader.prestige = Math.min(100, game.leader.prestige + 3);
      recalcPolls(true);
      addFeed(`🔍 Question Time di ${game.leader.name} in Aula: l'Esecutivo va in difficoltà (-7% Stabilità Governo).`);
      openModal(
        "🔍 Question Time a Montecitorio — Esito Interrogazione a Risposta Immediata",
        `<div style="font-size:13px; color:var(--text); line-height:1.55;">
          Hai incalzato i Ministri a Montecitorio durante il Question Time a reti unificate.<br><br>
          • <strong>Effetto sull'Esecutivo:</strong> I Ministri sono andati in difficoltà sulle risposte, la <strong>Stabilità del Governo cala al ${game.govStability}%</strong> (-7%).<br>
          • <strong>Tuo Prestigio Personale:</strong> La tua opposizione puntuale è stata apprezzata dai commentatori (+3% Prestigio, attuale: <strong>${game.leader.prestige}%</strong>).
        </div>`,
        [{ label: "Chiudi Aula", fn: () => { closeModal(); updateAllUI(); } }]
      );
      updateAllUI();
    }

export function oppFilibuster() {
      if (game.isImprisoned) return;
      if (game.president.isPlayer && game.stateForm !== 'presidenziale') {
        alert("❌ PREROGATIVA COSTITUZIONALE (Art. 87 Cost.):\nIl Presidente della Repubblica non può condurre ostruzionismo parlamentare contro i decreti del Governo!");
        return;
      }
      const p = getP();
      if (p.seats === 0) {
        alert("❌ NESSUN SEGGIO IN PARLAMENTO:\nNon hai deputati nelle Commissioni parlamentari (0 seggi)!\nL'ostruzionismo tecnico richiede di depositare sub-emendamenti d'Aula da parte di eletti.");
        return;
      }
      if (game.ap < 20) { alert("Servono 20 ⚡!"); return; }
      if (!useTurnAction('opp_filibuster', 'Ostruzionismo in Commissione Bilancio')) return;
      game.ap -= 20;
      game.govStability = Math.max(5, game.govStability - 11);
      addFeed(`🧱 Ostruzionismo parlamentare in Commissione: lavori rallentati e fibrillazione nella maggioranza (-11% Stabilità).`);
      openModal(
        "🧱 Ostruzionismo Parlamentare — Esito dei Lavori in Commissione",
        `<div style="font-size:13px; color:var(--text); line-height:1.55;">
          I tuoi parlamentari hanno depositato centinaia di sub-emendamenti bloccando i lavori delle Commissioni legislative.<br><br>
          • <strong>Effetto sui Lavori:</strong> Calendarizzazione paralizzata, vertici notturni della maggioranza e <strong>Stabilità del Governo scesa al ${game.govStability}%</strong> (-11%).
        </div>`,
        [{ label: "Chiudi Commissione", fn: () => { closeModal(); updateAllUI(); } }]
      );
      updateAllUI();
    }

    /* PUNTI 1, 2, 5, 14, 15 & 21: MOZIONE DI SFIDUCIA CON REGOLE COSTITUZIONALI REALI E ADATTAMENTO ALLA FORMA DI STATO */
export function tableSfiducia() {
      if (game.isImprisoned) return;
      const p = getP();

      // PUNTO 9 (1.8): Il Presidente della Repubblica è garante neutrale super partes (Art. 87 Cost.) e non può sfiduciare il Governo!
      if (game.president.isPlayer && game.stateForm !== 'presidenziale') {
        alert("❌ PREROGATIVA COSTITUZIONALE (Art. 87 Cost.):\nIn qualità di Presidente della Repubblica rappresenti l'unità nazionale e sei super partes!\nNon puoi presentare mozioni di sfiducia parlamentari contro il Governo.");
        return;
      }

      // PUNTO 21 (1.7): Nella Repubblica Presidenziale vige la separazione dei poteri: il Parlamento NON può sfiduciare il Presidente eletto dal popolo!
      if (game.stateForm === 'presidenziale') {
        alert("🦅 SEPARAZIONE COSTITUZIONALE DEI POTERI (Repubblica Presidenziale):\nNella Repubblica Presidenziale il Presidente della Repubblica e Capo dell'Esecutivo è eletto direttamente dal popolo e NON è soggetto al voto di fiducia o di sfiducia del Parlamento!");
        return;
      }

      if (p.seats === 0) {
        alert("❌ PREROGATIVA COSTITUZIONALE (Art. 94 Cost.):\nNon hai deputati a Montecitorio (0 seggi)!\nAi sensi della Costituzione, la mozione di sfiducia deve essere sottoscritta da almeno un decimo dei componenti della Camera (almeno 40 deputati). Non può essere presentata da forze extra-parlamentari.");
        return;
      }

      const myCoalParties = (p.id !== 'ind' && p.coalId !== 'none')
        ? game.parties.filter(x => !x.inGov && x.seats > 0 && (x.coalId === p.coalId || (!computeCompat(p, x).vetoed && computeCompat(p, x).score >= 58)))
        : game.parties.filter(x => !x.inGov && x.seats > 0);
      const altSeats = myCoalParties.reduce((s,x)=>s+x.seats, 0);
      const altLead = [...myCoalParties].sort((a,b)=>b.seats-a.seats)[0] || p;

      // PUNTO 21 (1.7): Nel Cancellierato vige la SFIDUCIA COSTRUTTIVA (Art. 67 Grundgesetz): ammissibile solo se l'opposizione ha >= 201 seggi per eleggere contestualmente il nuovo Cancelliere!
      if (game.stateForm === 'cancellierato' && altSeats < 201) {
        alert(`⚖️ SFIDUCIA COSTRUTTIVA INAMMISSIBILE (Ordinamento del Cancellierato):\nNel Cancellierato una mozione di sfiducia può essere messa ai voti SOLO indicando contestualmente un nuovo Cancelliere sostenuto da almeno 201 deputati!\nLa tua coalizione alternativa dispone attualmente di ${altSeats}/400 seggi (servono almeno 201 seggi). Allarga prima la tua coalizione nella scheda Partiti & Coalizioni!`);
        return;
      }

      if (game.ap < 30) { alert("Servono 30 ⚡!"); return; }
      if (!useTurnAction('table_sfiducia', 'Mozione di Sfiducia al Governo')) return;
      game.ap -= 30;
      const oppSeats = game.parties.filter(x => !x.inGov).reduce((s,x)=>s+x.seats, 0);
      const passChance = (game.govStability < 38 ? 0.55 : (game.govStability < 52 ? 0.25 : 0.08)) + (oppSeats >= 195 ? 0.25 : 0);

      if (Math.random() < passChance) {
        game.govStability = 0;
        const fallenPM = game.currentPM;
        game.leader.prestige = Math.min(100, game.leader.prestige + 8);
        addFeed(`⚖️ <strong>MOZIONE DI SFIDUCIA APPROVATA A MONTECITORIO!</strong> Il Governo <strong>${fallenPM}</strong> va sotto in Aula e rassegna le dimissioni nelle mani del Presidente della Repubblica ${game.president.name}!`, 'cr');
        setTicker(`CADE IL GOVERNO ${fallenPM.toUpperCase()}: Approvata la mozione di sfiducia di ${game.leader.name}!`);

        // PUNTO 21: Nel Premierato Elettivo, se cade il Premier eletto scatta Simul Stabunt Simul Cadent (scioglimento automatico delle Camere)!
        if (game.stateForm === 'premierato') {
          openModal(
            `👑 Cade il Governo ${fallenPM} — Simul Stabunt, Simul Cadent!`,
            `<div style="font-size:13px; color:var(--text);">
              La mozione di sfiducia contro il Premier eletto <strong>${fallenPM}</strong> è stata approvata dall'Aula!<br><br>
              In base alla norma costituzionale del <strong>Premierato Elettivo (<em>Simul Stabunt, Simul Cadent</em>)</strong>, non sono consentiti ribaltoni né governi tecnici: la caduta dell'Esecutivo comporta lo <strong>scioglimento immediato e automatico delle Camere</strong>!
            </div>`,
            [
              {
                label: "🗳️ Scioglimento Automatico delle Camere e Ritorno alle Urne (45 giorni)",
                fn: () => { closeModal(); startElectoralCampaign(`Caduta del Governo ${fallenPM} nel Premierato Elettivo (Simul Stabunt, Simul Cadent)!`); }
              }
            ]
          );
          updateAllUI();
          return;
        }

        // PUNTO 2 (1.7): Nella Repubblica Parlamentare (e Cancellierato/Federale), quando cade il governo NON si va automaticamente alle elezioni!
        // Se c'è una maggioranza alternativa (>= 201 seggi) il Quirinale conferisce l'incarico politico; altrimenti conferisce l'incarico a un Governo Tecnico di Garanzia (salvo stallo prolungato)!
        const turnsSinceLastElec = game.turn - (game.lastElectionTurn || -999);
        const canDissolve = altSeats < 201 && !isSemestreBianco() && turnsSinceLastElec >= 40 && game.isTechnicalGov;

        if (altSeats >= 201 && p.id !== 'ind') {
          openModal(
            `⚖️ Governo ${fallenPM} Sfiduciato — Mandato Parlamentare al Quirinale`,
            `<div style="font-size:13px; color:var(--text);">
              La tua mozione di sfiducia${game.stateForm === 'cancellierato' ? ' costruttiva' : ''} ha fatto cadere il Governo <strong>${fallenPM}</strong>!<br><br>
              Dalle consultazioni al Quirinale emerge una chiara maggioranza parlamentare alternativa (<strong>${altSeats} seggi su 400</strong> tra ${myCoalParties.map(x=>x.short).join(', ')}).<br>
              Ai sensi degli Artt. 88 e 92 della Costituzione, esistendo una maggioranza in Parlamento il <strong>Presidente della Repubblica ${game.president.name}</strong> esclude lo scioglimento anticipato delle Camere e conferisce l'incarico di formare il nuovo Governo a <strong>${altLead.leader}</strong>:
            </div>`,
            [
              {
                label: `🏛️ Accetta il Mandato del Quirinale: Forma il Governo guidato da ${altLead.leader} (${altSeats} seggi)`,
                fn: () => { closeModal(); openManualGovernmentFormationModal(myCoalParties, altLead.leader, p.coalId); }
              },
              {
                label: "🛡️ Rinuncia all'incarico politico: sostieni un Governo Tecnico di Garanzia del Presidente",
                fn: () => { closeModal(); formTechnicalGovernment(null, 'stabilità'); }
              }
            ]
          );
        } else {
          const modalActions = [
            {
              label: "🛡️ Il Quirinale nomina un Governo Tecnico di Garanzia (Mario Draghi / Fabio Panetta)",
              fn: () => { closeModal(); formTechnicalGovernment(null, 'stabilità'); }
            }
          ];
          if (canDissolve) {
            modalActions.push({
              label: "🗳️ Fallimento anche del Governo Tecnico: il Quirinale scioglie le Camere (Elezioni tra 45 giorni)",
              fn: () => { closeModal(); startElectoralCampaign(`Scioglimento delle Camere dopo la caduta del Governo ${fallenPM} per assenza di maggioranza!`); }
            });
          } else {
            modalActions.push({
              label: "🔒 Elezioni Anticipate Escluse dal Quirinale (Obbligo costituzionale di Governo Tecnico / Istituzionale)",
              fn: () => { alert(`⚖️ PREROGATIVA COSTITUZIONALE (Art. 88 Cost.):\nNella Repubblica Parlamentare italiana la caduta di un Governo non comporta il ritorno immediato alle urne!\nIl Presidente della Repubblica ${game.president.name} ha il dovere costituzionale di insediare un Governo Tecnico / Istituzionale di Garanzia prima di sciogliere anticipatamente la Legislatura.`); }
            });
          }
          openModal(
            `⚖️ Cade il Governo ${fallenPM} — Consultazioni al Quirinale (Art. 88 Cost.)`,
            `<div style="font-size:13px; color:var(--text);">
              Colpo di scena a Montecitorio! La tua mozione di sfiducia è passata e il Presidente del Consiglio <strong>${fallenPM}</strong> ha rassegnato le dimissioni nelle mani del Presidente della Repubblica (+8% tuo Prestigio Personale).<br><br>
              In Parlamento i partiti d'opposizione compatibili dispongono di <strong>${altSeats} seggi su 400</strong> (sotto la soglia di 201 deputati).<br>
              Secondo la prassi costituzionale italiana (Art. 88 Cost.), il <strong>Presidente della Repubblica ${game.president.name}</strong> non scioglie subito le Camere ma affida il mandato a un <strong>Governo Tecnico di Garanzia</strong>:
            </div>`,
            modalActions
          );
        }
      } else {
        game.govStability = Math.max(10, game.govStability - 10);
        addFeed(`⚖️ Mozione di Sfiducia respinta dalla maggioranza, ma il Governo esce indebolito dal voto (-10% Stabilità).`);
        // PUNTO 4 (1.8): Modal di riscontro per la mozione di sfiducia respinta
        openModal(
          `⚖️ Mozione di Sfiducia Respinta a Montecitorio`,
          `<div style="font-size:13px; color:var(--text); line-height:1.55;">
            L'Aula della Camera dei Deputati ha votato sulla <strong>Mozione di Sfiducia al Governo ${game.currentPM}</strong>.<br><br>
            La maggioranza parlamentare ha fatto quadrato attorno al Presidente del Consiglio. La mozione è stata <strong>respinta</strong>.<br>
            Tuttavia, lo scontro in Aula ha accentuato le divisioni nella coalizione e la <strong>Stabilità del Governo scende al ${game.govStability}%</strong> (-10%).
          </div>`,
          [{ label: "Prendi Atto dell'Esito", fn: () => { closeModal(); updateAllUI(); } }]
        );
      }
      updateAllUI();
    }

    // =========================================================================
    // TAB 8: POLITICA ESTERA, UNIONE EUROPEA & PATTO ATLANTICO NATO (SOLO AL GOVERNO!)
    // =========================================================================

export function changeForeignRel(powerId, delta) {
      const fp = FOREIGN_POWERS.find(x => x.id === powerId);
      if (!fp) return;
      const oldVal = game.foreignRels[powerId] ?? 50;
      game.foreignRels[powerId] = Math.max(0, Math.min(100, Math.round(oldVal + delta)));

      if (delta > 0) {
        Object.entries(fp.rivals || {}).forEach(([rId, mult]) => {
          const curR = game.foreignRels[rId] ?? 50;
          const change = Math.round(delta * mult);
          game.foreignRels[rId] = Math.max(0, Math.min(100, curR + change));
        });
        Object.entries(fp.allies || {}).forEach(([aId, mult]) => {
          if (game.foreignRels[aId] !== undefined) {
            const curA = game.foreignRels[aId];
            game.foreignRels[aId] = Math.max(0, Math.min(100, Math.round(curA + delta * mult * 0.45)));
          }
        });
      } else if (delta < 0) {
        Object.entries(fp.rivals || {}).forEach(([rId, mult]) => {
          const curR = game.foreignRels[rId] ?? 50;
          const bonus = Math.round(Math.abs(delta * mult) * 0.5);
          game.foreignRels[rId] = Math.max(0, Math.min(100, curR + bonus));
        });
      }
    }

export function foreignAction(powerId, mode) {
      const p = getP();
      if ((!p.inGov && !game.isDictatorship) || game.isImprisoned) {
        alert("Solo chi è al Governo può gestire i rapporti diplomatici ufficiali della Repubblica Italiana!");
        return;
      }
      const fp = FOREIGN_POWERS.find(x => x.id === powerId);
      if (!fp) return;

      if (mode === 'summit') {
        if (game.ap < 18) { alert("Servono 18 ⚡!"); return; }
        if (!useTurnAction(`for_summit_${powerId}`, `Vertice con ${fp.country}`)) return;
        game.ap -= 18;
        changeForeignRel(powerId, +14);
        const rivalNames = Object.keys(fp.rivals || {}).map(rId => FOREIGN_POWERS.find(x => x.id === rId)?.leader || rId).join(' e ');
        if (powerId === 'russia') game.spread = Math.min(450, game.spread + 10);
        if (powerId === 'eu_com' || powerId === 'usa') game.spread = Math.max(60, game.spread - 8);
        addFeed(`✈️ <strong>VERTICE DIPLOMATICO CON ${fp.flag} ${fp.leader.toUpperCase()}:</strong> Il Governo rafforza l'asse con ${fp.country} (+14). Reazione irritata di <strong>${rivalNames || 'cancellerie rivali'}</strong>, le cui relazioni con Roma calano!`);
      } else if (mode === 'trade') {
        if (game.ap < 15) { alert("Servono 15 ⚡!"); return; }
        if (!useTurnAction(`for_trade_${powerId}`, `Accordo con ${fp.country}`)) return;
        game.ap -= 15;
        changeForeignRel(powerId, +9);
        game.gdp = Math.min(3.5, +(game.gdp + 0.08).toFixed(2));
        addFeed(`🚢 <strong>PARTNERSHIP COMMERCIALE ED ENERGETICA CON ${fp.flag} ${fp.country}:</strong> Cresce il PIL (+0.08%), ma si raffreddano i rapporti coi blocchi geopolitici rivali.`);
      } else if (mode === 'sanction') {
        if (game.ap < 14) { alert("Servono 14 ⚡!"); return; }
        if (!useTurnAction(`for_sanction_${powerId}`, `Sanzioni a ${fp.country}`)) return;
        game.ap -= 14;
        changeForeignRel(powerId, -16);
        addFeed(`⚡ <strong>SANZIONI CONTRO ${fp.flag} ${fp.country.toUpperCase()}:</strong> Roma inasprisce la linea diplomatica (-16 relazione con ${fp.leader}; migliorano i rapporti coi suoi avversari).`);
      }
      recalcPolls(true);
      updateAllUI();
    }

export function euAction(mode) {
      const p = getP();
      if ((!p.inGov && !game.isDictatorship) || game.isImprisoned) {
        alert("Solo il Governo in carica può negoziare il PNRR o porre il veto al Consiglio Europeo!");
        return;
      }
      if (mode === 'pnrr') {
        if (game.ap < 20) { alert("Servono 20 ⚡!"); return; }
        if (!useTurnAction('eu_pnrr', 'Sblocca Rata PNRR')) return;
        game.ap -= 20;
        changeForeignRel('eu_com', +10);
        game.spread = Math.max(60, game.spread - 14);
        game.gdp = Math.min(3.5, +(game.gdp + 0.12).toFixed(2));
        addFeed(`💶 <strong>INTESA CON BRUXELLES:</strong> Sbloccata la nuova rata del PNRR (+0.12% PIL, -14 pt Spread).`);
      } else if (mode === 'veto') {
        if (game.ap < 18) { alert("Servono 18 ⚡!"); return; }
        if (!useTurnAction('eu_veto', 'Veto Italiano a Bruxelles')) return;
        game.ap -= 18;
        changeForeignRel('eu_com', -14);
        game.spread += 12;
        shiftBloc(game.playerPartyId, 'identitari', 6);
        shiftBloc(game.playerPartyId, 'nazionalisti', 6);
        recalcPolls(true);
        addFeed(`✋ <strong>VETO ITALIANO AL CONSIGLIO EUROPEO:</strong> ${game.leader.name} blocca le direttive di Bruxelles! Esulta l'elettorato sovranista, ma sale lo Spread (+12 pt).`);
      }
      updateAllUI();
    }

export function natoAction(mode) {
      const p = getP();
      if ((!p.inGov && !game.isDictatorship) || game.isImprisoned) {
        alert("Solo il Governo in carica può modificare il bilancio della Difesa NATO!");
        return;
      }
      if (mode === 'boost2pct') {
        if (game.ap < 20) { alert("Servono 20 ⚡!"); return; }
        if (!useTurnAction('nato_boost', 'Spesa Difesa NATO')) return;
        game.ap -= 20;
        game.defenseSpendGDP = +(Math.min(3.0, game.defenseSpendGDP + 0.35)).toFixed(2);
        changeForeignRel('usa', +12);
        changeForeignRel('ukraine', +10);
        addFeed(`🪖 <strong>VERTICE NATO:</strong> L'Italia porta la spesa per la Difesa al <strong>${game.defenseSpendGDP}% del PIL</strong>. Plauso di Washington e Zelensky, dura nota di Mosca!`);
      } else if (mode === 'cutSpend') {
        if (game.ap < 18) { alert("Servono 18 ⚡!"); return; }
        if (!useTurnAction('nato_cut', 'Taglio Spese Militari NATO')) return;
        game.ap -= 18;
        game.defenseSpendGDP = +(Math.max(0.9, game.defenseSpendGDP - 0.30)).toFixed(2);
        changeForeignRel('usa', -14);
        changeForeignRel('ukraine', -15);
        changeForeignRel('russia', +12);
        addFeed(`🕊️ <strong>STOP INVIO ARMI & TAGLIO SPESE MILITARI (${game.defenseSpendGDP}% PIL):</strong> Gelo con Casa Bianca e Zelensky, mentre Putin apre al dialogo energetico con Roma.`);
      }
      recalcPolls(true);
      updateAllUI();
    }

export function launchExitReferendum(type) {
      const p = getP();
      if ((!p.inGov && !game.isDictatorship) || game.isImprisoned) {
        alert("Solo il Governo in carica può attivare la procedura di denuncia dei Trattati UE/NATO!");
        return;
      }
      if (type === 'eu' || type === 'nato') {
        if (game.activeReferendum) {
          alert(`⏳ C'è già una Campagna Referendaria in corso (${game.activeReferendum.title})! Attendi la chiusura delle urne tra ${game.activeReferendum.daysLeft} giorni.`);
          return;
        }
        const cdKey = 'treaty_' + type;
        const cdLeft = Math.max(0, (game.referendumCooldowns[cdKey] || 0) - game.turn);
        if (cdLeft > 0) {
          alert(`⛔ Su questo Trattato Internazionale si è già tenuto un referendum di recente! Bisogna attendere ancora ${cdLeft} giorni.`);
          return;
        }
      }
      if (game.ap < 35) { alert("Servono 35 ⚡ per indire un Referendum sui Trattati Internazionali!"); return; }
      if (!useTurnAction('treaty_ref_' + type, 'Referendum Trattati Internazionali')) return;
      game.ap -= 35;

      if (type === 'eu') {
        let leaveSupport = 32 + (100 - (game.foreignRels.eu_com || 70)) * 0.28 + (game.spread > 180 ? 8 : 0);
        if ((p.stances.eu ?? 2) >= 3 || (p.stances.eu ?? 2) === 0) leaveSupport += p.poll * 0.48;
        const initYes = Math.max(24, Math.min(76, +(leaveSupport).toFixed(1)));
        game.activeReferendum = {
          kind: 'treaty',
          treatyType: 'eu',
          cooldownKey: 'treaty_eu',
          title: 'Referendum ITALEXIT (Uscita da UE)',
          targetLabel: "Denuncia dei Trattati UE e ritorno alla sovranità monetaria nazionale",
          daysLeft: 30,
          yesPct: initYes
        };
        const rr = document.getElementById('refRibbon');
        if (rr) rr.style.display = 'block';
        addFeed(`🇮🇹 <strong>INDETTO IL REFERENDUM ITALEXIT!</strong> Parte la <strong>Campagna Referendaria di 30 giorni</strong> sull'uscita dell'Italia dall'Unione Europea (SÌ iniziale: ${initYes}%)!`, 'cr');
        setTicker(`CAMPAGNA REFERENDARIA ITALEXIT: 30 giorni al voto sull'uscita dall'Unione Europea!`);
      } else if (type === 'nato') {
        let leaveSupport = 35 + (100 - (game.foreignRels.usa || 70)) * 0.30 + ((game.foreignRels.russia || 18) * 0.22);
        if ((p.stances.foreign ?? 2) === 0 || (p.stances.foreign ?? 2) === 4) leaveSupport += p.poll * 0.48;
        const initYes = Math.max(24, Math.min(76, +(leaveSupport).toFixed(1)));
        game.activeReferendum = {
          kind: 'treaty',
          treatyType: 'nato',
          cooldownKey: 'treaty_nato',
          title: 'Referendum Uscita dalla NATO',
          targetLabel: "Uscita dal Patto Atlantico e proclamazione della neutralità strategica",
          daysLeft: 30,
          yesPct: initYes
        };
        const rr = document.getElementById('refRibbon');
        if (rr) rr.style.display = 'block';
        addFeed(`🕊️ <strong>INDETTO IL REFERENDUM SULLA NATO!</strong> Parte la <strong>Campagna Referendaria di 30 giorni</strong> sulla neutralità militare dell'Italia (SÌ iniziale: ${initYes}%)!`, 'cr');
        setTicker(`CAMPAGNA REFERENDARIA NATO: 30 giorni al voto sull'uscita dal Patto Atlantico!`);
      } else if (type === 'rejoin_eu') {
        game.inEU = true;
        changeForeignRel('eu_com', +25);
        game.spread = Math.max(80, game.spread - 45);
        addFeed(`🇪🇺 <strong>RIENTRO NELL'UNIONE EUROPEA:</strong> L'Italia firma il nuovo trattato di adesione con Bruxelles!`);
      } else if (type === 'rejoin_nato') {
        game.inNATO = true;
        changeForeignRel('usa', +25);
        addFeed(`🛡️ <strong>RIENTRO NELLA NATO:</strong> L'Italia riattiva la partecipazione al Comando Alleato.`);
      }
      recalcPolls(true);
      updateAllUI();
    }

    // =========================================================================
    // TAB 9: MAPPA REGIONALE ISTAT INTERATTIVA (CON BILANCIAMENTO CAMPAGNA E COOLDOWN 7G — PUNTO 11)
    // =========================================================================

export function investReg(regId, type) {
      if (game.isImprisoned) return;
      const cdLeft = Math.max(0, (game.regCooldowns[regId] || 0) - game.turn);
      if (cdLeft > 0) {
        alert(`⏳ Hai già svolto un'iniziativa organizzativa in ${regId} questa settimana! Potrai intervenire di nuovo in questa regione tra ${cdLeft} giorni.`);
        return;
      }
      if (!game.regOrg[regId] || typeof game.regOrg[regId] !== 'object') game.regOrg[regId] = {};
      const curOrg = game.regOrg[regId][game.playerPartyId] || 50;

      if (type === 'comizio') {
        if (game.ap < 22 || game.funds < 15) { alert("Servono € 15k e 22 ⚡ per organizzare un Comizio Regionale!"); return; }
        if (!useTurnAction('reg_act_' + regId, `Iniziativa in ${regId}`)) return;
        game.ap -= 22;
        game.funds -= 15;
        const gain = curOrg >= 72 ? 2 : 3;
        game.regOrg[regId][game.playerPartyId] = Math.min(100, curOrg + gain);
        game.regCooldowns[regId] = game.turn + 7;
        const p = getP();
        if (p.id !== 'ind') p.orgStrength = Math.min(100, +(p.orgStrength + 0.25).toFixed(2));
        addFeed(`🎤 Comizio regionale di ${game.leader.name} in <strong>${regId}</strong> (+${gain} Radicamento territoriale; prossimo evento in regione tra 7 giorni).`);
      } else {
        if (game.funds < 55 || game.ap < 25) { alert("Servono € 55k e 25 ⚡ per inaugurare nuove Sedi Provinciali!"); return; }
        if (!useTurnAction('reg_act_' + regId, `Apertura Sedi in ${regId}`)) return;
        game.funds -= 55;
        game.ap -= 25;
        const gain = curOrg >= 72 ? 3 : 5;
        game.regOrg[regId][game.playerPartyId] = Math.min(100, curOrg + gain);
        game.regCooldowns[regId] = game.turn + 7;
        const p = getP();
        if (p.id !== 'ind') p.orgStrength = Math.min(100, +(p.orgStrength + 0.45).toFixed(2));
        addFeed(`🏢 Nuove Sedi provinciali inaugurate in <strong>${regId}</strong> (+${gain} Radicamento territoriale; prossima apertura in regione tra 7 giorni).`);
      }
      recalcPolls(true);
      updateAllUI();
    }

    /* PUNTO 10 (1.7.1): POLITICA REGIONALE COMPLETA — GOVERNATORI DI REGIONE, RELAZIONI STATO-REGIONI ED ELEZIONI REGIONALI */
export function checkScheduledRegionalElections() {
      if (!game.governors) return null;
      const curY = game.date.getFullYear();
      const curM = game.date.getMonth() + 1;
      for (const [regId, gov] of Object.entries(game.governors)) {
        if (!gov) continue;
        const nextY = gov.nextElectionYear || 2028;
        const nextM = gov.nextElectionMonth || 10;
        // PUNTO 1 (1.8): Solo scadenza naturale a 5 anni o collasso istituzionale della giunta (approval <= 18%)
        const isExpired = curY > nextY || (curY === nextY && curM >= nextM);
        const isCrisis = (gov.approval !== undefined && gov.approval <= 18);
        if (isExpired || isCrisis) {
          const cdLeft = Math.max(0, (game.regionalElectionCooldowns?.[regId] || 0) - game.turn);
          if (cdLeft <= 0) return regId;
        }
      }
      return null;
    }

/* PUNTO 8 (1.8.2): TUTTI I CANDIDATI REGIONALI DISPONIBILI AL VOTO (CDX, CSX, M5S, TERZO POLO, CIVICI/AUTONOMISTI E CANDIDATO DESIGNATO) */
export function getRegionalCandidatesForElection(regId) {
      const gov = game.governors?.[regId] || INITIAL_GOVERNORS[regId];
      const rPolls = game.regionPolls?.[regId] || {};
      const norm = (s) => String(s || '').replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim().toLowerCase();
      const incumbentTermLimitReached = (gov && (gov.termsServed || 1) >= 2);

      // Ripartizione partiti nei 5 poli tradizionali regionali italiani
      const cdxParties = game.parties.filter(p => p.coalId === 'cdx' || ['fdi','lega','fi','nm'].includes(p.id));
      const csxParties = game.parties.filter(p => p.coalId === 'csx' || ['pd','avs','piueu'].includes(p.id));
      const m5sParties = game.parties.filter(p => p.id === 'm5s');
      const thirdParties = game.parties.filter(p => ['azione','iv'].includes(p.id));
      const altParties = game.parties.filter(p => !cdxParties.includes(p) && !csxParties.includes(p) && !m5sParties.includes(p) && !thirdParties.includes(p));

      const sumPoll = (list) => list.reduce((s, p) => s + (rPolls[p.id] ?? p.poll ?? 1), 0);
      const cdxBase = Math.max(18, sumPoll(cdxParties));
      const csxBase = Math.max(16, sumPoll(csxParties));
      const m5sBase = Math.max(8, sumPoll(m5sParties));
      const thirdBase = Math.max(6, sumPoll(thirdParties));
      const altBase = Math.max(4, sumPoll(altParties));

      const isGovCDX = ['cdx','fdi','lega','fi','nm'].includes(String(gov?.partyId || gov?.coalId || '').toLowerCase());
      const isGovCSX = ['csx','pd','avs','piueu'].includes(String(gov?.partyId || gov?.coalId || '').toLowerCase());

      const pickCand = (partyList, coalLabel, coalColor, defaultFallbackId, isGovMatch) => {
        // 1. Incumbent ricandidabile
        if (gov && !incumbentTermLimitReached && isGovMatch) {
          const incPol = POLITICIANS.find(x => x.id === gov.polId || norm(x.name) === norm(gov.name));
          if (incPol && !getPersonCurrentOffice(incPol, 'gov:' + regId)) {
            const isNative = (incPol.region === regId);
            return { polId: incPol.id, name: incPol.name, partyId: incPol.partyId || gov.partyId, coalId: coalLabel, isIncumbent: true, region: incPol.region, isNative, label: coalLabel, color: coalColor };
          }
        }
        // 2. Candidato custom designato per questo polo
        if (gov?.customCandidate && (gov.customCandidate.coalId === coalLabel || partyList.some(p => p.id === gov.customCandidate.partyId))) {
          const cPol = POLITICIANS.find(x => x.id === gov.customCandidate.polId || norm(x.name) === norm(gov.customCandidate.name));
          const isNative = (cPol?.region === regId);
          return { ...gov.customCandidate, coalId: coalLabel, isIncumbent: false, region: cPol?.region || regId, isNative, label: coalLabel, color: coalColor };
        }
        // 3. Politico reale del roster, con preferenza nativo della regione (Punto 9: 20/20 completato!)
        const topParty = [...partyList].sort((a,b) => (rPolls[b.id] || b.poll) - (rPolls[a.id] || a.poll))[0] || { id: defaultFallbackId, short: defaultFallbackId.toUpperCase() };
        const pIds = new Set(partyList.map(p => p.id));
        const regNativePol = POLITICIANS.find(x => pIds.has(x.partyId) && x.region === regId && !getPersonCurrentOffice(x) && norm(x.name) !== norm(gov?.name));
        const regPartyPol = POLITICIANS.find(x => x.partyId === topParty.id && !getPersonCurrentOffice(x) && norm(x.name) !== norm(gov?.name));
        const chosenPol = regNativePol || regPartyPol || POLITICIANS.find(x => pIds.has(x.partyId) && !getPersonCurrentOffice(x)) || POLITICIANS.find(x => x.partyId === topParty.id);
        const isNative = (chosenPol?.region === regId);

        return {
          polId: chosenPol ? chosenPol.id : `cand_${topParty.id}_${regId}`,
          name: chosenPol ? chosenPol.name : `Esponente Regionale ${topParty.short || coalLabel}`,
          partyId: chosenPol ? chosenPol.partyId : topParty.id,
          coalId: coalLabel,
          isIncumbent: false,
          region: chosenPol?.region || regId,
          isNative,
          label: coalLabel,
          color: coalColor
        };
      };

      const cdxCand = pickCand(cdxParties, 'Coalizione Centrodestra', '#2563eb', 'fdi', isGovCDX);
      const csxCand = pickCand(csxParties, 'Coalizione Centrosinistra', '#ef4444', 'pd', isGovCSX);
      const m5sCand = pickCand(m5sParties.length ? m5sParties : [{ id: 'm5s', short: 'M5S', poll: 10 }], 'Movimento 5 Stelle', '#eab308', 'm5s', gov?.partyId === 'm5s');
      const thirdCand = pickCand(thirdParties.length ? thirdParties : [{ id: 'azione', short: 'Azione', poll: 4 }], 'Polo Moderato & Riformista', '#06b6d4', 'azione', ['azione','iv'].includes(gov?.partyId));
      const altCand = pickCand(altParties.length ? altParties : [{ id: 'dsp', short: 'Civica Territoriale', poll: 2 }], 'Polo Civico & Territoriale', '#8b5cf6', 'dsp', false);

      const list = [
        { ...cdxCand, baseShare: cdxBase + (cdxCand.isNative ? 4.5 : 0) },
        { ...csxCand, baseShare: csxBase + (csxCand.isNative ? 4.5 : 0) },
        { ...m5sCand, baseShare: m5sBase + (m5sCand.isNative ? 4.5 : 0) },
        { ...thirdCand, baseShare: thirdBase + (thirdCand.isNative ? 4.5 : 0) },
        { ...altCand, baseShare: altBase + (altCand.isNative ? 4.5 : 0) }
      ];

      // Se il giocatore ha designato un custom candidate e non è ancora incluso nella lista
      if (gov?.customCandidate && !list.some(c => c.polId === gov.customCandidate.polId || norm(c.name) === norm(gov.customCandidate.name))) {
        const cPol = POLITICIANS.find(x => x.id === gov.customCandidate.polId || norm(x.name) === norm(gov.customCandidate.name));
        const isNative = (cPol?.region === regId);
        const pt = game.parties.find(x => x.id === gov.customCandidate.partyId);
        list.push({
          polId: gov.customCandidate.polId,
          name: gov.customCandidate.name,
          partyId: gov.customCandidate.partyId || 'ind',
          coalId: gov.customCandidate.coalId || 'LISTA_PROPRIA',
          label: `Candidato Ufficiale ${pt ? pt.short : 'Indipendente'}`,
          isIncumbent: false,
          region: cPol?.region || regId,
          isNative,
          color: pt?.color || '#10b981',
          baseShare: Math.max(10, ((rPolls[pt?.id] || pt?.poll || 5) * 1.5) + (isNative ? 4.5 : 0))
        });
      }

      return list;
    }

export function openRegionalElectionModal(regId, isEarly = false) {
      const gov = game.governors?.[regId] || INITIAL_GOVERNORS[regId];
      if (!gov) return;
      const cands = getRegionalCandidatesForElection(regId);
      const totalBase = cands.reduce((s, c) => s + c.baseShare, 0) || 100;
      const p = getP();

      const isPlayerRunning = cands.some(c => c.name === game.leader.name || c.polId === 'player_leader_pol');
      const isIndNonRunning = (game.partyRole === 'independent' || p.id === 'ind') && !isPlayerRunning;

      document.getElementById('mTag').textContent = `ELEZIONI REGIONALI IN ${regId.toUpperCase()} • LEGGE TATARELLA (TURNO UNICO)`;
      document.getElementById('mTitle').textContent = `🗳️ Urne Aperte per la Presidenza della Regione ${regId}`;
      document.getElementById('mBody').innerHTML = `
        <div style="font-size:13px; line-height:1.55; color:var(--text);">
          I cittadini di <strong>${regId}</strong> sono chiamati alle urne per eleggere a <strong>turno unico</strong> il <strong>Presidente della Giunta Regionale (Governatore)</strong> e il Consiglio Regionale (Premio di Maggioranza al 55-60% dei seggi).<br>
          • <strong>Governatore Uscente:</strong> <strong>${gov.name}</strong> (${(game.parties.find(x=>x.id===gov.partyId)?.short)||gov.partyId.toUpperCase()} — Mandati svolti: <strong>${gov.termsServed || 1}/2</strong> — Gradimento: <strong>${gov.approval}%</strong>)<br>
          ${(gov.termsServed || 1) >= 2 ? `<span style="color:#f87171; font-weight:800;">🔒 Limite dei 2 mandati consecutivi raggiunto (L. 165/2004): l'uscente non è ricandidabile.</span><br>` : ''}
          <div style="margin:12px 0; display:grid; grid-template-columns:repeat(${cands.length},1fr); gap:8px;">
            ${cands.map(c => {
              const estPct = ((c.baseShare / totalBase) * 100).toFixed(1);
              const pt = game.parties.find(x => x.id === c.partyId);
              return `<div class="box" style="margin:0; padding:10px; border-top:3px solid ${c.color};">
                <div style="font-size:10px; text-transform:uppercase; font-weight:800; color:${c.color};">${c.label}</div>
                <div style="font-size:14px; font-weight:900; margin:4px 0;">${c.name} ${c.isIncumbent ? '👑' : ''}</div>
                <div style="font-size:11px; color:var(--muted);">Partito: <strong style="color:${pt?.color||'#fff'};">${pt?.short||c.partyId.toUpperCase()}</strong></div>
                ${c.isNative ? `<div style="font-size:10px; color:#34d399; font-weight:800;">🏡 Radicato in ${regId} (+4.5%)</div>` : ''}
                <div style="font-size:15px; font-weight:900; color:var(--gold-lt); margin-top:4px;">~${estPct}%</div>
              </div>`;
            }).join('')}
          </div>
          ${isIndNonRunning 
            ? `In qualità di personalità Indipendente fuori dai partiti, osservi l'esito della consultazione elettorale in <strong>${regId}</strong>:` 
            : `Quale strategia elettorale adotti prima dello scrutinio regionale in <strong>${regId}</strong>?`}
        </div>
      `;

      const box = document.getElementById('mChoices');
      box.innerHTML = '';

      // PUNTO 21 (1.8): Opzioni adeguate per Indipendenti senza comizi partitici
      const strategies = isIndNonRunning ? [
        { l: `🔍 Segui i comizi e analizza i dossier di ${regId} (10 ⚡)`, d: `Approfondisci i temi del territorio (+4% tuo Prestigio Personale)`, costAP: 10, costFunds: 0, boost: 0, prestigeGain: 4 },
        { l: `📢 Rilascia una dichiarazione neutrale da osservatore civico (8 ⚡)`, d: `Richiamo alla serietà istituzionale (+3% Prestigio)`, costAP: 8, costFunds: 0, boost: 0, prestigeGain: 3 },
        { l: `🗳️ Procedi direttamente allo scrutinio delle schede (0 ⚡)`, d: `Prendi atto dell'esito del voto popolare dei cittadini`, costAP: 0, costFunds: 0, boost: 0 }
      ] : [
        { l: `🔥 Blitz Finale del Leader in ${regId} (15 ⚡, € 20k)`, d: `Mobilitazione straordinaria nei capoluoghi (+3.8% al candidato della tua area)`, costAP: 15, costFunds: 20, boost: 3.8 },
        { l: `🤝 Patto con Sindaci, Civiche e Imprese (18 ⚡)`, d: `Rafforza il voto disgiunto (+2.8% voti e +3 Radicamento in ${regId})`, costAP: 18, costFunds: 0, boost: 2.8, orgGain: 3 },
        { l: `🗳️ Procedi allo scrutinio delle schede regionali (0 ⚡)`, d: `Affidati ai rapporti di forza sul territorio`, costAP: 0, costFunds: 0, boost: 0 }
      ];

      strategies.forEach(st => {
        const btn = document.createElement('button');
        btn.className = 'm-btn';
        btn.innerHTML = `<strong>${st.l}</strong><span>${st.d}</span>`;
        btn.onclick = () => {
          if (game.ap < st.costAP || game.funds < st.costFunds) {
            alert(`Risorse insufficienti! Servono ${st.costAP} ⚡ e € ${st.costFunds}k.`);
            return;
          }
          game.ap -= st.costAP;
          game.funds -= st.costFunds;
          if (st.prestigeGain) game.leader.prestige = Math.min(100, game.leader.prestige + st.prestigeGain);
          if (st.orgGain && game.regOrg[regId] && p.id !== 'ind') {
            game.regOrg[regId][game.playerPartyId] = Math.min(100, (game.regOrg[regId][game.playerPartyId] || 50) + st.orgGain);
          }
          runRegionalElectionVote(regId, cands, st.boost);
        };
        box.appendChild(btn);
      });

      openModal();
    }

export function runRegionalElectionVote(regId, cands = null, playerBoost = 0, hasVotedCitizen = false) {
      if (!Array.isArray(cands)) cands = getRegionalCandidatesForElection(regId);
      // PUNTO 11 (1.8.1): Se il giocatore è residente in questa regione, entra prima in cabina elettorale come comune cittadino
      const isPlayerResident = (game.leader.region === regId);
      if (isPlayerResident && !hasVotedCitizen && !game.isImprisoned && !game.inExile) {
        openRegionalCitizenVotingBoothModal(regId, cands, (votedCand) => {
          runRegionalElectionVote(regId, cands, playerBoost + 0.1, true);
        });
        return;
      }
      const gov = game.governors?.[regId] || INITIAL_GOVERNORS[regId];
      const p = getP();
      const myCoal = String(p.coalId || '').toLowerCase() === 'cdx' ? 'CDX' : (String(p.coalId || '').toLowerCase() === 'csx' ? 'CSX' : 'TERZO');

      let sum = 0;
      const scored = cands.map(c => {
        let s = c.baseShare + (Math.random() * 3.2 - 1.6);
        if (c.isIncumbent && (gov?.approval || 55) >= 56) s += 2.4;
        if (String(c.coalId).toUpperCase() === myCoal || c.partyId === game.playerPartyId) s += playerBoost;
        s = Math.max(2.5, s);
        sum += s;
        return { ...c, rawScore: s };
      });

      scored.forEach(c => {
        c.finalPct = +((c.rawScore / (sum || 1)) * 100).toFixed(1);
      });
      scored.sort((a,b) => b.finalPct - a.finalPct);
      const winner = scored[0];
      const runnerUp = scored[1] || scored[0];
      const curYear = game.date.getFullYear();
      const curMonth = game.date.getMonth() + 1;

      const oldGovName = gov?.name;
      const wPol = POLITICIANS.find(x => x.id === winner.polId || x.name === winner.name);
      const isReelected = (oldGovName && oldGovName === winner.name);
      const newTermsServed = isReelected ? ((gov?.termsServed || 1) + 1) : 1;

      game.governors[regId] = {
        regId,
        polId: winner.polId,
        name: winner.name,
        age: wPol?.age || gov?.age || 54,
        partyId: winner.partyId,
        coalId: String(winner.coalId || 'CDX').toUpperCase(),
        approval: 62,
        termsServed: newTermsServed,
        majorityPct: winner.finalPct,
        sinceYear: isReelected ? (gov.sinceYear || curYear - 5) : curYear,
        termStartYear: curYear,
        nextElectionYear: curYear + 5,
        nextElectionMonth: curMonth,
        isPlayer: (winner.name === game.leader.name || winner.polId === 'player_leader_pol')
      };

      recordPoliticianHistory(winner.name, `Presidente della Regione ${regId} (${newTermsServed}° Mandato)`, `Presidente della Regione ${regId}`);
      enforceSingleOfficeRule();
      syncAllPoliticianCareersWithCurrentState();
      const winParty = game.parties.find(x => x.id === winner.partyId);

      addFeed(`🏛️ <strong>ELEZIONI REGIONALI ${regId.toUpperCase()}:</strong> <strong>${winner.name}</strong> (${winParty ? winParty.short : winner.partyId.toUpperCase()}, ${winner.label}) è eletto <strong>Presidente della Regione ${regId}</strong> col <strong>${winner.finalPct}%</strong> contro ${runnerUp.name} (${runnerUp.finalPct}%)!`, 'ok');
      setTicker(`REGIONALI ${regId.toUpperCase()}: Vince ${winner.name} (${winner.finalPct}%) eletto Governatore!`);

      document.getElementById('mTag').textContent = `SCRUTINIO DEFINITIVO VIMINALE • REGIONE ${regId.toUpperCase()}`;
      document.getElementById('mTitle').textContent = `👑 ${winner.name} eletto Presidente della Regione ${regId} (${winner.finalPct}%)`;
      document.getElementById('mBody').innerHTML = `
        <div style="font-size:13px; line-height:1.55;">
          Lo spoglio delle sezioni elettorali in <strong>${regId}</strong> è concluso. Grazie al premio di maggioranza regionale, la coalizione vincente ottiene il <strong>60% dei seggi nel Consiglio Regionale</strong>.<br>
          ${oldGovName && oldGovName !== winner.name ? `<div style="margin-top:6px; color:#fbbf24; font-weight:800;">⚡ RIBALTONE IN GIUNTA: ${winner.name} subentra all'uscente ${oldGovName}!</div>` : `<div style="margin-top:6px; color:#34d399; font-weight:800;">✅ CONFERMA IN GIUNTA: ${winner.name} guida la Regione per il quinquennio ${curYear}–${curYear+5}.</div>`}
          <div style="margin-top:12px; display:flex; flex-direction:column; gap:8px;">
            ${scored.map((c, idx) => {
              const pt = game.parties.find(x => x.id === c.partyId);
              return `<div style="background:var(--bg-2); border:1px solid ${idx===0?'var(--gold-bd)':'var(--border)'}; border-radius:8px; padding:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <strong>${idx===0?'🏆 ':''}${c.name} <span style="font-size:11px; color:${pt?.color||'#94a3b8'};">(${pt?.short||c.partyId.toUpperCase()} — ${c.label})</span></strong>
                  <span style="font-size:15px; font-weight:900; color:${idx===0?'#34d399':'var(--text)'};">${c.finalPct}%</span>
                </div>
                <div style="height:7px; background:#0f172a; border-radius:4px; overflow:hidden;">
                  <div style="height:100%; width:${c.finalPct}%; background:${c.color};"></div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      `;
      const box = document.getElementById('mChoices');
      box.innerHTML = '';
      const okBtn = document.createElement('button');
      okBtn.className = 'btn-gold';
      okBtn.innerHTML = (winner.name === game.leader.name)
        ? `🏛️ Insedia la Nuova Giunta Regionale di ${regId} →`
        : `🏛️ Prendi atto dell'esito elettorale e insedia la Giunta →`;
      okBtn.onclick = () => { closeModal(); updateAllUI(); };
      box.appendChild(okBtn);
    }

export function regionalGovAction(regId, mode) {
      if (game.isImprisoned) return;
      const gov = game.governors?.[regId] || INITIAL_GOVERNORS[regId];
      if (!gov) return;
      const p = getP();

      if (mode === 'pact') {
        if (game.ap < 16) { alert("Servono 16 ⚡ per siglare un Patto Istituzionale col Governatore!"); return; }
        if (!useTurnAction(`reg_pact_${regId}`, `Patto Istituzionale in ${regId}`)) return;
        game.ap -= 16;
        gov.approval = Math.min(88, (gov.approval || 55) + 5);
        if (!game.regOrg[regId]) game.regOrg[regId] = {};
        game.regOrg[regId][game.playerPartyId] = Math.min(100, (game.regOrg[regId][game.playerPartyId] || 50) + 3);
        game.govStability = Math.min(100, game.govStability + 2);
        addFeed(`🤝 <strong>INTESA STATO-REGIONE IN ${regId.toUpperCase()}:</strong> Accordo su sanità e infrastrutture col Governatore <strong>${gov.name}</strong> (+5% Gradimento Governatore, +3 Radicamento in ${regId}).`, 'ok');
      } else if (mode === 'challenge_gov') {
        if (game.ap < 18) { alert("Servono 18 ⚡ per lanciare un'offensiva politica contro la Giunta Regionale!"); return; }
        if (!useTurnAction(`reg_chal_${regId}`, `Inchiesta Politica sulla Giunta ${regId}`)) return;
        game.ap -= 18;
        gov.approval = Math.max(18, (gov.approval || 55) - 7);
        if (!game.regOrg[regId]) game.regOrg[regId] = {};
        game.regOrg[regId][game.playerPartyId] = Math.min(100, (game.regOrg[regId][game.playerPartyId] || 50) + 3);
        addFeed(`⚡ <strong>ATTACCO ALLA GIUNTA REGIONALE (${regId.toUpperCase()}):</strong> ${game.leader.name} denuncia liste d'attesa e bilanci della Giunta di <strong>${gov.name}</strong> (-7% Gradimento Governatore, +3 Radicamento in ${regId})!`, 'cr');
      } else if (mode === 'propose_cand') {
        proposeRegionalCandidateModal(regId);
        return;
      }
      recalcPolls(true);
      updateAllUI();
    }

export function proposeRegionalCandidateModal(regId) {
      if (game.isRetired) {
        alert("❌ MODALITÀ SPETTATORE:\nSei ritirato dalla vita politica attiva e non puoi proporre candidature!");
        return;
      }
      const gov = game.governors?.[regId] || INITIAL_GOVERNORS[regId];
      const p = getP();
      const isInd = (game.partyRole === 'independent' || p.id === 'ind');
      const myCoal = isInd ? 'INDIPENDENTE' : (p.coalId === 'cdx' ? 'cdx' : (p.coalId === 'csx' ? 'csx' : 'pld_c'));

      // PUNTO 1 (1.8.1): Se si gioca come membro (non Segretario), la scelta è prerogativa del Segretario!
      // Il membro può solo proporre la PROPRIA candidatura al Segretario!
      if (!isInd && game.partyRole === 'member') {
        const secName = p.leader;
        const isNative = (game.leader.region === regId);
        document.getElementById('mTag').textContent = `TAVOLO ELETTORALE • PROPOSTA CANDIDATURA IN ${regId.toUpperCase()}`;
        document.getElementById('mTitle').textContent = `🙋 Proponiti come Candidato Governatore in ${regId}`;
        document.getElementById('mBody').innerHTML = `
          <div style="font-size:13px; line-height:1.55; color:var(--text);">
            In qualità di <strong>semplice membro di partito</strong> in <strong>${p.name}</strong>, la designazione ufficiale dei candidati spetta statutariamente al <strong>Segretario Nazionale ${secName}</strong>.<br><br>
            Puoi avanzare la <strong>richiesta di candidatura personale</strong> alla segreteria per guidare la coalizione alle prossime <strong>Elezioni Regionali in ${regId}</strong>.<br>
            • Tuo Radicamento: <strong>${isNative ? `🏡 Nativo di ${regId} (+Bonus Radicamento +4.5% alle Urne)` : `Fuori regione (residente in ${game.leader.region})`}</strong><br>
            • Tuo Prestigio: <strong>${game.leader.prestige}%</strong> • Sostegno Interno: <strong>${game.leader.internalSupport}%</strong><br><br>
            Il Segretario <strong>${secName}</strong> valuterà se accogliere la tua autocandidatura.
          </div>
        `;
        const box = document.getElementById('mChoices');
        box.innerHTML = '';

        const btnProp = document.createElement('button');
        btnProp.className = 'm-btn';
        btnProp.innerHTML = `<strong>🙋 Chiedi l'Accettazione della Candidatura al Segretario ${secName}</strong><span>Sottoponi il tuo profilo alla Segreteria Nazionale per correre in ${regId}</span>`;
        btnProp.onclick = () => {
          const score = (isNative ? 40 : 12) + (game.leader.prestige * 0.35) + (game.leader.internalSupport * 0.35);
          const accepted = score >= 50 || Math.random() * 100 < score;
          if (accepted) {
            if (!game.governors[regId]) game.governors[regId] = { ...INITIAL_GOVERNORS[regId] };
            game.governors[regId].customCandidate = { polId: 'player_leader_pol', name: game.leader.name, partyId: p.id, coalId: myCoal };
            recordPoliticianHistory(game.leader.name, `Designato candidato ufficiale alla Presidenza della Regione ${regId} dalla Segreteria di ${p.short}`, 'Candidato Governatore');
            addFeed(`🏆 <strong>CANDIDATURA ACCOLTA!</strong> Il Segretario <strong>${secName}</strong> (${p.short}) accoglie la tua richiesta e ti candida ufficialmente a <strong>Governatore della Regione ${regId}</strong>!`, 'ok');
            setTicker(`REGIONALI ${regId.toUpperCase()}: ${game.leader.name} candidato Governatore per ${p.short}!`);
          } else {
            addFeed(`✋ <strong>CANDIDATURA RESPINTA:</strong> Il Segretario ${secName} ha respinto la tua autocandidatura per la Regione ${regId}: 'Il partito punta su dirigenti con altro profilo territoriale'.`);
            alert(`Il Segretario ${secName} ha respinto la tua candidatura per la Regione ${regId}.\nMotivazione: Prestigio o radicamento territoriale insufficiente secondo la segreteria.`);
          }
          closeModal();
          updateAllUI();
        };
        box.appendChild(btnProp);

        const btnBack = document.createElement('button');
        btnBack.className = 'm-btn';
        btnBack.innerHTML = `<strong>Rinuncia</strong><span>Non avanzare richieste di candidatura per ${regId}</span>`;
        btnBack.onclick = closeModal;
        box.appendChild(btnBack);
        openModal();
        return;
      }

      // PUNTO 6 (1.8.1): Se sei Segretario Nazionale:
      // - Candidabili SOLO membri del PROPRIO partito (NON di altri partiti della coalizione!)
      // - In nessun caso può essere candidato un Segretario di Partito (inclusi te stesso o segretari di altri partiti)!
      const allPartySecNames = new Set((game.parties || []).map(pt => pt.leader.toLowerCase().trim()));
      const candidates = isInd
        ? [ensurePlayerInPoliticians(), ...POLITICIANS.filter(pol => pol.partyId === 'tech' && pol.region === regId)]
        : POLITICIANS.filter(pol => {
            if (pol.partyId !== p.id) return false;
            const pNameLower = pol.name.toLowerCase().trim();
            if (allPartySecNames.has(pNameLower)) return false;
            if (pol.name === p.leader) return false;
            const off = getPersonCurrentOffice(pol);
            return (!off || off === `Presidente della Regione ${regId}`);
          });

      document.getElementById('mTag').textContent = `TAVOLO ELETTORALE • CANDIDATURA REGIONE ${regId.toUpperCase()}`;
      document.getElementById('mTitle').textContent = `🏛️ Designa il Candidato Governatore per ${p.short} in ${regId}`;
      document.getElementById('mBody').innerHTML = `
        <div style="font-size:13px; line-height:1.5;">
          In qualità di <strong>Segretario Nazionale di ${p.name}</strong>, scegli il candidato ufficiale del tuo partito per le prossime <strong>Elezioni Regionali in ${regId}</strong> (scadenza naturale: <strong>${gov?.nextElectionYear || 2028}</strong>).<br>
          • <strong>Regola Costituzionale:</strong> I candidati possono appartenere esclusivamente al tuo partito (<strong>${p.short}</strong>). I Segretari Nazionali di partito non possono candidarsi a Governatore.<br>
          • <em>I dirigenti nativi di ${regId} godono del <strong>Bonus Radicamento Nativo (+4.5%)</strong> alle urne!</em>
        </div>
      `;
      const box = document.getElementById('mChoices');
      box.innerHTML = '';
      if (candidates.length === 0) {
        box.innerHTML = `<div style="padding:10px; color:var(--muted);">Nessun quadro di ${p.short} eleggibile disponibile (i segretari nazionali non possono correre per la Regione).</div>`;
      } else {
        candidates.slice(0, 10).forEach(cand => {
          const isNative = (cand.region === regId);
          const btn = document.createElement('button');
          btn.className = 'm-btn';
          btn.innerHTML = `<strong>👤 ${cand.name} (${p.short}) ${isNative ? '🏡 [Radicato in ' + regId + ' +4.5%]' : ''}</strong><span>Competenza: ${cand.comp || 82} • Prestigio: ${cand.clout || 82} • ${cand.role || 'Quadro Regionale'}</span>`;
          btn.onclick = () => {
            if (!game.governors[regId]) game.governors[regId] = { ...INITIAL_GOVERNORS[regId] };
            game.governors[regId].customCandidate = { polId: cand.id, name: cand.name, partyId: p.id, coalId: myCoal };
            recordPoliticianHistory(cand.name, `Designato candidato ufficiale del partito alla Presidenza della Regione ${regId}`, 'Candidato Governatore');
            addFeed(`🗳️ <strong>CANDIDATURA IN ${regId.toUpperCase()}:</strong> <strong>${cand.name}</strong> è il candidato ufficiale di <strong>${p.short}</strong> alla Presidenza della Regione ${regId}!`, 'ok');
            closeModal();
            updateAllUI();
          };
          box.appendChild(btn);
        });
      }
      openModal();
    }

    // =========================================================================
    // TAB 10: EMICICLO MONTECITORIO (SINISTRA A SINISTRA, DESTRA A DESTRA) & QUIRINALE
    // =========================================================================

export function quirinaleAudienceAction() {
      if (game.ap < 15) { alert("Servono 15 ⚡!"); return; }
      if (!useTurnAction('quirinale_audience', 'Udienza al Quirinale')) return;
      game.ap -= 15;
      game.president.trust = Math.min(100, game.president.trust + 8);
      addFeed(`🏛️ Colloquio cordiale al Quirinale col Presidente <strong>${game.president.name}</strong> (+8% Fiducia Istituzionale).`);
      updateAllUI();
    }

    /* PUNTO 9 (v6.2): AZIONI COSTITUZIONALI QUANDO IL GIOCATORE È ELETTO PRESIDENTE DELLA REPUBBLICA */
export function quirinalePlayerAction(mode) {
      if (!game.president.isPlayer || game.isImprisoned) return;
      if (mode === 'moral_suasion') {
        if (game.ap < 15) { alert("Servono 15 ⚡!"); return; }
        if (!useTurnAction('q_moral', 'Monito del Quirinale')) return;
        game.ap -= 15;
        game.leader.prestige = Math.min(100, game.leader.prestige + 5);
        game.govStability = Math.min(100, game.govStability + 8);
        game.spread = Math.max(60, game.spread - 6);
        addFeed(`👑 <strong>MONITO DEL PRESIDENTE DELLA REPUBBLICA:</strong> Dal Quirinale il Presidente <strong>${game.leader.name}</strong> richiama le forze politiche alla coesione nazionale (+5% Prestigio, +8% Stabilità, -6 pt Spread)!`, 'ok');
      } else if (mode === 'remand') {
        if (game.ap < 20) { alert("Servono 20 ⚡!"); return; }
        if (!useTurnAction('q_remand', 'Rinvio Legge ex Art. 74 Cost.')) return;
        game.ap -= 20;
        game.president.trust = Math.min(100, game.president.trust + 8);
        game.leader.prestige = Math.min(100, game.leader.prestige + 6);
        addFeed(`⚖️ <strong>RINVIO ALLE CAMERE EX ART. 74 COST.:</strong> Il Presidente della Repubblica <strong>${game.leader.name}</strong> rifiuta la firma di una norma priva di copertura finanziaria e la rinvia con messaggio motivato al Parlamento (+8% Fiducia Colle, +6% Prestigio)!`, 'ok');
      } else if (mode === 'consult') {
        if (game.ap < 25) { alert("Servono 25 ⚡!"); return; }
        if (!useTurnAction('q_consult', 'Convocazione Premier al Colle')) return;
        game.ap -= 25;
        openManualGovernmentFormationModal(game.parties.filter(x => x.inGov && x.seats > 0), game.currentPM, game.currentGovCoalId);
        return;
      } else if (mode === 'dissolve') {
        if (game.ap < 35) { alert("Servono 35 ⚡!"); return; }
        // Punto 2: Limiti costituzionali Art. 88 Cost.
        if (isSemestreBianco()) {
          alert("❌ IMPEDIMENTO COSTITUZIONALE (Art. 88 comma 2 Cost.):\n" +
                "Il Presidente della Repubblica non può sciogliere le Camere negli ultimi 6 mesi del suo mandato presidenziale (Semestre Bianco), salvo che essi coincidano in tutto o in parte con gli ultimi 6 mesi della legislatura!");
          return;
        }
        const govSeats = game.parties.filter(p => p.inGov).reduce((s,p) => s + p.seats, 0);
        if (govSeats >= 201 && game.govStability > 40) {
          alert(`❌ PREROGATIVA COSTITUZIONALE (Art. 88 Cost.):\n` +
                `Il Governo in carica gode del sostegno di una maggioranza parlamentare solida (${govSeats} seggi su 400, Stabilità: ${game.govStability}%).\n` +
                `Il Presidente della Repubblica non può sciogliere arbitrariamente un Parlamento che esprime un Esecutivo con la piena fiducia delle Camere!\n` +
                `Lo scioglimento anticipato è un potere di garanzia che presuppone una paralisi parlamentare o una crisi insanabile.`);
          return;
        }
        if (!useTurnAction('q_dissolve', 'Scioglimento delle Camere')) return;
        game.ap -= 35;
        startElectoralCampaign(`Decreto di scioglimento anticipato delle Camere firmato dal Presidente della Repubblica ${game.leader.name} (Art. 88 Cost.)!`);
        return;
      }
      updateAllUI();
    }

    /* PUNTO 22: AZIONI DI ESILIO ESTERO PER IL GIOCATORE LATITANTE / RIFUGIATO */
export function exileAction(mode) {
      if (!game.inExile) return;
      if (mode === 'broadcast') {
        if (game.ap < 15) { alert("Servono 15 ⚡!"); return; }
        if (!useTurnAction('exile_broadcast', 'Comizio Clandestino')) return;
        game.ap -= 15;
        game.leader.prestige = Math.min(100, game.leader.prestige + 4);
        if (game.isDictatorship) game.revoltRisk = Math.min(98, game.revoltRisk + 8);
        addFeed(`📻 <strong>COMUNICATO CLANDESTINO DALL'ESTERO:</strong> Da <strong>${game.exileHost || 'esilio estero'}</strong>, <strong>${game.leader.name}</strong> trasmette un discorso a reti unificate via web (+4% Prestigio${game.isDictatorship ? ', +8% Rischio Rivolta in Italia' : ''})!`, 'ok');
      } else if (mode === 'diaspora') {
        if (game.ap < 18) { alert("Servono 18 ⚡!"); return; }
        if (!useTurnAction('exile_diaspora', 'Raccolta Fondi Diaspora')) return;
        game.ap -= 18;
        game.funds += 40;
        addFeed(`💰 <strong>SOSTEGNO DELLA DIASPORA:</strong> Grande raccolta fondi tra gli emigrati e gli esuli politici: entrano <strong>€ 40k</strong> nelle casse della tua causa!`, 'ok');
      } else if (mode === 'diplomacy') {
        if (game.ap < 22) { alert("Servono 22 ⚡!"); return; }
        if (!useTurnAction('exile_diplomacy', 'Udienza Diplomatica')) return;
        game.ap -= 22;
        game.leader.prestige = Math.min(100, game.leader.prestige + 5);
        const host = (game.exileHost || '').includes('Russia') ? 'russia' : ((game.exileHost || '').includes('Pechino') ? 'china' : 'usa');
        if (game.foreignRels[host]) game.foreignRels[host] = Math.min(100, game.foreignRels[host] + 12);
        addFeed(`🏛️ <strong>INCONTRO AL VERTICE INTERNAZIONALE:</strong> I vertici governativi di <strong>${game.exileHost || 'Paese Ospitante'}</strong> ti accolgono con gli onori di leader dell'opposizione (+5% Prestigio, +12 Relazione diplomatica)!`);
      } else if (mode === 'amnesty') {
        if (game.ap < 35) { alert("Servono 35 ⚡!"); return; }
        if (game.president.trust < 60 && game.leader.prestige < 65) {
          alert(`❌ ISTANZA D'AMNISTIA NON ACCOLTA:\nIl Quirinale e il Ministero della Giustizia richiedono almeno il 60% di Fiducia al Colle (attuale: ${game.president.trust}%) o il 65% di Prestigio Personale (attuale: ${game.leader.prestige}%) per concedere la riabilitazione giuridica.`);
          return;
        }
        if (!useTurnAction('exile_amnesty', 'Istanza di Amnistia al Quirinale')) return;
        game.ap -= 35;
        game.inExile = false;
        game.exileHost = null;
        game.leader.prestige = Math.min(100, game.leader.prestige + 8);
        addFeed(`🕊️ <strong>DECRETO DI AMNISTIA E RIABILITAZIONE:</strong> Il Presidente ${game.president.name} firma il decreto di amnistia e riabilitazione costituzionale! <strong>${game.leader.name}</strong> torna liberamente in Italia e può riprendere l'attività politica parlamentare!`, 'ok');
        setTicker(`RIENTRO DALL'ESILIO: Amnistia per ${game.leader.name}, rientro trionfale in Italia!`);
      }
      updateAllUI();
    }

    // =========================================================================

// =========================================================================
// HELPER METHODS PER VERIFICA E REGOLAZIONE REGOLE 1.8
// =========================================================================

export function isEligibleForPremier(name) {
  if (name === game.leader.name && (game.premierTermsServed || 1) >= 2 && game.currentPM === name) {
    return false;
  }
  return true;
}

export function isEligibleForPresident(name) {
  if (name === game.president.name && (game.presTermsServed || 1) >= 2) {
    return false;
  }
  return true;
}

export function isCandidateEligibleForGovernorship(name, regId) {
  const gov = game.governors?.[regId] || INITIAL_GOVERNORS[regId];
  if (gov && (gov.name === name || gov.polId === name) && (gov.termsServed || 1) >= 2) {
    return false;
  }
  return true;
}

export function getQuirinaleQuorum(ballotNum) {
  return ballotNum <= 3 ? 267 : 201;
}

export function calculateRegionalCandidateBonus(candidate, regId) {
  return (candidate && candidate.region === regId) ? 4.5 : 0;
}

export function buildReferendumQuestionText(law, targetIdx) {
  const opt = law?.options?.find(o => o.idx === targetIdx) || law?.options?.[0] || { status: 'Riforma', label: 'Nuova norma' };
  const curIdx = game.lawStates[law?.id] ?? law?.currentIdx ?? 0;
  const curOpt = law?.options?.find(o => o.idx === curIdx) || law?.options?.[0] || { status: 'Vigente', label: 'Norma in vigore' };
  return {
    yesMeaning: `Introduce la riforma: "${opt.status}" — ${opt.label}`,
    noMeaning: `Mantiene la normativa attuale: "${curOpt.status}" — ${curOpt.label}`
  };
}

export function applyReferendumDefeatShock() {
  game.govStability = Math.max(0, game.govStability - 18);
  game.spread = Math.min(450, game.spread + 9);
}

export function calcRevoltRisk() {
  const p = getP();
  const outlawedCount = game.outlawedParties ? game.outlawedParties.length : 0;
  if (game.isDictatorship) {
    const baseRevolt = outlawedCount * 6.5 + (100 - (p?.poll || 20)) * 0.25;
    return Math.max(game.revoltRisk || 0, Math.min(100, Math.round(baseRevolt)));
  }
  return game.revoltRisk || 0;
}

export function challengeLeadershipInternal() {
  const p = getP();
  if (!p || p.id === 'ind') return { won: false, reason: 'Non appartieni a un partito strutturato.' };
  const turnsSinceLastCong = game.turn - (game.lastCongressTurn || -365);
  if (turnsSinceLastCong < 52) {
    return { won: false, reason: 'Congresso celebrato di recente: cooldown di 52 settimane / 1 anno attivo.' };
  }
  const incumbentTrust = p.leaderTrust || 75;
  const isEntrenched = ['Matteo Salvini', 'Giorgia Meloni', 'Giuseppe Conte', 'Elly Schlein'].includes(p.leader);
  const incumbentPower = incumbentTrust + (isEntrenched ? 35 : 15);
  const challengerPower = (game.leader.internalSupport || 50) * 0.65 + (game.leader.prestige || 50) * 0.35;
  const won = challengerPower > incumbentPower;
  return { won, challengerPower, incumbentPower, reason: won ? 'Mozione vincente.' : 'Mozione respinta dai delegati.' };
}

export function triggerAiPoliticianDefection() {
  const eligibleParties = game.parties.filter(p => p.id !== 'ind' && p.seats >= 0);
  if (eligibleParties.length < 2) return false;

  // Scegli un partito di provenienza in crisi di coesione o calo consensi
  const fromParties = eligibleParties.filter(p => (p.cohesion || 75) <= 65 || p.poll < (p.initialPoll || p.poll));
  const fromParty = fromParties.length > 0 ? fromParties[Math.floor(Math.random() * fromParties.length)] : eligibleParties[Math.floor(Math.random() * eligibleParties.length)];

  const fromPols = POLITICIANS.filter(p => p.partyId === fromParty.id && !p.isPlayer && !getPersonCurrentOffice(p));
  if (fromPols.length === 0) return false;

  const pol = fromPols[Math.floor(Math.random() * fromPols.length)];
  const polIdeo = pol.compass?.ideoScore ?? getPartyIdeoScore(fromParty);

  // Trova partiti di destinazione compatibili per distanza ideologica (<= 0.8 pt) ed esclusione estremi opposti
  const compatibleDestParties = eligibleParties.filter(dest => {
    if (dest.id === fromParty.id) return false;
    const destIdeo = getPartyIdeoScore(dest);
    if (Math.abs(destIdeo - polIdeo) > 0.8) return false;
    // PUNTI 5 & 10 (1.8.1): Esclusione categorica tra estremi opposti (CasaPound/FN non possono andare a Sinistra/Comunisti e viceversa)
    if (polIdeo >= 3.2 && destIdeo <= 2.2) return false;
    if (polIdeo <= 0.8 && destIdeo >= 1.8) return false;
    return true;
  });

  if (compatibleDestParties.length === 0) return false;

  // Ordina per opportunità politica (partiti in governo o con sondaggi in crescita)
  compatibleDestParties.sort((a,b) => (b.inGov ? 1 : 0) - (a.inGov ? 1 : 0) || b.poll - a.poll);
  const toParty = compatibleDestParties[0];

  // Se la destinazione è il partito del giocatore e il giocatore è Segretario, apri la richiesta formale
  if (toParty.id === game.playerPartyId && game.partyRole === 'secretary' && !document.getElementById('modalBg').classList.contains('open')) {
    openDefectionOfferModal(pol, fromParty, toParty);
    return true;
  }

  // Transfughismo IA universale tra partiti IA
  pol.partyId = toParty.id;
  if (!game.politicianPartyMap) game.politicianPartyMap = {};
  game.politicianPartyMap[pol.id] = toParty.id;

  toParty.poll = Math.min(95, +(toParty.poll + 0.15).toFixed(1));
  toParty.cohesion = Math.max(20, (toParty.cohesion || 80) - 2);

  // PUNTO 7 (1.8.1): Se chi lascia era Segretario, il vecchio partito elegge SUBITO un nuovo Segretario
  if (fromParty.leader === pol.name) {
    const remaining = POLITICIANS.filter(p => p.partyId === fromParty.id && p.id !== pol.id && !p.isPlayer);
    const newLead = [...remaining].sort((a,b) => (b.clout || b.prestige || 50) - (a.clout || a.prestige || 50))[0] || generateNewPolitician(fromParty.id);
    fromParty.leader = newLead.name;
    fromParty.leaderAge = newLead.age;
    syncPartyNameWithLeader(fromParty, newLead.name);
    recordPoliticianHistory(newLead.name, `Eletto nuovo Segretario Nazionale di ${fromParty.short} in seguito all'addio di ${pol.name}`, `Segretario Nazionale ${fromParty.short}`);
  }

  // PUNTO 9 (1.8.1): Genera un nuovo membro nel vecchio partito per garantire uguaglianza numerica costante
  generateNewPolitician(fromParty.id);

  recordPoliticianHistory(pol.name, `Lascia ${fromParty.short} ed entra in ${toParty.short} per affinità politica`, `Dirigente ${toParty.short}`);
  addFeed(`🔄 <strong>TRANSFUGHISMO A MONTECITORIO:</strong> <strong>${pol.name}</strong> lascia <strong>${fromParty.name}</strong> e passa a <strong>${toParty.name} (${toParty.short})</strong>!`);
  setTicker(`TRANSFUGHI: ${pol.name} (${fromParty.short}) passa a ${toParty.short}!`);

  recalcPolls(true);
  updateAllUI();
  return true;
}

export function checkAiPartySplit(p) {
  if (!p || (p.cohesion || 75) > 28 || !p.wingLeader || p.poll < 7.0 || game.parties.length >= 26) {
    return false;
  }
  executePartySplit(p, false);
  return true;
}


/* PUNTI 2 & 3 (1.8.2): CABINA ELETTORALE DEL CITTADINO - TESTO PULITO SENZA UNITÀ RIDONDANTI E TUTTI I PARTITI PRESENTI */
export function openRegionalCitizenVotingBoothModal(regId, cands, onVoted) {
  openModal(
    `🗳️ Cabina Elettorale di ${regId} — Esercizio del Voto di Cittadino`,
    `<div style="font-size:13px; line-height:1.55; color:var(--text);">
      Sei regolarmente iscritto nelle liste elettorali della Regione <strong>${regId}</strong> (tua regione di residenza).<br><br>
      Entri nella cabina del tuo seggio elettorale con scheda e matita copiativa per esprimere il tuo <strong>voto personale e segreto</strong> per il Presidente della Giunta Regionale.<br><br>
      Traccia il segno sulla lista o sul candidato Governatore prescelto:
    </div>`,
    cands.map(cand => ({
      label: `🗳️ Vota ${cand.name} (${cand.label || cand.partyId.toUpperCase()})`,
      fn: () => {
        addFeed(`🗳️ <strong>VOTO REGIONALE ESPRESSO:</strong> Nella cabina di ${regId} hai espresso il tuo voto per <strong>${cand.name}</strong>.`, 'ok');
        closeModal();
        if (onVoted) onVoted(cand);
      }
    }))
  );
}

export function openNationalCitizenVotingBoothModal(reason, onVoted) {
  const eligibleParties = [...game.parties].filter(p => p.id !== 'ind').sort((a,b) => b.poll - a.poll);
  openModal(
    "🗳️ Cabina Elettorale — Elezioni Politiche della Repubblica",
    `<div style="font-size:13px; line-height:1.55; color:var(--text);">
      È il giorno delle <strong>Elezioni Politiche per la Camera dei Deputati (400 Seggi)</strong>!<br><br>
      Come ogni cittadino della Repubblica Italiana, ti rechi al seggio elettorale della tua sezione con tessera elettorale e documento d'identità.<br><br>
      Esprimi il tuo voto sulla scheda rosa per Montecitorio tracciando il segno sulla lista desiderata:
    </div>`,
    eligibleParties.map(pt => ({
      label: `🗳️ Vota ${pt.name} (${pt.short}) — Sondaggi: ${pt.poll}%`,
      fn: () => {
        pt.poll = +(pt.poll + 0.05).toFixed(1);
        addFeed(`🗳️ <strong>SCHEDA DEPOSITATA NELL'URNA:</strong> Hai espresso il tuo voto di cittadino per <strong>${pt.name} (${pt.short})</strong>!`, 'ok');
        closeModal();
        if (onVoted) onVoted(pt);
      }
    }))
  );
}

/* PUNTO 15 (1.8.1): MODAL DIMISSIONI VOLONTARIE DA QUALUNQUE CARICA */
export function openResignationModal() {
  const offices = getPlayerOfficesList();
  if (offices.length === 0) {
    openModal(
      "📜 Dimissioni da Incarichi Istituzionali",
      `<div style="font-size:13px; line-height:1.5; color:var(--text);">
        Al momento non ricopri alcuna carica istituzionale o di governo da cui rassegnare le dimissioni.<br><br>
        Sei un libero dirigente/cittadino della Repubblica.
      </div>`,
      [{ label: "Chiudi", fn: closeModal }]
    );
    return;
  }

  openModal(
    "📜 Rassegna Dimissioni da Incarichi Istituzionali",
    `<div style="font-size:13px; line-height:1.55; color:var(--text);">
      La Costituzione garantisce la facoltà di rimettere il proprio mandato in qualsiasi momento.<br>
      Seleziona la carica istituzionale o politica da cui intendi <strong>rassegnare formalmente le dimissioni</strong>:
    </div>`,
    [
      ...offices.map(off => ({
        label: `🔴 Rassegna Dimissioni da: ${off.label}`,
        fn: () => {
          resignPlayerOffice(off.type);
          addFeed(`📜 <strong>DIMISSIONI FORMALIZZATE:</strong> ${game.leader.name} ha rassegnato le dimissioni da <strong>${off.label}</strong>!`, 'cr');
          setTicker(`DIMISSIONI: ${game.leader.name} si dimette da ${off.label}.`);
          closeModal();
          updateAllUI();
        }
      })),
      {
        label: "Annulla",
        fn: closeModal
      }
    ]
  );
}

/* PUNTO 4 (1.8.2): AZIONE DI NOMINA / REVOCA DEL TITOLO ACCESSORIO DI VICEPREMIER */
export function toggleVicePremierAction(polId) {
  const isPlayerPM = (game.currentPM === game.leader.name) || (game.stateForm === 'presidenziale' && game.president.isPlayer) || game.isDictatorship;
  if (!isPlayerPM) {
    alert("❌ Prerogativa del Presidente del Consiglio:\nSolo chi guida l'Esecutivo può conferire o revocare la funzione di Vicepresidente del Consiglio dei Ministri.");
    return;
  }
  const isMinister = Object.values(game.cabinet).some(p => p && p.id === polId);
  if (!isMinister) {
    alert("❌ Carica accessoria:\nPer regolamento costituzionale, un Vicepremier deve essere prima di tutto titolare di un Ministero!");
    return;
  }
  const pol = POLITICIANS.find(p => p.id === polId);
  const polName = pol ? pol.name : polId;
  const wasVP = (game.vicePremiers || []).includes(polId);
  if (wasVP) {
    game.vicePremiers = (game.vicePremiers || []).filter(id => id !== polId);
    addFeed(`⭐ <strong>REVOCA VICEPREMIER:</strong> Revocata la funzione accessoria di Vicepremier a <strong>${polName}</strong>.`);
  } else {
    if (!game.vicePremiers) game.vicePremiers = [];
    if (game.vicePremiers.length >= 2) {
      const removedId = game.vicePremiers.shift();
      const remPol = POLITICIANS.find(p => p.id === removedId);
      addFeed(`ℹ️ Massimo 2 Vicepremier consentiti: <strong>${remPol?.name || removedId}</strong> cede il ruolo di Vicepremier.`);
    }
    game.vicePremiers.push(polId);
    addFeed(`⭐ <strong>NOMINA VICEPREMIER:</strong> <strong>${polName}</strong> è nominato ufficialmente <strong>Vicepresidente del Consiglio dei Ministri</strong>!`, 'ok');
  }
  updateAllUI();
}

/* PUNTO 10 (1.8.2): MODAL DRAMMATICO ED EVIDENTE PER LA CADUTA DEL GOVERNO */
export function triggerDramaticGovFallModal(reason = "Crollo irreversibile della stabilità politica di maggioranza") {
  const norm = (s) => String(s || '').replace(/\s*\(Tecnico\)|\s*\(Indip\.\)|\s*\(Bis\)/gi, '').trim().toLowerCase();
  const isPlayerPM = (norm(game.currentPM) === norm(game.leader.name));
  const pmDisplayName = game.currentPM;

  openModal(
    "🚨 CRISI DI GOVERNO — IL GOVERNO È CADUTO!",
    `<div style="font-size:13.5px; line-height:1.6; color:var(--text);">
      <div style="background:rgba(239, 68, 68, 0.15); border:1.5px solid #ef4444; border-radius:9px; padding:12px; margin-bottom:12px; text-align:center;">
        <div style="font-size:18px; font-weight:900; color:#f87171; letter-spacing:0.5px;">
          💥 PALAZZO CHIGI IN CRISI: DIMISSIONI DELL'ESECUTIVO
        </div>
        <div style="font-size:12px; color:#fca5a5; margin-top:4px;">
          ${reason}
        </div>
      </div>

      Il Governo presieduto da <strong>${pmDisplayName}</strong> ${isPlayerPM ? '(il tuo Esecutivo)' : ''} non ha più la maggioranza parlamentare alla Camera e al Senato!<br><br>
      • <strong>Stabilità dell'Esecutivo:</strong> <span style="color:#f87171; font-weight:800;">0% (Crollo Totale)</span><br>
      • <strong>Tensione sui Mercati:</strong> Spread a <strong>${game.spread} pt</strong> (Debito Pubblico al <strong>${game.debtPct}%</strong>)<br>
      • <strong>Passaggio Istituzionale:</strong> Il Presidente della Repubblica <strong>${game.president.name}</strong> prende atto della fine del Governo e apre formalmente le <strong>Consultazioni al Quirinale</strong> (Artt. 88-92 Costituzione).<br><br>
      <em>Tutti i leader di partito e i capigruppo sono convocati al Colle per verificare se sia possibile formare un nuovo governo politico o se affidare l'incarico a un Governo Tecnico del Presidente.</em>
    </div>`,
    [
      {
        label: "🏛️ Sali al Colle per le Consultazioni del Presidente della Repubblica →",
        fn: () => {
          closeModal();
          formTechnicalGovernment(null, 'stabilità');
        }
      }
    ]
  );
  addFeed(`🚨 <strong>CRISI DI GOVERNO APERTA:</strong> Il Governo presieduto da <strong>${pmDisplayName}</strong> è ufficialmente caduto! Il Presidente della Repubblica apre le consultazioni al Quirinale.`, 'cr');
  setTicker(`CRISI ISTITUZIONALE: Caduto il Governo ${pmDisplayName}. Consultazioni aperte al Quirinale!`);
  updateAllUI();
}

/* PUNTO 12 (1.8.2): MODAL DI APPROVAZIONE INGRESSO IN COALIZIONE PER IL LEADER */
export function openCoalitionAdmissionRequestModal(applicantParty, coalId) {
  const p = getP();
  const comp = computeCompat(p, applicantParty);
  openModal(
    `🤝 Richiesta di Ingresso nella Coalizione ${getCoalName(coalId)}`,
    `<div style="font-size:13.5px; line-height:1.6; color:var(--text);">
      In qualità di <strong>Leader e partito capofila della coalizione ${getCoalName(coalId)}</strong> (${p.name}), ti viene sottoposta la richiesta ufficiale di adesione:<br><br>
      • <strong>Partito Richiedente:</strong> <strong style="color:${applicantParty.color};">${applicantParty.name} (${applicantParty.short})</strong><br>
      • <strong>Segretario Nazionale:</strong> ${applicantParty.leader}<br>
      • <strong>Peso Elettorale:</strong> ${applicantParty.poll}% nei sondaggi (${applicantParty.seats} Deputati a Montecitorio)<br>
      • <strong>Compatibilità Programmatica coi tuoi Dossier:</strong> <strong>${comp.progScore}%</strong><br><br>
      Nella tua coalizione la leadership ti garantisce il <strong>diritto di veto e la decisione vincolante</strong>:<br>
      Accogli l'ingresso di ${applicantParty.short} nella tua alleanza o poni il veto politico del Leader?
    </div>`,
    [
      {
        label: `✅ Accetta l'ingresso di ${applicantParty.short} in ${getCoalName(coalId)}`,
        fn: () => {
          applicantParty.coalId = coalId;
          addFeed(`🤝 <strong>ACCORDO DI COALIZIONE:</strong> ${game.leader.name} ha accolto la richiesta di <strong>${applicantParty.name} (${applicantParty.short})</strong>, che entra ufficialmente nella coalizione <strong>${getCoalName(coalId)}</strong>!`, 'ok');
          closeModal();
          updateAllUI();
        }
      },
      {
        label: `⛔ Poni il Veto Politico del Leader (Respingi Richiesta)`,
        fn: () => {
          addFeed(`✋ <strong>VETO DEL LEADER:</strong> Dal vertice di ${p.short}, ${game.leader.name} ha posto il <strong>veto politico insormontabile</strong> all'ingresso di <strong>${applicantParty.short}</strong> nella coalizione ${getCoalName(coalId)}!`);
          closeModal();
          updateAllUI();
        }
      }
    ]
  );
}
