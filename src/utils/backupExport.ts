import * as XLSX from 'xlsx';
import { LocalDB, CRMService } from '../supabaseService';
import { 
  Customer, 
  Opportunity, 
  Quotation, 
  SalesOrder, 
  Invoice, 
  DeliveryJob, 
  Receipt, 
  Project, 
  AuditLog,
  Activity,
  OpportunityTask,
  OpportunityAttachment
} from '../types';

export type DateRangeType = 'all' | 'this_week' | 'last_week' | 'this_month' | 'last_month';

export interface FullBackupData {
  version: string;
  exported_at: string;
  system: string;
  tables: {
    customers: Customer[];
    opportunities: Opportunity[];
    quotations: Quotation[];
    sales_orders: SalesOrder[];
    delivery_jobs: DeliveryJob[];
    invoices: Invoice[];
    receipts: Receipt[];
    projects: Project[];
    activities: Activity[];
    tasks: OpportunityTask[];
    attachments: OpportunityAttachment[];
    audit_logs: AuditLog[];
    sim_users: any[];
  };
}

/**
 * Perform periodic auto-save of all state arrays into localStorage
 */
export function performAutoSave(): { success: boolean; savedAt: string; totalRecords: number } {
  try {
    const customers = LocalDB.getCustomers();
    const opportunities = LocalDB.getOpportunities();
    const quotations = LocalDB.getQuotations();
    const salesOrders = LocalDB.getSalesOrders();
    const deliveryJobs = LocalDB.getDeliveryJobs();
    const invoices = LocalDB.getInvoices();
    const receipts = LocalDB.getReceipts();
    const projects = LocalDB.getProjects();
    const activities = LocalDB.getActivities();
    const tasks = LocalDB.getTasks();
    const attachments = LocalDB.getAttachments();
    const auditLogs = LocalDB.getAuditLogs();

    // Trigger explicit saves to enforce local storage synchronization
    LocalDB.saveCustomers(customers);
    LocalDB.saveOpportunities(opportunities);
    LocalDB.saveQuotations(quotations);
    LocalDB.saveSalesOrders(salesOrders);
    LocalDB.saveDeliveryJobs(deliveryJobs);
    LocalDB.saveInvoices(invoices);
    LocalDB.saveReceipts(receipts);
    LocalDB.saveProjects(projects);
    LocalDB.saveActivities(activities);
    LocalDB.saveTasks(tasks);
    LocalDB.saveAttachments(attachments);
    LocalDB.saveAuditLogs(auditLogs);

    const nowIso = new Date().toISOString();
    localStorage.setItem('crm_last_autosave_time', nowIso);

    const totalRecords = customers.length + opportunities.length + quotations.length + 
      salesOrders.length + deliveryJobs.length + invoices.length + 
      receipts.length + projects.length;

    return {
      success: true,
      savedAt: new Date().toLocaleTimeString('th-TH'),
      totalRecords
    };
  } catch (err) {
    console.error('Auto-save error:', err);
    return {
      success: false,
      savedAt: new Date().toLocaleTimeString('th-TH'),
      totalRecords: 0
    };
  }
}

/**
 * Generate a JSON full database backup and trigger browser download
 */
