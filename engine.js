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
  getPartySVG
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
  getPersonCurrentOffice,
  getPartyIdeoScore,
  getIdeoLabel,
  computePartyDrift,
  getPairRel,
  adjPairRel,
  setBetrayal,
  getBetrayal,
  recalcDynamicVetoes,
  fmtDate
} from './state.js';

// Safe UI bridge delegators
const addFeed = (msg, type) => (typeof window !== 'undefined' && window.addFeed ? window.addFeed(msg, type) : console.log(msg));
const setTicker = (msg) => (typeof window !== 'undefined' && window.setTicker ? window.setTicker(msg) : null);
const openModal = () => (typeof window !== 'undefined' && window.openModal ? window.openModal() : null);
const closeModal = () => (typeof window !== 'undefined' && window.closeModal ? window.closeModal() : null);
const updateAllUI = () => (typeof window !== 'undefined' && window.updateAllUI ? window.updateAllUI() : null);

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
        const dist = Math.abs((party.stances[k] ?? 2) - bloc.ideal[k]);
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
        let sum = 0; const raw = {};
        game.parties.forEach(p => { raw[p.id] = p.poll * ((game.regOrg[r.id]?.[p.id] || 50) / 60); sum += raw[p.id]; });
        game.parties.forEach(p => { game.regionPolls[r.id][p.id] = +((raw[p.id] / (sum || 1)) * 100).toFixed(1); });
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
        mef:'giorgetti', interni:'piantedosi', esteri:'tajani', difesa:'crosetto', giustizia:'nordio',
        mimit:'urso', lavoro:'calderone', salute:'schillaci', mit:'salvini', mase:'pichetto',
        mim:'valditara', cultura:'giuli', mur:'bernini', turismo:'santanche', agricoltura:'lollobrigida'
      };
      MINISTRIES.forEach(m => { game.cabinet[m.id] = POLITICIANS.find(x => x.id === initM[m.id]) || POLITICIANS[0]; });
      game.senateSpeaker = POLITICIANS.find(x => x.id === 'larussa') || { id:'larussa', name:'Ignazio La Russa', age:79, partyId:'fdi' };
      game.chamberSpeaker = POLITICIANS.find(x => x.id === 'fontana_l') || { id:'fontana_l', name:'Lorenzo Fontana', age:46, partyId:'lega' };
      // Punto 17 v6.2: se il giocatore guida un partito minore della coalizione di Governo ed è un leader custom (non ancora Ministro né Premier), riceve un dicastero di coalizione!
      const pStart = getP();
      if (pStart && pStart.id !== 'ind' && pStart.inGov && game.currentPM !== game.leader.name && !getPlayerMinistry()) {
        const plPol = ensurePlayerInPoliticians();
        const targetMinId = pStart.id === 'fi' ? 'esteri' : (pStart.id === 'lega' ? 'mit' : (pStart.id === 'nm' ? 'mur' : 'turismo'));
        if (plPol) game.cabinet[targetMinId] = plPol;
      }
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

      if (oldCoalSeats >= 201 && newLeadParty) {
        const b1 = document.createElement('button');
        b1.className = 'm-btn';
        b1.innerHTML = `<strong>🏛️ La vecchia maggioranza (${getCoalName(oldParty.coalId)}, ${oldCoalSeats} seggi) indica Premier ${newLeadParty.leader} (${newLeadParty.short})</strong><span>Nasce il Governo ${newLeadParty.leader} senza di te; tu passi ai banchi del tuo nuovo ruolo parlamentare.</span>`;
        b1.onclick = () => {
          autoFormGovAI(oldCoalParties, newLeadParty.leader, oldParty.coalId);
          const cp = getP();
          if (cp.id !== 'ind' && cp.coalId !== oldParty.coalId) cp.inGov = false;
          closeModal(); updateAllUI();
        };
        box.appendChild(b1);
      }

      const b2 = document.createElement('button');
      b2.className = 'm-btn';
      b2.innerHTML = `<strong>🗳️ Rottura insanabile in Parlamento: il Quirinale scioglie le Camere (Elezioni tra 45 giorni!)</strong><span>Si torna subito al voto popolare con gli attuali schieramenti!</span>`;
      b2.onclick = () => {
        closeModal();
        startElectoralCampaign(`Crollo del Governo dopo lo strappo del Premier ${game.leader.name} da ${oldParty.short}!`);
      };
      box.appendChild(b2);

      openModal();
    }

    /* BUG FIX 1: AVANZAMENTO DEL TEMPO SEMPRE VERITIERO AL 100% (+1G, +7G, +30G) + CAMPAGNA REFERENDARIA 30G (PUNTO 4) + RESET AZIONI GIORNALIERE (PUNTO 10) */
export function nextTurns(days) {
      let pendingWorldEvent = false;
      let justFreedFromPrison = false;
      let finishedRef = null;

      for (let i = 0; i < days; i++) {
        game.turn++;
        game.turnActionsUsed = []; // Punto 10 v6.2: ogni nuovo giorno riabilita le azioni politiche!
        const prevYear = game.date.getFullYear();
        // Usa il costruttore Date(anno, mese, giorno + 1) per evitare bug di ora legale (DST)
        game.date = new Date(game.date.getFullYear(), game.date.getMonth(), game.date.getDate() + 1);

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

        // Passo settimanale
        if (game.turn % 7 === 0) {
          weeklyCommStep();
          if (!game.isDictatorship) {
            weeklyAIDynamicsAndCoalitionEvolution();
          } else {
            weeklyDictatorshipStep();
          }
          weeklyMacroStep();
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
              game.govStability = 40;
              startElectoralCampaign("Crollo della maggioranza a Montecitorio!");
            }
          }
        }

        // Segna se è maturato un evento casuale durante il salto temporale (solo se non sei in carcere)
        if (game.turn % 14 === 0 && !game.isImprisoned) {
          pendingWorldEvent = true;
        }
      }

      updateAllUI();

      // A fine avanzamento (dopo aver completato tutti i giorni richiesti: +1, +7 o +30), verifica eventuali modal pendenti
      if (!document.getElementById('modalBg').classList.contains('open')) {
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
        } else if (pendingWorldEvent && !game.isImprisoned) {
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
          addFeed(`❌ <strong>REFERENDUM BOCCIATO DALLE URNE SU "${law.title.toUpperCase()}":</strong> Dopo 30 giorni di campagna il SÌ si ferma al <strong>${finalYes}%</strong> (NO: ${finalNo}%). Resta in vigore la normativa attuale (Nuovo quesito vietato per 1 anno).`, 'cr');
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
      const fn = NEW_FIRST_NAMES[Math.floor(Math.random() * NEW_FIRST_NAMES.length)];
      const ln = NEW_LAST_NAMES[Math.floor(Math.random() * NEW_LAST_NAMES.length)];
      const minObj = MINISTRIES[Math.floor(Math.random() * MINISTRIES.length)];
      const newPol = {
        id:'gen_' + game.turn + '_' + Math.floor(Math.random()*999),
        name:`${fn} ${ln}`,
        age:34 + Math.floor(Math.random() * 14),
        partyId:partyId || 'tech',
        pref:minObj.id,
        comp:74 + Math.floor(Math.random() * 18),
        clout:68 + Math.floor(Math.random() * 20)
      };
      POLITICIANS.push(newPol);
      return newPol;
    }

