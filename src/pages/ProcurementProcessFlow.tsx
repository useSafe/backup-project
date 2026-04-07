import React, { useState } from 'react';
import {
  ExternalLink, ChevronDown, ChevronUp, BookOpen, ClipboardCheck,
  FileSpreadsheet, BarChart2, Lightbulb, Info, FileText, Users,
  DollarSign, Send, Package, Archive, Printer, Camera,
  Megaphone, Gavel, Star, Search, ClipboardList, BookMarked, AlertCircle,
  X, CheckCircle2, AlertTriangle, ChevronRight, GitBranch,
  Layers, ReceiptText, Scale, ScrollText, BookText,
  ShieldAlert, Shield, Network, ArrowDown, ArrowRight,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   LEGAL DATA
══════════════════════════════════════════════════════════════ */
const LEGAL_DATA = {
  ra9184: {
    id: 'ra9184', shortName: 'RA 9184', fullName: 'Republic Act No. 9184',
    subtitle: 'Government Procurement Reform Act', enacted: 'January 10, 2003',
    color: 'indigo',
    summary: 'RA 9184 is the foundational procurement law of the Philippines. It governs all government procurement of goods, infrastructure, and consulting services, and establishes the BAC system, procurement methods, transparency requirements, and protest mechanisms.',
    principles: [
      'Transparency — all procurement activities must be open to public scrutiny',
      'Competitiveness — fair competition among all eligible bidders must be ensured',
      'Streamlined process — procedures simplified without sacrificing accountability',
      'System of accountability — officials are personally responsible for decisions',
      'Public monitoring — CSOs and observers must be allowed to participate',
    ],
    sections: [
      { ref: 'Sec. 5',    title: 'Definition of Terms',                  note: 'Defines ABC, BAC, End-User, HOPE, TWG, Procuring Entity — terms used throughout the entire process.',                                                                                tags: ['all steps', 'definitions'] },
      { ref: 'Sec. 10',   title: 'Competitive Bidding as General Rule',   note: 'Mandates all government procurement shall be through Competitive Bidding unless an alternative method is justified under Secs. 48–54. The BAC Resolution must cite this for Regular Bidding.',  tags: ['regular bidding', 'mode', 'bac resolution'] },
      { ref: 'Sec. 11',   title: 'Procurement Planning & Budget Linkage', note: 'Procurement must be in the APP and linked to appropriations. The CAF satisfies the budget certification requirement before any procurement proceeds.',                                       tags: ['budget', 'caf', 'app', 'pr for action'] },
      { ref: 'Sec. 12',   title: 'Procurement Thresholds & GPPB',         note: 'The GPPB sets and updates procurement thresholds. The ₱50,000 and ₱1,000,000 ABC thresholds are based on GPPB-approved resolutions under this section.',                                  tags: ['thresholds', 'svp', 'gppb'] },
      { ref: 'Sec. 13',   title: 'Composition of the BAC',                note: 'BAC must have at least 5 members from different offices. Establishes why the routing order (Chairperson, Vice Chair, Members) matters legally.',                                             tags: ['bac', 'routing', 'composition'] },
      { ref: 'Sec. 14',   title: 'Functions and Responsibilities of BAC', note: 'BAC is responsible for advertising, pre-bid conferences, eligibility checking, bid evaluation, post-qualification, and recommending award.',                                                  tags: ['bac', 'deliberation', 'bid evaluation', 'award'] },
      { ref: 'Sec. 15',   title: 'BAC Secretariat',                       note: 'The BAC Secretariat provides secretarial and administrative support — maintaining records, preparing minutes, posting on PhilGEPS, managing the monitoring system. Every Secretariat task traces here.', tags: ['all steps', 'secretariat'] },
      { ref: 'Sec. 20',   title: 'Pre-Procurement Conference',            note: 'Required for all competitive bidding above the threshold. BAC must review project terms before advertising. Mandatory for Regular Bidding.',                                                 tags: ['pre-procurement', 'regular bidding'] },
      { ref: 'Sec. 21',   title: 'Advertising & ITB',                     note: 'The ITB must be posted on PhilGEPS for at least 7 calendar days. Justifies the PhilGEPS posting requirement for Regular Bidding and SVP above threshold.',                                   tags: ['philgeps', 'itb', 'advertisement', 'svp', 'regular bidding'] },
      { ref: 'Sec. 22',   title: 'Pre-Bid Conference',                    note: 'Must be held at least 12 days before submission deadline. Supplemental Bulletins may be issued within 7 days before the deadline.',                                                          tags: ['pre-bid', 'regular bidding', 'bulletin'] },
      { ref: 'Sec. 25',   title: 'Deadline for Bid Submission',           note: 'Bids submitted after the deadline shall not be accepted. The 7-day deadline rule for above-₱50K SVP is rooted here as interpreted in the IRR.',                                             tags: ['deadline', 'rfq opening', 'bid opening', 'svp'] },
      { ref: 'Sec. 29',   title: 'Bid Evaluation',                        note: 'The LCRB is the lowest total calculated price among all responsive bids. Non-compliant bids are ranked separately. Abstract of Quotations is the official evaluation record.',              tags: ['lcrb', 'abstract', 'evaluation'] },
      { ref: 'Sec. 34',   title: 'Post-Qualification',                    note: 'After identifying the LCRB, the procuring entity verifies legal, technical, and financial eligibility. Documents: COR, Business Permit, PhilGEPS Certificate, Omnibus Sworn Statement.',    tags: ['post-qualification', 'regular bidding', 'lcrb'] },
      { ref: 'Sec. 37',   title: 'Notice of Award',                       note: 'NOA is issued to the LCRB after post-qualification. Supplier must accept within 7 calendar days. NOA must be issued within 3 days of BAC Resolution approval.',                             tags: ['noa', 'ntp', 'award', 'all modes'] },
      { ref: 'Sec. 41',   title: 'Failed Bidding',                        note: 'Bidding is failed when: (a) no bids received; (b) all bids fail post-qualification; (c) LCRB refuses award. The BAC Resolution must cite this section for ANY failed procurement.',          tags: ['failed', 'bac resolution', 'all modes'] },
      { ref: 'Sec. 48',   title: 'Alternative Methods of Procurement',    note: 'Authorizes Shopping, SVP, Direct Contracting, Repeat Order, Negotiated Procurement — each with strict conditions that must be cited in the BAC Resolution.',                               tags: ['shopping', 'svp', 'alternative', 'mode'] },
      { ref: 'Sec. 52',   title: 'Shopping',                              note: 'Authorizes Shopping for off-the-shelf goods. Requires at least 3 price quotations and a Certificate of Non-Availability of Stocks. No PhilGEPS posting required.',                           tags: ['shopping', 'non-availability', '3 quotations'] },
      { ref: 'Sec. 53.9', title: 'Small Value Procurement (SVP)',          note: 'Allowed when ABC does not exceed GPPB threshold. Requires PhilGEPS posting for above-threshold amounts and at least 3 quotations. BAC Resolution must cite this section for SVP.',          tags: ['svp', 'threshold', 'philgeps'] },
      { ref: 'Sec. 55',   title: 'Procurement Monitoring Report (PMR)',   note: 'All procuring entities must submit PMR to GPPB semiannually. Documents all completed procurement activities. Failed procurements are excluded. This is a legal requirement.',               tags: ['pmr', 'gppb', 'reporting'] },
      { ref: 'Sec. 63',   title: 'Observers',                             note: 'At least 2 observers must be invited to BAC meetings and bid openings: one from a recognized private sector org, and one from an NGO. COA participates as observer.',                     tags: ['coa', 'observers', 'bid opening', 'deliberation'] },
    ],
  },
  ra12009: {
    id: 'ra12009', shortName: 'RA 12009', fullName: 'Republic Act No. 12009',
    subtitle: 'New Government Procurement Act', enacted: 'July 2024 (signed into law)',
    color: 'violet',
    summary: 'RA 12009 is the updated government procurement law that amends and supplements RA 9184. It modernizes procurement with digital-first processes, updated thresholds, stronger transparency, and sustainable procurement requirements. Governs all procurement from its effectivity date.',
    principles: [
      'Digital-first — PhilGEPS is now the primary and mandatory procurement platform',
      'Updated thresholds — new ABC limits for SVP, Shopping, and all alternative methods',
      'Sustainability — procurement must consider environmental and social impact',
      'Strengthened accountability — heavier penalties for violations and collusion',
      'Simplified procedures — reduced documentary requirements for small procurements',
    ],
    sections: [
      { ref: 'Sec. 4',  title: 'Updated Definitions',                 note: 'Introduces updated definitions for digital procurement, sustainable procurement, and new thresholds. Supersedes conflicting definitions in RA 9184.',                                      tags: ['all steps', 'definitions'] },
      { ref: 'Sec. 10', title: 'Updated Procurement Thresholds',      note: 'RA 12009 updates the thresholds for alternative methods. The old RA 9184 ₱50,000 SVP and Shopping limits may have changed. Always verify current GPPB-approved thresholds.',              tags: ['thresholds', 'svp', 'shopping', 'mode'] },
      { ref: 'Sec. 14', title: 'PhilGEPS as Primary Platform',        note: 'Reinforces PhilGEPS as the official and primary platform for all procurement postings, monitoring, and archiving. Posting is now more strictly enforced for all procurement modes.',       tags: ['philgeps', 'posting', 'svp', 'regular bidding'] },
      { ref: 'Sec. 20', title: 'Streamlined Alternative Methods',     note: 'Reorganizes and streamlines alternative procurement methods. SVP and Shopping procedures are updated. BAC Resolutions should cite this section when applicable under RA 12009.',          tags: ['svp', 'shopping', 'bac resolution'] },
      { ref: 'Sec. 25', title: 'Sustainable Procurement',             note: 'Introduces sustainable procurement requirements. Procuring entities must consider environmental and social factors. May affect technical specifications in RFQ or TWG evaluations.',        tags: ['rfq', 'twg', 'specs'] },
      { ref: 'Sec. 30', title: 'Updated PMR Requirements',            note: 'Updates PMR submission schedule and format. Entities must comply with updated GPPB guidelines on frequency and digital submission. Always use the latest PMR template from GPPB.',         tags: ['pmr', 'gppb', 'reporting'] },
      { ref: 'Sec. 35', title: 'Strengthened Penalties & Liability',  note: 'Increases penalties for procurement violations — blacklisting of suppliers, administrative sanctions for BAC members, and criminal liability for collusion. Relevant in failed procurement.', tags: ['penalties', 'blacklisting', 'post-qualification', 'failed'] },
      { ref: 'Sec. 40', title: 'Electronic Procurement Records',      note: 'Requires procurement records to be maintained electronically. The use of Google Sheets for PR Logging, Monitoring, and PMR fulfills this requirement.',                                   tags: ['digital', 'archiving', 'monitoring sheet', 'pr logging'] },
    ],
  },
  irr: {
    id: 'irr', shortName: 'IRR', fullName: 'Implementing Rules and Regulations',
    subtitle: 'IRR of RA 9184 (as updated for RA 12009)', enacted: 'Updated per GPPB Resolution',
    color: 'teal',
    summary: 'The IRR translates RA 9184 and RA 12009 into operational procedures. It provides the detailed steps, timelines, forms, and thresholds that procuring entities must follow. Every form you fill out, every deadline you observe, and every document you route follows IRR provisions.',
    principles: [
      'Operational detail — fills procedural gaps left by the law itself',
      'Forms and templates — official forms (RFQ, Abstract, BAC Resolution) are IRR-prescribed',
      'Specific timelines — posting periods, evaluation deadlines, review periods are in the IRR',
      'Document requirements — what to submit, how many copies, and who signs what',
      'Thresholds and limits — specific peso amounts for each alternative procurement method',
    ],
    sections: [
      { ref: 'Rule II, §5',       title: 'Procurement Planning',                  note: 'Requires all procurements to be covered by the APP and linked to the approved budget. The PR must reflect an activity already in the PPMP of the requesting office.',              tags: ['app', 'ppmp', 'budget', 'pr logging'] },
      { ref: 'Rule III, §12',     title: 'Quorum of the BAC',                     note: 'The BAC must have a quorum (majority present) for deliberation to be valid. At least 3 members must be present and voting. Invalid quorum = invalid decisions.',                  tags: ['bac', 'quorum', 'deliberation'] },
      { ref: 'Rule III, §14',     title: 'BAC Secretariat Operational Duties',    note: 'Specifies Secretariat must: maintain the monitoring system, prepare and send invitations, safeguard documents, post on PhilGEPS, and prepare minutes. All Secretariat tasks trace here.', tags: ['all steps', 'secretariat', 'monitoring'] },
      { ref: 'Rule VII, §21',     title: 'PhilGEPS Posting Timelines',            note: 'Regular Bidding: ITB posted at least 7 calendar days. SVP above threshold: RFQ posted on PhilGEPS. The "tomorrow\'s date + 7-day deadline" rule for SVP above ₱50K is from here.', tags: ['philgeps', 'svp', 'regular bidding', '7 days', 'rfq date'] },
      { ref: 'Rule VII, §22',     title: 'Pre-Bid Conference Operations',         note: 'Pre-bid must be held at least 12 days before bid submission. Supplemental Bid Bulletins must be issued within 7 days before the deadline. Attendance must be documented.',         tags: ['pre-bid', 'attendance', 'bulletin', 'regular bidding'] },
      { ref: 'Rule VII, §25',     title: 'Receipt & Opening of Bids',             note: 'Bids submitted in sealed envelopes; opened in public. Two-envelope system applies. BAC Secretariat records opening in the Opening of Bids spreadsheet with passed/failed per doc.', tags: ['bid opening', 'sealed', 'two-envelope', 'regular bidding'] },
      { ref: 'Rule VIII, §30',    title: 'Bid Evaluation Criteria & Process',     note: 'Abstract of Quotations is the official evaluation document. Classification (LCRB, SCRB, Non-Compliant, No Bid) is an IRR requirement. Calculations must follow IRR criteria.',    tags: ['abstract', 'lcrb', 'evaluation', 'all modes'] },
      { ref: 'Rule VIII, §34',    title: 'Post-Qualification Document Checklist', note: 'Exact documents required: Mayor\'s/Business Permit, COR, PhilGEPS Certificate, Omnibus Sworn Statement, Income/Business Tax Returns (above threshold). Each must be verified.',   tags: ['post-qualification', 'cor', 'omnibus', 'regular bidding'] },
      { ref: 'Rule IX, §37',      title: 'Notice of Award Timelines',             note: 'NOA must be issued within 3 calendar days from BAC Resolution approval. Supplier acceptance: within 7 calendar days. NTP issued after contract signing.',                         tags: ['noa', 'ntp', 'timelines', 'all modes'] },
      { ref: 'Rule X, §41',       title: 'Failure of Bidding Procedure',          note: 'BAC issues a resolution citing the specific reason for failure. The procuring entity then chooses to re-bid or use an alternative method. Must cite this rule in the BAC Resolution.', tags: ['failed', 'bac resolution', 're-bidding', 'all modes'] },
      { ref: 'Rule XVI, §52',     title: 'Shopping Operational Requirements',     note: 'Shopping requires: at least 3 price quotations, Certificate of Non-Availability of Stocks. BAC Secretariat must maintain canvass records and abstract.',                          tags: ['shopping', 'non-availability', '3 quotations'] },
      { ref: 'Rule XVI, §53.9',   title: 'SVP Operational Details',               note: 'At least 3 price quotations; post on PhilGEPS if above threshold (tomorrow\'s date + 7-day deadline). Abstract must show all suppliers. BAC Resolution must justify SVP.',         tags: ['svp', 'philgeps', 'rfq', 'abstract'] },
      { ref: 'Rule XVII, §55',    title: 'PMR Submission Procedure',              note: 'PMR must be submitted to GPPB within 14 days after end of each semester. Post on entity\'s website. Failed procurements excluded. Use latest GPPB-approved template.',             tags: ['pmr', 'gppb', 'submission'] },
      { ref: 'Rule XX',           title: 'Procurement Records & Archiving',       note: 'All procurement documents must be maintained for at least 10 years from contract completion for audit purposes. Organized by month/year. This is the basis for the Archive step.',  tags: ['archiving', '10 years', 'audit', 'file tracking'] },
    ],
  },
};

/* ══════════════════════════════════════════════════════════════
   LEGAL MODAL
══════════════════════════════════════════════════════════════ */
const CMAP = {
  indigo: {
    bg: 'bg-indigo-500/8', border: 'border-indigo-500/30', accent: 'text-indigo-400',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    tag: 'bg-indigo-500/15 text-indigo-300', tagA: 'bg-indigo-500/35 text-indigo-200 border-indigo-400/60',
    dot: 'bg-indigo-400', prin: 'border-indigo-500/20 bg-indigo-500/5',
    btn: 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/40',
    glow: 'shadow-indigo-500/10', hdr: 'from-indigo-950/80',
  },
  violet: {
    bg: 'bg-violet-500/8', border: 'border-violet-500/30', accent: 'text-violet-400',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    tag: 'bg-violet-500/15 text-violet-300', tagA: 'bg-violet-500/35 text-violet-200 border-violet-400/60',
    dot: 'bg-violet-400', prin: 'border-violet-500/20 bg-violet-500/5',
    btn: 'bg-violet-600/20 border-violet-500/30 text-violet-300 hover:bg-violet-600/40',
    glow: 'shadow-violet-500/10', hdr: 'from-violet-950/80',
  },
  teal: {
    bg: 'bg-teal-500/8', border: 'border-teal-500/30', accent: 'text-teal-400',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    tag: 'bg-teal-500/15 text-teal-300', tagA: 'bg-teal-500/35 text-teal-200 border-teal-400/60',
    dot: 'bg-teal-400', prin: 'border-teal-500/20 bg-teal-500/5',
    btn: 'bg-teal-600/20 border-teal-500/30 text-teal-300 hover:bg-teal-600/40',
    glow: 'shadow-teal-500/10', hdr: 'from-teal-950/80',
  },
};

const ICONS = { ra9184: Scale, ra12009: ScrollText, irr: BookText };

const LegalModal = ({ lawId, onClose }) => {
  const [openSec, setOpenSec] = useState(null);
  const [tag, setTag] = useState(null);
  const law = LEGAL_DATA[lawId];
  if (!law) return null;
  const C = CMAP[law.color];
  const LawIcon = ICONS[lawId];
  const allTags = [...new Set(law.sections.flatMap(s => s.tags))].sort();
  const shown = tag ? law.sections.filter(s => s.tags.includes(tag)) : law.sections;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl my-4 rounded-2xl bg-[#0b0b1a] border border-[#1a1a30] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-br ${C.hdr} to-[#0b0b1a] p-5 border-b border-[#1a1a30]`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-black/50 border-2 ${C.border}`}>
                <LawIcon className={`w-5 h-5 ${C.accent}`} />
              </div>
              <div>
                <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded border inline-block mb-1 ${C.badge}`}>Legal Reference</span>
                <h2 className="text-lg font-black text-white leading-tight">{law.fullName}</h2>
                <p className={`text-xs font-bold ${C.accent}`}>{law.subtitle}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Enacted: {law.enacted}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 mt-1 rounded-lg hover:bg-white/8 text-slate-500 hover:text-slate-300 transition flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[72vh] p-4 space-y-4">
          {/* Summary */}
          <div className={`p-4 rounded-xl border ${C.border} ${C.bg}`}>
            <p className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${C.accent}`}>Overview</p>
            <p className="text-xs text-slate-300 leading-relaxed">{law.summary}</p>
          </div>

          {/* Key Principles */}
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Core Principles</p>
            <div className="grid grid-cols-1 gap-1.5">
              {law.principles.map((p, i) => (
                <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${C.prin}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5 ${C.bg} border ${C.border} ${C.accent}`}>{i + 1}</span>
                  <span className="text-[11px] text-slate-400 leading-relaxed">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags filter */}
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Filter Sections by Topic</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setTag(null)} className={`text-[10px] px-2.5 py-0.5 rounded-full border transition font-semibold ${tag === null ? C.tagA + ' border' : `${C.tag} border-transparent`}`}>All ({law.sections.length})</button>
              {allTags.map(t => (
                <button key={t} onClick={() => setTag(tag === t ? null : t)} className={`text-[10px] px-2.5 py-0.5 rounded-full border transition font-semibold ${tag === t ? C.tagA + ' border' : `${C.tag} border-transparent hover:border-white/10`}`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Sections accordion */}
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Sections Relevant to Your Process ({shown.length})</p>
            <div className="space-y-2">
              {shown.map((sec, i) => (
                <div key={i} className="rounded-xl border border-[#1a1a30] overflow-hidden">
                  <button onClick={() => setOpenSec(openSec === i ? null : i)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/4 transition text-left">
                    <span className={`flex-shrink-0 text-[9px] font-black tracking-wider px-2 py-1 rounded ${C.tag}`}>{sec.ref}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200">{sec.title}</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {sec.tags.slice(0, 3).map(t => <span key={t} className={`text-[8px] px-1.5 py-px rounded ${C.tag} opacity-70`}>{t}</span>)}
                      </div>
                    </div>
                    {openSec === i ? <ChevronUp className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
                  </button>
                  {openSec === i && (
                    <div className="px-4 pb-4 pt-2 border-t border-[#1a1a30] space-y-3">
                      <p className="text-[11px] text-slate-300 leading-relaxed">{sec.note}</p>
                      <div className="flex flex-wrap gap-1">
                        {sec.tags.map(t => <span key={t} className={`text-[9px] px-2 py-0.5 rounded ${C.tag}`}>{t}</span>)}
                      </div>
                      <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${C.border} ${C.bg}`}>
                        <Shield className={`w-3 h-3 flex-shrink-0 ${C.accent}`} />
                        <p className="text-[10px] text-slate-400">Relevant to: <span className="text-slate-300 font-semibold">{sec.tags.join(' · ')}</span></p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   FLOWCHART MODAL
══════════════════════════════════════════════════════════════ */
const FlowNode = ({ label, sub, color, badge, isDecision }) => {
  const base = isDecision
    ? `border-2 ${color} bg-[#0b0b1a] rotate-3`
    : `border ${color} bg-[#0f0f1e]`;
  return (
    <div className={`relative rounded-xl px-3 py-2 text-center ${base} min-w-[110px] max-w-[140px] mx-auto`}>
      {badge && <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-black tracking-widest px-2 py-px rounded-full border whitespace-nowrap ${badge}`}>{badge}</span>}
      <p className="text-[10px] font-bold text-slate-200 leading-tight mt-1">{label}</p>
      {sub && <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{sub}</p>}
    </div>
  );
};
const FlowArrow = ({ label }) => (
  <div className="flex flex-col items-center py-0.5">
    <div className="w-px h-3 bg-slate-700" />
    {label && <span className="text-[8px] text-slate-600 font-bold tracking-wider uppercase px-1.5 py-px bg-[#0b0b1a] border border-slate-800 rounded">{label}</span>}
    <div className="w-px h-3 bg-slate-700" />
    <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-slate-600" />
  </div>
);
const FlowBranch = ({ branches }) => (
  <div className="relative my-2">
    <div className="flex justify-center gap-2 sm:gap-6">
      {branches.map((b, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-px h-4 bg-slate-700" />
          {b.label && <span className={`text-[8px] font-black tracking-wider px-1.5 py-px rounded border mb-1 ${b.labelColor}`}>{b.label}</span>}
          <FlowNode {...b} />
          {b.sub2 && <p className="text-[8px] text-slate-600 mt-1 text-center max-w-[120px] leading-tight">{b.sub2}</p>}
        </div>
      ))}
    </div>
    {/* top connector */}
    <div className="absolute top-0 left-0 right-0 flex justify-center">
      <div className="w-px h-4 bg-slate-700" />
    </div>
  </div>
);

const FlowchartModal = ({ onClose }) => {
  const [activeFlow, setActiveFlow] = useState('full');
  const flows = [
    { id: 'full', label: 'Full Overview' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'svp', label: 'SVP' },
    { id: 'rb', label: 'Reg. Bidding' },
  ];

  const SharedBefore = () => (
    <div className="flex flex-col items-center space-y-0">
      <FlowNode label="PR Logging" sub="Log, number, stamp, sign" color="border-indigo-500/50" badge="STEP 1 · COMMON" />
      <FlowArrow />
      <FlowNode label="Budget Cert. (CAF)" sub="Optional — if requested" color="border-yellow-500/40" badge="OPTIONAL" />
      <FlowArrow />
      <FlowNode label="PR for Action" sub="Log to monitoring sheet" color="border-blue-500/50" badge="STEP 2 · COMMON" />
      <FlowArrow />
      <FlowNode label="PR Deliberation" sub="BAC Regular Meeting" color="border-violet-500/50" badge="STEP 3 · COMMON" />
      <FlowArrow label="Mode Decision" />
    </div>
  );
  const SharedAfter = () => (
    <div className="flex flex-col items-center space-y-0 mt-1">
      <FlowArrow label="All Signed" />
      <FlowNode label="Abstract for PO" sub="Forward to GSD" color="border-cyan-500/50" badge="COMMON" />
      <FlowArrow />
      <FlowNode label="Purchase Order" sub="GSD processes" color="border-slate-500/40" badge="GSD" />
      <FlowArrow />
      <FlowNode label="PMR Report" sub="Submit to GPPB" color="border-violet-500/40" badge="COMMON" />
      <FlowArrow />
      <FlowNode label="Archive & File Tracking" sub="10-year retention (IRR Rule XX)" color="border-slate-500/40" badge="COMMON" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl my-4 rounded-2xl bg-[#0b0b1a] border border-[#1a1a30] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1a1a30] bg-gradient-to-r from-slate-900/60 to-[#0b0b1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/50 border border-slate-700/50 flex items-center justify-center">
              <Network className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <span className="text-[9px] font-black tracking-widest uppercase text-slate-500">Visual Reference</span>
              <h2 className="text-base font-black text-white">Process Flowchart</h2>
              <p className="text-[10px] text-slate-500">Click each tab to view mode-specific flow</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 text-slate-500 hover:text-slate-300 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-3 border-b border-[#1a1a30] bg-[#09091a]/60">
          {flows.map(f => (
            <button key={f.id} onClick={() => setActiveFlow(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeFlow === f.id ? 'bg-slate-700 text-white border border-slate-600' : 'text-slate-500 hover:text-slate-300'}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto max-h-[70vh] p-5">
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mb-5 pb-4 border-b border-[#1a1a30]">
            <span className="text-[9px] text-slate-600 font-bold tracking-widest uppercase mr-1 self-center">Legend:</span>
            {[
              { color: 'border-indigo-500/60 text-indigo-300', label: 'Common Step' },
              { color: 'border-sky-500/60 text-sky-300', label: 'Shopping' },
              { color: 'border-emerald-500/60 text-emerald-300', label: 'SVP' },
              { color: 'border-rose-500/60 text-rose-300', label: 'Regular Bidding' },
              { color: 'border-yellow-500/60 text-yellow-300', label: 'Optional' },
              { color: 'border-red-500/60 text-red-300', label: 'Failed → Re-bid' },
            ].map((l, i) => (
              <span key={i} className={`text-[9px] px-2 py-0.5 rounded border font-bold ${l.color} bg-transparent`}>{l.label}</span>
            ))}
          </div>

          {activeFlow === 'full' && (
            <div className="flex flex-col items-center">
              <SharedBefore />
              {/* Branch */}
              <div className="w-full max-w-xl my-2">
                <div className="flex justify-center gap-1 mb-1">
                  <div className="w-px h-4 bg-slate-700" />
                </div>
                <div className="flex items-start justify-center gap-2 sm:gap-4">
                  {[
                    { label: 'Shopping', color: 'border-sky-500/50', badge: 'SHOPPING', steps: ['RFQ Prep', 'Distribution', 'Abstract Eval', 'BAC Reso / NOA / NTP', 'Routing'], badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
                    { label: 'SVP', color: 'border-emerald-500/50', badge: 'SVP', steps: ['RFQ Prep', 'Posting', 'RFQ Opening', 'Abstract Eval', 'TWG Eval', 'BAC Reso / NOA / NTP', 'Routing'], badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
                    { label: 'Regular Bidding', color: 'border-rose-500/50', badge: 'REG. BIDDING', steps: ['Pre-Procurement', 'PhilGEPS / ITB', 'Pre-Bid Conf.', 'Bid Opening', 'TWG Eval', 'Post-Qual.', 'BAC Reso / NOA / NTP', 'Contract & Bound Copies', 'Routing'], badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
                  ].map((m, mi) => (
                    <div key={mi} className={`flex-1 rounded-xl border ${m.color} bg-[#0f0f1e] p-3`}>
                      <span className={`text-[8px] font-black tracking-wider px-2 py-0.5 rounded border block text-center mb-2 ${m.badgeColor}`}>{m.badge}</span>
                      <div className="space-y-1">
                        {m.steps.map((s, si) => (
                          <div key={si} className="flex items-center gap-1.5">
                            <span className="text-[8px] font-black text-slate-600">{si + 1}</span>
                            <div className="flex-1 text-[9px] text-slate-400 leading-tight py-1 px-1.5 rounded bg-white/3">{s}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <SharedAfter />
            </div>
          )}

          {activeFlow === 'shopping' && (
            <div className="flex flex-col items-center">
              <SharedBefore />
              <div className="my-1">
                <FlowNode label="Shopping Mode Selected" sub="Requires Non-Availability Cert." color="border-sky-500/60" badge="SHOPPING" />
              </div>
              <FlowArrow />
              <FlowNode label="RFQ Preparation" sub="No 7-day deadline · Today's date" color="border-sky-500/40" />
              <FlowArrow />
              <FlowNode label="RFQ Distribution" sub="3 copies + Bulletin Board · No PhilGEPS" color="border-sky-500/40" />
              <FlowArrow />
              <FlowNode label="Abstract Evaluation" sub="LCRB / Non-Compliant / No Bid" color="border-sky-500/40" />
              <FlowArrow />
              <div className="w-full max-w-sm">
                <FlowNode label="Procurement Result?" color="border-slate-500/60" isDecision />
                <div className="flex justify-center gap-6 mt-1">
                  <div className="flex flex-col items-center">
                    <div className="w-px h-3 bg-slate-700" />
                    <span className="text-[8px] font-black text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-px rounded">SUCCESS</span>
                    <FlowArrow />
                    <FlowNode label="BAC Reso / NOA / NTP" sub="Cite RA 9184 §52" color="border-sky-500/40" />
                    <FlowArrow />
                    <FlowNode label="Document Routing" sub="Full signatory chain" color="border-sky-500/40" />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-px h-3 bg-slate-700" />
                    <span className="text-[8px] font-black text-red-400 border border-red-500/30 bg-red-500/10 px-1.5 py-px rounded">FAILED</span>
                    <FlowArrow />
                    <FlowNode label="BAC Reso — Failed" sub="Cite RA 9184 §41 · IRR Rule X §41" color="border-red-500/40" />
                    <FlowArrow />
                    <FlowNode label="Re-bid or Alt. Method" sub="Consult BAC Sec Head" color="border-amber-500/40" />
                  </div>
                </div>
              </div>
              <SharedAfter />
              {/* Legal note */}
              <div className="mt-4 w-full max-w-md p-3 rounded-xl border border-sky-500/20 bg-sky-500/5">
                <p className="text-[9px] font-black tracking-widest text-sky-400 uppercase mb-1.5 flex items-center gap-1"><Scale className="w-3 h-3" />Legal Basis</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">Mode: <span className="text-sky-300 font-semibold">RA 9184 §52 / RA 12009 §20 / IRR Rule XVI §52</span> — Award: <span className="text-sky-300 font-semibold">RA 9184 §37 / IRR Rule IX §37</span> — Failure: <span className="text-red-300 font-semibold">RA 9184 §41 / IRR Rule X §41</span></p>
              </div>
            </div>
          )}

          {activeFlow === 'svp' && (
            <div className="flex flex-col items-center">
              <SharedBefore />
              <div className="my-1">
                <FlowNode label="SVP Mode Selected" sub="₱50K and below / above ₱50K–₱1M" color="border-emerald-500/60" badge="SVP" />
              </div>
              <FlowArrow />
              <FlowNode label="RFQ Preparation" sub="Below ₱50K: today · Above ₱50K: tomorrow + 7-day deadline" color="border-emerald-500/40" />
              <FlowArrow />
              <div className="w-full max-w-sm text-center">
                <FlowNode label="Posting" color="border-slate-500/60" isDecision />
                <div className="flex justify-center gap-6 mt-1">
                  <div className="flex flex-col items-center">
                    <div className="w-px h-3 bg-slate-700" />
                    <span className="text-[8px] font-black text-slate-400 border border-slate-600 px-1.5 py-px rounded">Below ₱50K</span>
                    <FlowArrow />
                    <FlowNode label="Bulletin Board Only" color="border-emerald-500/40" />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-px h-3 bg-slate-700" />
                    <span className="text-[8px] font-black text-violet-300 border border-violet-500/30 bg-violet-500/10 px-1.5 py-px rounded">Above ₱50K</span>
                    <FlowArrow />
                    <FlowNode label="Bulletin Board + PhilGEPS" sub="RA 9184 §21 · IRR Rule VII §21" color="border-violet-500/40" />
                  </div>
                </div>
              </div>
              <FlowArrow />
              <FlowNode label="RFQ Opening (Deadline Day)" sub="Record date in Abstract" color="border-emerald-500/40" />
              <FlowArrow />
              <FlowNode label="Abstract Evaluation" sub="LCRB / SCRB / Non-Compliant / No Bid" color="border-emerald-500/40" />
              <FlowArrow />
              <FlowNode label="TWG Evaluation" sub="Technical specs verification" color="border-emerald-500/40" />
              <FlowArrow />
              <div className="w-full max-w-sm">
                <FlowNode label="Procurement Result?" color="border-slate-500/60" isDecision />
                <div className="flex justify-center gap-6 mt-1">
                  <div className="flex flex-col items-center">
                    <div className="w-px h-3 bg-slate-700" />
                    <span className="text-[8px] font-black text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-px rounded">SUCCESS</span>
                    <FlowArrow />
                    <FlowNode label="BAC Reso / NOA / NTP" sub="Cite RA 9184 §53.9" color="border-emerald-500/40" />
                    <FlowArrow />
                    <FlowNode label="Document Routing" sub="Accounting required if >₱50K" color="border-emerald-500/40" />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-px h-3 bg-slate-700" />
                    <span className="text-[8px] font-black text-red-400 border border-red-500/30 bg-red-500/10 px-1.5 py-px rounded">FAILED</span>
                    <FlowArrow />
                    <FlowNode label="BAC Reso — Failed" sub="Cite RA 9184 §41" color="border-red-500/40" />
                    <FlowArrow />
                    <FlowNode label="Re-bid or Alt. Method" color="border-amber-500/40" />
                  </div>
                </div>
              </div>
              <SharedAfter />
              <div className="mt-4 w-full max-w-md p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <p className="text-[9px] font-black tracking-widest text-emerald-400 uppercase mb-1.5 flex items-center gap-1"><Scale className="w-3 h-3" />Legal Basis</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">Mode: <span className="text-emerald-300 font-semibold">RA 9184 §53.9 / RA 12009 §20 / IRR Rule XVI §53.9</span> — PhilGEPS: <span className="text-emerald-300 font-semibold">RA 9184 §21 / IRR Rule VII §21</span> — Failure: <span className="text-red-300 font-semibold">RA 9184 §41 / IRR Rule X §41</span></p>
              </div>
            </div>
          )}

          {activeFlow === 'rb' && (
            <div className="flex flex-col items-center">
              <SharedBefore />
              <div className="my-1">
                <FlowNode label="Regular Bidding Selected" sub="₱1,000,000 and above — RA 9184 §10" color="border-rose-500/60" badge="REG. BIDDING" />
              </div>
              <FlowArrow />
              <FlowNode label="Pre-Procurement Conference" sub="Required · RA 9184 §20 · Zoom" color="border-rose-500/40" />
              <FlowArrow />
              <FlowNode label="PhilGEPS Posting + ITB" sub="Mandatory · RA 9184 §21 · Min. 7 days" color="border-rose-500/40" />
              <FlowArrow />
              <FlowNode label="Pre-Bid Conference" sub="≥12 days before deadline · RA 9184 §22" color="border-rose-500/40" />
              <FlowArrow />
              <FlowNode label="Bid Opening" sub="Public · Sealed envelopes · COA attends · RA 9184 §63" color="border-rose-500/40" />
              <FlowArrow />
              <div className="w-full max-w-xs">
                <FlowNode label="Bids Received?" color="border-slate-500/60" isDecision />
                <div className="flex justify-center gap-6 mt-1">
                  <div className="flex flex-col items-center">
                    <div className="w-px h-3 bg-slate-700" />
                    <span className="text-[8px] font-black text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-px rounded">YES</span>
                    <FlowArrow />
                    <FlowNode label="TWG Evaluation" color="border-rose-500/40" />
                    <FlowArrow />
                    <FlowNode label="Post-Qualification" sub="RA 9184 §34 · IRR Rule VIII §34" color="border-rose-500/40" />
                    <FlowArrow />
                    <FlowNode label="BAC Reso / NOA / NTP" sub="Cite RA 9184 §10, §37" color="border-rose-500/40" />
                    <FlowArrow />
                    <FlowNode label="Contract Signing" sub="Bound copies → COA, Accounting, End User" color="border-rose-500/40" />
                    <FlowArrow />
                    <FlowNode label="Document Routing" sub="Accounting always required" color="border-rose-500/40" />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-px h-3 bg-slate-700" />
                    <span className="text-[8px] font-black text-red-400 border border-red-500/30 bg-red-500/10 px-1.5 py-px rounded">FAILED</span>
                    <FlowArrow />
                    <FlowNode label="Failed Bidding" sub="RA 9184 §41 · IRR Rule X §41" color="border-red-500/40" />
                    <FlowArrow />
                    <FlowNode label="Re-bid" sub="Consult BAC Sec Head" color="border-amber-500/40" />
                  </div>
                </div>
              </div>
              <SharedAfter />
              <div className="mt-4 w-full max-w-md p-3 rounded-xl border border-rose-500/20 bg-rose-500/5">
                <p className="text-[9px] font-black tracking-widest text-rose-400 uppercase mb-1.5 flex items-center gap-1"><Scale className="w-3 h-3" />Legal Basis</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">Mode: <span className="text-rose-300 font-semibold">RA 9184 §10</span> — Pre-Procurement: <span className="text-rose-300 font-semibold">§20</span> — ITB: <span className="text-rose-300 font-semibold">§21</span> — Pre-Bid: <span className="text-rose-300 font-semibold">§22</span> — Post-Qual: <span className="text-rose-300 font-semibold">§34</span> — NOA: <span className="text-rose-300 font-semibold">§37</span> — Failure: <span className="text-red-300 font-semibold">§41</span></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   REUSABLE UI COMPONENTS
══════════════════════════════════════════════════════════════ */
const ErrorNode = ({ type = 'warning', title, items }) => {
  const S = {
    warning: { wrap: 'bg-amber-500/8 border-amber-500/30', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />, label: 'text-amber-400', dot: 'bg-amber-500/50' },
    error:   { wrap: 'bg-red-500/8 border-red-500/30',     icon: <ShieldAlert    className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />,    label: 'text-red-400',    dot: 'bg-red-500/50'    },
    tip:     { wrap: 'bg-sky-500/8 border-sky-500/30',     icon: <Lightbulb      className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />,    label: 'text-sky-400',    dot: 'bg-sky-500/50'    },
    note:    { wrap: 'bg-slate-500/8 border-slate-500/30', icon: <Info           className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />,  label: 'text-slate-400',  dot: 'bg-slate-500/50'  },
  }[type];
  return (
    <div className={`rounded-lg border p-3 ${S.wrap}`}>
      <div className="flex items-start gap-2">
        {S.icon}
        <div className="flex-1">
          <p className={`text-[10px] font-bold tracking-widest uppercase mb-1.5 ${S.label}`}>{title}</p>
          <ul className="space-y-1">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
                <span className={`flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${S.dot}`} />{item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const LegalBadgeRow = ({ refs, onOpen }) => {
  if (!refs || refs.length === 0) return null;
  const cls = { ra9184: 'bg-indigo-500/12 text-indigo-300 border-indigo-500/25 hover:bg-indigo-500/22', ra12009: 'bg-violet-500/12 text-violet-300 border-violet-500/25 hover:bg-violet-500/22', irr: 'bg-teal-500/12 text-teal-300 border-teal-500/25 hover:bg-teal-500/22' };
  const names = { ra9184: 'RA 9184', ra12009: 'RA 12009', irr: 'IRR' };
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {refs.map((r, i) => (
        <button key={i} onClick={() => onOpen(r.law)} className={`flex items-center gap-1 text-[9px] font-black tracking-wider px-2 py-0.5 rounded border transition ${cls[r.law]}`}>
          <Scale className="w-2.5 h-2.5" />{names[r.law]}{r.sec ? ` §${r.sec}` : ''}
        </button>
      ))}
    </div>
  );
};

const StepCard = ({ step, index, total, onOpenLegal }) => {
  const [open, setOpen] = useState(false);
  const Icon = step.icon;
  return (
    <div className="relative">
      <div className="flex items-stretch gap-3">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step.tc} bg-[#080814] z-10`}>
            <span className="text-[10px] font-black text-white">{index + 1}</span>
          </div>
          {index < total - 1 && <div className="w-px flex-1 mt-1 bg-gradient-to-b from-slate-700/60 to-transparent" style={{ minHeight: '1rem' }} />}
        </div>
        <div className={`flex-1 mb-3 rounded-xl border ${step.color} overflow-hidden`}>
          <button onClick={() => setOpen(o => !o)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 ${step.hc} transition hover:brightness-110 text-left`}>
            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded ${step.bc}`}>{step.cat}</span>
                {step.isOptional && <span className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded bg-slate-500/20 text-slate-400">OPTIONAL</span>}
              </div>
              <h3 className="text-sm font-semibold text-slate-100 mt-0.5">{step.title}</h3>
              {!open && step.desc && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{step.desc}</p>}
              {!open && step.legal && <LegalBadgeRow refs={step.legal} onOpen={onOpenLegal} />}
            </div>
            <div className="flex-shrink-0">{open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}</div>
          </button>

          {open && (
            <div className="px-4 py-4 space-y-4 border-t border-white/5">
              {step.body && <p className="text-xs text-slate-400 leading-relaxed">{step.body}</p>}

              {/* Legal basis panel */}
              {step.legal && step.legal.length > 0 && (
                <div className="rounded-xl border border-[#1a1a30] bg-[#080814]/80 p-3.5">
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-2.5 flex items-center gap-1.5">
                    <Scale className="w-3 h-3 text-slate-500" />Legal Basis for This Step
                  </p>
                  <div className="space-y-2">
                    {step.legal.map((r, ri) => {
                      const ld = LEGAL_DATA[r.law];
                      const cc = { ra9184: { card: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-300', btn: 'bg-indigo-600/15 border-indigo-500/25 text-indigo-300 hover:bg-indigo-600/30' }, ra12009: { card: 'border-violet-500/20 bg-violet-500/5 text-violet-300', btn: 'bg-violet-600/15 border-violet-500/25 text-violet-300 hover:bg-violet-600/30' }, irr: { card: 'border-teal-500/20 bg-teal-500/5 text-teal-300', btn: 'bg-teal-600/15 border-teal-500/25 text-teal-300 hover:bg-teal-600/30' } }[r.law];
                      return (
                        <div key={ri} className={`rounded-lg border p-2.5 ${cc.card}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black">{ld.shortName}{r.sec ? ` — §${r.sec}` : ''}</p>
                              {r.note && <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{r.note}</p>}
                            </div>
                            <button onClick={() => onOpenLegal(r.law)} className={`flex-shrink-0 flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded border transition ${cc.btn}`}>
                              <BookOpen className="w-2.5 h-2.5" />Read
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {step.analogy && (
                <div className="bg-amber-500/6 border border-amber-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[9px] font-bold tracking-widest text-amber-400 uppercase">Real-Life Analogy</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic">{step.analogy}</p>
                </div>
              )}

              {step.tasks && step.tasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Tasks / Steps</span>
                  </div>
                  <ol className="space-y-2.5">
                    {step.tasks.map((t, i) => (
                      <li key={i}>
                        <div className="flex items-start gap-2.5">
                          <span className="flex-shrink-0 w-[18px] h-[18px] mt-0.5 rounded-full bg-slate-700/60 flex items-center justify-center text-[9px] font-bold text-slate-400">{i + 1}</span>
                          <span className="text-xs text-slate-300 leading-relaxed">{t.main}</span>
                        </div>
                        {t.subs && t.subs.length > 0 && (
                          <ul className="mt-1.5 ml-7 space-y-1">
                            {t.subs.map((s, j) => (
                              <li key={j} className="flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
                                <span className="flex-shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-slate-600" />{s}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {step.nodes && step.nodes.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  {step.nodes.map((n, i) => <ErrorNode key={i} type={n.type} title={n.title} items={n.items} />)}
                </div>
              )}

              {step.mu && (
                <div className="bg-indigo-500/6 border border-indigo-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[9px] font-bold tracking-widest text-indigo-400 uppercase">Procurement Monitoring Sheet — Update</span>
                  </div>
                  <ul className="space-y-1">
                    {step.mu.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                        <ChevronRight className="w-3 h-3 text-indigo-500 flex-shrink-0 mt-0.5" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProcessSection = ({ title, subtitle, icon: Icon, ac, steps, onOpenLegal }) => (
  <div className={`rounded-2xl border ${ac} overflow-hidden`}>
    <div className="px-5 py-4 border-b border-[#1a1a30]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-black/40 flex items-center justify-center border border-white/8">
          <Icon className="w-4 h-4 text-white/70" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-100">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
    <div className="p-4 pt-5">
      {steps.map((s, i) => <StepCard key={s.id} step={s} index={i} total={steps.length} onOpenLegal={onOpenLegal} />)}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   STEP DATA
══════════════════════════════════════════════════════════════ */
const SB = [  // Shared Before
  { id:'s1', cat:'COMMON', title:'PR Logging', icon:ClipboardList, tc:'border-indigo-400', color:'border-indigo-500/40 bg-indigo-500/5', hc:'bg-indigo-500/10', bc:'bg-indigo-500/20 text-indigo-300',
    desc:'Receive, stamp, number, and route incoming Purchase Requests.',
    analogy:"Like a front-desk officer receiving a patient's admission form — stamp with time/date, assign a number, and route before any treatment begins.",
    body:"The very first step. When an End User brings a PR, the BAC Secretariat logs it into the system, assigns a PR number, and processes it before routing.",
    legal:[{ law:'ra9184', sec:'15', note:'BAC Secretariat is legally mandated to maintain procurement records and receive/log PRs.' },{ law:'irr', sec:'Rule III §14', note:'Secretariat must safeguard procurement documents from the point of receipt.' },{ law:'ra12009', sec:'40', note:'RA 12009 requires electronic procurement records — the PR Logging Google Sheet fulfills this.' }],
    tasks:[{ main:'Log in to the GSD Gmail Account to check for any incoming PR-related communications.', subs:[] },{ main:'Open the PR Google Sheet. Perform data entry and generate a new PR Number.', subs:[] },{ main:'Write the generated PR Number clearly on the PR form.', subs:[] },{ main:'Stamp "RECEIVED" on the back of the PR form and write the exact time and date of receipt.', subs:[] },{ main:'Bring the PR to the BAC Secretariat Head for initial review and signature.', subs:[] },{ main:'Log the PR Out (only if End User cannot wait and needs to take the PR back temporarily):', subs:['Stamp the date on the PR.','Write: "Returned PR# [YYYY-MMM-PRN] to End User (For Signature — if PR not yet signed)".','Record the Project Title of the PR.'] },{ main:'Return the signed PR to the End User and allow them to proceed.', subs:[] }],
    nodes:[{ type:'warning', title:'Common Mistakes', items:['Forgetting to stamp "RECEIVED" with exact time — required for audit trail.','Skipping the log-out entry when temporarily returning the PR.','Not writing the PR Number on the physical form before routing.'] },{ type:'note', title:'Notes', items:['Always check Gmail first — PRs may arrive digitally.','PR Number format: YYYY-MMM-PRN (e.g., 2025-MAR-001).','If PR is unsigned, return it with a note — do not accept for full processing.'] }]
  },
  { id:'s2', cat:'OPTIONAL', isOptional:true, title:'Budget Certification (CAF)', icon:DollarSign, tc:'border-yellow-400', color:'border-yellow-500/40 bg-yellow-500/5', hc:'bg-yellow-500/10', bc:'bg-yellow-500/20 text-yellow-300',
    desc:'Forward PR to Budget Division for Certificate of Availability of Funds.',
    analogy:"Like checking if there's enough money in your wallet before placing an order — Budget Division confirms funds exist.",
    body:"Optional. Performed only if the End User requests it. Normally, End Users submit their PR to Budget Division themselves.",
    legal:[{ law:'ra9184', sec:'11', note:'Procurement must be linked to appropriations. CAF confirms funds are available before any spending commitment.' },{ law:'irr', sec:'Rule II §5', note:'IRR operationalizes budget certification as a prerequisite before PR action.' }],
    tasks:[{ main:'Receive the PR and accompanying documents from the End User (or on their behalf).', subs:[] },{ main:'Bring or forward the PR to the Budget Division for processing of Budget Allocation.', subs:[] },{ main:'Wait for the Budget Division to certify the availability of funds and attach the CAF.', subs:[] }],
    nodes:[{ type:'note', title:'When This Step Applies', items:['Only when the End User explicitly asks BAC Secretariat to handle this on their behalf.','Without a CAF, no procurement can proceed.','The End User is primarily responsible for securing the CAF.'] }]
  },
  { id:'s3', cat:'COMMON', title:'PR for Action', icon:ClipboardCheck, tc:'border-blue-400', color:'border-blue-500/40 bg-blue-500/5', hc:'bg-blue-500/10', bc:'bg-blue-500/20 text-blue-300',
    desc:'Formally enter the PR into the monitoring system and stamp mode of procurement.',
    analogy:"Like officially registering a patient into a hospital ward — formally entered into the monitoring system with the correct procurement mode.",
    body:"Once the PR is signed and returned, the BAC Secretariat records it in the Monitoring Sheet as 'PR for Action' and stamps the applicable Mode of Procurement.",
    legal:[{ law:'ra9184', sec:'10', note:'Competitive bidding is the default — mode of procurement must be legally justified.' },{ law:'ra9184', sec:'48', note:'Alternative methods (Shopping, SVP) authorized under Sec. 48 with specific conditions.' },{ law:'ra12009', sec:'10', note:'RA 12009 updates ABC thresholds — always verify current GPPB thresholds.' },{ law:'irr', sec:'Rule III §14', note:'Secretariat must update the procurement monitoring system at this stage.' }],
    tasks:[{ main:'Open the Procurement Monitoring Google Sheet.', subs:[] },{ main:'Input the PR data:', subs:['PR Number','Project Title','End User','ABC amount','Status → "Not Yet Acted"','Date of Current Status → today\'s date','Remarks → "PR for Action"','"Received PR for Action" column → today\'s date','Notes → your name as modifier'] },{ main:'Stamp the Mode of Procurement on the PR form:', subs:['Shopping — only with Certificate of Non-Availability of Stocks (Supplies, Office Equipment, Janitorial materials)','SVP — for amounts above ₱50,000 and also ₱50,000 and below when applicable','Regular Bidding — for amounts ₱1,000,000 and above'] },{ main:'Check ABC bracket: "No" for PhilGEPS/BAC Reso if below ₱50,000; "Yes" if ₱50,000 and above.', subs:[] },{ main:'Bring the stamped PR to the BAC Secretariat Head for signature.', subs:[] }],
    mu:['PR Number, Title, End User, ABC','Status → "Not Yet Acted"','Date of Current Status → today','Remarks → "PR for Action"','"Received PR for Action" column → today','Notes → your name'],
    nodes:[{ type:'warning', title:'Mode of Procurement Decision', items:['Shopping: ONLY with Non-Availability Certificate.','SVP: ₱50K and below (applicable) and above ₱50K up to below ₱1M.','Regular Bidding: Mandatory for ₱1M and above.','PhilGEPS checkbox: "No" below ₱50K, "Yes" ₱50K and above.'] }]
  },
  { id:'s4', cat:'COMMON', title:'PR Deliberation (BAC Regular Meeting)', icon:Gavel, tc:'border-violet-400', color:'border-violet-500/40 bg-violet-500/5', hc:'bg-violet-500/10', bc:'bg-violet-500/20 text-violet-300',
    desc:'BAC Members formally review, discuss, and approve PRs at a scheduled meeting.',
    analogy:"Like a board meeting where decision-makers review proposals and vote — PRs are discussed and either approved or returned for corrections.",
    body:"The BAC holds a regular meeting to formally deliberate on all submitted PRs. BAC Secretariat assists in setup, attendance, tech management, and records updating.",
    legal:[{ law:'ra9184', sec:'13', note:'BAC composition — minimum 5 members required. All must be represented at deliberation.' },{ law:'ra9184', sec:'14', note:'Deliberation and approval of PRs is a core BAC responsibility.' },{ law:'ra9184', sec:'63', note:'Observers (COA, NGO/CSO) must be invited — COA attends via Zoom.' },{ law:'irr', sec:'Rule III §12', note:'Quorum (majority) must be present for deliberation to be valid.' }],
    tasks:[{ main:'Assist in conducting the BAC Regular Meeting — prepare venue and materials.', subs:[] },{ main:'Circulate the attendance sheet for all BAC Members and observers.', subs:[] },{ main:'Set up Zoom Meeting and send link through official Procurement Gmail (procurement@piamo.gov.ph / PIABACSEC2025@).', subs:[] },{ main:'Manage technical setup:', subs:['Ensure TV, PC, and amplifier are working.','Connect Zoom for COA (Commission on Audit) remote attendance.','Start Zoom recording for transparency.','Extract backup recording for BAC Office files.'] },{ main:'After BAC Members approve each PR, collect their initial signatures on the PR forms.', subs:[] }],
    mu:['"PR Deliberated" column → today\'s date','"Date of Current Status" → today','Status → "In Progress"','Remarks → "For PhilGEPS Posting"','Notes → your name'],
    nodes:[{ type:'tip', title:'Zoom Tips', items:['Send Zoom link through official procurement Gmail only.','Start recording before deliberation begins.','Save backup recording immediately after the meeting.','Ensure COA can hear and see clearly.'] },{ type:'error', title:'If Meeting Cannot Push Through', items:['Notify all BAC Members immediately.','Do NOT update the Monitoring Sheet with deliberation dates if no meeting occurred.','Re-schedule and send an updated invite through procurement Gmail.'] }]
  },
];

const SA = [  // Shared After
  { id:'sa1', cat:'COMMON', title:'Abstract for Purchase Order (Forward to GSD)', icon:Package, tc:'border-cyan-400', color:'border-cyan-500/40 bg-cyan-500/5', hc:'bg-cyan-500/10', bc:'bg-cyan-500/20 text-cyan-300',
    desc:'Compile, scan, and forward all signed procurement documents to GSD.',
    analogy:"Like forwarding the finalized contract to the purchasing department — the handoff from BAC Office to GSD.",
    legal:[{ law:'ra9184', sec:'37', note:'NOA and contract must be properly executed before the PO can be issued.' },{ law:'irr', sec:'Rule XX', note:'Scanning is the digital archiving step — part of the 10-year record retention requirement.' }],
    tasks:[{ main:'Scan all compiled procurement documents for the BAC Office\'s digital archive copy.', subs:[] },{ main:'Photocopy the BAC Checklist.', subs:[] },{ main:'Prepare the document package for GSD:', subs:['1 copy of the Abstract of Quotations','1 copy of the BAC Resolution (for ₱50K and above — and below if failed)','1 draft copy of the Abstract','1 copy of the Purchase Request with PR Form Slip','Any other papers with doctored or annotated information'] },{ main:'Log outgoing documents in the BAC Outgoing Log Book:', subs:['Note whether "Below 50K" or "Above 50K".','Stamp date for "RFQ for Canvass" and "Abstract for P.O." columns.'] },{ main:'Hand over the Abstract to GSD — specifically the copy with the PR Form Slip attached.', subs:[] }],
    mu:['"Forwarded to GSD for P.O." column → today\'s date','Status → "Completed"','Notes → your name'],
    nodes:[{ type:'warning', title:'Before Forwarding — Checklist', items:['All BAC Member signatures must be complete on Abstract and BAC Resolution.','PR Form Slip must have PR Number, Received Date, Acted Date, and Published Date.','Do not forward until all signatures are obtained.','Log the outgoing entry in BAC Outgoing Log Book before releasing.'] }]
  },
  { id:'sa2', cat:'COMMON', title:'Purchase Order Processing (GSD)', icon:ReceiptText, tc:'border-slate-400', color:'border-slate-500/40 bg-slate-500/5', hc:'bg-slate-500/10', bc:'bg-slate-500/20 text-slate-300',
    desc:'GSD issues PO to supplier, coordinates delivery, and inspects items.',
    analogy:"The final handoff — GSD takes over to contact the supplier, confirm the order, arrange delivery, and inspect items.",
    legal:[{ law:'ra9184', sec:'37', note:'The PO/Contract is the formal agreement between the procuring entity and supplier following the NOA.' }],
    tasks:[{ main:'GSD issues the Purchase Order to the winning supplier.', subs:[] },{ main:'GSD coordinates with the supplier for delivery scheduling.', subs:[] },{ main:'GSD conducts inspection of delivered items upon receipt.', subs:[] }],
    nodes:[{ type:'note', title:'BAC Secretariat Role at This Stage', items:['BAC Secretariat\'s role ends once documents are forwarded to GSD.','If GSD encounters discrepancies, they will refer back to BAC Office.','Follow up with GSD if the PO is significantly delayed.'] }]
  },
  { id:'sa3', cat:'COMMON', title:'PMR (Procurement Monitoring Report)', icon:BarChart2, tc:'border-violet-400', color:'border-violet-500/40 bg-violet-500/5', hc:'bg-violet-500/10', bc:'bg-violet-500/20 text-violet-300',
    desc:'Input completed procurement data into the quarterly GPPB-required report.',
    analogy:"Like submitting a quarterly performance report — document all completed activities as a formal accountability record.",
    body:"The PMR is a GPPB-required report documenting all completed procurement. FAILED procurements are NOT included.",
    legal:[{ law:'ra9184', sec:'55', note:'Sec. 55 mandates submission of the PMR to GPPB — legal requirement, not optional.' },{ law:'ra12009', sec:'30', note:'RA 12009 updates PMR schedule and format — use the latest GPPB-approved template.' },{ law:'irr', sec:'Rule XVII §55', note:'PMR must be submitted within 14 days after end of each semester. Failed procurements excluded.' }],
    tasks:[{ main:'Open the PMR Google Sheet and input data for each COMPLETED procurement (excluding failed):', subs:['PR Number','Procurement Project Title','End User','Mode of Procurement','Date of Opening of Bids','Date of Bid Evaluation','ABC — total and MOOE','Contract Cost — total and MOOE'] },{ main:'Stamp the PMR with "POSTED" and write the current date.', subs:[] }],
    nodes:[{ type:'warning', title:'PMR Reminders', items:['FAILED procurements are NOT included.','PMR is a GPPB legal requirement — submit on time.','MOOE breakdown must be accurate — coordinate with Accounting if needed.','Stamp "POSTED" with current date after encoding.'] }]
  },
  { id:'sa4', cat:'COMMON', title:'Archive to Drawer & File Tracking', icon:Archive, tc:'border-slate-400', color:'border-slate-500/40 bg-slate-500/5', hc:'bg-slate-500/10', bc:'bg-slate-500/20 text-slate-300',
    desc:'Physically file documents and update the digital File Tracking System.',
    analogy:"Like filing a finished case folder in a cabinet organized by month and year — for easy audit retrieval.",
    legal:[{ law:'irr', sec:'Rule XX', note:'All procurement documents must be maintained for at least 10 years from contract completion.' },{ law:'ra12009', sec:'40', note:'RA 12009 requires electronic records — the File Tracking System fulfills this.' }],
    tasks:[{ main:'Insert completed procurement documents into the drawer/folder for the specific month and year.', subs:[] },{ main:'Open the File Tracking System and input all relevant data:', subs:['PR Number','Project Title','End User','Mode of Procurement','ABC amount','Archive location'] }],
    nodes:[{ type:'tip', title:'Filing Tips', items:['Sort by Month and Year — this matches how auditors retrieve records.','Label the folder/drawer clearly.','Update the File Tracking System immediately after filing.'] }]
  },
];

const SH = [  // Shopping steps
  { id:'sh1', cat:'SHOPPING', title:'RFQ Preparation', icon:FileText, tc:'border-sky-400', color:'border-sky-500/40 bg-sky-500/5', hc:'bg-sky-500/10', bc:'bg-sky-500/20 text-sky-300', desc:'Prepare the RFQ form, Abstract, and Proof of Service worksheets.', legal:[{ law:'ra9184', sec:'52', note:'Sec. 52 authorizes Shopping. Requires Certificate of Non-Availability of Stocks and at least 3 price quotations.' },{ law:'irr', sec:'Rule XVI §52', note:'Canvass records and abstract must be maintained. No PhilGEPS posting required for Shopping.' }], tasks:[{ main:'Open RFQ Worksheet: Project Ref. No., Name of Project, Date (today\'s date — no tomorrow rule for Shopping), Item No., Description, Qty, Unit, Delivery Terms, Date/Place of Delivery, Payment Terms, Estimated Total Cost.', subs:[] },{ main:'Open Abstract and Proof of Service Worksheets:', subs:['Use "=" formula to pull data from RFQ sheet.','Ctrl + D to duplicate formulas for multiple rows.','Use =QTY*UNIT_COST and =SUM(Total) formulas.','Manually input Unit Cost and Total for each supplier.'] },{ main:'Double-check before printing: values, spelling, lines/borders, format.', subs:[] },{ main:'If signature images not appearing, press Ctrl + 6.', subs:[] },{ main:'Print one (1) copy of the RFQ.', subs:[] },{ main:'Attach PR Form Slip — PR Number, Received Date, Acted Date, Published Date.', subs:[] }], nodes:[{ type:'note', title:'Shopping vs SVP — Key Differences', items:['Shopping requires Certificate of Non-Availability of Stocks — without it, use SVP.','Shopping does NOT require PhilGEPS posting.','Shopping does NOT require a 7-day deadline.','Typically for Supplies, Office Equipment, Janitorial materials.'] },{ type:'warning', title:'Common RFQ Errors', items:['Wrong Estimated Total Cost — check formula computations.','Signature images not showing — Ctrl + 6.','Misaligned borders — preview before printing.','Missing PR Form Slip.'] }] },
  { id:'sh2', cat:'SHOPPING', title:'RFQ Distribution (Canvass)', icon:Send, tc:'border-sky-400', color:'border-sky-500/40 bg-sky-500/5', hc:'bg-sky-500/10', bc:'bg-sky-500/20 text-sky-300', desc:'Print and distribute RFQ copies; post on Bulletin Board only.', legal:[{ law:'ra9184', sec:'52', note:'Shopping requires at least 3 price quotations distributed through canvassers.' },{ law:'irr', sec:'Rule XVI §52', note:'Proof of Service must document supplier notifications. Canvasser signature required.' }], tasks:[{ main:'Print 4 copies RFQ and 1 Proof of Service.', subs:[] },{ main:'Attach/staple envelope to each of 3 supplier-copy RFQs. Attach Proof of Service to back of one copy.', subs:[] },{ main:'Attach TOR/Detailed Specifications/Sample Picture if stated on RFQ — Paper Clip all.', subs:[] },{ main:'Record in posting log: PR Number, Project Title, ABC, Below/Above ₱50K.', subs:[] },{ main:'Stamp date on left side of RFQ for Canvass column.', subs:[] },{ main:'Submit 3 supplier copies with envelopes and Proof of Service to BAC Head for signature.', subs:[] },{ main:'Go to Guard for Log Book for Bulletin Board posting.', subs:[] },{ main:'Post 1 Bulletin Board copy on the official Bulletin Board.', subs:[] },{ main:'Submit 3 RFQs with envelopes to End User / Canvassers for supplier distribution.', subs:[] }], mu:['"Published" column → today\'s date','Remarks → "For Canvass"','Notes → your name'], nodes:[{ type:'note', title:'No PhilGEPS Required for Shopping', items:['Shopping mode does NOT require PhilGEPS posting — Bulletin Board only.','Canvassers (End User representatives) distribute to suppliers and collect quotations.','Proof of Service must be canvasser-signed before routing.'] }] },
  { id:'sh3', cat:'SHOPPING', title:'Abstract Evaluation & Winner Selection', icon:FileSpreadsheet, tc:'border-sky-400', color:'border-sky-500/40 bg-sky-500/5', hc:'bg-sky-500/10', bc:'bg-sky-500/20 text-sky-300', desc:'Evaluate supplier quotes, determine LCRB, request legal documents.', legal:[{ law:'ra9184', sec:'29', note:'LCRB is the lowest total compliant bid. Non-compliant bids are ranked separately.' },{ law:'irr', sec:'Rule VIII §30', note:'Abstract of Quotations is the official evaluation document. Classification must follow IRR criteria.' }], tasks:[{ main:'Put current date in "Date of Bids Opened" on Abstract Worksheet.', subs:[] },{ main:'Calculate each supplier\'s total quoted price.', subs:[] },{ main:'Classify each supplier:', subs:['LCRB — Lowest Calculated Responsive Bid','SCRB — Second Lowest','1st LCB, 2nd LCB — other ranked compliant bidders','Non-Compliant — did not meet specifications','No Bid — no quotation submitted'] },{ main:'If 1 LOT with many items and some non-compliant, the entire lot may be FAILED.', subs:[] },{ main:'Contact LCRB to request: COR, Business Permit, PhilGEPS Certificate, Omnibus Sworn Statement.', subs:[] }], mu:['"RFQ Opening" column → today\'s date','"Date of Current Status" → today','Notes → your name'], nodes:[{ type:'error', title:'When Shopping Fails', items:['If only 0–1 compliant suppliers submitted, procurement is FAILED.','If a lot has non-compliant items, the whole lot fails.','Document failure in BAC Resolution — cite RA 9184 §41 / IRR Rule X §41.','Failed procurements are NOT included in the PMR.'] }] },
  { id:'sh4', cat:'SHOPPING', title:'BAC Resolution, NOA & NTP', icon:BookMarked, tc:'border-sky-400', color:'border-sky-500/40 bg-sky-500/5', hc:'bg-sky-500/10', bc:'bg-sky-500/20 text-sky-300', desc:'Prepare award documents citing RA 9184 §52 as legal basis.', legal:[{ law:'ra9184', sec:'37', note:'NOA must be issued after BAC recommends award. Supplier must accept within 7 calendar days.' },{ law:'ra9184', sec:'41', note:'For FAILED Shopping: cite Sec. 41 and state the specific reason for failure.' },{ law:'ra9184', sec:'52', note:'BAC Resolution for Shopping must cite Sec. 52 as the legal basis.' },{ law:'ra12009', sec:'20', note:'If procured under RA 12009 provisions, also cite this section.' }], tasks:[{ main:'Edit template documents (BAC Resolution, NOA, NTP): project title, PR number, supplier name, dates, ABC, contract amount.', subs:[] },{ main:'For BAC Resolution: cite RA 9184 Section 52 (or RA 12009 Sec. 20) as the legal basis for Shopping mode.', subs:[] },{ main:'For failed procurement: cite RA 9184 Section 41 and the specific reason for failure.', subs:[] }], mu:['"BAC Reso" column → today\'s date','Remarks → "For P.O."','"Supplier" column → winning supplier name','Notes → your name'], nodes:[{ type:'warning', title:'BAC Resolution Legal Basis', items:['Must cite exact provision: RA 9184 Section 52 for Shopping.','For failed: RA 9184 Section 41 + IRR Rule X Section 41.','Vague references like "in accordance with procurement law" are NOT acceptable.'] }] },
  { id:'sh5', cat:'SHOPPING', title:'Document Routing for Signatures', icon:Users, tc:'border-sky-400', color:'border-sky-500/40 bg-sky-500/5', hc:'bg-sky-500/10', bc:'bg-sky-500/20 text-sky-300', desc:'Route all procurement documents through the required signatory chain.', legal:[{ law:'ra9184', sec:'13', note:'All BAC Members must sign — Sec. 13 defines their composition and authority.' },{ law:'ra9184', sec:'14', note:'Recommendation of award must be documented through proper signatures.' }], tasks:[{ main:'BAC Secretariat Head initials the documents first.', subs:[] },{ main:'Route to End User (GSD, HRD, EEMD, BDD, MISD, or OAPIA).', subs:[] },{ main:'BAC Member 1 (FD) — Proof of Service must be canvasser-signed first.', subs:[] },{ main:'Provisional Member (CPD).', subs:[] },{ main:'Vice Chairperson (RALMD).', subs:[] },{ main:'BAC Member 3 (VACRD) — Proof of Attendance required if dates present.', subs:[] },{ main:'BAC Member 2 (LSD — Attorney): "Excuse me Attorney, Good Afternoon. [Your Full Name], an Intern from the BAC Office, asking to sign for RFQ, Abstract, and Proof of Service, then BAC Resolution regarding [Procurement Root Word]."', subs:[] },{ main:'Chairperson (EAD) — also for Endorsement and Initial for Accounting.', subs:[] },{ main:'For ABC above ₱50,000: Accounting Division.', subs:[] },{ main:'Verify all signatures on Abstract and BAC Reso; initials on RFQ, Proof of Service, and attachments.', subs:[] }], nodes:[{ type:'tip', title:'Routing Order', items:['BAC Sec Head → End User → BAC Member 1 (FD) → Provisional Member (CPD) → Vice Chair (RALMD) → BAC Member 3 (VACRD) → BAC Member 2 (LSD) → Chairperson (EAD) → Accounting (if above ₱50K).','Always carry a pen.','Proof of Service must be canvasser-signed before BAC Member 1.'] },{ type:'error', title:'Routing Mistakes', items:['Never skip the Secretariat Head\'s initial — must come first.','Missing Accounting signature for above ₱50K will stall the process.','Verify all signatures before forwarding to GSD.'] }] },
];

const SV = [  // SVP steps
  { id:'v1', cat:'SVP', title:'RFQ Preparation', icon:FileText, tc:'border-emerald-400', color:'border-emerald-500/40 bg-emerald-500/5', hc:'bg-emerald-500/10', bc:'bg-emerald-500/20 text-emerald-300', desc:'Prepare the RFQ worksheet, Abstract, and Proof of Service.', legal:[{ law:'ra9184', sec:'53.9', note:'Sec. 53.9 authorizes SVP. Requires at least 3 quotations and PhilGEPS posting for above-threshold amounts.' },{ law:'ra12009', sec:'20', note:'RA 12009 updates SVP provisions — verify current threshold amounts per latest GPPB resolution.' },{ law:'irr', sec:'Rule XVI §53.9', note:'7-day deadline and tomorrow\'s date rule for SVP above ₱50K is an IRR requirement.' }], tasks:[{ main:'Open RFQ Worksheet and fill in:', subs:['Project Reference Number','Name of Project','Date — today\'s date; if ABC above ₱50,000: TOMORROW\'S date','Deadline Date — for above ₱50,000 ONLY: 7 days after tomorrow\'s date','Item No., Item & Description, Qty, Unit','Delivery Terms, Date/Place of Delivery, Payment Terms','Estimated Total Cost (format: Php 47,000.00)'] },{ main:'Open Abstract and Proof of Service Worksheets and link data from RFQ sheet:', subs:['Use "=" formula to pull data.','Ctrl + D for multiple row duplication.','Use =QTY*UNIT_COST and =SUM(Total) formulas.','Manually input Unit Cost and Total for each supplier.','Deadline (above ₱50K): 7 days after RFQ date.'] },{ main:'Double-check before printing: values, spelling, messy data, borders, format.', subs:[] },{ main:'If signature images not appearing, press Ctrl + 6.', subs:[] },{ main:'Print one (1) copy of the RFQ.', subs:[] },{ main:'Attach PR Form Slip — PR Number, Received Date, Acted Date, Published Date.', subs:[] }], nodes:[{ type:'warning', title:'SVP Date Rules', items:['Below ₱50K: RFQ date = today. No deadline date required.','Above ₱50K: RFQ date = TOMORROW. Deadline = 7 days after tomorrow.','Wrong date invalidates the RFQ for above-₱50K procurements.'] },{ type:'error', title:'Common Errors', items:['Signature images not showing — Ctrl + 6.','Wrong Total Cost — verify formulas.','Missing PR Form Slip.','Misaligned borders — preview before printing.'] }] },
  { id:'v2', cat:'SVP', title:'RFQ Posting & Distribution', icon:Send, tc:'border-emerald-400', color:'border-emerald-500/40 bg-emerald-500/5', hc:'bg-emerald-500/10', bc:'bg-emerald-500/20 text-emerald-300', desc:'Print copies, post on Bulletin Board, and post to PhilGEPS if above ₱50K.', legal:[{ law:'ra9184', sec:'21', note:'Sec. 21 requires PhilGEPS posting for SVP above threshold.' },{ law:'ra12009', sec:'14', note:'RA 12009 reinforces PhilGEPS as primary platform — stricter enforcement.' },{ law:'irr', sec:'Rule VII §21', note:'7-day posting period for above-threshold SVP. Tomorrow\'s date on RFQ satisfies this.' }], tasks:[{ main:'Print 4 copies RFQ and 1 Proof of Service.', subs:[] },{ main:'Attach/staple envelope to each of 3 supplier-copy RFQs. Attach Proof of Service to back of one.', subs:[] },{ main:'Attach TOR/Specs/Sample Picture if required — Paper Clip all.', subs:[] },{ main:'Record in posting log: PR Number, Project Title, ABC, Below/Above ₱50K.', subs:[] },{ main:'Stamp date on left side of RFQ for Canvass column.', subs:[] },{ main:'Submit 3 supplier copies with envelopes and Proof of Service to BAC Head for signature.', subs:[] },{ main:'Go to Guard for Log Book for Bulletin Board posting.', subs:[] },{ main:'Post 1 Bulletin Board copy on official Bulletin Board.', subs:[] },{ main:'Submit 3 RFQs with envelopes to End User / Canvassers.', subs:[] },{ main:'For ABC above ₱50,000: post the RFQ to PhilGEPS.', subs:[] }], mu:['"Published" column → today\'s date','Remarks → "For Canvass"','Notes → your name'], nodes:[{ type:'error', title:'PhilGEPS — Required for Above ₱50K', items:['ABC above ₱50,000: PhilGEPS posting is MANDATORY — skipping invalidates the procurement.','Post on PhilGEPS same day as Bulletin Board.','Take screenshot/record the PhilGEPS posting confirmation.'] },{ type:'warning', title:'Proof of Service', items:['Must be signed by the designated Canvasser before routing.','Without Proof of Service signature, procurement documents cannot be completed.'] }] },
  { id:'v3', cat:'SVP', title:'RFQ Opening & Canvass', icon:Gavel, tc:'border-emerald-400', color:'border-emerald-500/40 bg-emerald-500/5', hc:'bg-emerald-500/10', bc:'bg-emerald-500/20 text-emerald-300', desc:'On the deadline date, open submitted quotations and record supplier prices.', legal:[{ law:'ra9184', sec:'25', note:'Quotations submitted after the deadline cannot be accepted.' },{ law:'irr', sec:'Rule VII §25', note:'Date of opening must be recorded in the Abstract immediately.' }], tasks:[{ main:'Open the Abstract Worksheet and enter today\'s date in "Date of Bids Opened".', subs:[] },{ main:'Contact and accommodate suppliers to record how much they bid on each item.', subs:[] },{ main:'Record the quoted prices of each supplier in the Abstract spreadsheet.', subs:[] }], mu:['"RFQ for Canvass" column → today\'s date','"RFQ Opening" column → today\'s date','"Date of Current Status" → today','Notes → your name'], nodes:[{ type:'warning', title:'Opening Day Rules', items:['Quotations after deadline cannot be accepted for above ₱50K.','At least 3 supplier quotations ideally required — fewer may result in failed procurement.','Record date of opening immediately — this is an official timestamp.'] }] },
  { id:'v4', cat:'SVP', title:'Abstract Evaluation & LCRB Determination', icon:FileSpreadsheet, tc:'border-emerald-400', color:'border-emerald-500/40 bg-emerald-500/5', hc:'bg-emerald-500/10', bc:'bg-emerald-500/20 text-emerald-300', desc:'Evaluate supplier prices, classify bidders, determine the LCRB.', legal:[{ law:'ra9184', sec:'29', note:'LCRB is the lowest total compliant bid.' },{ law:'irr', sec:'Rule VIII §30', note:'Abstract is the official evaluation document. Classification must follow IRR criteria.' }], tasks:[{ main:'Calculate each supplier\'s total quoted price.', subs:[] },{ main:'Classify each supplier:', subs:['LCRB — Lowest Calculated Responsive Bid','SCRB — Second Lowest','1st LCB, 2nd LCB — other ranked compliant bidders','Non-Compliant — did not meet specifications','No Bid — no quotation submitted'] },{ main:'If 1 LOT with many items and some non-compliant, the entire lot is FAILED.', subs:[] },{ main:'Contact LCRB to request: COR, Business Permit, PhilGEPS Certificate, Omnibus Sworn Statement.', subs:[] }], nodes:[{ type:'error', title:'When SVP Fails', items:['If only 1 compliant supplier submitted, procurement is FAILED.','If a LOT has non-compliant items, the whole LOT fails.','Document failure — cite RA 9184 §41 / IRR Rule X §41.','Failed procurements NOT in the PMR.'] }] },
  { id:'v5', cat:'SVP', title:'TWG Evaluation & Declaration of Winner', icon:CheckCircle2, tc:'border-emerald-400', color:'border-emerald-500/40 bg-emerald-500/5', hc:'bg-emerald-500/10', bc:'bg-emerald-500/20 text-emerald-300', desc:'TWG and End User evaluate winning supplier\'s specs; declare winner.', legal:[{ law:'ra9184', sec:'14', note:'TWG evaluation is under BAC supervision. Results form the basis for post-qualification.' },{ law:'irr', sec:'Rule VIII §30', note:'TWG evaluation must be documented and forms part of the procurement record.' }], tasks:[{ main:'Coordinate with the TWG and End User for evaluation of technical specifications and samples.', subs:[] },{ main:'Document the evaluation results in the appropriate form.', subs:[] },{ main:'Officially declare the winning supplier based on evaluation result.', subs:[] }], nodes:[{ type:'warning', title:'Evaluation Notes', items:['Evaluation is conducted by the TWG — BAC Secretariat assists and documents.','If LCRB specs are non-compliant, proceed to SCRB.','Document all decisions — may be requested during audit.'] }] },
  { id:'v6', cat:'SVP', title:'BAC Resolution, NOA & NTP', icon:BookMarked, tc:'border-emerald-400', color:'border-emerald-500/40 bg-emerald-500/5', hc:'bg-emerald-500/10', bc:'bg-emerald-500/20 text-emerald-300', desc:'Prepare and finalize award documents with RA 9184 §53.9 as legal basis.', legal:[{ law:'ra9184', sec:'37', note:'NOA timelines: issued within 3 days of BAC Resolution approval. Supplier accepts within 7 days.' },{ law:'ra9184', sec:'41', note:'For FAILED SVP: BAC Resolution must cite Sec. 41.' },{ law:'ra9184', sec:'53.9', note:'BAC Resolution for SVP must cite Sec. 53.9 as the legal basis.' },{ law:'ra12009', sec:'20', note:'If applicable, also cite RA 12009 Sec. 20 which updates SVP provisions.' },{ law:'irr', sec:'Rule IX §37', note:'NOA must be issued within 3 calendar days of BAC Resolution approval.' }], tasks:[{ main:'Edit template documents (BAC Resolution, NOA, NTP): project title, PR number, supplier name, dates, ABC, contract amount.', subs:[] },{ main:'For BAC Resolution: cite RA 9184 Section 53.9 (or RA 12009 Sec. 20) as the legal basis.', subs:[] },{ main:'For failed procurement: cite RA 9184 Section 41 and the specific reason.', subs:[] }], mu:['"BAC Reso" column → today\'s date','Remarks → "For P.O."','"Supplier" column → winning supplier name','Notes → your name'], nodes:[{ type:'note', title:'Document Verification', items:['Confirm correct PR Number, project title, supplier name.','Contract amount must match the LCRB\'s quoted total.','Dates on NOA and NTP must align with the procurement timeline.'] }] },
  { id:'v7', cat:'SVP', title:'Document Routing for Signatures', icon:Users, tc:'border-emerald-400', color:'border-emerald-500/40 bg-emerald-500/5', hc:'bg-emerald-500/10', bc:'bg-emerald-500/20 text-emerald-300', desc:'Route BAC Resolution, Abstract, and related documents for all required signatures.', legal:[{ law:'ra9184', sec:'13', note:'All BAC Members must sign — Sec. 13 defines composition and authority.' },{ law:'ra9184', sec:'14', note:'Recommendation of award documented through signatures.' }], tasks:[{ main:'BAC Secretariat Head initials first.', subs:[] },{ main:'End User (GSD, HRD, EEMD, BDD, MISD, or OAPIA).', subs:[] },{ main:'BAC Member 1 (FD) — Proof of Service must be canvasser-signed first.', subs:[] },{ main:'Provisional Member (CPD).', subs:[] },{ main:'Vice Chairperson (RALMD).', subs:[] },{ main:'BAC Member 3 (VACRD) — Proof of Attendance required if dates present.', subs:[] },{ main:'BAC Member 2 (LSD — Attorney): "Excuse me Attorney, Good Afternoon. [Your Full Name], an Intern from the BAC Office, asking to sign for RFQ, Abstract, and Proof of Service, then BAC Resolution regarding [Procurement Root Word]."', subs:[] },{ main:'Chairperson (EAD) — also for Endorsement and Initial for Accounting.', subs:[] },{ main:'For ABC above ₱50,000: Accounting Division.', subs:[] },{ main:'Verify all signatures on Abstract and BAC Reso; initials on RFQ, Proof of Service, and attachments.', subs:[] }], nodes:[{ type:'tip', title:'Routing Order', items:['BAC Sec Head → End User → BAC Member 1 → Provisional Member → Vice Chair → BAC Member 3 → BAC Member 2 → Chairperson → Accounting (above ₱50K).','Always carry a pen.','Proof of Service canvasser-signed before BAC Member 1.'] },{ type:'error', title:'Do Not Skip', items:['Never route out of order.','Accounting mandatory for above ₱50K.','Complete all signatures before forwarding to GSD.'] }] },
];

const RB = [  // Regular Bidding steps
  { id:'rb1', cat:'REG. BIDDING', title:'Pre-Procurement Conference', icon:Megaphone, tc:'border-rose-400', color:'border-rose-500/40 bg-rose-500/5', hc:'bg-rose-500/10', bc:'bg-rose-500/20 text-rose-300', desc:'Conduct Pre-Procurement Conference via Zoom before bidding begins.', analogy:"Like a project kick-off meeting — everyone aligns on scope, rules, and requirements before the official start.", legal:[{ law:'ra9184', sec:'20', note:'Pre-Procurement Conference is REQUIRED for all competitive bidding above the threshold. BAC must review terms before advertising.' },{ law:'irr', sec:'Rule VII §20', note:'IRR specifies what must be covered: project specs, procurement schedule, and bidding documents review.' }], tasks:[{ main:'Use official Procurement Gmail: procurement@piamo.gov.ph / PIABACSEC2025@', subs:[] },{ main:'Prepare all documents and presentation materials before the meeting.', subs:[] },{ main:'Start setup 15–20 minutes before scheduled time.', subs:[] },{ main:'Turn on the Portable Recorder.', subs:[] },{ main:'Share screen during presentation only.', subs:[] },{ main:'Start Zoom recording when presentation begins (or per BAC Secretariat Head\'s instruction).', subs:[] },{ main:'In Zoom Chat send: "Good Morning! Kindly type your name, location, and device used for attendance purposes. Thank you!" — resend periodically.', subs:[] },{ main:'When discussing document images: Ctrl + Scroll Up to zoom in; Ctrl + Click to unzoom.', subs:[] },{ main:'After presentation, wait for questions in Zoom Chat.', subs:[] },{ main:'Before ending: take a screenshot of the entire Zoom Chat window for online attendance.', subs:[] },{ main:'Turn off Audio and Video, End Recording, End Meeting.', subs:[] }], nodes:[{ type:'tip', title:'Meeting Tech Tips', items:['Start 15–20 minutes early — troubleshoot before participants join.','Ctrl + Scroll Up to zoom into documents; Ctrl + Click to unzoom.','Screenshot full Zoom Chat BEFORE ending — cannot retrieve after.','Save recording immediately to BAC Office shared storage.'] }] },
  { id:'rb2', cat:'REG. BIDDING', title:'PhilGEPS Posting & Invitation to Bid', icon:Send, tc:'border-rose-400', color:'border-rose-500/40 bg-rose-500/5', hc:'bg-rose-500/10', bc:'bg-rose-500/20 text-rose-300', desc:'Post the Invitation to Bid on PhilGEPS and Bulletin Board.', legal:[{ law:'ra9184', sec:'21', note:'ITB must be posted on PhilGEPS for at least 7 calendar days. Mandatory for Regular Bidding.' },{ law:'ra12009', sec:'14', note:'RA 12009 strengthens PhilGEPS as primary platform — compliance strictly enforced.' },{ law:'irr', sec:'Rule VII §21', note:'IRR specifies minimum advertisement period and mandatory ITB contents.' }], tasks:[{ main:'Prepare the Invitation to Bid (ITB) with all required procurement details.', subs:[] },{ main:'Post the ITB on PhilGEPS — mandatory for Regular Bidding.', subs:[] },{ main:'Post on the official Bulletin Board simultaneously.', subs:[] },{ main:'Observe the mandatory advertisement period before accepting bids.', subs:[] }], mu:['"Published" column → today\'s date','Remarks → "For Bidding"','Notes → your name'], nodes:[{ type:'error', title:'PhilGEPS is MANDATORY', items:['Regular Bidding ALWAYS requires PhilGEPS posting — no exceptions.','Advertisement period must be observed before accepting bids.','Save proof of PhilGEPS posting (screenshots, reference numbers).'] }] },
  { id:'rb3', cat:'REG. BIDDING', title:'Pre-Bid Conference', icon:Megaphone, tc:'border-rose-400', color:'border-rose-500/40 bg-rose-500/5', hc:'bg-rose-500/10', bc:'bg-rose-500/20 text-rose-300', desc:'Conduct Pre-Bid Conference via Zoom for prospective bidders.', legal:[{ law:'ra9184', sec:'22', note:'Must be held at least 12 days before bid submission deadline. Minutes must be recorded.' },{ law:'irr', sec:'Rule VII §22', note:'Supplemental Bid Bulletins must be issued within 7 days before deadline if clarifications arise. Attendance documented.' }], tasks:[{ main:'Send Zoom invite through official Procurement Gmail.', subs:[] },{ main:'Prepare documents and presentation materials.', subs:[] },{ main:'Start setup 15–20 minutes early.', subs:[] },{ main:'Turn on Portable Recorder; start Zoom recording at presentation start.', subs:[] },{ main:'Send attendance message in Zoom Chat and resend periodically.', subs:[] },{ main:'Monitor Zoom Chat for questions from prospective bidders.', subs:[] },{ main:'Use Ctrl + Scroll Up for zooming into documents; Ctrl + Click to unzoom.', subs:[] },{ main:'Take screenshot of full Zoom Chat before ending.', subs:[] },{ main:'Turn off Audio and Video, End Recording, End Meeting.', subs:[] }], nodes:[{ type:'note', title:'Supplemental Bulletins', items:['If bidders raise clarifications, issue a Supplemental Bulletin formally.','Must be posted on PhilGEPS and distributed to all bidders.','Must be issued at least 7 days before the deadline.'] }] },
  { id:'rb4', cat:'REG. BIDDING', title:'Bid Opening', icon:Gavel, tc:'border-rose-400', color:'border-rose-500/40 bg-rose-500/5', hc:'bg-rose-500/10', bc:'bg-rose-500/20 text-rose-300', desc:'Formally open sealed bid documents in public; encode passed/failed results.', analogy:"Like a formal sealed-bid auction — envelopes opened in public with witnesses, documents checked, results recorded in real time.", legal:[{ law:'ra9184', sec:'25', note:'Bids after deadline are automatically disqualified. Bid opening is public.' },{ law:'ra9184', sec:'26', note:'Bids may not be modified after the deadline.' },{ law:'ra9184', sec:'63', note:'Observers (COA, NGO) must attend. COA attends via Zoom.' },{ law:'irr', sec:'Rule VII §25', note:'Two-envelope system applies. BAC Secretariat records passed/failed in Opening of Bids spreadsheet.' }], tasks:[{ main:'Set up Zoom Meeting — start screen sharing and recording.', subs:[] },{ main:'Monitor Zoom Chat: ask attendees for name, company name, location, and device used.', subs:[] },{ main:'Take attendance for all physically present committee members and suppliers.', subs:[] },{ main:'Open sealed bid envelopes. Distribute documents to committee members for review.', subs:[] },{ main:'Encode results in Opening of Bids Spreadsheet — mark each item as "Passed" or "Failed" per document.', subs:[] },{ main:'Validate and qualify each bidder — if one fails, proceed to next supplier.', subs:[] },{ main:'If a qualified bidder offers a discount, compute final bid:', subs:['Bid Amount = submitted bid','2.5% Discount = Bid Amount × 0.025','Net Bid Amount = Bid Amount − Discount Amount'] },{ main:'Declare LCRB, 1st LCB, 2nd LCB, and so on in ranked order.', subs:[] }], nodes:[{ type:'warning', title:'Bid Opening Rules', items:['All bid envelopes must be opened in public — never open in advance.','Late bids are automatically disqualified — record the reason.','If only 1 bidder submits, declare failed bidding.','Zoom recording must run for the entire bid opening — COA attends remotely.'] },{ type:'error', title:'Failed Bidding', items:['If no compliant bids submitted, declare failed bidding.','Document in BAC Resolution with RA 9184 Sec. 41 as legal basis.','Coordinate with BAC Secretariat Head for re-bidding procedures.'] }] },
  { id:'rb5', cat:'REG. BIDDING', title:'TWG Evaluation', icon:Search, tc:'border-rose-400', color:'border-rose-500/40 bg-rose-500/5', hc:'bg-rose-500/10', bc:'bg-rose-500/20 text-rose-300', desc:'TWG formally evaluates technical bids via a Zoom meeting.', legal:[{ law:'ra9184', sec:'14', note:'TWG conducts technical evaluation under BAC supervision. Results form basis for post-qualification.' },{ law:'irr', sec:'Rule VIII §30', note:'TWG evaluation must be documented. If LCRB fails, move to 1st LCB.' }], tasks:[{ main:'Set up Zoom Meeting — start screen sharing and recording.', subs:[] },{ main:'Take attendance of all committee members.', subs:[] },{ main:'TWG members present evaluation results — assist as needed.', subs:[] },{ main:'Assist with other document signing as required.', subs:[] }], nodes:[{ type:'note', title:'TWG Notes', items:['TWG leads the evaluation — BAC Secretariat supports and documents.','If LCRB is non-compliant, proceed to 1st LCB.','Document all evaluation decisions.'] }] },
  { id:'rb6', cat:'REG. BIDDING', title:'Post-Qualification', icon:CheckCircle2, tc:'border-rose-400', color:'border-rose-500/40 bg-rose-500/5', hc:'bg-rose-500/10', bc:'bg-rose-500/20 text-rose-300', desc:'Final verification of the LCRB\'s eligibility and bid documents.', analogy:"Like a final background check — verifying all credentials are authentic before issuing the official offer letter.", legal:[{ law:'ra9184', sec:'34', note:'Sec. 34 mandates post-qualification — verifies legal, technical, and financial eligibility of the LCRB.' },{ law:'ra12009', sec:'35', note:'RA 12009 strengthens penalties for document falsification discovered during post-qualification.' },{ law:'irr', sec:'Rule VIII §34', note:'Exact documents required: Mayor\'s/Business Permit, COR, PhilGEPS Certificate, Omnibus Sworn Statement, Tax Returns (above threshold).' }], tasks:[{ main:'Review and validate the LCRB\'s eligibility and bid documents for authenticity and completeness.', subs:[] },{ main:'Edit the Post-Qualification Report template with procurement and bidder details.', subs:[] },{ main:'Formally declare bidder as Qualified or Disqualified and document the result.', subs:[] },{ main:'If disqualified, proceed to 1st LCB and conduct post-qualification again.', subs:[] }], nodes:[{ type:'warning', title:'Post-Qualification Checklist', items:['Verify: COR, Business Permit, PhilGEPS Certificate, Omnibus Sworn Statement.','All documents must be valid and not expired.','If LCRB is disqualified, move to next qualified bidder — do not cancel immediately.','Document all disqualification reasons clearly.'] }] },
  { id:'rb7', cat:'REG. BIDDING', title:'BAC Resolution, NOA & NTP', icon:BookMarked, tc:'border-rose-400', color:'border-rose-500/40 bg-rose-500/5', hc:'bg-rose-500/10', bc:'bg-rose-500/20 text-rose-300', desc:'Prepare all award documents citing RA 9184 §10 as legal basis.', legal:[{ law:'ra9184', sec:'10', note:'Regular Bidding BAC Resolution cites Sec. 10 — competitive bidding as the legal mode used.' },{ law:'ra9184', sec:'37', note:'NOA must be issued within 3 days of BAC Resolution approval.' },{ law:'ra9184', sec:'41', note:'For FAILED bidding: cite Sec. 41 in the BAC Resolution.' },{ law:'irr', sec:'Rule IX §37', note:'NOA timeline: 3 calendar days from approval. Supplier acceptance: 7 calendar days.' }], tasks:[{ main:'Edit template documents (BAC Resolution, NOA, NTP): project title, PR number, bidder name, dates, ABC, contract amount.', subs:[] },{ main:'For BAC Resolution: cite RA 9184 Section 10 (competitive bidding) as the legal basis.', subs:[] },{ main:'For failed bidding: cite RA 9184 Section 41 and the specific reason.', subs:[] }], mu:['"BAC Reso" column → today\'s date','Remarks → "For P.O."','"Supplier" column → winning bidder name','Notes → your name'], nodes:[{ type:'note', title:'Legal Basis Reference', items:['Cite specific Section of RA 9184 or RA 12009 — vague references not acceptable.','For Regular Bidding: Sec. 10 (competitive bidding is the rule).','BAC Secretariat Head can guide on which provision applies.'] }] },
  { id:'rb8', cat:'REG. BIDDING', title:'Contract Signing & Bound Document Copies', icon:Printer, tc:'border-rose-400', color:'border-rose-500/40 bg-rose-500/5', hc:'bg-rose-500/10', bc:'bg-rose-500/20 text-rose-300', desc:'Compile, certify, and distribute bound copies to COA, Accounting, End User.', analogy:"Like assembling a complete legal binder for a real estate transaction — every document organized, certified, and signed before official registration.", legal:[{ law:'ra9184', sec:'37', note:'Contract must be formally executed after NOA is accepted. Bound copies are the official record.' },{ law:'ra9184', sec:'63', note:'COA must receive a copy — fulfilled by distributing bound copies to COA.' },{ law:'irr', sec:'Rule XX', note:'IRR mandates proper archiving for 10 years — bound copies are the physical archive.' }], tasks:[{ main:'Photocopy all original documents — up to 4 copies for: End User, Accounting, COA, and BAC Copy.', subs:[] },{ main:'Print Document Checklist and page identification labels (A, B, C…) — print 4 copies.', subs:[] },{ main:'Stamp "CERTIFIED TRUE COPY" on each document and write the certification date.', subs:[] },{ main:'All certified copies must be signed by the BAC Secretariat Head.', subs:[] },{ main:'Punch holes in all compiled documents.', subs:[] },{ main:'Insert into Blue Binder through the fastener.', subs:[] },{ main:'Attach tabs/labels with letters (A, B, C…) on each printed identification checklist page.', subs:[] },{ main:'Print Transmittal Letter for each copy — addressed to Supplier, End User, COA, and Accounting.', subs:[] },{ main:'Route Transmittal Letter to BAC Secretariat Head for initial.', subs:[] },{ main:'Route to BAC Chairperson for e-signature or wet signature.', subs:[] },{ main:'Sign the checklist with the BAC Secretariat Head.', subs:[] },{ main:'Attach Transmittal Letter and Checklist to bound copies.', subs:[] },{ main:'Print a label, attach, and forward to End User, COA, and Accounting.', subs:[] },{ main:'Use the Outgoing Documents Log Book to record receipt by COA, Accounting, and End User.', subs:[] }], nodes:[{ type:'warning', title:'Bound Copy Requirements', items:['All stamps must be signed by BAC Secretariat Head — unsigned stamps are invalid.','Prepare all 4 copies at once — do not release incomplete sets.','Alphabetical tabs (A, B, C…) must match the Document Checklist.','Use the Outgoing Documents Log Book — this is the official receipt record.'] },{ type:'tip', title:'Efficiency Tips', items:['Stamp all documents at once before signing — group the task.','Punch holes in batches sorted by tab letter.','Keep the Blue Binder neat — auditors inspect these.'] }] },
  { id:'rb9', cat:'REG. BIDDING', title:'Document Routing for Signatures', icon:Users, tc:'border-rose-400', color:'border-rose-500/40 bg-rose-500/5', hc:'bg-rose-500/10', bc:'bg-rose-500/20 text-rose-300', desc:'Route all documents through the full signatory chain; Accounting always required.', legal:[{ law:'ra9184', sec:'13', note:'All BAC Members must sign — Sec. 13 defines their composition and authority.' },{ law:'ra9184', sec:'14', note:'Recommendation of award documented through signatures.' }], tasks:[{ main:'BAC Secretariat Head initials first.', subs:[] },{ main:'End User (GSD, HRD, EEMD, BDD, MISD, or OAPIA).', subs:[] },{ main:'BAC Member 1 (FD).', subs:[] },{ main:'Provisional Member (CPD).', subs:[] },{ main:'Vice Chairperson (RALMD).', subs:[] },{ main:'BAC Member 3 (VACRD) — Proof of Attendance required if dates present.', subs:[] },{ main:'BAC Member 2 (LSD — Attorney): use proper introduction.', subs:[] },{ main:'Chairperson (EAD) — also for Endorsement and Initial for Accounting.', subs:[] },{ main:'Accounting Division — ALWAYS required for Regular Bidding (always above ₱1M).', subs:[] },{ main:'Verify all signatures before compiling bound copies.', subs:[] }], nodes:[{ type:'note', title:'Accounting Always Required', items:['Regular Bidding is always ₱1M and above — Accounting signature is always required.','Do not forward to GSD or compile bound copies without Accounting signature.','Always carry a pen.'] }] },
];

const ADD = [
  { id:'add1', cat:'ADDITIONAL', title:'Attaching Proof of Attendance / Meals', icon:Camera, tc:'border-orange-400', color:'border-orange-500/40 bg-orange-500/5', hc:'bg-orange-500/10', bc:'bg-orange-500/20 text-orange-300', desc:'Document meal expenses with photos and receipts for liquidation.', analogy:"Like attaching your receipts to an expense reimbursement form — photos and receipts prove the activity occurred.", legal:[{ law:'irr', sec:'Rule III §14', note:'BAC Secretariat is responsible for maintaining complete procurement records — proof of meals and attendance for official meetings is part of this.' }], tasks:[{ main:'Compile photos taken during the meeting (lunch or snack photos) as visual proof.', subs:[] },{ main:'Paste the official receipt(s) neatly on a bond paper.', subs:[] },{ main:'Photocopy the bond paper with receipt — make 2 copies.', subs:[] },{ main:'Attach photos and receipt copies to the meeting documentation or liquidation report.', subs:[] }], nodes:[{ type:'warning', title:'Proof Requirements', items:['Both photos AND official receipts are required — one without the other is insufficient.','Receipts must be official (with BIR registration).','Photos should clearly show the meeting context.'] }] },
];

/* ══════════════════════════════════════════════════════════════
   SHEET LINKS
══════════════════════════════════════════════════════════════ */
const SHEETS = [
  { label:'PR Logging Sheet', desc:'Log PRs, generate PR numbers.', icon:ClipboardCheck, color:'from-blue-600/20 to-blue-800/10 border-blue-500/30 hover:border-blue-400/60', badge:'bg-blue-500/15 text-blue-300', url:'https://docs.google.com/spreadsheets/d/1H5IDE5TKXM2HXcQ-kcKK3BA_JkGiqQVR8yoXo8L9p6E/edit?gid=1039687665#gid=1039687665' },
  { label:'Procurement Monitoring', desc:'Track procurement status end-to-end.', icon:BarChart2, color:'from-indigo-600/20 to-indigo-800/10 border-indigo-500/30 hover:border-indigo-400/60', badge:'bg-indigo-500/15 text-indigo-300', url:'https://docs.google.com/spreadsheets/d/1VYI9G49VEvogsHHD9pyOJ8NLkf-7spU7GSpPTwAMx84/edit?gid=1943246738#gid=1943246738' },
  { label:'PMR (Monitoring Report)', desc:'Quarterly GPPB required report.', icon:FileSpreadsheet, color:'from-violet-600/20 to-violet-800/10 border-violet-500/30 hover:border-violet-400/60', badge:'bg-violet-500/15 text-violet-300', url:'https://docs.google.com/spreadsheets/d/1hUMv_yzk1ON4JNij9WV6zH5VB9hW0o0t/edit?gid=519805908#gid=519805908' },
];

const TABS = [
  { id:'overview',   label:'Overview',    icon:Layers    },
  { id:'shopping',   label:'Shopping',    icon:Package   },
  { id:'svp',        label:'SVP',         icon:FileText  },
  { id:'rb',         label:'Reg. Bidding',icon:Gavel     },
  { id:'additional', label:'Additional',  icon:Star      },
];

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
export default function ProcurementProcessFlow() {
  const [tab, setTab] = useState('overview');
  const [legalModal, setLegalModal] = useState(null);
  const [showFlowchart, setShowFlowchart] = useState(false);

  return (
    <div className="p-4 md:p-6 max-w-[900px] mx-auto space-y-5">
      {legalModal && <LegalModal lawId={legalModal} onClose={() => setLegalModal(null)} />}
      {showFlowchart && <FlowchartModal onClose={() => setShowFlowchart(false)} />}

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h1 className="text-xl font-black text-white">Procurement Process Flow</h1>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">Complete step-by-step guide for BAC Secretariat staff. Covers Shopping, SVP, and Regular Bidding with embedded legal references to RA 9184, RA 12009, and the IRR.</p>

        {/* Action buttons row */}
        <div className="flex flex-wrap gap-2 pt-1">
          {/* Flowchart */}
          <button onClick={() => setShowFlowchart(true)}
            className="flex items-center gap-1.5 text-[10px] font-black tracking-wider px-3 py-1.5 rounded-lg border bg-slate-700/40 border-slate-600/50 text-slate-200 hover:bg-slate-700/70 transition">
            <Network className="w-3 h-3" />View Flowchart
          </button>
          {/* Law buttons */}
          {[
            { id:'ra9184',  label:'RA 9184',  icon:Scale,      cls:'bg-indigo-500/12 text-indigo-300 border-indigo-500/25 hover:bg-indigo-500/22' },
            { id:'ra12009', label:'RA 12009', icon:ScrollText, cls:'bg-violet-500/12 text-violet-300 border-violet-500/25 hover:bg-violet-500/22' },
            { id:'irr',     label:'IRR',      icon:BookText,   cls:'bg-teal-500/12 text-teal-300 border-teal-500/25 hover:bg-teal-500/22' },
          ].map(l => { const LI = l.icon; return (
            <button key={l.id} onClick={() => setLegalModal(l.id)} className={`flex items-center gap-1.5 text-[10px] font-black tracking-wider px-3 py-1.5 rounded-lg border transition ${l.cls}`}>
              <LI className="w-3 h-3" />{l.label}
            </button>
          ); })}
        </div>
      </div>

      {/* Sheets */}
      <div>
        <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-2.5 flex items-center gap-1.5"><Star className="w-3 h-3" />Quick Access — Google Sheets</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SHEETS.map(s => { const SI = s.icon; return (
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
              className={`group flex flex-col gap-2 p-3.5 rounded-xl border bg-gradient-to-br ${s.color} transition hover:-translate-y-0.5`}>
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider self-start ${s.badge}`}><SI className="w-3 h-3" />SHEET</span>
              <div><p className="text-xs font-bold text-slate-100">{s.label}</p><p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{s.desc}</p></div>
              <span className="flex items-center gap-1 text-[10px] text-slate-500 group-hover:text-slate-300 transition mt-auto"><ExternalLink className="w-3 h-3" />Open</span>
            </a>
          ); })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap bg-[#09091a] border border-[#1a1a30] rounded-xl p-1">
        {TABS.map(t => { const TI = t.icon; const a = tab === t.id; return (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${a ? 'bg-slate-700/80 text-white border border-slate-600/60' : 'text-slate-500 hover:text-slate-300'}`}>
            <TI className="w-3 h-3" />{t.label}
          </button>
        ); })}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-slate-400" /><h2 className="text-sm font-bold text-slate-200">Process Overview</h2></div>
            <button onClick={() => setShowFlowchart(true)} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-200 transition border border-slate-700 rounded-lg px-2.5 py-1.5">
              <Network className="w-3 h-3" />Open Full Flowchart
            </button>
          </div>

          {/* Overview cards */}
          <div className="space-y-2">
            {[
              { step:'1–4', label:'Common Steps (All Modes)', desc:'PR Logging → Budget Certification (Optional) → PR for Action → PR Deliberation', color:'border-indigo-500/30 bg-indigo-500/6', badge:'bg-indigo-500/20 text-indigo-300' },
              { step:'↓', label:'Mode Branch Point', desc:'BAC determines applicable mode based on ABC amount and procurement circumstances', color:'border-slate-500/30 bg-slate-500/6', badge:'bg-slate-500/20 text-slate-400' },
            ].map((c, i) => (
              <div key={i} className={`rounded-xl border p-3.5 ${c.color}`}>
                <div className="flex items-center gap-2 mb-1"><span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded ${c.badge}`}>{c.step}</span><p className="text-xs font-bold text-slate-200">{c.label}</p></div>
                <p className="text-[11px] text-slate-500">{c.desc}</p>
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { mode:'Shopping', sub:'RA 9184 §52 · Non-Availability Cert required · No PhilGEPS', steps:['RFQ Prep','RFQ Distribution','Abstract Eval','BAC Reso/NOA/NTP','Routing'], color:'border-sky-500/30 bg-sky-500/6', badge:'bg-sky-500/20 text-sky-300', btn:'Shopping' },
                { mode:'SVP', sub:'RA 9184 §53.9 · ₱50K–₱1M range · PhilGEPS if >₱50K', steps:['RFQ Prep','Posting','RFQ Opening','Abstract Eval','TWG Eval','BAC Reso/NOA/NTP','Routing'], color:'border-emerald-500/30 bg-emerald-500/6', badge:'bg-emerald-500/20 text-emerald-300', btn:'SVP' },
                { mode:'Regular Bidding', sub:'RA 9184 §10 · ₱1M and above · Full process', steps:['Pre-Procurement Conf','PhilGEPS/ITB','Pre-Bid Conf','Bid Opening','TWG Eval','Post-Qual','BAC Reso/NOA/NTP','Contract Signing','Routing'], color:'border-rose-500/30 bg-rose-500/6', badge:'bg-rose-500/20 text-rose-300', btn:'rb' },
              ].map((m, i) => (
                <div key={i} className={`rounded-xl border p-3 ${m.color}`}>
                  <div className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded inline-block mb-1.5 ${m.badge}`}>{m.mode}</div>
                  <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">{m.sub}</p>
                  <div className="space-y-1">
                    {m.steps.map((s, si) => (
                      <div key={si} className="flex items-center gap-1.5">
                        <span className="text-[8px] font-black text-slate-600 w-3">{si + 1}</span>
                        <p className="text-[10px] text-slate-400">{s}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setTab(m.btn === 'rb' ? 'rb' : m.btn.toLowerCase())}
                    className={`mt-2.5 w-full text-[9px] font-bold py-1.5 rounded-lg border transition ${m.badge} border-current hover:opacity-80`}>
                    View Full Flow →
                  </button>
                </div>
              ))}
            </div>

            <div className={`rounded-xl border p-3.5 border-slate-500/30 bg-slate-500/6`}>
              <div className="flex items-center gap-2 mb-1"><span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded bg-slate-500/20 text-slate-400`}>FINAL</span><p className="text-xs font-bold text-slate-200">Common Final Steps (All Modes)</p></div>
              <p className="text-[11px] text-slate-500">Abstract for PO → Forward to GSD → Purchase Order → PMR Report → Archive & File Tracking</p>
            </div>
          </div>

          {/* Legal quick access */}
          <div className="pt-2 border-t border-[#1a1a30]">
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">Legal Reference — Quick Access</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id:'ra9184', label:'RA 9184', sub:'Gov\'t Procurement Reform Act', note:'Foundational law · All modes · BAC system · Sections 10, 41, 48, 52, 53.9', icon:Scale, c:'border-indigo-500/30 bg-indigo-500/6 text-indigo-300' },
                { id:'ra12009', label:'RA 12009', sub:'New Gov\'t Procurement Act', note:'Updated thresholds · Digital-first · PhilGEPS primary · Sections 10, 14, 20, 35, 40', icon:ScrollText, c:'border-violet-500/30 bg-violet-500/6 text-violet-300' },
                { id:'irr', label:'IRR', sub:'Implementing Rules & Regulations', note:'Operational procedures · Timelines · Forms · Document requirements', icon:BookText, c:'border-teal-500/30 bg-teal-500/6 text-teal-300' },
              ].map(l => { const LI = l.icon; return (
                <button key={l.id} onClick={() => setLegalModal(l.id)} className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${l.c}`}>
                  <LI className="w-4 h-4 mb-2" />
                  <p className="text-xs font-black">{l.label}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{l.sub}</p>
                  <p className="text-[9px] mt-2 opacity-50 flex items-center gap-1"><BookOpen className="w-2.5 h-2.5" />{l.note}</p>
                </button>
              ); })}
            </div>
          </div>
        </div>
      )}

      {tab === 'shopping' && (
        <ProcessSection title="Shopping Mode — Full Process Flow" subtitle="Certificate of Non-Availability of Stocks required · Legal basis: RA 9184 §52 · IRR Rule XVI §52" icon={Package} ac="border-sky-500/40" steps={[...SB, ...SH, ...SA]} onOpenLegal={setLegalModal} />
      )}
      {tab === 'svp' && (
        <ProcessSection title="SVP (Small Value Procurement) — Full Process Flow" subtitle="₱50K and below (applicable) and above ₱50K up to below ₱1M · Legal basis: RA 9184 §53.9 / RA 12009 §20" icon={FileText} ac="border-emerald-500/40" steps={[...SB, ...SV, ...SA]} onOpenLegal={setLegalModal} />
      )}
      {tab === 'rb' && (
        <ProcessSection title="Regular Bidding — Full Process Flow" subtitle="Mandatory for ₱1,000,000 and above · Legal basis: RA 9184 §10 · Requires Pre-Procurement and Pre-Bid Conferences" icon={Gavel} ac="border-rose-500/40" steps={[...SB, ...RB, ...SA]} onOpenLegal={setLegalModal} />
      )}
      {tab === 'additional' && (
        <ProcessSection title="Additional Procedures" subtitle="Supplementary tasks required in specific situations" icon={Star} ac="border-orange-500/40" steps={ADD} onOpenLegal={setLegalModal} />
      )}

      {/* Footer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#09091a] border border-[#1a1a30]">
        <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          This guide is based on actual BAC Secretariat workflows and references RA 9184, RA 12009, and their IRR. Legal section references are for guidance purposes — always verify the current text of the law and latest GPPB resolutions. Consult your BAC Secretariat Head for official interpretations.
        </p>
      </div>
    </div>
  );
}