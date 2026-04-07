import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronRight, ChevronLeft,
    Play, Pause, X, Home, Filter, Info, Layers
} from 'lucide-react';

/* ═══════════════════════════════════════════
   NODE DEFINITIONS
═══════════════════════════════════════════ */
interface NodeDef {
    id: string;
    x: number;
    y: number;
    type: 'start-end' | 'common' | 'svp' | 'rb' | 'decision' | 'optional';
    path: 'common' | 'svp' | 'rb';
    phase: string;
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    responsible?: Array<{ role: string; desc: string }>;
    tip?: string;
    docs?: string[];
    next: string[];
}

const NODES: NodeDef[] = [
    {
        id: 'START', x: 110, y: 60, type: 'start-end', path: 'common', phase: 'Initiation',
        badge: 'START', title: 'Start Procurement Process',
        subtitle: 'End User identifies a procurement need',
        description: 'The procurement process begins when an End User (any division or office) identifies a need for goods, services, or equipment. They prepare a Purchase Request (PR) and submit it to the BAC Secretariat.',
        responsible: [{ role: 'End User', desc: 'Identifies need and prepares the Purchase Request' }, { role: 'BAC Secretariat', desc: 'Receives and logs the incoming PR' }],
        tip: 'Always ensure the PR is complete with all required signatures before logging. An incomplete PR will be returned and will delay the process.',
        next: ['PR_LOG']
    },
    {
        id: 'PR_LOG', x: 110, y: 220, type: 'common', path: 'common', phase: 'PR Processing',
        badge: 'PR LOGGING', title: 'PR Logging',
        subtitle: 'Receive, stamp, number, and log the PR',
        description: 'The BAC Secretariat receives the PR, assigns a PR Number from the PR Google Sheet, stamps the received date and time on the back of the form, and routes it to the BAC Secretariat Head for signature.',
        responsible: [{ role: 'BAC Secretariat', desc: 'Logs, stamps, and numbers the PR; routes for signature' }, { role: 'End User', desc: 'Submits the signed PR and waits for it to be processed' }],
        tip: 'If the End User cannot wait, log the PR Out with the appropriate note and stamp. This is the exception, not the rule.',
        docs: ['PR Form', 'PR Google Sheet'],
        next: ['BUDGET_Q']
    },
    {
        id: 'BUDGET_Q', x: 110, y: 400, type: 'decision', path: 'common', phase: 'PR Processing',
        badge: 'DECISION', title: 'Budget Certification Needed?',
        subtitle: 'Does the End User request BAC to facilitate budget?',
        description: 'Normally, End Users handle their own budget submission. This step only applies if they request BAC Secretariat assistance in forwarding to the Budget Division for fund certification.',
        responsible: [{ role: 'End User', desc: 'Decides if they need help routing to Budget Division' }],
        next: ['BUDGET', 'PR_ACTION']
    },
    {
        id: 'BUDGET', x: -200, y: 400, type: 'optional', path: 'common', phase: 'PR Processing',
        badge: 'OPTIONAL', title: 'Budget Certification',
        subtitle: 'Forward PR to Budget Division for fund allocation',
        description: 'The BAC Secretariat forwards or accompanies the PR to the Budget Division who certifies the availability of funds by attaching the Certificate of Availability of Funds (CAF). Without this, the procurement cannot legally proceed.',
        responsible: [{ role: 'Budget Division', desc: 'Certifies fund availability; attaches CAF to PR' }, { role: 'BAC Secretariat', desc: 'Facilitates routing if requested by End User' }],
        docs: ['CAF (Certificate of Availability of Funds)'],
        next: ['PR_ACTION']
    },
    {
        id: 'PR_ACTION', x: 110, y: 600, type: 'common', path: 'common', phase: 'PR Processing',
        badge: 'PR FOR ACTION', title: 'PR for Action',
        subtitle: 'Formally enter the PR into the Procurement Monitoring Google Sheet',
        description: 'Once the PR is fully signed and ready, it is entered into the Procurement Monitoring Google Sheet. The Mode of Procurement is stamped on the PR form. The BAC Secretariat Head signs the stamped PR.',
        responsible: [{ role: 'BAC Secretariat', desc: 'Enters PR data in monitoring sheet; stamps Mode of Procurement' }, { role: 'BAC Secretariat Head', desc: 'Signs the processed PR' }],
        tip: 'Shopping = attach Certificate of Non-Availability of Stocks. SVP = above ₱50K. Regular Bidding = ₱1M and above.',
        docs: ['Procurement Monitoring Sheet', 'PR Form'],
        next: ['MODE_DECISION']
    },
    {
        id: 'MODE_DECISION', x: 110, y: 800, type: 'decision', path: 'common', phase: 'Mode Determination',
        badge: 'DECISION', title: 'Mode of Procurement?',
        subtitle: 'Determine processing path based on ABC amount and mode',
        description: 'The Approved Budget for the Contract (ABC) determines which procurement mode applies. Regular Bidding is for ₱1M and above. SVP is for amounts below ₱1M with applicable conditions. Shopping has special requirements.',
        responsible: [{ role: 'BAC', desc: 'Deliberates and decides on the correct procurement mode' }, { role: 'BAC Secretariat', desc: 'Records the decision in the monitoring sheet' }],
        next: ['SVP_RFQ', 'PR_DELIB']
    },

    // ─── SVP PATH ───
    {
        id: 'SVP_RFQ', x: -210, y: 1020, type: 'svp', path: 'svp', phase: 'SVP',
        badge: 'SVP', title: 'Prepare RFQ & Abstract',
        subtitle: 'Request for Quotation — send to at least 3 suppliers',
        description: 'Prepare the RFQ spreadsheet with all item details, quantities, and delivery terms. Link the Abstract and Proof of Service worksheets to the RFQ using Excel formulas. Double-check values, spelling, borders, and format before printing.',
        responsible: [{ role: 'BAC Secretariat', desc: 'Prepares, checks, and prints the RFQ and Abstract' }, { role: 'End User', desc: 'Provides technical specifications of items needed' }],
        tip: 'For above ₱50K: Use tomorrow\'s date on the RFQ and set the deadline to 7 days after. Press Ctrl+6 if signatures are not showing.',
        docs: ['RFQ Form', 'Abstract of Quotations', 'Proof of Service'],
        next: ['SVP_POST']
    },
    {
        id: 'SVP_POST', x: -210, y: 1220, type: 'svp', path: 'svp', phase: 'SVP',
        badge: 'SVP', title: 'Post & Distribute RFQ',
        subtitle: 'Print copies, post on bulletin board, submit to canvassers',
        description: 'Print 4 copies of the RFQ and 1 Proof of Service. Attach envelopes to 3 supplier copies. Post 1 copy on the Bulletin Board. Submit 3 supplier copies and Proof of Service to the BAC Head, then to End User/Canvassers for distribution to suppliers. Post to PhilGEPS if above ₱50K.',
        responsible: [{ role: 'BAC Secretariat', desc: 'Prints, stamps, logs, and distributes RFQ copies' }, { role: 'BAC Head', desc: 'Receives and acknowledges the filed copies' }, { role: 'Canvassers/End User', desc: 'Deliver RFQ copies to suppliers' }],
        docs: ['RFQ Copies (x4)', 'Proof of Service', 'Posting Certificate'],
        next: ['SVP_OPEN']
    },
    {
        id: 'SVP_OPEN', x: -210, y: 1420, type: 'svp', path: 'svp', phase: 'SVP',
        badge: 'SVP', title: 'RFQ Opening & Canvass',
        subtitle: 'Receive and open submitted supplier quotations',
        description: 'On the deadline date, formally open the submitted quotations. Record the opening date in the Abstract. Collect and record all supplier prices in the Abstract worksheet.',
        responsible: [{ role: 'BAC Secretariat', desc: 'Opens and records submitted quotations' }, { role: 'Suppliers', desc: 'Submit sealed bid envelopes before the deadline' }],
        docs: ['Abstract of Quotations', 'Submitted Quotation Forms'],
        next: ['SVP_ABSTRACT']
    },
    {
        id: 'SVP_ABSTRACT', x: -210, y: 1620, type: 'svp', path: 'svp', phase: 'SVP',
        badge: 'SVP', title: 'Abstract Evaluation & LCRB',
        subtitle: 'Compare quotes, identify LCRB and qualified suppliers',
        description: 'Calculate total prices for each supplier. Classify suppliers as LCRB (winner), SCRB, 1st LCB, 2nd LCB, Non-Compliant, or No Bid. Contact the LCRB and request their legal documents: COR, Business Permit, PhilGEPS Certificate, and Sworn Statement.',
        responsible: [{ role: 'BAC Secretariat', desc: 'Calculates and evaluates all quoted prices' }, { role: 'BAC', desc: 'Reviews and validates the evaluation results' }],
        docs: ['Abstract of Quotations', 'Supplier Legal Documents'],
        next: ['SVP_EVAL']
    },
    {
        id: 'SVP_EVAL', x: -210, y: 1820, type: 'svp', path: 'svp', phase: 'SVP',
        badge: 'SVP', title: 'Evaluation & Declaration',
        subtitle: 'TWG and End User validate specs; declare winner',
        description: 'The Technical Working Group (TWG) and End User formally evaluate whether the winning supplier\'s offered items meet all technical specifications. Upon passing, the supplier is officially declared the winner.',
        responsible: [{ role: 'TWG', desc: 'Evaluates technical compliance of offered items' }, { role: 'End User', desc: 'Validates that the offered specs meet their requirements' }, { role: 'BAC', desc: 'Officially declares the winning supplier' }],
        next: ['RESO']
    },

    // ─── REGULAR BIDDING PATH ───
    {
        id: 'PR_DELIB', x: 430, y: 1020, type: 'rb', path: 'rb', phase: 'Regular Bidding',
        badge: 'REG. BIDDING', title: 'PR Deliberation (BAC Meeting)',
        subtitle: 'BAC formally reviews and approves the PR',
        description: 'The BAC holds a regular meeting to deliberate on submitted PRs. The BAC Secretariat sets up Zoom, manages attendance, and handles recording. After approval, BAC Members sign each approved PR.',
        responsible: [{ role: 'BAC Chairperson', desc: 'Presides over the meeting; makes final deliberation decisions' }, { role: 'BAC Members', desc: 'Review PRs and sign approved ones' }, { role: 'BAC Secretariat', desc: 'Sets up Zoom, records meeting, manages attendance and documents' }],
        tip: 'Login: procurement@piamo.gov.ph | PIABACSEC2025@. Start 15-20 mins early. Record the Zoom meeting for transparency.',
        docs: ['BAC Resolution', 'Minutes of Meeting', 'Attendance Sheet'],
        next: ['RB_PREBID']
    },
    {
        id: 'RB_PREBID', x: 430, y: 1220, type: 'rb', path: 'rb', phase: 'Regular Bidding',
        badge: 'REG. BIDDING', title: 'Pre-Bid Conference',
        subtitle: 'Set up Zoom meeting; present and discuss bidding documents',
        description: 'BAC conducts pre-procurement and pre-bid conferences via Zoom. BAC Secretariat manages all technical aspects: recording, screen sharing, chat monitoring for attendance, and document zoom-in during discussion.',
        responsible: [{ role: 'BAC Secretariat', desc: 'Manages all technical setup and documentation for Zoom conferences' }, { role: 'BAC Chairperson', desc: 'Presides and leads the discussions' }, { role: 'Observers/Bidders', desc: 'Attend and may ask clarification questions' }],
        tip: 'Use Ctrl+Scroll to zoom into document images on screen. Press Ctrl+Click to unzoom quickly.',
        docs: ['Minutes of Pre-Bid Conference', 'Bidding Documents'],
        next: ['RB_BIDOPEN']
    },
    {
        id: 'RB_BIDOPEN', x: 430, y: 1420, type: 'rb', path: 'rb', phase: 'Regular Bidding',
        badge: 'REG. BIDDING', title: 'Bid Opening',
        subtitle: 'Open sealed bids, check eligibility documents, encode results',
        description: 'Formal public opening of submitted bids. BAC Secretariat opens sealed envelopes, distributes documents to committee members, and encodes pass/fail results. If a bidder offers a discount, compute the net bid: Bid × 0.025 = discount; Net = Bid − Discount.',
        responsible: [{ role: 'BAC Secretariat', desc: 'Opens envelopes, encodes results, monitors Zoom chat' }, { role: 'BAC Members', desc: 'Evaluates each bidder\'s documents' }, { role: 'Observers', desc: 'Witness the opening for transparency' }],
        docs: ['Opening of Bids Spreadsheet', 'Bid Documents per Supplier'],
        next: ['RB_TWG']
    },
    {
        id: 'RB_TWG', x: 430, y: 1620, type: 'rb', path: 'rb', phase: 'Regular Bidding',
        badge: 'REG. BIDDING', title: 'TWG Evaluation',
        subtitle: 'Technical Working Group evaluates technical proposals',
        description: 'The TWG formally evaluates the technical components of the LCRB\'s bid. BAC Secretariat sets up Zoom and recording. TWG members present their findings. Results are documented and used for the Post-Qualification declaration.',
        responsible: [{ role: 'TWG', desc: 'Presents and documents technical evaluation results' }, { role: 'BAC Secretariat', desc: 'Sets up Zoom, records meeting, manages attendance' }],
        next: ['RB_POSTQ']
    },
    {
        id: 'RB_POSTQ', x: 430, y: 1820, type: 'rb', path: 'rb', phase: 'Regular Bidding',
        badge: 'REG. BIDDING', title: 'Post-Qualification',
        subtitle: 'Final verification of LCRB documents and qualification',
        description: 'The BAC formally validates the winning bidder\'s submitted documents for authenticity and completeness. The Post-Qualification Report template is edited with procurement-specific details. The bidder is declared qualified or disqualified.',
        responsible: [{ role: 'BAC', desc: 'Formally validates and declares qualification' }, { role: 'BAC Secretariat', desc: 'Edits the Post-Qualification Report template' }],
        docs: ['Post-Qualification Report'],
        next: ['RESO']
    },

    // ─── SHARED COMPLETION PATH ───
    {
        id: 'RESO', x: 110, y: 2060, type: 'common', path: 'common', phase: 'Award',
        badge: 'BAC RESO / NOA / NTP', title: 'BAC Resolution, NOA & NTP',
        subtitle: 'Prepare award documents from templates',
        description: 'Edit the BAC Resolution, Notice of Award, and Notice to Proceed templates using the PR document details. Specify the exact legal basis for the procurement mode used. Update Monitoring Sheet with BAC Reso date, supplier name, and "For P.O." remarks.',
        responsible: [{ role: 'BAC Secretariat', desc: 'Edits and prepares all award documents' }, { role: 'BAC Chairperson', desc: 'Reviews and signs the BAC Resolution' }],
        docs: ['BAC Resolution', 'NOA', 'NTP', 'Abstract Checklist'],
        next: ['ROUTING']
    },
    {
        id: 'ROUTING', x: 110, y: 2280, type: 'common', path: 'common', phase: 'Award',
        badge: 'ROUTING', title: 'Document Routing for Signatures',
        subtitle: 'Route BAC Reso and Abstract to all required signatories',
        description: 'The BAC Resolution, Abstract, and related documents are routed through the signature chain: BAC Secretariat Head → Chairperson → Vice Chairperson → Provisional Member → BAC Members 1-3. For ₱50K+ procurements, also route to Accounting.',
        responsible: [
            { role: 'BAC Secretariat Head', desc: 'Initials first; routes to Chairperson (EAD)' },
            { role: 'End User / HOPE', desc: 'Signs — may be GSD, HRD, EEMD, BDD, MISD, or OAPIA' },
            { role: 'Chairperson (EAD)', desc: 'Signs as Committee Chair' },
            { role: 'Vice Chairperson (RALMD)', desc: 'Co-signs the resolution' },
            { role: 'BAC Members', desc: 'FD, LSD, VACRD, CPD each sign in order' },
        ],
        tip: 'For 50K above: include Accounting Division in the routing. Allow 1-2 working days at each office.',
        next: ['ABSTRACT_PO']
    },
    {
        id: 'ABSTRACT_PO', x: 110, y: 2480, type: 'common', path: 'common', phase: 'PO Forwarding',
        badge: 'ABSTRACT → PO', title: 'Abstract for Purchase Order',
        subtitle: 'Compile, scan, and forward documents to GSD',
        description: 'After all signatures are complete, the BAC Secretariat scans all documents for the office archive copy, prepares the physical package for GSD, logs in the BAC Outgoing Log Book, and forwards the Abstract and PR to GSD for PO preparation. Status is updated to Completed.',
        responsible: [{ role: 'BAC Secretariat', desc: 'Scans, compiles, logs, and forwards documents to GSD' }, { role: 'GSD', desc: 'Receives the Abstract and processes the Purchase Order' }],
        docs: ['Abstract', 'BAC Resolution', 'PR Form', 'BAC Outgoing Log'],
        next: ['PURCHASE_ORDER']
    },
    {
        id: 'PURCHASE_ORDER', x: 110, y: 2680, type: 'common', path: 'common', phase: 'PO',
        badge: 'PURCHASE ORDER', title: 'Purchase Order (GSD)',
        subtitle: 'GSD issues PO, coordinates delivery and inspection',
        description: 'GSD takes over from the BAC Office. GSD issues the formal Purchase Order to the winning supplier, coordinates the delivery timeline, and conducts inspection of the delivered items. The BAC Secretariat\'s role in the procurement is complete at this stage.',
        responsible: [{ role: 'GSD', desc: 'Issues PO, coordinates delivery, inspects items upon receipt' }, { role: 'Winning Supplier', desc: 'Receives PO and delivers items per terms' }],
        next: ['PMR']
    },
    {
        id: 'PMR', x: 110, y: 2880, type: 'common', path: 'common', phase: 'Reporting',
        badge: 'PMR', title: 'Procurement Monitoring Report',
        subtitle: 'Record completed procurement in GPPB PMR format',
        description: 'Update the PMR Google Sheet with all completed procurement details: PR Number, Title, End User, Mode, Bid Opening Date, Evaluation Date, ABC, and Contract Cost. Stamp the PMR with "POSTED" and the current date. Failed procurements are excluded.',
        responsible: [{ role: 'BAC Secretariat', desc: 'Inputs all procurement data into the official PMR format' }],
        docs: ['PMR Google Sheet'],
        next: ['ARCHIVE']
    },
    {
        id: 'ARCHIVE', x: 110, y: 3080, type: 'common', path: 'common', phase: 'Closing',
        badge: 'ARCHIVE', title: 'Archive & File Tracking',
        subtitle: 'File physical documents; record in File Tracking System',
        description: 'Insert the completed procurement documents into the designated filing drawer organized by month and year. Then update the File Tracking System with the document\'s details and physical location for future retrieval.',
        responsible: [{ role: 'BAC Secretariat', desc: 'Files the complete document set and updates the tracking system' }],
        next: ['END']
    },
    {
        id: 'END', x: 110, y: 3280, type: 'start-end', path: 'common', phase: 'Complete',
        badge: 'END', title: 'Procurement Completed',
        subtitle: 'Process cycle complete — all documents filed and recorded',
        description: 'The procurement cycle is complete. All documents are archived, the PMR is updated, GSD has issued the PO, and the supplier is delivering or has delivered the items.',
        responsible: [{ role: 'BAC Secretariat', desc: 'Ensures all filing, reporting, and archiving is complete' }],
        next: []
    },
    // RB extra
    {
        id: 'RB_COMPILE', x: 700, y: 2480, type: 'rb', path: 'rb', phase: 'Regular Bidding',
        badge: 'REG. BIDDING', title: 'Compile Bound Copies',
        subtitle: 'Assemble Blue Binder copies for COA, Accounting, End User',
        description: 'Print the checklist and page identification labels. Sort and organize all documents. Punch holes in each set and insert into Blue Binders. Stamp "CERTIFIED" on each document with the date. Prepare and have signed the transmittal letter. Submit to COA, Accounting, and End User.',
        responsible: [{ role: 'BAC Secretariat', desc: 'Assembles all bound copies and routes them officially' }, { role: 'BAC Secretariat Head', desc: 'Signs the Certified stamp and transmittal letter' }, { role: 'Chairperson', desc: 'Co-signs the transmittal letter' }],
        docs: ['Blue Binder Copies (3)', 'Transmittal Letter', 'Outgoing Log Book'],
        next: []
    },
];

