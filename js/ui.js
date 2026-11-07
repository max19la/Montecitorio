// =========================================================================
// MONTECITORIO - js/ui.js
// Rendering Interfaccia, Gestione del DOM, Modali, Temi e Selettori Custom
// =========================================================================

import {
  DISTINCT_PALETTE,
  getPartySVG,
  PRESET_POLITICIANS,
  STANCE_LABELS,
  DOSSIERS,
  BLOCS,
  INITIAL_PARTIES,
  HOT_LAWS,
  FOREIGN_POWERS,
  STATE_FORMS,
  PRES_CANDIDATES,
  MINISTRIES,
  POLITICIANS,
  FALLBACK_REGIONS,
  BILLS,
  EXEC_DECREES
} from './data.js';

import {
  game,
  charMode, setCharModeState,
  selectedStartPartyId, setSelectedStartPartyIdState,
  draftCabinet,
  draftSenateId,
  draftChamberId,
  draftGovParties,
  draftPMName,
  draftCoalKey,
  fmtDate,
  getCoalName,
  hasUsedTurnAction,
  useTurnAction,
  adjAllySat,
  ensurePlayerInPoliticians,
  getPlayerMinistry,
  getPersonCurrentOffice,
  getP,
  getPartyIdeoScore,
  getIdeoLabel,
  computePartyDrift,
  getPairRel,
  adjPairRel,
  getBetrayal,
  recalcDynamicVetoes,
  getPoliticianById
} from './state.js';

import {
  computeCompat,
  shiftBloc,
  recalcPolls,
  computeBlocMatch,
  getCoalLeaderParty,
  checkIdeologicalCoherenceAndConsequences,
  nextTurns,
  generateCencelliDraft,
  executeGovDecree,
  setDraftOfficeSlot,
  finalizeManualGovernment,
  openManualGovernmentFormationModal,
  renderManualGovModalContent,
  autoFormGovAI,
  changeForeignRel,
  openPersonalPartyFateModal,
  openSecretaryImpeachmentModal,
  openPartyCongressModal,
  openFailedCoupTrialModal,
  resolveActiveReferendumModal,
  openDirectPresidentialElectionModal,
  openQuirinaleBallotModal
} from './engine.js';

let activeSelectElement = null;

// PUNTO 5 (1.7): Helper universale per rendere ogni nome di politico cliccabile in tutta l'interfaccia
export function polLink(nameOrId, customLabel = null, extraStyle = '') {
  if (!nameOrId) return customLabel || 'N/D';
  const raw = String(nameOrId).replace(/\s*\(Tecnico\)/i, '').replace(/\s*\(Governo Tecnico\)/i, '').trim();
  if (raw === 'Amministratori Locali' || raw === 'Base Militante' || raw === 'Assemblea Regionale' || raw === 'Coordinamento Civico' || raw === 'Consiglio Direttivo' || raw === 'Militanti di Base' || raw === 'Rete Territoriale') {
    return customLabel || String(nameOrId);
  }
  const safeArg = raw.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const lbl = customLabel !== null ? customLabel : String(nameOrId);
  return `<span class="pol-click-link" style="cursor:pointer; text-decoration:underline; text-decoration-color:rgba(253,224,71,0.45); text-underline-offset:2px; ${extraStyle}" onclick="event.stopPropagation();openPoliticianCardModal('${safeArg}')" title="Clicca per aprire la Scheda Biografica e la Bussola 2D di ${raw.replace(/"/g, '&quot;')}">${lbl}</span>`;
}

export function setCharMode(m) {
      setCharModeState(m);
      document.getElementById('charPresetBox').style.display = m==='preset'?'block':'none';
      document.getElementById('charCustomBox').style.display = m==='custom'?'block':'none';
      document.getElementById('btnCharReal').style.background = m==='preset'?'var(--acc)':'var(--bg-2)';
      document.getElementById('btnCharCust').style.background = m==='custom'?'var(--acc)':'var(--bg-2)';
      if (m === 'preset') applyPresetPreview();
      else syncCustomRoleUI();
    }

export function applyPresetPreview() {
      const id = document.getElementById('selRealPolitician').value;
      const pr = PRESET_POLITICIANS.find(x => x.id === id) || PRESET_POLITICIANS[0];
      if (pr.partyId !== 'ind') {
        setSelectedStartPartyIdState(pr.partyId);
        document.body.classList.remove('theme-ind');
      } else {
        document.body.classList.add('theme-ind');
        applyDynamicPartyTheme('#f8fafc');
      }
      const roleTxt = pr.role==='secretary' ? '👑 Segretario / Leader Nazionale in carica' : (pr.role==='member' ? '⚔️ Governatore / Capocorrente interno (Può sfidare il Segretario al Congresso!)' : '📄 Personalità Indipendente della Repubblica (Tema Bianco)');
      document.getElementById('presetInfoCard').innerHTML = `
        <h4 style="color:var(--gold-lt);">${pr.name} (${pr.age} anni • ${pr.region})</h4>
        <div style="font-size:11px; color:#38bdf8; font-weight:700; margin-bottom:4px;">${roleTxt} • Orientamento: ${getIdeoLabel(pr.ideo)}</div>
        <p>${pr.desc}</p>
      `;
      document.getElementById('custBox').style.display = 'none';
      renderSetupParties();
    }

export function syncCustomRoleUI() {
      const r = document.getElementById('inStartRole').value;
      document.getElementById('fldIndIdeo').style.display = (r === 'independent') ? 'block' : 'none';
      document.getElementById('custBox').style.display = (r === 'founder') ? 'block' : 'none';
      if (r === 'independent') {
        document.body.classList.add('theme-ind');
        applyDynamicPartyTheme('#f8fafc');
      } else {
        document.body.classList.remove('theme-ind');
      }
    }

    export async function loadOfficialISTATGeoJSON() {
      // Usa sempre i confini ISTAT ad alta risoluzione incorporati offline (compatibilità 100% GitHub Pages)
      game.geoRegions = FALLBACK_REGIONS;
    }

export function selectSetupPartyCard(partyId) {
      setSelectedStartPartyIdState(partyId);
      document.body.classList.remove('theme-ind');
      if (charMode === 'preset') {
        const matchPol = PRESET_POLITICIANS.find(x => x.partyId === partyId && x.role === 'secretary')
          || PRESET_POLITICIANS.find(x => x.partyId === partyId);
        const selEl = document.getElementById('selRealPolitician');
        if (matchPol && selEl) {
          selEl.value = matchPol.id;
          applyPresetPreview();
          return;
        }
      }
      renderSetupParties();
    }

export function renderSetupParties() {
      document.getElementById('setupParties').innerHTML = INITIAL_PARTIES.map(p => `
        <div class="p-card ${p.id===selectedStartPartyId?'sel':''}" onclick="selectSetupPartyCard('${p.id}')">
          <div style="width:36px; height:36px; flex-shrink:0;">${getPartySVG(p.id,p.short,p.color)}</div>
          <div>
            <div style="font-weight:800; font-size:12px;">${p.name}</div>
            <div style="font-size:10px; color:var(--muted);">${polLink(p.leader)} (${p.leaderAge}a) • ${p.area}</div>
            <div style="font-size:10.5px; font-weight:800; color:${p.color};">${p.poll}% (${p.seats} seggi) ${p.inGov?'🟢':'🔴'}</div>
          </div>
        </div>
      `).join('');
      const selP = INITIAL_PARTIES.find(p => p.id === selectedStartPartyId);
      if (selP && !document.body.classList.contains('theme-ind')) applyDynamicPartyTheme(selP.color);
    }


