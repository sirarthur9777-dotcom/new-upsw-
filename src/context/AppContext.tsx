import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TabType,
  UserRole,
  Customer,
  Project,
  Invoice,
  PaymentStatus,
  Quotation,
  Product,
  InventoryItem,
  StockLog,
  Payment,
  Expense,
  Employee,
  AuditLog,
  CompanySettings,
  AppNotification,
  PrintData,
  ThemeAccent,
  ThemeStyle,
  Distributor,
  Purchase,
  PurchaseItem,
  PurchaseReturn,
  CashBankAccount,
  CashInTransaction,
  CashOutTransaction,
  AccountTransfer,
  GeneralLedgerEntry,
  AccountingPaymentMethod,
  ChequeStatus,
  ServiceTicket,
  SubsidyRecord,
  NetMeteringRecord,
  ChatAction,
} from '../types';
import {
  INITIAL_SERVICE_TICKETS,
  INITIAL_SUBSIDY_RECORDS,
  INITIAL_NET_METERING_RECORDS,
} from '../data/solarRecordsData';
import {
  initialCompanySettings,
  initialCustomers,
  initialProjects,
  initialInvoices,
  initialQuotations,
  initialProducts,
  initialInventory,
  initialStockLogs,
  initialPayments,
  initialExpenses,
  initialEmployees,
  initialAuditLogs,
  initialNotifications,
  initialDistributors,
  initialPurchases,
  initialPurchaseReturns,
  initialAccounts,
  initialCashInTransactions,
  initialCashOutTransactions,
  initialAccountTransfers,
} from '../data/mockData';
import { DEFAULT_PRODUCTS } from '../data/defaultProducts';
import {
  auth,
  db,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  getDocs,
  getDocFromServer,
  query,
  where
} from '../lib/firebase';

export const formatINR = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  const hasDecimals = val % 1 !== 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(val);
};

export const calculateSalePrice = (purchasePrice: number, margin: number): number => {
  const p = Number(purchasePrice) || 0;
  const m = Number(margin) || 0;
  const calc = p * (1 + m / 100);
  return Number(calc.toFixed(2));
};