const CONNECTIONS = [
    { from: 'START', to: 'PR_LOG' },
    { from: 'PR_LOG', to: 'BUDGET_Q' },
    { from: 'BUDGET_Q', to: 'BUDGET', label: 'Yes' }, { from: 'BUDGET_Q', to: 'PR_ACTION', label: 'No' },
    { from: 'BUDGET', to: 'PR_ACTION' },
    { from: 'PR_ACTION', to: 'MODE_DECISION' },
    { from: 'MODE_DECISION', to: 'SVP_RFQ', label: 'SVP / Shopping' }, { from: 'MODE_DECISION', to: 'PR_DELIB', label: 'Reg. Bidding' },
    { from: 'SVP_RFQ', to: 'SVP_POST' }, { from: 'SVP_POST', to: 'SVP_OPEN' }, { from: 'SVP_OPEN', to: 'SVP_ABSTRACT' }, { from: 'SVP_ABSTRACT', to: 'SVP_EVAL' }, { from: 'SVP_EVAL', to: 'RESO' },
    { from: 'PR_DELIB', to: 'RB_PREBID' }, { from: 'RB_PREBID', to: 'RB_BIDOPEN' }, { from: 'RB_BIDOPEN', to: 'RB_TWG' }, { from: 'RB_TWG', to: 'RB_POSTQ' }, { from: 'RB_POSTQ', to: 'RESO' },
    { from: 'RESO', to: 'ROUTING' }, { from: 'ROUTING', to: 'ABSTRACT_PO' }, { from: 'ABSTRACT_PO', to: 'PURCHASE_ORDER' }, { from: 'PURCHASE_ORDER', to: 'PMR' }, { from: 'PMR', to: 'ARCHIVE' }, { from: 'ARCHIVE', to: 'END' },
    { from: 'ABSTRACT_PO', to: 'RB_COMPILE', label: 'For RB' },
];

