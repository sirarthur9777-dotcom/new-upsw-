export type TabType =
  | 'dashboard'
  | 'customers'
  | 'projects'
  | 'billing'
  | 'quotation'
  | 'payments'
  | 'accounting'
  | 'inventory'
  | 'expenses'
  | 'employees'
  | 'reports'
  | 'settings'
  | 'purchases'
  | 'purchase-returns'
  | 'distributors';

export type UserRole = 'Admin' | 'Manager' | 'Technician' | 'Accountant';

export type SystemType = 'On Grid' | 'Off Grid' | 'Hybrid';

export type ProjectType = 'Residential' | 'Commercial' | 'Industrial' | 'Government';

export type ProjectStatus = 'Pending' | 'Running' | 'Completed' | 'Cancelled';

export type InventoryCategory =
  | 'VFD'
  | 'Solar Panel'
  | 'Installation'
  | 'Solar Panels'
  | 'Inverters'
  | 'Batteries'
  | 'Wires'
  | 'MCB'
  | 'Structure'
  | 'Tools'
  | string;

export type PaymentMode = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';

export type PaymentStatus = 'Paid' | 'Partial' | 'Pending';

export type ExpenseCategory =
  | 'Fuel'
  | 'Transport'
  | 'Labour'
  | 'Material Purchase'
  | 'Office Expense'
  | 'Electricity'
  | 'Salary'
  | 'Miscellaneous';

export type ThemeAccent = 'blue' | 'amber' | 'indigo' | 'purple' | 'emerald' | 'cyan';

export type ThemeStyle = 'google' | 'stripe' | 'linear' | 'notion' | 'vercel';

export interface CustomerDocument {
  id: string;
  title: string;
  fileType: string;
  uploadDate: string;
  size: string;
}

export interface Customer {
  id: string;
  name: string;
  fatherName: string;
  mobile: string;
  altMobile?: string;
  email: string;
  address: string;
  village: string;
  block: string;
  district: string;
  state: string;
  stateCode?: string;
  pincode: string;
  aadharNumber: string;
  panNumber?: string;
  gstNumber?: string;
  shippingName?: string;
  shippingAddress?: string;
  shippingMobile?: string;
  shippingState?: string;
  shippingStateCode?: string;
  shippingGst?: string;
  shippingPan?: string;
  projectType: ProjectType;
  photoUrl?: string;
  documents: CustomerDocument[];
  createdAt: string;
}

export interface Project {
  id: string;
  projectId: string; // e.g. PRJ-2026-001
  customerId: string;
  customerName: string;
  customerMobile: string;
  projectType: ProjectType;
  systemType: SystemType;
  capacityKW: number;
  panelsCount: number;
  panelModel: string;
  inverterModel: string;
  batteryCount?: number;
  batteryModel?: string;
  structureType: string;
  installationDate: string;
  completionDate?: string;
  warrantyYears: number;
  technicianAssigned: string;
  status: ProjectStatus;
  progressPercent: number;
  location: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  model?: string;
  hsnCode?: string;
  serialNumbers?: string;
  quantity: number;
  unit: string;
  rate: number;
  gstPercent: number;
  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
  igstRate?: number;
  igstAmount?: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  customerGst?: string;
  customerPan?: string;
  customerState?: string;
  customerStateCode?: string;
  
  // Shipped To Consignee
  shippingName?: string;
  shippingAddress?: string;
  shippingMobile?: string;
  shippingGst?: string;
  shippingPan?: string;
  shippingState?: string;
  shippingStateCode?: string;

  // Invoice Details
  date: string;
  invoiceTime?: string;
  dueDate: string;
  placeOfSupply?: string;
  reverseCharge?: string; // 'Yes' | 'No'

  // Transport & Dispatch
  grNo?: string;
  transportName?: string;
  vehicleNo?: string;
  station?: string;
  ewayBillNo?: string;
  copyType?: string; // 'ORIGINAL FOR RECIPIENT' | 'DUPLICATE FOR TRANSPORTER' | 'TRIPLICATE FOR SUPPLIER'