export function annualAgingAndSuccession() {
      const curYear = game.date.getFullYear();
      game.leader.age++;
      game.president.age = (game.president.age || 85) + 1;

      if (!game.isDictatorship && game.president.age >= 84 && Math.random() < (game.president.age - 81) * 0.045) {
        addFeed(`🖤 <strong>LUTTO NAZIONALE AL QUIRINALE:</strong> Si è spento all'età di ${game.president.age} anni il Presidente della Repubblica <strong>${game.president.name}</strong>. Il Presidente del Senato <strong>${game.senateSpeaker?.name || 'in carica'}</strong> assume la supplenza temporanea e convoca le elezioni presidenziali.`, 'cr');
        setTicker(`LUTTO DI STATO: Scomparso il Presidente ${game.president.name}. Supplenza al Presidente del Senato ${game.senateSpeaker?.name}.`);
        game.president.endDate = new Date(game.date.getTime());
      }

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
          if (game.currentPM === oldLead) game.currentPM = p.leader;
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
            addFeed(`🏛️ <strong>RIBALTONE AL CONGRESSO DI ${p.short}:</strong> I delegati eleggono nuovo Segretario <strong>${p.leader}</strong>, che batte l'uscente ${oldL}!`, 'ai');
          }
        }
      });

      POLITICIANS.forEach((pol, idx) => {
        pol.age = (pol.age || 55) + 1;
        if (pol.age >= 79 && Math.random() < (pol.age - 76) * 0.07) {
          const replacement = generateNewPolitician(pol.partyId);
          addFeed(`🌱 <strong>Ricambio Generazionale:</strong> Si ritira per motivi d'età <strong>${pol.name} (${pol.age}a)</strong>; emerge <strong>${replacement.name} (${replacement.age}a)</strong>.`);
          MINISTRIES.forEach(m => { if (game.cabinet[m.id]?.id === pol.id) game.cabinet[m.id] = replacement; });
          POLITICIANS[idx] = replacement;
        }
      });

      if (game.leader.age >= 84 && Math.random() < (game.leader.age - 81) * 0.06 && !document.getElementById('modalBg').classList.contains('open')) {
        const heir = generateNewPolitician(game.playerPartyId);
        const oldName = game.leader.name;
        const oldAge = game.leader.age;
        game.leader.name = heir.name;
        game.leader.age = heir.age;
        if (game.partyRole === 'secretary' && game.playerPartyId !== 'ind') getP().leader = heir.name;
        if (game.currentPM === oldName) game.currentPM = heir.name;
        addFeed(`🖤 <strong>PASSAGGIO DI TESTIMONE STORICO:</strong> <strong>${oldName}</strong> si spegne a ${oldAge} anni. Il delfino politico <strong>${heir.name} (${heir.age} anni)</strong> raccoglie la sua eredità!`, 'cr');
      }
    }