const TYPE_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    'start-end': { bg: '#0a1e28', border: '#2dd4bf', text: '#2dd4bf', badge: 'rgba(45,212,191,0.15)' },
    'common': { bg: '#14102a', border: '#6d28d9', text: '#a78bfa', badge: 'rgba(109,40,217,0.2)' },
    'svp': { bg: '#0a1e14', border: '#059669', text: '#34d399', badge: 'rgba(5,150,105,0.2)' },
    'rb': { bg: '#0a1428', border: '#1d4ed8', text: '#60a5fa', badge: 'rgba(29,78,216,0.2)' },
    'decision': { bg: '#1e1400', border: '#b45309', text: '#fbbf24', badge: 'rgba(180,83,9,0.2)' },
    'optional': { bg: '#1e1800', border: '#b45309', text: '#fbbf24', badge: 'rgba(180,83,9,0.15)' },
};

const NODE_W = 220;
const NODE_H = 90;
const CANVAS_PAD = 80;

const ProcessFlowChart: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(0.72);
    const [pan, setPan] = useState({ x: 80, y: 40 });
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [selected, setSelected] = useState<string | null>(null);
    const [filterPath, setFilterPath] = useState<'all' | 'svp' | 'rb'>('all');
    const [fullscreen, setFullscreen] = useState(false);
    const [slideshow, setSlideshow] = useState(false);
    const [slideIdx, setSlideIdx] = useState(0);

    const slideOrder = NODES.map((n) => n.id);
    const currentSlideNode = NODES.find((n) => n.id === slideOrder[slideIdx]);

    const visibleNodes = NODES.filter((n) =>
        filterPath === 'all' || n.path === filterPath || n.path === 'common'
    );

    const panToNode = useCallback((nodeId: string) => {
        const node = NODES.find((n) => n.id === nodeId);
        if (!node || !wrapRef.current) return;
        const rect = wrapRef.current.getBoundingClientRect();
        setPan({
            x: rect.width / 2 - (node.x + NODE_W / 2) * zoom,
            y: rect.height / 2 - (node.y + NODE_H / 2) * zoom,
        });
    }, [zoom]);

    useEffect(() => {
        if (slideshow && currentSlideNode) {
            setSelected(currentSlideNode.id);
            panToNode(currentSlideNode.id);
        }
    }, [slideIdx, slideshow, currentSlideNode, panToNode]);

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.08 : 0.08;
        setZoom((z) => Math.max(0.25, Math.min(2.5, z + delta)));
    }, []);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    const onMouseDown = (e: React.MouseEvent) => {
        if ((e.target as Element).closest('.flow-node')) return;
        setDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };
    const onMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return;
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };
    const onMouseUp = () => setDragging(false);

    const resetView = () => { setZoom(0.72); setPan({ x: 80, y: 40 }); };

    const bounds = visibleNodes.reduce(
        (acc, n) => ({
            minX: Math.min(acc.minX, n.x), minY: Math.min(acc.minY, n.y),
            maxX: Math.max(acc.maxX, n.x + NODE_W), maxY: Math.max(acc.maxY, n.y + NODE_H),
        }),
        { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );
    const svgW = bounds.maxX - bounds.minX + CANVAS_PAD * 2;
    const svgH = bounds.maxY - bounds.minY + CANVAS_PAD * 2;

    const selectedNode = NODES.find((n) => n.id === selected);
    const detailNode = slideshow ? currentSlideNode : selectedNode;
    const showPanel = !!detailNode;

    const DetailPanel = () => {
        const node = detailNode;
        if (!node) return null;
        const style = TYPE_STYLES[node.type] || TYPE_STYLES.common;
        return (
            <div className="absolute top-0 right-0 w-[380px] h-full flex flex-col bg-card border-l border-border z-20 overflow-hidden">
                <div className="flex-shrink-0 p-5 border-b border-border" style={{ background: `${style.bg}88` }}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-bold tracking-widest px-2.5 py-1 rounded"
                            style={{ background: style.badge, color: style.text }}>{node.badge}</span>
                        {slideshow ? (
                            <span className="text-[10px] text-muted-foreground font-mono">{slideIdx + 1} / {slideOrder.length}</span>
                        ) : (
                            <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <h2 className="text-base font-bold text-foreground leading-tight">{node.title}</h2>
                    <p className="text-xs text-muted-foreground mt-1">{node.subtitle}</p>
                    <div className="mt-2.5 flex gap-2">
                        <span className="text-[10px] px-2 py-0.5 bg-accent border border-border rounded text-muted-foreground">{node.phase}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-accent border border-border rounded text-muted-foreground capitalize">{node.path}</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">{node.description}</p>
                    {node.responsible && (
                        <div>
                            <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase mb-2">Responsible Parties</div>
                            <div className="space-y-1.5">
                                {node.responsible.map((r, i) => (
                                    <div key={i} className="flex gap-2.5 p-2.5 rounded-lg bg-accent border border-border">
                                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" />
                                        <div>
                                            <p className="text-[11px] font-semibold text-foreground">{r.role}</p>
                                            <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{r.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {node.tip && (
                        <div className="p-3 rounded-lg bg-amber-500/8 border border-amber-500/20">
                            <div className="text-[9px] font-bold tracking-wider text-amber-500 uppercase mb-1.5">💡 Key Note</div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{node.tip}</p>
                        </div>
                    )}
                    {node.docs && node.docs.length > 0 && (
                        <div>
                            <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase mb-2">Required Documents</div>
                            <div className="flex flex-wrap gap-1.5">
                                {node.docs.map((d, i) => (
                                    <span key={i} className="text-[10px] px-2 py-1 bg-accent border border-border rounded text-muted-foreground">{d}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {slideshow && (
                    <div className="flex-shrink-0 flex gap-2 p-4 border-t border-border bg-card">
                        <button
                            onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
                            disabled={slideIdx === 0}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-accent border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" /> Prev
                        </button>
                        <button
                            onClick={() => setSlideIdx((i) => Math.min(slideOrder.length - 1, i + 1))}
                            disabled={slideIdx === slideOrder.length - 1}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-primary text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            Next <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className={`flex flex-col bg-background ${fullscreen ? 'fixed inset-0 z-[9999]' : 'h-[calc(100vh-4rem)]'}`}
        >
            {/* TOOLBAR */}
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-card border-b border-border z-30 flex-wrap">
                <div className="flex items-center gap-2 mr-1">
                    <Layers className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">BAC Process Flow Chart</span>
                    <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded font-mono">v2.0</span>
                </div>
                <div className="w-px h-5 bg-border" />

                <button onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent border border-border text-muted-foreground hover:text-foreground text-xs transition">
                    <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-muted-foreground min-w-[38px] text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent border border-border text-muted-foreground hover:text-foreground text-xs transition">
                    <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button onClick={resetView} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent border border-border text-muted-foreground hover:text-foreground text-xs transition">
                    <Home className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-5 bg-border" />

                {/* Filter */}
                <div className="flex items-center gap-1.5">
                    <Filter className="w-3 h-3 text-muted-foreground" />
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'svp', label: 'SVP' },
                        { id: 'rb', label: 'Reg. Bidding' },
                    ].map((f) => (
                        <button key={f.id} onClick={() => setFilterPath(f.id as 'all' | 'svp' | 'rb')}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${filterPath === f.id ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground border-border hover:text-foreground'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="w-px h-5 bg-border" />

                {/* Legend */}
                <div className="hidden lg:flex items-center gap-3">
                    {[
                        { color: '#a78bfa', label: 'Common' },
                        { color: '#34d399', label: 'SVP' },
                        { color: '#60a5fa', label: 'Reg. Bidding' },
                        { color: '#fbbf24', label: 'Decision' },
                        { color: '#2dd4bf', label: 'Start/End' },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
                            <span className="text-[10px] text-muted-foreground">{item.label}</span>
                        </div>
                    ))}
                </div>

                <div className="flex-1" />

                <button
                    onClick={() => { setSlideshow((s) => !s); setSlideIdx(0); setSelected(null); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${slideshow ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-accent border-border text-muted-foreground hover:text-foreground'}`}
                >
                    {slideshow ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {slideshow ? 'Stop Slideshow' : 'Slideshow'}
                </button>

                <button
                    onClick={() => setFullscreen((f) => !f)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent border border-border text-muted-foreground hover:text-foreground text-xs transition"
                >
                    {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* CANVAS */}
            <div className="flex-1 relative overflow-hidden">
                <div
                    ref={wrapRef}
                    className={`absolute inset-0 overflow-hidden ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    style={{
                        right: showPanel ? 380 : 0,
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                >
                    <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0', position: 'absolute', willChange: 'transform' }}>
                        {/* SVG Lines */}
                        <svg ref={svgRef} style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }} width={svgW} height={svgH}>
                            <defs>
                                <marker id="arr-def" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L8,3 z" fill="rgba(80,80,130,0.6)" />
                                </marker>
                                <marker id="arr-act" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L8,3 z" fill="#6366f1" />
                                </marker>
                            </defs>
                            {CONNECTIONS.map((conn, i) => {
                                const from = NODES.find((n) => n.id === conn.from);
                                const to = NODES.find((n) => n.id === conn.to);
                                if (!from || !to) return null;
                                const vFrom = visibleNodes.find((n) => n.id === conn.from);
                                const vTo = visibleNodes.find((n) => n.id === conn.to);
                                if (!vFrom || !vTo) return null;
                                const isActive = selected === conn.from || selected === conn.to;
                                const fx = from.x + NODE_W / 2;
                                const fy = from.y + NODE_H;
                                const tx = to.x + NODE_W / 2;
                                const ty = to.y;
                                const midY = (fy + ty) / 2;
                                const d = `M ${fx} ${fy} C ${fx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;
                                return (
                                    <g key={i}>
                                        <path d={d} fill="none"
                                            stroke={isActive ? '#6366f1' : 'rgba(60,60,110,0.55)'}
                                            strokeWidth={isActive ? 2 : 1.5}
                                            strokeDasharray={isActive ? undefined : '5 3'}
                                            markerEnd={isActive ? 'url(#arr-act)' : 'url(#arr-def)'}
                                        />
                                        {conn.label && (
                                            <text x={(fx + tx) / 2} y={midY - 6} textAnchor="middle" fontSize="8"
                                                fill={isActive ? '#818cf8' : 'rgba(100,100,150,0.7)'} fontFamily="monospace">
                                                {conn.label}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Nodes */}
                        {visibleNodes.map((node) => {
                            const style = TYPE_STYLES[node.type] || TYPE_STYLES.common;
                            const isSelected = selected === node.id;
                            const isSlide = slideshow && currentSlideNode?.id === node.id;
                            const highlight = isSelected || isSlide;
                            return (
                                <div
                                    key={node.id}
                                    className="flow-node"
                                    style={{
                                        position: 'absolute', left: node.x, top: node.y, width: NODE_W, minHeight: NODE_H,
                                        background: style.bg, border: `1.5px solid ${highlight ? style.text : style.border}`,
                                        borderRadius: 10, cursor: 'pointer',
                                        boxShadow: highlight ? `0 0 22px ${style.text}35, 0 4px 20px rgba(0,0,0,0.5)` : '0 2px 10px rgba(0,0,0,0.4)',
                                        transform: highlight ? 'scale(1.04)' : 'scale(1)',
                                        transition: 'all 0.2s ease', zIndex: highlight ? 10 : 1, userSelect: 'none',
                                    }}
                                    onClick={() => { if (!slideshow) setSelected(selected === node.id ? null : node.id); }}
                                >
                                    {highlight && (
                                        <div style={{ position: 'absolute', top: -5, right: -5, width: 10, height: 10, borderRadius: '50%', background: style.text, animation: 'pulseDot 1.5s ease-out infinite' }} />
                                    )}
                                    <div style={{ padding: '10px 12px 4px' }}>
                                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', padding: '2px 6px', borderRadius: 4, background: style.badge, color: style.text }}>
                                            {node.badge}
                                        </span>
                                    </div>
                                    <div style={{ padding: '4px 12px 12px' }}>
                                        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.4, marginBottom: 3 }}>{node.title}</div>
                                        <div style={{ fontSize: 9.5, color: 'rgba(148,163,184,0.7)', lineHeight: 1.4 }}>{node.subtitle}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {showPanel && <DetailPanel />}

                {!slideshow && !selected && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-[10px] text-muted-foreground">
                        <Info className="w-3 h-3" />
                        Click any node for details · Drag to pan · Scroll to zoom
                    </div>
                )}
            </div>

            <style>{`
        @keyframes pulseDot {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(3.5); opacity: 0; }
        }
      `}</style>
        </div>
    );
};

export default ProcessFlowChart;