  projectId?: string;
  projectType?: ProjectType;
  items: InvoiceItem[];
  subtotal: number;
  cgstTotal?: number;
  sgstTotal?: number;
  igstTotal?: number;
  taxTotal: number;
  otherCharges?: number;
  discountTotal: number;
  roundOff?: number;
  grandTotal: number;
  advancePaid: number;
  remainingBalance: number;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  isLocked?: boolean;
  termsAndConditions?: string;
  notes?: string;
}

export interface QuotationItem {
  id: string;
  description: string;
  name?: string;
  brand?: string;
  model?: string;
  hsnCode?: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  /** Product serial number(s), comma or line-break separated. */
  serialNumbers?: string;
  discount?: number;
  taxRate?: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress?: string;
  customerState?: string;
  customerStateCode?: string;
  customerGstin?: string;
  shippingName?: string;
  shippingAddress?: string;
  shippingMobile?: string;
  shippingState?: string;
  shippingStateCode?: string;
  shippingGstin?: string;
  placeOfSupply?: string;
  reverseCharge?: string;
  delivery?: string;
  paymentTerms?: string;
  installation?: string;
  warranty?: string;
  projectType: ProjectType;
  systemType: SystemType;
  capacityKW: number;
  items: QuotationItem[];
  estimatedCost: number;
  taxAmount: number;
  grandTotal: number;
  validityDays: number;
  validUntil: string;
  termsAndConditions: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Converted';
  convertedInvoiceId?: string;
  createdAt: string;
  notes?: string;
}

export interface Product {
  id: string; // unique product ID (e.g. 'PROD-INVT-25HP')
  productId?: string;
  ownerUid?: string; // Firebase Auth user UID for privacy isolation
  category: InventoryCategory;
  productName: string;
  model?: string;
  make: string; // e.g. 'INVT', 'UTL', 'UBSW'
  hsnCode?: string; // HSN / SAC Code
  purchasePrice: number;
  margin: number; // percentage (e.g. 10 for 10%)
  salePrice: number;
  gstPercent?: number; // GST percentage (e.g. 18 for 18%)
  gst?: number | string;
  stock: number;
  minStockAlert?: number;
  unit: string;
  status: 'Active' | 'Inactive';
  isDefaultProduct?: boolean;
  autoCalculateSalePrice?: boolean;
  specifications?: string;
  supplier?: string;
  location?: string;
  barcode?: string;
  createdAt?: string;
  updatedAt?: string;
  // Compatibility helpers
  name?: string;
  brand?: string;
  currentStock?: number;
  unitPrice?: number;
  sellingPrice?: number;
  lastUpdated?: string;
}

export interface InventoryItem extends Product {
  name: string;
  brand: string;
  currentStock: number;
  minStockAlert: number;
  unitPrice: number;
  sellingPrice?: number;
  lastUpdated: string;
}

export interface StockLog {
  id: string;
  itemId: string;
  itemName: string;
  type: 'Stock In' | 'Stock Out';
  quantity: number;
  date: string;
  notes: string;
  refNo: string;
}

export interface Payment {
  id: string;
  receiptNo: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  transactionRef: string;
  notes?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paidTo: string;
  paymentMethod: PaymentMode;
  notes?: string;
  receiptUrl?: string;
  projectId?: string;
  projectName?: string;
  vendor?: string;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  designation: string;
  department?: string;
  phone: string;
  email: string;
  joiningDate: string;
  salary: number;
  status: 'Active' | 'On Leave' | 'Inactive';
  attendanceToday: 'Present' | 'Absent' | 'Leave' | 'Half Day';
  photoUrl?: string;
  assignedProjects: string[]; // project IDs
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
}

export interface CompanySettings {
  ownerUid?: string;
  companyName: string;
  tagline: string;
  gstNumber: string;
  panNumber?: string;
  state?: string;
  stateCode?: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  bankName: string;
  accountHolderName?: string;
  accountNumber: string;
  ifscCode: string;
  bankBranch: string;
  upiId: string;
  upiQrUrl: string;
  logoUrl: string;
  signatureUrl?: string;
  authorizedSignatoryName?: string;
  termsAndConditions?: string;
  invoicePrefix: string;
  autoSave: boolean;
  themeMode: 'dark' | 'light';
  themeAccent: ThemeAccent;
  themeStyle: ThemeStyle;
}

export interface AppNotification {
  id: string;
  type: 'payment' | 'project' | 'stock' | 'installation';
  title: string;
  message: string;
  date: string;
  read: boolean;
  linkTab?: TabType;
}

export interface PrintData {
  type: 'invoice' | 'quotation' | 'customer_card' | 'receipt' | 'purchase_voucher';
  payload: any;
}

export interface DistributorBankDetails {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
}

export interface Distributor {
  id: string; // e.g. DIST-001
  companyName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  gstin?: string;
  gstNumber?: string;
  panNumber?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankDetails?: DistributorBankDetails;
  paymentTerms?: string; // e.g. 'Immediate', '15 Days', 'Net 30', 'Advance'
  totalPurchases?: number;
  outstandingAmount?: number;
  status: 'Active' | 'Inactive';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PurchaseItem {
  id: string;
  productId: string; // Reference to existing Inventory Product ID (e.g. PROD-INVT-25HP or custom ID)
  productName: string;
  sku?: string;
  category: string;
  brand?: string;
  make?: string;
  model?: string;
  hsnCode?: string;
  unit: string;
  quantity?: number; // Purchased Qty
  orderedQuantity?: number;
  receivedQuantity: number; // Received Qty
  pendingQuantity?: number; // Purchased Qty - Received Qty
  rate?: number; // Purchase Rate per unit
  unitPrice?: number;
  discount?: number; // Total discount for this row
  discountPercent?: number;
  discountAmount?: number;
  gstPercent?: number; // GST Rate (e.g. 18 for 18%)
  gstRate?: number;
  taxableAmount: number; // (quantity * rate) - discount
  gstAmount?: number; // taxableAmount * (gstPercent / 100)
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  total?: number; // taxableAmount + gstAmount
  totalAmount?: number;
  serialNumbers?: string[];
  batchNumber?: string;
  expectedDeliveryDate?: string;
}

export interface PurchaseDocument {
  id: string;
  name: string;
  fileType: string;
  size?: string;
  url: string;
  uploadDate: string;
}

export interface Purchase {
  id: string; // e.g. PUR-2026-0001
  invoiceNumber: string; // Supplier Bill / Invoice No.
  purchaseDate: string; // YYYY-MM-DD
  dueDate?: string;
  paymentTerms?: string;
  distributorId: string; // Reference to Distributor ID
  distributorName: string;
  distributorMobile?: string;
  distributorGstin?: string;
  distributorGst?: string;
  supplierInvoiceNumber?: string;
  projectId?: string; // Reference to optional Project/Site
  projectName?: string;
  purchaseOrderNumber?: string; // PO Number
  grnNumber?: string; // Goods Receipt Note
  grnDate?: string;
  receivedDate?: string;
  receivedBy?: string;
  materialCondition?: 'Good' | 'Damaged' | 'Short Received';
  receivingNotes?: string;
  items: PurchaseItem[];
  subtotal: number;
  totalDiscount: number;
  taxableAmount?: number;
  totalGst?: number;
  totalTax?: number;
  cgstTotal?: number;
  sgstTotal?: number;
  igstTotal?: number;
  shippingCharges?: number;
  roundOff?: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus; // 'Paid' | 'Partial' | 'Pending' | 'Unpaid'
  paymentMode?: PaymentMode | 'Bank Transfer' | 'RTGS' | 'UPI' | 'Cheque' | 'Cash' | 'Credit';
  paymentDate?: string;
  paymentRefNumber?: string;
  paymentReference?: string;
  waybillNumber?: string;
  vehicleNumber?: string;
  dispatchLocation?: string;
  documents?: PurchaseDocument[];
  notes?: string;
  status: 'Draft' | 'Ordered' | 'Partially Received' | 'Partial' | 'Received' | 'Pending' | 'Cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface PurchaseReturn {
  id: string; // e.g. RET-2026-0001
  purchaseId?: string; // Original Purchase ID
  purchaseInvoiceNumber?: string;
  debitNoteNumber?: string;
  distributorId: string;
  distributorName: string;
  returnDate: string;
  productId: string; // Existing Inventory Product ID
  productName: string;
  quantity: number;
  unit?: string;
  unitPrice?: number;
  returnReason: 'Damaged' | 'Wrong Product' | 'Excess Quantity' | 'Quality Issue' | 'Other' | 'Damaged in Transit' | 'Defective' | 'Wrong Specification' | 'Excess Stock' | 'Warranty Replacement';
  returnAmount: number;
  status: 'Pending' | 'Completed' | 'Rejected' | 'Approved' | 'Refunded' | 'Replaced';
  notes?: string;
  createdAt: string;
}

// ----------------------------------------------------
// CASH IN / CASH OUT & ACCOUNTING SYSTEM TYPES
// ----------------------------------------------------

export type AccountingPaymentMethod =
  | 'Cash'
  | 'Bank Transfer'
  | 'UPI'
  | 'NEFT'
  | 'RTGS'
  | 'IMPS'
  | 'Cheque'
  | 'Card'
  | 'Other';

export type AccountType = 'Cash' | 'Bank' | 'Digital Wallet' | 'Petty Cash';

export interface CashBankAccount {
  id: string; // e.g. 'ACC-CASH', 'ACC-HDFC', 'ACC-ICICI', 'ACC-SBI', 'ACC-PETTY'
  name: string; // e.g. 'Cash in Hand', 'HDFC Bank', 'ICICI Bank'
  accountType: AccountType;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  upiId?: string;
  openingBalance: number;
  currentBalance?: number; // Calculated dynamic balance
  minBalanceAlert?: number;
  isActive?: boolean;
  status?: 'Active' | 'Inactive';
  isDefault?: boolean;
  ownerUid?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type CashInSource =
  | 'Customer Invoice Payment'
  | 'Advance from Customer'
  | 'Sales Receipt'
  | 'Payment Received'
  | 'Loan Received'
  | 'Capital Introduced'
  | 'Refund Received'
  | 'Other Income'
  | 'Other Receipts'
  | 'Account Transfer / Contra'
  | string;

export type CashInStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Reversed';

export type CashInSourceType = CashInSource;

export type ChequeStatus = 'Pending' | 'Deposited' | 'Cleared' | 'Bounced' | 'Cancelled';

export interface CashInTransaction {
  id: string; // e.g. 'CIN-2026-0001'
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  sourceType: CashInSource;
  fromWhom: string; // Customer / Entity Name
  customerId?: string;
  invoiceId?: string;
  referenceNo: string; // e.g. INV-1025, ADV-003, RCPT-001
  projectId?: string;
  projectName?: string;
  paymentMethod: AccountingPaymentMethod;
  accountId: string; // Target Cash/Bank Account ID
  accountName: string; // Display Account Name
  amount: number;
  status: CashInStatus;
  notes?: string;
  createdBy: string;