export function openTutorialModal() {
      document.getElementById('mTag').textContent = "GUIDA UFFICIALE A MONTECITORIO 1.7";
      document.getElementById('mTitle').textContent = "📖 Come Funziona la Simulazione Politica";
      document.getElementById('mBody').innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:6px;">
          <div class="box">
            <h4>⏱️ 1. Tempo, Turni e Risorse</h4>
            <p>Usa la barra <strong>Cronometro della Repubblica</strong> (<code>+1 Giorno</code>, <code>+7 Giorni</code>, <code>+30 Giorni</code>) per far scorrere il calendario. Ogni settimana ricevi finanziamenti in <strong>Tesoreria (€)</strong>, rigeneri <strong>+18 ⚡ Capitale Politico</strong> e i sondaggi SWG si aggiornano.</p>
          </div>
          <div class="box">
            <h4>📜 2. Programma e Coerenza Ideologica</h4>
            <p>I 14 Dossier hanno 5 posizioni da <strong>🚩 Estrema Sinistra</strong> a <strong>🦅 Estrema Destra</strong>. Attenzione: se sei Segretario e stravolgi la linea storica del tuo partito (es. porti M5S o PD a destra), la <strong>Fiducia della Base crolla</strong>, rischi la <strong>sfiducia al Congresso</strong> e la tua coalizione ti espellerà!</p>
          </div>
          <div class="box">
            <h4>👤 3. Correnti, Congressi e Morte dei Partiti</h4>
            <p>Ogni partito ha <strong>3 correnti interne</strong>. Se sei Capocorrente, rafforza i tuoi circoli per sfidare il Segretario al Congresso! Se un partito personale (es. Italia Viva con Renzi) viene lasciato dal suo fondatore o crolla sotto lo 0.35%, rischia di <strong>sciogliersi o trasformarsi radicalmente</strong>.</p>
          </div>
          <div class="box">
            <h4>🏛️ 4. Governo Manuale e Presidenti Camere</h4>
            <p>Quando vinci le elezioni, il Quirinale ti chiama a <strong>comporre manualmente la lista dei 12 Ministri</strong> e ad eleggere il <strong>Presidente del Senato</strong> e il <strong>Presidente della Camera</strong>, bilanciando il Manuale Cencelli coi tuoi alleati.</p>
          </div>
          <div class="box">
            <h4>⚖️ 5. Temi Caldi, Referendum e Ordinamento</h4>
            <p>Nella scheda <em>Temi Caldi</em> vedi lo stato legale attuale in Italia (Cannabis, Matrimoni Egualitari, Armi, Eutanasia, Nucleare, Salario Minimo...) e puoi cambiarlo con un <strong>DDL in Aula</strong> o raccogliendo 500.000 firme per un <strong>Referendum Popolare</strong>! Puoi anche riformare la Costituzione (Presidenzialismo, Premierato, Federalismo).</p>
          </div>
          <div class="box">
            <h4>🌍 6. Politica Estera, UE/NATO, Golpe e Dittatura</h4>
            <p>Costruisci rapporti con USA, UE, Ucraina, Russia e Cina (avvicinarsi a Putin allontana Zelensky e Bruxelles!) e indice referendum su <strong>Italexit</strong> o <strong>NATO</strong>. I partiti estremisti con forte seguito possono tentare un <strong>Golpe</strong> per instaurare una <strong>Dittatura</strong> (ma se fallisce finisci a processo e in carcere!).</p>
          </div>
        </div>
      `;
      const box = document.getElementById('mChoices');
      box.innerHTML = `<button class="m-btn" onclick="closeModal()"><strong>✅ Ho capito, torna a Montecitorio</strong></button>`;
      openModal();
    }

    /* PUNTO 18: SPIEGAZIONE INTERATTIVA DI TUTTI GLI INDICATORI KPI IN ALTO */
export function explainKPI(key) {
      const p = getP();
      const info = {
        poll: {
          title: "📊 Consenso Elettorale / Influenza Nazionale",
          val: `${p.poll.toFixed(1)}% (${p.seats} Deputati attuali)`,
          desc: "Indica la percentuale di italiani che voterebbero oggi per il tuo partito nei sondaggi SWG (o la tua influenza nazionale se sei Indipendente).",
          how: "• <strong>Come sale:</strong> Allineando il Programma ai 12 Bacini Sociali, investendo budget settimanale in Comunicazione, aprendo Circoli nelle 20 Regioni e approvando leggi popolari.<br>• <strong>Attenzione:</strong> Se un partito scende stabilmente sotto lo 0.35%, rischia il dissesto e lo scioglimento!"
        },
        internal: {
          title: "⚔️ Forza della Tua Corrente Interna",
          val: `${game.leader.internalSupport}% dei delegati del partito`,
          desc: "Misura la percentuale di delegati, parlamentari e circoli del tuo partito che rispondono direttamente a te.",
          how: "• <strong>A cosa serve:</strong> Determina i tuoi voti quando sfidi il Segretario al <strong>Congresso Nazionale</strong> (serve il 51% per vincere) o quando lanci una Costituente Ideologica.<br>• <strong>Come sale:</strong> Radunando i circoli della tua corrente nella scheda <em>Carriera</em> (20 ⚡ e € 25k)."
        },
        trust: {
          title: "🤝 Fiducia della Base e della Direzione nel Segretario",
          val: `${game.partyRole==='independent'?'100% (Autonomo)':(p.leaderTrust||78)+'%'} (Scostamento dallo Statuto: ${computePartyDrift(p)})`,
          desc: "Rappresenta quanto gli iscritti e la Direzione Nazionale si fidano della linea politica del Segretario in carica.",
          how: "• <strong>Pericolo Sfiducia (Punto 1):</strong> Se sposti il programma del partito su posizioni opposte alla sua identità storica (es. porti un partito di sinistra a destra), la Fiducia crolla! Sotto il <strong>35%</strong> la Direzione convoca un Congresso Straordinario per destituirti!"
        },
        prestige: {
          title: "👑 Prestigio Personale e Autorevolezza Istituzionale",
          val: `${game.leader.prestige}%`,
          desc: "Misura la tua reputazione personale presso gli italiani, il Quirinale e le cancellerie internazionali, indipendentemente dal partito.",
          how: "• <strong>A cosa serve:</strong> Pesa nei Congressi di partito, nei Referendum Costituzionali e permette agli <strong>Indipendenti</strong> (con Prestigio >= 72%) di essere chiamati dal Quirinale a guidare un Governo Tecnico!<br>• <strong>Come sale:</strong> Conferenze programmatiche, successi di governo, interventi a Cernobbio e libri-manifesto."
        },
        funds: {
          title: "💶 Tesoreria di Partito",
          val: `€ ${game.funds}k`,
          desc: "Le risorse finanziarie disponibili nelle casse della tua struttura politica.",
          how: "• <strong>Entrate:</strong> Ogni settimana ricevi quote di tesseramento e contributi proporzionali al tuo consenso nei sondaggi, più il bottone <em>Tesseramento / Donazioni</em> (+€ 95k).<br>• <strong>Uscite:</strong> Budget settimanale Media TV/Social, apertura Circoli Regionali (€ 35k), raccolta firme Referendum (€ 35k)."
        },
        ap: {
          title: "⚡ Capitale Politico (Punti Azione)",
          val: `${game.ap} / 100 ⚡`,
          desc: "La tua energia politica e capacità di iniziativa parlamentare e mediatica.",
          how: "• <strong>Rigenerazione:</strong> Si ricarica automaticamente di <strong>+18 ⚡ ogni settimana (7 giorni)</strong> fino a un massimo di 100 ⚡.<br>• <strong>Utilizzo:</strong> Serve per cambiare i dossier del programma, depositare DDL, indire referendum, fare vertici diplomatici e azioni di governo."
        },
        stability: {
          title: game.isDictatorship ? "🔥 Rischio Rivolta / Tenuta del Regime" : "🏛️ Stabilità del Governo in Carica",
          val: game.isDictatorship ? `Stabilità Regime: ${game.govStability}% • Rischio Rivolta: ${game.revoltRisk}%` : `${game.govStability}% (Premier: ${game.currentPM})`,
          desc: game.isDictatorship
            ? "In una Dittatura indica la tenuta del potere contro il rischio di un'insurrezione popolare o contro-golpe militare."
            : "Misura la solidità della maggioranza parlamentare che sostiene il Governo a Palazzo Chigi.",
          how: game.isDictatorship
            ? "• Se il consenso popolare del regime è basso e il <strong>Rischio Rivolta raggiunge il 100%</strong>, scoppia l'insurrezione nazionale e il dittatore viene rovesciato e arrestato!"
            : "• Se scende a <strong>0%</strong> (per crisi di coalizione, spread oltre 250 pt o bocciature in Aula), il Governo cade e il Presidente della Repubblica avvia le consultazioni al Quirinale!"
        },
        macro: {
          title: "📈 Spread BTP-Bund & Crescita del PIL",
          val: `Spread: ${game.spread} pt • Crescita PIL: ${game.gdp>=0?'+':''}${game.gdp}% • Deficit: ${game.budget.deficit}%`,
          desc: "Il termometro della salute economica e finanziaria dell'Italia sui mercati internazionali.",
          how: "• <strong>Spread sopra 250 pt:</strong> Scatta l'allarme mercati e i partiti al Governo perdono consenso e stabilità ogni settimana.<br>• <strong>Come migliorarlo:</strong> Contenendo il Deficit sotto il 3.0%, nominando un Ministro MEF competente, investendo in energia/infrastrutture e mantenendo buone relazioni internazionali."
        },
        legislature: {
          title: "🗳️ Calendario Elettorale & Ordinamento dello Stato",
          val: `Ordinamento: ${STATE_FORMS.find(s=>s.id===game.stateForm)?.name || game.stateForm}`,
          desc: "Indica la forma di governo vigente nella Repubblica e i giorni mancanti alle prossime Elezioni Politiche.",
          how: "• Puoi cambiare la forma di Stato (es. passare alla <strong>Repubblica Presidenziale con elezione diretta del Presidente della Repubblica</strong> o al <strong>Premierato</strong>) nella scheda <em>Governo, Stato & Golpe</em>!"
        }
      }[key];
      if (!info) return;
      document.getElementById('mTag').textContent = "GUIDA AGLI INDICATORI (PUNTO 18)";
      document.getElementById('mTitle').textContent = info.title;
      document.getElementById('mBody').innerHTML = `
        <div class="box" style="border-color:var(--gold-bd); margin-bottom:10px;">
          <div style="font-size:14px; font-weight:800; color:var(--gold-lt); margin-bottom:4px;">Valore Attuale: ${info.val}</div>
          <p style="font-size:13px; color:var(--txt);">${info.desc}</p>
        </div>
        <div class="box">
          <h4>💡 Come Funziona e Come Gestirlo</h4>
          <p style="font-size:12.5px;">${info.how}</p>
        </div>
      `;
      document.getElementById('mChoices').innerHTML = `<button class="m-btn" onclick="closeModal()"><strong>Chiudi Spiegazione</strong></button>`;
      openModal();
    }


export function showTab(tabId, btnEl) {
      ['tCareer','tComm','tProg','tLaws','tCoal','tMin','tGov','tForeign','tMap','tParl'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === tabId) ? 'block' : 'none';
      });
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      if (btnEl) btnEl.classList.add('active');
      updateAllUI();
    }

    /* TAB 1: CARRIERA, 3 CORRENTI INTERNE, CONGRESSI, MORTE PARTITI PERSONALI & INDIPENDENTI (PUNTI 2, 3, 15, BUG FIX 2) */
export function renderCareerTab() {
      const p = getP();
      const myIdeo = game.leader.personalIdeo;
      const ideoLabel = getIdeoLabel(myIdeo);
      const isInd = (game.partyRole === 'independent');
      const isSec = (game.partyRole === 'secretary');
      const factions = p.factions || [
        { name:`Area Maggioritaria (${p.leader})`, leader:p.leader, share:58, desc:"Corrente guida del partito." },
        { name:p.wingName||"Area Riformista", leader:p.wingLeader||"Capocorrente", share:28, desc:"Principale corrente interna." },
        { name:"Circoli Territoriali", leader:"Amministratori Locali", share:14, desc:"Base militante regionale." }
      ];

      document.getElementById('cCareer').innerHTML = `
        ${game.isImprisoned ? `
          <div class="box" style="border:2px solid #ef4444; background:linear-gradient(135deg, rgba(153,27,27,0.30), rgba(15,18,30,0.95)); margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
              <h4 style="color:#fca5a5; margin:0;">⛓️ STATO DI DETENZIONE — CARCERE DI REBIBBIA (ROMA)</h4>
              <span style="background:#ef4444; color:#fff; font-weight:900; font-size:11px; padding:3px 10px; border-radius:99px;">
                Pena residua: ${game.prisonDaysLeft} giorni (~${(game.prisonDaysLeft/365).toFixed(1)} anni)
              </span>
            </div>
            <p style="margin-bottom:10px;">
              Sei personalmente detenuto a Rebibbia per <strong>${game.prisonReason || 'Art. 283 c.p. — Tentato Colpo di Stato'}</strong>. Il tuo precedente partito è stato <strong>messo fuori legge e sciolto dalla Magistratura</strong>.<br>
              Non assumi il controllo di nessun altro personaggio: <strong>resti sempre tu (${game.leader.name})</strong>! Fai scorrere il tempo col Cronometro in alto per scontare la pena oppure usa le azioni qui sotto dalla tua cella:
            </p>
            <div class="grid2">
              <button class="btn btn-m" onclick="prisonAction('memoir')">📖 Scrivi "Memoriale Politico da Rebibbia" (20 ⚡ → +5% Prestigio, -120 giorni pena per buona condotta)</button>
              <button class="btn" onclick="prisonAction('appeal')">⚖️ Ricorso in Cassazione / CEDU (€ 25k • 30 ⚡ → Riduce la condanna di 365 giorni)</button>
              <button class="btn btn-w" onclick="prisonAction('pardon')">🕊️ Chiedi la Grazia Presidenziale a ${game.president.name} (40 ⚡ → Scarcerazione immediata se pena &le; 730g)</button>
              <button class="btn btn-r" onclick="prisonAction('escape')">🚁 Piano di Evasione & Fuga Clandestina all'Estero (€ 45k • 45 ⚡ → 45% Esilio, 55% +365g Carcere Duro)</button>
            </div>
          </div>
        ` : ''}

        ${game.inExile ? `
          <div class="box" style="border:2px solid #38bdf8; background:linear-gradient(135deg, rgba(14,116,144,0.35), rgba(15,23,42,0.95)); margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
              <h4 style="color:#7dd3fc; margin:0;">✈️ STATO DI ESILIO POLITICO — RIFUGIATO A ${game.exileHost ? game.exileHost.toUpperCase() : 'ESTERO'}</h4>
              <span style="background:#0284c7; color:#fff; font-weight:900; font-size:11px; padding:3px 10px; border-radius:99px;">
                Status: Esule Politico • Mandato d'arresto attivo in Italia
              </span>
            </div>
            <p style="margin-bottom:10px; font-size:12px;">
              Ti trovi all'estero per sfuggire alla detenzione. La magistratura italiana ha spiccato un mandato di cattura, ma il Paese ospitante ti accorda asilo politico.<br>
              Non puoi tesserarti nei partiti italiani né assumere incarichi ministeriali finché non ottieni l'amnistia o la riabilitazione giuridica. Usa le azioni da esule:
            </p>
            <div class="grid2">
              <button class="btn btn-m" onclick="exileAction('broadcast')">📻 Comizio Clandestino & Streaming Web (15 ⚡ → +4% Prestigio${game.isDictatorship ? ', +8% Rivolta in Italia' : ''})</button>
              <button class="btn" onclick="exileAction('diaspora')">💰 Sostegno Economico della Diaspora (18 ⚡ → +€ 40k)</button>
              <button class="btn btn-w" onclick="exileAction('diplomacy')">🏛️ Udienza Diplomatica col Governo Ospitante (22 ⚡ → +12 Relazione & +5% Prestigio)</button>
              <button class="btn" style="border-color:#34d399; color:#34d399;" onclick="exileAction('amnesty')">🕊️ Istanza di Riabilitazione & Amnistia al Quirinale (35 ⚡)</button>
            </div>
          </div>
        ` : ''}
        <div class="grid2" style="margin-bottom:10px;">
          <div class="box" style="border-color:var(--gold-bd);">
            <div style="display:flex; justify-content:space-between; align-items:start;">
              <h4>👤 ${polLink('player_leader_pol', game.leader.name)} (${game.leader.age} anni • ${game.leader.region}) ${game.isImprisoned ? '<span style="color:#ef4444;">[⛓️ DETENUTO A REBIBBIA]</span>' : (game.inExile ? `<span style="color:#f87171;">[✈️ IN ESILIO A ${game.exileHost.toUpperCase()}]</span>` : '')}</h4>
              <button class="btn btn-w" style="font-size:10px; padding:3px 7px;" onclick="openPoliticianCardModal('player_leader_pol')">🧭 Scheda & Bussola 2D</button>
            </div>
            <p style="margin-bottom:6px;">
              Orientamento Ideologico: <strong style="color:var(--gold-lt);">${ideoLabel} (${myIdeo}/4.0)</strong><br>
              Status Attuale: <strong style="color:#38bdf8;">${game.isImprisoned ? `⛓️ Ex-Leader Detenuto a Rebibbia (${game.prisonDaysLeft} giorni alla libertà)` : (game.inExile ? `✈️ Esule politico a ${game.exileHost}` : (isInd ? '📄 Personalità Indipendente (Tema Bianco Istituzionale)' : (isSec ? `👑 Segretario Nazionale di ${p.name} (Congresso nel ${p.nextCongYear||2028})` : `⚔️ Capocorrente interno in ${p.name} (Segretario: ${polLink(p.leader)}, Congresso nel ${p.nextCongYear||2028})`)))}</strong>
            </p>
            <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px; background:var(--bg-1); padding:7px; border-radius:6px; font-size:11px; text-align:center; margin-bottom:8px;">
              <div>Prestigio Personale<br><strong style="color:#d8b4fe; font-size:13px;">${game.leader.prestige}%</strong></div>
              <div>${isInd ? 'Autorevolezza Colle' : 'Forza Tua Corrente'}<br><strong style="color:#34d399; font-size:13px;">${game.leader.internalSupport}%</strong></div>
              <div>${isInd ? 'Libertà d’Azione' : 'Fiducia della Base'}<br><strong style="color:${(p.leaderTrust||78)<45?'#ef4444':'#fde047'}; font-size:13px;">${game.isImprisoned ? '0% (Recluso)' : (isInd ? '100%' : (p.leaderTrust||78)+'%')}</strong></div>
            </div>

            ${game.isImprisoned ? `
              <div style="font-size:11.5px; color:#fca5a5; background:rgba(239,68,68,0.12); padding:8px; border-radius:6px; border:1px solid rgba(239,68,68,0.3);">
                🔒 Le attività politiche ordinarie sono sospese fino alla tua scarcerazione o evasione da Rebibbia.
              </div>
            ` : (isInd ? `
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button class="btn btn-m" onclick="indAction('saggio')">📘 Pubblica Saggio Programmatico (20 ⚡ → +6% Prestigio)</button>
                <button class="btn" onclick="indAction('cernobbio')">🎙️ Relazione al Forum di Cernobbio (25 ⚡ → +8% Prestigio & +€ 40k)</button>
                <button class="btn btn-w" onclick="indAction('found_party')">🏛️ Fonda un Tuo Partito Politico (€ 80k • 35 ⚡ • Parte da 0.4%)</button>
              </div>
            ` : `
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button class="btn btn-m" onclick="internalPartyAction('build_faction')">🤝 Raduna i Circoli della Tua Corrente (€ 25k • 20 ⚡ → +8% Forza Corrente)</button>
                ${!isSec ? `
                  <button class="btn btn-w" onclick="internalPartyAction('challenge_congress')">🗳️ Chiedi Convocazione Congresso per Sfidare ${p.leader} (35 ⚡)</button>
                ` : `
                  <button class="btn" onclick="internalPartyAction('pacify')">🕊️ Patto Interno coi Capicorrente (20 ⚡ → +10% Coesione & +8% Fiducia)</button>
                `}
                <button class="btn btn-r" onclick="internalPartyAction('split')">⚡ Guida una Scissione da ${p.short} (40 ⚡)</button>
                <button class="btn" style="background:#f8fafc; color:#0f172a; font-weight:800;" onclick="internalPartyAction('go_ind')">📄 Lascia ${p.short} e diventa Indipendente</button>
              </div>
            `)}
          </div>

          <!-- LE 3 CORRENTI INTERNE DEL PARTITO (PUNTO 3) -->
          <div class="box">
            <h4>🏛️ Correnti Politiche Interne in ${isInd ? 'Montecitorio' : p.name}</h4>
            ${isInd ? `
              <p>Come personalità <strong>Indipendente</strong> non sei vincolato alla disciplina di partito. Puoi essere chiamato al Quirinale per guidare un Governo Istituzionale, candidarti al Colle, fondare un partito o entrare in uno dei 24 partiti qui sotto.</p>
            ` : `
              <p style="margin-bottom:6px;">Equilibrio attuale tra le <strong>${factions.length} correnti interne</strong> di ${p.short} (Coesione: <strong>${p.cohesion}%</strong> • Scostamento Statuto: <strong>${computePartyDrift(p)}</strong>):</p>
              <div style="display:flex; flex-direction:column; gap:5px;">
                ${factions.map((f, idx) => `
                  <div style="background:var(--bg-1); padding:6px 9px; border-radius:7px; border-left:3px solid ${idx===0?p.color:(idx===1?'#fde047':'#38bdf8')}; font-size:11.5px;">
                    <div style="display:flex; justify-content:space-between;">
                      <strong>${idx===0?'👑':'⚔️'} ${f.name} — Leader: <em>${polLink(f.leader)}</em></strong>
                      <strong style="color:var(--gold-lt);">${f.share}%</strong>
                    </div>
                    <div style="font-size:10.5px; color:var(--muted);">${f.desc}</div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

        <div class="box" style="margin-bottom:10px;">
          <h4>🔄 Passaggio a un Altro Partito & Effetto sui Partiti Personali</h4>
          <p>Quando entri in un altro partito, entri come <strong>Capocorrente interno</strong> e devi vincere il Congresso per diventarne Segretario. Se lasci un partito che dipendeva dalla tua leadership (es. <em>Renzi lascia Italia Viva per il PD</em>), potrai scegliere se <strong>sciogliere il tuo vecchio partito facendolo confluire</strong> nel nuovo (+seggi e +forza corrente) o lasciarlo trasformare/crollare! E se sei Presidente del Consiglio e cambi casacca, si aprirà immediatamente la <strong>Crisi di Governo al Quirinale</strong>!</p>
        </div>

        <div class="grid3">
          ${game.parties.filter(x => x.id !== game.playerPartyId).map(target => {
            const tIdeo = getPartyIdeoScore(target);
            const dist = +(Math.abs(myIdeo - tIdeo)).toFixed(2);
            const bet = getBetrayal(game.playerPartyId, target.id);
            const isBlocked = dist > 1.35 || bet;
            return `
              <div class="box" style="border-color:${isBlocked?'rgba(239,68,68,0.25)':'rgba(16,185,129,0.4)'};">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:4px;">
                  <div style="display:flex; align-items:center; gap:8px; cursor:pointer;" onclick="openPartyInspectorModal('${target.id}')" title="Clicca per ispezionare struttura, correnti e programma di ${target.name}">
                    <div style="width:28px; height:28px; flex-shrink:0;">${getPartySVG(target.id,target.short,target.color)}</div>
                    <div>
                      <h4 style="text-decoration:underline; text-decoration-color:rgba(255,255,255,0.25);">${target.name} (${target.poll}%) 🔍</h4>
                      <div style="font-size:10px; color:var(--muted);">Segretario: <strong>${polLink(target.leader)}</strong> • ${target.area}</div>
                    </div>
                  </div>
                </div>
                ${game.isImprisoned ? `
                  <div style="font-size:10.5px; color:#f87171; margin-top:4px;">🔒 Non puoi iscriverti a partiti mentre sei detenuto a Rebibbia</div>
                ` : (isBlocked ? `
                  <div style="font-size:10.5px; color:#f87171; margin-top:4px;">⛔ ${bet ? `Rancore storico (${bet.reason})` : `Distanza ideologica eccessiva (${dist})`}</div>
                ` : `
                  <button class="btn" style="width:100%; margin-top:5px;" onclick="joinPartyAsMember('${target.id}')">
                    ➡️ Entra in ${target.short} come Capocorrente (30 ⚡)
                  </button>
                `)}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }


export function renderCommTab() {
      const p = getP(), s = game.commStrategy;
      const isInd = (game.partyRole === 'independent');
      document.getElementById('cComm').innerHTML = `
        ${game.campaignActive ? `
          <div class="box" style="margin-bottom:10px; border:2px solid var(--gold); background:rgba(239,68,68,0.14);">
            <h4 style="color:var(--gold-lt);">🔥 Mobilitazione Straordinaria di Campagna Elettorale (Urne tra ${game.campaignDaysRemaining} giorni)</h4>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;">
              <button class="btn btn-w" onclick="campAct('duello')">📺 Confronto Finale su Rai 1 (€ 40k • 25 ⚡)</button>
              <button class="btn btn-m" onclick="campAct('piazza')">🇮🇹 Chiusura a Piazza San Giovanni (€ 65k • 30 ⚡)</button>
            </div>
          </div>
        ` : ''}
        <div class="box" style="margin-bottom:10px; border-color:var(--gold-bd);">
          <div class="grid3">
            <div class="fld"><label>1° Bacino Sociale Target</label><select onchange="game.commStrategy.targetBloc1=this.value;updateAllUI()">${BLOCS.map(b=>`<option value="${b.id}" ${s.targetBloc1===b.id?'selected':''}>${b.name} (${b.share}%)</option>`).join('')}</select></div>
            <div class="fld"><label>2° Bacino Sociale Target</label><select onchange="game.commStrategy.targetBloc2=this.value;updateAllUI()">${BLOCS.map(b=>`<option value="${b.id}" ${s.targetBloc2===b.id?'selected':''}>${b.name} (${b.share}%)</option>`).join('')}</select></div>
            <div class="fld"><label>Dossier Spinto sui Media</label><select onchange="game.commStrategy.focusIssue=this.value;updateAllUI()">${DOSSIERS.map(d=>`<option value="${d.key}" ${s.focusIssue===d.key?'selected':''}>${d.title}</option>`).join('')}</select></div>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;">
            <div style="flex:1; min-width:200px;">
              <label style="font-size:11px; color:var(--gold-lt); font-weight:700;">Investimento Settimanale Media: € <strong id="lblCommBud">${isInd ? 0 : s.weeklyBudget}</strong>k</label>
              <input type="range" min="0" max="80" step="0.5" value="${s.weeklyBudget}" ${isInd||game.isImprisoned?'disabled':''} oninput="document.getElementById('lblCommBud').innerText=this.value; game.commStrategy.weeklyBudget=parseFloat(this.value);" />
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn" onclick="orgAct('funds')">💶 Tesseramento / Donazioni (25 ⚡ → +€ 95k)</button>
              <button class="btn btn-m" onclick="orgAct('cred')">🏛️ Conferenza Programmatica (30 ⚡ → +5% Cred./Prestigio)</button>
            </div>
          </div>
        </div>
        <div class="grid2">
          ${BLOCS.map(b => {
            const m = Math.round(computeBlocMatch(p, b));
            const topP = [...game.parties].sort((x,y) => computeBlocMatch(y,b)*(game.blocSympathy[y.id]?.[b.id]||1) - computeBlocMatch(x,b)*(game.blocSympathy[x.id]?.[b.id]||1))[0];
            return `<div class="box"><div style="display:flex; justify-content:space-between;"><h4>${b.name}</h4><strong style="font-size:12px; color:var(--gold-lt);">${b.share}%</strong></div><div style="display:flex; justify-content:space-between; font-size:11.5px; margin-top:5px;"><span>Affinità Programma: <strong style="color:${m>=60?'#34d399':(m>=40?'#fde047':'#f87171')};">${m}%</strong></span><span>1° Partito: <strong style="color:${topP.color};">${topP.short}</strong></span></div></div>`;
          }).join('')}
        </div>
      `;
    }


export function renderProgTab() {
      const p = getP();
      const isInd = (game.partyRole === 'independent');
      const isMember = (game.partyRole === 'member');
      const drift = computePartyDrift(p);
      const curIdeo = getPartyIdeoScore(p);

      document.getElementById('cProg').innerHTML = `
        ${isMember ? `
          <div class="box" style="border:1.5px solid #f59e0b; background:rgba(245,158,11,0.12); margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <div>
                <strong style="color:#fde047; font-size:12.5px;">🔒 Programma Ufficiale di ${p.short} Riservato al Segretario</strong>
                <p style="font-size:11.5px; margin:2px 0 0 0;">Come membro/capocorrente non puoi modificare arbitrariamente i dossier. Il Programma Ufficiale appartiene al Segretario Nazionale (<strong>${polLink(p.leader)}</strong>). Per imporre la tua linea, sfidalo al prossimo Congresso o guida una scissione.</p>
              </div>
              <button class="btn btn-w" style="font-size:11px;" onclick="showTab('tCareer', document.querySelectorAll('.nav-item')[0])">🗳️ Scheda Congresso →</button>
            </div>
          </div>
        ` : ''}

        <div class="box" style="margin-bottom:12px; border-color:${drift>0.9?'#ef4444':'var(--gold-bd)'};">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div>
              <h4 style="color:var(--gold-lt);">🧭 Bussola Ideologica del Programma: ${getIdeoLabel(curIdeo)} (Indice: ${curIdeo} / 4.0)</h4>
              <p>
                ${isInd ? 'Come Indipendente puoi definire liberamente il tuo manifesto personale.' : `
                  Identità Storica di <strong>${p.short}</strong>: <strong>${getIdeoLabel(p.baseIdeo ?? curIdeo)} (${p.baseIdeo ?? curIdeo})</strong> •
                  Scostamento dallo Statuto: <strong style="color:${drift>0.9?'#ef4444':(drift>0.45?'#fde047':'#34d399')};">${drift}</strong> (Oltre 1.35 o sotto 35% Fiducia scatta la <strong>Sfiducia al Segretario</strong> e l'espulsione dalla coalizione!)
                `}
              </p>
            </div>
            ${!isInd && drift >= 0.45 ? `
              <button class="btn btn-w" onclick="launchIdeologicalConstituent()">🔥 Costituente di Rifondazione Ideologica (45 ⚡ • Richiede 70% Corrente)</button>
            ` : ''}
          </div>
          <div class="st-spectrum-bar">
            <span style="color:#fca5a5;">🚩 [0] Estrema Sinistra</span>
            <span style="color:#6ee7b7;">🌹 [1] Progressista (Sinistra)</span>
            <span style="color:#67e8f9;">⚖️ [2] Riformista (Centro)</span>
            <span style="color:#93c5fd;">🔵 [3] Conservatrice (Destra)</span>
            <span style="color:#c7d2fe;">🦅 [4] Estrema Destra</span>
          </div>
        </div>

        ${DOSSIERS.map(d => {
          const cur = p.stances[d.key] ?? 2;
          const basePos = p.baseStances?.[d.key] ?? cur;
          const isF = game.flagshipIssues.has(d.key);
          return `
            <div class="manifesto-box">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:4px;">
                <div>
                  <strong style="font-size:13.5px; color:var(--gold-lt);">${d.title}</strong>
                  <span style="font-size:11px; color:var(--muted); margin-left:8px;">Posizione attuale: <strong>${STANCE_LABELS[cur].tag}</strong></span>
                </div>
                <button class="btn" style="background:${isF?'var(--gold)':'var(--bg-1)'}; color:${isF?'#000':'var(--muted)'}; padding:3px 9px; font-size:11px;" onclick="toggleFlag('${d.key}')">${isF?'⭐ Tema Bandiera':'☆ Imposta Bandiera'}</button>
              </div>
              <div class="st-grid">
                ${d.opts.map((l,i) => {
                  const lbl = STANCE_LABELS[i];
                  const isBase = (!isInd && basePos === i);
                  return `
                    <div class="st-opt ${cur===i?'active':''}" onclick="setStance('${d.key}',${i})">
                      <div class="st-badge ${lbl.cls}">
                        <span>${lbl.short}</span>
                        ${isBase ? '<span title="Posizione Storica dello Statuto del Partito">🏛️ Statuto</span>' : ''}
                      </div>
                      <div style="margin-top:3px;">${l}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      `;
    }


export function renderLawsTab() {
      const box = document.getElementById('cLaws');
      if (!box) return;
      const p = getP();

      const changedCount = HOT_LAWS.filter(l => (game.lawStates[l.id] ?? l.currentIdx) !== l.currentIdx).length;
      const ref = game.activeReferendum;

      box.innerHTML = `
        ${ref ? `
          <div class="box" style="border:2px solid #8b5cf6; background:linear-gradient(135deg, rgba(88,28,135,0.35), rgba(15,23,42,0.95)); margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
              <div>
                <h4 style="color:#d8b4fe; margin:0;">🗳️ CAMPAGNA REFERENDARIA IN CORSO: ${ref.title.toUpperCase()}</h4>
                <div style="font-size:11.5px; color:var(--txt); margin-top:2px;">Quesito: <strong>${ref.targetLabel}</strong></div>
              </div>
              <span style="background:#7c3aed; color:#fff; font-weight:900; font-size:11.5px; padding:4px 10px; border-radius:99px;">
                ⏳ Urne tra ${ref.daysLeft} giorni • SÌ stimato: ${ref.yesPct.toFixed(1)}%
              </span>
            </div>
            <div class="p-bar" style="margin:6px 0 8px 0;"><div class="p-fill" style="width:${ref.yesPct}%; background:linear-gradient(90deg, #10b981, #8b5cf6);"></div></div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn btn-m" onclick="campaignReferendumAction('yes')">📣 Comizio Nazionale per il SÌ (18 ⚡ → +4.5% SÌ)</button>
              <button class="btn btn-r" onclick="campaignReferendumAction('no')">🛑 Mobilitazione per il NO (18 ⚡ → +4.5% NO)</button>
            </div>
          </div>
        ` : ''}
        <div class="box" style="border-color:${game.isDictatorship?'#ef4444':'var(--gold-bd)'}; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div>
              <h4 style="color:${game.isDictatorship?'#fca5a5':'var(--gold-lt)'};">
                ${game.isDictatorship ? '🦅 Codici del Regime & Decreti Dittatoriali sui 16 Temi Sociali e Civili' : '⚖️ Codice dei Diritti & Stato Legale dei 16 Temi Caldi nella Repubblica Italiana'}
              </h4>
              <p>
                ${game.isDictatorship
                  ? 'Con il Parlamento esautorato, non hai bisogno di votazioni d\'Aula o Referendum: puoi <strong>imporre qualsiasi modifica normativa per Decreto Dittatoriale immediato (15 ⚡)</strong>, ma le misure impopolari faranno salire il Rischio Rivolta!'
                  : 'Consulta lo stato legale attuale in Italia dei 16 grandi temi civili, penali ed economici. Puoi riformarli depositando un <strong>DDL in Parlamento (25 ⚡)</strong> oppure raccogliendo 500.000 firme per un <strong>Referendum Popolare (€ 45k • 30 ⚡ → avvia 30 giorni di Campagna Referendaria con vincolo di 1 anno tra due referendum sullo stesso tema)</strong>.'}
              </p>
            </div>
            <div style="background:var(--bg-1); border:1px solid var(--bd); padding:6px 12px; border-radius:8px; font-size:11.5px;">
              Leggi modificate in partita: <strong style="color:#34d399;">${changedCount} / ${HOT_LAWS.length}</strong>
            </div>
          </div>
        </div>

        <div class="grid2">
          ${HOT_LAWS.map(law => {
            const curIdx = game.lawStates[law.id] ?? law.currentIdx;
            const curOpt = law.options.find(o => o.idx === curIdx) || law.options[0];
            const isGreen = curOpt.status.includes('🟢');
            const isRed = curOpt.status.includes('🔴');
            const stColor = isGreen ? '#34d399' : (isRed ? '#f87171' : '#fde047');
            const refCdLeft = Math.max(0, (game.referendumCooldowns[law.id] || 0) - game.turn);
            const lawCdLeft = Math.max(0, (game.lawCooldowns[law.id] || 0) - game.turn);
            const dObj = DOSSIERS.find(d => d.key === law.dossier);
            const dTitle = dObj ? dObj.title : law.dossier.toUpperCase();
            const isInd = (game.partyRole === 'independent' || p.id === 'ind');
            const myPartyStance = isInd ? (game.personalStances[law.dossier] ?? 2) : (p.stances[law.dossier] ?? Math.round(getPartyIdeoScore(p)));

            return `
              <div class="law-card" style="background:rgba(15,23,42,0.75); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px; box-shadow:0 8px 24px rgba(0,0,0,0.35);">
                <div class="law-card-head" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                  <div>
                    <div style="font-size:14px; font-weight:800; color:#fff;">${law.title}</div>
                    <div style="font-size:11px; color:var(--muted); margin-top:2px;">
                      Dossier: <strong style="color:#38bdf8;">${dTitle}</strong> • Linea ${isInd ? 'Personale' : `Programma ${p.short}`}: <strong style="color:var(--gold-lt);">${STANCE_LABELS[myPartyStance].short}</strong>
                      ${lawCdLeft > 0 ? ` • <span style="color:#f59e0b; font-weight:800;">⏳ Moratoria Aula: ${lawCdLeft}g</span>` : ''}
                      ${refCdLeft > 0 ? ` • <span style="color:#f87171; font-weight:800;">🔒 Vincolo Ref.: ${refCdLeft}g</span>` : ''}
                    </div>
                  </div>
                  <span class="law-status-pill" style="background:rgba(255,255,255,0.06); color:${stColor}; border:1px solid ${stColor}66; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:800;">
                    VIGENTE
                  </span>
                </div>
                <div style="font-size:12px; color:var(--text); background:rgba(8,13,24,0.85); padding:10px 12px; border-radius:8px; border-left:3px solid ${stColor}; margin-bottom:12px;">
                  <div style="font-size:11px; font-weight:800; color:${stColor}; margin-bottom:2px;">⚖️ NORMATIVA VIGENTE IN ITALIA: ${curOpt.status.replace(/^[🟢🟡🔴]\s*/, '')}</div>
                  <div>${curOpt.label.replace(/^Stato attuale:\s*/i, '').replace(/^Proibizionismo attuale:\s*/i, '')}</div>
                </div>
                <div style="font-size:11px; color:var(--gold-lt); font-weight:800; letter-spacing:0.5px; margin-bottom:8px;">
                  ${game.isDictatorship ? '⚡ IMPONI MODIFICA PER DECRETO DITTATORIALE:' : '🏛️ PROPOSTE DI RIFORMA PARLAMENTARE O REFERENDUM POPOLARE:'}
                </div>
                <div style="display:flex; flex-direction:column; gap:8px;">
                  ${law.options.filter(o => o.idx !== curIdx).map(opt => {
                    const targetStance = opt.targetStance ?? 2;
                    const myDist = Math.abs(myPartyStance - targetStance);
                    const cleanOptStatus = opt.status.replace(/\s*\(Stato attuale\)|\s*\(Vigente\)/gi, '').replace(/^[🟢🟡🔴]\s*/, '');
                    const cleanOptLabel = opt.label.replace(/^Stato attuale:\s*/i, '').replace(/^Proibizionismo attuale:\s*/i, '');
                    const alignBadge = myDist === 0
                      ? `<div style="font-size:10.5px; color:#34d399; font-weight:800; margin-top:3px;">✅ In Piena Linea col Programma ${isInd ? 'Personale' : `di ${p.short}`} (${STANCE_LABELS[targetStance].short})</div>`
                      : (myDist === 1
                        ? `<div style="font-size:10.5px; color:#fde047; font-weight:800; margin-top:3px;">⚖️ Compatibile col Programma ${isInd ? 'Personale' : `di ${p.short}`} (${STANCE_LABELS[targetStance].short})</div>`
                        : `<div style="font-size:10.5px; color:#f87171; font-weight:800; margin-top:3px;">⛔ Contrario al Programma vigente ${isInd ? 'Personale' : `di ${p.short}`} (Richiede ${STANCE_LABELS[targetStance].short})</div>`);
                    return `
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; background:rgba(255,255,255,0.03); border:1px solid ${myDist >= 2 && !isInd ? 'rgba(239,68,68,0.35)' : 'var(--bd)'}; border-radius:8px; padding:9px 11px; flex-wrap:wrap;">
                      <div style="flex:1; min-width:170px;">
                        <div style="font-size:11.5px; font-weight:800; color:#fff;"><span class="badge" style="background:rgba(56,189,248,0.15); color:#38bdf8; font-size:10px; margin-right:4px;">RIFORMA</span> ${cleanOptStatus}</div>
                        <div style="font-size:11px; color:var(--muted); margin-top:3px;">${cleanOptLabel}</div>
                        ${alignBadge}
                      </div>
                      <div style="display:flex; gap:5px; flex-wrap:wrap;">
                        ${game.isImprisoned ? `
                          <span style="font-size:10.5px; color:#f87171;">🔒 Detenuto a Rebibbia</span>
                        ` : (game.isDictatorship ? `
                          <button class="btn btn-r" style="padding:5px 9px; font-size:10.5px;" onclick="imposeHotLawByDecree('${law.id}', ${opt.idx})">
                            🦅 Imponi per Decreto (15 ⚡)
                          </button>
                        ` : `
                          <button class="btn" style="padding:5px 8px; font-size:10.5px; ${lawCdLeft > 0 ? 'opacity:0.5;' : (!isInd && myDist >= 2 ? 'border-color:#ef4444; color:#fca5a5;' : '')}" onclick="proposeHotLawParliament('${law.id}', ${opt.idx})">
                            🏛️ ${lawCdLeft > 0 ? `Moratoria (${lawCdLeft}g)` : (!isInd && myDist >= 2 ? `⛔ Contrario a ${p.short}` : 'DDL in Aula (25 ⚡)')}
                          </button>
                          <button class="btn btn-w" style="padding:5px 8px; font-size:10.5px; ${refCdLeft>0||lawCdLeft>0||game.activeReferendum?'opacity:0.55;':''}" onclick="launchHotLawReferendum('${law.id}', ${opt.idx})">
                            🗳️ ${refCdLeft > 0 ? `Bloccato (${refCdLeft}g)` : (lawCdLeft > 0 ? `Moratoria (${lawCdLeft}g)` : 'Referendum 30g (€ 45k • 30 ⚡)')}
                          </button>
                        `)}
                      </div>
                    </div>
                  `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }


export function renderCoalTab() {
      const box = document.getElementById('cCoal');
      if (!box) return;
      const p = getP();
      const isInd = (game.partyRole === 'independent');
      const curCoalName = getCoalName(p.coalId);
      const otherParties = game.parties.filter(o => o.id !== game.playerPartyId).sort((a,b) => b.poll - a.poll);

      const dissolvedHtml = (game.dissolvedParties && game.dissolvedParties.length > 0) ? `
        <div class="box" style="border-color:var(--err); background:rgba(239,68,68,0.08); margin-bottom:12px;">
          <h4 style="color:#fca5a5;">${game.isDictatorship ? '⛓️ Partiti Messi Fuori Legge dal Regime o Disciolti' : '🪦 Partiti Disciolti, Messi Fuori Legge o Confluiti'} (${game.dissolvedParties.length})</h4>
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
            ${game.dissolvedParties.map(dp => `<span style="font-size:11px; background:var(--bg-0); border:1px solid var(--bd); padding:3px 8px; border-radius:6px; color:var(--muted);"><strong style="color:${dp.color||'#f87171'};">${dp.short}</strong> (${dp.name}) — <em>${dp.reason} (${dp.date||'Storico'})</em></span>`).join('')}
          </div>
        </div>
      ` : '';

      if (game.isDictatorship) {
        box.innerHTML = `
          <div class="box" style="border:2px solid #ef4444; background:linear-gradient(135deg, rgba(153,27,27,0.32), rgba(15,10,15,0.95)); margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
              <div>
                <h4 style="color:#fca5a5;">🦅 Tribunale Speciale del Regime — Messa Fuorilegge dei Partiti d'Opposizione</h4>
                <p>
                  In qualità di Capo del Regime (<strong>${game.dictatorshipName}</strong>) puoi <strong>mettere fuori legge e sciogliere gli altri partiti</strong>: confischerai la loro tesoreria (<strong>+€ 35k</strong> ciascuno) e <strong>tutti i loro seggi a Montecitorio passeranno al tuo Partito Unico (${p.short}: ${p.seats}/400 seggi)</strong>! Attenzione: mettere fuori legge partiti molto votati spinge i loro militanti nella resistenza clandestina (+Rischio Rivolta).
                </p>
              </div>
              ${otherParties.length > 0 ? `
                <button class="btn btn-r" style="font-weight:900; padding:8px 14px;" onclick="outlawAllOppositionParties()">
                  🚫 DECRETO PARTITO UNICO: Metti Fuori Legge TUTTI i Partiti (40 ⚡)
                </button>
              ` : `<span style="color:#34d399; font-weight:900; font-size:12px;">✅ PARTITO UNICO INSTAURATO (100% Seggi a ${p.short})</span>`}
            </div>
          </div>

          ${dissolvedHtml}

          ${otherParties.length === 0 ? `
            <div class="box" style="text-align:center; padding:24px; border-color:var(--gold);">
              <h4 style="color:var(--gold-lt); font-size:16px;">🦅 STATO A PARTITO UNICO (${p.name} — 400 Seggi su 400)</h4>
              <p>Tutte le opposizioni sono state messe fuori legge e sciolte dal Tribunale Speciale. Controlla il Rischio Rivolta (${game.revoltRisk}%) nella scheda Governo!</p>
            </div>
          ` : `
            <div class="grid2">
              ${otherParties.map(o => {
                const revoltHit = Math.max(2, Math.round(o.poll * 0.8));
                return `
                  <div class="box" style="border-color:rgba(239,68,68,0.4); margin-bottom:0;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:28px; height:28px;">${getPartySVG(o.id, o.short, o.color)}</div>
                        <div>
                          <strong style="color:${o.color}; font-size:13.5px;">${o.name} (${o.short})</strong>
                          <div style="font-size:10.5px; color:var(--muted);">Leader: <strong>${o.leader}</strong> • ${getIdeoLabel(getPartyIdeoScore(o))}</div>
                        </div>
                      </div>
                      <span style="font-size:11px; padding:2px 8px; border-radius:99px; background:var(--bg-1); font-weight:800;">${o.poll.toFixed(1)}% (${o.seats} seggi)</span>
                    </div>
                    <p style="font-size:11px; margin-bottom:8px;">
                      Stato attuale: <strong style="color:#fde047;">Opposizione Tollerata / Vigilata</strong> • Impatto messa fuori legge: <strong>+${o.seats} seggi a ${p.short}, +€ 35k confiscati, +${revoltHit}% Rischio Rivolta</strong>
                    </p>
                    <button class="btn btn-r" style="width:100%; font-weight:800;" onclick="outlawPartyByRegime('${o.id}')">
                      🚫 Metti Fuori Legge ${o.short}, Arresta i Vertici & Confisca Seggi (15 ⚡)
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        `;
        return;
      }

      const coalMembers = (!isInd && p.coalId !== 'none') ? game.parties.filter(x => x.coalId === p.coalId).sort((a,b)=>b.poll-a.poll) : [p];
      const coalPollSum = coalMembers.reduce((s,x)=>s+(x.poll||0), 0);
      const coalSeatsSum = coalMembers.reduce((s,x)=>s+(x.seats||0), 0);
      const coalLead = (!isInd && p.coalId !== 'none') ? getCoalLeaderParty(p.coalId) : p;
      const isCoalLeader = (!isInd && coalLead && coalLead.id === p.id);
      const existingCoalIds = Array.from(new Set(game.parties.map(x => x.coalId))).filter(cid => cid && cid !== 'none' && cid !== p.coalId);

      const inspTarget = game.parties.find(x => x.id === game.selectedDossierPartyId) || otherParties[0] || game.parties[0];
      const inspCmp = computeCompat(p, inspTarget);

      box.innerHTML = `
        <!-- PUNTO 5 & 6 (v6.2): PANNELLO COMPLETO DI GESTIONE DELLA COALIZIONE & TAVOLO DEI POLI -->
        <div class="box" style="border-color:var(--gold-bd); margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:8px;">
            <div>
              <h4 style="color:var(--gold-lt); margin-bottom:3px;">
                🤝 Gestione Coalizione & Alleanze: <strong style="color:#fff;">${isInd ? 'Indipendente / Non Coalizzato' : curCoalName}</strong>
              </h4>
              <p>
                ${isInd
                  ? 'Come personalità Indipendente puoi dialogare con tutti i partiti, mediare tra i poli o iscriverti a una forza politica. <strong>Tocca qualsiasi icona di partito o nome di politico per aprirne la Scheda Completa!</strong>'
                  : `Membri del tuo Polo: <strong>${coalMembers.map(m=>m.short).join(' • ')}</strong> — Consenso Totale: <strong style="color:#34d399;">${coalPollSum.toFixed(1)}%</strong> (<strong>${coalSeatsSum} seggi</strong> su 400) • Leader Coalizione: <strong>${coalLead ? polLink(coalLead.leader) + ' (' + coalLead.short + ')' : polLink(p.leader)}</strong>.`}
              </p>
            </div>
            ${!isInd && !game.isImprisoned ? (() => {
              const cLeader = p.coalId !== 'none' ? getCoalLeaderParty(p.coalId) : null;
              const isLeader = !cLeader || cLeader.id === p.id;
              return `
              <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                ${isLeader ? `
                  <input type="text" id="customCoalInput" value="${curCoalName}" placeholder="Nome coalizione..." style="width:185px; padding:6px 10px; font-size:12px;" />
                  <button class="btn btn-w" onclick="renamePlayerCoalition()">✏️ ${p.coalId==='none'?'Fonda Polo':'Rinomina Polo'}</button>
                ` : `
                  <span class="badge" style="background:rgba(255,255,255,0.06); color:var(--text-muted); font-size:11px; padding:6px 10px; border-radius:6px; border:1px solid var(--bd);">
                    🔒 Capofila: <strong>${cLeader ? cLeader.name : 'Alleato'}</strong> (${cLeader ? cLeader.poll.toFixed(1) : ''}%) — Solo il capofila può rinominare
                  </span>
                `}
                ${p.coalId !== 'none' ? `<button class="btn btn-r" onclick="leaveCurrentCoalition()">🚪 Esci dal Polo</button>` : ''}
              </div>`;
            })() : ''}
          </div>

          ${!isInd && !game.isImprisoned ? `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding-top:8px; border-top:1px solid var(--bd);">
              <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
                <span style="font-size:11px; color:var(--muted); font-weight:700;">Membri attuali del tuo Polo:</span>
                ${coalMembers.map(m => `
                  <span style="display:inline-flex; align-items:center; gap:5px; background:var(--bg-1); border:1px solid ${m.color}; padding:3px 8px; border-radius:99px; font-size:11px;">
                    <span style="cursor:pointer; font-weight:800; color:${m.color};" onclick="openPartyInspectorModal('${m.id}')">${m.short} (${m.poll.toFixed(1)}% • ${m.seats}s) 🔍</span>
                    ${isCoalLeader && m.id !== p.id ? `<button class="btn btn-r" style="padding:1px 6px; font-size:9.5px;" onclick="expelCoalitionMember('${m.id}')" title="Espelli ${m.short} dalla coalizione">✖ Espelli</button>` : ''}
                  </span>
                `).join('')}
              </div>
              ${existingCoalIds.length > 0 ? `
                <div style="display:flex; gap:5px; flex-wrap:wrap; align-items:center;">
                  <span style="font-size:11px; color:var(--muted);">Chiedi ingresso in:</span>
                  ${existingCoalIds.map(cid => `<button class="btn" style="padding:4px 8px; font-size:10.5px;" onclick="requestJoinExistingCoalition('${cid}')">➡️ Entra in ${getCoalName(cid)} (20 ⚡)</button>`).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- CONFRONTO PROGRAMMATICO SUI 14 DOSSIER E RAPPORTI COL PARTITO SELEZIONATO (PUNTO 6) -->
        ${inspTarget ? `
          <div class="box" style="border-color:${inspTarget.color}; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="openPartyInspectorModal('${inspTarget.id}')">
                <div style="width:36px; height:36px;">${getPartySVG(inspTarget.id, inspTarget.short, inspTarget.color)}</div>
                <div>
                  <h4 style="color:${inspTarget.color}; margin:0;">🔍 Confronto Programmatico & Struttura: ${inspTarget.name} (${inspTarget.short})</h4>
                  <div style="font-size:11px; color:var(--muted);">Segretario: <strong>${polLink(inspTarget.leader)} (${inspTarget.leaderAge}a)</strong> • Capocorrente: <strong>${polLink(inspTarget.wingLeader || 'N/D')}</strong> • Compatibilità Globale: <strong style="color:${inspCmp.total>=60?'#34d399':'#fde047'};">${inspCmp.total}%</strong></div>
                </div>
              </div>
              <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                <select onchange="game.selectedDossierPartyId=this.value;renderCoalTab()" style="width:210px; font-size:11.5px; padding:5px 8px;">
                  ${game.parties.map(pt => `<option value="${pt.id}" ${pt.id===inspTarget.id?'selected':''}>${pt.name} (${pt.short} — ${pt.poll.toFixed(1)}%)</option>`).join('')}
                </select>
                <button class="btn btn-w" style="font-size:11px;" onclick="openPartyInspectorModal('${inspTarget.id}')">🏛️ Apri Scheda Completa & Correnti di ${inspTarget.short}</button>
              </div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(185px, 1fr)); gap:5px; font-size:10.5px;">
              ${DOSSIERS.map(d => {
                const myV = p.stances[d.key] ?? 2;
                const thV = inspTarget.stances[d.key] ?? 2;
                const diff = Math.abs(myV - thV);
                const col = diff === 0 ? '#34d399' : (diff === 1 ? '#fde047' : '#f87171');
                return `
                  <div style="background:var(--bg-1); border:1px solid var(--bd); border-left:3px solid ${col}; padding:4px 7px; border-radius:5px;">
                    <div style="font-weight:800; color:#fff;">${d.title}</div>
                    <div style="color:var(--muted);">Tu: <strong>${STANCE_LABELS[myV].short}</strong> vs ${inspTarget.short}: <strong style="color:${col};">${STANCE_LABELS[thV].short}</strong></div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${dissolvedHtml}

        <div class="grid2">
          ${otherParties.map(o => {
            const cmp = computeCompat(p, o);
            const same = (!isInd && o.coalId === p.coalId && p.coalId !== 'none');
            const oCoalName = getCoalName(o.coalId);
            return `
              <div class="box" style="border-color:${same?'var(--gold)':'var(--bd)'}; margin-bottom:0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <div style="display:flex; align-items:center; gap:8px; cursor:pointer;" onclick="openPartyInspectorModal('${o.id}')" title="Clicca per aprire la scheda completa di ${o.name}">
                    <div style="width:30px; height:30px;">${getPartySVG(o.id, o.short, o.color)}</div>
                    <div>
                      <strong style="color:${o.color}; font-size:13.5px; text-decoration:underline; text-decoration-color:rgba(255,255,255,0.25);">${o.name} (${o.short}) 🔍</strong>
                      <div style="font-size:10.5px; color:var(--muted);">Leader: <strong>${polLink(o.leader)}</strong> • ${getIdeoLabel(getPartyIdeoScore(o))}</div>
                    </div>
                  </div>
                  <span style="font-size:11px; padding:2px 8px; border-radius:99px; background:var(--bg-1); font-weight:800;">${o.poll.toFixed(1)}% (${o.seats} seggi)</span>
                </div>
                <div style="font-size:11px; color:var(--muted); margin-bottom:6px; display:flex; justify-content:space-between; flex-wrap:wrap;">
                  <span>Polo: <strong style="color:var(--txt);">${oCoalName}</strong></span>
                  <span>Affinità Programma: <strong style="color:${cmp.progScore>=60?'#34d399':(cmp.progScore<44?'#f87171':'#fde047')};">${cmp.progScore}%</strong> • Relazione: <strong>${cmp.rel}%</strong></span>
                </div>
                <div style="margin-bottom:8px;">
                  <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:3px;">
                    <span>Compatibilità Globale: <strong style="color:${cmp.total>=62?'#34d399':(cmp.total>=45?'#fde047':'#f87171')}">${cmp.total}%</strong></span>
                    <span>${cmp.hasVeto ? '<strong style="color:#f87171;">⛔ VETO ATTIVO</strong>' : '<span style="color:#34d399;">✅ Nessun Veto</span>'}</span>
                  </div>
                  <div class="p-bar"><div class="p-fill" style="width:${cmp.total}%; background:${cmp.total>=62?'#10b981':(cmp.total>=45?'#f59e0b':'#ef4444')}"></div></div>
                </div>
                ${game.isImprisoned ? `<div style="font-size:10.5px; color:#f87171;">🔒 Diplomazia bloccata (Detenuto a Rebibbia)</div>` : `
                  <div style="display:flex; gap:5px; flex-wrap:wrap;">
                    <button class="btn" style="padding:5px 8px; font-size:11px;" onclick="openPartyInspectorModal('${o.id}')">🔍 Struttura & Correnti</button>
                    <button class="btn" style="padding:5px 8px; font-size:11px;" onclick="diploAct('${o.id}','summit')">🤝 Vertice (12 ⚡)</button>
                    <button class="btn" style="padding:5px 8px; font-size:11px;" onclick="diploAct('${o.id}','attack')">⚔️ Attacca (10 ⚡)</button>
                    ${cmp.hasVeto && cmp.progScore >= 48 ? `<button class="btn btn-m" style="padding:5px 8px; font-size:11px;" onclick="diploAct('${o.id}','liftVeto')">🕊️ Patto di Disgelo (20 ⚡)</button>` : ''}
                    ${isInd ? `<button class="btn btn-w" style="padding:5px 8px; font-size:11px;" onclick="joinPartyAsMember('${o.id}')">📥 Iscriviti (${o.short})</button>` : (!same && !cmp.hasVeto && cmp.total >= 52 ? `<button class="btn btn-m" style="padding:5px 8px; font-size:11px;" onclick="diploAct('${o.id}','invite')">➕ Patto di Coalizione (22 ⚡)</button>` : '')}
                    ${same && isCoalLeader ? `<button class="btn btn-r" style="padding:5px 8px; font-size:11px;" onclick="expelCoalitionMember('${o.id}')">✖ Espelli dal Polo</button>` : ''}
                  </div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }


export function renderMinTab() {
      const box = document.getElementById('cMin');
      if (!box) return;
      ensurePlayerInPoliticians();
      const p = getP();
      const govParties = game.parties.filter(pt => pt.inGov && pt.seats > 0);
      const oppParties = game.parties.filter(pt => !pt.inGov && pt.seats > 0);
      const govPartyIds = new Set(govParties.map(pt => pt.id));
      const totalGovSeats = Math.max(1, govParties.reduce((a,b) => a + b.seats, 0));
      const isPlayerPM = (game.currentPM === game.leader.name && p.inGov) || (game.stateForm === 'presidenziale' && game.president.isPlayer) || game.isDictatorship;
      const myMin = getPlayerMinistry();
      const isPresidential = (game.stateForm === 'presidenziale');

      // SOLO politici appartenenti ai partiti della Maggioranza di Governo!
      const majorityPols = POLITICIANS.filter(x => govPartyIds.has(x.partyId));
      // Per i Ministeri: solo politici dei partiti di Maggioranza + Tecnici Indipendenti
      const ministerPool = POLITICIANS.filter(x => govPartyIds.has(x.partyId) || x.partyId === 'tech');

      box.innerHTML = `
        <!-- PUNTO 3 (1.7): QUADRO ESPLICITO DEI PARTITI AL GOVERNO (MAGGIORANZA) E ALL'OPPOSIZIONE -->
        <div class="box" style="border-color:#10b981; background:linear-gradient(135deg, rgba(16,185,129,0.12), rgba(11,18,32,0.95)); margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
            <div>
              <h4 style="color:#34d399; margin:0;">
                🟢 PARTITI ATTUALMENTE AL GOVERNO (${game.isTechnicalGov ? 'Governo Tecnico di Garanzia' : (isPresidential ? `Esecutivo Presidenziale ${game.president.name}` : `Coalizione ${getCoalName(game.currentGovCoalId)} — Governo ${game.currentPM}`)})
              </h4>
              <div style="font-size:11.5px; color:var(--muted); margin-top:2px;">
                ${isPresidential ? `Presidente della Repubblica e Capo dell'Esecutivo: <strong style="color:var(--gold-lt);">${polLink(game.president.name)}</strong>` : `Presidente del Consiglio in carica: <strong style="color:var(--gold-lt);">${polLink(game.currentPM)}</strong>`} •
                Forza parlamentare della Maggioranza: <strong style="color:#34d399;">${govParties.reduce((s,x)=>s+x.seats,0)} / 400 Deputati</strong>
              </div>
            </div>
            <span style="background:rgba(16,185,129,0.2); color:#34d399; border:1px solid #10b981; padding:4px 10px; border-radius:99px; font-size:11px; font-weight:800;">
              ${p.inGov ? '✅ Il Tuo Partito è AL GOVERNO' : '⚔️ Il Tuo Partito è ALL\'OPPOSIZIONE'}
            </span>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:6px;">
            ${govParties.map(pt => `
              <div style="display:inline-flex; align-items:center; gap:6px; background:var(--bg-0); border:1.5px solid ${pt.color}; padding:4px 9px; border-radius:8px; cursor:pointer; font-size:11.5px;" onclick="openPartyInspectorModal('${pt.id}')" title="Ispeziona ${pt.name}">
                <span style="width:18px; height:18px; display:inline-flex;">${getPartySVG(pt.id, pt.short, pt.color)}</span>
                <strong style="color:${pt.color};">${pt.name} (${pt.short})</strong>
                <span style="color:#fff; font-weight:800;">${pt.seats} seggi</span>
                <span style="color:var(--muted); font-size:10.5px;">• ${polLink(pt.leader)}</span>
              </div>
            `).join('')}
          </div>
          ${oppParties.length > 0 ? `
            <div style="font-size:11px; color:var(--muted); border-top:1px solid var(--bd); padding-top:6px;">
              🔴 <strong>Partiti all'Opposizione (${oppParties.reduce((s,x)=>s+x.seats,0)} seggi):</strong>
              ${oppParties.map(pt => `<span style="cursor:pointer; color:${pt.color}; font-weight:700; margin-left:6px;" onclick="openPartyInspectorModal('${pt.id}')">${pt.short} (${pt.seats}s)</span>`).join(' • ')}
            </div>
          ` : ''}
        </div>

        <!-- PUNTO 17 (v6.2): PANNELLO OPERATIVO DEL GIOCATORE NOMINATO MINISTRO -->
        ${myMin ? `
          <div class="box" style="border:2px solid var(--gold); background:linear-gradient(135deg, rgba(212,175,55,0.16), rgba(15,23,42,0.96)); margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
              <div>
                <h4 style="color:var(--gold-lt); margin:0;">💼 IL TUO DICASTERO MINISTERIALE: ${myMin.ministry.name.toUpperCase()}</h4>
                <p style="margin-top:2px;">
                  Sei titolare di questo Ministero nel <strong>Governo ${polLink(game.currentPM)}</strong> (una sola carica istituzionale consentita). Esercita i poteri del tuo portafoglio ministeriale per incidere sull'azione di governo e far crescere il tuo prestigio e il consenso del tuo partito:
                </p>
              </div>
              <span style="background:rgba(212,175,55,0.22); color:var(--gold-lt); border:1px solid var(--gold); padding:4px 10px; border-radius:99px; font-size:11px; font-weight:800;">
                🏛️ Ministro in Carica (${polLink('player_leader_pol', game.leader.name)})
              </span>
            </div>
            <div class="grid3" style="margin-top:6px;">
              <button class="btn btn-m" onclick="playerMinistryAction('directive')">📜 Direttiva Ministeriale & Decreto Attuativo (18 ⚡ → +5% Prestigio, +Consenso)</button>
              <button class="btn btn-w" onclick="playerMinistryAction('funds')">💶 Sblocca Fondi & Cantieri del Ministero (€ 25k • 20 ⚡ → +0.08% PIL, +4% Stab.)</button>
              <button class="btn" onclick="playerMinistryAction('media')">🎙️ Conferenza Stampa al Ministero (14 ⚡ → +4% Credibilità ${p.short})</button>
            </div>
          </div>
        ` : ''}

        <!-- PUNTO 2 & 20: PRESIDENTE DEL SENATO E PRESIDENTE DELLA CAMERA (CON CONTROLLO RIGOROSO UNICITÀ CARICHE) -->
        <div class="box" style="border-color:${game.isDictatorship?'#ef4444':'var(--gold-bd)'}; margin-bottom:12px;">
          <h4 style="color:${game.isDictatorship?'#fca5a5':'var(--gold-lt)'};">
            ${game.isDictatorship ? '🦅 Presidenze delle Assemblee del Regime (Palazzo Madama & Montecitorio)' : '🏛️ Alte Cariche dello Stato — Presidenza del Senato (2ª Carica) e della Camera (3ª Carica)'}
          </h4>
          <p style="margin-bottom:10px;">
            ${game.isDictatorship
              ? 'In regime dittatoriale puoi nominare per decreto i Presidenti delle due Assemblee scegliendoli tra i fedelissimi del tuo partito.'
              : 'Nella Repubblica i Presidenti di Senato e Camera vengono eletti con <strong>votazione a scrutinio segreto dell\'Aula</strong>. <strong>Divieto assoluto di cumulo delle cariche:</strong> chi è già Presidente della Repubblica, Premier, Presidente d\'Assemblea o Ministro non può assumere una seconda carica!'}
          </p>
          <div class="grid2">
            <div class="box" style="margin-bottom:0;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:var(--gold-lt);">🏛️ Presidente del Senato (Palazzo Madama)</strong>
                <span style="font-size:11px; font-weight:800; color:#38bdf8;">2ª Carica dello Stato</span>
              </div>
              <div style="font-size:15px; font-weight:900; color:#fff; margin:5px 0; cursor:pointer;" onclick="openPoliticianCardModal('${game.senateSpeaker?.id || 'larussa'}')" title="Visualizza scheda biografica e bussola 2D">
                ${game.senateSpeaker?.name || 'Ignazio La Russa'} (${(game.parties.find(x=>x.id===game.senateSpeaker?.partyId)?.short)||'FdI'}) 🔍
              </div>
              ${p.inGov && !game.isImprisoned ? `
                <div style="display:flex; gap:6px; align-items:center; margin-top:6px;">
                  <select id="selCandSenate" style="font-size:11.5px; padding:6px; flex:1;">
                    ${majorityPols.map(pol => {
                      const busy = getPersonCurrentOffice(pol, 'senate', false);
                      return `<option value="${pol.id}" ${game.senateSpeaker?.id===pol.id?'selected':''} ${busy?'disabled':''}>${pol.name} (${pol.age}a • ${(game.parties.find(x=>x.id===pol.partyId)?.short)||'Magg.'})${busy?` [Già: ${busy}]`:''}</option>`;
                    }).join('')}
                  </select>
                  <button class="btn btn-w" style="font-size:11px; white-space:nowrap;" onclick="callSpeakerElectionVote('senate')">
                    🗳️ ${game.isDictatorship ? 'Nomina (15 ⚡)' : 'Voto Aula (25 ⚡)'}
                  </button>
                </div>
              ` : `<div style="font-size:11px; color:var(--muted); margin-top:4px;">🔒 Sei all'Opposizione: non puoi proporre il Presidente del Senato</div>`}
            </div>

            <div class="box" style="margin-bottom:0;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:var(--gold-lt);">🔔 Presidente della Camera (Montecitorio)</strong>
                <span style="font-size:11px; font-weight:800; color:#38bdf8;">3ª Carica dello Stato</span>
              </div>
              <div style="font-size:15px; font-weight:900; color:#fff; margin:5px 0; cursor:pointer;" onclick="openPoliticianCardModal('${game.chamberSpeaker?.id || 'fontana_l'}')" title="Visualizza scheda biografica e bussola 2D">
                ${game.chamberSpeaker?.name || 'Lorenzo Fontana'} (${(game.parties.find(x=>x.id===game.chamberSpeaker?.partyId)?.short)||'Lega'}) 🔍
              </div>
              ${p.inGov && !game.isImprisoned ? `
                <div style="display:flex; gap:6px; align-items:center; margin-top:6px;">
                  <select id="selCandChamber" style="font-size:11.5px; padding:6px; flex:1;">
                    ${majorityPols.map(pol => {
                      const busy = getPersonCurrentOffice(pol, 'chamber', false);
                      return `<option value="${pol.id}" ${game.chamberSpeaker?.id===pol.id?'selected':''} ${busy?'disabled':''}>${pol.name} (${pol.age}a • ${(game.parties.find(x=>x.id===pol.partyId)?.short)||'Magg.'})${busy?` [Già: ${busy}]`:''}</option>`;
                    }).join('')}
                  </select>
                  <button class="btn btn-w" style="font-size:11px; white-space:nowrap;" onclick="callSpeakerElectionVote('chamber')">
                    🗳️ ${game.isDictatorship ? 'Nomina (15 ⚡)' : 'Voto Aula (25 ⚡)'}
                  </button>
                </div>
              ` : `<div style="font-size:11px; color:var(--muted); margin-top:4px;">🔒 Sei all'Opposizione: non puoi proporre il Presidente della Camera</div>`}
            </div>
          </div>
        </div>

        <!-- EQUILIBRIO CENCELLI E CONSIGLIO DEI 15 MINISTRI (SOLO PARTITI DI MAGGIORANZA + TECNICI + UNICITÀ CARICHE) -->
        <div class="box" style="margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
            <div>
              <h4 style="color:var(--gold-lt);">
                ${game.isDictatorship ? `🦅 Giunta Esecutiva del Regime (${polLink(game.currentPM)})` : (isPresidential ? `🦅 Gabinetto Esecutivo Presidenziale (${MINISTRIES.length} Dicasteri) — Presiede ${polLink(game.president.name)}` : `⚖️ Equilibrio di Coalizione (Manuale Cencelli su ${MINISTRIES.length} Dicasteri) — Governo ${polLink(game.currentPM)}`)}
              </h4>
              <p>
                ${game.isDictatorship
                  ? 'I Ministri rispondono esclusivamente a te come Capo del Regime.'
                  : (isPresidential
                    ? 'Nella Repubblica Presidenziale i Ministri/Segretari di Stato rispondono direttamente al Presidente della Repubblica eletto dal popolo (senza vincolo di fiducia parlamentare).'
                    : 'Ogni Ministro può dirigere <strong>un solo dicastero</strong> e non può cumulare la carica con la Presidenza della Repubblica, di Palazzo Chigi o di Camera e Senato.')}
              </p>
            </div>
            ${isPlayerPM && !game.isImprisoned ? `<button class="btn btn-w" onclick="openManualGovernmentFormationModal(game.parties.filter(x=>x.inGov), game.currentPM, game.currentGovCoalId)">🏛️ ${isPresidential ? 'Rimpasto Diretto del Gabinetto Presidenziale' : 'Rimpasto Generale al Quirinale'}</button>` : ''}
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${govParties.map(pt => {
              const sat = game.allySatisfaction[pt.id] ?? 78;
              const expPct = Math.round((pt.seats / totalGovSeats) * 100);
              return `
                <div style="flex:1; min-width:135px; background:var(--bg-0); border:1px solid var(--bd); border-radius:8px; padding:8px; cursor:pointer;" onclick="openPartyInspectorModal('${pt.id}')">
                  <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:800;">
                    <span style="color:${pt.color};">${pt.short} 🔍</span>
                    <span>Quota seggi: ${expPct}%</span>
                  </div>
                  <div style="font-size:11px; color:${sat<50?'#f87171':'#34d399'}; margin-top:3px;">
                    Soddisfazione Cencelli: <strong>${sat}%</strong>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="grid3">
          ${MINISTRIES.map(m => {
            const cur = game.cabinet[m.id] || { id: `vacant_${m.id}`, name: `Vacante (Interim ${m.name})`, age: '--', competence: 75, comp: 75, partyId: 'tech' };
            const mp = game.parties.find(x => x.id === cur.partyId);
            const isMe = (cur.isPlayer || cur.name === game.leader.name);
            const canReplaceThis = !game.isImprisoned && p.inGov && (isPlayerPM || cur.partyId === game.playerPartyId);
            const allowedCandidates = isPlayerPM ? ministerPool : ministerPool.filter(x => x.partyId === game.playerPartyId);

            return `
              <div class="box" style="margin-bottom:0; ${isMe?'border-color:var(--gold); background:rgba(212,175,55,0.08);':''}">
                <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--gold-lt); font-weight:800; margin-bottom:4px;">
                  <span>${m.name}</span>
                  <span>Peso ${m.weight}</span>
                </div>
                <div style="font-size:14px; font-weight:900; color:#fff; margin-bottom:2px; cursor:pointer;" onclick="openPoliticianCardModal('${cur.id}')" title="Visualizza scheda biografica e bussola 2D di ${cur.name}">
                  ${isMe ? '👑 ' : ''}${cur.name} (${cur.age}a) ${isMe ? '<span style="font-size:10px; color:var(--gold-lt);">[TU]</span>' : ''} 🔍
                </div>
                <div style="font-size:11.5px; color:${mp ? mp.color : '#38bdf8'}; font-weight:800; margin-bottom:4px;">
                  ${mp ? `${mp.name} (${mp.short})` : 'Tecnico Indipendente'}
                </div>
                <div style="font-size:11px; color:var(--muted); margin-bottom:8px;">Competenza: <strong>${cur.comp}/100</strong></div>
                ${canReplaceThis ? `
                  <select onchange="assignMin('${m.id}', this.value)" style="font-size:11px; padding:5px;">
                    <option value="">-- Proponi Sostituto (12 ⚡) --</option>
                    ${allowedCandidates.filter(pol => pol.id !== cur.id).map(pol => {
                      const pO = game.parties.find(x => x.id === pol.partyId);
                      const busy = getPersonCurrentOffice(pol, m.id, false);
                      return `<option value="${pol.id}" ${busy?'disabled':''}>${pol.isPlayer?'👤 [TU] ':''}${pol.name} (${pO ? pO.short : 'Tecnico Ind.'} • Comp.${pol.comp})${busy?` [Già: ${busy}]`:''}</option>`;
                    }).join('')}
                  </select>
                ` : `<div style="font-size:10.5px; color:var(--muted);">${p.inGov ? '🔒 Dicastero assegnato ad altro partito alleato (Serve il Premier)' : '🔒 Sola consultazione (Sei all’Opposizione)'}</div>`}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }


export function renderGovTab() {
      const box = document.getElementById('cGov');
      if (!box) return;
      const p = getP();
      const curStateForm = STATE_FORMS.find(s => s.id === game.stateForm) || STATE_FORMS[0];
      const pIdeo = getPartyIdeoScore(p);
      const isExtremist = (pIdeo <= 0.85 || pIdeo >= 3.15);
      const isModerate = (pIdeo > 1.25 && pIdeo < 2.75);

      let coupChance = 5 + (p.poll * 1.35);
      if (isExtremist) coupChance += 30;
      else if (isModerate) coupChance -= 38;
      else coupChance -= 10;

      if (game.cabinet['interno']?.partyId === game.playerPartyId) coupChance += 12;
      if (game.cabinet['difesa']?.partyId === game.playerPartyId) coupChance += 14;
      coupChance += (game.militaryLoyalty - 30) * 0.45;
      coupChance = Math.max(3, Math.min(92, Math.round(coupChance)));

      const spend = game.budget.healthSpend + game.budget.investSpend + game.budget.eduSpend + game.budget.pensionSpend;
      const estDef = +(Math.max(0.8, Math.min(7.5, spend - game.budget.taxPressure * 0.72))).toFixed(2);

      const dictatorshipPanel = game.isDictatorship ? `
        <div class="box" style="border:2px solid #ef4444; background:linear-gradient(135deg, rgba(153,27,27,0.35), rgba(15,10,15,0.95)); margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
            <div>
              <h4 style="color:#fca5a5;">🦅 CONSIGLIO SUPREMO DEL REGIME — ${game.dictatorshipName || 'DITTATURA IN VIGORE'}</h4>
              <p>
                Stai governando con pieni poteri extra-costituzionali. Se il <strong>Consenso Popolare (${p.poll.toFixed(1)}%)</strong> è basso, il <strong>Rischio Rivolta (${game.revoltRisk}%)</strong> sale ogni settimana fino al rovesciamento del regime e al tuo arresto! Puoi mettere fuori legge i partiti nella scheda <em>Partiti & Coalizioni</em>.
              </p>
            </div>
            <span style="padding:5px 10px; border-radius:8px; font-size:12px; font-weight:800; background:rgba(0,0,0,0.5); color:#fde047; border:1px solid #ef4444;">
              🔥 Rischio Rivolta: ${game.revoltRisk}% • 🪖 Fedeltà Forze Armate: ${game.militaryLoyalty}%
            </span>
          </div>
          <div class="grid2" style="margin-top:8px;">
            <button class="btn btn-m" onclick="regimeAction('welfare')">🍞 Decreto Sociale & Calmiere Prezzi (€ 60k • 25 ⚡ → +2.2% Consenso, -14% Rivolta)</button>
            <button class="btn btn-w" onclick="regimeAction('propaganda')">📺 Propaganda a Reti Unificate & Adunate (20 ⚡ → +1.2% Consenso, -10% Rivolta)</button>
            <button class="btn btn-r" onclick="regimeAction('purge')">🕵️ Polizia Segreta & Coprifuoco (22 ⚡ → +12% Fedeltà Militare, -18% Rivolta, -1% Consenso)</button>
            <button class="btn" onclick="regimeAction('restoreDemo')">🕊️ Sciogli il Regime e Ripristina la Democrazia Costituzionale (30 ⚡)</button>
          </div>
        </div>
      ` : '';

      box.innerHTML = `
        ${dictatorshipPanel}

        <!-- PUNTO 5: RIFORMA DELL'ORDINAMENTO COSTITUZIONALE DELLO STATO -->
        <div class="box" style="border-color:var(--gold-bd); margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
            <div>
              <h4 style="color:var(--gold-lt);">📜 Ordinamento Costituzionale dello Stato (Art. 138 Cost.)</h4>
              <p>
                Assetto attuale: <strong style="color:#fff;">${curStateForm.icon} ${curStateForm.name}</strong> — <em>${curStateForm.desc}</em>
              </p>
            </div>
            <span style="font-size:11px; background:var(--bg-0); border:1px solid var(--bd); padding:4px 9px; border-radius:7px; color:var(--gold-lt);">
              267 Seggi (2/3) = Via libera diretto • 201 Seggi = Referendum Costituzionale
            </span>
          </div>
          <div class="grid3">
            ${STATE_FORMS.map(sf => {
              const isCur = sf.id === game.stateForm;
              return `
                <div class="box" style="border-color:${isCur?'var(--gold)':'var(--bd)'}; margin-bottom:0; display:flex; flex-direction:column; justify-content:space-between; gap:6px;">
                  <div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <strong style="font-size:12.5px; color:${isCur?'var(--gold-lt)':'#fff'};">${sf.icon} ${sf.name}</strong>
                      ${isCur ? '<span style="font-size:10px; background:var(--gold); color:#000; font-weight:800; padding:1px 6px; border-radius:4px;">VIGENTE</span>' : ''}
                    </div>
                    <p style="font-size:11px; margin-top:4px;">${sf.desc}</p>
                  </div>
                  ${!isCur && !game.isImprisoned ? `
                    <button class="btn btn-w" style="width:100%; font-size:11px;" onclick="proposeConstitutionalReform('${sf.id}')">
                      🏛️ ${game.isDictatorship ? 'Imponi Nuovo Ordinamento (25 ⚡)' : 'Vota Riforma Costituzionale (35 ⚡)'}
                    </button>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="grid2" style="margin-bottom:14px;">
          <!-- LEGGE DI BILANCIO CON SLIDER CONTINUI AD ALTA PRECISIONE (STEP 0.1) -->
          <div class="box" style="margin-bottom:0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <h4 style="color:var(--gold-lt); margin:0;">📊 Legge di Bilancio & Manovra Finanziaria (Slider Continui)</h4>
              <span style="font-size:11px; background:var(--bg-1); padding:3px 8px; border-radius:6px; border:1px solid var(--bd);">
                Deficit Stimato: <strong id="lblEstDeficit" style="color:${estDef>4.0?'#f87171':'#34d399'};">${estDef}%</strong>
              </span>
            </div>
            ${p.inGov && !game.isImprisoned ? `
              <div class="fld">
                <label style="display:flex; justify-content:space-between;"><span>Pressione Fiscale Complessiva:</span><strong id="lblTax" style="color:var(--gold-lt);">${game.budget.taxPressure.toFixed(1)}%</strong></label>
                <input type="range" min="35.0" max="50.0" step="0.1" value="${game.budget.taxPressure}" oninput="document.getElementById('lblTax').innerText=Number(this.value).toFixed(1)+'%'; game.budget.taxPressure=Number(this.value); updateBudgetPreview();" />
              </div>
              <div class="fld">
                <label style="display:flex; justify-content:space-between;"><span>Spesa Sanità & Welfare (% PIL):</span><strong id="lblWel" style="color:#34d399;">${game.budget.healthSpend.toFixed(1)}%</strong></label>
                <input type="range" min="5.0" max="10.0" step="0.1" value="${game.budget.healthSpend}" oninput="document.getElementById('lblWel').innerText=Number(this.value).toFixed(1)+'%'; game.budget.healthSpend=Number(this.value); updateBudgetPreview();" />
              </div>
              <div class="fld">
                <label style="display:flex; justify-content:space-between;"><span>Spesa Scuola, Università & Ricerca (% PIL):</span><strong id="lblEdu" style="color:#60a5fa;">${game.budget.eduSpend.toFixed(1)}%</strong></label>
                <input type="range" min="3.0" max="7.0" step="0.1" value="${game.budget.eduSpend}" oninput="document.getElementById('lblEdu').innerText=Number(this.value).toFixed(1)+'%'; game.budget.eduSpend=Number(this.value); updateBudgetPreview();" />
              </div>
              <div class="fld">
                <label style="display:flex; justify-content:space-between;"><span>Investimenti Industriali & Opere (% PIL):</span><strong id="lblInv" style="color:#d8b4fe;">${game.budget.investSpend.toFixed(1)}%</strong></label>
                <input type="range" min="2.0" max="7.5" step="0.1" value="${game.budget.investSpend}" oninput="document.getElementById('lblInv').innerText=Number(this.value).toFixed(1)+'%'; game.budget.investSpend=Number(this.value); updateBudgetPreview();" />
              </div>
              <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
                <button class="btn btn-m" onclick="passBudget()">📜 Approva Legge di Bilancio (30 ⚡)</button>
                ${!game.isDictatorship ? `
                  <button class="btn" onclick="govVerifica()">🤝 ${game.stateForm === 'presidenziale' ? 'Vertice del Gabinetto Presidenziale (20 ⚡)' : 'Verifica di Maggioranza (20 ⚡)'}</button>
                  <button class="btn btn-r" onclick="openCrisis()">${game.stateForm === 'presidenziale' ? '🦅 Rimpasto Esecutivo Presidenziale' : '💣 Apri Crisi di Governo'}</button>
                ` : ''}
              </div>
            ` : `
              <p style="margin-bottom:10px;">${game.isImprisoned ? '🔒 Sei detenuto a Rebibbia: non puoi partecipare alle sessioni di bilancio.' : `Sei all'Opposizione rispetto al Governo <strong>${polLink(game.currentPM)}</strong>. Usa gli strumenti parlamentari per incalzare l'Esecutivo:`}</p>
              ${!game.isImprisoned ? `
                <div style="display:flex; flex-direction:column; gap:7px;">
                  <button class="btn" onclick="oppHearing()">🔍 Question Time & Interrogazione a Montecitorio (15 ⚡)</button>
                  <button class="btn" onclick="oppFilibuster()">🧱 Ostruzionismo in Commissione Bilancio (20 ⚡)</button>
                  ${game.stateForm === 'presidenziale'
                    ? `<button class="btn" style="opacity:0.65;" onclick="tableSfiducia()">🦅 Separazione dei Poteri: Nessuna Fiducia Parlamentare nel Presidenzialismo</button>`
                    : `<button class="btn btn-r" onclick="tableSfiducia()">⚖️ ${game.stateForm === 'cancellierato' ? 'Deposita Mozione di Sfiducia Costruttiva al Cancelliere (30 ⚡)' : 'Deposita Mozione di Sfiducia al Governo (30 ⚡)'}</button>`
                  }
                </div>
              ` : ''}
            `}
          </div>

          <!-- PUNTI 4, 8, 17: GOLPE, PROCESSO PER ALTO TRADIMENTO LEGATO ALLA PERSONA E SCIOGLIMENTO PARTITO EVERSIVO -->
          <div class="box" style="border-color:#ef4444; background:linear-gradient(145deg, rgba(127,29,29,0.22), rgba(8,13,24,0.92)); margin-bottom:0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <h4 style="color:#fca5a5;">⚔️ Operazione Extra-Costituzionale (Colpo di Stato / Golpe)</h4>
              <span style="font-size:11px; font-weight:800; padding:2px 8px; border-radius:99px; background:rgba(239,68,68,0.2); color:#fca5a5; border:1px solid #ef4444;">
                Probabilità Successo: ${coupChance}%
              </span>
            </div>
            <p style="margin-bottom:8px;">
              Tenta di prendere illegalmente il controllo dello Stato instaurando una Dittatura. Il successo dipende dal <strong>Consenso (${p.poll.toFixed(1)}%)</strong>, dall'<strong>Ideologia del Partito</strong> (${isExtremist ? '<strong style="color:#34d399;">Estremista: +30% appoggio radicale</strong>' : (isModerate ? '<strong style="color:#f87171;">Moderato/Centrista: -38% nessun seguito eversivo!</strong>' : 'Radicale moderato: -10%')}) e dalla <strong>Fedeltà Militare (${game.militaryLoyalty}%)</strong>.<br>
              <strong style="color:#fca5a5;">Conseguenze Realistiche in caso di Fallimento:</strong> il tuo partito verrà <strong>immediatamente messo fuori legge e sciolto per eversione</strong>, e <strong>TU (${game.leader.name}) verrai arrestato e rinchiuso in carcere a Rebibbia</strong>!
            </p>
            ${game.isImprisoned ? `
              <div style="font-size:11.5px; color:#fca5a5; background:rgba(0,0,0,0.4); padding:8px; border-radius:6px; border:1px solid #ef4444;">
                ⛓️ Sei attualmente rinchiuso nel Carcere di Rebibbia (${game.prisonDaysLeft} giorni residui). Non puoi organizzare un golpe dalla cella!
              </div>
            ` : (game.isDictatorship ? `
              <div style="font-size:11.5px; color:#34d399; background:rgba(16,185,129,0.12); padding:8px; border-radius:6px; border:1px solid #10b981;">
                🦅 Hai già preso il potere con successo e instaurato <strong>${game.dictatorshipName}</strong>! Usa il pannello del Regime in alto o metti fuori legge i partiti nella scheda <em>Partiti & Coalizioni</em>.
              </div>
            ` : `
              <div style="display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                  <button class="btn" style="flex:1; font-size:11px;" onclick="prepareCoupAction('security')">🪖 Infiltra Apparati Sicurezza (€ 45k • 22 ⚡)</button>
                  <button class="btn" style="flex:1; font-size:11px;" onclick="prepareCoupAction('militia')">🔥 Mobilitazione Piazze & Milizie (18 ⚡)</button>
                </div>
                <button class="btn btn-r" style="width:100%; font-weight:900; padding:9px;" onclick="attemptCoupDetat(${coupChance})">
                  ⚡ TENTA IL COLPO DI STATO (45 ⚡ — Successo stimato: ${coupChance}%)
                </button>
              </div>
            `)}
          </div>
        </div>

        <!-- HUB DINAMICO DEL CONSIGLIO DEI MINISTRI (PUNTO 21) -->
        <div class="box" style="border-color:var(--gold-bd); margin-bottom:14px; background:linear-gradient(135deg, rgba(212,175,55,0.06), rgba(15,23,42,0.95));">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
            <div>
              <div style="font-size:10.5px; font-weight:800; color:var(--gold-lt); letter-spacing:0.8px;">${game.stateForm === 'presidenziale' ? 'QUIRINALE & PALAZZO CHIGI • PRESIDENZA ESECUTIVA DELLA REPUBBLICA' : 'PALAZZO CHIGI • TAVOLO STRATEGICO DELL\'ESECUTIVO'}</div>
              <h4 style="margin:2px 0; color:#fff; font-size:16px;">
                ${game.isTechnicalGov ? '🏛️ Governo Tecnico di Garanzia del Presidente della Repubblica' : (game.stateForm === 'presidenziale' ? `🦅 Amministrazione Presidenziale ${polLink(game.president.name)}` : `🏛️ Governo ${polLink(game.currentPM)}`)}
              </h4>
              <div style="font-size:11.5px; color:var(--muted);">
                ${game.stateForm === 'presidenziale' ? `Presidente della Repubblica e Capo dell'Esecutivo: <strong style="color:var(--gold-lt);">${polLink(game.president.name)}</strong>` : `Presidente del Consiglio: <strong style="color:var(--gold-lt);">${polLink(game.currentPM)}</strong>`} •
                Formula: <strong>${game.isTechnicalGov ? 'Salvezza Nazionale Istituzionale' : `Coalizione ${getCoalName(game.currentGovCoalId)}`}</strong>
              </div>
            </div>
            <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
              <span style="font-size:11px; padding:4px 9px; border-radius:6px; background:var(--bg-0); border:1px solid var(--bd);">
                Stabilità: <strong style="color:${game.govStability>60?'#34d399':(game.govStability>35?'#fde047':'#f87171')};">${game.govStability}%</strong>
              </span>
              <span style="font-size:11px; padding:4px 9px; border-radius:6px; background:var(--bg-0); border:1px solid var(--bd);">
                Spread BTP: <strong style="color:${game.spread<140?'#34d399':(game.spread<200?'#fde047':'#f87171')};">${game.spread} pt</strong>
              </span>
              <span style="font-size:11px; padding:4px 9px; border-radius:6px; background:var(--bg-0); border:1px solid var(--bd);">
                Patto Stabilità UE: <strong style="color:${game.budget.deficit<=3.0?'#34d399':'#f87171'};">Deficit ${game.budget.deficit}% / Debito ${game.budget.debtToGDP}%</strong>
              </span>
            </div>
          </div>
          ${p.inGov && !game.isImprisoned ? `
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:11.5px; background:rgba(0,0,0,0.3); padding:8px; border-radius:6px;">
              <span>Priorità Programmatica del CdM:</span>
              <button class="btn ${game.govPriority==='stabilità'?'btn-m':''}" style="font-size:11px; padding:3px 8px;" onclick="game.govPriority='stabilità'; addFeed('🎯 Priorità CdM: Stabilità dei Conti e contenimento dello Spread.'); updateAllUI();">🛡️ Stabilità & Spread</button>
              <button class="btn ${game.govPriority==='crescita'?'btn-m':''}" style="font-size:11px; padding:3px 8px;" onclick="game.govPriority='crescita'; addFeed('🎯 Priorità CdM: Rilancio PIL e Investimenti produttivi.'); updateAllUI();">📈 Rilancio Crescita & PIL</button>
              <button class="btn ${game.govPriority==='welfare'?'btn-m':''}" style="font-size:11px; padding:3px 8px;" onclick="game.govPriority='welfare'; addFeed('🎯 Priorità CdM: Sanità, Scuola e Giustizia Sociale.'); updateAllUI();">🍞 Sanità & Welfare</button>
              <button class="btn ${game.govPriority==='riforme'?'btn-m':''}" style="font-size:11px; padding:3px 8px;" onclick="game.govPriority='riforme'; addFeed('🎯 Priorità CdM: Riforme Istituzionali e Giustizia.'); updateAllUI();">⚖️ Grandi Riforme</button>
            </div>
          ` : ''}
        </div>

        <!-- NUOVO TAVOLO CONTINUO DEI DECRETI-LEGGE E PIANI ESECUTIVI DI PALAZZO CHIGI (SOSTITUISCE I VECCHI DDL STATICI) -->
        <div class="box">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
            <div>
              <h4 style="color:var(--gold-lt); margin:0;">🏛️ Decreti-Legge d'Urgenza & Piani Strategici di Palazzo Chigi</h4>
              <p>Azioni esecutive ripetibili del Consiglio dei Ministri per intervenire su economia, salari, sanità, sicurezza e infrastrutture. Per riformare i diritti civili, penali e fiscali usa anche la scheda <strong>⚖️ Temi Caldi & Referendum</strong>.</p>
            </div>
            <button class="btn btn-w" style="font-size:11px;" onclick="showTab('tLaws', document.querySelectorAll('.nav-item')[3])">⚖️ Vai ai 16 Temi Caldi & Referendum →</button>
          </div>
          <div class="grid3">
            ${EXEC_DECREES.map(dec => `
              <div class="box" style="margin-bottom:0; display:flex; flex-direction:column; justify-content:space-between; gap:6px;">
                <div>
                  <strong style="font-size:12.5px; color:#fff;">${dec.icon} ${dec.title}</strong>
                  <p style="font-size:11px; margin-top:3px;">${dec.desc}</p>
                </div>
                ${p.inGov && !game.isImprisoned ? `
                  <button class="btn btn-m" style="width:100%; font-size:11px;" onclick="executeGovDecree('${dec.id}')">
                    ✍️ Emana Decreto (${dec.costFunds > 0 ? `€ ${dec.costFunds}k • ` : ''}${dec.costAP} ⚡)
                  </button>
                ` : `<div style="font-size:10.5px; color:var(--muted);">🔒 Riservato al Governo in carica</div>`}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }


export function renderForeignTab() {
      const box = document.getElementById('cForeign');
      if (!box) return;
      const p = getP();
      const canManageForeign = (p.inGov || game.isDictatorship) && !game.isImprisoned;
      const euRel = Math.round(game.foreignRels.eu_com ?? 72);

      const euBadge = game.inEU
        ? `<span style="background:rgba(59,130,246,0.2); color:#93c5fd; border:1px solid #3b82f6; padding:3px 9px; border-radius:99px; font-size:11px; font-weight:800;">🇪🇺 STATO MEMBRO UE & EUROZONA (Relazione: ${euRel}/100)</span>`
        : `<span style="background:rgba(239,68,68,0.2); color:#fca5a5; border:1px solid #ef4444; padding:3px 9px; border-radius:99px; font-size:11px; font-weight:800;">🇮🇹 FUORI DALL'UNIONE EUROPEA (ITALEXIT ATTUATA — Sovranità Monetaria)</span>`;

      const natoBadge = game.inNATO
        ? `<span style="background:rgba(56,189,248,0.2); color:#7dd3fc; border:1px solid #0284c7; padding:3px 9px; border-radius:99px; font-size:11px; font-weight:800;">🛡️ MEMBRO ALLEANZA ATLANTICA NATO (Spesa Difesa: ${game.defenseSpendGDP}% PIL)</span>`
        : `<span style="background:rgba(245,158,11,0.2); color:#fcd34d; border:1px solid #f59e0b; padding:3px 9px; border-radius:99px; font-size:11px; font-weight:800;">🕊️ NEUTRALITÀ STRATEGICA FUORI DALLA NATO</span>`;

      const oppWarningBanner = !canManageForeign ? `
        <div class="box" style="border:2px solid #f59e0b; background:rgba(245,158,11,0.12); margin-bottom:14px;">
          <h4 style="color:#fde047; margin-bottom:4px;">🔒 Prerogativa Esclusiva del Governo in Carica (Palazzo Chigi & Farnesina)</h4>
          <p>
            ${game.isImprisoned
              ? 'Sei attualmente detenuto nel Carcere di Rebibbia: non hai alcun potere diplomatico.'
              : `Attualmente siedi all'<strong>Opposizione</strong> (il Governo è guidato da <strong>${game.currentPM}</strong>). Nella realtà istituzionale, <strong>solo chi è al Governo può gestire la Politica Estera dello Stato</strong>, firmare trattati internazionali, decidere il budget militare NATO o negoziare il PNRR con Bruxelles! Entra al Governo per sbloccare la diplomazia di Stato.`}
          </p>
        </div>
      ` : '';

      box.innerHTML = `
        ${oppWarningBanner}

        <!-- PUNTO 6: UNIONE EUROPEA E NATO INTERAGIBILI -->
        <div class="grid2" style="margin-bottom:14px;">
          <div class="box" style="border-color:#3b82f6; margin-bottom:0;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px;">
              <h4 style="color:#93c5fd;">🇪🇺 Commissione Europea & BCE (Bruxelles / Francoforte)</h4>
              ${euBadge}
            </div>
            <p style="margin-bottom:10px;">
              ${game.inEU
                ? 'L’appartenenza all’UE garantisce lo scudo anti-spread della BCE e le rate del PNRR, ma impone i vincoli del Patto di Stabilità. Il Governo può negoziare flessibilità, porre il veto o indire il Referendum per l’uscita dall’UE (Italexit).'
                : 'L’Italia è uscita dall’Unione Europea e ha ripristinato la Nuova Lira e la sovranità monetaria nazionale: piena libertà fiscale e doganale, ma fine dei fondi PNRR.'}
            </p>
            ${canManageForeign ? `
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                ${game.inEU ? `
                  <button class="btn btn-m" style="font-size:11px;" onclick="euAction('pnrr')">💶 Sblocca Rata PNRR & Patto BCE (20 ⚡)</button>
                  <button class="btn btn-w" style="font-size:11px;" onclick="euAction('veto')">✋ Poni Veto Italiano a Bruxelles (18 ⚡)</button>
                  <button class="btn btn-r" style="font-size:11px;" onclick="launchExitReferendum('eu')">🗳️ Indici Referendum ITALEXIT (Uscita da UE • 35 ⚡)</button>
                ` : `
                  <button class="btn" style="font-size:11px;" onclick="launchExitReferendum('rejoin_eu')">🇪🇺 Chiedi Rientro nell'Unione Europea (35 ⚡)</button>
                `}
              </div>
            ` : `<div style="font-size:11px; color:var(--muted);">🔒 Azioni UE riservate al Governo in carica (${game.currentPM})</div>`}
          </div>

          <div class="box" style="border-color:#0284c7; margin-bottom:0;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px;">
              <h4 style="color:#7dd3fc;">🛡️ Alleanza Atlantica (NATO — Comando Alleato & Basi)</h4>
              ${natoBadge}
            </div>
            <p style="margin-bottom:10px;">
              ${game.inNATO
                ? 'L’Italia ospita basi strategiche (Sigonella, Aviano, Napoli). Aumentare le spese militari al 2% del PIL rafforza il legame con Washington e Kiev; ridurle o indire il Referendum per uscire dalla NATO sposta il Paese verso Russia e BRICS.'
                : 'L’Italia ha denunciato il Patto Atlantico assumendo uno status di neutralità non-allineata: rapporti privilegiati con Mosca e Pechino, ma gelo con Washington.'}
            </p>
            ${canManageForeign ? `
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                ${game.inNATO ? `
                  <button class="btn" style="font-size:11px;" onclick="natoAction('boost2pct')">🪖 Porta Spesa Difesa al 2% PIL (20 ⚡)</button>
                  <button class="btn btn-w" style="font-size:11px;" onclick="natoAction('cutSpend')">🕊️ Taglia Spese Militari & Stop Invio Armi (18 ⚡)</button>
                  <button class="btn btn-r" style="font-size:11px;" onclick="launchExitReferendum('nato')">🗳️ Referendum Uscita dal Patto Atlantico NATO (35 ⚡)</button>
                ` : `
                  <button class="btn" style="font-size:11px;" onclick="launchExitReferendum('rejoin_nato')">🛡️ Rientra nel Patto Atlantico NATO (35 ⚡)</button>
                `}
              </div>
            ` : `<div style="font-size:11px; color:var(--muted);">🔒 Decisioni NATO riservate al Governo in carica (${game.currentPM})</div>`}
          </div>
        </div>

        <!-- PUNTO 7: SISTEMA DI POLITICA ESTERA E RELAZIONI INTERDIPENDENTI COI LEADER MONDIALI -->
        <div class="box">
          <div style="margin-bottom:10px;">
            <h4 style="color:var(--gold-lt);">🌍 Scacchiere Geopolitico & Relazioni coi Leader delle Potenze Mondiali (Vasi Comunicanti)</h4>
            <p>
              Le relazioni diplomatiche sono <strong>interdipendenti</strong>: se il Governo aumenta la relazione con <strong>Vladimir Putin (Russia)</strong>, per forza di cose calerà quella con <strong>Volodymyr Zelensky (Ucraina)</strong>, con l'<strong>Unione Europea</strong> e con gli <strong>Stati Uniti</strong> (e viceversa).
            </p>
          </div>

          <div class="grid2">
            ${FOREIGN_POWERS.map(fp => {
              const rel = Math.round(game.foreignRels[fp.id] ?? 50);
              const barColor = rel >= 65 ? '#10b981' : (rel >= 40 ? '#f59e0b' : '#ef4444');
              const statusTxt = rel >= 75 ? 'Alleato Strategico' : (rel >= 55 ? 'Partner Cordiale' : (rel >= 35 ? 'Raffreddamento' : 'Crisi Diplomatica / Sanzioni'));
              const rivalKeys = Object.keys(fp.rivals || {});
              const rivalNames = rivalKeys.map(rId => FOREIGN_POWERS.find(x => x.id === rId)?.leader || rId.toUpperCase()).join(', ');
              return `
                <div class="foreign-card">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                    <div>
                      <div style="font-size:14px; font-weight:800; color:#fff;">${fp.flag} ${fp.country}</div>
                      <div style="font-size:11.5px; color:var(--gold-lt); font-weight:700;">Leader: ${fp.leader}</div>
                    </div>
                    <span style="font-size:11px; font-weight:800; padding:2px 8px; border-radius:99px; background:rgba(255,255,255,0.06); color:${barColor}; border:1px solid ${barColor};">
                      ${rel}/100 • ${statusTxt}
                    </span>
                  </div>
                  <div style="font-size:11px; color:var(--muted); line-height:1.35;">${fp.desc}</div>
                  <div>
                    <div class="p-bar"><div class="p-fill" style="width:${rel}%; background:${barColor};"></div></div>
                    ${rivalNames ? `<div style="font-size:10px; color:var(--muted); margin-top:3px;">⚠️ <em>Effetto geopolitico:</em> Avvicinarsi a ${fp.flag} riduce automaticamente i rapporti con: <strong style="color:#fca5a5;">${rivalNames}</strong></div>` : ''}
                  </div>
                  ${canManageForeign ? `
                    <div style="display:flex; gap:5px; flex-wrap:wrap; margin-top:4px;">
                      <button class="btn btn-m" style="flex:1; padding:5px 8px; font-size:10.5px;" onclick="foreignAction('${fp.id}', 'summit')">
                        ✈️ Vertice con ${fp.leader.split(' ')[0]} (+14 • 18 ⚡)
                      </button>
                      <button class="btn" style="flex:1; padding:5px 8px; font-size:10.5px;" onclick="foreignAction('${fp.id}', 'trade')">
                        🚢 Accordo Energetico/Comm. (+9 • 15 ⚡)
                      </button>
                      <button class="btn btn-r" style="padding:5px 8px; font-size:10.5px;" onclick="foreignAction('${fp.id}', 'sanction')">
                        ⚡ Sanzioni (-16 • 14 ⚡)
                      </button>
                    </div>
                  ` : `<div style="font-size:10.5px; color:var(--muted); margin-top:4px;">🔒 Diplomazia bilaterale riservata al Governo in carica</div>`}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }


export function renderMapTab() {
      const svg = document.getElementById('itMapSvg');
      const side = document.getElementById('mapSide');
      if (!svg || !side) return;

      const regions = (game.geoRegions && game.geoRegions.length === 20) ? game.geoRegions : FALLBACK_REGIONS;
      const p = getP();
      const isInd = (game.partyRole === 'independent');

      svg.innerHTML = regions.map(r => {
        const rp = game.regionPolls[r.id] || {};
        const topP = [...game.parties].sort((a,b) => (rp[b.id]||0) - (rp[a.id]||0))[0] || game.parties[0];
        const sel = game.selectedMapRegion === r.id;
        return `
          <g onclick="game.selectedMapRegion='${r.id.replace(/'/g,"\\'")}';renderMapTab()">
            <path d="${r.path}" fill="${topP.color}" class="reg-shape ${sel ? 'sel-reg' : ''}"><title>${r.id}: 1° ${topP.name} (${(rp[topP.id]||0).toFixed(1)}%)</title></path>
            <circle cx="${r.cx}" cy="${r.cy-3}" r="8.5" fill="rgba(5,8,17,0.82)" stroke="rgba(255,255,255,0.45)" stroke-width="0.7" style="pointer-events:none;"/>
            <text x="${r.cx}" y="${r.cy}" text-anchor="middle" fill="#fff" font-size="7" font-weight="800" style="pointer-events:none;">${topP.short}</text>
          </g>
        `;
      }).join('');

      const reg = regions.find(r => r.id === game.selectedMapRegion) || regions[8] || regions[0];
      const rp = game.regionPolls[reg.id] || {};
      const myOrg = (typeof game.regOrg[reg.id] === 'object' ? game.regOrg[reg.id]?.[game.playerPartyId] : game.regOrg[reg.id]) || 50;
      const sorted = [...game.parties].sort((a,b) => (rp[b.id]||0) - (rp[a.id]||0));
      const topWin = sorted[0] || game.parties[0];
      const regCd = Math.max(0, (game.regCooldowns[reg.id] || 0) - game.turn);

      side.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:6px;">
          <h4 style="color:var(--gold-lt); font-size:15px; margin:0;">📍 ${reg.id} (${reg.lean})</h4>
          <span style="font-size:11px; padding:2px 8px; border-radius:99px; background:${topWin.color}33; color:#fff; border:1px solid ${topWin.color}; font-weight:800; cursor:pointer;" onclick="openPartyInspectorModal('${topWin.id}')">
            1° ${topWin.short} (${(rp[topWin.id]||0).toFixed(1)}%) 🔍
          </span>
        </div>
        <p style="margin-bottom:6px;">Radicamento Circoli di <strong>${p.short}</strong>: <strong style="color:#34d399;">${myOrg}/100</strong> ${regCd > 0 ? `<span style="color:#fde047; font-size:10.5px;">(⏳ Cooldown regionale: ${regCd}g)</span>` : ''}</p>
        <div class="p-bar" style="margin-bottom:10px;"><div class="p-fill" style="width:${myOrg}%; background:#10b981;"></div></div>

        ${!isInd && !game.isImprisoned ? `
          <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:10px;">
            <button class="btn btn-m" style="width:100%; ${regCd>0?'opacity:0.55;':''}" onclick="investReg('${reg.id.replace(/'/g,"\\'")}', 'comizio')">
              🎤 Comizio Regionale in ${reg.id} (€ 15k • 22 ⚡ → +${myOrg>=72?2:3} Radicamento ${regCd>0?`[Tra ${regCd}g]`:''})
            </button>
            <button class="btn btn-w" style="width:100%; ${regCd>0?'opacity:0.55;':''}" onclick="investReg('${reg.id.replace(/'/g,"\\'")}', 'sede')">
              🏢 Apri Sedi Provinciali in ${reg.id} (€ 55k • 25 ⚡ → +${myOrg>=72?3:5} Radicamento ${regCd>0?`[Tra ${regCd}g]`:''})
            </button>
          </div>
        ` : `<div style="font-size:11px; color:var(--muted); margin-bottom:10px;">${game.isImprisoned ? '🔒 Sei detenuto a Rebibbia.' : 'Fonda o iscriviti a un partito per aprire circoli regionali.'}</div>`}

        <div style="max-height:270px; overflow-y:auto; font-size:11px; padding-right:4px;">
          ${sorted.map((pt, i) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 2px; border-bottom:1px solid var(--bd); cursor:pointer;" onclick="openPartyInspectorModal('${pt.id}')" title="Clicca per ispezionare ${pt.name}">
              <span style="color:${pt.color}; font-weight:800; display:flex; align-items:center; gap:5px;">
                <span style="width:14px; height:14px; display:inline-block;">${getPartySVG(pt.id, pt.short, pt.color)}</span>
                ${i+1}. ${pt.name} (${pt.short}) 🔍
              </span>
              <strong>${(rp[pt.id]||0).toFixed(1)}%</strong>
            </div>
          `).join('')}
        </div>
      `;
    }

    /* PUNTO 10 & 11 (v6.2): RADICAMENTO TERRITORIALE BILANCIATO CON COOLDOWN REGIONALE DI 7 GIORNI E RENDIMENTI DECRESCENTI */

export function renderParlTab() {
      const box = document.getElementById('cParl');
      if (!box) return;

      // Ordina i partiti rigorosamente da ESTREMA SINISTRA (ideoScore 0.0 -> lato sinistro dell'Aula) a ESTREMA DESTRA (ideoScore 4.0 -> lato destro dell'Aula)!
      const ord = [...game.parties].filter(pt => pt.seats > 0).sort((a,b) => getPartyIdeoScore(a) - getPartyIdeoScore(b));

      // Genera i 400 seggi dell'emiciclo e ordinali per angolo da SINISTRA (ang = PI) a DESTRA (ang = 0)
      const coords = [];
      const cx = 260, cy = 235, rows = [30, 35, 40, 44, 48, 52, 50, 51, 50];
      rows.forEach((cnt, r) => {
        const rad = 80 + r * 16.5;
        for (let s = 0; s < cnt; s++) {
          const ang = Math.PI * (1 - s / (cnt - 1));
          coords.push({ x: cx + rad * Math.cos(ang), y: cy - rad * Math.sin(ang), ang });
        }
      });
      // Ordina da angolo PI (estrema sinistra dell'emiciclo) ad angolo 0 (estrema destra dell'emiciclo)
      coords.sort((a,b) => b.ang - a.ang);

      const assign = [];
      ord.forEach(pt => {
        for (let i = 0; i < pt.seats; i++) assign.push(pt);
      });
      while (assign.length < 400) assign.push({ short: "Misto", color: "#64748b", name: "Gruppo Misto" });

      const dots = coords.map((pt, i) => {
        const partyObj = assign[i] || { color: "#64748b", name: "Gruppo Misto" };
        return `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="4.3" fill="${partyObj.color}" stroke="#050811" stroke-width="0.6"><title>${partyObj.name} (${partyObj.seats||0} seggi)</title></circle>`;
      }).join('');

      const govS = game.parties.filter(pt => pt.inGov).reduce((s, pt) => s + pt.seats, 0);
      const govParties = game.parties.filter(pt => pt.inGov && pt.seats > 0);
      const oppParties = game.parties.filter(pt => !pt.inGov && pt.seats > 0);
      const curStateForm = STATE_FORMS.find(s => s.id === game.stateForm) || STATE_FORMS[0];
      const isPresidential = (game.stateForm === 'presidenziale');

      box.innerHTML = `
        <!-- PUNTO 3 (1.7): BANNER ESPLICITO DEI PARTITI AL GOVERNO ANCHE NELLA SCHEDA EMICICLO -->
        <div class="box" style="border-color:#10b981; background:linear-gradient(135deg, rgba(16,185,129,0.10), rgba(11,18,32,0.95)); margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
            <div>
              <strong style="color:#34d399; font-size:13px;">🟢 Partiti di Maggioranza al Governo (${govS}/400 seggi — ${game.isTechnicalGov ? 'Governo Tecnico' : `Coalizione ${getCoalName(game.currentGovCoalId)}`}):</strong>
            </div>
            <span style="font-size:11px; color:var(--gold-lt); font-weight:800;">
              ${isPresidential ? `Presidente Esecutivo: ${polLink(game.president.name)}` : `Premier: ${polLink(game.currentPM)}`}
            </span>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${govParties.map(pt => `
              <span style="display:inline-flex; align-items:center; gap:5px; background:var(--bg-0); border:1px solid ${pt.color}; padding:3px 8px; border-radius:6px; font-size:11px; cursor:pointer;" onclick="openPartyInspectorModal('${pt.id}')">
                <span style="color:${pt.color}; font-weight:800;">${pt.name} (${pt.short})</span>
                <strong style="color:#fff;">${pt.seats} seggi</strong>
                <span style="color:var(--muted);">• ${polLink(pt.leader)}</span>
              </span>
            `).join('')}
          </div>
          ${oppParties.length > 0 ? `
            <div style="font-size:10.5px; color:var(--muted); margin-top:6px;">
              🔴 <strong>Opposizione (${400 - govS} seggi):</strong> ${oppParties.map(pt => `<span style="cursor:pointer; color:${pt.color}; font-weight:700;" onclick="openPartyInspectorModal('${pt.id}')">${pt.short} (${pt.seats})</span>`).join(' • ')}
            </div>
          ` : ''}
        </div>

        <div class="grid2">
          <div class="box" style="text-align:center; margin-bottom:0;">
            <h4 style="color:${game.isDictatorship?'#fca5a5':'var(--gold-lt)'}; margin-bottom:4px;">
              ${game.isDictatorship ? `🦅 Assemblea Nazionale del Regime (${govS}/400 Seggi al Regime)` : '🏛️ Emiciclo Camera dei Deputati (Sinistra ⬅️ Centro ➡️ Destra)'}
            </h4>
            <div style="font-size:11px; color:var(--muted); margin-bottom:4px;">
              🔔 Pres. Camera: <strong style="color:#fff;">${polLink(game.chamberSpeaker?.id || 'fontana_l', game.chamberSpeaker?.name || 'Lorenzo Fontana')}</strong> (${(game.parties.find(x=>x.id===game.chamberSpeaker?.partyId)?.short)||'Lega'}) •
              🏛️ Pres. Senato: <strong style="color:#fff;">${polLink(game.senateSpeaker?.id || 'larussa', game.senateSpeaker?.name || 'Ignazio La Russa')}</strong> (${(game.parties.find(x=>x.id===game.senateSpeaker?.partyId)?.short)||'FdI'})
            </div>
            <svg viewBox="0 0 520 260" style="width:100%; max-width:520px; height:auto;">
              <text x="45" y="252" fill="#fca5a5" font-size="9" font-weight="800">⬅️ SINISTRA</text>
              <text x="260" y="252" text-anchor="middle" fill="#67e8f9" font-size="9" font-weight="800">CENTRO</text>
              <text x="475" y="252" text-anchor="end" fill="#93c5fd" font-size="9" font-weight="800">DESTRA ➡️</text>
              ${dots}
              <rect x="200" y="214" width="120" height="20" rx="5" fill="#121b2e" stroke="${game.isDictatorship?'#ef4444':'#e2b93b'}" stroke-width="1.4"/>
              <text x="260" y="227" text-anchor="middle" fill="#fde047" font-size="9.5" font-weight="800">${game.isDictatorship ? `REGIME (${govS})` : `GOVERNO (${govS})`}</text>
            </svg>
            <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-top:6px;">
              ${ord.map(pt => `<div style="background:var(--bg-2); border:1px solid ${pt.color}; padding:3px 7px; border-radius:5px; font-size:10.5px; cursor:pointer;" onclick="openPartyInspectorModal('${pt.id}')" title="Clicca per aprire la scheda di ${pt.name}"><span style="color:${pt.color};">■</span> <strong>${pt.short}:</strong> ${pt.seats} ${pt.inGov?'🟢':''}</div>`).join('')}
            </div>
          </div>

          <div class="box" style="margin-bottom:0;">
            ${game.isDictatorship ? `
              <h4 style="color:#fca5a5; margin-bottom:8px;">🦅 Guida Suprema dello Stato & Controllo Istituzionale</h4>
              <div style="font-size:15px; font-weight:900; color:#fff; margin-bottom:4px;">Capo del Regime: ${polLink('player_leader_pol', game.leader.name)}</div>
              <div style="font-size:11.5px; color:var(--gold-lt); margin-bottom:8px;">Assetto: <strong>${game.dictatorshipName}</strong> (Quirinale esautorato)</div>
              <p style="margin-bottom:10px;">
                Le prerogative del Presidente della Repubblica (${polLink(game.president.name)}) sono state sospese dal Consiglio Supremo.<br>
                • Partiti messi fuori legge dal Regime: <strong style="color:#fca5a5;">${game.outlawedParties.length}</strong><br>
                • Rischio Rivolta Popolare: <strong style="color:${game.revoltRisk>=60?'#ef4444':'#fde047'};">${game.revoltRisk}%</strong>
              </p>
              <button class="btn btn-r" style="width:100%;" onclick="showTab('tCoal', document.querySelectorAll('.nav-item')[4])">
                🚫 Vai al Tribunale Speciale per Mettere Fuori Legge i Partiti →
              </button>
            ` : `
              <h4 style="color:var(--gold-lt); margin-bottom:8px;">👑 Colle del Quirinale & Presidenza della Repubblica</h4>
              <div style="font-size:15px; font-weight:900; color:#fff; margin-bottom:3px;">
                Presidente della Repubblica: ${polLink(game.president.name)} (${game.president.age}a) ${game.president.isPlayer ? '<span style="background:var(--gold); color:#000; font-size:10px; padding:2px 6px; border-radius:4px; margin-left:4px;">👑 SEI TU IL PRESIDENTE DELLA REPUBBLICA</span>' : ''}
              </div>
              <div style="font-size:11.5px; color:var(--gold-lt); margin-bottom:6px;">Ordinamento: <strong>${curStateForm.icon} ${curStateForm.name}</strong> • Scadenza: <strong>${fmtDate(game.president.endDate)}</strong></div>
              <p style="margin-bottom:8px;">Ruolo Istituzionale: <strong>${game.president.area}</strong> • Fiducia Istituzionale: <strong>${game.president.trust}%</strong></p>
              <div class="p-bar" style="margin-bottom:12px;"><div class="p-fill" style="width:${game.president.trust}%; background:var(--gold);"></div></div>
              ${!game.isImprisoned ? `
                ${game.president.isPlayer ? `
                  <div style="background:rgba(212,175,55,0.12); border:1px solid var(--gold); border-radius:8px; padding:10px; margin-bottom:8px;">
                    <div style="font-size:12px; font-weight:800; color:var(--gold-lt); margin-bottom:6px;">
                      🦅 ${isPresidential ? `Poteri Esecutivi del Presidente della Repubblica (${game.leader.name}):` : `Prerogative Costituzionali del Presidente della Repubblica (${game.leader.name}):`}
                    </div>
                    <div style="display:flex; flex-direction:column; gap:6px;">
                      <button class="btn btn-m" onclick="quirinalePlayerAction('moral_suasion')">🎙️ ${isPresidential ? 'Messaggio Presidenziale alla Nazione (15 ⚡ → +5% Prestigio, +8% Stab., -6 pt Spread)' : 'Monito del Colle & Moral Suasion (15 ⚡ → +5% Prestigio, +8% Stab., -6 pt Spread)'}</button>
                      <button class="btn" onclick="quirinalePlayerAction('remand')">📜 ${isPresidential ? 'Poni Veto Sospensivo Presidenziale su Legge del Parlamento (20 ⚡)' : 'Rinvia Legge alle Camere ex Art. 74 Cost. (20 ⚡ → +8% Fiducia Colle, +6% Prestigio)'}</button>
                      <button class="btn btn-w" onclick="quirinalePlayerAction('consult')">🏛️ ${isPresidential ? 'Nomina / Revoca Direttamente i Ministri del Gabinetto Presidenziale (25 ⚡)' : `Convoca il Premier ${game.currentPM} al Quirinale per un Rimpasto (25 ⚡)`}</button>
                      ${!isPresidential ? `<button class="btn btn-r" onclick="quirinalePlayerAction('dissolve')">🗳️ Sciogli le Camere ex Art. 88 Cost. e Indici Elezioni (35 ⚡)</button>` : ''}
                    </div>
                  </div>
                ` : `
                  <div style="display:flex; flex-direction:column; gap:8px;">
                    <button class="btn" onclick="quirinaleAudienceAction()">🤝 Udienza Riservata al Colle (15 ⚡ → +8% Fiducia Quirinale)</button>
                    <button class="btn btn-w" onclick="${game.stateForm === 'presidenziale' ? 'openDirectPresidentialElectionModal()' : 'openQuirinaleBallotModal(1)'}">
                      🗳️ ${game.stateForm === 'presidenziale' ? 'Indici Elezione Diretta del Presidente della Repubblica' : 'Convoca Seduta Comune per Elezione del Presidente della Repubblica'}
                    </button>
                  </div>
                `}
              ` : `<div style="font-size:11px; color:#f87171;">🔒 Sei detenuto a Rebibbia: puoi chiedere la Grazia Presidenziale nella scheda Carriera.</div>`}
            `}
          </div>
        </div>
      `;
    }


export function hexToRgbTuple(hex) {
      let c = (hex || '#d4af37').replace('#', '').trim();
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      const num = parseInt(c, 16);
      if (isNaN(num)) return '212, 175, 55';
      return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
    }

export function applyDynamicPartyTheme(customHex) {
      const p = getP();
      const isInd = (game.partyRole === 'independent' || p?.id === 'ind');

      document.body.classList.toggle('theme-ind', isInd && !game.isDictatorship && !game.isImprisoned);
      document.body.classList.toggle('theme-regime', !!game.isDictatorship);

      const col = customHex || (game.isImprisoned ? '#ef4444' : (isInd ? '#f8fafc' : (p?.color || '#d4af37')));
      if (document.documentElement && document.documentElement.style) {
        document.documentElement.style.setProperty('--party-color', col);
        document.documentElement.style.setProperty('--party-rgb', hexToRgbTuple(col));
      }
    }

export function updateAllUI() {
      const p = getP();
      if (!p) return;
      applyDynamicPartyTheme();

      const isInd = (game.partyRole === 'independent');
      const isSec = (game.partyRole === 'secretary');
      const stateFormObj = STATE_FORMS.find(s => s.id === game.stateForm) || STATE_FORMS[0];
      const myMin = getPlayerMinistry();

      // Aggiorna dinamicamente le etichette del menu di navigazione in Dittatura o Carcere
      const navBtns = document.querySelectorAll('.nav-item');
      if (navBtns.length >= 10) {
        navBtns[0].innerHTML = game.isImprisoned ? `⛓️ <span>Cella Rebibbia</span>` : `👤 <span>Carriera & Correnti</span>`;
        navBtns[4].innerHTML = game.isDictatorship ? `🚫 <span>Fuorilegge Partiti</span>` : `🤝 <span>Partiti (${game.parties.length}) & Poli</span>`;
        navBtns[5].innerHTML = game.isDictatorship ? `🦅 <span>Giunta del Regime</span>` : `🏛️ <span>Ministri & Camere</span>`;
        navBtns[9].innerHTML = game.isDictatorship ? `🦅 <span>Assemblea Regime</span>` : `🪑 <span>Emiciclo & Quirinale</span>`;
      }

      // Topbar Identity (cliccabile per aprire la scheda del proprio partito — Punto 6)
      const logoEl = document.getElementById('topLogo');
      if (logoEl) {
        logoEl.innerHTML = getPartySVG(p.id, p.short, p.color);
        logoEl.style.cursor = p.id !== 'ind' ? 'pointer' : 'default';
        logoEl.title = p.id !== 'ind' ? `Clicca per ispezionare ${p.name}` : '';
        logoEl.onclick = () => { if (p.id !== 'ind') openPartyInspectorModal(p.id); };
      }
      const leaderEl = document.getElementById('topLeader');
      if (leaderEl) {
        leaderEl.innerText = `${game.leader.name} (${game.leader.age}a)`;
        leaderEl.style.cursor = 'pointer';
        leaderEl.title = `Clicca per aprire la tua scheda politica e carriera`;
        leaderEl.onclick = () => openPoliticianCardModal(game.leader.name);
      }

      // Punto 9 & Punto 17 v6.2: Badge di ruolo in alto mostra Presidente della Repubblica o Ministro se ricopri quella carica!
      const roleEl = document.getElementById('topRole');
      if (roleEl) {
        if (game.isImprisoned) {
          roleEl.className = 'pill-role r-opp';
          roleEl.innerText = `⛓️ Detenuto a Rebibbia (${game.prisonDaysLeft}g)`;
        } else if (game.isDictatorship) {
          roleEl.className = 'pill-role r-dict';
          roleEl.innerText = '🦅 Capo del Regime';
        } else if (game.president.isPlayer) {
          roleEl.className = 'pill-role r-pm';
          roleEl.innerText = '👑 Presidente della Repubblica';
        } else if (game.currentPM === game.leader.name && p.inGov) {
          roleEl.className = 'pill-role r-pm';
          roleEl.innerText = game.stateForm === 'cancellierato' ? '🏛️ Cancelliere Federale' : '👑 Presidente del Consiglio';
        } else if (myMin) {
          roleEl.className = 'pill-role r-gov';
          roleEl.innerText = `🏛️ Ministro: ${myMin.ministry.name.replace(/^[^\s]+\s/, '')}`;
        } else if (isInd) {
          roleEl.className = 'pill-role r-ind';
          roleEl.innerText = p.inGov ? '🏛️ Indipendente al Governo' : '📄 Libero Indipendente';
        } else if (p.inGov) {
          roleEl.className = 'pill-role r-gov';
          roleEl.innerText = '🏛️ Maggioranza di Governo';
        } else {
          roleEl.className = 'pill-role r-opp';
          roleEl.innerText = '⚔️ Opposizione';
        }
      }

      const subEl = document.getElementById('topSub');
      if (subEl) {
        const offTxt = game.president.isPlayer ? ' • 👑 Presidente della Repubblica (Quirinale)' : (myMin ? ` • 💼 Titolare ${myMin.ministry.name}` : '');
        const rTxt = game.isImprisoned
          ? 'Ex-Leader Detenuto (Partito sciolto per eversione)'
          : (isInd ? 'Personalità Indipendente' : (isSec ? `Segretario di ${p.name}` : `Capocorrente in ${p.name} (Segr: ${p.leader})`));
        subEl.innerText = `${rTxt}${offTxt} • ${getIdeoLabel(game.leader.personalIdeo)}`;
      }

      // KPI Strip
      const elPoll = document.getElementById('kPoll');
      if (elPoll) elPoll.innerText = isInd ? `Inf. ${p.poll.toFixed(1)}%` : `${p.poll.toFixed(1)}% (${p.seats}s)`;
      const elInt = document.getElementById('kInt');
      if (elInt) elInt.innerText = `${game.leader.internalSupport}%`;
      const elTrust = document.getElementById('kTrust');
      if (elTrust) {
        const tr = game.isImprisoned ? 0 : (isInd ? 100 : (p.leaderTrust ?? 78));
        elTrust.innerText = `${tr}%`;
        elTrust.style.color = tr < 45 ? '#ef4444' : '#fde047';
      }
      const elPrest = document.getElementById('kPrest');
      if (elPrest) elPrest.innerText = `${game.leader.prestige}%`;
      const elFunds = document.getElementById('kFunds');
      if (elFunds) elFunds.innerText = `€ ${game.funds}k`;
      const elAP = document.getElementById('kAP');
      if (elAP) elAP.innerText = `${game.ap} ⚡`;
      const elStab = document.getElementById('kStab');
      if (elStab) elStab.innerText = game.isDictatorship ? `Rivolta ${game.revoltRisk}%` : `${game.govStability}%`;
      const elMacro = document.getElementById('kMacro');
      if (elMacro) elMacro.innerText = `${game.spread} pt | ${game.gdp >= 0 ? '+' : ''}${game.gdp}%`;
      const elLegV = document.getElementById('kLegV');
      if (elLegV) elLegV.innerText = game.isDictatorship ? 'Sospesa (Regime)' : fmtDate(game.nextElectionDate);

      // Cronometro della Repubblica (in alto + Pulsantiera Flottante Sempre Visibile — Punto 14)
      const topDateEl = document.getElementById('topDate');
      if (topDateEl) topDateEl.innerText = fmtDate(game.date);
      const turnPill = document.getElementById('topTurnPill');
      if (turnPill) turnPill.innerText = `Giorno ${game.turn} • ${game.isDictatorship ? '🦅 ' + game.dictatorshipName : stateFormObj.icon + ' ' + stateFormObj.name}`;
      const intlPill = document.getElementById('topIntlPill');
      if (intlPill) intlPill.innerText = `${game.inEU ? '🇪🇺 Membro UE' : '🇮🇹 Italexit (Fuori UE)'} • ${game.inNATO ? '🛡️ Membro NATO' : '🕊️ Fuori NATO'}`;

      const fDate = document.getElementById('ftDateTxt');
      if (fDate) fDate.innerText = `📅 ${fmtDate(game.date)}`;
      const fTurn = document.getElementById('ftTurnTxt');
      if (fTurn) fTurn.innerText = `Giorno ${game.turn}`;
      const fAP = document.getElementById('ftApTxt');
      if (fAP) fAP.innerText = `${game.ap} ⚡`;
      const fFunds = document.getElementById('ftFundsTxt');
      if (fFunds) fFunds.innerText = `€ ${game.funds}k`;

      // Ribbons (Campagna Elettorale, Campagna Referendaria 30g, Regime)
      const campRib = document.getElementById('campRibbon');
      if (campRib) {
        campRib.style.display = (game.campaignDaysRemaining > 0 && !game.isDictatorship) ? 'block' : 'none';
        const cd = document.getElementById('campDays');
        if (cd) cd.innerText = game.campaignDaysRemaining;
      }
      const refRib = document.getElementById('refRibbon');
      if (refRib) {
        if (game.activeReferendum && !game.isDictatorship) {
          refRib.style.display = 'block';
          const rt = document.getElementById('refRibbonTitle');
          if (rt) rt.innerText = `${game.activeReferendum.title} (${game.activeReferendum.targetLabel})`;
          const rd = document.getElementById('refRibbonDays');
          if (rd) rd.innerText = game.activeReferendum.daysLeft;
          const ry = document.getElementById('refRibbonYes');
          if (ry) ry.innerText = `${game.activeReferendum.yesPct.toFixed(1)}%`;
        } else {
          refRib.style.display = 'none';
        }
      }
      const regRib = document.getElementById('regimeRibbon');
      if (regRib) {
        regRib.style.display = game.isDictatorship ? 'block' : 'none';
        const rt = document.getElementById('regRevoltTxt');
        if (rt) rt.innerText = `${game.revoltRisk}%`;
      }

      // Left Sidebar Polls: Scala dinamica (Punto 20) + nome del leader cliccabile (Punto 5) + scheda partito cliccabile!
      const pollsBox = document.getElementById('pollsBox');
      if (pollsBox) {
        const sortedP = [...game.parties].sort((a,b) => b.poll - a.poll);
        const maxPollVal = Math.max(...sortedP.map(x => x.poll || 0), 35);
        const maxScale = Math.max(40, Math.ceil(maxPollVal / 10) * 10);
        pollsBox.innerHTML = sortedP.map(x => {
          const fillW = Math.min(100, Math.max(2.5, (x.poll / maxScale) * 100)).toFixed(1);
          return `
            <div class="poll-r" title="Clicca per aprire la scheda completa di ${x.name}" style="cursor:pointer; ${x.id===p.id && !isInd ? 'background:rgba(226,185,59,0.12); border:1px solid var(--gold-bd);' : ''}" onclick="openPartyInspectorModal('${x.id}')">
              <div class="poll-h">
                <span class="poll-id" style="color:${x.id===p.id && !isInd ? 'var(--gold-lt)' : 'var(--txt)'};">
                  <span class="mini-svg">${getPartySVG(x.id, x.short, x.color)}</span>
                  <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${x.short} — ${polLink(x.leader)} ${x.inGov?'<span title="Partito al Governo">🟢</span>':''}</span>
                </span>
                <strong style="white-space:nowrap;">${x.poll.toFixed(1)}% <span style="font-size:10px; color:var(--muted);">(${x.seats}s)</span></strong>
              </div>
              <div class="p-bar"><div class="p-fill" style="width:${fillW}%; background:${x.color}; box-shadow:0 0 6px ${x.color}88;"></div></div>
            </div>
          `;
        }).join('');
      }

      // Quirinale Box (Punto 5 & Punto 6: mai mostrare vecchia carica ministeriale sotto il Presidente della Repubblica)
      const qName = document.getElementById('qName');
      if (qName) {
        qName.innerHTML = game.isDictatorship
          ? `${polLink(game.president.name)} (Esautorato)`
          : `${polLink(game.president.name)} (${game.president.age}a)${game.president.isPlayer ? ' <span style="color:var(--gold-lt);">[TU]</span>' : ''}`;
      }
      const qArea = document.getElementById('qArea');
      if (qArea) {
        const cleanArea = (game.president.area && !/^Ministro\b/i.test(game.president.area))
          ? game.president.area
          : 'Garante della Costituzione';
        qArea.innerText = game.isDictatorship ? 'Prerogative sospese dal Regime' : cleanArea;
      }
      const qEnd = document.getElementById('qEnd');
      if (qEnd) qEnd.innerText = fmtDate(game.president.endDate);
      const qTrust = document.getElementById('qTrust');
      if (qTrust) qTrust.innerText = `${game.president.trust}%`;

      // Coalitions Box (con badge dei partiti cliccabili — Punto 6)
      const coalsBox = document.getElementById('coalsBox');
      if (coalsBox) {
        const coalTotals = {};
        game.parties.forEach(pt => {
          const cid = pt.coalId || 'none';
          if (!coalTotals[cid]) coalTotals[cid] = { poll: 0, seats: 0, parties: [] };
          coalTotals[cid].poll += pt.poll;
          coalTotals[cid].seats += pt.seats;
          coalTotals[cid].parties.push(pt);
        });
        coalsBox.innerHTML = Object.entries(coalTotals).map(([cid, data]) => `
          <div style="background:var(--bg-0); border:1px solid var(--bd); border-radius:7px; padding:6px 8px;">
            <div style="display:flex; justify-content:space-between; font-weight:800;">
              <span style="color:var(--gold-lt);">${getCoalName(cid)}</span>
              <span>${data.poll.toFixed(1)}% (${data.seats} seggi)</span>
            </div>
            <div style="font-size:10.5px; color:var(--muted); margin-top:4px; display:flex; flex-wrap:wrap; gap:4px;">
              ${data.parties.map(pt => `<span style="cursor:pointer; color:${pt.color}; font-weight:800; background:rgba(255,255,255,0.04); padding:1px 5px; border-radius:4px; border:1px solid ${pt.color}55;" onclick="openPartyInspectorModal('${pt.id}')" title="Ispeziona ${pt.name}">${pt.short}${pt.inGov ? ' 🟢' : ''}</span>`).join('')}
            </div>
          </div>
        `).join('');
      }

      // Right Sidebar KPIs (Punto 5, Punto 7 & Punto 21: cliccabilità nomi + Presidente della Repubblica + adattamento forma di Stato)
      const rightKpis = document.getElementById('rightKpis');
      if (rightKpis) {
        const isPresForm = (game.stateForm === 'presidenziale');
        const pmTitle = game.isDictatorship ? 'Capo del Regime:' : (game.stateForm === 'cancellierato' ? 'Cancelliere Federale:' : (game.stateForm === 'premierato' ? 'Premier Eletto:' : 'Presidente del Consiglio:'));
        const senTitle = game.stateForm === 'federale' ? 'Pres. Senato delle Regioni:' : 'Pres. Senato:';
        rightKpis.innerHTML = `
          <div>👑 <strong>${isPresForm ? 'Presidente Repubblica & Esecutivo:' : 'Presidente della Repubblica:'}</strong> ${polLink(game.president.name)}${game.president.isPlayer ? ' <span style="color:var(--gold-lt);">(TU)</span>' : ''}</div>
          ${!isPresForm ? `<div>🏛️ <strong>${pmTitle}</strong> ${polLink(game.currentPM)}</div>` : ''}
          ${myMin ? `<div>💼 <strong>Tuo Dicastero:</strong> <span style="color:#34d399; font-weight:800;">${myMin.ministry.name}</span></div>` : ''}
          <div>🪑 <strong>${senTitle}</strong> ${polLink(game.senateSpeaker?.name || 'Ignazio La Russa')}</div>
          <div>🔔 <strong>Pres. Camera:</strong> ${polLink(game.chamberSpeaker?.name || 'Lorenzo Fontana')}</div>
          <div>📜 <strong>Ordinamento:</strong> ${game.isDictatorship ? '🦅 ' + game.dictatorshipName : stateFormObj.icon + ' ' + stateFormObj.name}</div>
          <div>🌍 <strong>Relazioni Esteri:</strong> 🇺🇸 ${Math.round(game.foreignRels.usa||0)} • 🇪🇺 ${Math.round(game.foreignRels.eu_com||0)} • 🇺🇦 ${Math.round(game.foreignRels.ukraine||0)} • 🇷🇺 ${Math.round(game.foreignRels.russia||0)}</div>
        `;
      }

      // Render all tabs
      renderCareerTab();
      renderCommTab();
      renderProgTab();
      renderLawsTab();
      renderCoalTab();
      renderMinTab();
      renderGovTab();
      renderForeignTab();
      renderMapTab();
      renderParlTab();
    }

    /* PUNTO 6 (v6.2): ISPETTORE GLOBALE DEL PARTITO CLICCABILE DA QUALSIASI MENU DEL GIOCO!
       Mostra struttura interna, 3 correnti, segretario, esponenti/ministri, programma sui 14 dossier, relazioni bilaterali e tutti i pulsanti di interazione! */
/* PUNTO 16 & 20: MODAL SCHEDA POLITICO & BUSSOLA POLITICA 2D */
export function closePoliticianModal() {
  const bg = document.getElementById('politicianModalBg');
  if (bg) bg.classList.remove('open');
}

export function openPoliticianCardModal(polId) {
  let target = null;
  const isPlayer = (polId === 'player_leader_pol' || polId === 'player' || polId === game.leader.name);
  if (isPlayer) {
    const pPol = ensurePlayerInPoliticians();
    const mergedHistory = [];
    const seenH = new Set();
    [
      ...(Array.isArray(game.leader.history) ? game.leader.history : []),
      ...(pPol && Array.isArray(pPol.history) ? pPol.history : []),
      ...(Array.isArray(game.politicianHistoryMap?.[pPol?.id || 'player_leader_pol']) ? game.politicianHistoryMap[pPol?.id || 'player_leader_pol'] : [])
    ].forEach(h => {
      if (h && !seenH.has(h)) {
        seenH.add(h);
        mergedHistory.push(h);
      }
    });
    if (mergedHistory.length === 0) {
      mergedHistory.push(
        `Guida politica di ${game.partyRole === 'independent' ? 'Movimento Civico Indipendente' : (game.parties.find(x => x.id === game.playerPartyId)?.name || 'Partito')}`,
        'Protagonista della legislatura corrente'
      );
    }
    target = {
      id: pPol ? pPol.id : 'player_leader_pol',
      name: game.leader.name,
      age: game.leader.age || 49,
      gender: game.leader.gender || 'M',
      region: game.leader.region || 'Lazio',
      partyId: (game.partyRole === 'independent' ? 'ind' : game.playerPartyId),
      role: (game.president?.isPlayer ? 'Presidente della Repubblica' : (game.currentPM === game.leader.name ? 'Presidente del Consiglio' : (game.partyRole === 'secretary' ? 'Segretario Nazionale' : (game.partyRole === 'member' ? 'Membro / Capocorrente' : 'Leader Indipendente')))),
      pref: pPol?.pref || 'governo',
      comp: pPol?.comp || 88,
      clout: game.leader.prestige || 80,
      loyalty: 100,
      compass: game.leader.compass || { economic: 0.0, social: 0.0, ideoScore: game.leader.personalIdeo || 2.0 },
      bio: `Leader politico protagonista della vita parlamentare italiana. Prestigio personale: ${game.leader.prestige || 75}%, fiducia interna dei militanti: ${game.leader.internalSupport || 75}%.`,
      history: mergedHistory
    };
  } else {
    target = getPoliticianById(polId);
    if (!target) {
      const foundParty = game.parties.find(p => p.leader === polId || p.wingLeader === polId);
      if (foundParty) {
        target = {
          id: polId,
          name: polId,
          age: 54,
          gender: 'M',
          region: 'Italia',
          partyId: foundParty.id,
          role: foundParty.leader === polId ? 'Segretario Nazionale' : 'Capocorrente',
          pref: 'mef',
          comp: 80,
          clout: 78,
          loyalty: 85,
          compass: { economic: 0.0, social: 0.0, ideoScore: foundParty.ideoScore || 2.0 },
          bio: `Figura di vertice di ${foundParty.name}.`,
          history: [`Militanza e leadership in ${foundParty.short}`]
        };
      } else {
        target = {
          id: polId,
          name: polId,
          age: 55,
          gender: 'M',
          region: 'Italia',
          partyId: 'ind',
          role: 'Personalità Istituzionale',
          pref: 'governo',
          comp: 75,
          clout: 70,
          loyalty: 75,
          compass: { economic: 0.0, social: 0.0, ideoScore: 2.0 },
          bio: 'Personalità del panorama politico e istituzionale italiano.',
          history: ['Attività parlamentare e civile']
        };
      }
    }
    // Punto 1 & Punto 16c: Sincronizza sempre lo stato dinamico della partita (partito dopo scissioni, ruolo attuale e storico incarichi)
    if (target) {
      if (game.politicianPartyMap && game.politicianPartyMap[target.id]) {
        target.partyId = game.politicianPartyMap[target.id];
      }
      if (game.politicianRoleMap && game.politicianRoleMap[target.id]) {
        target.role = game.politicianRoleMap[target.id];
      }
      if (game.politicianHistoryMap && Array.isArray(game.politicianHistoryMap[target.id]) && game.politicianHistoryMap[target.id].length > 0) {
        const merged = [];
        const seen = new Set();
        [...game.politicianHistoryMap[target.id], ...(target.history || [])].forEach(h => {
          if (h && !seen.has(h)) {
            seen.add(h);
            merged.push(h);
          }
        });
        target.history = merged;
      }
    }
  }

  const pt = game.parties.find(x => x.id === target.partyId);
  const partyColor = pt ? pt.color : '#38bdf8';
  const partyName = pt ? `${pt.name} (${pt.short})` : (target.partyId === 'tech' ? 'Tecnico Indipendente' : 'Indipendente');
  const activeOffice = getPersonCurrentOffice(target.name);
  const curOffice = activeOffice || target.role || 'Membro dell\'Assemblea';

  // Assicura che l'incarico istituzionale attuale sia sempre visibile in cima al Curriculum dinamico (Punto 1)
  const displayHistory = Array.isArray(target.history) ? [...target.history] : [];
  if (activeOffice && !displayHistory.some(h => h.toLowerCase().includes(activeOffice.toLowerCase().slice(0, 18)))) {
    displayHistory.unshift(`In carica (${fmtDate(game.date)}): ${activeOffice}`);
  }

  let rawEcon = 0.0, rawSoc = 0.0;
  if (Array.isArray(target.ideo) && target.ideo.length >= 2) {
    rawEcon = target.ideo[0];
    rawSoc = target.ideo[1];
  } else if (target.compass) {
    rawEcon = target.compass.economic ?? 0.0;
    rawSoc = target.compass.social ?? 0.0;
  }
  const econ = Math.max(-2.0, Math.min(2.0, rawEcon));
  const soc = Math.max(-2.0, Math.min(2.0, rawSoc));
  const svgX = 120 + (econ / 2.0) * 95;
  const svgY = 120 - (soc / 2.0) * 95;

  const econLabel = econ <= -0.5 ? 'Sinistra (Welfare, Spesa & Intervento Statale)' : (econ >= 0.5 ? 'Destra (Libero Mercato, Deregulation & Meno Tasse)' : 'Centro / Riformismo Pragmatico');
  const socLabel = soc <= -0.5 ? 'Progressista, Laico & Diritti Civili' : (soc >= 0.5 ? 'Conservatore, Tradizionalista & Sovranista' : 'Moderato / Difesa della Costituzione');

  const bodyEl = document.getElementById('polModalBody');
  if (!bodyEl) return;

  bodyEl.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap; padding-bottom:12px; border-bottom:1px solid var(--border); margin-bottom:12px;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg, ${partyColor}44, ${partyColor}aa); border:2px solid ${partyColor}; display:flex; align-items:center; justify-content:center; font-size:22px;">
          ${target.gender === 'F' ? '👩‍💼' : '👨‍💼'}
        </div>
        <div>
          <div style="font-size:10.5px; font-weight:800; color:var(--gold-lt); letter-spacing:0.8px;">SCHEDA POLITICA ISTITUZIONALE • ART. 51 COST.</div>
          <h3 style="margin:2px 0; font-size:20px; color:#fff;">${target.name}</h3>
          <div style="font-size:11.5px; color:var(--muted);">
            <strong style="color:${partyColor};">${partyName}</strong> •
            <span>${target.age} anni</span> •
            <span>Regione: <strong>${target.region || 'Nazionale'}</strong></span>
          </div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="background:var(--bg-2); border:1px solid ${partyColor}; padding:5px 10px; border-radius:6px; font-size:11px;">
          <div style="color:var(--muted); font-size:9.5px;">INCARICO ISTITUZIONALE</div>
          <strong style="color:var(--gold-lt);">${curOffice}</strong>
        </div>
      </div>
    </div>

    <!-- GRIGLIA: BUSSOLA 2D A SINISTRA, STATISTICHE & COMPETENZE A DESTRA -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:14px; margin-bottom:12px;">
      <!-- BUSSOLA POLITICA 2D SVG -->
      <div class="box" style="margin-bottom:0; text-align:center; padding:10px;">
        <div style="font-size:11px; font-weight:800; color:var(--gold-lt); margin-bottom:6px;">🧭 BUSSOLA POLITICA 2D</div>
        <svg viewBox="0 0 240 240" style="width:220px; height:220px; background:#0b1329; border-radius:8px; border:1px solid var(--bd);">
          <rect x="15" y="15" width="105" height="105" fill="rgba(239,68,68,0.12)" />
          <rect x="120" y="15" width="105" height="105" fill="rgba(59,130,246,0.12)" />
          <rect x="15" y="120" width="105" height="105" fill="rgba(16,185,129,0.12)" />
          <rect x="120" y="120" width="105" height="105" fill="rgba(245,158,11,0.12)" />

          <line x1="15" y1="120" x2="225" y2="120" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3" />
          <line x1="120" y1="15" x2="120" y2="225" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3" />

          <text x="120" y="26" text-anchor="middle" font-size="7.5" fill="#94a3b8" font-weight="bold">CONSERVATORE / TRADIZIONE</text>
          <text x="120" y="218" text-anchor="middle" font-size="7.5" fill="#94a3b8" font-weight="bold">PROGRESSISTA / DIRITTI CIVILI</text>
          <text x="22" y="116" text-anchor="start" font-size="7.5" fill="#94a3b8" font-weight="bold">STATO</text>
          <text x="218" y="116" text-anchor="end" font-size="7.5" fill="#94a3b8" font-weight="bold">MERCATO</text>

          <circle cx="${svgX}" cy="${svgY}" r="9" fill="none" stroke="${partyColor}" stroke-width="2" opacity="0.65">
            <animate attributeName="r" values="7;11;7" dur="2.4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="${svgX}" cy="${svgY}" r="4.5" fill="#fde047" stroke="#fff" stroke-width="1.5" />
        </svg>

        <div style="font-size:10px; color:var(--muted); margin-top:6px; line-height:1.4;">
          Posizione: <strong>Econ ${econ > 0 ? '+' : ''}${econ.toFixed(2)}</strong> • <strong>Soc ${soc > 0 ? '+' : ''}${soc.toFixed(2)}</strong>
        </div>
      </div>

      <!-- PROFILO ISTITUZIONALE, COMPETENZE & CLOUT -->
      <div style="display:flex; flex-direction:column; gap:8px;">
        <div class="box" style="margin-bottom:0;">
          <h4 style="color:var(--gold-lt); margin-bottom:4px;">📊 Parametri Politico-Istituzionali</h4>
          <div style="font-size:11px; margin-bottom:6px;">
            <div>Economia: <strong style="color:#fff;">${econLabel}</strong></div>
            <div>Società & Valori: <strong style="color:#fff;">${socLabel}</strong></div>
            <div>Dicastero Preferito: <strong style="color:var(--gold-lt);"><span style="text-transform:uppercase;">${(target.pref || 'governo')}</span></strong></div>
          </div>

          <div style="margin-bottom:6px;">
            <div style="display:flex; justify-content:space-between; font-size:10.5px; margin-bottom:2px;">
              <span>Competenza Governativa</span>
              <strong>${target.competence || target.comp || 75}/100</strong>
            </div>
            <div class="p-bar" style="height:6px;"><div class="p-fill" style="width:${target.competence || target.comp || 75}%; background:#38bdf8;"></div></div>
          </div>

          <div style="margin-bottom:6px;">
            <div style="display:flex; justify-content:space-between; font-size:10.5px; margin-bottom:2px;">
              <span>Prestigio & Clout Politico</span>
              <strong>${target.prestige || target.clout || 70}/100</strong>
            </div>
            <div class="p-bar" style="height:6px;"><div class="p-fill" style="width:${target.prestige || target.clout || 70}%; background:#f59e0b;"></div></div>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; font-size:10.5px; margin-bottom:2px;">
              <span>Lealtà di Partito / Fedeltà</span>
              <strong>${target.loyalty || 80}/100</strong>
            </div>
            <div class="p-bar" style="height:6px;"><div class="p-fill" style="width:${target.loyalty || 80}%; background:#10b981;"></div></div>
          </div>
        </div>

        <div class="box" style="margin-bottom:0; flex:1;">
          <h4 style="color:var(--gold-lt); margin-bottom:4px;">📖 Biografia</h4>
          <p style="font-size:11px; line-height:1.45; margin-bottom:0;">
            ${target.bio || `${target.name} è una figura di spicco nel panorama politico nazionale, attivo nei dibattiti parlamentari e nelle scelte strategiche dell'area di riferimento.`}
          </p>
        </div>
      </div>
    </div>

    <!-- CURRICULUM E STORICO DEGLI INCARICHI (Punto 1: dinamico e sempre aggiornato durante la partita) -->
    <div class="box" style="margin-bottom:8px;">
      <h4 style="color:var(--gold-lt); margin-bottom:4px;">📜 Curriculum & Storico Istituzionale</h4>
      <ul style="margin:0; padding-left:18px; font-size:11.5px; color:var(--muted); line-height:1.6;">
        ${(displayHistory && displayHistory.length > 0)
          ? displayHistory.map((h, i) => `<li><span style="color:${i === 0 ? 'var(--gold-lt)' : '#fff'}; font-weight:${i === 0 ? '800' : '500'};">${h}</span></li>`).join('')
          : `<li><span style="color:#fff;">Militanza politica e impegno civico sul territorio regionale (${target.region || 'Italia'}).</span></li><li><span style="color:#fff;">Eletto nelle assemblee legislative ed esecutive della Repubblica.</span></li>`
        }
      </ul>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:8px;">
      ${pt && !isPlayer ? `<button class="btn btn-w" onclick="closePoliticianModal();openPartyInspectorModal('${pt.id}')">🏛️ Apri Scheda Partito (${pt.short})</button>` : ''}
      <button class="btn" onclick="closePoliticianModal()">Chiudi Scheda</button>
    </div>
  `;

  const bg = document.getElementById('politicianModalBg');
  if (bg) bg.classList.add('open');
}


export function openPartyInspectorModal(partyId) {
      const target = game.parties.find(x => x.id === partyId);
      if (!target) return;
      game.selectedDossierPartyId = target.id;
      const p = getP();
      const isInd = (game.partyRole === 'independent');
      const isMyParty = (!isInd && target.id === p.id);
      const cmp = computeCompat(p, target);
      const coalName = getCoalName(target.coalId);
      const sameCoal = (!isInd && target.coalId !== 'none' && target.coalId === p.coalId);
      const coalLead = (!isInd && p.coalId !== 'none') ? getCoalLeaderParty(p.coalId) : null;
      const isCoalLeader = (!isInd && coalLead && coalLead.id === p.id);
      const coalMembers = target.coalId && target.coalId !== 'none'
        ? game.parties.filter(x => x.coalId === target.coalId)
        : [target];
      const coalSeats = coalMembers.reduce((s, x) => s + (x.seats || 0), 0);
      const coalPoll = coalMembers.reduce((s, x) => s + (x.poll || 0), 0);

      const factions = target.factions || [
        { name:`Area Maggioritaria (${target.leader})`, leader:target.leader, share:58, desc:"Corrente guida della segreteria." },
        { name:target.wingName||"Area Riformista", leader:target.wingLeader||"Capocorrente", share:28, desc:"Principale corrente interna." },
        { name:"Circoli Territoriali", leader:"Amministratori Locali", share:14, desc:"Base militante regionale." }
      ];

      // Punto 16a & 16c: Considera anche eventuali trasferimenti registrati in politicianPartyMap
      const partyPols = POLITICIANS.filter(x => {
        const curPid = (game.politicianPartyMap && game.politicianPartyMap[x.id]) ? game.politicianPartyMap[x.id] : x.partyId;
        return curPid === target.id;
      });
      const otherMajor = game.parties.filter(x => x.id !== target.id).sort((a,b)=>b.poll-a.poll).slice(0, 8);

      const bodyEl = document.getElementById('piBody');
      if (!bodyEl) return;

      bodyEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; padding-bottom:10px; border-bottom:1px solid var(--border); margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:48px; height:48px; flex-shrink:0;">${getPartySVG(target.id, target.short, target.color)}</div>
            <div>
              <div style="font-size:10px; font-weight:900; color:var(--gold-lt); letter-spacing:0.8px;">ISPETTORE STRUTTURA PARTITO • ${coalName.toUpperCase()}</div>
              <h3 style="margin:2px 0; font-size:19px; color:${target.color};">${target.name} (${target.short}) ${target.inGov ? '🟢 [Al Governo]' : '🔴 [All\'Opposizione]'}</h3>
              <div style="font-size:11.5px; color:var(--muted);">
                Segretario Nazionale: ${polLink(target.leader, `${target.leader} (${target.leaderAge}a) 🔍`)} •
                Capocorrente: ${target.wingLeader ? polLink(target.wingLeader, `${target.wingLeader} 🔍`, 'color:#fde047;') : '<strong>N/D</strong>'} •
                Collocazione: <strong>${getIdeoLabel(getPartyIdeoScore(target))}</strong>
              </div>
            </div>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <div style="text-align:right; background:var(--bg-2); padding:6px 12px; border-radius:8px; border:1px solid ${target.color};">
              <div style="font-size:16px; font-weight:900; color:#fff;">${target.poll.toFixed(1)}%</div>
              <div style="font-size:10.5px; color:var(--muted);">${target.seats} Deputati su 400</div>
            </div>
            <button class="btn" onclick="closePartyInspectorModal()">✖ Chiudi</button>
          </div>
        </div>

        <!-- PUNTO 14: RIQUADRO ESPLICITO SULLA COALIZIONE ATTUALE E COLLOCAZIONE PARLAMENTARE DEL PARTITO -->
        <div class="box" style="background:rgba(15,23,42,0.75); border:1px solid ${target.inGov ? 'rgba(16,185,129,0.5)' : 'rgba(56,189,248,0.4)'}; margin-bottom:10px; padding:9px 12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div>
              <span style="font-size:10.5px; font-weight:900; color:var(--muted); text-transform:uppercase; letter-spacing:0.6px;">🤝 Coalizione Attuale:</span>
              <strong style="color:var(--gold-lt); font-size:13px; margin-left:6px;">${coalName}</strong>
              <span style="font-size:11px; color:var(--muted); margin-left:6px;">(${coalPoll.toFixed(1)}% • ${coalSeats}/400 seggi)</span>
            </div>
            <span style="font-size:11px; font-weight:900; padding:3px 9px; border-radius:999px; background:${target.inGov ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)'}; color:${target.inGov ? '#34d399' : '#f87171'}; border:1px solid ${target.inGov ? '#10b98166' : '#ef444466'};">
              ${target.inGov ? '🏛️ Partito di Maggioranza (Al Governo)' : '⚔️ Partito di Opposizione Parlamentare'}
            </span>
          </div>
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-top:6px; font-size:11px;">
            <span style="color:var(--muted);">Forze della Coalizione:</span>
            ${coalMembers.map(cm => `
              <span style="cursor:pointer; display:inline-flex; align-items:center; gap:4px; background:var(--bg-0); border:1px solid ${cm.color}88; padding:2px 7px; border-radius:5px; font-weight:800; color:${cm.color};" onclick="openPartyInspectorModal('${cm.id}')" title="Apri scheda di ${cm.name}">
                ${cm.short} <span style="color:#fff; font-weight:600;">(${cm.poll.toFixed(1)}% • ${cm.seats}s)</span>
              </span>
            `).join('')}
          </div>
        </div>

        <!-- PULSANTIERA DI INTERAZIONE DIRETTA COL PARTITO -->
        <div class="box" style="border-color:var(--gold-bd); margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
            <strong style="color:var(--gold-lt); font-size:12.5px;">
              ${isMyParty ? `👑 Questo è il tuo partito attuale (${target.name})` : `⚡ Azioni Politiche, Diplomatiche e di Coalizione verso ${target.short} (Compatibilità: ${cmp.total}%)`}
            </strong>
            ${!isMyParty ? `<span style="font-size:11px;">${cmp.hasVeto ? `<strong style="color:#f87171;">⛔ Veto Attivo (${cmp.reason || 'Ideologico'})</strong>` : '<strong style="color:#34d399;">✅ Nessun Veto Bilaterale</strong>'}</span>` : ''}
          </div>
          ${game.isImprisoned ? `<div style="font-size:11.5px; color:#f87171;">🔒 Sei detenuto a Rebibbia: interazioni sospese.</div>` : (isMyParty ? `
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <button class="btn btn-m" onclick="closePartyInspectorModal();internalPartyAction('build_faction')">🤝 Raduna i Circoli della Tua Corrente (€ 25k • 20 ⚡)</button>
              ${game.partyRole !== 'secretary' ? `
                <button class="btn btn-w" onclick="closePartyInspectorModal();internalPartyAction('challenge_congress')">🗳️ Sfida ${target.leader} al Congresso Nazionale (35 ⚡)</button>
              ` : `
                <button class="btn" onclick="closePartyInspectorModal();internalPartyAction('pacify')">🕊️ Patto Interno coi Capicorrente (20 ⚡)</button>
              `}
              <button class="btn btn-r" onclick="closePartyInspectorModal();internalPartyAction('split')">⚡ Guida una Scissione da ${target.short} (40 ⚡)</button>
            </div>
          ` : `
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <button class="btn" onclick="diploAct('${target.id}','summit');openPartyInspectorModal('${target.id}')">🤝 Vertice Bilaterale con ${target.leader} (12 ⚡ → +12 Rel.)</button>
              <button class="btn" onclick="diploAct('${target.id}','attack');openPartyInspectorModal('${target.id}')">⚔️ Attacca ${target.short} sui Media (10 ⚡ → +Prestigio)</button>
              ${cmp.hasVeto && cmp.progScore >= 48 ? `<button class="btn btn-m" onclick="diploAct('${target.id}','liftVeto');openPartyInspectorModal('${target.id}')">🕊️ Patto di Disgelo: Rimuovi Veto (20 ⚡)</button>` : ''}
              ${!isInd && !sameCoal && !cmp.hasVeto && cmp.total >= 52 ? `<button class="btn btn-m" onclick="diploAct('${target.id}','invite');openPartyInspectorModal('${target.id}')">➕ Invita ${target.short} nella Tua Coalizione (22 ⚡)</button>` : ''}
              ${!isInd && target.coalId !== 'none' && target.coalId !== p.coalId ? `<button class="btn btn-w" onclick="closePartyInspectorModal();requestJoinExistingCoalition('${target.coalId}')">➡️ Chiedi di Entrare in ${coalName} (20 ⚡)</button>` : ''}
              ${sameCoal && isCoalLeader ? `<button class="btn btn-r" onclick="expelCoalitionMember('${target.id}');openPartyInspectorModal('${target.id}')">✖ Espelli ${target.short} dalla Coalizione</button>` : ''}
              <button class="btn btn-w" onclick="closePartyInspectorModal();joinPartyAsMember('${target.id}')">📥 Entra in ${target.short} come Capocorrente (30 ⚡)</button>
            </div>
          `)}
        </div>

        <div class="grid2" style="margin-bottom:12px;">
          <!-- STRUTTURA INTERNA, STATISTICHE E 3 CORRENTI -->
          <div class="box" style="margin-bottom:0;">
            <h4 style="color:var(--gold-lt); margin-bottom:6px;">🏛️ Struttura Interna & Correnti di ${target.short}</h4>
            <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px; text-align:center; background:var(--bg-1); padding:6px; border-radius:6px; font-size:11px; margin-bottom:8px;">
              <div>Coesione<br><strong style="color:#34d399;">${target.cohesion || 78}%</strong></div>
              <div>Fiducia Segr.<br><strong style="color:#fde047;">${target.leaderTrust || 78}%</strong></div>
              <div>Radicamento<br><strong style="color:#38bdf8;">${Math.round(target.orgStrength || 60)}/100</strong></div>
            </div>
            <div style="display:flex; flex-direction:column; gap:5px; margin-bottom:8px;">
              ${factions.map((f, idx) => `
                <div style="background:var(--bg-1); padding:6px 8px; border-radius:6px; border-left:3px solid ${idx===0?target.color:(idx===1?'#fde047':'#38bdf8')}; font-size:11px;">
                  <div style="display:flex; justify-content:space-between;">
                    <strong>${idx===0?'👑':'⚔️'} ${f.name} (<em>${polLink(f.leader)}</em>)</strong>
                    <strong style="color:var(--gold-lt);">${f.share}%</strong>
                  </div>
                  <div style="font-size:10px; color:var(--muted);">${f.desc}</div>
                </div>
              `).join('')}
            </div>
            ${partyPols.length > 0 ? `
              <div style="font-size:11px; color:var(--muted);">
                <strong>Esponenti & Ministri di ${target.short} (${partyPols.length}):</strong>
                <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:4px;">
                  ${partyPols.map(pol => {
                    const off = getPersonCurrentOffice(pol, null, false);
                    return `<span style="background:var(--bg-1); border:1px solid var(--bd); padding:2px 6px; border-radius:5px; font-size:10px; color:#fff; cursor:pointer;" onclick="openPoliticianCardModal('${pol.id}')" title="Visualizza scheda e bussola 2D di ${pol.name}">${pol.name} (${pol.age}a)${off ? ` • <strong style="color:var(--gold-lt);">${off}</strong>` : ''} 🔍</span>`;
                  }).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- RELAZIONI BILATERALI DI QUESTO PARTITO CON GLI ALTRI PARTITI -->
          <div class="box" style="margin-bottom:0;">
            <h4 style="color:var(--gold-lt); margin-bottom:6px;">🤝 Rapporti di ${target.short} con gli Altri Partiti</h4>
            <p style="font-size:11px; margin-bottom:8px;">${target.bio || `Forza politica dell'area ${target.area}.`}</p>
            <div style="display:flex; flex-direction:column; gap:5px;">
              ${otherMajor.map(o => {
                const c = computeCompat(target, o);
                const barC = c.total >= 62 ? '#10b981' : (c.total >= 45 ? '#f59e0b' : '#ef4444');
                return `
                  <div style="background:var(--bg-1); padding:5px 8px; border-radius:6px; font-size:11px; cursor:pointer;" onclick="openPartyInspectorModal('${o.id}')">
                    <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                      <span><strong style="color:${o.color};">${o.short}</strong> (${polLink(o.leader)}) ${o.coalId===target.coalId && target.coalId!=='none' ? '🤝 Alleato' : ''}</span>
                      <strong style="color:${barC};">Affinità ${c.total}% (Rel. ${c.rel}%) ${c.hasVeto?'⛔':''}</strong>
                    </div>
                    <div class="p-bar" style="height:5px;"><div class="p-fill" style="width:${c.total}%; background:${barC};"></div></div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- LISTA DEI 14 DOSSIER DEL PROGRAMMA CON LE AFFINITÀ RISPETTO AL GIOCATORE -->
        <div class="box" style="margin-bottom:0;">
          <h4 style="color:var(--gold-lt); margin-bottom:6px;">📜 Programma Politico sui 14 Dossier & Confronto col Tuo Posizionamento (Affinità Programmatica: ${cmp.progScore}%)</h4>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(215px, 1fr)); gap:6px; font-size:11px;">
            ${DOSSIERS.map(d => {
              const thVal = target.stances[d.key] ?? 2;
              const myVal = p.stances[d.key] ?? 2;
              const dist = Math.abs(thVal - myVal);
              const badgeCol = dist === 0 ? '#34d399' : (dist === 1 ? '#fde047' : '#f87171');
              return `
                <div style="background:var(--bg-1); border:1px solid var(--bd); border-left:3px solid ${badgeCol}; padding:6px 8px; border-radius:6px;">
                  <div style="display:flex; justify-content:space-between; font-weight:800; color:#fff; margin-bottom:2px;">
                    <span>${d.title}</span>
                    <span style="color:${badgeCol}; font-size:10px;">${dist===0?'✅ Identico':(dist===1?'⚖️ Vicino':'⚡ Divergente')}</span>
                  </div>
                  <div style="font-size:10.5px; color:var(--gold-lt);">${STANCE_LABELS[thVal].short}: <span style="color:var(--txt);">${d.opts[thVal]}</span></div>
                  ${!isMyParty ? `<div style="font-size:9.5px; color:var(--muted); margin-top:2px;">Tua posizione: ${STANCE_LABELS[myVal].short}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      const bg = document.getElementById('partyInspectorModalBg');
      if (bg) bg.classList.add('open');
    }

export function closePartyInspectorModal() {
      const bg = document.getElementById('partyInspectorModalBg');
      if (bg) bg.classList.remove('open');
    }

    /* PUNTO 1 (v6.2.1): SELETTORE CUSTOM INTEGRATO NEL MOTORE DI GIOCO CORRETTO E POTENZIATO CON SCHEDE POLITICI E MINISTRI */

export function initCustomSelectEngine() {
      const handleSelectTrigger = (e) => {
        const sel = e.target && e.target.closest ? e.target.closest('select') : null;
        if (!sel || sel.disabled) return;
        e.preventDefault();
        e.stopPropagation();
        if (typeof sel.blur === 'function') sel.blur();
        openGameSelectForElement(sel);
      };

      document.addEventListener('mousedown', handleSelectTrigger, true);
      document.addEventListener('click', (e) => {
        const sel = e.target && e.target.closest ? e.target.closest('select') : null;
        if (!sel || sel.disabled) return;
        e.preventDefault();
        e.stopPropagation();
        if (!activeSelectElement) openGameSelectForElement(sel);
      }, true);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeSelectElement) {
          closeGameSelectModal();
          return;
        }
        const sel = e.target && e.target.closest ? e.target.closest('select') : null;
        if (!sel || sel.disabled) return;
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          openGameSelectForElement(sel);
        }
      }, true);
    }

export function openGameSelectForElement(selEl) {
      activeSelectElement = selEl;
      const modalBg = document.getElementById('gameSelectModalBg');
      const titleEl = document.getElementById('gsTitle');
      const searchWrap = document.getElementById('gsSearchWrap');
      const searchEl = document.getElementById('gsSearchInput');
      if (!modalBg || !titleEl) return;

      // Ricava un titolo contestuale dall'etichetta vicina
      let labelTxt = "Seleziona un'opzione";
      const fld = selEl.closest('.fld') || selEl.closest('.box');
      if (fld) {
        const lbl = fld.querySelector('label, h4, strong');
        if (lbl && lbl.innerText) labelTxt = lbl.innerText.trim().slice(0, 75);
      }
      titleEl.innerText = `🏛️ ${labelTxt}`;

      // PUNTO 11: Placeholder di ricerca contestuale in base al menu aperto (mai scrivere "cerca politico, partito o voce" ovunque!)
      if (searchEl) {
        const sid = (selEl.id || '').toLowerCase();
        const llow = labelTxt.toLowerCase();
        if (sid.includes('dossier') || llow.includes('dossier') || llow.includes('tema') || llow.includes('riforma')) {
          searchEl.placeholder = '🔍 Cerca dossier o tema programmatico...';
        } else if (sid.includes('bloc') || llow.includes('bacino') || llow.includes('categoria') || llow.includes('elettoral')) {
          searchEl.placeholder = '🔍 Cerca categoria o bacino sociale...';
        } else if (sid.includes('reg') || llow.includes('region')) {
          searchEl.placeholder = '🔍 Cerca regione italiana...';
        } else if (sid.includes('party') || sid.includes('partit') || llow.includes('partito')) {
          searchEl.placeholder = '🔍 Cerca partito politico...';
        } else if (sid.includes('pol') || sid.includes('min') || sid.includes('cand') || llow.includes('politico') || llow.includes('ministro') || llow.includes('candidato') || llow.includes('presidente')) {
          searchEl.placeholder = '🔍 Cerca politico, candidato o esponente...';
        } else {
          searchEl.placeholder = '🔍 Cerca opzione nell\'elenco...';
        }
        searchEl.value = '';
      }

      const hasMany = selEl.options.length > 5;
      if (searchWrap) searchWrap.style.display = hasMany ? 'block' : 'none';

      renderGameSelectOptions('');
      modalBg.classList.add('open');
      if (searchEl && hasMany) {
        setTimeout(() => searchEl.focus(), 30);
      }
    }

export function renderGameSelectOptions(queryStr) {
      const listEl = document.getElementById('gsOptionsList');
      if (!listEl || !activeSelectElement) return;
      const q = (queryStr || '').toLowerCase().trim();
      const allOpts = Array.from(activeSelectElement.options).map((opt, idx) => ({ opt, idx }));

      // Filtra eventuali opzioni placeholder vuote (es. "-- Proponi Sostituto --") e applica la ricerca
      const validOpts = allOpts.filter(({ opt }) => opt.value !== '');
      const sourceOpts = validOpts.length > 0 ? validOpts : allOpts;
      const filtered = sourceOpts.filter(({ opt }) => {
        if (!q) return true;
        if (opt.text.toLowerCase().includes(q)) return true;
        const pr = PRESET_POLITICIANS.find(x => x.id === opt.value);
        if (pr && ((pr.desc || '').toLowerCase().includes(q) || (pr.region || '').toLowerCase().includes(q))) return true;
        return false;
      });

      if (filtered.length === 0) {
        listEl.innerHTML = `<div style="padding:14px; text-align:center; color:var(--muted); font-size:12.5px;">Nessuna voce trovata per "${queryStr}".</div>`;
        return;
      }

      const partyCatalog = (game.parties && game.parties.length > 0) ? game.parties : INITIAL_PARTIES;

      listEl.innerHTML = filtered.map(({ opt, idx }) => {
        const isSel = opt.value === activeSelectElement.value && opt.value !== '';
        const isDis = opt.disabled;

        // Arricchimento grafico per Politici Reali (Setup) e Politici/Ministri (In-Game)
        const presetPol = PRESET_POLITICIANS.find(x => x.id === opt.value);
        const gamePol = POLITICIANS.find(x => x.id === opt.value);
        let badgeHtml = '';
        let subHtml = '';

        if (presetPol) {
          const pObj = partyCatalog.find(p => p.id === presetPol.partyId);
          const col = pObj ? pObj.color : '#94a3b8';
          const short = pObj ? pObj.short : 'IND';
          const roleLbl = presetPol.role === 'secretary' ? '👑 Segretario' : (presetPol.role === 'member' ? '⚔️ Capocorrente' : '📄 Indipendente');
          badgeHtml = `<span style="background:${col}26; color:${col}; border:1px solid ${col}88; padding:2px 7px; border-radius:6px; font-size:10.5px; font-weight:900; flex-shrink:0;">${short}</span>`;
          subHtml = `<div style="font-size:11px; color:var(--muted); margin-top:2px;">${roleLbl} • ${presetPol.region} • ${presetPol.desc || ''}</div>`;
        } else if (gamePol) {
          const pObj = partyCatalog.find(p => p.id === gamePol.partyId);
          const col = pObj ? pObj.color : '#38bdf8';
          const short = pObj ? pObj.short : 'TECNICO';
          badgeHtml = `<span style="background:${col}26; color:${col}; border:1px solid ${col}88; padding:2px 7px; border-radius:6px; font-size:10.5px; font-weight:900; flex-shrink:0;">${short}</span>`;
          subHtml = `<div style="font-size:11px; color:var(--muted); margin-top:2px;">Età: ${gamePol.age}a • Competenza: <strong style="color:#34d399;">${gamePol.comp}/100</strong> • Autorevolezza: ${gamePol.clout || 75}</div>`;
        }

        return `
          <div class="gs-opt-card ${isSel ? 'selected' : ''} ${isDis ? 'disabled' : ''}" onclick="${isDis ? '' : `pickGameSelectOptionIndex(${idx})`}">
            <div style="display:flex; align-items:flex-start; gap:9px; flex:1; min-width:0;">
              ${badgeHtml}
              <div style="flex:1; min-width:0;">
                <div style="font-weight:800; color:#fff; font-size:13px; line-height:1.3;">${opt.text}</div>
                ${subHtml}
              </div>
            </div>
            <span style="font-size:11px; font-weight:900; white-space:nowrap; color:${isSel ? 'var(--gold-lt)' : (isDis ? '#f87171' : '#38bdf8')};">
              ${isSel ? '✓ Selezionato' : (isDis ? '⛔ Già in carica' : 'Scegli →')}
            </span>
          </div>
        `;
      }).join('');
    }

export function filterGameSelectOptions(val) {
      renderGameSelectOptions(val);
    }

export function pickGameSelectOptionIndex(optIdx) {
      if (!activeSelectElement) return;
      const targetEl = activeSelectElement;
      const opt = targetEl.options[optIdx];
      if (!opt || opt.disabled) return;
      closeGameSelectModal();
      targetEl.selectedIndex = optIdx;
      targetEl.value = opt.value;
      targetEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

export function pickGameSelectValue(val) {
      if (!activeSelectElement) return;
      const idx = Array.from(activeSelectElement.options).findIndex(o => o.value === val);
      if (idx >= 0) pickGameSelectOptionIndex(idx);
    }

export function closeGameSelectModal() {
      const modalBg = document.getElementById('gameSelectModalBg');
      if (modalBg) modalBg.classList.remove('open');
      activeSelectElement = null;
    }

export function openModal(title, bodyHtml, actions) {
      if (title !== undefined) {
        const tEl = document.getElementById('mTitle');
        if (tEl) tEl.innerHTML = title;
      }
      if (bodyHtml !== undefined) {
        const bEl = document.getElementById('mBody');
        if (bEl) bEl.innerHTML = bodyHtml;
      }
      if (actions !== undefined) {
        const actBox = document.getElementById('mChoices');
        if (actBox) {
          actBox.innerHTML = '';
          (actions || [{ label: 'Chiudi', fn: closeModal }]).forEach(a => {
            const b = document.createElement('button');
            b.className = 'm-btn';
            b.innerHTML = `<strong>${a.label}</strong>`;
            b.onclick = a.fn;
            actBox.appendChild(b);
          });
        }
      }
      const bg = document.getElementById('modalBg');
      if (bg) bg.classList.add('open');
    }

export function closeModal() {
      const bg = document.getElementById('modalBg');
      if (bg) bg.classList.remove('open');
    }

export function setTicker(txt) {
      const el = document.getElementById('tickerTxt');
      if (el) el.innerText = txt;
    }

export function addFeed(html) {
      const box = document.getElementById('feedBox');
      if (!box) return;
      const d = document.createElement('div');
      d.className = 'f-item';
      d.innerHTML = `<div class="f-date">📅 ${fmtDate(game.date)}</div><div>${html}</div>`;
      box.prepend(d);
    }

export function setMobileZone(zone, btnEl) {
      document.body.classList.remove('mob-view-main', 'mob-view-polls', 'mob-view-news');
      document.body.classList.add('mob-view-' + zone);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }


