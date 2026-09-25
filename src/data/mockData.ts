import {
  Customer,
  Project,
  Invoice,
  Quotation,
  Product,
  InventoryItem,
  Payment,
  Expense,
  Employee,
  AuditLog,
  CompanySettings,
  AppNotification,
  StockLog,
  Distributor,
  Purchase,
  PurchaseReturn,
  CashBankAccount,
  CashInTransaction,
  CashOutTransaction,
  AccountTransfer,
} from '../types';
import { DEFAULT_PRODUCTS } from './defaultProducts';

export const COMPANY_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <circle cx="250" cy="250" r="235" fill="#fdfbf7" stroke="#e11d48" stroke-width="18"/>
  <circle cx="250" cy="250" r="222" fill="none" stroke="#e11d48" stroke-width="2"/>
  
  <path id="topArc" d="M 65,250 A 185,185 0 1,1 435,250" fill="none"/>
  <path id="bottomArc" d="M 435,250 A 185,185 0 0,1 65,250" fill="none"/>

  <text font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="33" fill="#291206" letter-spacing="3">
    <textPath href="#topArc" startOffset="50%" text-anchor="middle">UPADHYAY SOLAR WORKS</textPath>
  </text>

  <text font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="35" fill="#291206" letter-spacing="7">
    <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">JAUNPUR</textPath>
  </text>

  <circle cx="95" cy="250" r="14" fill="#c2410c"/>
  <circle cx="405" cy="250" r="14" fill="#c2410c"/>

  <circle cx="250" cy="250" r="142" fill="#38190c" stroke="#d97706" stroke-width="5"/>
  
  <g fill="#f59e0b">
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(0 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(15 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(30 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(45 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(60 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(75 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(90 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(105 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(120 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(135 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(150 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(165 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(180 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(195 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(210 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(225 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(240 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(255 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(270 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(285 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(300 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(315 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(330 250 250)"/>
    <rect x="245" y="98" width="10" height="12" rx="2" transform="rotate(345 250 250)"/>
  </g>

  <circle cx="250" cy="250" r="128" fill="#2d1307"/>

  <path d="M 185,212 Q 250,155 315,212 C 325,225 315,232 305,232 L 195,232 C 185,232 175,225 185,212 Z" fill="#f59e0b" stroke="#78350f" stroke-width="4"/>
  <rect x="236" y="168" width="28" height="42" rx="5" fill="#fef08a" stroke="#78350f" stroke-width="3"/>
  <path d="M 254,173 L 243,190 L 250,190 L 245,204 L 258,186 L 251,186 Z" fill="#b45309"/>

  <path d="M 200,238 C 200,238 210,282 250,282 C 290,282 300,238 300,238 C 308,268 308,312 250,326 C 192,312 192,268 200,238 Z" fill="#f59e0b"/>
  <path d="M 212,242 C 222,228 245,228 250,242 C 255,228 278,228 288,242 L 283,254 C 273,260 255,260 250,252 C 245,260 227,260 217,254 Z" fill="#1f0a03"/>
  <path d="M 246,252 L 254,252 L 252,270 L 248,270 Z" fill="#d97706"/>
  <path d="M 226,284 Q 250,300 274,284 Q 250,318 226,284 Z" fill="#78350f"/>
</svg>`;

export const COMPANY_LOGO_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(COMPANY_LOGO_SVG)}`;

export const initialCompanySettings: CompanySettings = {
  companyName: 'Upadhyay Brother Solar Works',
  tagline: 'Empowering Jaunpur with Clean Solar EPC Solutions',
  gstNumber: '09AEIPU6555N1Z1',
  panNumber: 'AEIPU6555N',
  state: 'Uttar Pradesh',
  stateCode: '09',
  address: 'Babhanauli Damrua, Jaunpur, Uttar Pradesh - 222001',
  phone: '+91 98193 91461',
  email: 'usatyam30-5@okicici',
  website: 'www.upadhyaybrothersolar.com',
  bankName: 'ICICI Bank Ltd.',
  accountHolderName: 'Upadhyay Brother Solar Works',
  accountNumber: '655509AEIPU1234',
  ifscCode: 'ICIC0006555',
  bankBranch: 'Jaunpur Main Branch',
  upiId: 'usatyam30-5@okicici',
  upiQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=usatyam30-5@okicici&pn=Upadhyay%20Brother%20Solar%20Works',
  logoUrl: COMPANY_LOGO_DATA_URI,
  signatureUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch_Signature.png',
  authorizedSignatoryName: 'Authorized Signatory - Upadhyay Brother Solar Works',
  termsAndConditions: '1. Goods once sold will not be taken back without prior authorization.\n2. Payment terms as agreed between the parties.\n3. Warranties as per manufacturer / OEM guidelines.\n4. Subject to Jaunpur (UP) jurisdiction only. E. & O.E.',
  invoicePrefix: 'UBSW/2026/',
  autoSave: true,
  themeMode: 'light',
  themeAccent: 'amber',
  themeStyle: 'stripe',
};

export const initialCustomers: Customer[] = [];

export const initialProjects: Project[] = [];

export const initialInvoices: Invoice[] = [];

export const initialQuotations: Quotation[] = [
  {
    id: 'QUO-2026-001',
    quoteNumber: 'QUO/2026/001',
    customerId: 'CUST-001',
    customerName: 'Ramesh Chandra Sharma',
    customerEmail: 'kdsingh9777@gmail.com',
    customerMobile: '+91 98193 91461',
    customerAddress: 'Babhanauli Damrua, Jaunpur, Uttar Pradesh - 222001',
    customerState: 'Uttar Pradesh',
    customerStateCode: '09',
    customerGstin: '09AEIPU6555N1Z1',
    shippingName: 'Ramesh Chandra Sharma',
    shippingAddress: 'Babhanauli Damrua, Jaunpur, Uttar Pradesh - 222001',
    shippingMobile: '+91 98193 91461',
    shippingState: 'Uttar Pradesh',
    shippingStateCode: '09',
    shippingGstin: '09AEIPU6555N1Z1',
    placeOfSupply: '09-Uttar Pradesh',
    reverseCharge: 'No',
    delivery: 'By Road (Direct Dispatch)',
    paymentTerms: '50% Advance, 40% on Delivery, 10% on Commissioning',
    installation: 'Included (as per scope)',
    warranty: 'As per manufacturer',
    projectType: 'Residential',
    systemType: 'Hybrid',
    capacityKW: 10,
    items: [
      {
        id: '1',
        name: 'INVT VFD 40 HP (INVT)',
        brand: 'INVT',
        model: 'VFD 40 HP',
        description: 'Solar VFD Drive 40 HP 3-Phase Heavy Duty Water Pump Controller',
        hsnCode: '85044090',
        qty: 20,
        unit: 'Nos',
        rate: 52250,
        amount: 1045000,
        taxRate: 12,
      },
      {
        id: '2',
        name: 'RC-24000-180Ah (Luminous)',
        brand: 'Luminous',
        model: 'RC-24000-180Ah',
        description: 'Tall Tubular Solar Battery 180Ah / 12V Heavy Deep Cycle',
        hsnCode: '85072000',
        qty: 1,
        unit: 'Nos',
        rate: 16940,
        amount: 16940,
        taxRate: 12,
      },
    ],
    estimatedCost: 1061940,
    taxAmount: 127433,
    grandTotal: 1189373,
    validityDays: 15,
    validUntil: '2026-10-10',
    termsAndConditions:
      '1. Quotation valid for 15 days from the date of issue.\n2. 50% Advance with PO, 40% against material delivery, 10% on commissioning.\n3. Solar panels carry 25 years performance warranty as per OEM manufacturer.\n4. Inverter carries 5 years manufacturer replacement / repair warranty.\n5. Net metering approvals subject to DISCOM DISPATCH rules & local jurisdiction.',
    status: 'Sent',
    createdAt: '2026-09-25',
  },
  {
    id: 'QUO-2026-002',
    quoteNumber: 'QUO/2026/002',
    customerId: 'CUST-002',
    customerName: 'Anil Kumar Maurya',
    customerEmail: 'anil.maurya@gmail.com',
    customerMobile: '+91 94152 89012',
    customerAddress: 'Village Badlapur, Jaunpur, Uttar Pradesh - 222125',
    customerState: 'Uttar Pradesh',
    customerStateCode: '09',
    customerGstin: '',
    shippingName: 'Anil Kumar Maurya',
    shippingAddress: 'Village Badlapur, Jaunpur, Uttar Pradesh - 222125',
    shippingMobile: '+91 94152 89012',
    shippingState: 'Uttar Pradesh',
    shippingStateCode: '09',
    shippingGstin: '',
    placeOfSupply: '09-Uttar Pradesh',
    reverseCharge: 'No',
    delivery: 'By Road (Direct Dispatch)',
    paymentTerms: '50% Advance with Purchase Order, 40% against Material Delivery on site, 10% after successful Commissioning & Grid Sync',
    installation: 'Included (as per scope)',
    warranty: 'As per manufacturer',
    projectType: 'Residential',
    systemType: 'On Grid',
    capacityKW: 5,
    items: [
      {
        id: '1',
        name: 'Waaree 540W Mono PERC Solar Panels (Waaree)',
        brand: 'Waaree',
        model: '540W Mono PERC Bifacial',
        description: 'High Efficiency 144 Half-Cut Cells Tier-1 Solar PV Modules',
        hsnCode: '85414300',
        qty: 10,
        unit: 'Nos',
        rate: 11500,
        amount: 115000,
        taxRate: 12,
      },
    ],
    estimatedCost: 115000,
    taxAmount: 13800,
    grandTotal: 128800,
    validityDays: 15,
    validUntil: '2026-10-10',
    termsAndConditions:
      '1. Quotation valid for 15 days from the date of issue.\n2. 50% Advance with PO, 40% against material delivery, 10% on commissioning.\n3. Solar panels carry 25 years performance warranty as per OEM manufacturer.\n4. Inverter carries 5 years manufacturer replacement / repair warranty.\n5. Net metering approvals subject to DISCOM DISPATCH rules & local jurisdiction.',
    status: 'Sent',
    createdAt: '2026-09-25',
  },
];

export const initialProducts: Product[] = [];
export const initialInventory: InventoryItem[] = [];

export const initialStockLogs: StockLog[] = [];

export const initialPayments: Payment[] = [];

export const initialExpenses: Expense[] = [];

export const initialEmployees: Employee[] = [];

export const initialAuditLogs: AuditLog[] = [];

export const initialNotifications: AppNotification[] = [];

export const initialDistributors: Distributor[] = [
  {
    id: 'DIST-001',
    companyName: 'Adani Solar Technologies Pvt Ltd',
    contactPerson: 'Rajesh Sharma',
    mobile: '+91 98765 43210',
    email: 'procurement@adanisolar.com',
    gstin: '24AAACA1234F1Z5',
    address: 'Adani Shantigram, SG Highway',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '382421',
    bankDetails: {
      bankName: 'HDFC Bank',
      accountNumber: '50200012345678',
      ifscCode: 'HDFC0001234',
      branch: 'SG Highway Branch',
    },
    paymentTerms: 'Net 30',
    totalPurchases: 0,
    outstandingAmount: 0,
    status: 'Active',
    notes: 'Primary Tier-1 PV Module Manufacturer',
    createdAt: '2026-01-10',
  },
  {
    id: 'DIST-002',
    companyName: 'UTL Solar Power Solutions',
    contactPerson: 'Vikas Verma',
    mobile: '+91 98112 34567',
    email: 'orders@utlsolar.com',
    gstin: '09AABCU4567G1Z2',
    address: 'Sector 63, Electronic City',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    bankDetails: {
      bankName: 'State Bank of India',
      accountNumber: '38472910482',
      ifscCode: 'SBIN0006789',
      branch: 'Sector 63 Noida',
    },
    paymentTerms: '15 Days',
    totalPurchases: 0,
    outstandingAmount: 0,
    status: 'Active',
    notes: 'Inverters, Batteries & Solar Hybrid PCUs',
    createdAt: '2026-01-15',
  },
  {
    id: 'DIST-003',
    companyName: 'INVT Solar Electric India Pvt Ltd',
    contactPerson: 'Amit Patel',
    mobile: '+91 99250 87654',
    email: 'sales@invt-solar.in',
    gstin: '27AABCI8901H1Z9',
    address: 'Andheri East Industrial Zone',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400069',
    bankDetails: {
      bankName: 'ICICI Bank',
      accountNumber: '000405012345',
      ifscCode: 'ICIC0000004',
      branch: 'Andheri East',
    },
    paymentTerms: 'Advance',
    totalPurchases: 0,
    outstandingAmount: 0,
    status: 'Active',
    notes: 'Solar VFD Controllers & Water Pump Drives',
    createdAt: '2026-01-20',
  },
  {
    id: 'DIST-004',
    companyName: 'Polycab Wires & Cables Ltd',
    contactPerson: 'Suresh Gupta',
    mobile: '+91 97654 32109',
    email: 'industrial@polycab.com',
    gstin: '24AAACP5678J1Z0',
    address: 'Halol Industrial Area',
    city: 'Vadodara',
    state: 'Gujarat',
    pincode: '389350',
    bankDetails: {
      bankName: 'Axis Bank',
      accountNumber: '915020034567890',
      ifscCode: 'UTIB0000123',
      branch: 'Alkapuri Vadodara',
    },
    paymentTerms: 'Net 30',
    totalPurchases: 0,
    outstandingAmount: 0,
    status: 'Active',
    notes: 'Solar DC & AC armoured cables & MC4 accessories',
    createdAt: '2026-02-01',
  },
  {
    id: 'DIST-005',
    companyName: 'Upadhyay Brother Solar Works (Jaunpur Depot)',
    contactPerson: 'Devendra Upadhyay',
    mobile: '+91 94152 89012',
    email: 'depot@upadhyaybrothersolar.com',
    gstin: '09AAHFU1234K1Z4',
    address: 'Babhanauli Damrua, Jaunpur',
    city: 'Jaunpur',
    state: 'Uttar Pradesh',
    pincode: '222001',
    paymentTerms: 'Immediate',
    totalPurchases: 0,
    outstandingAmount: 0,
    status: 'Active',
    notes: 'Local hardware, structure brackets, C-channels, earthing rods',
    createdAt: '2026-02-05',
  },
];

export const initialPurchases: Purchase[] = [];

export const initialPurchaseReturns: PurchaseReturn[] = [];

export const initialAccounts: CashBankAccount[] = [
  {
    id: 'ACC-CASH',
    name: 'Cash in Hand',
    accountType: 'Cash',
    openingBalance: 248500,
    minBalanceAlert: 25000,
    isActive: true,
    isDefault: true,
    notes: 'Main Cash Drawer at Jaunpur Office',
    createdAt: '2026-01-01',
  },
  {
    id: 'ACC-HDFC',
    name: 'HDFC Bank',
    accountType: 'Bank',
    bankName: 'HDFC Bank Ltd.',
    accountHolderName: 'Upadhyay Brother Solar Works',
    accountNumber: '50200088991122',
    ifscCode: 'HDFC0001025',
    branch: 'Civil Lines Jaunpur',
    upiId: 'upadhyay.solarepc@hdfcbank',
    openingBalance: 1245230,
    minBalanceAlert: 100000,
    isActive: true,
    notes: 'Primary Current Account for Client Invoices & Vendor RTGS',
    createdAt: '2026-01-01',
  },
  {
    id: 'ACC-ICICI',
    name: 'ICICI Bank',
    accountType: 'Bank',
    bankName: 'ICICI Bank Ltd.',
    accountHolderName: 'Upadhyay Brother Solar Works',
    accountNumber: '655509AEIPU1234',
    ifscCode: 'ICIC0006555',
    branch: 'Jaunpur Main Branch',
    upiId: 'usatyam30-5@okicici',
    openingBalance: 630000,
    minBalanceAlert: 50000,
    isActive: true,
    notes: 'Operational Account linked with QR Code & UPI Gateways',
    createdAt: '2026-01-01',
  },
  {
    id: 'ACC-SBI',
    name: 'SBI Bank',
    accountType: 'Bank',
    bankName: 'State Bank of India',
    accountHolderName: 'Upadhyay Brother Solar Works',
    accountNumber: '38472910482',
    ifscCode: 'SBIN0006789',
    branch: 'Katcheri Road Jaunpur',
    upiId: 'solarepc.sbi@sbi',
    openingBalance: 325000,
    minBalanceAlert: 50000,
    isActive: true,
    notes: 'Secondary Business Account for Tax & Government Tenders',
    createdAt: '2026-01-01',
  },
  {
    id: 'ACC-PETTY',
    name: 'Petty Cash',
    accountType: 'Petty Cash',
    openingBalance: 25000,
    minBalanceAlert: 5000,
    isActive: true,
    notes: 'Site Engineer Pocket Cash for daily diesel & transit tools',
    createdAt: '2026-01-01',
  },
];

export const initialCashInTransactions: CashInTransaction[] = [
  {
    id: 'CIN-2026-0001',
    date: '2026-08-27',
    time: '10:30 AM',
    sourceType: 'Customer Invoice Payment',
    fromWhom: 'Ramesh Singh (Solar Farm)',
    referenceNo: 'INV-1025',
    projectId: 'PRJ-2026-001',
    projectName: 'Solar Project A - 10kW On-Grid',
    paymentMethod: 'Bank Transfer',
    accountId: 'ACC-HDFC',
    accountName: 'HDFC Bank',
    amount: 125000,
    status: 'Confirmed',
    notes: 'Milestone 2 payment received via NEFT',
    createdBy: 'Accounts Manager',
    sourceModule: 'payments',
    sourceId: 'PAY-SAMPLE-01',
    debitAccount: 'HDFC Bank',
    creditAccount: 'Ramesh Singh',
    createdAt: '2026-08-27T10:30:00Z',
  },
  {
    id: 'CIN-2026-0002',
    date: '2026-08-27',
    time: '11:45 AM',
    sourceType: 'Customer Invoice Payment',
    fromWhom: 'XYZ Commercial Agro Ltd',
    referenceNo: 'INV-1026',
    projectId: 'PRJ-2026-002',
    projectName: 'Solar Project B - 25HP VFD Pumping',
    paymentMethod: 'Cash',
    accountId: 'ACC-CASH',
    accountName: 'Cash in Hand',
    amount: 50000,
    status: 'Confirmed',
    notes: 'Cash payment received at counter against invoice',
    createdBy: 'Accounts Manager',
    sourceModule: 'payments',
    sourceId: 'PAY-SAMPLE-02',
    debitAccount: 'Cash in Hand',
    creditAccount: 'XYZ Commercial Agro Ltd',
    createdAt: '2026-08-27T11:45:00Z',
  },
  {
    id: 'CIN-2026-0003',
    date: '2026-08-26',
    time: '03:15 PM',
    sourceType: 'Advance from Customer',
    fromWhom: 'Shree Krishna Cold Storage',
    referenceNo: 'ADV-003',
    projectId: 'PRJ-2026-003',
    projectName: 'Solar Project C - 50kW Industrial Rooftop',
    paymentMethod: 'Cheque',
    accountId: 'ACC-SBI',
    accountName: 'SBI Bank',
    amount: 200000,
    status: 'Confirmed',
    chequeNumber: '458721',
    chequeDate: '2026-08-25',
    chequeBankName: 'SBI Bank',
    chequeStatus: 'Cleared',
    chequeClearedDate: '2026-08-26',
    notes: 'Booking token advance for 50kW hybrid structure',
    createdBy: 'Sales Head',
    sourceModule: 'billing',
    sourceId: 'PAY-SAMPLE-03',
    debitAccount: 'SBI Bank',
    creditAccount: 'Shree Krishna Cold Storage',
    createdAt: '2026-08-26T15:15:00Z',
  },
  {
    id: 'CIN-2026-0004',
    date: '2026-08-25',
    time: '01:00 PM',
    sourceType: 'Sales Receipt',
    fromWhom: 'Jaunpur Farmhouse Setup',
    referenceNo: 'RCT-2026-004',
    paymentMethod: 'UPI',
    accountId: 'ACC-ICICI',
    accountName: 'ICICI Bank',
    amount: 75000,
    status: 'Confirmed',
    notes: 'Direct UPI transfer via QR Code for VFD controller',
    createdBy: 'Technician Lead',
    sourceModule: 'payments',
    sourceId: 'PAY-SAMPLE-04',
    debitAccount: 'ICICI Bank',
    creditAccount: 'Jaunpur Farmhouse Setup',
    createdAt: '2026-08-25T13:00:00Z',
  },
  {
    id: 'CIN-2026-0005',
    date: '2026-08-24',
    time: '04:30 PM',
    sourceType: 'Capital Introduced',
    fromWhom: 'Director / Partner Infusion',
    referenceNo: 'CAP-2026-01',
    paymentMethod: 'Bank Transfer',
    accountId: 'ACC-HDFC',
    accountName: 'HDFC Bank',
    amount: 425600,
    status: 'Confirmed',
    notes: 'Working capital introduction for bulk module inventory purchase',
    createdBy: 'Director',
    sourceModule: 'manual',
    debitAccount: 'HDFC Bank',
    creditAccount: 'Partner Capital Account',
    createdAt: '2026-08-24T16:30:00Z',
  },
];

export const initialCashOutTransactions: CashOutTransaction[] = [
  {
    id: 'COUT-2026-0001',
    date: '2026-08-27',
    time: '09:15 AM',
    paidTo: 'ABC Solar Distributor',
    category: 'Purchase Bill Payment',
    referenceNo: 'PUR-2026-0045',
    distributorId: 'DIST-001',
    projectId: 'PRJ-2026-001',
    projectName: 'Solar Project A - 10kW On-Grid',
    paymentMethod: 'Bank Transfer',
    accountId: 'ACC-HDFC',
    accountName: 'HDFC Bank',
    amount: 85000,
    status: 'Paid',
    notes: 'Payment for 550W Mono PERC Panels (Batch 45)',
    createdBy: 'Purchase Manager',
    sourceModule: 'purchases',
    sourceId: 'PUR-SAMPLE-01',
    debitAccount: 'ABC Solar Distributor',
    creditAccount: 'HDFC Bank',
    createdAt: '2026-08-27T09:15:00Z',
  },
  {
    id: 'COUT-2026-0002',
    date: '2026-08-27',
    time: '12:20 PM',
    paidTo: 'Transport Vendor (Jaunpur Logistics)',
    category: 'Transport Payment',
    reason: 'Freight & dispatch for Solar Project A mounting structures',
    referenceNo: 'EXP-021',
    projectId: 'PRJ-2026-001',
    projectName: 'Solar Project A - 10kW On-Grid',
    paymentMethod: 'Cash',
    accountId: 'ACC-CASH',
    accountName: 'Cash in Hand',
    amount: 12500,
    status: 'Paid',
    notes: 'Local mini truck transport to Babhanauli installation site',
    createdBy: 'Site Engineer',
    sourceModule: 'expenses',
    sourceId: 'EXP-SAMPLE-01',
    debitAccount: 'Transport Expense',
    creditAccount: 'Cash in Hand',
    createdAt: '2026-08-27T12:20:00Z',
  },
  {
    id: 'COUT-2026-0003',
    date: '2026-08-26',
    time: '02:00 PM',
    paidTo: 'Vikas Verma (Lead Electrician)',
    category: 'Employee Salary',
    reason: 'Monthly technician salary for August',
    referenceNo: 'SAL-08',
    employeeId: 'EMP-01',
    paymentMethod: 'Bank Transfer',
    accountId: 'ACC-SBI',
    accountName: 'SBI Bank',
    amount: 35000,
    status: 'Paid',
    notes: 'August 2026 salary disbursement via direct IMPS',
    createdBy: 'HR / Admin',
    sourceModule: 'employees',
    sourceId: 'SAL-SAMPLE-01',
    debitAccount: 'Salary Expense',
    creditAccount: 'SBI Bank',
    createdAt: '2026-08-26T14:00:00Z',
  },
  {
    id: 'COUT-2026-0004',
    date: '2026-08-25',
    time: '04:10 PM',
    paidTo: 'Government of India - GST Portal (Jaunpur Division)',
    category: 'GST Payment',
    reason: 'Monthly GST liability settlement (GSTR-3B)',
    referenceNo: 'GST-2026-08-CHAL',
    paymentMethod: 'Bank Transfer',
    accountId: 'ACC-HDFC',
    accountName: 'HDFC Bank',
    amount: 45000,
    status: 'Paid',
    notes: 'GST e-Payment Challan CPIN #9988224411 paid via corporate NetBanking',
    createdBy: 'Accountant',
    sourceModule: 'gst',
    debitAccount: 'GST Output Liability',
    creditAccount: 'HDFC Bank',
    createdAt: '2026-08-25T16:10:00Z',
  },
  {
    id: 'COUT-2026-0005',
    date: '2026-08-24',
    time: '05:30 PM',
    paidTo: 'UTL Solar Power Solutions',
    category: 'Distributor / Supplier Payment',
    referenceNo: 'PUR-2026-0038',
    distributorId: 'DIST-002',
    paymentMethod: 'Bank Transfer',
    accountId: 'ACC-ICICI',
    accountName: 'ICICI Bank',
    amount: 150000,
    status: 'Paid',
    notes: 'Inverter supply consignment clearance',
    createdBy: 'Purchase Manager',
    sourceModule: 'purchases',
    sourceId: 'PUR-SAMPLE-02',
    debitAccount: 'UTL Solar Power Solutions',
    creditAccount: 'ICICI Bank',
    createdAt: '2026-08-24T17:30:00Z',
  },
  {
    id: 'COUT-2026-0006',
    date: '2026-08-23',
    time: '11:00 AM',
    paidTo: 'Office Landlord (Babhanauli Complex)',
    category: 'Rent',
    reason: 'Monthly office and warehouse yard rent',
    referenceNo: 'RENT-AUG-26',
    paymentMethod: 'UPI',
    accountId: 'ACC-ICICI',
    accountName: 'ICICI Bank',
    amount: 13100,
    status: 'Paid',
    notes: 'August 2026 office lease rent payment',
    createdBy: 'Admin',
    sourceModule: 'expenses',
    debitAccount: 'Rent Expense',
    creditAccount: 'ICICI Bank',
    createdAt: '2026-08-23T11:00:00Z',
  },
];

export const initialAccountTransfers: AccountTransfer[] = [
  {
    id: 'TRF-2026-0001',
    transferDate: '2026-08-22',
    time: '11:30 AM',
    fromAccountId: 'ACC-HDFC',
    fromAccountName: 'HDFC Bank',
    toAccountId: 'ACC-CASH',
    toAccountName: 'Cash in Hand',
    amount: 50000,
    paymentMethod: 'Cash',
    referenceNo: 'ATM-WDL-9921',
    notes: 'Self ATM Cash withdrawal for office drawer replenish',
    createdBy: 'Accountant',
    cashOutId: 'COUT-TRF-01',
    cashInId: 'CIN-TRF-01',
    createdAt: '2026-08-22T11:30:00Z',
  },
];


