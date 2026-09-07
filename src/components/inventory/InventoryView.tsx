import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Layers,
  Edit2,
  X,
  History,
  Trash2,
  Eye,
  CheckCircle2,
  Download,
  ChevronLeft,
  ChevronRight,
  Box,
  ToggleLeft,
  ToggleRight,
  RotateCw,
  Tag,
  SlidersHorizontal,
  RefreshCw,
  Radio,
  Building2,
  TrendingUp,
  Percent,
  Check,
  FileSpreadsheet,
  Upload,
  AlertCircle,
  FileText,
  CheckSquare,
  ShoppingCart,
} from 'lucide-react';
import { useApp, formatINR, calculateSalePrice, SyncStatus } from '../../context/AppContext';
import { Product, InventoryCategory } from '../../types';

export const InventoryView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteMultipleProducts,
    toggleProductStatus,
    adjustProductStock,
    bulkImportProducts,
    stockLogs,
    exportToCSV,
    syncStatus,
    lastSyncedAt,
    userRole,
    setActiveTab,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search, Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [makeFilter, setMakeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'purchasePrice' | 'salePrice' | 'margin' | 'stock' | 'updated'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Multi-Record Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  // Excel Import State
  const [importError, setImportError] = useState<string | null>(null);
  const [importValidationErrors, setImportValidationErrors] = useState<string[]>([]);
  const [pendingImportRows, setPendingImportRows] = useState<
    Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]
  >([]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    productName: string;
    make: string;
    category: InventoryCategory;
    purchasePrice: number;
    margin: number;
    salePrice: number;
    autoCalculateSalePrice: boolean;
    stock: number;
    minStockAlert: number;
    unit: string;
    status: 'Active' | 'Inactive';
    specifications: string;
    location: string;
    supplier: string;
    barcode: string;
  }>({
    productName: '',
    make: 'INVT',
    category: 'VFD',
    purchasePrice: 32000,
    margin: 10,
    salePrice: 35200,
    autoCalculateSalePrice: true,
    stock: 10,
    minStockAlert: 5,
    unit: 'Nos',
    status: 'Active',
    specifications: '',
    location: 'Main Warehouse',
    supplier: 'INVT Power Solutions',
    barcode: '',
  });

  // Stock Adjustment Form State
  const [stockLogType, setStockLogType] = useState<'Stock In' | 'Stock Out'>('Stock In');
  const [stockQuantity, setStockQuantity] = useState(5);
  const [stockRefNo, setStockRefNo] = useState(`PO-${Date.now().toString().slice(-6)}`);
  const [stockNotes, setStockNotes] = useState('Stock inventory restock');

  // Categories & Makes for filtering
  const allCategories: InventoryCategory[] = [
    'VFD',
    'Solar Panel',
    'Installation',
    'Inverters',
    'Solar Panels',
    'Batteries',
    'Wires',
    'MCB',
    'Structure',
    'Tools',
    'Earthing',
    'Lighting Protection',
  ];

  const uniqueMakes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.make) set.add(p.make.trim());
    });
    return Array.from(set).sort();
  }, [products]);

  // Form Price Recalculation Handler
  const handlePurchasePriceChange = (newPrice: number) => {
    setFormData((prev) => {
      const p = Math.max(0, newPrice);
      const s = prev.autoCalculateSalePrice
        ? calculateSalePrice(p, prev.margin)
        : prev.salePrice;
      return { ...prev, purchasePrice: p, salePrice: s };
    });
  };

  const handleMarginChange = (newMargin: number) => {
    setFormData((prev) => {
      const m = Number(newMargin) || 0;
      const s = prev.autoCalculateSalePrice
        ? calculateSalePrice(prev.purchasePrice, m)
        : prev.salePrice;
      return { ...prev, margin: m, salePrice: s };
    });
  };

  const handleSalePriceChange = (newSalePrice: number) => {
    setFormData((prev) => ({
      ...prev,
      salePrice: Math.max(0, newSalePrice),
      autoCalculateSalePrice: false, // Manual override
    }));
  };

  const handleToggleAutoCalculate = () => {
    setFormData((prev) => {
      const nextAuto = !prev.autoCalculateSalePrice;
      const nextSale = nextAuto
        ? calculateSalePrice(prev.purchasePrice, prev.margin)
        : prev.salePrice;
      return { ...prev, autoCalculateSalePrice: nextAuto, salePrice: nextSale };
    });
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      productName: '',
      make: 'UBSW',
      category: 'Installation',
      purchasePrice: 1000,
      margin: 10,
      salePrice: 1100,
      autoCalculateSalePrice: true,
      stock: 25,
      minStockAlert: 5,
      unit: 'Nos',
      status: 'Active',
      specifications: 'Standard quality installation hardware',
      location: 'Warehouse Rack A2',
      supplier: 'Upadhyay Brother Solar Works',
      barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
    });
    setAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (p: Product) => {
    setSelectedProduct(p);
    setFormData({
      productName: p.productName || p.name,
      make: p.make || p.brand || 'UBSW',
      category: (p.category as InventoryCategory) || 'Installation',
      purchasePrice: p.purchasePrice,
      margin: p.margin ?? 10,
      salePrice: p.salePrice,
      autoCalculateSalePrice: p.autoCalculateSalePrice !== false,
      stock: p.stock,
      minStockAlert: p.minStockAlert || 5,
      unit: p.unit || 'Nos',
      status: p.status || 'Active',
      specifications: p.specifications || '',
      location: p.location || 'Warehouse Main',
      supplier: p.supplier || p.make || 'UBSW',
      barcode: p.barcode || `890${Date.now().toString().slice(-9)}`,
    });
    setEditModalOpen(true);
  };

  // Open Stock Modal
  const openStockModal = (p: Product) => {
    setSelectedProduct(p);
    setStockLogType('Stock In');
    setStockQuantity(10);
    setStockRefNo(`PO-${Date.now().toString().slice(-6)}`);
    setStockNotes(`Restocked ${p.productName}`);
    setStockModalOpen(true);
  };

  // Submit Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await addProduct(formData);
      setAddModalOpen(false);
      showToast(`Added ${created.productName} to Product Master!`, 'success');
    } catch (err) {
      showToast('Failed to add product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await updateProduct(selectedProduct.id, formData);
      setEditModalOpen(false);
      showToast(`Updated product ${formData.productName}!`, 'success');
    } catch (err) {
      showToast('Failed to update product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await deleteProduct(selectedProduct.id);
      setSelectedProductIds((prev) => {
        const next = new Set(prev);
        next.delete(selectedProduct.id);
        return next;
      });
      setDeleteModalOpen(false);
      showToast(`Deleted ${selectedProduct.productName} from database.`, 'info');
    } catch (err) {
      showToast('Failed to delete product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Multi-Record Selection Actions
  const handleToggleSelectRow = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAllOnPage = () => {
    if (paginatedProducts.length === 0) return;
    const allOnPageSelected = paginatedProducts.every((p) => selectedProductIds.has(p.id));
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        paginatedProducts.forEach((p) => next.delete(p.id));
      } else {
        paginatedProducts.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (filteredProducts.length === 0) return;
    const allFilteredSelected = filteredProducts.every((p) => selectedProductIds.has(p.id));
    if (allFilteredSelected) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedProductIds(new Set());
  };

  // Bulk Delete Confirmation and Execution
  const handleBulkDeleteConfirm = async () => {
    if (selectedProductIds.size === 0) return;
    setIsSubmitting(true);
    try {
      const idsToDelete = Array.from(selectedProductIds);
      const count = await deleteMultipleProducts(idsToDelete);
      setSelectedProductIds(new Set());
      setBulkDeleteModalOpen(false);
      showToast(`Successfully deleted ${count} products from inventory.`, 'success');
    } catch (err) {
      showToast('Failed to delete selected products', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Toggle Status
  const handleToggleStatus = async (p: Product) => {
    try {
      await toggleProductStatus(p.id);
      showToast(
        `Product marked as ${p.status === 'Active' ? 'Inactive' : 'Active'}`,
        'info'
      );
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  };

  // Submit Stock Adjustment
  const handleStockAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await adjustProductStock(
        selectedProduct.id,
        stockQuantity,
        stockLogType,
        stockRefNo,
        stockNotes
      );
      setStockModalOpen(false);
      showToast(
        `Recorded ${stockLogType} of ${stockQuantity} ${selectedProduct.unit} for ${selectedProduct.productName}`,
        'success'
      );
    } catch (err) {
      showToast('Failed to adjust stock', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download Blank Excel Template
  const handleDownloadTemplate = () => {
    try {
      const headers = [
        ['Category', 'Product Name / Model', 'Price (₹)', 'Margin', 'Sale Price', 'GST', 'Make', 'HSN / SAC CODE'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(headers);
      ws['!cols'] = [
        { wch: 18 }, // Category
        { wch: 32 }, // Product Name / Model
        { wch: 15 }, // Price (₹)
        { wch: 12 }, // Margin
        { wch: 15 }, // Sale Price
        { wch: 12 }, // GST
        { wch: 18 }, // Make
        { wch: 18 }, // HSN / SAC CODE
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventory Template');
      XLSX.writeFile(wb, 'Inventory_Template.xlsx');
      showToast('Downloaded Inventory_Template.xlsx successfully!', 'success');
    } catch (err: any) {
      showToast(`Failed to generate template: ${err?.message}`, 'error');
    }
  };

  // Trigger File Input Click
  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Excel File Parsing and Validation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
          setImportError('The Excel file contains no valid sheets.');
          setImportValidationErrors([]);
          setPendingImportRows([]);
          setImportModalOpen(true);
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          blankrows: false,
        });

        if (!rawRows || rawRows.length === 0) {
          setImportError('The selected Excel file is empty.');
          setImportValidationErrors([]);
          setPendingImportRows([]);
          setImportModalOpen(true);
          return;
        }

        // 1. Validate Column Headers
        const headerRow = (rawRows[0] || []).map((h: any) =>
          String(h || '').trim().toLowerCase()
        );

        const findColIndex = (aliases: string[]) => {
          return headerRow.findIndex((h: string) =>
            aliases.some((alias) => h === alias.toLowerCase() || h.includes(alias.toLowerCase()))
          );
        };

        const categoryIdx = findColIndex(['category']);
        const nameIdx = findColIndex(['product name / model', 'product name', 'product_name', 'model', 'item name']);
        const priceIdx = findColIndex(['price (₹)', 'price(₹)', 'purchase price', 'price', 'rate', 'unit price']);
        const marginIdx = findColIndex(['margin', 'margin %', 'margin(%)', 'profit margin']);
        const salePriceIdx = findColIndex(['sale price', 'sale price (₹)', 'selling price', 'selling_price', 'mrp']);
        const gstIdx = findColIndex(['gst', 'gst %', 'gst(%)', 'tax', 'tax %']);
        const makeIdx = findColIndex(['make', 'brand', 'company', 'manufacturer']);
        const hsnIdx = findColIndex(['hsn / sac code', 'hsn/sac code', 'hsn / sac', 'hsn/sac', 'hsn code', 'hsn', 'sac code', 'sac']);

        const missingHeaders: string[] = [];
        if (categoryIdx === -1) missingHeaders.push('Category');
        if (nameIdx === -1) missingHeaders.push('Product Name / Model');
        if (priceIdx === -1) missingHeaders.push('Price (₹)');
        if (marginIdx === -1) missingHeaders.push('Margin');
        if (salePriceIdx === -1) missingHeaders.push('Sale Price');
        if (gstIdx === -1) missingHeaders.push('GST');
        if (makeIdx === -1) missingHeaders.push('Make');

        if (missingHeaders.length > 0) {
          setImportError(
            `Invalid Excel column structure. Missing required column(s): ${missingHeaders.join(
              ', '
            )}. Please use the "Download Excel Template" for the expected schema.`
          );
          setImportValidationErrors([]);
          setPendingImportRows([]);
          setImportModalOpen(true);
          return;
        }

        // 2. Validate Row Data
        const errors: string[] = [];
        const parsedProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [];

        for (let r = 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          const rowNum = r + 1; // 1-indexed row number in Excel

          // Skip completely empty rows
          if (!row || row.every((val: any) => val === undefined || val === null || String(val).trim() === '')) {
            continue;
          }

          const rawCategory = String(row[categoryIdx] || '').trim();
          const rawName = String(row[nameIdx] || '').trim();
          const rawPrice = String(row[priceIdx] || '').trim();
          const rawMargin = String(row[marginIdx] || '').trim();
          const rawSalePrice = String(row[salePriceIdx] || '').trim();
          const rawGst = String(row[gstIdx] || '').trim();
          const rawMake = String(row[makeIdx] || '').trim();
          const rawHsn = hsnIdx !== -1 ? String(row[hsnIdx] || '').trim() : '';

          // Validation Rule 1: Category cannot be empty
          if (!rawCategory) {
            errors.push(`Row ${rowNum}: Category cannot be empty.`);
          }

          // Validation Rule 2: Product Name / Model cannot be empty
          if (!rawName) {
            errors.push(`Row ${rowNum}: Product Name / Model cannot be empty.`);
          }

          // Validation Rule 3: Price must be a valid number
          const cleanPriceStr = rawPrice.replace(/[₹,\s]/g, '');
          const parsedPrice = parseFloat(cleanPriceStr);
          if (!rawPrice || isNaN(parsedPrice) || parsedPrice < 0) {
            errors.push(
              `Row ${rowNum}: Price "${rawPrice || 'EMPTY'}" must be a valid positive number.`
            );
          }

          // Validation Rule 4: Margin percentage
          const cleanMarginStr = rawMargin.replace(/[%,\s]/g, '');
          let parsedMargin = cleanMarginStr ? parseFloat(cleanMarginStr) : 10;
          if (rawMargin && isNaN(parsedMargin)) {
            errors.push(`Row ${rowNum}: Margin "${rawMargin}" must be a valid number or percentage.`);
          }

          // Validation Rule 5: Sale Price
          const cleanSalePriceStr = rawSalePrice.replace(/[₹,\s]/g, '');
          let parsedSalePrice = cleanSalePriceStr ? parseFloat(cleanSalePriceStr) : 0;
          if (rawSalePrice && (isNaN(parsedSalePrice) || parsedSalePrice < 0)) {
            errors.push(
              `Row ${rowNum}: Sale Price "${rawSalePrice}" must be a valid positive number.`
            );
          } else if (!parsedSalePrice && !isNaN(parsedPrice)) {
            parsedSalePrice = calculateSalePrice(parsedPrice, parsedMargin || 10);
          }

          // Validation Rule 6: GST percentage
          const cleanGstStr = rawGst.replace(/[%,\s]/g, '');
          let parsedGst = cleanGstStr ? parseFloat(cleanGstStr) : 18;
          if (rawGst && isNaN(parsedGst)) {
            errors.push(`Row ${rowNum}: GST "${rawGst}" must be a valid number or percentage.`);
          }

          if (errors.length === 0) {
            parsedProducts.push({
              category: (rawCategory as InventoryCategory) || 'General',
              productName: rawName,
              name: rawName,
              model: rawName,
              make: rawMake || 'UBSW',
              brand: rawMake || 'UBSW',
              hsnCode: rawHsn || (rawCategory.toLowerCase().includes('panel') ? '8541' : rawCategory.toLowerCase().includes('inverter') ? '8504' : '8504'),
              purchasePrice: isNaN(parsedPrice) ? 0 : parsedPrice,
              unitPrice: isNaN(parsedPrice) ? 0 : parsedPrice,
              margin: parsedMargin || 10,
              salePrice: parsedSalePrice,
              sellingPrice: parsedSalePrice,
              gstPercent: parsedGst,
              gst: `${parsedGst}%`,
              stock: 0,
              currentStock: 0,
              minStockAlert: 5,
              unit: 'Nos',
              status: 'Active',
              autoCalculateSalePrice: true,
              specifications: 'Imported via Excel catalog',
              supplier: rawMake || 'UBSW',
              location: 'Warehouse Main',
            });
          }
        }

        if (errors.length > 0) {
          setImportValidationErrors(errors);
          setPendingImportRows([]);
          setImportError(null);
          setImportModalOpen(true);
          return;
        }

        if (parsedProducts.length === 0) {
          setImportError('No product rows were found in the file to import.');
          setImportValidationErrors([]);
          setPendingImportRows([]);
          setImportModalOpen(true);
          return;
        }

        // Success - Open modal with preview
        setPendingImportRows(parsedProducts);
        setImportValidationErrors([]);
        setImportError(null);
        setImportModalOpen(true);
      } catch (err: any) {
        setImportError(`Failed to process Excel file: ${err?.message || 'Unknown error'}`);
        setImportValidationErrors([]);
        setPendingImportRows([]);
        setImportModalOpen(true);
      }
    };

    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Confirm Excel Import
  const handleConfirmImport = async () => {
    if (pendingImportRows.length === 0) return;
    setIsSubmitting(true);
    try {
      const count = await bulkImportProducts(pendingImportRows);
      showToast(`Successfully imported ${count} products into Inventory!`, 'success');
      setImportModalOpen(false);
      setPendingImportRows([]);
      setCurrentPage(1);
    } catch (err: any) {
      showToast(`Failed to import products: ${err?.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const rows = products.map((item) => ({
      'Product ID': item.id,
      'Product Name / Model': item.productName || item.name,
      'Category': item.category,
      'Make / Brand': item.make || item.brand,
      'Purchase Price (₹)': item.purchasePrice,
      'Margin (%)': item.margin ?? 10,
      'Sale Price (₹)': item.salePrice,
      'GST (%)': item.gstPercent ?? 18,
      'Current Stock': item.stock,
      'Unit': item.unit,
      'Status': item.status || 'Active',
      'Min Stock Alert': item.minStockAlert,
      'Supplier': item.supplier || item.make,
      'Location': item.location,
      'Barcode': item.barcode,
      'Last Updated': item.lastUpdated || item.updatedAt?.split('T')[0],
    }));
    exportToCSV('Inventory_Product_Catalog', rows);
    showToast('Exported Inventory catalog dataset to CSV', 'success');
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        const query = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !query ||
          item.productName?.toLowerCase().includes(query) ||
          item.name?.toLowerCase().includes(query) ||
          item.make?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.id?.toLowerCase().includes(query) ||
          item.barcode?.includes(query);

        const matchesCategory =
          categoryFilter === 'ALL' ||
          item.category?.toLowerCase() === categoryFilter.toLowerCase();

        const matchesMake =
          makeFilter === 'ALL' ||
          item.make?.toLowerCase() === makeFilter.toLowerCase();

        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'Active' && item.status !== 'Inactive') ||
          (statusFilter === 'Inactive' && item.status === 'Inactive') ||
          (statusFilter === 'LowStock' && item.stock <= (item.minStockAlert || 5)) ||
          (statusFilter === 'OutOfStock' && item.stock === 0);

        return matchesSearch && matchesCategory && matchesMake && matchesStatus;
      })
      .sort((a, b) => {
        let valA: any = a.productName;
        let valB: any = b.productName;

        if (sortBy === 'purchasePrice') {
          valA = a.purchasePrice;
          valB = b.purchasePrice;
        } else if (sortBy === 'salePrice') {
          valA = a.salePrice;
          valB = b.salePrice;
        } else if (sortBy === 'margin') {
          valA = a.margin ?? 10;
          valB = b.margin ?? 10;
        } else if (sortBy === 'stock') {
          valA = a.stock;
          valB = b.stock;
        } else if (sortBy === 'updated') {
          valA = a.updatedAt || a.lastUpdated || '';
          valB = b.updatedAt || b.lastUpdated || '';
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, searchTerm, categoryFilter, makeFilter, statusFilter, sortBy, sortOrder]);

  // Pagination Math
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary Metrics
  const totalItemsCount = products.length;
  const activeItemsCount = products.filter((p) => p.status !== 'Inactive').length;
  const lowStockCount = products.filter((i) => i.stock > 0 && i.stock <= (i.minStockAlert || 5)).length;
  const outOfStockCount = products.filter((i) => i.stock === 0).length;
  const totalValuation = products.reduce((acc, i) => acc + (i.stock || 0) * (i.purchasePrice || 0), 0);

  return (
    <div id="inventory-master-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border font-medium text-xs text-white animate-in slide-in-from-bottom-5 ${
            toastType === 'success'
              ? 'bg-emerald-600 border-emerald-500'
              : toastType === 'error'
              ? 'bg-red-600 border-red-500'
              : 'bg-slate-800 border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Status Indicator */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Inventory & Product Master
            </h2>
            {/* Real-time Cloud Connection Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                syncStatus === 'connected'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-slate-500/10 border-slate-500/30 text-slate-500'
              }`}
              title={`Firestore Real-Time Status: ${syncStatus}. Last synced: ${lastSyncedAt || 'Just now'}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  syncStatus === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : syncStatus === 'syncing'
                    ? 'bg-amber-500 animate-spin'
                    : 'bg-slate-400'
                }`}
              />
              <span className="capitalize">{syncStatus}</span>
              {lastSyncedAt && (
                <span className="text-[10px] opacity-70 hidden sm:inline">
                  • {lastSyncedAt}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Single source of truth with real-time pricing synchronization across Quotations, Invoices & Orders
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden File Input for Excel Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls"
            className="hidden"
          />

          {/* Download Excel Template Button */}
          <button
            id="btn-download-template"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition border border-slate-200/80 dark:border-slate-700"
            title="Download blank Excel spreadsheet template with required columns"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Download Excel Template</span>
          </button>

          {/* Import Excel Button */}
          <button
            id="btn-import-excel"
            onClick={handleTriggerFileInput}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition border border-emerald-500/30"
            title="Import products from an Excel (.xlsx, .xls) spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Import Excel</span>
          </button>

          {/* Stock Log History Button */}
          <button
            id="btn-stock-history"
            onClick={() => setHistoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition border border-slate-200/80 dark:border-slate-700"
          >
            <History className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Movement Logs</span>
          </button>

          {/* CSV Export */}
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition border border-slate-200/80 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>

          {/* Purchases & Inward shortcut */}
          <button
            id="btn-goto-purchases"
            onClick={() => setActiveTab('purchases')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold text-xs transition border border-blue-500/30"
            title="Open Product Purchases, Supplier Bills & Goods Received Notes (GRN)"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-blue-500" />
            <span>Purchases & Inward</span>
          </button>

          {/* Add Product Button */}
          <button
            id="btn-add-product"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Alert if Any */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-800 dark:text-amber-300 text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>
              Inventory Alert: <strong className="font-bold">{lowStockCount} items</strong> are low on stock and{' '}
              <strong className="font-bold text-red-500">{outOfStockCount} items</strong> are out of stock.
            </span>
          </div>
          <button
            onClick={() => setStatusFilter(statusFilter === 'LowStock' ? 'ALL' : 'LowStock')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-bold text-[11px] text-amber-900 dark:text-amber-200 transition"
          >
            {statusFilter === 'LowStock' ? 'Show All' : 'Filter Low Stock'}
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Catalog Products</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalItemsCount}</h3>
            <Box className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-[10px] text-slate-400">{activeItemsCount} active for billing</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Low Stock Warnings</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-amber-500">{lowStockCount}</h3>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-[10px] text-slate-400">Below minimum buffer</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Out of Stock</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-red-500">{outOfStockCount}</h3>
            <X className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-[10px] text-slate-400">Needs replenishment</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Inventory Valuation</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatINR(totalValuation)}
            </h3>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-[10px] text-slate-400">At purchase rate</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-product-search"
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search product / model, make, category, barcode..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Dropdowns: Category, Make, Status, Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            id="select-category-filter"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="VFD">VFD</option>
            <option value="Solar Panel">Solar Panel</option>
            <option value="Installation">Installation</option>
            <option value="Inverters">Inverters</option>
            <option value="Batteries">Batteries</option>
            <option value="Wires">Wires</option>
            <option value="Structure">Structure</option>
          </select>

          {/* Make Dropdown */}
          <select
            id="select-make-filter"
            value={makeFilter}
            onChange={(e) => {
              setMakeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="ALL">All Makes</option>
            {uniqueMakes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="select-status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="LowStock">Low Stock</option>
            <option value="OutOfStock">Out of Stock</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            id="select-sort-by"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="updated-desc">Recently Updated</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="purchasePrice-asc">Purchase Price (Low to High)</option>
            <option value="purchasePrice-desc">Purchase Price (High to Low)</option>
            <option value="salePrice-asc">Sale Price (Low to High)</option>
            <option value="salePrice-desc">Sale Price (High to Low)</option>
            <option value="margin-desc">Margin (Highest %)</option>
            <option value="stock-desc">Stock (Highest)</option>
            <option value="stock-asc">Stock (Lowest)</option>
          </select>
        </div>
      </div>

      {/* Master Products Table & Multi-Select Batch Actions */}
      <div className="space-y-3">
        {/* Batch Selection Action Bar */}
        {selectedProductIds.size > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                {selectedProductIds.size} Selected
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                {selectedProductIds.size === filteredProducts.length
                  ? `All ${filteredProducts.length} filtered items selected`
                  : `${selectedProductIds.size} of ${filteredProducts.length} items selected`}
              </span>
              {filteredProducts.length > selectedProductIds.size && (
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Select all {filteredProducts.length} items
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition"
              >
                Clear Selection
              </button>
              <button
                type="button"
                onClick={() => setBulkDeleteModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedProductIds.size})</span>
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        paginatedProducts.length > 0 &&
                        paginatedProducts.every((p) => selectedProductIds.has(p.id))
                      }
                      onChange={handleToggleSelectAllOnPage}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
                      title="Select / deselect all visible on this page"
                    />
                  </th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Product Name / Model</th>
                  <th className="p-3.5">Make</th>
                  <th className="p-3.5 text-right">Purchase Price (₹)</th>
                  <th className="p-3.5 text-center">Margin</th>
                  <th className="p-3.5 text-right">Sale Price (₹)</th>
                  <th className="p-3.5 text-center">Stock</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 px-4">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
                        <Box className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        No inventory records found
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        The inventory database is empty. Click "+ Add Product" to add items manually or "Import Excel" to upload a spreadsheet catalog.
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={openAddModal}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                        >
                          + Add Product
                        </button>
                        <button
                          type="button"
                          onClick={handleTriggerFileInput}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Import Excel</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= (p.minStockAlert || 5);
                  const isOut = p.stock === 0;
                  const isActive = p.status !== 'Inactive';
                  const isSelected = selectedProductIds.has(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                        isSelected
                          ? 'bg-amber-500/10 dark:bg-amber-500/15'
                          : !isActive
                          ? 'opacity-60 bg-slate-50/40 dark:bg-slate-950/40'
                          : isOut
                          ? 'bg-red-500/5'
                          : isLow
                          ? 'bg-amber-500/5'
                          : ''
                      }`}
                    >
                      {/* Row Selection Checkbox */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(p.id)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </td>

                      {/* Category */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      {/* Product Name / Model */}
                      <td className="p-3.5 whitespace-nowrap font-medium">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {p.productName || p.name}
                          </span>
                          {p.isDefaultProduct && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              title="Default Catalog SKU"
                            >
                              Core
                            </span>
                          )}
                        </div>
                        {p.specifications && (
                          <p className="text-[10px] text-slate-400 font-normal truncate max-w-xs">
                            {p.specifications}
                          </p>
                        )}
                      </td>

                      {/* Make */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {p.make || p.brand || 'UBSW'}
                        </span>
                      </td>

                      {/* Purchase Price */}
                      <td className="p-3.5 text-right font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {formatINR(p.purchasePrice)}
                      </td>

                      {/* Margin */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {p.margin ?? 10}%
                        </span>
                      </td>

                      {/* Sale Price */}
                      <td className="p-3.5 text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatINR(p.salePrice)}
                      </td>

                      {/* Stock & Unit */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <span
                            className={`font-black ${
                              isOut
                                ? 'text-red-500'
                                : isLow
                                ? 'text-amber-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {p.stock}
                          </span>
                          <span className="text-slate-400 text-[10px]">{p.unit || 'Nos'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full transition ${
                            !isActive
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              : isOut
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : isLow
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}
                          title="Click to toggle Active / Inactive"
                        >
                          {isActive ? (isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Active') : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Adjust Stock Button */}
                          <button
                            onClick={() => openStockModal(p)}
                            className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-bold text-[11px] transition flex items-center gap-1"
                            title="Adjust Stock Quantity"
                          >
                            <Layers className="w-3 h-3" />
                            <span>Stock</span>
                          </button>

                          {/* View Details */}
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setViewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="View Specifications"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Product */}
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit Master Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Product */}
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}{' '}
              products
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-900 dark:text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* ========================================================= */}
      {/* ADD / EDIT PRODUCT MODAL */}
      {/* ========================================================= */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {addModalOpen ? 'Add Master Product' : 'Edit Master Product'}
                </h3>
                <p className="text-xs text-slate-400">
                  Configure purchase pricing, margin calculations, stock units & make
                </p>
              </div>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalOpen(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={addModalOpen ? handleAddSubmit : handleEditSubmit}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs"
            >
              {/* Product Name & Make */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Product Name / Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. INVT VFD 30 HP or UTL TOPCON 227W 12V"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Make / Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    placeholder="e.g. INVT, UTL, UBSW"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 font-bold text-blue-500"
                  />
                </div>
              </div>

              {/* Category, Unit & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    {allCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit of Measure *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="Nos">Nos (Number)</option>
                    <option value="Pcs">Pcs (Pieces)</option>
                    <option value="Set">Set</option>
                    <option value="FT">FT (Feet)</option>
                    <option value="Lot">Lot</option>
                    <option value="Mtr">Mtr (Meters)</option>
                    <option value="Kg">Kg</option>
                    <option value="Box">Box</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Product Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none font-bold"
                  >
                    <option value="Active">Active (Available for Invoices)</option>
                    <option value="Inactive">Inactive (Archived)</option>
                  </select>
                </div>
              </div>

              {/* Real-time Pricing Box (Purchase Price, Margin, Sale Price) */}
              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-slate-900 dark:text-white">
                      Automated Real-Time Pricing Engine
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAutoCalculate}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                      formData.autoCalculateSalePrice
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {formData.autoCalculateSalePrice ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Auto-Calc (On)</span>
                      </>
                    ) : (
                      <span>Manual Override</span>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Purchase Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min={0}
                      required
                      value={formData.purchasePrice}
                      onChange={(e) => handlePurchasePriceChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Margin (%) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min={0}
                      required
                      value={formData.margin}
                      onChange={(e) => handleMarginChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-amber-500 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Sale Price (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min={0}
                      required
                      value={formData.salePrice}
                      onChange={(e) => handleSalePriceChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 font-black text-sm"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-amber-500/10 pt-2">
                  <span>Formula: <strong>Sale Price = Purchase Price × (1 + Margin / 100)</strong></span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Gross Profit: {formatINR(formData.salePrice - formData.purchasePrice)} / {formData.unit}
                  </span>
                </div>
              </div>

              {/* Initial Stock & Alert Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Stock Quantity
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Minimum Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Specifications & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Storage Location / Bin
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Main Warehouse A1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supplier / Vendor
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="e.g. UTL Solar Energies"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Specifications / Technical Description
                </label>
                <textarea
                  rows={2}
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  placeholder="e.g. 25HP heavy-duty pump controller, 3-phase IP54 enclosure"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to Firestore...' : addModalOpen ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* QUICK STOCK ADJUSTMENT MODAL */}
      {/* ========================================================= */}
      {stockModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Stock Adjustment</h3>
                <p className="text-xs text-slate-400">{selectedProduct.productName}</p>
              </div>
              <button
                onClick={() => setStockModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockAdjustSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">Current Stock</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedProduct.stock} {selectedProduct.unit}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Sale Price</p>
                  <p className="text-lg font-black text-emerald-500">
                    {formatINR(selectedProduct.salePrice)}
                  </p>
                </div>
              </div>

              {/* Movement Type */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStockLogType('Stock In')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                    stockLogType === 'Stock In'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Stock In (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStockLogType('Stock Out')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                    stockLogType === 'Stock Out'
                      ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Stock Out (-)</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Adjustment Quantity ({selectedProduct.unit}) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-black text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reference / PO / Invoice Number
                </label>
                <input
                  type="text"
                  required
                  value={stockRefNo}
                  onChange={(e) => setStockRefNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Notes
                </label>
                <textarea
                  rows={2}
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Commit Stock Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW PRODUCT SPECIFICATIONS MODAL */}
      {/* ========================================================= */}
      {viewModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {selectedProduct.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {selectedProduct.productName}
                </h3>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <p className="text-slate-400 text-[10px]">Make / Brand</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedProduct.make}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <p className="text-slate-400 text-[10px]">Product Code / SKU</p>
                  <p className="font-mono font-bold text-amber-500">{selectedProduct.id}</p>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">Commercial Pricing Details</p>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Purchase Price:</span>
                  <span className="font-bold">{formatINR(selectedProduct.purchasePrice)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Applied Margin:</span>
                  <span className="font-bold text-amber-500">{selectedProduct.margin ?? 10}%</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-black text-sm border-t border-slate-200 dark:border-slate-700 pt-1.5">
                  <span>Selling / Invoice Rate:</span>
                  <span>{formatINR(selectedProduct.salePrice)}</span>
                </div>
              </div>

              {/* Technical Specifications */}
              {selectedProduct.specifications && (
                <div className="space-y-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Technical Specifications:</p>
                  <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedProduct.specifications}
                  </p>
                </div>
              )}

              {/* Warehouse Details */}
              <div className="grid grid-cols-2 gap-4 text-slate-600 dark:text-slate-300">
                <div>
                  <p className="text-slate-400 text-[10px]">Warehouse Location</p>
                  <p className="font-semibold">{selectedProduct.location || 'Warehouse Main'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Barcode / SKU</p>
                  <p className="font-mono text-[11px]">{selectedProduct.barcode || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setViewModalOpen(false);
                    openEditModal(selectedProduct);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
                >
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL (SINGLE PRODUCT) */}
      {/* ========================================================= */}
      {deleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Product?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to permanently delete <strong>{selectedProduct.productName}</strong> ({selectedProduct.id}) from Firestore?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-md shadow-red-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* BULK DELETE CONFIRMATION MODAL (MULTIPLE PRODUCTS) */}
      {/* ========================================================= */}
      {bulkDeleteModalOpen && selectedProductIds.size > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete {selectedProductIds.size} Selected {selectedProductIds.size === 1 ? 'Product' : 'Products'}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Are you sure you want to permanently delete <strong>{selectedProductIds.size}</strong> inventory {selectedProductIds.size === 1 ? 'record' : 'records'} from your database? This action cannot be undone.
              </p>
            </div>

            {/* List preview of items to be deleted */}
            <div className="max-h-40 overflow-y-auto text-left bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 divide-y divide-slate-200 dark:divide-slate-700/60 text-xs">
              {products
                .filter((p) => selectedProductIds.has(p.id))
                .slice(0, 6)
                .map((p) => (
                  <div key={p.id} className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {p.productName || p.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {p.category} | {formatINR(p.salePrice)}
                    </span>
                  </div>
                ))}
              {selectedProductIds.size > 6 && (
                <p className="py-1.5 text-center text-[11px] text-slate-400 italic">
                  ...and {selectedProductIds.size - 6} more items
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBulkDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleBulkDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-md shadow-red-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Deleting Selected...' : `Delete ${selectedProductIds.size} Items`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STOCK MOVEMENT HISTORY DRAWER / MODAL */}
      {/* ========================================================= */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Stock Movement Audit Logs
                </h3>
                <p className="text-xs text-slate-400">
                  History of material shipments, dispatches, and manual adjustments
                </p>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3">
              {stockLogs.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-xs">No stock movements recorded yet.</p>
              ) : (
                stockLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          log.type === 'Stock In'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {log.type === 'Stock In' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{log.itemName}</p>
                        <p className="text-[10px] text-slate-400">
                          Ref: {log.refNo} • {log.notes || 'Routine stock movement'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-black text-sm ${
                          log.type === 'Stock In' ? 'text-emerald-500' : 'text-red-500'
                        }`}
                      >
                        {log.type === 'Stock In' ? '+' : '-'}
                        {log.quantity}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{log.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EXCEL IMPORT PREVIEW & VALIDATION MODAL */}
      {/* ========================================================= */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Import Excel Catalog
                  </h3>
                  <p className="text-xs text-slate-400">
                    Validate headers, verify item rows, and synchronize with Firestore
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setImportModalOpen(false);
                  setPendingImportRows([]);
                  setImportValidationErrors([]);
                  setImportError(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Critical Error (File structure or missing sheet/columns) */}
              {importError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>Excel Import Failed</span>
                  </div>
                  <p>{importError}</p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 font-semibold text-red-800 dark:text-red-200 transition text-[11px] inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Proper Excel Template</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Row-by-row Validation Errors */}
              {importValidationErrors.length > 0 && (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs font-bold text-red-700 dark:text-red-300">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span>Validation Errors ({importValidationErrors.length} issues found)</span>
                    </div>
                    <span className="text-[11px] font-normal">Please fix these rows in your Excel file and re-upload</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-red-600 dark:text-red-400 space-y-1.5 font-mono">
                    {importValidationErrors.map((err, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-slate-400 font-bold">•</span>
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success / Preview Table */}
              {pendingImportRows.length > 0 && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Ready to Import {pendingImportRows.length} Products</span>
                    </div>
                    <span className="text-[11px] opacity-80">All row data validated successfully</span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto max-h-72">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase sticky top-0">
                        <tr>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Product Name / Model</th>
                          <th className="p-2.5">Make</th>
                          <th className="p-2.5 text-right">Price (₹)</th>
                          <th className="p-2.5 text-center">Margin</th>
                          <th className="p-2.5 text-right">Sale Price (₹)</th>
                          <th className="p-2.5 text-center">GST</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {pendingImportRows.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 font-medium">{item.category}</td>
                            <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                              {item.productName}
                            </td>
                            <td className="p-2.5 text-slate-500">{item.make}</td>
                            <td className="p-2.5 text-right font-mono font-bold">
                              ₹{Number(item.purchasePrice || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="p-2.5 text-center font-mono">{item.margin}%</td>
                            <td className="p-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{Number(item.salePrice || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="p-2.5 text-center font-mono">{item.gst || `${item.gstPercent}%`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setImportModalOpen(false);
                    setPendingImportRows([]);
                    setImportValidationErrors([]);
                    setImportError(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                {pendingImportRows.length > 0 && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleConfirmImport}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isSubmitting ? 'Importing...' : `Import ${pendingImportRows.length} Products`}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
