import { FunctionDeclaration, Type } from '@google/genai';

export const GEMINI_TOOL_DECLARATIONS: FunctionDeclaration[] = [
  // 1. get_customers
  {
    name: 'get_customers',
    description: 'Retrieve the list of registered solar customers, their contact details, address, village, district, and project type.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: {
          type: Type.NUMBER,
          description: 'Optional maximum number of customers to return (default: 20)',
        },
      },
    },
  },
  // 2. get_customer_by_id
  {
    name: 'get_customer_by_id',
    description: 'Fetch detailed 360-degree information of a specific customer by ID, name, or mobile number, including their linked projects, invoices, and subsidy/tickets.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerId: {
          type: Type.STRING,
          description: 'The unique customer ID (e.g. CUST-001) or mobile number or customer name.',
        },
      },
      required: ['customerId'],
    },
  },
  // 3. search_customer
  {
    name: 'search_customer',
    description: 'Search customers across name, mobile number, village, district, or Aadhaar number.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Search term such as customer name, phone number, village, or district.',
        },
      },
      required: ['query'],
    },
  },
  // 4. get_leads
  {
    name: 'get_leads',
    description: 'Retrieve prospective solar inquiries, pending leads, and quotations awaiting approval or conversion.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          description: 'Optional filter: "Draft", "Sent", or "Pending"',
        },
      },
    },
  },
  // 5. get_pending_followups
  {
    name: 'get_pending_followups',
    description: 'Get actionable pending follow-ups for customer proposals, site feasibility surveys, open service tickets, and payment collections.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  // 6. get_projects
  {
    name: 'get_projects',
    description: 'Retrieve solar EPC projects including capacity (KW), system type (On Grid/Off Grid/Hybrid), technician assigned, and execution status.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          description: 'Optional filter by status: "Pending", "Running", "Completed", or "Cancelled"',
        },
      },
    },
  },
  // 7. get_project_status
  {
    name: 'get_project_status',
    description: 'Get deep status, installation progress percentage, solar panel/inverter hardware specs, and site details of a specific project.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: {
          type: Type.STRING,
          description: 'The project ID (e.g. PRJ-2026-001) or customer name.',
        },
      },
      required: ['projectId'],
    },
  },
  // 8. get_installations
  {
    name: 'get_installations',
    description: 'Get scheduled, upcoming, and ongoing solar plant site installations with installation dates, locations, and assigned technicians.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          description: 'Optional status filter: "Running", "Pending", "Completed"',
        },
      },
    },
  },
  // 9. get_inventory
  {
    name: 'get_inventory',
    description: 'Check stock levels, inventory quantities, low-stock warnings, purchase rates, and sales prices for inverters, VFDs, solar panels, and hardware.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          description: 'Optional category filter (e.g. "VFD", "Solar Panels", "Inverters", "Batteries", "Structure")',
        },
        lowStockOnly: {
          type: Type.BOOLEAN,
          description: 'If true, returns only products where stock is at or below minimum stock alert threshold.',
        },
      },
    },
  },
  // 10. get_pending_payments
  {
    name: 'get_pending_payments',
    description: 'Retrieve outstanding customer invoices with remaining balances due, customer contacts, and payment due dates.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerId: {
          type: Type.STRING,
          description: 'Optional customer ID to filter dues for a specific customer.',
        },
      },
    },
  },
  // 11. get_payment_summary
  {
    name: 'get_payment_summary',
    description: 'Get total financial summary including total invoiced billing, total revenue collected, total pending dues, and current cash/bank account balances.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  // 12. get_subsidy_status
  {
    name: 'get_subsidy_status',
    description: 'Check rooftop solar government subsidy status (PM Surya Ghar Muft Bijli Yojana / DBT portal application, sanction, inspection, release) for customers or projects.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Optional search query such as customer name, project ID, or application number.',
        },
      },
    },
  },
  // 13. get_net_metering_status
  {
    name: 'get_net_metering_status',
    description: 'Check DISCOM net metering status (feasibility study, meter testing, bidirectional meter installation, and grid synchronization/commissioning).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Optional search query such as customer name, project ID, or DISCOM application number.',
        },
      },
    },
  },
  // 14. get_service_tickets
  {
    name: 'get_service_tickets',
    description: 'Retrieve customer solar plant service, warranty, breakdown maintenance, and inverter fault tickets.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          description: 'Optional status filter: "Open", "In Progress", "Resolved", "Closed"',
        },
        priority: {
          type: Type.STRING,
          description: 'Optional priority filter: "Low", "Medium", "High", "Urgent"',
        },
      },
    },
  },
  // 15. get_employee_tasks
  {
    name: 'get_employee_tasks',
    description: 'Get list of solar field engineers and technicians, their assigned site projects, installation schedule, and phone numbers.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        employeeName: {
          type: Type.STRING,
          description: 'Optional employee name to filter tasks for.',
        },
      },
    },
  },
  // 16. update_project_status
  {
    name: 'update_project_status',
    description: 'Update the execution status, progress percentage, or notes of an existing solar project.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: {
          type: Type.STRING,
          description: 'The project ID (e.g. PRJ-2026-001).',
        },
        status: {
          type: Type.STRING,
          description: 'The new status: "Pending", "Running", "Completed", or "Cancelled".',
        },
        progressPercent: {
          type: Type.NUMBER,
          description: 'The progress percentage (0 to 100).',
        },
        notes: {
          type: Type.STRING,
          description: 'Optional update notes or site remarks.',
        },
      },
      required: ['projectId', 'status'],
    },
  },
  // 17. assign_employee
  {
    name: 'assign_employee',
    description: 'Assign a field engineer or technician to a solar project.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: {
          type: Type.STRING,
          description: 'The project ID (e.g. PRJ-2026-001).',
        },
        employeeName: {
          type: Type.STRING,
          description: 'The full name of the technician or employee to assign.',
        },
        notes: {
          type: Type.STRING,
          description: 'Optional notes regarding task assignment.',
        },
      },
      required: ['projectId', 'employeeName'],
    },
  },
  // 18. schedule_installation
  {
    name: 'schedule_installation',
    description: 'Schedule or reschedule the site installation date and assign technician for a solar project.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: {
          type: Type.STRING,
          description: 'The project ID (e.g. PRJ-2026-001).',
        },
        installationDate: {
          type: Type.STRING,
          description: 'The installation date in YYYY-MM-DD format (e.g. 2026-09-15).',
        },
        technicianName: {
          type: Type.STRING,
          description: 'Optional technician name to assign for this installation.',
        },
        notes: {
          type: Type.STRING,
          description: 'Optional installation instructions or site constraints.',
        },
      },
      required: ['projectId', 'installationDate'],
    },
  },
  // 19. record_payment
  {
    name: 'record_payment',
    description: 'Record a customer payment received against an invoice, updating invoice remaining balance and accounting cash registers.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        invoiceId: {
          type: Type.STRING,
          description: 'The invoice number (e.g. INV-2026-001) or invoice ID.',
        },
        amount: {
          type: Type.NUMBER,
          description: 'Amount in INR received from the customer.',
        },
        paymentMode: {
          type: Type.STRING,
          description: 'Payment method: "Cash", "UPI", "Bank Transfer", or "Cheque".',
        },
        transactionRef: {
          type: Type.STRING,
          description: 'Transaction UTR, reference number, or cheque number.',
        },
        notes: {
          type: Type.STRING,
          description: 'Optional remarks or payment notes.',
        },
      },
      required: ['invoiceId', 'amount', 'paymentMode'],
    },
  },
  // 20. create_customer
  {
    name: 'create_customer',
    description: 'Register a new customer for solar installation with contact and location details.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: 'Full name of the customer.',
        },
        mobile: {
          type: Type.STRING,
          description: '10-digit mobile number.',
        },
        address: {
          type: Type.STRING,
          description: 'Full street / locality address.',
        },
        projectType: {
          type: Type.STRING,
          description: 'Solar project type: "Residential", "Commercial", "Industrial", or "Government".',
        },
        fatherName: {
          type: Type.STRING,
          description: 'Father or spouse name.',
        },
        village: {
          type: Type.STRING,
          description: 'Village or ward name.',
        },
        district: {
          type: Type.STRING,
          description: 'District (e.g. Jaunpur, Varanasi).',
        },
        state: {
          type: Type.STRING,
          description: 'State name (e.g. Uttar Pradesh).',
        },
        pincode: {
          type: Type.STRING,
          description: '6-digit PIN code.',
        },
        email: {
          type: Type.STRING,
          description: 'Optional email address.',
        },
      },
      required: ['name', 'mobile', 'address'],
    },
  },
  // 21. update_customer
  {
    name: 'update_customer',
    description: 'Update customer contact, address, or details.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerId: {
          type: Type.STRING,
          description: 'The customer ID (e.g. CUST-001) or mobile number to update.',
        },
        name: {
          type: Type.STRING,
          description: 'Updated name of the customer.',
        },
        mobile: {
          type: Type.STRING,
          description: 'Updated mobile number.',
        },
        address: {
          type: Type.STRING,
          description: 'Updated street address.',
        },
        projectType: {
          type: Type.STRING,
          description: 'Updated project type.',
        },
        email: {
          type: Type.STRING,
          description: 'Updated email.',
        },
      },
      required: ['customerId'],
    },
  },
  // 22. create_service_ticket
  {
    name: 'create_service_ticket',
    description: 'Log a new service, warranty, panel cleaning, or inverter breakdown ticket for a solar plant.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerId: {
          type: Type.STRING,
          description: 'The customer ID (e.g. CUST-001) or name.',
        },
        issueDescription: {
          type: Type.STRING,
          description: 'Detailed description of the issue or maintenance requirement.',
        },
        customerName: {
          type: Type.STRING,
          description: 'Optional customer name if customer ID is not handy.',
        },
        projectId: {
          type: Type.STRING,
          description: 'Optional linked project ID (e.g. PRJ-2026-001).',
        },
        category: {
          type: Type.STRING,
          description: 'Issue category: "Inverter Fault", "Panel Cleaning", "Wiring / MCB", "Zero Generation", "Physical Damage", or "General Maintenance".',
        },
        priority: {
          type: Type.STRING,
          description: 'Priority level: "Low", "Medium", "High", or "Urgent".',
        },
        assignedTo: {
          type: Type.STRING,
          description: 'Optional technician name to assign this ticket to.',
        },
      },
      required: ['customerId', 'issueDescription'],
    },
  },
];