  // Cheque details
  chequeNumber?: string;
  chequeDate?: string;
  chequeBankName?: string;
  chequeStatus?: ChequeStatus;
  chequeClearedDate?: string;

  // Source linking for deduplication & multi-module sync
  sourceModule?: 'billing' | 'payments' | 'manual' | 'quotation' | 'transfer' | 'other';
  sourceId?: string; // unique ID of payment/invoice

  // Accounting Ledger
  debitAccount?: string; // e.g. HDFC Bank
  creditAccount?: string; // e.g. ABC Customer

  ownerUid?: string;
  createdAt: string;
  updatedAt?: string;
}

export type CashOutCategory =
  | 'Purchase Bill Payment'
  | 'Distributor / Supplier Payment'
  | 'Expense Payment'
  | 'Employee Salary'
  | 'Employee Advance'
  | 'Transport Payment'
  | 'Labour Payment'
  | 'Project Expense'
  | 'Electricity Bill'
  | 'Office Expense'
  | 'Rent'
  | 'Loan Repayment'
  | 'Tax Payment'
  | 'GST Payment'
  | 'Bank Charges'
  | 'Refund to Customer'
  | 'Account Transfer / Contra'
  | 'Other Payments'
  | string;

export type CashOutStatus = 'Draft' | 'Pending' | 'Paid' | 'Cancelled' | 'Reversed';

export interface CashOutTransaction {
  id: string; // e.g. 'COUT-2026-0001'
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  paidTo: string; // Vendor, Employee, Authority Name
  category: CashOutCategory;
  reason?: string;
  referenceNo: string; // e.g. PUR-2026-0045, EXP-021, SAL-08, GST-2026-08
  distributorId?: string;
  purchaseId?: string;
  expenseId?: string;
  employeeId?: string;
  projectId?: string;
  projectName?: string;
  paymentMethod: AccountingPaymentMethod;
  accountId: string; // Source Cash/Bank Account ID
  accountName: string; // Display Account Name
  amount: number;
  status: CashOutStatus;
  notes?: string;
  createdBy: string;