export function openPartyCongressModal(party, reason) {
      const isSec = (game.partyRole === 'secretary');
      const opponentName = isSec ? (party.wingLeader || "Sfidante Riformista") : party.leader;

      document.getElementById('mTag').textContent = `CONGRESSO NAZIONALE DI ${party.name.toUpperCase()}`;
      document.getElementById('mTitle').textContent = `Elezione del Segretario Nazionale: ${game.leader.name} vs ${opponentName}`;
      document.getElementById('mBody').innerHTML = `
        <strong>${reason}</strong><br><br>
        I delegati regionali e gli iscritti di <strong>${party.name}</strong> sono chiamati a votare la mozione congressuale per eleggere il Segretario Nazionale.<br>
        • <strong>Tuo Consenso Interno (Forza Corrente):</strong> <span style="color:#34d399; font-weight:800;">${game.leader.internalSupport}%</span> (Prestigio: ${game.leader.prestige}%)<br>
        • <strong>Fiducia nella Segreteria attuale:</strong> <strong>${party.leaderTrust || 75}%</strong><br><br>
        Quale piattaforma congressuale presenti all'Assemblea Nazionale?
      `;

      const box = document.getElementById('mChoices');
      box.innerHTML = '';

      const opts = [
        { l:`Mozione di Rilancio Identitario e Battaglia Politica (Investi 25 ⚡)`, d:`Aumenta le tue chance di vittoria del +12% tra i militanti`, bonus:12, costAP:25, costMoney:0 },
        { l:`Patto Federativo coi Cacicchi, Governatori e Circoli Regionali (Investi € 50k)`, d:`Convince i grandi elettori indecisi (+15% voti congressuali)`, bonus:15, costAP:0, costMoney:50 },
        { l:`Discorso di Unità del Partito senza correnti`, d:`Nessun costo: ti affidi al tuo attuale radicamento interno (${game.leader.internalSupport}%)`, bonus:3, costAP:0, costMoney:0 }
      ];

      opts.forEach(o => {
        const btn = document.createElement('button');
        btn.className = 'm-btn';
        btn.innerHTML = `<strong>🗳️ ${o.l}</strong><span>${o.d}</span>`;
        btn.onclick = () => {
          if (game.ap < o.costAP || game.funds < o.costMoney) { alert("Risorse insufficienti per questa mozione!"); return; }
          game.ap -= o.costAP; game.funds -= o.costMoney;
          const myVoteShare = Math.min(92, Math.max(12, Math.round(game.leader.internalSupport * 0.65 + game.leader.prestige * 0.25 + o.bonus + (Math.random()*10 - 5))));
          if (myVoteShare >= 51) {
            if (!isSec) {
              party.wingLeader = party.leader;
              party.wingAge = party.leaderAge;
              party.leader = game.leader.name;
              party.leaderAge = game.leader.age;
              game.partyRole = 'secretary';
            }
            party.leaderTrust = 85;
            party.cohesion = Math.min(100, (party.cohesion || 75) + 10);
            game.leader.internalSupport = Math.min(95, myVoteShare);
            addFeed(`👑 <strong>TRIONFO AL CONGRESSO DI ${party.short}:</strong> <strong>${game.leader.name}</strong> vince con il <strong>${myVoteShare}%</strong> dei voti contro ${opponentName} ed è eletto Segretario Nazionale!`);
            setTicker(`CONGRESSO ${party.short}: ${game.leader.name} eletto Segretario Nazionale col ${myVoteShare}%!`);
          } else {
            if (isSec) {
              party.leader = opponentName;
              party.wingLeader = game.leader.name;
              game.partyRole = 'member';
            }
            party.leaderTrust = 76;
            game.leader.internalSupport = myVoteShare;
            addFeed(`⚠️ <strong>ESITO CONGRESSO ${party.short}:</strong> La mozione di ${opponentName} prevale col ${100 - myVoteShare}% (tu ottieni il ${myVoteShare}%). Sei ora il leader della minoranza interna!`, 'cr');
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
      const inc = game.partyRole === 'independent' ? 14 : Math.round(14 + p.poll * 1.4);
      game.funds = Math.max(0, game.funds + inc - (game.partyRole === 'independent' ? 0 : s.weeklyBudget));
      game.ap = Math.min(100, game.ap + 18);
      if (game.partyRole !== 'independent' && game.funds > 0 && s.weeklyBudget > 0) {
        const pwr = (s.weeklyBudget / 35) * (p.credibility / 80);
        game.issueSalience[s.focusIssue] = Math.min(45, (game.issueSalience[s.focusIssue] || 18) + 1.2);
        [s.targetBloc1, s.targetBloc2].forEach(bId => {
          const bloc = BLOCS.find(x => x.id === bId);
          if (bloc && computeBlocMatch(p, bloc) >= 48) shiftBloc(p.id, bId, 1.3 * pwr);
        });
      }
      recalcPolls(true);
    }

    /* PUNTO 17: DINAMICA SETTIMANALE DELLA DITTATURA (CONSENSO POPOLARE VS RISCHIO RIVOLTA) */
export function weeklyDictatorshipStep() {
      const p = getP();
      const popSupport = p.poll;
      // Se la dittatura ha un forte consenso popolare (>= 30%) e il PIL è positivo, il rischio di rivolta cala; se il consenso è basso (< 20%), il rischio di rivolta sale rapidamente!
      let deltaRevolt = 0;
      if (popSupport < 15) deltaRevolt += 6;
      else if (popSupport < 24) deltaRevolt += 3;
      else if (popSupport >= 34) deltaRevolt -= 2;

      if (game.gdp < 0) deltaRevolt += 2;
      if (game.spread > 260) deltaRevolt += 2;
      if (game.militaryLoyalty >= 75) deltaRevolt -= 1;

      game.revoltRisk = Math.max(2, Math.min(100, game.revoltRisk + deltaRevolt));
      game.govStability = Math.max(5, 100 - Math.round(game.revoltRisk * 0.8));

      if (game.revoltRisk >= 75 && game.revoltRisk < 100) {
        addFeed(`🔥 <strong>ALLARME RIVOLTA CONTRO IL REGIME (${game.revoltRisk}%):</strong> Scioperi generali clandestini e manifestazioni nelle piazze minacciano la tua Dittatura (Consenso popolare: ${popSupport.toFixed(1)}%)!`, 'cr');
      }
      if (game.revoltRisk >= 100) {
        triggerRegimeOverthrow();
      }
    }

export function triggerRegimeOverthrow() {
      game.isDictatorship = false;
      game.dictatorshipName = null;
      game.stateForm = 'parlamentare';
      document.body.classList.remove('theme-regime');
      document.getElementById('regimeRibbon').style.display = 'none';
      addFeed(`🗽 <strong>INSURREZIONE POPOLARE E CADUTA DELLA DITTATURA!</strong> Il popolo italiano e i reparti dell'Esercito rovesciano il regime di <strong>${game.leader.name}</strong> e restaurano la Repubblica Democratica!`, 'cr');
      setTicker(`LIBERAZIONE A ROMA: Crolla la Dittatura di ${game.leader.name}! Restaurata la Costituzione.`);
      openFailedCoupTrialModal("Rovesciamento della Dittatura da parte dell'insurrezione popolare e delle Forze Armate");
    }

export function weeklyAIDynamicsAndCoalitionEvolution() {
      const aiList = game.parties.filter(p => p.id !== game.playerPartyId);
      const actor = aiList[Math.floor(Math.random() * aiList.length)];
      if (!actor) return;

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
          const vote = checkCoalitionAdmissionVote(cid, actor);
          if (vote.approved && Math.random() < 0.30) {
            actor.coalId = cid;
            addFeed(`🤝 <strong>RICONFIGURAZIONE ALLEANZE:</strong> Con il voto favorevole dei membri (${vote.pct}%), <strong>${actor.name}</strong> entra in <strong>${getCoalName(cid)}</strong>!`, 'ai');
            break;
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
      } else if (actor.poll >= 6.0 && actor.wingLeader && game.parties.length < 28) {
        actor.cohesion = Math.max(20, (actor.cohesion || 75) - 5);
        if (actor.cohesion <= 40) {
          executePartySplit(actor, false);
        }
      }
      recalcDynamicVetoes();
      recalcPolls(true);
    }

export function executePartySplit(parentParty, isPlayerSplitting, customStances = null) {
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

      const newParty = {
        id:splitId,
        name:isPlayerSplitting ? (prompt("Nome del tuo nuovo partito scissionista:", parentParty.splitName || "Nuovo Polo") || "Nuovo Polo") : (parentParty.splitName || `Alternativa ${parentParty.short}`),
        short:parentParty.splitShort || ("N" + parentParty.short.slice(0,2)),
        leader:newLeaderName,
        leaderAge:newLeaderAge,
        leaderTrust:88,
        personalParty:true,
        founderLeader:newLeaderName,
        nextCongYear:game.date.getFullYear() + 3,
        area:getIdeoLabel(getPartyIdeoScore({stances:newStances})).replace(/^[^\s]+\s/, ''),
        coalId:'none',
        color:uniqueColor,
        emblemType:uniqueEmblem,
        poll:+(parentParty.poll * splitShare).toFixed(1),
        seats:movedSeats,
        inGov:false,
        credibility:76,
        cohesion:90,
        orgStrength:56,
        wingLeader:risingWing.name,
        wingAge:risingWing.age,
        wingName:"Area Territoriale",
        wingArea:parentParty.area,
        factions:[
          { name:`Area Fondatrice (${newLeaderName})`, leader:newLeaderName, share:70, desc:"Nucleo guida della scissione." },
          { name:"Circoli Territoriali", leader:risingWing.name, share:30, desc:"Rete locale del nuovo partito." }
        ],
        splitName:`Riformisti ${parentParty.short}`,
        splitShort:`R${parentParty.short.slice(0,2)}`,
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

      recalcPolls(true);
      addFeed(`🚨 <strong>SCISSIONE TRAUMATICA IN PARLAMENTO!</strong> <strong>${newParty.leader}</strong> rompe con ${parentParty.name} e fonda <strong>${newParty.name} (${newParty.short})</strong> portando via ${movedSeats} deputati!`, 'cr');
      setTicker(`SCISSIONE: Nasce "${newParty.name}" (${newParty.short}) di ${newParty.leader} con ${movedSeats} deputati!`);

      if (wasPM) {
        checkAndTriggerPremierDefectionCrisis(parentParty, `scissione e fondazione di ${newParty.name}`);
      }
    }

export function weeklyMacroStep() {
      const mins = Object.values(game.cabinet);
      const avgComp = mins.reduce((s,m)=>s+(m?.comp||78),0) / (mins.length||1);
      const b = game.budget;
      const fedBonus = game.stateForm === 'federale' ? 0.015 : 0;
      const russiaGasBonus = game.foreignRels.russia >= 60 ? 0.01 : 0;
      game.gdp = Math.max(-2.8, Math.min(3.5, +(game.gdp + (b.investSpend - 3.2)*0.04 - (b.taxPressure - 42.0)*0.03 + (avgComp - 78)*0.004 + fedBonus + russiaGasBonus).toFixed(2)));
      b.deficit = +(b.healthSpend + b.eduSpend + b.pensionSpend + b.investSpend + game.defenseSpendGDP + 12.9 - b.taxPressure).toFixed(1);
      b.debtToGDP = +(b.debtToGDP + (b.deficit - game.gdp)*0.04).toFixed(1);
      const euPenalty = !game.inEU ? 35 : (game.foreignRels.eu_com < 40 ? 12 : 0);
      game.spread = Math.max(60, Math.min(520, Math.round(game.spread + (b.deficit - 3.0)*3.2 + (70 - game.govStability)*0.20 - (avgComp - 80)*0.4 + euPenalty * 0.08)));
      if (game.spread > 250) {
        game.parties.filter(p=>p.inGov).forEach(p => { p.credibility = Math.max(20, p.credibility - 3); shiftBloc(p.id,'pensionati',-3); });
        if (!game.isDictatorship) game.govStability = Math.max(0, game.govStability - 5);
        addFeed(`🚨 <strong>ALLARME SPREAD (${game.spread} pt):</strong> Tensione sui BTP, cala la fiducia nel Governo!`, 'cr');
      }
    }

    /* PUNTO 3 (v6.2): EVENTI SETTIMANALI PROFONDAMENTE CONTESTUALI AL RUOLO DEL GIOCATORE */
export function triggerWorldEvent() {
      const p = getP();
      const myMin = getPlayerMinistry();
      const specificRoles = [];
      if (game.president.isPlayer) {
        specificRoles.push('president_rep');
      } else if (game.partyRole === 'independent') {
        specificRoles.push('ind');
        if (game.currentPM === game.leader.name) specificRoles.push('pm');
        if (myMin) specificRoles.push('minister');
      } else {
        specificRoles.push('party');
        if (game.currentPM === game.leader.name) {
          specificRoles.push('pm');
        } else if (myMin) {
          specificRoles.push('minister', 'gov_ally');
        } else if (p.inGov) {
          specificRoles.push('gov_ally');
        } else {
          specificRoles.push('opp');
        }
      }

      // Privilegia gli eventi specifici per il ruolo attuale del giocatore!
      let pool = WORLD_EVENTS.filter(e => !game.seenEvents.has(e.id) && specificRoles.includes(e.role));
      if (pool.length === 0) {
        pool = WORLD_EVENTS.filter(e => !game.seenEvents.has(e.id) && (specificRoles.includes(e.role) || e.role === 'any'));
      }
      if (pool.length === 0) {
        game.seenEvents.clear();
        pool = WORLD_EVENTS.filter(e => specificRoles.includes(e.role) || e.role === 'any');
      }
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

    /* PUNTO 5 & PUNTO 9 (v6.2): ELEZIONE DIRETTA DEL CAPO DELLO STATO SE L'ITALIA È REPUBBLICA PRESIDENZIALE */
export function openDirectPresidentialElectionModal() {
      const player = getP();
      const sortedP = [...game.parties].sort((a,b) => b.poll - a.poll);
      const topCandidates = [
        { name:game.leader.name, age:game.leader.age, area:player.area, partyName:player.name, pollBase:Math.max(22, player.poll + game.leader.prestige * 0.22), isPlayer:true },
        ...sortedP.filter(x => x.id !== player.id).slice(0, 3).map(x => ({
          name:x.leader, age:x.leaderAge, area:x.area, partyName:x.name, pollBase:x.poll + 8, isPlayer:false
        }))
      ];

      document.getElementById('mTag').textContent = "REPUBBLICA PRESIDENZIALE • ELEZIONE DIRETTA DEL CAPO DELLO STATO";
      document.getElementById('mTitle').textContent = "🗳️ I Cittadini Italiani Votano Direttamente il Presidente della Repubblica!";
      document.getElementById('mBody').innerHTML = `
        Grazie alla riforma costituzionale del <strong>Presidenzialismo</strong>, non è più il Parlamento ad eleggere il Capo dello Stato, ma direttamente il popolo italiano a suffragio universale!<br><br>
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
          game.president.name = winner.name;
          game.president.age = winner.age;
          game.president.area = `Presidente Eletto dal Popolo (${winner.partyName})`;
          game.president.endDate = new Date(game.date.getFullYear() + 5, game.date.getMonth(), game.date.getDate());
          game.president.trust = 86;
          game.president.isPlayer = !!winner.isPlayer;
          game.currentPM = winner.name;
          game.govStability = 88;
          addFeed(`🦅 <strong>ELEZIONI PRESIDENZIALI DIRETTE:</strong> Il popolo italiano elegge <strong>${winner.name}</strong> Presidente della Repubblica${winner.isPlayer ? ' (SEI SALITO AL QUIRINALE!)' : ''}!`);
          setTicker(`QUIRINALE PRESIDENZIALE: ${winner.name} eletto direttamente dai cittadini italiani!`);
          closeModal(); updateAllUI();
        };
        box.appendChild(btn);
      });
      openModal();
    }

    /* PUNTI 7, 8 & 9 (v6.2): ELEZIONE DEL PRESIDENTE DELLA REPUBBLICA REALISTICA (4-6 SCRUTINI), SENZA LOOP INFINITO DA INDIPENDENTE E CON POSSIBILITÀ DI ESSERE ELETTO AL QUIRINALE! */
export function openQuirinaleBallotModal(ballotNum = 1) {
      const player = getP();
      const quorum = ballotNum <= 3 ? 267 : 201;
      const myIdeo = game.leader.personalIdeo ?? getPartyIdeoScore(player);

      // Punto 9 v6.2: Il giocatore può candidarsi personalmente al Quirinale!
      const playerCand = {
        id: 'player_cand',
        name: game.leader.name,
        age: game.leader.age,
        area: game.partyRole === 'independent' ? 'Garante Super-Partes' : `Candidato ${player.short}`,
        idealIdeo: myIdeo,
        trust: Math.max(78, game.leader.prestige),
        isPlayer: true,
        desc: `La tua candidatura personale al Quirinale (Prestigio: ${game.leader.prestige}%, Grandi Elettori del tuo gruppo: ${player.seats}).`
      };

      const allCandidates = [playerCand, ...PRES_CANDIDATES.filter(c => c.name !== game.leader.name)];
      const aiSupport = {};
      allCandidates.forEach(c => aiSupport[c.id] = []);

      game.parties.filter(p => p.id !== player.id && p.seats > 0).forEach(p => {
        const pIdeo = getPartyIdeoScore(p);
        const bestCand = [...PRES_CANDIDATES].sort((a,b) => Math.abs(a.idealIdeo - pIdeo) - Math.abs(b.idealIdeo - pIdeo))[0];
        if (bestCand && aiSupport[bestCand.id]) aiSupport[bestCand.id].push(p);
      });

      // Punto 8 v6.2: Dal 4° scrutinio (quorum 201) i grandi elettori convergono rapidamente per evitare scrutini infiniti!
      const convergenceBonus = ballotNum <= 2 ? 0 : (ballotNum === 3 ? 22 : (ballotNum === 4 ? 48 : (ballotNum === 5 ? 85 : 135)));

      document.getElementById('mTag').textContent = `ELEZIONE DEL CAPO DELLO STATO • ${ballotNum}° SCRUTINIO (QUORUM: ${quorum} SU 400)`;
      document.getElementById('mTitle').textContent = `🏛️ Parlamento in Seduta Comune (Presiede ${game.chamberSpeaker?.name || 'il Presidente della Camera'}): Scrutinio #${ballotNum}`;
      document.getElementById('mBody').innerHTML = `
        Nei primi 3 scrutini serve il quorum dei <strong>2/3 (267 voti)</strong>; dal <strong>4° scrutinio</strong> basta la <strong>maggioranza assoluta (201 voti)</strong> e i poli convergono su un nome condiviso.<br>
        Controlli direttamente <strong>${player.seats} grandi elettori</strong> (${game.partyRole === 'independent' ? `Indipendente • Prestigio Istituzionale: <strong>${game.leader.prestige}%</strong>` : `${player.name}`}). Seleziona chi votare o candidati tu stesso al Colle:
      `;

      const box = document.getElementById('mChoices');
      box.innerHTML = '';

      const computedCands = allCandidates.map(cand => {
        let baseSup = aiSupport[cand.id] || [];
        let baseVotes = baseSup.reduce((s,p) => s + p.seats, 0);
        let allies = [];
        if (cand.isPlayer) {
          // I partiti affini o in buoni rapporti convergono sulla candidatura del giocatore in base al Prestigio e al numero di scrutinio
          const prestigeReach = 0.8 + (game.leader.prestige / 95) + (ballotNum >= 4 ? 0.55 : 0);
          allies = game.parties.filter(p => p.id !== player.id && p.seats > 0 && ! getBetrayal(player.id, p.id) && (
            (player.coalId !== 'none' && p.coalId === player.coalId) ||
            (getPairRel(player.id, p.id) >= 55 && Math.abs(getPartyIdeoScore(p) - myIdeo) <= prestigeReach)
          ));
        } else {
          const reach = 1.25 + (ballotNum >= 4 ? 0.65 : 0);
          allies = game.parties.filter(p => p.id !== player.id && p.seats > 0 && !baseSup.includes(p) && Math.abs(getPartyIdeoScore(p) - cand.idealIdeo) <= reach);
        }
        const prestigeVotes = cand.isPlayer ? Math.round(game.leader.prestige * 0.65) : Math.round((cand.trust || 75) * 0.45);
        const estTotal = Math.min(385, baseVotes + allies.reduce((s,p)=>s+p.seats,0) + player.seats + prestigeVotes + convergenceBonus);
        return { cand, baseSup, allies, estTotal };
      });

      const electWinner = (winnerCand, votes, noteTxt = '') => {
        game.president.name = winnerCand.name;
        game.president.age = winnerCand.age;
        game.president.area = winnerCand.area;
        game.president.endDate = new Date(game.date.getFullYear() + 7, game.date.getMonth(), game.date.getDate());
        game.president.trust = winnerCand.trust || 85;
        game.president.isPlayer = !!winnerCand.isPlayer;
        if (winnerCand.id === 'draghi') game.spread = Math.max(65, game.spread - 20);

        // Punto 2 & 9 v6.2: Chi sale al Quirinale lascia ogni eventuale incarico di Governo o Presidenza di Camera/Senato (unicità delle cariche!)
        if (winnerCand.isPlayer) {
          game.leader.prestige = Math.min(100, game.leader.prestige + 15);
          if (game.currentPM === game.leader.name) {
            const govPs = game.parties.filter(x => x.inGov).sort((a,b)=>b.seats-a.seats);
            const nextLeader = (govPs[0] && govPs[0].leader !== game.leader.name) ? govPs[0].leader : (player.wingLeader || "Antonio Tajani");
            game.currentPM = nextLeader;
          }
          MINISTRIES.forEach(m => {
            if (game.cabinet[m.id] && (game.cabinet[m.id].isPlayer || game.cabinet[m.id].name === game.leader.name)) {
              const repl = POLITICIANS.find(x => !getPersonCurrentOffice(x, m.id, false)) || POLITICIANS[0];
              game.cabinet[m.id] = repl;
            }
          });
          addFeed(`👑 <strong>STORICA FUMATA BIANCA AL ${ballotNum}° SCRUTINIO (${votes} voti)!</strong> <strong>${game.leader.name}</strong> è eletto <strong>Presidente della Repubblica Italiana</strong>! Ti insedi al Palazzo del Quirinale per i prossimi 7 anni (poteri presidenziali sbloccati nella scheda Parlamento & Colle)!`, 'ok');
          setTicker(`HABEMUS PRAESIDENTEM: ${game.leader.name} eletto Presidente della Repubblica con ${votes} voti!`);
        } else {
          MINISTRIES.forEach(m => {
            if (game.cabinet[m.id]?.name === winnerCand.name) {
              game.cabinet[m.id] = POLITICIANS.find(x => !getPersonCurrentOffice(x, m.id, false)) || POLITICIANS[0];
            }
          });
          addFeed(`🔔 <strong>FUMATA BIANCA AL ${ballotNum}° SCRUTINIO (${votes} voti)!</strong> <strong>${winnerCand.name} (${winnerCand.age}a)</strong> è eletto Presidente della Repubblica! ${noteTxt}`);
          setTicker(`QUIRINALE: ${winnerCand.name} eletto Presidente della Repubblica al ${ballotNum}° scrutinio (${votes} voti)!`);
        }
        closeModal();
        updateAllUI();
      };

      computedCands.forEach(({ cand, baseSup, allies, estTotal }) => {
        const btn = document.createElement('button');
        btn.className = 'm-btn';
        btn.style.borderColor = cand.isPlayer ? 'var(--gold)' : '';
        btn.innerHTML = `
          <strong>${cand.isPlayer ? `👑 CANDIDATI TU STESSO AL QUIRINALE: ${cand.name}` : `🗳️ Vota ${cand.name}`} (${cand.age}a, ${cand.area}) — Stima Voti: ~${estTotal} / ${quorum}</strong>
          <span>${cand.isPlayer ? `Grandi elettori convergenti: ${allies.map(p=>p.short).join(', ') || 'Trasversali'} — ${cand.desc}` : `Voti base: ${baseSup.map(p=>p.short).join(', ') || 'Trasversali'} ${allies.length ? `• Convergenza: +${allies.map(p=>p.short).join(', ')}` : ''} — ${cand.desc}`}</span>
        `;
        btn.onclick = () => {
          const snipers = Math.floor(Math.random() * 12) - 4;
          const actual = Math.max(25, estTotal - snipers);
          if (actual >= quorum) {
            electWinner(cand, actual);
          } else if (ballotNum >= 5) {
            // Punto 7 & 8 v6.2: Al 5°-6° scrutinio il Parlamento trova sempre la quadra evitando qualsiasi loop infinito (anche da Indipendente con 0 seggi)!
            const bestAI = [...computedCands].sort((a,b) => b.estTotal - a.estTotal)[0];
            const winTarget = (cand.isPlayer && actual >= 175) ? cand : bestAI.cand;
            const winVotes = Math.max(quorum + 8, actual, bestAI.estTotal);
            electWinner(winTarget, winVotes, "(Intesa raggiunta tra i grandi elettori in Aula)");
          } else {
            addFeed(`💨 <strong>Fumata Nera al ${ballotNum}° scrutinio:</strong> ${cand.name} ottiene ${actual} voti su ${quorum}. I capigruppo trattano per il ${ballotNum + 1}° scrutinio!`);
            openQuirinaleBallotModal(ballotNum + 1);
          }
        };
        box.appendChild(btn);
      });

      const btnBlank = document.createElement('button');
      btnBlank.className = 'm-btn';
      btnBlank.innerHTML = `<strong>🏳️ Scheda Bianca Tattica (${ballotNum >= 4 ? 'I partiti votano il candidato di compromesso' : `Passa al ${ballotNum + 1}° Scrutinio`})</strong>`;
      btnBlank.onclick = () => {
        if (ballotNum >= 4) {
          const bestAI = [...computedCands].filter(x => !x.cand.isPlayer).sort((a,b) => b.estTotal - a.estTotal)[0] || computedCands[0];
          electWinner(bestAI.cand, Math.max(218, bestAI.estTotal), "(Eletto dai partiti parlamentari dopo la tua scheda bianca)");
        } else {
          openQuirinaleBallotModal(ballotNum + 1);
        }
      };
      box.appendChild(btnBlank);
      openModal();
    }

export function triggerElections(reason) {
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
        Per prassi costituzionale (Art. 92 Cost.), il Capo dello Stato conferisce l'incarico di formare il Governo (con riserva) a <strong>${winLead.leader}</strong>.
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
            autoFormGovAI(sortedP.slice(0,3), "Fabio Panetta (Tecnico)", "none");
            game.nextElectionDate = new Date(game.date.getFullYear()+1, game.date.getMonth(), game.date.getDate());
            closeModal(); updateAllUI();
          }
        };
        box.appendChild(btn);
      }
      openModal();
    }

    /* PUNTI 2, 12, 16, 17 (v6.2): FORMAZIONE DEL GOVERNO A 15 MINISTERI CON UNICITÀ RIGOROSA DELLE CARICHE E NOMINA DEL GIOCATORE A MINISTRO SE ALLEATO DI COALIZIONE */
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
      const isForbidden = (x) => !x || used.has(x.id) || x.name === game.president.name || (draftPMName && x.name === draftPMName);

      // 1. Assegna prima Presidente del Senato e Presidente della Camera (distinti da Premier, Capo dello Stato e Ministri)
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

      // 2. Punto 17 v6.2: Se il giocatore fa parte della coalizione di Governo ma NON è il Presidente del Consiglio né il Capo dello Stato, il nuovo Premier lo nomina Ministro!
      let playerAssignedMinId = null;
      if (playerPol && ids.has(game.playerPartyId) && draftPMName !== game.leader.name && !game.president.isPlayer && !game.isImprisoned) {
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
        : `✅ <strong>GRADIMENTO DEL QUIRINALE (Art. 92 Cost.):</strong> Il Capo dello Stato ${game.president.name} è pronto a firmare i decreti di nomina dei ${MINISTRIES.length} Ministri.`;

      document.getElementById('mTag').textContent = `FORMAZIONE DEL GOVERNO ${draftPMName.toUpperCase()} • SCIOGLIMENTO DELLA RISERVA`;
      document.getElementById('mTitle').textContent = `🏛️ Componi il Consiglio dei ${MINISTRIES.length} Ministri ed Eleggi i Presidenti delle Camere`;
      document.getElementById('mBody').innerHTML = `
        Nella realtà costituzionale italiana (Art. 92 Cost.), il Presidente del Consiglio incaricato (<strong>${draftPMName}</strong>) propone al Capo dello Stato la <strong>lista dei ${MINISTRIES.length} Ministri</strong>, mentre la maggioranza elegge i <strong>Presidenti di Senato e Camera</strong>. <em>Ogni personalità può ricoprire una sola carica istituzionale!</em><br>
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
            <p style="font-size:11px; margin-bottom:4px;">Supplente del Capo dello Stato (+3 Peso Cencelli al partito scelto).</p>
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
      game.govStability = 80;
      game.nextElectionDate = new Date(game.date.getFullYear() + 5, game.date.getMonth(), game.date.getDate());

      MINISTRIES.forEach(m => {
        game.cabinet[m.id] = POLITICIANS.find(x => x.id === draftCabinet[m.id]) || POLITICIANS[0];
      });
      game.senateSpeaker = POLITICIANS.find(x => x.id === draftSenateId) || POLITICIANS[0];
      game.chamberSpeaker = POLITICIANS.find(x => x.id === draftChamberId) || POLITICIANS[1];

      draftGovParties.forEach(p => {
        const expW = Math.round((p.seats / totS) * totalCencelliWeight);
        let actW = MINISTRIES.filter(m => game.cabinet[m.id]?.partyId === p.id).reduce((s,m)=>s+m.weight, 0);
        if (game.senateSpeaker?.partyId === p.id) actW += 3;
        if (game.chamberSpeaker?.partyId === p.id) actW += 3;
        game.allySatisfaction[p.id] = Math.max(20, Math.min(100, Math.round(78 + (actW - expW) * 5)));
      });

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
        const pName = prompt("Nome del nuovo partito che stai fondando:", "Movimento Civico Italiano");
        if (!pName) return;
        const pShort = (prompt("Sigla (max 4 lettere):", "MCI") || "MCI").toUpperCase().slice(0,4);
        game.funds -= 80; game.ap -= 35;
        const usedCols = new Set(game.parties.map(p=>p.color));
        const col = DISTINCT_PALETTE.find(c=>!usedCols.has(c)) || DISTINCT_PALETTE[0];
        const newId = 'founded_' + game.turn;
        const rising = generateNewPolitician(newId);
        const areaStr = getIdeoLabel(game.leader.personalIdeo).replace(/^[^\s]+\s/, '');
        const newP = {
          id:newId, name:pName, short:pShort, leader:game.leader.name, leaderAge:game.leader.age, leaderTrust:90, nextCongYear:game.date.getFullYear()+3,
          personalParty:true, founderLeader:game.leader.name,
          area:areaStr, coalId:'none', color:col, emblemType:(game.parties.length%6)+1, poll:0.4, initialPoll:0.4, seats:0, inGov:false,
          credibility:game.leader.prestige, cohesion:92, orgStrength:24, wingLeader:rising.name, wingAge:rising.age, wingName:"Area Civica", wingArea:areaStr,
          factions:[
            { name:`Area Fondatrice (${game.leader.name})`, leader:game.leader.name, share:70, desc:"Linea ufficiale del fondatore." },
            { name:"Area Civica", leader:rising.name, share:30, desc:"Rete territoriale." }
          ],
          splitName:`Alternativa ${pShort}`, splitShort:`A${pShort.slice(0,2)}`, bio:`Partito fondato da ${game.leader.name}.`, vetoes:[],
          stances:{ ...game.personalStances }, baseStances:{ ...game.personalStances }, baseIdeo:game.leader.personalIdeo, lowPollWeeks:0, newlyFoundedGraceWeeks:52
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
        recalcPolls(true);
        addFeed(`🏛️ <strong>NUOVA FORZA POLITICA (0.4%):</strong> L'indipendente <strong>${game.leader.name}</strong> fonda da zero <strong>${pName} (${pShort})</strong>! Ora dovrà conquistare consensi sul territorio.`);
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
        executePartySplit(p, true);
      } else if (mode === 'go_ind') {
        if (!useTurnAction('party_go_ind', 'Uscita dal Partito')) return;
        const oldP = p;
        const wasPM = (game.currentPM === game.leader.name);
        const wasFounderOrPersonal = (oldP.personalParty || oldP.founderLeader === game.leader.name || oldP.poll < 3.5) && game.partyRole === 'secretary';
        if (game.partyRole === 'secretary') {
          const r = generateNewPolitician(oldP.id);
          oldP.leader = oldP.wingLeader || r.name;
          oldP.leaderAge = oldP.wingAge || r.age;
        }
        game.partyRole = 'independent';
        game.playerPartyId = 'ind';
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
      if (game.ap < 30) { alert("Servono 30 ⚡!"); return; }
      const target = game.parties.find(x => x.id === targetId);
      if (!target) return;
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
      const cost = (game.partyRole === 'member') ? 20 : 12;
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
      const delta = side === 'yes' ? 3.5 : -3.5;
      game.activeReferendum.yesPct = Math.max(10, Math.min(88, +(game.activeReferendum.yesPct + delta).toFixed(1)));
      addFeed(`📣 <strong>CAMPAGNA REFERENDARIA (${game.activeReferendum.title} — Comizio ${game.activeReferendum.ralliesUsed}/${maxR}):</strong> Mobilitazione di ${game.leader.name} per il <strong>${side === 'yes' ? 'SÌ' : 'NO'}</strong>! I sondaggi sul SÌ si portano al <strong>${game.activeReferendum.yesPct.toFixed(1)}%</strong>.`);
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

      game.activeReferendum = {
        kind: 'law',
        lawId: law.id,
        targetIdx: targetIdx,
        cooldownKey: law.id,
        title: law.title,
        targetLabel: `${opt.status} (${opt.label})`,
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
      } else if (game.coalitions[p.coalId]) {
        game.coalitions[p.coalId].name = newName;
      }
      addFeed(`🤝 <strong>NUOVO NOME DEL POLO:</strong> ${game.leader.name} ribattezza ufficialmente la coalizione in <strong>"${newName}"</strong>!`);
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

      if (!game.isDictatorship && (minId === 'mef' || minId === 'esteri' || minId === 'giustizia') && pol.comp < 68 && game.president.trust < 70) {
        game.president.trust = Math.max(15, game.president.trust - 10);
        alert(`⚠️ ALTOLÀ DEL QUIRINALE (Art. 92 Cost.): Il Presidente ${game.president.name} oppone rilievi costituzionali sulla nomina di ${pol.name} a ${mInfo.name}!`);
        addFeed(`🏛️ <strong>RILIEVO DEL QUIRINALE (Art. 92 Cost.):</strong> Il Capo dello Stato blocca la nomina di ${pol.name} a ${mInfo.name}!`, 'cr');
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
      if ((minId === 'interni' || minId === 'difesa') && pol.partyId === game.playerPartyId) {
        game.militaryLoyalty = Math.min(95, game.militaryLoyalty + 8);
      }
      addFeed(`🏛️ <strong>RIMPASTO MINISTERIALE:</strong> Su proposta del Governo, ${pol.name} (${candParty ? candParty.short : 'Tecnico'}) giura al Quirinale come nuovo Ministro (${mInfo.name}).`);
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

export function applyStateFormChange(sf) {
      game.stateForm = sf.id;
      if (sf.id === 'presidenziale') {
        game.govStability = Math.min(100, game.govStability + 18);
        addFeed(`🦅 <strong>REPUBBLICA PRESIDENZIALE IN VIGORE:</strong> Il Capo dello Stato sarà ora eletto direttamente dai cittadini italiani!`);
      } else if (sf.id === 'premierato' || sf.id === 'cancellierato') {
        game.govStability = Math.min(100, game.govStability + 15);
      } else if (sf.id === 'federale') {
        game.gdp = Math.min(3.5, +(game.gdp + 0.3).toFixed(2));
        game.lawStates['law_autonomy'] = 2;
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
      updateAllUI();
    }

export function openCrisis() {
      if (game.isImprisoned) return;
      game.govStability = 12;
      addFeed(`💣 <strong>CRISI DI GOVERNO UFFICIALE:</strong> ${game.leader.name} apre formalmente la crisi a Palazzo Chigi! Il Presidente ${game.president.name} avvia le consultazioni al Quirinale.`);
      openModal(
        "🏛️ Consultazioni al Quirinale — Crisi di Governo",
        `<p>Hai aperto formalmente la crisi di governo. Il Capo dello Stato <strong>${game.president.name}</strong> ti convoca al Quirinale: quale soluzione proponi?</p>`,
        [
          { label: "🏛️ Componi Manualmente un Nuovo Governo in Parlamento", fn: () => { closeModal(); openManualGovernmentFormationModal(game.parties.filter(x => x.coalId === getP().coalId), game.leader.name, getP().coalId); } },
          { label: "🗳️ Chiedi lo Scioglimento delle Camere ed Elezioni Anticipate (45g di campagna)", fn: () => { closeModal(); startElectoralCampaign("Crisi di Governo aperta da " + game.leader.name); } }
        ]
      );
      updateAllUI();
    }

export function oppHearing() {
      if (game.isImprisoned) return;
      if (game.ap < 15) { alert("Servono 15 ⚡!"); return; }
      if (!useTurnAction('opp_hearing', 'Question Time a Montecitorio')) return;
      game.ap -= 15;
      game.govStability = Math.max(5, game.govStability - 7);
      game.leader.prestige = Math.min(100, game.leader.prestige + 3);
      recalcPolls(true);
      addFeed(`🔍 Question Time di ${game.leader.name} in Aula: l'Esecutivo va in difficoltà (-7% Stabilità Governo).`);
      updateAllUI();
    }

export function oppFilibuster() {
      if (game.isImprisoned) return;
      if (game.ap < 20) { alert("Servono 20 ⚡!"); return; }
      if (!useTurnAction('opp_filibuster', 'Ostruzionismo in Commissione Bilancio')) return;
      game.ap -= 20;
      game.govStability = Math.max(5, game.govStability - 11);
      addFeed(`🧱 Ostruzionismo parlamentare in Commissione: lavori rallentati e fibrillazione nella maggioranza (-11% Stabilità).`);
      updateAllUI();
    }

    /* PUNTO 15 (v6.2): ESITO COSTITUZIONALMENTE REALISTICO DELLA MOZIONE DI SFIDUCIA DALL'OPPOSIZIONE!
       Se sei all'opposizione e fai cadere il Governo, NON scegli arbitrariamente di formare un tuo governo se non hai i numeri (>= 201 seggi) in Parlamento! */
export function tableSfiducia() {
      if (game.isImprisoned) return;
      if (game.ap < 30) { alert("Servono 30 ⚡!"); return; }
      if (!useTurnAction('table_sfiducia', 'Mozione di Sfiducia al Governo')) return;
      game.ap -= 30;
      const p = getP();
      const oppSeats = game.parties.filter(x => !x.inGov).reduce((s,x)=>s+x.seats, 0);
      const passChance = (game.govStability < 38 ? 0.55 : (game.govStability < 52 ? 0.25 : 0.08)) + (oppSeats >= 195 ? 0.25 : 0);

      if (Math.random() < passChance) {
        game.govStability = 0;
        const fallenPM = game.currentPM;
        game.leader.prestige = Math.min(100, game.leader.prestige + 8);
        addFeed(`⚖️ <strong>MOZIONE DI SFIDUCIA APPROVATA A MONTECITORIO!</strong> Il Governo <strong>${fallenPM}</strong> va sotto in Aula e rassegna le dimissioni nelle mani del Presidente ${game.president.name}!`, 'cr');
        setTicker(`CADE IL GOVERNO ${fallenPM.toUpperCase()}: Approvata la mozione di sfiducia di ${game.leader.name}!`);

        // Verifica se i partiti di opposizione compatibili col giocatore raggiungono davvero la maggioranza assoluta di 201 deputati!
        const myCoalParties = (p.id !== 'ind' && p.coalId !== 'none')
          ? game.parties.filter(x => !x.inGov && x.seats > 0 && (x.coalId === p.coalId || (!computeCompat(p, x).vetoed && computeCompat(p, x).score >= 58)))
          : game.parties.filter(x => !x.inGov && x.seats > 0);
        const altSeats = myCoalParties.reduce((s,x)=>s+x.seats, 0);
        const altLead = [...myCoalParties].sort((a,b)=>b.seats-a.seats)[0] || p;

        if (altSeats >= 201 && p.id !== 'ind') {
          openModal(
            `⚖️ Governo ${fallenPM} Sfiduciato — Consultazioni al Quirinale`,
            `<div style="font-size:13px; color:var(--text);">
              La tua mozione di sfiducia ha fatto cadere il Governo <strong>${fallenPM}</strong>!<br><br>
              Dalle consultazioni al Quirinale emerge che l'opposizione dispone dei numeri in Parlamento per una maggioranza alternativa (<strong>${altSeats} seggi su 400</strong> tra ${myCoalParties.map(x=>x.short).join(', ')}).<br>
              Il Presidente <strong>${game.president.name}</strong> verifica la disponibilità a formare un nuovo esecutivo guidato da <strong>${altLead.leader}</strong> o a sciogliere le Camere:
            </div>`,
            [
              {
                label: `🏛️ Partecipa al Governo di Maggioranza Alternativa guidato da ${altLead.leader} (${altSeats} seggi)`,
                fn: () => { closeModal(); openManualGovernmentFormationModal(myCoalParties, altLead.leader, p.coalId); }
              },
              {
                label: "🗳️ Nessun ribaltone: chiedi al Quirinale lo Scioglimento delle Camere (Elezioni tra 45 giorni)",
                fn: () => { closeModal(); startElectoralCampaign(`Scioglimento anticipato delle Camere dopo la sfiducia al Governo ${fallenPM}!`); }
              }
            ]
          );
        } else {
          // Caso realistico standard (Punto 15): l'opposizione ha meno di 201 seggi (sono stati decisivi i franchi tiratori), quindi NON può auto-nominarsi al governo senza passare dalle elezioni!
          openModal(
            `⚖️ Cade il Governo ${fallenPM} — Il Quirinale Scioglie le Camere (Art. 88 Cost.)`,
            `<div style="font-size:13px; color:var(--text);">
              Colpo di scena a Montecitorio! Grazie ai franchi tiratori nella maggioranza, la tua mozione di sfiducia è passata e il Presidente del Consiglio <strong>${fallenPM}</strong> è salito al Quirinale per rassegnare le dimissioni (+8% tuo Prestigio Personale).<br><br>
              Poiché in Parlamento i partiti d'opposizione compatibili dispongono di soli <strong>${altSeats} seggi su 400</strong> (sotto la maggioranza assoluta di 201 deputati), <strong>non esiste alcuna maggioranza parlamentare alternativa</strong>.<br><br>
              Ai sensi dell'<strong>Art. 88 della Costituzione</strong>, il Presidente della Repubblica <strong>${game.president.name}</strong> decreta lo <strong>scioglimento anticipato delle Camere</strong> e indice le Elezioni Politiche tra 45 giorni!
            </div>`,
            [
              {
                label: "🗳️ Prendi atto del Decreto del Quirinale: Vai alla Campagna Elettorale (45 giorni)!",
                fn: () => { closeModal(); startElectoralCampaign(`Scioglimento delle Camere dopo la sfiducia al Governo ${fallenPM}!`); }
              }
            ]
          );
        }
      } else {
        game.govStability = Math.max(10, game.govStability - 10);
        addFeed(`⚖️ Mozione di Sfiducia respinta dalla maggioranza, ma il Governo esce indebolito dal voto (-10% Stabilità).`);
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
        addFeed(`👑 <strong>MONITO DEL CAPO DELLO STATO:</strong> Dal Quirinale il Presidente <strong>${game.leader.name}</strong> richiama le forze politiche alla coesione nazionale (+5% Prestigio, +8% Stabilità, -6 pt Spread)!`, 'ok');
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
        if (!useTurnAction('q_dissolve', 'Scioglimento delle Camere')) return;
        game.ap -= 35;
        startElectoralCampaign(`Decreto di scioglimento anticipato delle Camere firmato dal Presidente della Repubblica ${game.leader.name} (Art. 88 Cost.)!`);
        return;
      }
      updateAllUI();
    }

    // =========================================================================