export interface ToolExecutionResponse {
  result: any;
  action?: {
    type: string;
    summary: string;
    data: any;
  };
}

export function executeToolCall(
  name: string,
  args: Record<string, any>,
  erpState: any
): ToolExecutionResponse {
  const {
    customers = [],
    projects = [],
    inventory = [],
    invoices = [],
    payments = [],
    employees = [],
    quotations = [],
    accounts = [],
    serviceTickets = [],
    subsidyRecords = [],
    netMeteringRecords = [],
  } = erpState || {};

  switch (name) {
    case 'get_customers': {
      const limit = args.limit || 30;
      const list = customers.slice(0, limit).map((c: any) => ({
        id: c.id,
        name: c.name,
        mobile: c.mobile,
        village: c.village || '',
        district: c.district || '',
        state: c.state || '',
        address: c.address || '',
        projectType: c.projectType,
        createdAt: c.createdAt,
      }));
      return {
        result: {
          totalCustomers: customers.length,
          returnedCount: list.length,
          customers: list,
        },
      };
    }

    case 'get_customer_by_id': {
      const query = String(args.customerId || '').toLowerCase().trim();
      const customer = customers.find(
        (c: any) =>
          c.id?.toLowerCase() === query ||
          c.mobile?.includes(query) ||
          c.name?.toLowerCase().includes(query)
      );

      if (!customer) {
        return {
          result: { error: `Customer '${args.customerId}' not found in database.` },
        };
      }

      const custProjects = projects.filter((p: any) => p.customerId === customer.id || p.customerMobile === customer.mobile);
      const custInvoices = invoices.filter((inv: any) => inv.customerId === customer.id || inv.customerMobile === customer.mobile);
      const custPayments = payments.filter((pm: any) => pm.customerId === customer.id);
      const custSubsidies = subsidyRecords.filter((s: any) => s.customerId === customer.id || s.customerMobile === customer.mobile);
      const custNetMetering = netMeteringRecords.filter((nm: any) => nm.customerId === customer.id || nm.customerMobile === customer.mobile);
      const custTickets = serviceTickets.filter((t: any) => t.customerId === customer.id || t.customerMobile === customer.mobile);

      return {
        result: {
          customer,
          projects: custProjects,
          invoices: custInvoices.map((inv: any) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            date: inv.date,
            grandTotal: inv.grandTotal,
            advancePaid: inv.advancePaid,
            remainingBalance: inv.remainingBalance,
            paymentStatus: inv.paymentStatus,
          })),
          payments: custPayments,
          subsidies: custSubsidies,
          netMetering: custNetMetering,
          serviceTickets: custTickets,
        },
      };
    }

    case 'search_customer': {
      const q = String(args.query || '').toLowerCase().trim();
      const matches = customers.filter(
        (c: any) =>
          c.name?.toLowerCase().includes(q) ||
          c.mobile?.includes(q) ||
          c.village?.toLowerCase().includes(q) ||
          c.district?.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q) ||
          c.aadharNumber?.includes(q) ||
          c.id?.toLowerCase().includes(q)
      );
      return {
        result: {
          searchTerm: args.query,
          matchCount: matches.length,
          matches: matches.map((c: any) => ({
            id: c.id,
            name: c.name,
            mobile: c.mobile,
            location: `${c.village ? c.village + ', ' : ''}${c.district || ''}, ${c.state || ''}`,
            projectType: c.projectType,
          })),
        },
      };
    }

    case 'get_leads': {
      // Find quotations that are Draft/Sent, or customers with status Pending project
      const openQuotes = quotations.filter((q: any) => q.status === 'Draft' || q.status === 'Sent');
      const pendingProjects = projects.filter((p: any) => p.status === 'Pending');
      return {
        result: {
          totalLeads: openQuotes.length + pendingProjects.length,
          quotationLeads: openQuotes.map((q: any) => ({
            quoteNumber: q.quoteNumber,
            customerName: q.customerName,
            customerMobile: q.customerMobile,
            capacityKW: q.capacityKW,
            estimatedCost: q.estimatedCost,
            grandTotal: q.grandTotal,
            status: q.status,
            validUntil: q.validUntil,
          })),
          pendingSiteProjects: pendingProjects.map((p: any) => ({
            projectId: p.projectId,
            customerName: p.customerName,
            customerMobile: p.customerMobile,
            capacityKW: p.capacityKW,
            systemType: p.systemType,
            status: p.status,
            location: p.location,
          })),
        },
      };
    }

    case 'get_pending_followups': {
      const unpaidInvoices = invoices.filter((inv: any) => inv.remainingBalance > 0);
      const pendingProjects = projects.filter((p: any) => p.status === 'Pending');
      const openTickets = serviceTickets.filter((t: any) => t.status === 'Open' || t.status === 'In Progress');
      const sentQuotes = quotations.filter((q: any) => q.status === 'Sent');

      return {
        result: {
          summary: {
            unpaidInvoicesCount: unpaidInvoices.length,
            pendingProjectsCount: pendingProjects.length,
            openServiceTicketsCount: openTickets.length,
            sentQuotesFollowupCount: sentQuotes.length,
          },
          paymentCollections: unpaidInvoices.map((inv: any) => ({
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customerName,
            customerMobile: inv.customerMobile,
            remainingBalance: inv.remainingBalance,
            dueDate: inv.dueDate,
          })),
          projectSurveysPending: pendingProjects.map((p: any) => ({
            projectId: p.projectId,
            customerName: p.customerName,
            customerMobile: p.customerMobile,
            capacityKW: p.capacityKW,
            location: p.location,
          })),
          openServiceTickets: openTickets,
          sentQuotes: sentQuotes.map((q: any) => ({
            quoteNumber: q.quoteNumber,
            customerName: q.customerName,
            customerMobile: q.customerMobile,
            capacityKW: q.capacityKW,
            grandTotal: q.grandTotal,
            validUntil: q.validUntil,
          })),
        },
      };
    }

    case 'get_projects': {
      let filtered = projects;
      if (args.status) {
        filtered = projects.filter((p: any) => p.status?.toLowerCase() === args.status.toLowerCase());
      }
      return {
        result: {
          totalProjects: projects.length,
          filteredCount: filtered.length,
          projects: filtered.map((p: any) => ({
            projectId: p.projectId,
            customerName: p.customerName,
            customerMobile: p.customerMobile,
            capacityKW: p.capacityKW,
            systemType: p.systemType,
            status: p.status,
            progressPercent: p.progressPercent,
            technicianAssigned: p.technicianAssigned,
            installationDate: p.installationDate,
            location: p.location,
          })),
        },
      };
    }

    case 'get_project_status': {
      const q = String(args.projectId || '').toLowerCase().trim();
      const proj = projects.find(
        (p: any) =>
          p.projectId?.toLowerCase() === q ||
          p.id?.toLowerCase() === q ||
          p.customerName?.toLowerCase().includes(q)
      );

      if (!proj) {
        return {
          result: { error: `Project '${args.projectId}' not found in system.` },
        };
      }

      return {
        result: {
          project: proj,
        },
      };
    }

    case 'get_installations': {
      let insts = projects;
      if (args.status) {
        insts = projects.filter((p: any) => p.status?.toLowerCase() === args.status.toLowerCase());
      }
      return {
        result: {
          totalInstallations: insts.length,
          installations: insts.map((p: any) => ({
            projectId: p.projectId,
            customerName: p.customerName,
            customerMobile: p.customerMobile,
            capacityKW: p.capacityKW,
            systemType: p.systemType,
            status: p.status,
            progressPercent: p.progressPercent,
            installationDate: p.installationDate,
            completionDate: p.completionDate,
            technicianAssigned: p.technicianAssigned,
            panelsCount: p.panelsCount,
            panelModel: p.panelModel,
            inverterModel: p.inverterModel,
            location: p.location,
          })),
        },
      };
    }

    case 'get_inventory': {
      let items = inventory;
      if (args.category) {
        items = items.filter((i: any) => i.category?.toLowerCase() === args.category.toLowerCase());
      }
      if (args.lowStockOnly) {
        items = items.filter((i: any) => (i.stock ?? i.currentStock ?? 0) <= (i.minStockAlert ?? 5));
      }
      return {
        result: {
          totalItems: items.length,
          items: items.map((i: any) => ({
            id: i.id,
            productName: i.productName || i.name,
            category: i.category,
            make: i.make || i.brand,
            stock: i.stock ?? i.currentStock ?? 0,
            unit: i.unit || 'Nos',
            minStockAlert: i.minStockAlert ?? 5,
            purchasePrice: i.purchasePrice ?? i.unitPrice ?? 0,
            salePrice: i.salePrice ?? i.sellingPrice ?? 0,
            isLowStock: (i.stock ?? i.currentStock ?? 0) <= (i.minStockAlert ?? 5),
            status: i.status || 'Active',
          })),
        },
      };
    }

    case 'get_pending_payments': {
      let unpaid = invoices.filter((inv: any) => (inv.remainingBalance || 0) > 0);
      if (args.customerId) {
        const cId = String(args.customerId).toLowerCase();
        unpaid = unpaid.filter((inv: any) => inv.customerId?.toLowerCase() === cId || inv.customerName?.toLowerCase().includes(cId));
      }
      const totalOutstanding = unpaid.reduce((s: number, inv: any) => s + (inv.remainingBalance || 0), 0);
      return {
        result: {
          totalOutstandingAmount: totalOutstanding,
          pendingInvoicesCount: unpaid.length,
          pendingInvoices: unpaid.map((inv: any) => ({
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customerName,
            customerMobile: inv.customerMobile,
            date: inv.date,
            dueDate: inv.dueDate,
            grandTotal: inv.grandTotal,
            advancePaid: inv.advancePaid,
            remainingBalance: inv.remainingBalance,
            paymentStatus: inv.paymentStatus,
          })),
        },
      };
    }

    case 'get_payment_summary': {
      const totalBilled = invoices.reduce((s: number, inv: any) => s + (Number(inv.grandTotal) || 0), 0);
      const totalAdvance = invoices.reduce((s: number, inv: any) => s + (Number(inv.advancePaid) || 0), 0);
      const totalOutstanding = invoices.reduce((s: number, inv: any) => s + (Number(inv.remainingBalance) || 0), 0);
      const totalPaymentsRecorded = payments.reduce((s: number, pm: any) => s + (Number(pm.amount) || 0), 0);

      const accountsSummary = accounts.map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        accountType: acc.accountType,
        openingBalance: acc.openingBalance,
      }));

      return {
        result: {
          totalBilledRevenue: totalBilled,
          totalCollectedRevenue: totalAdvance || totalPaymentsRecorded,
          totalOutstandingReceivables: totalOutstanding,
          totalRecordedPaymentsCount: payments.length,
          cashBankAccounts: accountsSummary,
        },
      };
    }

    case 'get_subsidy_status': {
      let list = subsidyRecords;
      if (args.query) {
        const q = String(args.query).toLowerCase().trim();
        list = subsidyRecords.filter(
          (s: any) =>
            s.customerName?.toLowerCase().includes(q) ||
            s.customerMobile?.includes(q) ||
            s.applicationNo?.toLowerCase().includes(q) ||
            s.projectId?.toLowerCase().includes(q)
        );
      }
      return {
        result: {
          totalRecords: list.length,
          subsidies: list,
        },
      };
    }

    case 'get_net_metering_status': {
      let list = netMeteringRecords;
      if (args.query) {
        const q = String(args.query).toLowerCase().trim();
        list = netMeteringRecords.filter(
          (nm: any) =>
            nm.customerName?.toLowerCase().includes(q) ||
            nm.customerMobile?.includes(q) ||
            nm.applicationNo?.toLowerCase().includes(q) ||
            nm.projectId?.toLowerCase().includes(q)
        );
      }
      return {
        result: {
          totalRecords: list.length,
          netMeteringApplications: list,
        },
      };
    }

    case 'get_service_tickets': {
      let list = serviceTickets;
      if (args.status) {
        list = list.filter((t: any) => t.status?.toLowerCase() === args.status.toLowerCase());
      }
      if (args.priority) {
        list = list.filter((t: any) => t.priority?.toLowerCase() === args.priority.toLowerCase());
      }
      return {
        result: {
          totalTickets: list.length,
          tickets: list,
        },
      };
    }

    case 'get_employee_tasks': {
      let list = employees;
      if (args.employeeName) {
        const q = String(args.employeeName).toLowerCase();
        list = list.filter((e: any) => e.name?.toLowerCase().includes(q));
      }
      return {
        result: {
          totalEmployees: list.length,
          employees: list.map((e: any) => {
            const assigned = projects.filter((p: any) => p.technicianAssigned?.toLowerCase().includes(e.name.toLowerCase()));
            return {
              id: e.id,
              name: e.name,
              designation: e.designation,
              phone: e.phone,
              attendanceToday: e.attendanceToday,
              assignedProjectsCount: assigned.length,
              assignedProjects: assigned.map((p: any) => ({
                projectId: p.projectId,
                customerName: p.customerName,
                capacityKW: p.capacityKW,
                status: p.status,
                installationDate: p.installationDate,
              })),
            };
          }),
        },
      };
    }

    // --- WRITE ACTIONS ---

    case 'update_project_status': {
      const proj = projects.find(
        (p: any) => p.projectId === args.projectId || p.id === args.projectId
      );
      return {
        result: {
          success: true,
          message: `Project ${args.projectId} updated to status '${args.status}' with progress ${args.progressPercent ?? proj?.progressPercent ?? 0}%.`,
          projectId: args.projectId,
          status: args.status,
          progressPercent: args.progressPercent,
        },
        action: {
          type: 'UPDATE_PROJECT_STATUS',
          summary: `Updated project ${args.projectId} status to ${args.status} (${args.progressPercent ?? proj?.progressPercent ?? 0}%)`,
          data: {
            projectId: args.projectId,
            status: args.status,
            progressPercent: args.progressPercent,
            notes: args.notes,
          },
        },
      };
    }

    case 'assign_employee': {
      return {
        result: {
          success: true,
          message: `Assigned employee '${args.employeeName}' to project ${args.projectId}.`,
          projectId: args.projectId,
          assignedTechnician: args.employeeName,
        },
        action: {
          type: 'ASSIGN_EMPLOYEE',
          summary: `Assigned ${args.employeeName} to project ${args.projectId}`,
          data: {
            projectId: args.projectId,
            employeeName: args.employeeName,
            notes: args.notes,
          },
        },
      };
    }

    case 'schedule_installation': {
      return {
        result: {
          success: true,
          message: `Installation for project ${args.projectId} scheduled on ${args.installationDate} with technician ${args.technicianName || 'Unassigned'}.`,
          projectId: args.projectId,
          installationDate: args.installationDate,
          technicianName: args.technicianName,
        },
        action: {
          type: 'SCHEDULE_INSTALLATION',
          summary: `Scheduled installation for ${args.projectId} on ${args.installationDate} (${args.technicianName || 'Technician TBA'})`,
          data: {
            projectId: args.projectId,
            installationDate: args.installationDate,
            technicianName: args.technicianName,
            notes: args.notes,
          },
        },
      };
    }

    case 'record_payment': {
      return {
        result: {
          success: true,
          message: `Successfully recorded payment of ₹${Number(args.amount).toLocaleString('en-IN')} via ${args.paymentMode} for invoice ${args.invoiceId}.`,
          invoiceId: args.invoiceId,
          amount: args.amount,
          paymentMode: args.paymentMode,
        },
        action: {
          type: 'RECORD_PAYMENT',
          summary: `Recorded payment of ₹${Number(args.amount).toLocaleString('en-IN')} via ${args.paymentMode} for invoice ${args.invoiceId}`,
          data: {
            invoiceId: args.invoiceId,
            amount: Number(args.amount),
            paymentMode: args.paymentMode,
            transactionRef: args.transactionRef || `TXN-${Date.now().toString().slice(-6)}`,
            notes: args.notes || 'Recorded via AI Assistant',
          },
        },
      };
    }

    case 'create_customer': {
      const generatedId = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
      return {
        result: {
          success: true,
          message: `Created new customer '${args.name}' with ID ${generatedId}.`,
          customer: {
            id: generatedId,
            name: args.name,
            mobile: args.mobile,
            address: args.address,
            projectType: args.projectType || 'Residential',
          },
        },
        action: {
          type: 'CREATE_CUSTOMER',
          summary: `Registered new customer: ${args.name} (${args.mobile})`,
          data: {
            id: generatedId,
            name: args.name,
            mobile: args.mobile,
            address: args.address,
            fatherName: args.fatherName || '',
            village: args.village || '',
            district: args.district || 'Jaunpur',
            state: args.state || 'Uttar Pradesh',
            pincode: args.pincode || '222001',
            email: args.email || '',
            projectType: args.projectType || 'Residential',
          },
        },
      };
    }

    case 'update_customer': {
      return {
        result: {
          success: true,
          message: `Updated customer ${args.customerId}.`,
          customerId: args.customerId,
        },
        action: {
          type: 'UPDATE_CUSTOMER',
          summary: `Updated customer details for ${args.customerId}`,
          data: {
            customerId: args.customerId,
            ...args,
          },
        },
      };
    }

    case 'create_service_ticket': {
      const ticketNo = `SRV-${String(serviceTickets.length + 1).padStart(3, '0')}`;
      const ticketId = `TICK-${Date.now()}`;
      return {
        result: {
          success: true,
          message: `Logged service ticket ${ticketNo} for customer ${args.customerId}.`,
          ticketNo,
          issueDescription: args.issueDescription,
        },
        action: {
          type: 'CREATE_SERVICE_TICKET',
          summary: `Logged service ticket ${ticketNo}: ${args.issueDescription.slice(0, 45)}...`,
          data: {
            id: ticketId,
            ticketNo,
            customerId: args.customerId,
            customerName: args.customerName || 'Customer',
            projectId: args.projectId,
            issueDescription: args.issueDescription,
            category: args.category || 'General Maintenance',
            priority: args.priority || 'Medium',
            status: 'Open',
            assignedTo: args.assignedTo || 'Unassigned',
            createdDate: new Date().toISOString().split('T')[0],
          },
        },
      };
    }

    default:
      return {
        result: { error: `Tool '${name}' is not recognized.` },
      };
  }
}