export function downloadJSONBackup(): void {
  const simUsersRaw = localStorage.getItem('crm_sim_users');
  let simUsers = [];
  try { if (simUsersRaw) simUsers = JSON.parse(simUsersRaw); } catch {}

  const backupData: FullBackupData = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    system: 'Sales Master CRM ERP',
    tables: {
      customers: LocalDB.getCustomers(),
      opportunities: LocalDB.getOpportunities(),
      quotations: LocalDB.getQuotations(),
      sales_orders: LocalDB.getSalesOrders(),
      delivery_jobs: LocalDB.getDeliveryJobs(),
      invoices: LocalDB.getInvoices(),
      receipts: LocalDB.getReceipts(),
      projects: LocalDB.getProjects(),
      activities: LocalDB.getActivities(),
      tasks: LocalDB.getTasks(),
      attachments: LocalDB.getAttachments(),
      audit_logs: LocalDB.getAuditLogs(),
      sim_users: simUsers
    }
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const dateSuffix = new Date().toISOString().slice(0, 10);
  const timeSuffix = new Date().toTimeString().slice(0, 8).replace(/:/g, '-');
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `CRM_Backup_Full_${dateSuffix}_${timeSuffix}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Restore database state from uploaded JSON file
 */
export function restoreJSONBackup(jsonString: string): { success: boolean; message: string } {
  try {
    const data: FullBackupData = JSON.parse(jsonString);
    if (!data || !data.tables) {
      return { success: false, message: 'รูปแบบไฟล์ JSON ไม่ถูกต้อง (ไม่พบข้อมูล tables)' };
    }

    const { tables } = data;
    if (tables.customers) LocalDB.saveCustomers(tables.customers);
    if (tables.opportunities) LocalDB.saveOpportunities(tables.opportunities);
    if (tables.quotations) LocalDB.saveQuotations(tables.quotations);
    if (tables.sales_orders) LocalDB.saveSalesOrders(tables.sales_orders);
    if (tables.delivery_jobs) LocalDB.saveDeliveryJobs(tables.delivery_jobs);
    if (tables.invoices) LocalDB.saveInvoices(tables.invoices);
    if (tables.receipts) LocalDB.saveReceipts(tables.receipts);
    if (tables.projects) LocalDB.saveProjects(tables.projects);
    if (tables.activities) LocalDB.saveActivities(tables.activities);
    if (tables.tasks) LocalDB.saveTasks(tables.tasks);
    if (tables.attachments) LocalDB.saveAttachments(tables.attachments);
    if (tables.audit_logs) LocalDB.saveAuditLogs(tables.audit_logs);
    if (tables.sim_users) localStorage.setItem('crm_sim_users', JSON.stringify(tables.sim_users));

    localStorage.setItem('crm_last_autosave_time', new Date().toISOString());

    return {
      success: true,
      message: 'สำรองข้อมูลกลับคืนสำเร็จเรียบร้อยแล้ว!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `ไม่สามารถนำเข้าไฟล์สำรองได้: ${err.message || 'รูปแบบไฟล์ล้มเหลว'}`
    };
  }
}

/**
 * Helper to check if a date string falls into specified range
 */
function isDateInRange(dateStr: string | undefined, range: DateRangeType): boolean {
  if (range === 'all') return true;
  if (!dateStr) return false;

  const itemDate = new Date(dateStr);
  if (isNaN(itemDate.getTime())) return false;

  const now = new Date();
  
  if (range === 'this_week' || range === 'last_week') {
    // Current week boundaries (Sunday to Saturday or Monday to Sunday)
    const currentDay = now.getDay(); // 0 is Sun
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - currentDay);
    startOfThisWeek.setHours(0, 0, 0, 0);

    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);
    endOfThisWeek.setHours(23, 59, 59, 999);

    if (range === 'this_week') {
      return itemDate >= startOfThisWeek && itemDate <= endOfThisWeek;
    } else { // last_week
      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

      const endOfLastWeek = new Date(startOfThisWeek);
      endOfLastWeek.setMilliseconds(-1);

      return itemDate >= startOfLastWeek && itemDate <= endOfLastWeek;
    }
  }

  if (range === 'this_month' || range === 'last_month') {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11

    if (range === 'this_month') {
      return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
    } else { // last_month
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const lastMonthVal = currentMonth === 0 ? 11 : currentMonth - 1;
      return itemDate.getFullYear() === lastMonthYear && itemDate.getMonth() === lastMonthVal;
    }
  }

  return true;
}

/**
 * Filter items by date range using any available date field
 */
function filterByRange<T>(items: T[], dateExtractor: (item: T) => string | undefined, range: DateRangeType): T[] {
  if (range === 'all') return items;
  return items.filter(item => isDateInRange(dateExtractor(item), range));
}

/**
 * Export Excel Workbook (.xlsx) with filtered data tables
 */
export function exportExcelBackup(range: DateRangeType): void {
  const wb = XLSX.utils.book_new();

  // Range label for filename
  const rangeLabels: Record<DateRangeType, string> = {
    all: 'All_Data',
    this_week: 'This_Week',
    last_week: 'Last_Week',
    this_month: 'This_Month',
    last_month: 'Last_Month'
  };

  // 1. CUSTOMERS
  const rawCustomers = LocalDB.getCustomers();
  const filteredCustomers = filterByRange(rawCustomers, (c: any) => c.created_at, range);
  const custData = filteredCustomers.map((c: any) => ({
    'รหัสลูกค้า (Code)': c.customer_code,
    'ชื่อบริษัท/ลูกค้า (Name)': c.customer_name,
    'เลขประจำตัวผู้เสียภาษี (Tax ID)': c.tax_id || '-',
    'ประเภทอุตสาหกรรม (Industry)': c.industry_type || '-',
    'ที่อยู่ (Address)': c.address || '-',
    'จังหวัด (Province)': c.province || '-',
    'เบอร์โทรศัพท์ (Phone)': c.phone || '-',
    'อีเมล (Email)': c.email || '-',
    'เครดิตเทอม (Payment Term)': `${c.payment_term || 0} วัน`,
    'สถานะ (Status)': c.status || 'Active',
    'วันที่สร้าง (Created At)': c.created_at ? new Date(c.created_at).toLocaleDateString('th-TH') : '-'
  }));
  const wsCust = XLSX.utils.json_to_sheet(custData.length > 0 ? custData : [{ 'ข้อมูล': 'ไม่มีรายการในหมวดเวลานี้' }]);
  XLSX.utils.book_append_sheet(wb, wsCust, '1.Customers (ลูกค้า)');

  // 2. OPPORTUNITIES
  const rawOpps = LocalDB.getOpportunities();
  const filteredOpps = filterByRange(rawOpps, (o: any) => o.created_at || o.expected_close_date, range);
  const oppData = filteredOpps.map((o: any) => ({
    'เลขที่ดีล (Opp No)': o.opportunity_no,
    'ชื่อโครงการ (Project)': o.project_name,
    'ชื่อลูกค้า (Customer)': o.customer_name || '-',
    'ประเภทบริการ (Service)': o.service_type || '-',
    'มูลค่าคาดการณ์ (Estimated Value)': o.estimated_value || 0,
    'ความน่าจะเป็น (%)': o.success_probability || 0,
    'รายได้คาดการณ์ (Expected Revenue)': ((o.estimated_value || 0) * (o.success_probability || 0)) / 100,
    'พนักงานขาย (Sales Rep)': o.salesperson_name || '-',
    'สถานะ (Stage)': o.status,
    'วันที่คาดว่าปิดดีล': o.expected_close_date || '-',
    'วันที่สร้างดีล': o.created_at ? new Date(o.created_at).toLocaleDateString('th-TH') : '-'
  }));
  const wsOpp = XLSX.utils.json_to_sheet(oppData.length > 0 ? oppData : [{ 'ข้อมูล': 'ไม่มีรายการในหมวดเวลานี้' }]);
  XLSX.utils.book_append_sheet(wb, wsOpp, '2.Deals (งานประมูล)');

  // 3. QUOTATIONS
  const rawQuotes = LocalDB.getQuotations();
  const filteredQuotes = filterByRange(rawQuotes, (q: any) => q.quotation_date || q.issue_date || q.created_at, range);
  const quoteData = filteredQuotes.map((q: any) => ({
    'เลขที่ใบเสนอราคา (Quote No)': q.quotation_no,
    'ชื่อโครงการ/หัวข้อ (Title)': q.title || q.subject || q.project_name || '-',
    'ชื่อลูกค้า (Customer)': q.customer_name || '-',
    'วันที่ออกเอกสาร (Date)': q.quotation_date || q.issue_date || '-',
    'กำหนดยืนราคา (Days)': `${q.validity_days || 30} วัน`,
    'ราคารวมก่อนภาษี (Subtotal)': q.total_amount || q.total_value || 0,
    'ภาษี VAT 7%': q.vat_amount || 0,
    'ราคารวมสุทธิ (Grand Total)': q.grand_total || 0,
    'พนักงานขาย (Sales Person)': q.sales_person || '-',
    'สถานะ (Status)': q.status
  }));
  const wsQuote = XLSX.utils.json_to_sheet(quoteData.length > 0 ? quoteData : [{ 'ข้อมูล': 'ไม่มีรายการในหมวดเวลานี้' }]);
  XLSX.utils.book_append_sheet(wb, wsQuote, '3.Quotations (ใบเสนอราคา)');

  // 4. SALES ORDERS
  const rawSOs = LocalDB.getSalesOrders();
  const filteredSOs = filterByRange(rawSOs, (s: any) => s.issue_date || s.created_at, range);
  const soData = filteredSOs.map((s: any) => ({
    'เลขที่ใบสั่งขาย (SO No)': s.so_no,
    'ชื่อโครงการ (Project)': s.project_name || '-',
    'มูลค่ารวมสุทธิ (Total Amount)': s.total_amount || 0,
    'วันที่ออกเอกสาร (Issue Date)': s.issue_date || '-',
    'วันที่กำหนดส่งมอบ (Delivery Date)': s.delivery_date || '-',
    'สถานะ (Status)': s.status
  }));
  const wsSO = XLSX.utils.json_to_sheet(soData.length > 0 ? soData : [{ 'ข้อมูล': 'ไม่มีรายการในหมวดเวลานี้' }]);
  XLSX.utils.book_append_sheet(wb, wsSO, '4.SalesOrders (ใบสั่งขาย)');

  // 5. INVOICES
  const rawInvoices = LocalDB.getInvoices();
  const filteredInvoices = filterByRange(rawInvoices, (i: any) => i.invoice_date || i.issue_date || i.created_at, range);
  const invData = filteredInvoices.map((i: any) => ({
    'เลขที่ใบแจ้งหนี้ (Invoice No)': i.invoice_no,
    'อ้างอิงใบเสนอราคา/PO': i.quotation_no || i.po_reference || '-',
    'วันที่ออกใบแจ้งหนี้': i.invoice_date || i.issue_date || '-',
    'วันครบกำหนดชำระ (Due Date)': i.due_date || '-',
    'ยอดก่อนภาษี (Subtotal)': i.subtotal || 0,
    'ภาษี VAT 7%': i.tax_amount || 0,
    'ยอดรวมสุทธิ (Grand Total)': i.grand_total || 0,
    'สถานะการชำระ (Status)': i.status
  }));
  const wsInv = XLSX.utils.json_to_sheet(invData.length > 0 ? invData : [{ 'ข้อมูล': 'ไม่มีรายการในหมวดเวลานี้' }]);
  XLSX.utils.book_append_sheet(wb, wsInv, '5.Invoices (ใบแจ้งหนี้)');

  // 6. DELIVERY JOBS
  const rawDeliveries = LocalDB.getDeliveryJobs();
  const filteredDeliveries = filterByRange(rawDeliveries, (d: any) => d.delivery_date || d.created_at, range);
  const delData = filteredDeliveries.map((d: any) => ({
    'เลขที่ใบส่งของ (Job No)': d.job_no,
    'อ้างอิงใบสั่งขาย (SO Ref)': d.so_no || '-',
    'พนักงานขนส่ง (Driver)': d.driver_name || '-',
    'ทะเบียนรถ (Vehicle)': d.vehicle_plate || '-',
    'วันที่จัดส่ง': d.delivery_date || '-',
    'สถานที่จัดส่ง': d.location || '-',
    'สถานะการส่ง': d.status
  }));
  const wsDel = XLSX.utils.json_to_sheet(delData.length > 0 ? delData : [{ 'ข้อมูล': 'ไม่มีรายการในหมวดเวลานี้' }]);
  XLSX.utils.book_append_sheet(wb, wsDel, '6.Deliveries (ใบส่งสินค้า)');

  // 7. RECEIPTS
  const rawReceipts = LocalDB.getReceipts();
  const filteredReceipts = filterByRange(rawReceipts, (r: any) => r.receipt_date || r.created_at, range);
  const recData = filteredReceipts.map((r: any) => ({
    'เลขที่ใบเสร็จ (Receipt No)': r.receipt_no,
    'อ้างอิงใบแจ้งหนี้': r.invoice_no || '-',
    'วันที่รับชำระ': r.receipt_date || '-',
    'วิธีรับชำระ (Payment Method)': r.payment_method || '-',
    'จำนวนเงินรับชำระ (Amount)': r.amount_paid || 0,
    'สถานะ': r.status
  }));
  const wsRec = XLSX.utils.json_to_sheet(recData.length > 0 ? recData : [{ 'ข้อมูล': 'ไม่มีรายการในหมวดเวลานี้' }]);
  XLSX.utils.book_append_sheet(wb, wsRec, '7.Receipts (ใบเสร็จรับเงิน)');

  // Download Excel File
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `CRM_Data_Export_${rangeLabels[range]}_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}