export type SyncStatus = 'connected' | 'syncing' | 'offline';

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;

  // Firebase Auth & Cloud Sync
  user: User | null;
  authLoading: boolean;
  logout: () => Promise<void>;
  loginAsDemo: (demoEmail?: string, demoName?: string) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  isCloudSynced: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  themeAccent: ThemeAccent;
  setThemeAccent: (accent: ThemeAccent) => void;
  themeStyle: ThemeStyle;
  setThemeStyle: (style: ThemeStyle) => void;

  // Data Collections
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'projectId'>) => Project;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  quotations: Quotation[];
  addQuotation: (quotation: Omit<Quotation, 'id' | 'quoteNumber' | 'createdAt'>) => Quotation;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  convertQuotationToInvoice: (quoteId: string) => Invoice | null;

  // Product Master Data & Real-Time Sync
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteMultipleProducts: (ids: string[]) => Promise<number>;
  duplicateProduct: (id: string) => Promise<Product>;
  toggleProductStatus: (id: string) => Promise<void>;
  adjustProductStock: (
    id: string,
    quantity: number,
    type: 'Stock In' | 'Stock Out',
    refNo?: string,
    notes?: string
  ) => Promise<void>;
  bulkImportProducts: (
    importedProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]
  ) => Promise<number>;
  reseedDefaultProducts: (force?: boolean) => Promise<void>;

  // Inventory compatibility
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => InventoryItem;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  recordStockLog: (log: Omit<StockLog, 'id' | 'date'>) => void;
  stockLogs: StockLog[];

  // Purchase Management & Distributors
  purchases: Purchase[];
  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => Promise<Purchase>;
  updatePurchase: (id: string, purchase: Partial<Purchase>) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;

  distributors: Distributor[];
  addDistributor: (distributor: Omit<Distributor, 'id' | 'createdAt'>) => Promise<Distributor>;
  updateDistributor: (id: string, distributor: Partial<Distributor>) => Promise<void>;
  deleteDistributor: (id: string) => Promise<void>;

  purchaseReturns: PurchaseReturn[];
  addPurchaseReturn: (ret: Omit<PurchaseReturn, 'id' | 'createdAt'>) => Promise<PurchaseReturn>;
  updatePurchaseReturn: (id: string, ret: Partial<PurchaseReturn>) => Promise<void>;
  deletePurchaseReturn: (id: string) => Promise<void>;

  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'receiptNo'>) => Payment;

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  deleteExpense: (id: string) => void;

  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  auditLogs: AuditLog[];
  logAction: (module: string, action: string, details: string) => void;

  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Modals & Print
  printData: PrintData | null;
  setPrintData: (data: PrintData | null) => void;
  triggerPrint: (type: PrintData['type'], payload: any) => void;

  globalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;
  auditLogOpen: boolean;
  setAuditLogOpen: (open: boolean) => void;

  // Backup & Import/Export
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonString: string) => boolean;
  bulkImportCustomers: (importedCustomers: Partial<Customer>[]) => void;
  exportToCSV: (filename: string, rows: any[]) => void;

  // Cash In / Cash Out & Accounting System
  accounts: CashBankAccount[];
  cashInTransactions: CashInTransaction[];
  cashOutTransactions: CashOutTransaction[];
  accountTransfers: AccountTransfer[];

  // Account Actions
  addAccount: (account: Omit<CashBankAccount, 'id' | 'createdAt'>) => Promise<string>;
  updateAccount: (id: string, updates: Partial<CashBankAccount>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  // Cash In Actions
  addCashIn: (transaction: Omit<CashInTransaction, 'id' | 'createdAt'>) => Promise<string>;
  updateCashIn: (id: string, updates: Partial<CashInTransaction>) => Promise<void>;
  deleteCashIn: (id: string) => Promise<void>;

  // Cash Out Actions
  addCashOut: (transaction: Omit<CashOutTransaction, 'id' | 'createdAt'>) => Promise<string>;
  updateCashOut: (id: string, updates: Partial<CashOutTransaction>) => Promise<void>;
  deleteCashOut: (id: string) => Promise<void>;

  // Transfers, Cheque clearing, Reversals, Calculations
  addAccountTransfer: (transfer: Omit<AccountTransfer, 'id' | 'createdAt' | 'cashInId' | 'cashOutId'>) => Promise<string>;
  reverseTransaction: (type: 'cash_in' | 'cash_out' | 'in' | 'out', id: string, reason?: string) => Promise<void>;
  updateChequeStatus: (type: 'cash_in' | 'cash_out', id: string, chequeStatus: ChequeStatus, clearedDate?: string) => Promise<void>;
  getAccountCalculatedBalance: (accountId: string) => number;
  totalAvailableCash: number;

  // Service Tickets, Subsidies & Net Metering
  serviceTickets: ServiceTicket[];
  addServiceTicket: (ticket: Omit<ServiceTicket, 'id' | 'ticketNo' | 'createdDate'>) => Promise<string>;
  updateServiceTicket: (id: string, updates: Partial<ServiceTicket>) => Promise<void>;
  subsidyRecords: SubsidyRecord[];
  netMeteringRecords: NetMeteringRecord[];

  // Gemini AI Assistant & Live Voice
  isAiAssistantOpen: boolean;
  setIsAiAssistantOpen: (open: boolean) => void;
  isVoiceLiveActive: boolean;
  setIsVoiceLiveActive: (active: boolean) => void;
  applyChatAction: (action: ChatAction) => Promise<void>;
  getErpStateSnapshot: () => any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'solarix_erp_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('Admin');

  // Firebase Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Login as Demo Admin Mode
  const loginAsDemo = (demoEmail?: string, demoName?: string) => {
    const demoUser = {
      uid: 'demo-solarix-admin-01',
      displayName: demoName || 'Solar EPC Admin (Demo)',
      email: demoEmail || 'admin@solarix.com',
      photoURL: null,
      isDemo: true
    };
    setUser(demoUser as any);
    // Explicitly populate demo data for evaluation preview ONLY
    setCustomers(initialCustomers);
    setProjects(initialProjects);
    setInvoices(initialInvoices);
    setQuotations(initialQuotations);
    setStockLogs(initialStockLogs);
    setDistributors(initialDistributors);
    setPurchases(initialPurchases);
    setPurchaseReturns(initialPurchaseReturns);
    setPayments(initialPayments);
    setExpenses(initialExpenses);
    setEmployees(initialEmployees);
    setAuditLogs(initialAuditLogs);
    setNotifications(initialNotifications);
    setAccounts(initialAccounts);
    setCashInTransactions(initialCashInTransactions);
    setCashOutTransactions(initialCashOutTransactions);
    setAccountTransfers(initialAccountTransfers);
    setServiceTickets(INITIAL_SERVICE_TICKETS);
    setSubsidyRecords(INITIAL_SUBSIDY_RECORDS);
    setNetMeteringRecords(INITIAL_NET_METERING_RECORDS);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_demo_user`, JSON.stringify(demoUser));
  };

  // Logout Handler
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setCustomers([]);
      setProjects([]);
      setInvoices([]);
      setQuotations([]);
      setProducts([]);
      setInventory([]);
      setStockLogs([]);
      setDistributors([]);
      setPurchases([]);
      setPurchaseReturns([]);
      setPayments([]);
      setExpenses([]);
      setEmployees([]);
      setAuditLogs([]);
      setNotifications([]);
      setAccounts([]);
      setCashInTransactions([]);
      setCashOutTransactions([]);
      setAccountTransfers([]);
      setServiceTickets([]);
      setSubsidyRecords([]);
      setNetMeteringRecords([]);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_demo_user`);
    }
  };

  // Load or Initialize State
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_settings`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.companyName || parsed.companyName.includes('Solarix')) {
          return { ...initialCompanySettings, ...parsed, companyName: 'Upadhyay Brother Solar Works', phone: '+91 98193 91461', gstNumber: '09AEIPU6555N1Z1', address: 'Babhanauli Damrua, Jaunpur', upiId: 'usatyam30-5@okicici', logoUrl: initialCompanySettings.logoUrl };
        }
        return { ...initialCompanySettings, ...parsed };
      } catch (e) {
        return initialCompanySettings;
      }
    }
    return initialCompanySettings;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return companySettings.themeMode === 'dark';
  });

  const [themeAccent, setThemeAccent] = useState<ThemeAccent>(companySettings.themeAccent || 'blue');
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>(companySettings.themeStyle || 'stripe');

  // ZERO DEMO DATA POLICY:
  // For all real users and fresh instances, all ERP collections start completely empty ([]).
  // Mock data is ONLY populated if demo mode is explicitly activated via loginAsDemo().
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  const LEGACY_DEFAULT_PRODUCT_IDS = new Set([
    'PROD-INVT-25HP',
    'PROD-INVT-30HP',
    'PROD-INVT-40HP',
    'PROD-UTL-227W',
    'PROD-UBSW-CCHAN',
    'PROD-UBSW-STAT',
    'PROD-UBSW-ENDCLAMP',
    'PROD-UBSW-MIDCLAMP',
    'PROD-UBSW-LA',
    'PROD-UBSW-DCDB',
    'PROD-UBSW-ACDB',
    'PROD-UBSW-EARTHING',
  ]);

  // Inventory & Products: Must always start at ZERO entries (0 products)
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connected');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => new Date().toLocaleTimeString());

  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Cash In / Cash Out & Accounting System State: ZERO DEMO DATA
  const [accounts, setAccounts] = useState<CashBankAccount[]>([]);
  const [cashInTransactions, setCashInTransactions] = useState<CashInTransaction[]>([]);
  const [cashOutTransactions, setCashOutTransactions] = useState<CashOutTransaction[]>([]);
  const [accountTransfers, setAccountTransfers] = useState<AccountTransfer[]>([]);

  // Service Tickets, Subsidies & Net Metering State: ZERO DEMO DATA
  const [serviceTickets, setServiceTickets] = useState<ServiceTicket[]>([]);
  const [subsidyRecords, setSubsidyRecords] = useState<SubsidyRecord[]>([]);
  const [netMeteringRecords, setNetMeteringRecords] = useState<NetMeteringRecord[]>([]);

  // Gemini Assistant & Live Voice Modal States
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isVoiceLiveActive, setIsVoiceLiveActive] = useState(false);

  const addServiceTicket = async (ticketData: Omit<ServiceTicket, 'id' | 'ticketNo' | 'createdDate'>): Promise<string> => {
    const ticketNo = `SRV-${String(serviceTickets.length + 1).padStart(3, '0')}`;
    const newTicket: ServiceTicket = {
      ...ticketData,
      id: `TICK-${Date.now()}`,
      ticketNo,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setServiceTickets(prev => [newTicket, ...prev]);
    return newTicket.id;
  };

  const updateServiceTicket = async (id: string, updates: Partial<ServiceTicket>): Promise<void> => {
    setServiceTickets(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const getErpStateSnapshot = () => ({
    customers,
    projects,
    inventory: products,
    invoices,
    payments,
    employees,
    quotations,
    purchases,
    accounts,
    serviceTickets,
    subsidyRecords,
    netMeteringRecords,
  });

  const applyChatAction = async (action: ChatAction) => {
    if (!action || !action.type) return;
    const { type, data } = action;
    switch (type) {
      case 'UPDATE_PROJECT_STATUS': {
        const proj = projects.find(p => p.projectId === data.projectId || p.id === data.projectId);
        if (proj) {
          await updateProject(proj.id, {
            status: data.status,
            progressPercent: data.progressPercent !== undefined ? data.progressPercent : proj.progressPercent,
            notes: data.notes ? `${proj.notes || ''} [AI: ${data.notes}]` : proj.notes,
          });
          logAction('Projects', 'AI Updated Status', `Project ${data.projectId} marked ${data.status}`);
        }
        break;
      }
      case 'ASSIGN_EMPLOYEE': {
        const proj = projects.find(p => p.projectId === data.projectId || p.id === data.projectId);
        if (proj) {
          await updateProject(proj.id, {
            technicianAssigned: data.employeeName,
            notes: data.notes ? `${proj.notes || ''} [AI Assigned: ${data.notes}]` : proj.notes,
          });
          logAction('Projects', 'AI Assigned Technician', `Assigned ${data.employeeName} to ${data.projectId}`);
        }
        break;
      }
      case 'SCHEDULE_INSTALLATION': {
        const proj = projects.find(p => p.projectId === data.projectId || p.id === data.projectId);
        if (proj) {
          await updateProject(proj.id, {
            installationDate: data.installationDate,
            technicianAssigned: data.technicianName || proj.technicianAssigned,
            notes: data.notes ? `${proj.notes || ''} [AI Scheduled: ${data.notes}]` : proj.notes,
          });
          logAction('Projects', 'AI Scheduled Installation', `Project ${data.projectId} on ${data.installationDate}`);
        }
        break;
      }
      case 'RECORD_PAYMENT': {
        const inv = invoices.find(i => i.invoiceNumber === data.invoiceId || i.id === data.invoiceId);
        if (inv) {
          const amt = Number(data.amount) || 0;
          const newPaid = (inv.advancePaid || 0) + amt;
          const newRem = Math.max(0, (inv.grandTotal || 0) - newPaid);
          await updateInvoice(inv.id, {
            advancePaid: newPaid,
            remainingBalance: newRem,
            paymentStatus: newRem <= 0 ? 'Paid' : 'Partial',
          });
          await addPayment({
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            customerId: inv.customerId,
            customerName: inv.customerName,
            amount: amt,
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMode: data.paymentMode || 'Cash',
            transactionRef: data.transactionRef || `AI-TXN-${Date.now().toString().slice(-6)}`,
            notes: data.notes || 'Recorded via AI Assistant',
          });
          logAction('Billing', 'AI Recorded Payment', `Collected ₹${amt.toLocaleString('en-IN')} for ${inv.invoiceNumber}`);
        }
        break;
      }
      case 'CREATE_CUSTOMER': {
        await addCustomer({
          name: data.name,
          fatherName: data.fatherName || '',
          mobile: data.mobile,
          address: data.address,
          village: data.village || '',
          block: '',
          district: data.district || 'Jaunpur',
          state: data.state || 'Uttar Pradesh',
          pincode: data.pincode || '222001',
          aadharNumber: '',
          email: data.email || '',
          projectType: data.projectType || 'Residential',
          documents: [],
        });
        logAction('Customers', 'AI Created Customer', `Customer ${data.name} (${data.mobile})`);
        break;
      }
      case 'UPDATE_CUSTOMER': {
        const cust = customers.find(c => c.id === data.customerId || c.mobile === data.customerId);
        if (cust) {
          const updates: Partial<Customer> = {};
          if (data.name) updates.name = data.name;
          if (data.mobile) updates.mobile = data.mobile;
          if (data.address) updates.address = data.address;
          if (data.projectType) updates.projectType = data.projectType;
          if (data.email) updates.email = data.email;
          await updateCustomer(cust.id, updates);
          logAction('Customers', 'AI Updated Customer', `Customer ${cust.name}`);
        }
        break;
      }
      case 'CREATE_SERVICE_TICKET': {
        setServiceTickets(prev => [data, ...prev]);
        logAction('Service', 'AI Created Service Ticket', `Ticket ${data.ticketNo} for ${data.customerName}`);
        break;
      }
    }
  };

  const [printData, setPrintData] = useState<PrintData | null>(null);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [auditLogOpen, setAuditLogOpen] = useState(false);

  // Listen to Auth State
  useEffect(() => {
    const savedDemo = localStorage.getItem(`${LOCAL_STORAGE_KEY}_demo_user`);
    if (savedDemo) {
      try {
        setUser(JSON.parse(savedDemo));
      } catch (e) {
        // ignore
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        const demo = localStorage.getItem(`${LOCAL_STORAGE_KEY}_demo_user`);
        if (demo) {
          try {
            setUser(JSON.parse(demo));
          } catch (e) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // User-Scoped Real-time Firestore Database Listeners
  useEffect(() => {
    // If not authenticated or demo user:
    if (!user || (user as any).isDemo) {
      setIsCloudSynced(false);
      return;
    }

    const currentUid = user.uid;
    setSyncStatus('syncing');

    // Helper to query and listen to a collection scoped strictly by ownerUid
    const syncUserCollection = <T extends { id: string }>(
      colName: string,
      setState: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      try {
        const q = query(collection(db, colName), where('ownerUid', '==', currentUid));
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            const docs: T[] = [];
            snapshot.forEach((d) => {
              docs.push({ ...d.data(), id: d.id } as T);
            });
            // Authoritative Firestore Sync: what is in Firestore for this authenticated user is the single source of truth
            setState(docs);
            setIsCloudSynced(true);
            setSyncStatus('connected');
            setLastSyncedAt(new Date().toLocaleTimeString());
          },
          (err) => {
            console.warn(`Firestore ${colName} sync note:`, err?.message);
          }
        );
        return unsub;
      } catch (e) {
        console.warn(`Error setting up listener for ${colName}:`, e);
        return () => {};
      }
    };

    // Listen to all ERP collections with ownerUid scoping
    const unsubs: (() => void)[] = [
      syncUserCollection('customers', setCustomers),
      syncUserCollection('projects', setProjects),
      syncUserCollection('invoices', setInvoices),
      syncUserCollection('quotations', setQuotations),
      syncUserCollection('stockLogs', setStockLogs),
      syncUserCollection('distributors', setDistributors),
      syncUserCollection('purchases', setPurchases),
      syncUserCollection('purchaseReturns', setPurchaseReturns),
      syncUserCollection('payments', setPayments),
      syncUserCollection('expenses', setExpenses),
      syncUserCollection('employees', setEmployees),
      syncUserCollection('auditLogs', setAuditLogs),
      syncUserCollection('notifications', setNotifications),
      syncUserCollection('cashInTransactions', setCashInTransactions),
      syncUserCollection('cashOutTransactions', setCashOutTransactions),
      syncUserCollection('accountTransfers', setAccountTransfers),
      syncUserCollection('serviceTickets', setServiceTickets),
      syncUserCollection('subsidyRecords', setSubsidyRecords),
      syncUserCollection('netMeteringRecords', setNetMeteringRecords),
    ];

    // Synchronize accounts with automatic primary Cash in Hand ledger bootstrap
    try {
      const qAccounts = query(collection(db, 'accounts'), where('ownerUid', '==', currentUid));
      const unsubAccounts = onSnapshot(
        qAccounts,
        (snapshot) => {
          const docs: CashBankAccount[] = [];
          snapshot.forEach((d) => {
            docs.push({ ...d.data(), id: d.id } as CashBankAccount);
          });
          if (docs.length === 0) {
            const defaultCash: CashBankAccount = {
              id: 'ACC-CASH',
              name: 'Cash in Hand',
              accountType: 'Cash',
              openingBalance: 0,
              currentBalance: 0,
              status: 'Active',
              isDefault: true,
              ownerUid: currentUid,
              notes: 'Primary Cash Drawer for Solar EPC Operations',
              createdAt: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString().split('T')[0],
            };
            setDoc(doc(db, 'accounts', 'ACC-CASH'), defaultCash).catch(() => {});
            setAccounts([defaultCash]);
          } else {
            setAccounts(docs);
          }
        },
        (err) => {
          console.warn('Firestore accounts sync note:', err?.message);
        }
      );
      unsubs.push(unsubAccounts);
    } catch (e) {
      console.warn('Accounts listener error:', e);
    }

    // Real-time Product Master scoped strictly by ownerUid
    try {
      const qProd = query(collection(db, 'products'), where('ownerUid', '==', currentUid));
      const unsubProd = onSnapshot(
        qProd,
        (snapshot) => {
          const docs: Product[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as Product;
            if (
              data.isDefaultProduct ||
              LEGACY_DEFAULT_PRODUCT_IDS.has(d.id) ||
              LEGACY_DEFAULT_PRODUCT_IDS.has(data.id)
            ) {
              return;
            }

            const purchasePrice = Number(data.purchasePrice ?? data.unitPrice ?? 0);
            const margin = Number(data.margin ?? 10);
            const autoCalc = data.autoCalculateSalePrice !== false;
            const salePrice = Number(
              data.salePrice ??
                data.sellingPrice ??
                calculateSalePrice(purchasePrice, margin)
            );
            const gstPercent =
              data.gstPercent !== undefined
                ? Number(data.gstPercent)
                : data.gst
                ? Number(String(data.gst).replace('%', ''))
                : 18;

            const normalized: Product = {
              ...data,
              id: d.id || data.id,
              productId: data.productId || d.id || data.id,
              ownerUid: currentUid,
              productName: data.productName || data.name || 'Unnamed Product',
              name: data.productName || data.name || 'Unnamed Product',
              model: data.model || data.productName || data.name,
              make: data.make || data.brand || 'UBSW',
              brand: data.make || data.brand || 'UBSW',
              category: data.category || 'General',
              purchasePrice,
              unitPrice: purchasePrice,
              margin,
              salePrice,
              sellingPrice: salePrice,
              gstPercent,
              gst: data.gst || `${gstPercent}%`,
              stock: Number(data.stock ?? data.currentStock ?? 0),
              currentStock: Number(data.stock ?? data.currentStock ?? 0),
              minStockAlert: Number(data.minStockAlert ?? 5),
              unit: data.unit || 'Nos',
              status: data.status || 'Active',
              autoCalculateSalePrice: autoCalc,
              isDefaultProduct: false,
              specifications: data.specifications || '',
              location: data.location || 'Warehouse Main',
              barcode: data.barcode || `890${Date.now().toString().slice(-9)}`,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
              lastUpdated: data.lastUpdated || new Date().toISOString().split('T')[0],
            };
            docs.push(normalized);
          });

          docs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setProducts(docs);
          setInventory(docs as unknown as InventoryItem[]);
        },
        (err) => {
          console.warn('Products sync note:', err?.message);
        }
      );
      unsubs.push(unsubProd);
    } catch (e) {
      // ignore
    }

    // Real-Time Company Settings scoped by user.uid
    try {
      const userSettingsRef = doc(db, 'companySettings', currentUid);
      const unsubSettings = onSnapshot(
        userSettingsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as CompanySettings;
            setCompanySettings(data);
            if (data.themeMode) setIsDarkMode(data.themeMode === 'dark');
            if (data.themeAccent) setThemeAccent(data.themeAccent);
            if (data.themeStyle) setThemeStyle(data.themeStyle);
          } else {
            // First time initialization for new user account
            const initialForUser: CompanySettings = {
              ...initialCompanySettings,
              ownerUid: currentUid,
            };
            setDoc(userSettingsRef, initialForUser).catch(() => {});
          }
        },
        (err) => {
          console.warn('Company settings sync note:', err?.message);
        }
      );
      unsubs.push(unsubSettings);
    } catch (e) {
      // ignore
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [user?.uid]);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Persistence handler (local storage backup)
  useEffect(() => {
    if (companySettings.autoSave) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_settings`, JSON.stringify(companySettings));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_customers`, JSON.stringify(customers));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_projects`, JSON.stringify(projects));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_invoices`, JSON.stringify(invoices));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_quotations`, JSON.stringify(quotations));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_inventory`, JSON.stringify(inventory));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_stockLogs`, JSON.stringify(stockLogs));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_distributors`, JSON.stringify(distributors));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_purchases`, JSON.stringify(purchases));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_purchaseReturns`, JSON.stringify(purchaseReturns));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_payments`, JSON.stringify(payments));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_expenses`, JSON.stringify(expenses));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_employees`, JSON.stringify(employees));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    }
  }, [
    companySettings,
    customers,
    projects,
    invoices,
    quotations,
    inventory,
    stockLogs,
    distributors,
    purchases,
    purchaseReturns,
    payments,
    expenses,
    employees,
    auditLogs,
    notifications,
  ]);

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    updateCompanySettings({ themeMode: nextMode ? 'dark' : 'light' });
  };

  const updateCompanySettings = (partial: Partial<CompanySettings>) => {
    const updated = { ...companySettings, ...partial };
    setCompanySettings(updated);
    if (user && !(user as any).isDemo) {
      setDoc(doc(db, 'companySettings', user.uid), { ...updated, ownerUid: user.uid }).catch(() => {});
    }
    logAction('Settings', 'Company Profile Updated', 'Settings modified by user');
  };

  const logAction = (module: string, action: string, details: string) => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      userRole,
      action,
      module,
      details,
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch(() => {});
  };

  // CUSTOMER HANDLERS
  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    
    // Generate safe sequential unique ID
    const existingNums = customers
      .map((c) => {
        const match = (c.id || '').match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextNum = (existingNums.length > 0 ? Math.max(...existingNums) : 1000) + 1;
    const newId = `CUST-${nextNum}`;

    const newCustomer: Customer = {
      ...data,
      id: newId,
      name: (data.name || '').trim(),
      fatherName: (data.fatherName || '').trim(),
      mobile: (data.mobile || '').trim(),
      altMobile: (data.altMobile || '').trim(),
      email: (data.email || '').trim(),
      address: (data.address || '').trim(),
      village: (data.village || '').trim(),
      block: (data.block || '').trim(),
      district: (data.district || '').trim(),
      state: data.state || 'Uttar Pradesh',
      stateCode: data.stateCode || '09',
      pincode: (data.pincode || '').trim(),
      aadharNumber: (data.aadharNumber || '').trim(),
      panNumber: (data.panNumber || '').trim(),
      gstNumber: (data.gstNumber || '').trim(),
      projectType: data.projectType || 'Residential',
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      documents: data.documents || [],
      createdAt: new Date().toISOString().split('T')[0],
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };

    setCustomers((prev) => [newCustomer, ...prev.filter((c) => c.id !== newId)]);

    // Direct local persistence backup
    try {
      const updated = [newCustomer, ...customers.filter((c) => c.id !== newId)];
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_customers`, JSON.stringify(updated));
    } catch (err) {
      console.warn('LocalStorage save customer error:', err);
    }

    if (user && !(user as any).isDemo) {
      setDoc(doc(db, 'customers', newId), newCustomer).catch((err) => {
        console.warn('Firestore setDoc customers error:', err);
      });
    }

    logAction('Customer', 'Customer Created', `Added customer ${newCustomer.name} (${newId})`);
    return newCustomer;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    setCustomers((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...data, ...(currentUid ? { ownerUid: currentUid } : {}) } : c));
      const target = next.find((c) => c.id === id);
      if (target && user && !(user as any).isDemo) {
        setDoc(doc(db, 'customers', id), target).catch(() => {});
      }
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_customers`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    logAction('Customer', 'Customer Updated', `Updated profile for customer ${id}`);
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_customers`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    if (user && !(user as any).isDemo) {
      deleteDoc(doc(db, 'customers', id)).catch(() => {});
    }
    logAction('Customer', 'Customer Deleted', `Deleted customer ${id}`);
  };

  // PROJECT HANDLERS
  const addProject = (data: Omit<Project, 'id' | 'projectId'>): Project => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const newSeq = projects.length + 1;
    const formattedId = `PRJ-${new Date().getFullYear()}-${String(newSeq).padStart(3, '0')}`;
    const newProject: Project = {
      ...data,
      id: `PRJ-${Date.now()}`,
      projectId: formattedId,
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };
    setProjects((prev) => [newProject, ...prev]);
    if (user && !(user as any).isDemo) {
      setDoc(doc(db, 'projects', newProject.id), newProject).catch(() => {});
    }
    logAction('Projects', 'Project Created', `Created project ${formattedId} for ${data.customerName}`);
    return newProject;
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    setProjects((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...data, ...(currentUid ? { ownerUid: currentUid } : {}) } : p));
      const target = next.find((p) => p.id === id);
      if (target && user && !(user as any).isDemo) {
        setDoc(doc(db, 'projects', id), target).catch(() => {});
      }
      return next;
    });
    logAction('Projects', 'Project Updated', `Updated project ${id}`);
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (user && !(user as any).isDemo) {
      deleteDoc(doc(db, 'projects', id)).catch(() => {});
    }
    logAction('Projects', 'Project Deleted', `Deleted project ${id}`);
  };

  // INVOICE HANDLERS
  const addInvoice = (data: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const prefix = companySettings.invoicePrefix || 'UB-INV-';
    const existingSeqs = invoices
      .map((inv) => {
        if (!inv.invoiceNumber) return 0;
        const match = inv.invoiceNumber.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextSeq = (existingSeqs.length > 0 ? Math.max(...existingSeqs) : 0) + 1;
    const invNumber = `${prefix}${String(nextSeq).padStart(3, '0')}`;

    const advance = Number(data.advancePaid) || 0;
    const grand = Number(data.grandTotal) || 0;
    const remaining = Math.max(0, grand - advance);
    const status: PaymentStatus = remaining <= 0 ? 'Paid' : advance > 0 ? 'Partial' : 'Pending';

    const newInvoice: Invoice = {
      ...data,
      id: `INV-${Date.now()}`,
      invoiceNumber: invNumber,
      grandTotal: grand,
      advancePaid: advance,
      remainingBalance: remaining,
      paymentStatus: status,
      isLocked: remaining <= 0,
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    if (user && !(user as any).isDemo) {
      setDoc(doc(db, 'invoices', newInvoice.id), newInvoice).catch(() => {});
    }
    logAction('Billing', 'Invoice Generated', `Created Invoice ${invNumber} total ₹${grand}`);

    if (advance > 0) {
      const isCheque = data.paymentMode === 'Cheque';
      const targetAcc =
        accounts.find((a) => a.accountType === (data.paymentMode === 'Cash' ? 'Cash' : 'Bank')) ||
        accounts.find((a) => a.isDefault) ||
        accounts[0];

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const payId = `PAY-${Date.now()}`;
      const rctNo = `RCT-2026-${String(payments.length + 1).padStart(3, '0')}`;

      // 1. Create Payment History Record
      const newPayment: Payment = {
        id: payId,
        receiptNo: rctNo,
        invoiceId: newInvoice.id,
        invoiceNumber: invNumber,
        customerId: data.customerId,
        customerName: data.customerName,
        amount: advance,
        paymentDate: data.date,
        paymentMode: data.paymentMode,
        transactionRef: `ADV-${Date.now().toString().slice(-6)}`,
        notes: `Advance payment received at invoice creation for ${invNumber}`,
        ...(currentUid ? { ownerUid: currentUid } : {}),
      };
      setPayments((prev) => [newPayment, ...prev]);
      if (user && !(user as any).isDemo) {
        setDoc(doc(db, 'payments', payId), newPayment).catch(() => {});
      }

      // 2. Create Cash In Transaction atomically linked to this invoice and customer
      const matchedProj = projects.find((p) => p.id === data.projectId || p.projectId === data.projectId);
      const newCashIn: CashInTransaction = {
        id: `CIN-${Date.now()}`,
        date: data.date || new Date().toISOString().split('T')[0],
        time: nowTime,
        sourceType: 'Advance from Customer',
        fromWhom: data.customerName,
        customerId: data.customerId,
        invoiceId: newInvoice.id,
        referenceNo: invNumber,
        projectId: data.projectId,
        projectName: matchedProj ? `${matchedProj.projectId} (${matchedProj.customerName})` : undefined,
        paymentMethod: (data.paymentMode as any) || 'Bank Transfer',
        accountId: targetAcc ? targetAcc.id : 'ACC-BANK',
        accountName: targetAcc ? targetAcc.name : 'Bank Account',
        amount: advance,
        status: isCheque ? 'Pending' : 'Confirmed',
        chequeStatus: isCheque ? 'Pending' : undefined,
        notes: `Advance payment for Invoice ${invNumber} from Billing & Invoice module (Customer: ${data.customerName})`,
        createdBy: user?.displayName || 'Billing Staff',
        sourceModule: 'billing',
        sourceId: newInvoice.id,
        debitAccount: targetAcc ? targetAcc.name : 'Bank Account',
        creditAccount: data.customerName,
        createdAt: new Date().toISOString(),
        ...(currentUid ? { ownerUid: currentUid } : {}),
      };

      setCashInTransactions((prev) => [newCashIn, ...prev]);
      try {
        const updatedCashIn = [newCashIn, ...cashInTransactions];
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_cash_in`, JSON.stringify(updatedCashIn));
      } catch (e) {}

      if (user && !(user as any).isDemo) {
        setDoc(doc(db, 'cashInTransactions', newCashIn.id), newCashIn).catch(() => {});
      }
    }

    return newInvoice;
  };

  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const existing = invoices.find((inv) => inv.id === id);
    if (existing) {
      const isLocked = (existing.paymentStatus === 'Paid' && (Number(existing.remainingBalance) || 0) <= 0) || existing.isLocked;
      // If user tries to edit a locked invoice without an administrative status/unlock override
      if (isLocked && data.paymentStatus === undefined && data.isLocked === undefined) {
        alert(
          `Cannot edit Invoice ${existing.invoiceNumber || id} because it is fully PAID (Remaining Balance ₹0) and locked for accounting audit integrity.\n\nTo make modifications, please reverse the payment transaction in the Accounting module first.`
        );
        return;
      }
    }

    let updatedInvoiceResult: Invoice | null = null;

    setInvoices((prev) => {
      const next = prev.map((inv) => {
        if (inv.id === id) {
          const grand = data.grandTotal !== undefined ? Number(data.grandTotal) : Number(inv.grandTotal);
          const advance = data.advancePaid !== undefined ? Number(data.advancePaid) : Number(inv.advancePaid || 0);
          const remaining = Math.max(0, grand - advance);
          const status: PaymentStatus = remaining <= 0 ? 'Paid' : advance > 0 ? 'Partial' : 'Pending';

          const merged: Invoice = {
            ...inv,
            ...data,
            grandTotal: grand,
            advancePaid: advance,
            remainingBalance: remaining,
            paymentStatus: status,
            isLocked: data.isLocked !== undefined ? data.isLocked : remaining <= 0,
            ...(currentUid ? { ownerUid: currentUid } : {}),
          };
          updatedInvoiceResult = merged;
          if (user && !(user as any).isDemo) {
            setDoc(doc(db, 'invoices', id), merged).catch(() => {});
          }
          return merged;
        }
        return inv;
      });
      return next;
    });

    // Synchronize Cash In for advance payment if changed
    if (data.advancePaid !== undefined && updatedInvoiceResult) {
      const targetInv = updatedInvoiceResult as Invoice;
      const advance = Number(targetInv.advancePaid) || 0;
      const existingCashIn = cashInTransactions.find(
        (c) => (c.sourceId === id || c.invoiceId === id) && c.sourceModule === 'billing'
      );

      if (advance > 0) {
        if (existingCashIn) {
          // Update existing cash in entry
          const updatedCashIn: CashInTransaction = {
            ...existingCashIn,
            amount: advance,
            referenceNo: targetInv.invoiceNumber,
            fromWhom: targetInv.customerName,
            notes: `Advance payment for Invoice ${targetInv.invoiceNumber} from Billing & Invoice module (Customer: ${targetInv.customerName})`,
            paymentMethod: (targetInv.paymentMode as any) || existingCashIn.paymentMethod,
            updatedAt: new Date().toISOString(),
          };
          setCashInTransactions((prev) => prev.map((c) => (c.id === existingCashIn.id ? updatedCashIn : c)));
          if (user && !(user as any).isDemo) {
            setDoc(doc(db, 'cashInTransactions', existingCashIn.id), updatedCashIn).catch(() => {});
          }
        } else {
          // Create new advance cash in entry
          const targetAcc =
            accounts.find((a) => a.accountType === (targetInv.paymentMode === 'Cash' ? 'Cash' : 'Bank')) ||
            accounts.find((a) => a.isDefault) ||
            accounts[0];
          const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newCashIn: CashInTransaction = {
            id: `CIN-${Date.now()}`,
            date: targetInv.date || new Date().toISOString().split('T')[0],
            time: nowTime,
            sourceType: 'Advance from Customer',
            fromWhom: targetInv.customerName,
            customerId: targetInv.customerId,
            invoiceId: targetInv.id,
            referenceNo: targetInv.invoiceNumber,
            projectId: targetInv.projectId,
            paymentMethod: (targetInv.paymentMode as any) || 'Bank Transfer',
            accountId: targetAcc ? targetAcc.id : 'ACC-BANK',
            accountName: targetAcc ? targetAcc.name : 'Bank Account',
            amount: advance,
            status: targetInv.paymentMode === 'Cheque' ? 'Pending' : 'Confirmed',
            chequeStatus: targetInv.paymentMode === 'Cheque' ? 'Pending' : undefined,
            notes: `Advance payment for Invoice ${targetInv.invoiceNumber} from Billing & Invoice module (Customer: ${targetInv.customerName})`,
            createdBy: user?.displayName || 'Billing Staff',
            sourceModule: 'billing',
            sourceId: targetInv.id,
            debitAccount: targetAcc ? targetAcc.name : 'Bank Account',
            creditAccount: targetInv.customerName,
            createdAt: new Date().toISOString(),
            ...(currentUid ? { ownerUid: currentUid } : {}),
          };
          setCashInTransactions((prev) => [newCashIn, ...prev]);
          if (user && !(user as any).isDemo) {
            setDoc(doc(db, 'cashInTransactions', newCashIn.id), newCashIn).catch(() => {});
          }
        }
      } else if (advance === 0 && existingCashIn) {
        setCashInTransactions((prev) => prev.filter((c) => c.id !== existingCashIn.id));
        if (user && !(user as any).isDemo) {
          deleteDoc(doc(db, 'cashInTransactions', existingCashIn.id)).catch(() => {});
        }
      }
    }

    logAction('Billing', 'Invoice Updated', `Updated invoice ${id}`);
  };

  const deleteInvoice = (id: string) => {
    const target = invoices.find((inv) => inv.id === id);
    if (!target) return;
    const isLocked = (target.paymentStatus === 'Paid' && (Number(target.remainingBalance) || 0) <= 0) || target.isLocked;
    const hasPaidAmount = (target.advancePaid && target.advancePaid > 0);
    const hasPayments = payments.some((p) => p.invoiceId === id);
    const hasCashIn = cashInTransactions.some(
      (c) => c.invoiceId === id && (c.status === 'Confirmed' || c.status === 'Received') && !c.isReversed
    );

    if (isLocked || hasPaidAmount || hasPayments || hasCashIn) {
      alert(
        `Cannot delete Invoice ${target.invoiceNumber || id} because it is ${isLocked ? 'PAID & LOCKED' : 'linked to confirmed payment/collection records'}. To maintain accounting ledger integrity, please reverse or cancel associated payment entries first in the Accounting module.`
      );
      return;
    }

    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    deleteDoc(doc(db, 'invoices', id)).catch(() => {});
    logAction('Billing', 'Invoice Deleted', `Deleted invoice ${id}`);
  };

  // QUOTATION HANDLERS
  const addQuotation = (data: Omit<Quotation, 'id' | 'quoteNumber' | 'createdAt'>): Quotation => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const count = quotations.length + 1;
    const quoteNumber = `QUO-2026-${String(count).padStart(3, '0')}`;
    const newQuotation: Quotation = {
      ...data,
      id: `QT-${Date.now()}`,
      quoteNumber,
      createdAt: new Date().toISOString().split('T')[0],
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };
    setQuotations((prev) => [newQuotation, ...prev]);
    setDoc(doc(db, 'quotations', newQuotation.id), newQuotation).catch(() => {});
    logAction('Quotation', 'Quotation Created', `Created quotation ${quoteNumber} for ${data.customerName}`);
    return newQuotation;
  };

  const updateQuotation = (id: string, data: Partial<Quotation>) => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    setQuotations((prev) => {
      const next = prev.map((q) => (q.id === id ? { ...q, ...data, ...(currentUid ? { ownerUid: currentUid } : {}) } : q));
      const target = next.find((q) => q.id === id);
      if (target) setDoc(doc(db, 'quotations', id), target).catch(() => {});
      return next;
    });
    logAction('Quotation', 'Quotation Updated', `Updated quotation ${id}`);
  };

  const deleteQuotation = (id: string) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id));
    deleteDoc(doc(db, 'quotations', id)).catch(() => {});
    logAction('Quotation', 'Quotation Deleted', `Deleted quotation ${id}`);
  };

  const convertQuotationToInvoice = (quoteId: string): Invoice | null => {
    const q = quotations.find((item) => item.id === quoteId);
    if (!q) return null;

    const items = q.items.map((it, idx) => ({
      id: `ITEM-${idx + 1}`,
      name: it.description,
      quantity: it.qty,
      unit: it.unit,
      rate: it.rate,
      gstPercent: 12,
      discount: 0,
      subtotal: it.amount,
      tax: Math.round(it.amount * 0.12),
      total: Math.round(it.amount * 1.12),
    }));

    const createdInvoice = addInvoice({
      customerId: q.customerId,
      customerName: q.customerName,
      customerMobile: q.customerMobile,
      customerAddress: `${q.customerName} Address`,
      projectType: q.projectType,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      items,
      subtotal: q.estimatedCost,
      taxTotal: q.taxAmount,
      discountTotal: 0,
      grandTotal: q.grandTotal,
      advancePaid: 0,
      remainingBalance: q.grandTotal,
      paymentMode: 'Bank Transfer',
      paymentStatus: 'Pending',
      notes: `Converted from Quotation ${q.quoteNumber}`,
    });

    updateQuotation(quoteId, {
      status: 'Converted',
      convertedInvoiceId: createdInvoice.id,
    });

    logAction('Quotation', 'Converted to Invoice', `Converted Quote ${q.quoteNumber} to Invoice ${createdInvoice.invoiceNumber}`);
    return createdInvoice;
  };

  // PRODUCT MASTER & INVENTORY HANDLERS (REAL-TIME FIRESTORE SYNC)
  const addProduct = async (
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Product> => {
    const currentUid = user?.uid || auth.currentUser?.uid || 'company-staff';

    const newId =
      data.productId ||
      `PROD-${(data.make || 'GEN').toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-6)}`;
    
    const purchasePrice = Number(data.purchasePrice ?? data.unitPrice ?? 0);
    const margin = Number(data.margin ?? 10);
    const autoCalc = data.autoCalculateSalePrice !== false;
    const salePrice = autoCalc
      ? calculateSalePrice(purchasePrice, margin)
      : Number(data.salePrice ?? data.sellingPrice ?? purchasePrice);

    const gstPercent =
      data.gstPercent !== undefined
        ? Number(data.gstPercent)
        : data.gst
        ? Number(String(data.gst).replace('%', ''))
        : 18;

    const now = new Date().toISOString();
    const newProduct: Product = {
      ...data,
      id: newId,
      productId: newId,
      ownerUid: currentUid, // Strictly bind to authenticated user UID
      productName: data.productName || data.name || 'Unnamed Product',
      name: data.productName || data.name || 'Unnamed Product',
      model: data.model || data.productName || data.name,
      make: data.make || data.brand || 'UBSW',
      brand: data.make || data.brand || 'UBSW',
      category: data.category || 'General',
      purchasePrice,
      unitPrice: purchasePrice,
      margin,
      salePrice,
      sellingPrice: salePrice,
      gstPercent,
      gst: data.gst || `${gstPercent}%`,
      stock: Number(data.stock ?? data.currentStock ?? 0),
      currentStock: Number(data.stock ?? data.currentStock ?? 0),
      minStockAlert: Number(data.minStockAlert ?? 5),
      unit: data.unit || 'Nos',
      status: data.status || 'Active',
      autoCalculateSalePrice: autoCalc,
      isDefaultProduct: false,
      specifications: data.specifications || '',
      supplier: data.supplier || data.make || 'UBSW',
      location: data.location || 'Warehouse Main',
      barcode: data.barcode || `890${Date.now().toString().slice(-9)}`,
      createdAt: now,
      updatedAt: now,
      lastUpdated: now.split('T')[0],
    };

    setProducts((prev) => [newProduct, ...prev.filter((p) => p.id !== newId)]);
    setInventory((prev) => [newProduct as unknown as InventoryItem, ...prev.filter((p) => p.id !== newId)]);

    try {
      await setDoc(doc(db, 'products', newId), newProduct);
      logAction('Inventory', 'Product Added', `Added product ${newProduct.productName} (${newProduct.id})`);
    } catch (err) {
      console.warn('Firestore setDoc product error:', err);
    }
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    const currentUid = user?.uid || auth.currentUser?.uid;
    let targetProduct: Product | undefined;

    setProducts((prev) => {
      const next = prev.map((item) => {
        if (item.id === id) {
          const purchasePrice =
            updates.purchasePrice !== undefined
              ? Number(updates.purchasePrice)
              : updates.unitPrice !== undefined
              ? Number(updates.unitPrice)
              : item.purchasePrice;
          
          const margin = updates.margin !== undefined ? Number(updates.margin) : item.margin;
          const autoCalc =
            updates.autoCalculateSalePrice !== undefined
              ? updates.autoCalculateSalePrice
              : item.autoCalculateSalePrice !== false;

          let salePrice = item.salePrice;
          if (autoCalc) {
            salePrice = calculateSalePrice(purchasePrice, margin);
          } else if (updates.salePrice !== undefined) {
            salePrice = Number(updates.salePrice);
          } else if (updates.sellingPrice !== undefined) {
            salePrice = Number(updates.sellingPrice);
          }

          const now = new Date().toISOString();
          const updated: Product = {
            ...item,
            ...updates,
            id,
            ownerUid: item.ownerUid || currentUid || '', // Strictly preserve ownerUid
            productName: updates.productName || updates.name || item.productName,
            name: updates.productName || updates.name || item.productName,
            make: updates.make || updates.brand || item.make,
            brand: updates.make || updates.brand || item.make,
            category: updates.category || item.category,
            purchasePrice,
            unitPrice: purchasePrice,
            margin,
            salePrice,
            sellingPrice: salePrice,
            stock:
              updates.stock !== undefined
                ? Number(updates.stock)
                : updates.currentStock !== undefined
                ? Number(updates.currentStock)
                : item.stock,
            currentStock:
              updates.stock !== undefined
                ? Number(updates.stock)
                : updates.currentStock !== undefined
                ? Number(updates.currentStock)
                : item.stock,
            autoCalculateSalePrice: autoCalc,
            updatedAt: now,
            lastUpdated: now.split('T')[0],
          };
          targetProduct = updated;
          return updated;
        }
        return item;
      });
      return next;
    });

    if (targetProduct) {
      const t = targetProduct as Product;
      setInventory((prev) => prev.map((p) => (p.id === id ? (t as unknown as InventoryItem) : p)));
      try {
        await setDoc(doc(db, 'products', id), t);
        logAction('Inventory', 'Product Updated', `Updated product ${t.productName} (${id})`);
      } catch (err) {
        console.warn('Firestore update product error:', err);
      }
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    const toDelete = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((i) => i.id !== id));
    setInventory((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteDoc(doc(db, 'products', id));
      logAction('Inventory', 'Product Deleted', `Deleted product ${toDelete?.productName || id}`);
    } catch (err) {
      console.warn('Firestore delete product error:', err);
    }
  };

  const deleteMultipleProducts = async (ids: string[]): Promise<number> => {
    if (!ids || ids.length === 0) return 0;
    const idSet = new Set(ids);
    const count = ids.length;

    setProducts((prev) => prev.filter((i) => !idSet.has(i.id)));
    setInventory((prev) => prev.filter((i) => !idSet.has(i.id)));

    const deletePromises = ids.map(async (id) => {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        console.warn(`Firestore delete product error for ${id}:`, err);
      }
    });

    await Promise.allSettled(deletePromises);
    logAction('Inventory', 'Multiple Products Deleted', `Deleted ${count} products from inventory`);
    return count;
  };

  const duplicateProduct = async (id: string): Promise<Product> => {
    const currentUid = user?.uid || auth.currentUser?.uid || 'company-staff';
    const original = products.find((p) => p.id === id);
    if (!original) throw new Error('Product not found');

    const newId = `PROD-${(original.make || 'UBSW').toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const duplicated: Product = {
      ...original,
      id: newId,
      productId: newId,
      ownerUid: currentUid,
      productName: `${original.productName} (Copy)`,
      name: `${original.productName} (Copy)`,
      isDefaultProduct: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setProducts((prev) => [duplicated, ...prev]);
    setInventory((prev) => [duplicated as unknown as InventoryItem, ...prev]);

    try {
      await setDoc(doc(db, 'products', newId), duplicated);
      logAction('Inventory', 'Product Duplicated', `Duplicated product ${original.productName} -> ${duplicated.productName}`);
    } catch (err) {
      console.warn('Firestore duplicate product error:', err);
    }
    return duplicated;
  };

  const toggleProductStatus = async (id: string): Promise<void> => {
    const item = products.find((p) => p.id === id);
    if (!item) return;
    const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    await updateProduct(id, { status: nextStatus });
  };

  const adjustProductStock = async (
    id: string,
    quantity: number,
    type: 'Stock In' | 'Stock Out',
    refNo: string = `ADJ-${Date.now().toString().slice(-6)}`,
    notes: string = 'Stock adjustment'
  ): Promise<void> => {
    const currentUid = user?.uid || auth.currentUser?.uid || 'company-staff';
    const item = products.find((p) => p.id === id);
    if (!item) return;

    const delta = type === 'Stock In' ? quantity : -quantity;
    const nextStock = Math.max(0, item.stock + delta);

    // Record Stock Log with ownerUid
    const newLog: StockLog & { ownerUid?: string } = {
      id: `SL-${Date.now()}`,
      itemId: id,
      itemName: item.productName,
      type,
      quantity,
      refNo,
      notes,
      date: new Date().toISOString().split('T')[0],
      ownerUid: currentUid,
    };

    setStockLogs((prev) => [newLog, ...prev]);
    setDoc(doc(db, 'stockLogs', newLog.id), newLog).catch(() => {});

    await updateProduct(id, { stock: nextStock });
    logAction('Inventory', type, `${type}: ${quantity} ${item.unit} of ${item.productName} (${refNo})`);
  };

  const bulkImportProducts = async (
    importedList: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<number> => {
    if (!importedList || importedList.length === 0) return 0;
    const currentUid = user?.uid || auth.currentUser?.uid || 'company-staff';

    const now = new Date().toISOString();
    const formattedProducts: Product[] = [];

    for (let i = 0; i < importedList.length; i++) {
      const data = importedList[i];
      const cleanMake = (data.make || 'GEN').trim();
      const sanitizedMake = cleanMake.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'GEN';
      const newId =
        data.productId ||
        `PROD-${sanitizedMake}-${Date.now().toString().slice(-5)}${i}`;

      const purchasePrice = Number(data.purchasePrice ?? data.unitPrice ?? 0);
      const margin = Number(data.margin ?? 10);
      const autoCalc = data.autoCalculateSalePrice !== false;
      const salePrice = Number(
        data.salePrice ??
          data.sellingPrice ??
          calculateSalePrice(purchasePrice, margin)
      );
      const gstPercent =
        data.gstPercent !== undefined
          ? Number(data.gstPercent)
          : data.gst
          ? Number(String(data.gst).replace('%', ''))
          : 18;

      const newProduct: Product = {
        ...data,
        id: newId,
        productId: newId,
        ownerUid: currentUid, // Strictly assign to authenticated user UID
        productName: (data.productName || data.name || 'Unnamed Product').trim(),
        name: (data.productName || data.name || 'Unnamed Product').trim(),
        model: data.model || data.productName || data.name,
        make: cleanMake || 'UBSW',
        brand: cleanMake || 'UBSW',
        category: data.category || 'General',
        purchasePrice,
        unitPrice: purchasePrice,
        margin,
        salePrice,
        sellingPrice: salePrice,
        gstPercent,
        gst: data.gst || `${gstPercent}%`,
        stock: Number(data.stock ?? data.currentStock ?? 0),
        currentStock: Number(data.stock ?? data.currentStock ?? 0),
        minStockAlert: Number(data.minStockAlert ?? 5),
        unit: data.unit || 'Nos',
        status: data.status || 'Active',
        autoCalculateSalePrice: autoCalc,
        isDefaultProduct: false,
        specifications: data.specifications || '',
        supplier: data.supplier || cleanMake || 'UBSW',
        location: data.location || 'Warehouse Main',
        barcode: data.barcode || `890${Date.now().toString().slice(-6)}${String(i).padStart(3, '0')}`,
        createdAt: now,
        updatedAt: now,
        lastUpdated: now.split('T')[0],
      };

      formattedProducts.push(newProduct);
    }

    setProducts((prev) => {
      const existingMap = new Map<string, Product>(
        prev.map((p) => [`${p.productName.toLowerCase().trim()}__${p.make.toLowerCase().trim()}`, p])
      );
      const toAdd: Product[] = [];
      const updatedList = [...prev];

      for (const item of formattedProducts) {
        const key = `${item.productName.toLowerCase().trim()}__${item.make.toLowerCase().trim()}`;
        const ex = existingMap.get(key);
        if (ex) {
          const idx = updatedList.findIndex((p) => p.id === ex.id);
          if (idx !== -1) {
            updatedList[idx] = {
              ...ex,
              ...item,
              id: ex.id,
              productId: ex.id,
              ownerUid: currentUid,
              stock: (ex.stock || 0) + (item.stock || 0),
              currentStock: (ex.stock || 0) + (item.stock || 0),
            };
          }
        } else {
          toAdd.push(item);
        }
      }

      return [...toAdd, ...updatedList];
    });

    setInventory((prev) => {
      const toAdd = formattedProducts as unknown as InventoryItem[];
      return [...toAdd, ...prev.filter((p) => !formattedProducts.some((f) => f.id === p.id))];
    });

    // Write to Firestore asynchronously
    for (const item of formattedProducts) {
      try {
        await setDoc(doc(db, 'products', item.id), item);
      } catch (err) {
        console.warn('Firestore bulk import setDoc error:', err);
      }
    }

    logAction('Inventory', 'Excel Import', `Successfully imported ${formattedProducts.length} products via Excel`);
    return formattedProducts.length;
  };

  const reseedDefaultProducts = async (_force: boolean = false): Promise<void> => {
    // Intentionally no-op to guarantee that 0 default products are ever seeded
    logAction('Inventory', 'Catalog Check', 'User inventory check completed (no default seed)');
  };

  // Backwards compatibility inventory handlers
  const addInventoryItem = (data: Omit<InventoryItem, 'id' | 'lastUpdated'>): InventoryItem => {
    const newId = `INV-${String(products.length + 1).padStart(2, '0')}`;
    const newItem: InventoryItem = {
      ...data,
      id: newId,
      productName: data.name,
      make: data.brand || 'UBSW',
      purchasePrice: data.unitPrice,
      margin: 10,
      salePrice: data.sellingPrice || calculateSalePrice(data.unitPrice, 10),
      stock: data.currentStock,
      status: 'Active',
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    addProduct(newItem);
    return newItem;
  };

  const updateInventoryItem = (id: string, data: Partial<InventoryItem>) => {
    updateProduct(id, {
      ...data,
      productName: data.name,
      make: data.brand,
      purchasePrice: data.unitPrice,
      salePrice: data.sellingPrice,
      stock: data.currentStock,
    });
  };

  const deleteInventoryItem = (id: string) => {
    deleteProduct(id);
  };

  const recordStockLog = (logData: Omit<StockLog, 'id' | 'date'>) => {
    adjustProductStock(
      logData.itemId,
      logData.quantity,
      logData.type,
      logData.refNo,
      logData.notes
    );
  };

  // PAYMENT HANDLERS
  const addPayment = (data: Omit<Payment, 'id' | 'receiptNo'>): Payment => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const amount = Number(data.amount);
    if (amount <= 0) {
      alert('Payment amount must be greater than zero.');
      throw new Error('Payment amount must be greater than zero.');
    }

    const targetInvoice = invoices.find((i) => i.id === data.invoiceId);
    if (targetInvoice && amount > (Number(targetInvoice.remainingBalance) || 0)) {
      alert(
        `Payment amount ₹${amount.toLocaleString('en-IN')} cannot exceed remaining balance ₹${(Number(targetInvoice.remainingBalance) || 0).toLocaleString('en-IN')}.`
      );
      throw new Error('Payment exceeds remaining balance');
    }

    const receiptNo = `RCT-2026-${String(payments.length + 1).padStart(3, '0')}`;
    const newPayment: Payment = {
      ...data,
      amount,
      id: `PAY-${Date.now()}`,
      receiptNo,
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };
    setPayments((prev) => [newPayment, ...prev]);
    setDoc(doc(db, 'payments', newPayment.id), newPayment).catch(() => {});

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === data.invoiceId) {
          const newPaid = (Number(inv.advancePaid) || 0) + amount;
          const newRemaining = Math.max(0, (Number(inv.grandTotal) || 0) - newPaid);
          let newStatus: PaymentStatus = 'Pending';
          if (newRemaining <= 0) newStatus = 'Paid';
          else if (newPaid > 0) newStatus = 'Partial';

          const updatedInv: Invoice = {
            ...inv,
            advancePaid: newPaid,
            remainingBalance: newRemaining,
            paymentStatus: newStatus,
            ...(currentUid ? { ownerUid: currentUid } : {}),
          };
          setDoc(doc(db, 'invoices', inv.id), updatedInv).catch(() => {});
          return updatedInv;
        }
        return inv;
      })
    );

    // AUTOMATIC CASH IN CREATION & DUPLICATE CHECK
    const targetAccId = (data as any).accountId || (data.paymentMode === 'Cash' ? 'ACC-CASH' : 'ACC-HDFC');
    const targetAcc = accounts.find((a) => a.id === targetAccId) || accounts.find((a) => a.accountType === (data.paymentMode === 'Cash' ? 'Cash' : 'Bank')) || accounts[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newCashIn: CashInTransaction = {
      id: `CIN-${Date.now()}`,
      date: data.paymentDate || new Date().toISOString().split('T')[0],
      time: nowTime,
      sourceType: 'Customer Invoice Payment',
      fromWhom: data.customerName || targetInvoice?.customerName || 'Customer',
      customerId: data.customerId || targetInvoice?.customerId,
      invoiceId: data.invoiceId,
      referenceNo: (data as any).invoiceNumber || targetInvoice?.invoiceNumber || newPayment.receiptNo,
      projectId: targetInvoice?.projectId,
      projectName: targetInvoice?.projectName,
      paymentMethod: (data.paymentMode as any) || 'Bank Transfer',
      accountId: targetAcc ? targetAcc.id : 'ACC-HDFC',
      accountName: targetAcc ? targetAcc.name : 'HDFC Bank',
      amount,
      status: data.paymentMode === 'Cheque' ? 'Pending' : 'Confirmed',
      chequeNumber: data.paymentMode === 'Cheque' ? data.transactionRef : undefined,
      chequeStatus: data.paymentMode === 'Cheque' ? 'Pending' : undefined,
      notes: data.notes || `Payment received for Invoice ${(data as any).invoiceNumber || targetInvoice?.invoiceNumber || ''}`,
      createdBy: user?.displayName || 'Accounts Manager',
      sourceModule: 'payments',
      sourceId: newPayment.id,
      debitAccount: targetAcc ? targetAcc.name : 'HDFC Bank',
      creditAccount: data.customerName || targetInvoice?.customerName || 'Customer',
      createdAt: new Date().toISOString(),
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };

    setCashInTransactions((prev) => {
      if (prev.some((c) => c.sourceModule === 'payments' && c.sourceId === newPayment.id)) {
        return prev;
      }
      return [newCashIn, ...prev];
    });
    setDoc(doc(db, 'cashInTransactions', newCashIn.id), newCashIn).catch(() => {});

    logAction('Payments', 'Payment Received', `Received ₹${amount} for Invoice ${data.invoiceNumber || targetInvoice?.invoiceNumber}`);
    return newPayment;
  };

  // EXPENSE HANDLERS
  const addExpense = (data: Omit<Expense, 'id'>): Expense => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const amount = Number(data.amount);
    const newExpense: Expense = {
      ...data,
      amount,
      id: `EXP-${Date.now()}`,
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    setDoc(doc(db, 'expenses', newExpense.id), newExpense).catch(() => {});

    // AUTOMATIC CASH OUT CREATION
    const targetAccId = (data as any).accountId || (data.paymentMethod === 'Cash' ? 'ACC-CASH' : 'ACC-HDFC');
    const targetAcc = accounts.find((a) => a.id === targetAccId) || accounts.find((a) => a.accountType === 'Cash') || accounts[0];

    const cashOutCategory = ((): any => {
      const cat = (data.category || '').toLowerCase();
      if (cat.includes('transport') || cat.includes('freight')) return 'Transport Payment';
      if (cat.includes('rent')) return 'Rent';
      if (cat.includes('electric') || cat.includes('power')) return 'Electricity Bill';
      if (cat.includes('labour') || cat.includes('worker')) return 'Labour Payment';
      if (cat.includes('tax') || cat.includes('gst')) return 'GST Payment';
      if (cat.includes('office')) return 'Office Expense';
      if (cat.includes('project')) return 'Project Expense';
      return 'Expense Payment';
    })();

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newCashOut: CashOutTransaction = {
      id: `COUT-${Date.now()}`,
      date: data.date || new Date().toISOString().split('T')[0],
      time: nowTime,
      paidTo: (data as any).vendor || data.title || 'Vendor',
      category: cashOutCategory,
      reason: data.title,
      referenceNo: (data as any).billNumber || newExpense.id,
      projectId: data.projectId,
      projectName: data.projectName,
      paymentMethod: (data.paymentMethod as any) || 'Cash',
      accountId: targetAcc?.id || 'ACC-CASH',
      accountName: targetAcc?.name || 'Cash in Hand',
      amount,
      status: 'Paid',
      notes: data.notes || data.title,
      createdBy: user?.displayName || 'Accounts Staff',
      sourceModule: 'expenses',
      sourceId: newExpense.id,
      debitAccount: `${data.category || 'Office'} Expense Account`,
      creditAccount: targetAcc?.name || 'Cash in Hand',
      createdAt: new Date().toISOString(),
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };

    setCashOutTransactions((prev) => [newCashOut, ...prev]);
    setDoc(doc(db, 'cashOutTransactions', newCashOut.id), newCashOut).catch(() => {});

    logAction('Expenses', 'Expense Logged', `Logged expense: ${data.title} (₹${data.amount})`);
    return newExpense;
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    deleteDoc(doc(db, 'expenses', id)).catch(() => {});

    // Automatically delete linked Cash Out
    setCashOutTransactions((prev) => {
      const target = prev.find((c) => c.sourceModule === 'expenses' && c.sourceId === id);
      if (target) {
        deleteDoc(doc(db, 'cashOutTransactions', target.id)).catch(() => {});
      }
      return prev.filter((c) => !(c.sourceModule === 'expenses' && c.sourceId === id));
    });

    logAction('Expenses', 'Expense Deleted', `Deleted expense ${id}`);
  };

  // DISTRIBUTOR HANDLERS
  const addDistributor = async (
    data: Omit<Distributor, 'id' | 'createdAt'>
  ): Promise<Distributor> => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const newId = `DIST-${(distributors.length + 1).toString().padStart(3, '0')}`;
    const newDist: Distributor = {
      ...data,
      id: newId,
      totalPurchases: data.totalPurchases || 0,
      outstandingAmount: data.outstandingAmount || 0,
      status: data.status || 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };

    setDistributors((prev) => [newDist, ...prev.filter((d) => d.id !== newId)]);
    try {
      await setDoc(doc(db, 'distributors', newId), newDist);
      logAction('Purchases', 'Distributor Added', `Added distributor ${newDist.companyName} (${newDist.id})`);
    } catch (err) {
      console.warn('Firestore addDistributor note:', err);
    }
    return newDist;
  };

  const updateDistributor = async (id: string, data: Partial<Distributor>): Promise<void> => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const updatedAt = new Date().toISOString().split('T')[0];
    setDistributors((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...data, updatedAt, ...(currentUid ? { ownerUid: currentUid } : {}) } : d));
      const target = next.find((d) => d.id === id);
      if (target) setDoc(doc(db, 'distributors', id), target).catch(() => {});
      return next;
    });
    logAction('Purchases', 'Distributor Updated', `Updated distributor details for ${id}`);
  };

  const deleteDistributor = async (id: string): Promise<void> => {
    setDistributors((prev) => prev.filter((d) => d.id !== id));
    try {
      await deleteDoc(doc(db, 'distributors', id));
      logAction('Purchases', 'Distributor Deleted', `Deleted distributor ${id}`);
    } catch (err) {
      console.warn('Firestore deleteDistributor note:', err);
    }
  };

  // PURCHASE ORDER & MATERIAL RECEIVING (GRN) HANDLERS
  const addPurchase = async (
    data: Omit<Purchase, 'id' | 'createdAt'>
  ): Promise<Purchase> => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const currentYear = new Date().getFullYear();
    const count = purchases.length + 1;
    const newId = `PUR-${currentYear}-${count.toString().padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newPurchase: Purchase = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };

    // 1. Automatically update stock for received quantities in the EXISTING Inventory products
    if (newPurchase.items && newPurchase.items.length > 0) {
      for (const item of newPurchase.items) {
        const qtyReceived = Number(item.receivedQuantity) || 0;
        if (qtyReceived > 0 && item.productId) {
          await adjustProductStock(
            item.productId,
            qtyReceived,
            'Stock In',
            newPurchase.id,
            `Purchase Inward from ${newPurchase.distributorName} (Inv #${newPurchase.invoiceNumber || newPurchase.id})`
          );
        }
      }
    }

    // 2. Update Distributor procurement totals and outstanding
    if (newPurchase.distributorId) {
      setDistributors((prev) =>
        prev.map((d) => {
          if (d.id === newPurchase.distributorId) {
            const updatedDist: Distributor = {
              ...d,
              totalPurchases: (d.totalPurchases || 0) + (Number(newPurchase.grandTotal) || 0),
              outstandingAmount: (d.outstandingAmount || 0) + (Number(newPurchase.dueAmount) || 0),
              ...(currentUid ? { ownerUid: currentUid } : {}),
            };
            setDoc(doc(db, 'distributors', d.id), updatedDist).catch(() => {});
            return updatedDist;
          }
          return d;
        })
      );
    }

    // 3. If initial/advance payment made on purchase order, record Cash Out
    if (Number(newPurchase.paidAmount) > 0) {
      const targetAccId = (data as any).accountId || 'ACC-HDFC';
      const targetAcc = accounts.find((a) => a.id === targetAccId) || accounts[1] || accounts[0];
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newCashOut: CashOutTransaction = {
        id: `COUT-${Date.now()}`,
        date: newPurchase.paymentDate || newPurchase.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        time: nowTime,
        paidTo: newPurchase.distributorName,
        category: 'Purchase Bill Payment',
        reason: `Purchase Bill Payment (${newPurchase.invoiceNumber || newPurchase.id})`,
        referenceNo: newPurchase.invoiceNumber || newPurchase.id,
        distributorId: newPurchase.distributorId,
        purchaseId: newPurchase.id,
        paymentMethod: (newPurchase.paymentMode as any) || 'Bank Transfer',
        accountId: targetAcc ? targetAcc.id : 'ACC-HDFC',
        accountName: targetAcc ? targetAcc.name : 'HDFC Bank',
        amount: Number(newPurchase.paidAmount),
        status: 'Paid',
        notes: `Payment for material procurement #${newPurchase.invoiceNumber || newPurchase.id}`,
        createdBy: user?.displayName || 'Purchase Manager',
        sourceModule: 'purchases',
        sourceId: newPurchase.id,
        debitAccount: newPurchase.distributorName,
        creditAccount: targetAcc ? targetAcc.name : 'HDFC Bank',
        createdAt: new Date().toISOString(),
        ...(currentUid ? { ownerUid: currentUid } : {}),
      };
      setCashOutTransactions((prev) => [newCashOut, ...prev.filter((c) => c.id !== newCashOut.id)]);
      setDoc(doc(db, 'cashOutTransactions', newCashOut.id), newCashOut).catch(() => {});
    }

    // 4. Save purchase to state and Firestore
    setPurchases((prev) => [newPurchase, ...prev.filter((p) => p.id !== newId)]);
    try {
      await setDoc(doc(db, 'purchases', newId), newPurchase);
      logAction(
        'Purchases',
        'Purchase Created',
        `Created purchase ${newPurchase.id} (${newPurchase.invoiceNumber}) from ${newPurchase.distributorName} for ₹${newPurchase.grandTotal}`
      );
    } catch (err) {
      console.warn('Firestore addPurchase note:', err);
    }

    return newPurchase;
  };

  const updatePurchase = async (id: string, updates: Partial<Purchase>): Promise<void> => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const existing = purchases.find((p) => p.id === id);
    if (!existing) return;

    const updatedAt = new Date().toISOString();
    const mergedPurchase: Purchase = {
      ...existing,
      ...updates,
      updatedAt,
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };

    // 1. Calculate stock difference for each item if items were modified
    if (updates.items && Array.isArray(updates.items)) {
      for (const newItem of updates.items) {
        const oldItem = existing.items?.find(
          (i) => i.productId === newItem.productId || i.id === newItem.id
        );
        const oldReceived = Number(oldItem?.receivedQuantity) || 0;
        const newReceived = Number(newItem.receivedQuantity) || 0;
        const delta = newReceived - oldReceived;

        if (delta > 0 && newItem.productId) {
          await adjustProductStock(
            newItem.productId,
            delta,
            'Stock In',
            id,
            `Purchase receiving increase on ${id}`
          );
        } else if (delta < 0 && newItem.productId) {
          await adjustProductStock(
            newItem.productId,
            Math.abs(delta),
            'Stock Out',
            id,
            `Purchase receiving adjustment on ${id}`
          );
        }
      }
    }

    // 2. Adjust distributor balance difference
    const grandTotalDiff = (Number(mergedPurchase.grandTotal) || 0) - (Number(existing.grandTotal) || 0);
    const dueAmountDiff = (Number(mergedPurchase.dueAmount) || 0) - (Number(existing.dueAmount) || 0);

    if ((grandTotalDiff !== 0 || dueAmountDiff !== 0) && mergedPurchase.distributorId) {
      setDistributors((prev) =>
        prev.map((d) => {
          if (d.id === mergedPurchase.distributorId) {
            const updatedDist: Distributor = {
              ...d,
              totalPurchases: Math.max(0, (d.totalPurchases || 0) + grandTotalDiff),
              outstandingAmount: Math.max(0, (d.outstandingAmount || 0) + dueAmountDiff),
            };
            setDoc(doc(db, 'distributors', d.id), updatedDist).catch(() => {});
            return updatedDist;
          }
          return d;
        })
      );
    }

    // 3. Update local state and Firestore
    setPurchases((prev) => prev.map((p) => (p.id === id ? mergedPurchase : p)));
    try {
      await setDoc(doc(db, 'purchases', id), mergedPurchase);
      logAction('Purchases', 'Purchase Updated', `Updated purchase ${id} (${mergedPurchase.invoiceNumber})`);
    } catch (err) {
      console.warn('Firestore updatePurchase note:', err);
    }
  };

  const deletePurchase = async (id: string): Promise<void> => {
    const existing = purchases.find((p) => p.id === id);
    if (!existing) return;

    // 1. Reverse stock for received items
    if (existing.items && existing.items.length > 0) {
      for (const item of existing.items) {
        const received = Number(item.receivedQuantity) || 0;
        if (received > 0 && item.productId) {
          await adjustProductStock(
            item.productId,
            received,
            'Stock Out',
            `REV-${id}`,
            `Reversal of stock on deleted purchase ${id}`
          );
        }
      }
    }

    // 2. Subtract from distributor totals
    if (existing.distributorId) {
      setDistributors((prev) =>
        prev.map((d) => {
          if (d.id === existing.distributorId) {
            const updatedDist: Distributor = {
              ...d,
              totalPurchases: Math.max(0, (d.totalPurchases || 0) - (Number(existing.grandTotal) || 0)),
              outstandingAmount: Math.max(0, (d.outstandingAmount || 0) - (Number(existing.dueAmount) || 0)),
            };
            setDoc(doc(db, 'distributors', d.id), updatedDist).catch(() => {});
            return updatedDist;
          }
          return d;
        })
      );
    }

    // 3. Remove from state and Firestore
    setPurchases((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'purchases', id));
      logAction('Purchases', 'Purchase Deleted', `Deleted purchase record ${id} and reversed inventory stock`);
    } catch (err) {
      console.warn('Firestore deletePurchase note:', err);
    }
  };

  // PURCHASE RETURN HANDLERS
  const addPurchaseReturn = async (
    data: Omit<PurchaseReturn, 'id' | 'createdAt'>
  ): Promise<PurchaseReturn> => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const currentYear = new Date().getFullYear();
    const count = purchaseReturns.length + 1;
    const newId = `RET-${currentYear}-${count.toString().padStart(4, '0')}`;
    const now = new Date().toISOString().split('T')[0];

    const newReturn: PurchaseReturn = {
      ...data,
      id: newId,
      createdAt: now,
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };

    // 1. Deduct returned quantity from existing inventory product
    if (newReturn.productId && Number(newReturn.quantity) > 0) {
      await adjustProductStock(
        newReturn.productId,
        Number(newReturn.quantity),
        'Stock Out',
        newReturn.id,
        `Purchase Return to ${newReturn.distributorName} (${newReturn.returnReason || 'Goods Returned'})`
      );
    }

    // 2. Adjust distributor balance if completed
    if (newReturn.distributorId && Number(newReturn.returnAmount) > 0) {
      setDistributors((prev) =>
        prev.map((d) => {
          if (d.id === newReturn.distributorId) {
            const updatedDist: Distributor = {
              ...d,
              outstandingAmount: Math.max(0, (d.outstandingAmount || 0) - Number(newReturn.returnAmount)),
              ...(currentUid ? { ownerUid: currentUid } : {}),
            };
            setDoc(doc(db, 'distributors', d.id), updatedDist).catch(() => {});
            return updatedDist;
          }
          return d;
        })
      );
    }

    // 3. Save to state and Firestore
    setPurchaseReturns((prev) => [newReturn, ...prev.filter((r) => r.id !== newId)]);
    try {
      await setDoc(doc(db, 'purchaseReturns', newId), newReturn);
      logAction('Purchases', 'Purchase Return Created', `Recorded return ${newReturn.id} for ₹${newReturn.returnAmount}`);
    } catch (err) {
      console.warn('Firestore addPurchaseReturn note:', err);
    }

    return newReturn;
  };

  const updatePurchaseReturn = async (id: string, data: Partial<PurchaseReturn>): Promise<void> => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    setPurchaseReturns((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...data, ...(currentUid ? { ownerUid: currentUid } : {}) } : r));
      const target = next.find((r) => r.id === id);
      if (target) setDoc(doc(db, 'purchaseReturns', id), target).catch(() => {});
      return next;
    });
    logAction('Purchases', 'Purchase Return Updated', `Updated return record ${id}`);
  };

  const deletePurchaseReturn = async (id: string): Promise<void> => {
    const existing = purchaseReturns.find((r) => r.id === id);
    if (!existing) return;

    // Restore stock if return was recorded
    if (existing.productId && Number(existing.quantity) > 0) {
      await adjustProductStock(
        existing.productId,
        Number(existing.quantity),
        'Stock In',
        `REV-${id}`,
        `Reversal of cancelled purchase return ${id}`
      );
    }

    setPurchaseReturns((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteDoc(doc(db, 'purchaseReturns', id));
      logAction('Purchases', 'Purchase Return Deleted', `Deleted purchase return ${id}`);
    } catch (err) {
      console.warn('Firestore deletePurchaseReturn note:', err);
    }
  };

  // EMPLOYEE HANDLERS
  const addEmployee = (data: Omit<Employee, 'id'>): Employee => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const newEmp: Employee = {
      ...data,
      id: `EMP-${Date.now()}`,
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };
    setEmployees((prev) => [newEmp, ...prev]);
    setDoc(doc(db, 'employees', newEmp.id), newEmp).catch(() => {});
    logAction('Employees', 'Employee Added', `Added employee ${data.name} (${data.code})`);
    return newEmp;
  };

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    setEmployees((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...data, ...(currentUid ? { ownerUid: currentUid } : {}) } : e));
      const target = next.find((e) => e.id === id);
      if (target) setDoc(doc(db, 'employees', id), target).catch(() => {});
      return next;
    });
    logAction('Employees', 'Employee Updated', `Updated employee ${id}`);
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    deleteDoc(doc(db, 'employees', id)).catch(() => {});
    logAction('Employees', 'Employee Deleted', `Deleted employee ${id}`);
  };

  // NOTIFICATION HANDLERS
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const triggerPrint = (type: PrintData['type'], payload: any) => {
    setPrintData({ type, payload });
  };

  // ==========================================
  // CASH IN / CASH OUT & ACCOUNTING HANDLERS
  // ==========================================

  // Calculate real-time available balance directly from immutable transaction ledger
  const getAccountCalculatedBalance = (accountId: string): number => {
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) return 0;
    const opening = Number(acc.openingBalance) || 0;

    // Sum all confirmed cash in (excluding reversed and cancelled)
    const totalIn = cashInTransactions
      .filter((t) => t.accountId === accountId && (t.status === 'Confirmed' || t.status === 'Received') && !t.isReversed)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // Sum all paid cash out (excluding reversed and cancelled)
    const totalOut = cashOutTransactions
      .filter((t) => t.accountId === accountId && t.status === 'Paid' && !t.isReversed)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return opening + totalIn - totalOut;
  };

  // Total available cash across all registered accounts
  const totalAvailableCash = (accounts || []).reduce(
    (sum, acc) => sum + getAccountCalculatedBalance(acc.id),
    0
  );

  // ACCOUNT HANDLERS
  const addAccount = async (data: Omit<CashBankAccount, 'id' | 'createdAt'>): Promise<string> => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const id = `ACC-${Date.now()}`;
    const newAcc: CashBankAccount = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };
    setAccounts((prev) => [...prev, newAcc]);
    try {
      await setDoc(doc(db, 'accounts', id), newAcc);
      logAction('Accounting', 'Account Created', `Created account ${newAcc.name} (${newAcc.accountType})`);
    } catch (e) {
      console.warn('Firestore addAccount note:', e);
    }
    return id;
  };

  const updateAccount = async (id: string, updates: Partial<CashBankAccount>): Promise<void> => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const updatedAt = new Date().toISOString();
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updates, updatedAt, ...(currentUid ? { ownerUid: currentUid } : {}) } : acc))
    );
    try {
      const existing = accounts.find((a) => a.id === id);
      if (existing) {
        await setDoc(doc(db, 'accounts', id), { ...existing, ...updates, updatedAt, ...(currentUid ? { ownerUid: currentUid } : {}) });
      }
      logAction('Accounting', 'Account Updated', `Updated account ${id}`);
    } catch (e) {
      console.warn('Firestore updateAccount note:', e);
    }
  };

  const deleteAccount = async (id: string): Promise<void> => {
    // Prevent deleting primary cash account
    if (id === 'ACC-CASH') {
      alert('Primary Cash in Hand account cannot be deleted.');
      return;
    }
    const hasHistory =
      cashInTransactions.some((t) => t.accountId === id) ||
      cashOutTransactions.some((t) => t.accountId === id) ||
      accountTransfers.some((t) => t.fromAccountId === id || t.toAccountId === id);

    if (hasHistory) {
      alert(
        'This account has associated transaction history and cannot be deleted. Please set its status to "Inactive" instead to preserve accounting ledger integrity.'
      );
      return;
    }

    setAccounts((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteDoc(doc(db, 'accounts', id));
      logAction('Accounting', 'Account Deleted', `Deleted account ${id}`);
    } catch (e) {
      console.warn('Firestore deleteAccount note:', e);
    }
  };

  // CASH IN HANDLERS
  const addCashIn = async (data: Omit<CashInTransaction, 'id' | 'createdAt'>): Promise<string> => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const amount = Number(data.amount);
    if (amount <= 0) {
      alert('Cash In amount must be greater than zero.');
      throw new Error('Cash In amount must be greater than zero.');
    }

    const accId = data.accountId || 'ACC-CASH';
    const accName = data.accountName || 'Cash in Hand';
    if (!accounts.some((a) => a.id === accId)) {
      const autoAcc: CashBankAccount = {
        id: accId,
        name: accName,
        accountType: data.paymentMethod === 'Cash' ? 'Cash' : 'Bank',
        openingBalance: 0,
        currentBalance: 0,
        status: 'Active',
        isDefault: true,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        ...(currentUid ? { ownerUid: currentUid } : {}),
      };
      setAccounts((prev) => (prev.some((a) => a.id === accId) ? prev : [...prev, autoAcc]));
      setDoc(doc(db, 'accounts', accId), autoAcc).catch(() => {});
    }

    // Customer invoice validation and synchronization
    if (data.invoiceId) {
      const inv = invoices.find((i) => i.id === data.invoiceId);
      if (inv) {
        if (amount > (Number(inv.remainingBalance) || 0)) {
          alert(`Payment amount ₹${amount.toLocaleString('en-IN')} cannot exceed remaining invoice balance ₹${(Number(inv.remainingBalance) || 0).toLocaleString('en-IN')}.`);
          throw new Error('Payment exceeds remaining balance');
        }
      }
    }

    const id = `CIN-${Date.now()}`;
    const newTx: CashInTransaction = {
      ...data,
      accountId: accId,
      accountName: accName,
      amount,
      id,
      createdAt: new Date().toISOString(),
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };
    setCashInTransactions((prev) => [newTx, ...prev]);
    try {
      await setDoc(doc(db, 'cashInTransactions', id), newTx);
      logAction('Accounting', 'Cash In Recorded', `Recorded Cash In of ₹${newTx.amount} from ${newTx.fromWhom}`);
    } catch (e) {
      console.warn('Firestore addCashIn note:', e);
    }

    // If linked to an invoice and NOT a pending cheque, atomically update invoice balance & ledger
    if (data.invoiceId) {
      const inv = invoices.find((i) => i.id === data.invoiceId);
      if (inv && data.paymentMethod !== 'Cheque') {
        const newPaid = (Number(inv.advancePaid) || 0) + amount;
        const newRemaining = Math.max(0, (Number(inv.grandTotal) || 0) - newPaid);
        const newStatus: PaymentStatus = newRemaining <= 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';

        const updatedInv: Invoice = {
          ...inv,
          advancePaid: newPaid,
          remainingBalance: newRemaining,
          paymentStatus: newStatus,
          ...(currentUid ? { ownerUid: currentUid } : {}),
        };
        setInvoices((prev) => prev.map((i) => (i.id === inv.id ? updatedInv : i)));
        setDoc(doc(db, 'invoices', inv.id), updatedInv).catch(() => {});

        // Payment ledger record
        const payId = `PAY-${Date.now()}`;
        const rctNo = `RCT-2026-${String(payments.length + 1).padStart(3, '0')}`;
        const newPayment: Payment = {
          id: payId,
          receiptNo: rctNo,
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerId: inv.customerId,
          customerName: inv.customerName,
          amount,
          paymentDate: data.date || new Date().toISOString().split('T')[0],
          paymentMode: (data.paymentMethod as any) || 'Bank Transfer',
          transactionRef: data.referenceNo || id,
          notes: data.notes || `Cash In received for Invoice ${inv.invoiceNumber}`,
          ...(currentUid ? { ownerUid: currentUid } : {}),
        };
        setPayments((prev) => [newPayment, ...prev]);
        setDoc(doc(db, 'payments', payId), newPayment).catch(() => {});
      }
    }

    return id;
  };

  const updateCashIn = async (id: string, updates: Partial<CashInTransaction>): Promise<void> => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    setCashInTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates, ...(currentUid ? { ownerUid: currentUid } : {}) } : tx))
    );
    try {
      const target = cashInTransactions.find((t) => t.id === id);
      if (target) {
        await setDoc(doc(db, 'cashInTransactions', id), { ...target, ...updates, ...(currentUid ? { ownerUid: currentUid } : {}) });
      }
    } catch (e) {
      console.warn('Firestore updateCashIn note:', e);
    }
  };

  const deleteCashIn = async (id: string): Promise<void> => {
    setCashInTransactions((prev) => prev.filter((tx) => tx.id !== id));
    try {
      await deleteDoc(doc(db, 'cashInTransactions', id));
      logAction('Accounting', 'Cash In Deleted', `Deleted cash in transaction ${id}`);
    } catch (e) {
      console.warn('Firestore deleteCashIn note:', e);
    }
  };

  // CASH OUT HANDLERS
  const addCashOut = async (data: Omit<CashOutTransaction, 'id' | 'createdAt'>): Promise<string> => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const amount = Number(data.amount);
    if (amount <= 0) {
      alert('Cash Out amount must be greater than zero.');
      throw new Error('Cash Out amount must be greater than zero.');
    }

    const accId = data.accountId || 'ACC-CASH';
    const accName = data.accountName || 'Cash in Hand';
    if (!accounts.some((a) => a.id === accId)) {
      const autoAcc: CashBankAccount = {
        id: accId,
        name: accName,
        accountType: data.paymentMethod === 'Cash' ? 'Cash' : 'Bank',
        openingBalance: 0,
        currentBalance: 0,
        status: 'Active',
        isDefault: true,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        ...(currentUid ? { ownerUid: currentUid } : {}),
      };
      setAccounts((prev) => (prev.some((a) => a.id === accId) ? prev : [...prev, autoAcc]));
      setDoc(doc(db, 'accounts', accId), autoAcc).catch(() => {});
    }

    const id = `COUT-${Date.now()}`;
    const newTx: CashOutTransaction = {
      ...data,
      accountId: accId,
      accountName: accName,
      amount,
      id,
      createdAt: new Date().toISOString(),
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };
    setCashOutTransactions((prev) => [newTx, ...prev]);
    try {
      await setDoc(doc(db, 'cashOutTransactions', id), newTx);
      logAction('Accounting', 'Cash Out Recorded', `Recorded Cash Out of ₹${newTx.amount} to ${newTx.paidTo}`);
    } catch (e) {
      console.warn('Firestore addCashOut note:', e);
    }
    return id;
  };

  const updateCashOut = async (id: string, updates: Partial<CashOutTransaction>): Promise<void> => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    setCashOutTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates, ...(currentUid ? { ownerUid: currentUid } : {}) } : tx))
    );
    try {
      const target = cashOutTransactions.find((t) => t.id === id);
      if (target) {
        await setDoc(doc(db, 'cashOutTransactions', id), { ...target, ...updates, ...(currentUid ? { ownerUid: currentUid } : {}) });
      }
    } catch (e) {
      console.warn('Firestore updateCashOut note:', e);
    }
  };

  const deleteCashOut = async (id: string): Promise<void> => {
    setCashOutTransactions((prev) => prev.filter((tx) => tx.id !== id));
    try {
      await deleteDoc(doc(db, 'cashOutTransactions', id));
      logAction('Accounting', 'Cash Out Deleted', `Deleted cash out transaction ${id}`);
    } catch (e) {
      console.warn('Firestore deleteCashOut note:', e);
    }
  };

  // CONTRA / ACCOUNT TRANSFERS
  const addAccountTransfer = async (
    data: Omit<AccountTransfer, 'id' | 'createdAt' | 'cashInId' | 'cashOutId'>
  ): Promise<string> => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const amount = Number(data.amount);
    if (amount <= 0) {
      alert('Transfer amount must be greater than zero.');
      throw new Error('Transfer amount must be greater than zero.');
    }
    if (data.fromAccountId === data.toAccountId) {
      alert('Source and destination accounts must be different.');
      throw new Error('Source and destination accounts must be different.');
    }
    const fromAcc = accounts.find((a) => a.id === data.fromAccountId);
    const toAcc = accounts.find((a) => a.id === data.toAccountId);
    if (!fromAcc || !toAcc) {
      alert('One or both selected accounts were not found.');
      throw new Error('Accounts not found');
    }
    if (fromAcc.status === 'Inactive' || toAcc.status === 'Inactive') {
      alert('Cannot perform transfers involving an Inactive account.');
      throw new Error('Cannot transfer involving an Inactive account.');
    }

    const available = getAccountCalculatedBalance(data.fromAccountId);
    if (amount > available) {
      alert(
        `Insufficient balance in source account "${fromAcc.name}". Available: ₹${available.toLocaleString('en-IN')}, Requested: ₹${amount.toLocaleString('en-IN')}`
      );
      throw new Error('Insufficient balance in source account');
    }

    const transferId = `TRF-${Date.now()}`;
    const cashOutId = `COUT-${Date.now()}`;
    const cashInId = `CIN-${Date.now() + 1}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Create Outward Leg (Cash Out from source account)
    const outTx: CashOutTransaction = {
      id: cashOutId,
      date: data.transferDate,
      time: nowTime,
      paidTo: `Transfer to ${data.toAccountName}`,
      category: 'Contra Transfer',
      reason: `Account Transfer to ${data.toAccountName}`,
      referenceNo: data.referenceNo || transferId,
      paymentMethod: (data.paymentMethod as any) || 'Bank Transfer',
      accountId: data.fromAccountId,
      accountName: data.fromAccountName,
      amount,
      status: 'Paid',
      notes: data.notes || `Internal transfer to ${data.toAccountName}`,
      createdBy: user?.displayName || 'Accounts Manager',
      sourceModule: 'transfer',
      sourceId: transferId,
      debitAccount: data.toAccountName,
      creditAccount: data.fromAccountName,
      createdAt: new Date().toISOString(),
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };

    // 2. Create Inward Leg (Cash In to destination account)
    const inTx: CashInTransaction = {
      id: cashInId,
      date: data.transferDate,
      time: nowTime,
      sourceType: 'Contra Transfer',
      fromWhom: `Transfer from ${data.fromAccountName}`,
      referenceNo: data.referenceNo || transferId,
      paymentMethod: (data.paymentMethod as any) || 'Bank Transfer',
      accountId: data.toAccountId,
      accountName: data.toAccountName,
      amount,
      status: 'Confirmed',
      notes: data.notes || `Internal transfer from ${data.fromAccountName}`,
      createdBy: user?.displayName || 'Accounts Manager',
      sourceModule: 'transfer',
      sourceId: transferId,
      debitAccount: data.toAccountName,
      creditAccount: data.fromAccountName,
      createdAt: new Date().toISOString(),
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };

    const newTransfer: AccountTransfer = {
      ...data,
      amount,
      id: transferId,
      cashOutId,
      cashInId,
      createdAt: new Date().toISOString(),
      ...(currentUid ? { ownerUid: currentUid } : {}),
    };

    setCashOutTransactions((prev) => [outTx, ...prev]);
    setCashInTransactions((prev) => [inTx, ...prev]);
    setAccountTransfers((prev) => [newTransfer, ...prev]);

    try {
      await Promise.all([
        setDoc(doc(db, 'cashOutTransactions', cashOutId), outTx),
        setDoc(doc(db, 'cashInTransactions', cashInId), inTx),
        setDoc(doc(db, 'accountTransfers', transferId), newTransfer),
      ]);
      logAction(
        'Accounting',
        'Account Transfer',
        `Transferred ₹${data.amount} from ${data.fromAccountName} to ${data.toAccountName}`
      );
    } catch (e) {
      console.warn('Firestore addAccountTransfer note:', e);
    }
    return transferId;
  };

  // REVERSE TRANSACTION (Cancel with dual reversal, ledger audit and invoice unlocking)
  const reverseTransaction = async (
    type: 'cash_in' | 'cash_out' | 'in' | 'out',
    id: string,
    reason?: string
  ): Promise<void> => {
    const isCashIn = type === 'cash_in' || type === 'in';
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const reversalNote = `[REVERSED: ${reason || 'Transaction Cancelled'}]`;
    const today = new Date().toISOString().split('T')[0];

    if (isCashIn) {
      const target = cashInTransactions.find(
        (t) =>
          t.id === id ||
          (t.referenceNo && t.referenceNo === id) ||
          (t.sourceId && t.sourceId === id)
      );
      if (!target || target.status === 'Cancelled' || target.isReversed) {
        return;
      }

      const updatedTx: CashInTransaction = {
        ...target,
        status: 'Cancelled',
        isReversed: true,
        reversalDate: today,
        reversalReason: reason || 'Reversed by Admin',
        notes: target.notes ? `${target.notes} ${reversalNote}` : reversalNote,
        updatedAt: new Date().toISOString(),
        ...(currentUid ? { ownerUid: currentUid } : {}),
      };

      setCashInTransactions((prev) => prev.map((t) => (t.id === target.id ? updatedTx : t)));
      if (currentUid) {
        setDoc(doc(db, 'cashInTransactions', target.id), updatedTx).catch(() => {});
      }

      // If linked to an invoice, deduct from invoice paid amount, recalculate status, and UNLOCK invoice
      const targetInvId = target.invoiceId;
      const targetRefNo = target.referenceNo;
      const inv = invoices.find(
        (i) =>
          (targetInvId && i.id === targetInvId) ||
          (targetRefNo && (i.invoiceNumber === targetRefNo || i.id === targetRefNo))
      );
      if (inv) {
        const revAmount = Number(target.amount) || 0;
        const newPaid = Math.max(0, (Number(inv.advancePaid) || 0) - revAmount);
        const newRemaining = Math.max(0, (Number(inv.grandTotal) || 0) - newPaid);
        const newStatus: PaymentStatus = newRemaining <= 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';

        const updatedInv: Invoice = {
          ...inv,
          advancePaid: newPaid,
          remainingBalance: newRemaining,
          paymentStatus: newStatus,
          isLocked: false, // Unlocks invoice for edits upon reversal
          notes: inv.notes ? `${inv.notes} [Payment ₹${revAmount} Reversed]` : `[Payment ₹${revAmount} Reversed]`,
          ...(currentUid ? { ownerUid: currentUid } : {}),
        };

        setInvoices((prev) => prev.map((i) => (i.id === inv.id ? updatedInv : i)));
        if (currentUid) {
          setDoc(doc(db, 'invoices', inv.id), updatedInv).catch(() => {});
        }
      }

      // Reverse linked payment receipt record if present
      setPayments((prev) =>
        prev.map((p) => {
          if (
            (targetInvId && p.invoiceId === targetInvId) ||
            p.transactionRef === id ||
            p.id === target.sourceId ||
            (targetRefNo && (p.transactionRef === targetRefNo || p.receiptNo === targetRefNo))
          ) {
            const updatedP = { ...p, notes: `${p.notes || ''} [REVERSED]` };
            if (currentUid) {
              setDoc(doc(db, 'payments', p.id), updatedP).catch(() => {});
            }
            return updatedP;
          }
          return p;
        })
      );
    } else {
      const target = cashOutTransactions.find(
        (t) =>
          t.id === id ||
          (t.referenceNo && t.referenceNo === id) ||
          (t.sourceId && t.sourceId === id)
      );
      if (!target || target.status === 'Cancelled' || target.isReversed) {
        return;
      }

      const updatedTx: CashOutTransaction = {
        ...target,
        status: 'Cancelled',
        isReversed: true,
        reversalDate: today,
        reversalReason: reason || 'Reversed by Admin',
        notes: target.notes ? `${target.notes} ${reversalNote}` : reversalNote,
        updatedAt: new Date().toISOString(),
        ...(currentUid ? { ownerUid: currentUid } : {}),
      };

      setCashOutTransactions((prev) => prev.map((t) => (t.id === target.id ? updatedTx : t)));
      if (currentUid) {
        setDoc(doc(db, 'cashOutTransactions', target.id), updatedTx).catch(() => {});
      }

      // If linked to purchase, update purchase paid status
      const pur = purchases.find(
        (p) =>
          (target.purchaseId && p.id === target.purchaseId) ||
          (target.referenceNo &&
            (p.billNumber === target.referenceNo ||
              p.invoiceNumber === target.referenceNo ||
              p.id === target.referenceNo))
      );
      if (pur) {
        const revAmount = Number(target.amount) || 0;
        const newPaid = Math.max(0, (Number(pur.amountPaid) || 0) - revAmount);
        const newStatus = newPaid <= 0 ? 'Pending' : newPaid < (pur.totalAmount || 0) ? 'Partial' : 'Paid';
        const updatedPur = {
          ...pur,
          amountPaid: newPaid,
          paymentStatus: newStatus as any,
          ...(currentUid ? { ownerUid: currentUid } : {}),
        };
        setPurchases((prev) => prev.map((p) => (p.id === pur.id ? updatedPur : p)));
        if (currentUid) {
          setDoc(doc(db, 'purchases', pur.id), updatedPur).catch(() => {});
        }
      }

      // If linked to distributor, restore distributor outstanding balance
      const distId = target.distributorId || pur?.distributorId;
      if (distId) {
        const revAmount = Number(target.amount) || 0;
        setDistributors((prev) =>
          prev.map((d) => {
            if (d.id === distId) {
              const updatedDist = {
                ...d,
                currentBalance: (Number(d.currentBalance) || 0) + revAmount,
                ...(currentUid ? { ownerUid: currentUid } : {}),
              };
              if (currentUid) {
                setDoc(doc(db, 'distributors', d.id), updatedDist).catch(() => {});
              }
              return updatedDist;
            }
            return d;
          })
        );
      }

      // If linked to expense, update expense status
      if (target.expenseId) {
        const exp = expenses.find((e) => e.id === target.expenseId);
        if (exp) {
          const updatedExp = {
            ...exp,
            status: 'Pending' as const,
            notes: exp.notes ? `${exp.notes} [Payment Reversed]` : '[Payment Reversed]',
            ...(currentUid ? { ownerUid: currentUid } : {}),
          };
          setExpenses((prev) => prev.map((e) => (e.id === exp.id ? updatedExp : e)));
          if (currentUid) {
            setDoc(doc(db, 'expenses', exp.id), updatedExp).catch(() => {});
          }
        }
      }
    }

    logAction('Accounting', 'Transaction Reversed', `Reversed ${type} transaction ${id}. Reason: ${reason || 'Cancelled'}`);
  };

  // CHEQUE STATUS UPDATE & CLEARING
  const updateChequeStatus = async (
    type: 'cash_in' | 'cash_out',
    id: string,
    chequeStatus: ChequeStatus,
    clearedDate?: string
  ): Promise<void> => {
    const currentUid = user && !(user as any).isDemo ? user.uid : undefined;
    const isCleared = chequeStatus === 'Cleared';
    const isBounced = chequeStatus === 'Bounced';
    const isCancelled = chequeStatus === 'Cancelled';

    if (type === 'cash_in') {
      const target = cashInTransactions.find((t) => t.id === id);
      setCashInTransactions((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            let nextStatus = t.status;
            if (isCleared) nextStatus = 'Confirmed';
            else if (isBounced) nextStatus = 'Bounced';
            else if (isCancelled) nextStatus = 'Cancelled';
            else if (chequeStatus === 'Deposited') nextStatus = 'Pending';

            const updated: CashInTransaction = {
              ...t,
              chequeStatus,
              chequeClearedDate: isCleared ? (clearedDate || new Date().toISOString().split('T')[0]) : t.chequeClearedDate,
              status: nextStatus,
              ...(currentUid ? { ownerUid: currentUid } : {}),
            };
            setDoc(doc(db, 'cashInTransactions', id), updated).catch(() => {});
            return updated;
          }
          return t;
        })
      );

      // If linked to an invoice:
      if (target && target.invoiceId) {
        const inv = invoices.find((i) => i.id === target.invoiceId);
        if (inv) {
          // If moving to Cleared from a non-confirmed state
          if (isCleared && target.status !== 'Confirmed') {
            const newPaid = (Number(inv.advancePaid) || 0) + Number(target.amount);
            const newRemaining = Math.max(0, (Number(inv.grandTotal) || 0) - newPaid);
            const newStatus: PaymentStatus = newRemaining <= 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';
            const updatedInv: Invoice = {
              ...inv,
              advancePaid: newPaid,
              remainingBalance: newRemaining,
              paymentStatus: newStatus,
              ...(currentUid ? { ownerUid: currentUid } : {}),
            };
            setInvoices((prev) => prev.map((i) => (i.id === inv.id ? updatedInv : i)));
            setDoc(doc(db, 'invoices', inv.id), updatedInv).catch(() => {});

            // Record cleared payment in payments ledger if not already present
            if (!payments.some((p) => p.transactionRef === target.id || (target.chequeNumber && p.transactionRef === target.chequeNumber))) {
              const payId = `PAY-${Date.now()}`;
              const rctNo = `RCT-2026-${String(payments.length + 1).padStart(3, '0')}`;
              const newPayment: Payment = {
                id: payId,
                receiptNo: rctNo,
                invoiceId: inv.id,
                invoiceNumber: inv.invoiceNumber,
                customerId: inv.customerId,
                customerName: inv.customerName,
                amount: Number(target.amount),
                paymentDate: clearedDate || new Date().toISOString().split('T')[0],
                paymentMode: 'Cheque',
                transactionRef: target.chequeNumber || target.id,
                notes: `Cheque cleared for Invoice ${inv.invoiceNumber}`,
                ...(currentUid ? { ownerUid: currentUid } : {}),
              };
              setPayments((prev) => [newPayment, ...prev]);
              setDoc(doc(db, 'payments', payId), newPayment).catch(() => {});
            }
          }
          // If reversing previously cleared cheque (Bounced or Cancelled)
          else if ((isBounced || isCancelled) && target.status === 'Confirmed') {
            const newPaid = Math.max(0, (Number(inv.advancePaid) || 0) - Number(target.amount));
            const newRemaining = Math.max(0, (Number(inv.grandTotal) || 0) - newPaid);
            const newStatus: PaymentStatus = newRemaining <= 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';
            const updatedInv: Invoice = {
              ...inv,
              advancePaid: newPaid,
              remainingBalance: newRemaining,
              paymentStatus: newStatus,
              ...(currentUid ? { ownerUid: currentUid } : {}),
            };
            setInvoices((prev) => prev.map((i) => (i.id === inv.id ? updatedInv : i)));
            setDoc(doc(db, 'invoices', inv.id), updatedInv).catch(() => {});
          }
        }
      }
    } else {
      setCashOutTransactions((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            let nextStatus = t.status;
            if (isCleared) nextStatus = 'Paid';
            else if (isBounced) nextStatus = 'Bounced';
            else if (isCancelled) nextStatus = 'Cancelled';

            const updated: CashOutTransaction = {
              ...t,
              chequeStatus,
              chequeClearedDate: isCleared ? (clearedDate || new Date().toISOString().split('T')[0]) : t.chequeClearedDate,
              status: nextStatus,
              ...(currentUid ? { ownerUid: currentUid } : {}),
            };
            setDoc(doc(db, 'cashOutTransactions', id), updated).catch(() => {});
            return updated;
          }
          return t;
        })
      );
    }

    logAction('Accounting', 'Cheque Status Changed', `Updated cheque status for ${type} ${id} to ${chequeStatus}`);
  };

  // BACKUP & RESTORE
  const exportDatabaseJSON = () => {
    const backupObj = {
      companySettings,
      customers,
      projects,
      invoices,
      quotations,
      inventory,
      stockLogs,
      distributors,
      purchases,
      purchaseReturns,
      payments,
      expenses,
      employees,
      auditLogs,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solarix_erp_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    logAction('Settings', 'Database Exported', 'Downloaded complete system JSON backup');
  };

  const importDatabaseJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.projects) setProjects(parsed.projects);
      if (parsed.invoices) setInvoices(parsed.invoices);
      if (parsed.quotations) setQuotations(parsed.quotations);
      if (parsed.inventory) setInventory(parsed.inventory);
      if (parsed.stockLogs) setStockLogs(parsed.stockLogs);
      if (parsed.distributors) setDistributors(parsed.distributors);
      if (parsed.purchases) setPurchases(parsed.purchases);
      if (parsed.purchaseReturns) setPurchaseReturns(parsed.purchaseReturns);
      if (parsed.payments) setPayments(parsed.payments);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.employees) setEmployees(parsed.employees);
      if (parsed.companySettings) setCompanySettings(parsed.companySettings);
      logAction('Settings', 'Database Restored', 'Successfully restored system state from JSON file');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const bulkImportCustomers = (importedCustomers: Partial<Customer>[]) => {
    const formatted = importedCustomers.map((c, idx) => ({
      id: `CUST-${1000 + customers.length + idx + 1}`,
      name: c.name || 'Unnamed Customer',
      fatherName: c.fatherName || '',
      mobile: c.mobile || '0000000000',
      email: c.email || '',
      address: c.address || '',
      village: c.village || '',
      block: c.block || '',
      district: c.district || '',
      state: c.state || '',
      pincode: c.pincode || '',
      aadharNumber: c.aadharNumber || '',
      gstNumber: c.gstNumber || '',
      projectType: (c.projectType as any) || 'Residential',
      documents: [],
      createdAt: new Date().toISOString().split('T')[0],
    }));

    setCustomers((prev) => [...formatted, ...prev]);
    formatted.forEach((item) => setDoc(doc(db, 'customers', item.id), item).catch(() => {}));
    logAction('Customer', 'Bulk Import', `Imported ${formatted.length} customers via CSV/JSON`);
  };

  const exportToCSV = (filename: string, rows: any[]) => {
    if (!rows || !rows.length) return;
    const keys = Object.keys(rows[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        keys.join(','),
        ...rows.map((row) =>
          keys
            .map((k) => {
              const val = row[k] === undefined || row[k] === null ? '' : String(row[k]);
              return `"${val.replace(/"/g, '""')}"`;
            })
            .join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        userRole,
        setUserRole,
        companySettings,
        updateCompanySettings,
        user,
        authLoading,
        logout,
        loginAsDemo,
        authModalOpen,
        setAuthModalOpen,
        isCloudSynced,
        syncStatus,
        lastSyncedAt,
        isDarkMode,
        toggleDarkMode,
        themeAccent,
        setThemeAccent,
        themeStyle,
        setThemeStyle,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        projects,
        addProject,
        updateProject,
        deleteProject,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        quotations,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        convertQuotationToInvoice,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        deleteMultipleProducts,
        duplicateProduct,
        toggleProductStatus,
        adjustProductStock,
        bulkImportProducts,
        reseedDefaultProducts,
        inventory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        recordStockLog,
        stockLogs,
        purchases,
        addPurchase,
        updatePurchase,
        deletePurchase,
        distributors,
        addDistributor,
        updateDistributor,
        deleteDistributor,
        purchaseReturns,
        addPurchaseReturn,
        updatePurchaseReturn,
        deletePurchaseReturn,
        payments,
        addPayment,
        expenses,
        addExpense,
        deleteExpense,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        auditLogs,
        logAction,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        printData,
        setPrintData,
        triggerPrint,
        globalSearchOpen,
        setGlobalSearchOpen,
        auditLogOpen,
        setAuditLogOpen,
        exportDatabaseJSON,
        importDatabaseJSON,
        bulkImportCustomers,
        exportToCSV,

        // Accounting & Cash Flow System
        accounts,
        cashInTransactions,
        cashOutTransactions,
        accountTransfers,
        addAccount,
        updateAccount,
        deleteAccount,
        addCashIn,
        updateCashIn,
        deleteCashIn,
        addCashOut,
        updateCashOut,
        deleteCashOut,
        addAccountTransfer,
        reverseTransaction,
        updateChequeStatus,
        getAccountCalculatedBalance,
        totalAvailableCash,

        // Service Tickets, Subsidies & Net Metering
        serviceTickets,
        addServiceTicket,
        updateServiceTicket,
        subsidyRecords,
        netMeteringRecords,

        // Gemini AI Assistant & Live Voice
        isAiAssistantOpen,
        setIsAiAssistantOpen,
        isVoiceLiveActive,
        setIsVoiceLiveActive,
        applyChatAction,
        getErpStateSnapshot,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