  // Cheque details
  chequeNumber?: string;
  chequeDate?: string;
  chequeBankName?: string;
  chequeStatus?: ChequeStatus;
  chequeClearedDate?: string;

  // Source linking for deduplication & multi-module sync
  sourceModule?: 'purchases' | 'expenses' | 'employees' | 'gst' | 'manual' | 'transfer' | 'other';
  sourceId?: string;

  // Accounting Ledger
  debitAccount?: string; // e.g. ABC Solar Distributor / Office Rent Account
  creditAccount?: string; // e.g. HDFC Bank

  ownerUid?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AccountTransfer {
  id: string;
  transferDate: string;
  time?: string;
  fromAccountId: string;
  fromAccountName: string;
  toAccountId: string;
  toAccountName: string;
  amount: number;
  paymentMethod: AccountingPaymentMethod;
  referenceNo: string;
  notes?: string;
  createdBy: string;
  cashOutId: string;
  cashInId: string;
  ownerUid?: string;
  createdAt: string;
}

export interface GeneralLedgerEntry {
  id: string;
  date: string;
  time?: string;
  referenceNo: string;
  transactionType: 'Cash In' | 'Cash Out' | 'Transfer' | 'Journal';
  particulars: string;
  entityName: string;
  categoryOrSource: string;
  projectId?: string;
  projectName?: string;
  paymentMethod: AccountingPaymentMethod;
  accountId: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  balanceAfter?: number;
  status: string;
  notes?: string;
  voucherId?: string;
}

// ----------------------------------------------------
// SERVICE TICKETS, SUBSIDY & NET METERING TYPES
// ----------------------------------------------------

export interface ServiceTicket {
  id: string;
  ticketNo: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  projectId?: string;
  projectName?: string;
  issueDescription: string;
  category: 'Inverter Fault' | 'Panel Cleaning' | 'Wiring / MCB' | 'Zero Generation' | 'Physical Damage' | 'General Maintenance';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo: string;
  createdDate: string;
  resolvedDate?: string;
  resolutionNotes?: string;
}

export interface SubsidyRecord {
  id: string;
  applicationNo: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  projectId?: string;
  capacityKW: number;
  portal: 'PM Surya Ghar Muft Bijli Yojana' | 'UPNEDA Solar Subsidy Portal';
  discomName: string;
  consumerNo: string;
  subsidyAmount: number;
  status: 'Applied' | 'Inspection Scheduled' | 'Site Verified' | 'Sanctioned' | 'Released to Account' | 'Rejected';
  appliedDate: string;
  sanctionDate?: string;
  releaseDate?: string;
  remarks?: string;
}

export interface NetMeteringRecord {
  id: string;
  applicationNo: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  projectId?: string;
  sanctionedLoadKW: number;
  solarCapacityKW: number;
  discomOffice: string;
  status: 'Application Submitted' | 'Technical Feasibility Approved' | 'Meter Testing Paid' | 'Bidirectional Meter Installed' | 'Synchronization & Commissioned';
  submissionDate: string;
  meterInstallationDate?: string;
  commissioningDate?: string;
  remarks?: string;
}

// ----------------------------------------------------
// GEMINI AI ASSISTANT & CHATBOT TYPES
// ----------------------------------------------------

export interface ChatToolCall {
  name: string;
  args: Record<string, any>;
  result?: any;
}

export interface ChatAction {
  type: string;
  summary: string;
  data: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ChatToolCall[];
  actions?: ChatAction[];
  modelUsed?: string;
}


