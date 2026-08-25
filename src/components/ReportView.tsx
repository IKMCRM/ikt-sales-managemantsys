import React, { useState, useMemo, useEffect } from 'react';
import { Customer, Opportunity, OpportunityStatus } from '../types';
import { SAMPLE_SALES_PERSONS, LocalDB } from '../supabaseService';
import { 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Calendar, 
  Filter, 
  Users, 
  Target, 
  TrendingUp, 
  ChevronRight,
  RefreshCw,
  Building2,
  FileText,
  DollarSign,
  Coins,
  ArrowRightLeft
} from 'lucide-react';

interface ReportViewProps {
  customers: Customer[];
  opportunities: Opportunity[];
  onToast: (msg: string, type: 'success' | 'err') => void;
}

export default function ReportView({ customers, opportunities, onToast }: ReportViewProps) {
  // Report type switch
  const [reportType, setReportType] = useState<'customer' | 'opportunity' | 'currency'>('opportunity');

  // Multi-currency records state
  const [quotations, setQuotations] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [currencyDocFilter, setCurrencyDocFilter] = useState<'ALL' | 'QT' | 'SO' | 'INV'>('ALL');
  const [currencyTypeFilter, setCurrencyTypeFilter] = useState<'USD' | 'ALL'>('USD');
  const [currencyExchangeRate, setCurrencyExchangeRate] = useState<number>(35.00);

  useEffect(() => {
    const loadCurrencyDocs = async () => {
      try {
        const db = (window as any).SupabaseDB;
        const [qs, sos, invs] = await Promise.all([
          db?.getQuotations ? db.getQuotations() : Promise.resolve(LocalDB.getQuotations()),
          db?.getSalesOrders ? db.getSalesOrders() : Promise.resolve(LocalDB.getSalesOrders()),
          db?.getInvoices ? db.getInvoices() : Promise.resolve(LocalDB.getInvoices())
        ]);
        setQuotations(qs && qs.length > 0 ? qs : LocalDB.getQuotations());
        setSalesOrders(sos && sos.length > 0 ? sos : LocalDB.getSalesOrders());
        setInvoices(invs && invs.length > 0 ? invs : LocalDB.getInvoices());
      } catch (err) {
        console.error("Failed to load currency docs in ReportView", err);
        setQuotations(LocalDB.getQuotations());
        setSalesOrders(LocalDB.getSalesOrders());
        setInvoices(LocalDB.getInvoices());
      }
    };
    loadCurrencyDocs();
  }, [reportType]);

  // Commom Filtering states
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [customerFilter, setCustomerFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [salesFilter, setSalesFilter] = useState('All');

  // Sales staff mapping
  const salesStaffMap = useMemo(() => {
    return new Map(SAMPLE_SALES_PERSONS.map(s => [s.id, s.name]));
  }, []);

  // 1. Compute Customer Report Data
  const customerReportData = useMemo(() => {
    return customers.filter(c => {
      // 1. Date Range
      if (c.created_at) {
        const createDate = c.created_at.split('T')[0];
        if (createDate < startDate || createDate > endDate) return false;
      }

      // 2. Status
      if (statusFilter !== 'All' && statusFilter !== 'Active' && statusFilter !== 'Inactive') {
        // irrelevant condition for customer
      } else if (statusFilter !== 'All' && c.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [customers, startDate, endDate, statusFilter]);

  // 2. Compute Opportunity Report Data
  const opportunityReportData = useMemo(() => {
    return opportunities.filter(o => {
      // 1. Date filter (Based on expected close date or created date)
      if (o.expected_close_date) {
        if (o.expected_close_date < startDate || o.expected_close_date > endDate) return false;
      }

      // 2. Customer filter
      if (customerFilter !== 'All' && o.customer_id !== customerFilter) return false;

      // 3. Status filter
      if (statusFilter !== 'All' && o.status !== statusFilter) return false;

      // 4. Sales Person
      if (salesFilter !== 'All' && o.sales_person_id !== salesFilter) return false;

      return true;
    });
  }, [opportunities, startDate, endDate, customerFilter, statusFilter, salesFilter]);

  // 3. Compute Multi-Currency Report Data
  const currencyReportData = useMemo(() => {
    const custMap = new Map(customers.map(c => [c.id, c.customer_name]));
    const list: any[] = [];

    // Quotations
    quotations.forEach(q => {
      const cur = (q.currency || 'THB').toUpperCase();
      let rate = 1.0;
      if (cur === 'USD') rate = parseFloat(q.exchange_rate) || currencyExchangeRate;
      else if (cur === 'SGD') rate = parseFloat(q.exchange_rate) || 26.50;
      
      const origAmount = parseFloat(q.total_amount !== undefined ? q.total_amount : (q.total_value !== undefined ? q.total_value : (q.grand_total ? q.grand_total / 1.07 : 0)));
      const amountThb = cur !== 'THB' ? (origAmount * rate) : origAmount;
      const custName = (q.customer && q.customer.customer_name) || custMap.get(q.customer_id) || q.customer_name || 'บริษัท ปตท. สำรวจและผลิตปิโตรเลียม จำกัด (มหาชน)';

      list.push({
        id: q.id,
        docNo: q.quotation_no || q.id,
        docType: 'QT',
        docTypeName: 'Quotation',
        customer: custName,
        project: q.title || q.project_name || 'High-Pressure Hydrotest System & Inspection Package (USD)',
        currency: cur,
        amount: origAmount,
        exchangeRate: rate,
        amountThb: amountThb,
        flow: `${q.quotation_no || 'QT-4258-26'} → SO → INV`,
        flowStep: '1. Quotation Source',
        status: q.status || 'Approved',
        date: q.quotation_date || q.created_at || '2026-08-01'
      });
    });

    // Sales Orders
    salesOrders.forEach(so => {
      const cur = (so.currency || 'THB').toUpperCase();
      let rate = 1.0;
      if (cur === 'USD') rate = parseFloat(so.exchange_rate) || currencyExchangeRate;
      else if (cur === 'SGD') rate = parseFloat(so.exchange_rate) || 26.50;

      const origAmount = parseFloat(so.total_amount !== undefined ? so.total_amount : (so.grand_total ? so.grand_total / 1.07 : 0));
      const amountThb = cur !== 'THB' ? (origAmount * rate) : origAmount;
      const custName = (so.customer && so.customer.customer_name) || custMap.get(so.customer_id) || so.customer_name || 'บริษัท ปตท. สำรวจและผลิตปิโตรเลียม จำกัด (มหาชน)';

      list.push({
        id: so.id,
        docNo: so.so_no,
        docType: 'SO',
        docTypeName: 'Sales Order',
        customer: custName,
        project: so.project_name || 'High-Pressure Hydrotest System & Inspection Package (USD)',
        currency: cur,
        amount: origAmount,
        exchangeRate: rate,
        amountThb: amountThb,
        flow: `${so.quotation_no || so.quotation_id || 'QT-4258-26'} → ${so.so_no} → INV`,
        flowStep: '2. Sales Order Transferred',
        status: so.status || 'In Progress',
        date: so.order_date || so.created_at || '2026-08-02'
      });
    });

    // Invoices
    invoices.forEach(inv => {
      const cur = (inv.currency || 'THB').toUpperCase();
      let rate = 1.0;
      if (cur === 'USD') rate = parseFloat(inv.exchange_rate) || currencyExchangeRate;
      else if (cur === 'SGD') rate = parseFloat(inv.exchange_rate) || 26.50;

      const origAmount = parseFloat(inv.total_amount !== undefined ? inv.total_amount : (inv.total_value !== undefined ? inv.total_value : (inv.subtotal !== undefined ? inv.subtotal : (inv.grand_total ? inv.grand_total / 1.07 : 0))));
      const amountThb = cur !== 'THB' ? (origAmount * rate) : origAmount;
      const custName = (inv.customer && inv.customer.customer_name) || custMap.get(inv.customer_id) || inv.customer_name || 'บริษัท ปตท. สำรวจและผลิตปิโตรเลียม จำกัด (มหาชน)';

      list.push({
        id: inv.id,
        docNo: inv.invoice_no,
        docType: 'INV',
        docTypeName: 'Invoice',
        customer: custName,
        project: inv.project_name || 'High-Pressure Hydrotest System & Inspection Package (USD)',
        currency: cur,
        amount: origAmount,
        exchangeRate: rate,
        amountThb: amountThb,
        flow: `${inv.quotation_no || 'QT-4258-26'} → ${inv.sales_order_no || 'SO-26-08-001'} → ${inv.invoice_no}`,
        flowStep: '3. Invoiced Billing',
        status: inv.status || 'Paid',
        date: inv.invoice_date || inv.created_at || '2026-08-05'
      });
    });

    return list.filter(item => {
      if (currencyTypeFilter === 'USD' && item.currency !== 'USD') return false;
      if (currencyDocFilter !== 'ALL' && item.docType !== currencyDocFilter) return false;
      if (customerFilter !== 'All' && item.customer !== customerFilter) return false;
      return true;
    });
  }, [quotations, salesOrders, invoices, customers, currencyExchangeRate, currencyTypeFilter, currencyDocFilter, customerFilter]);

  // Report calculations aggregates
  const reportsStats = useMemo(() => {
    if (reportType === 'customer') {
      const activeCount = customerReportData.filter(c => c.status === 'Active').length;
      return {
        totalSelected: customerReportData.length,
        active: activeCount,
        inactive: customerReportData.length - activeCount,
        totalContactsCount: customerReportData.reduce((sum, c) => sum + (c.contacts?.length || 0), 0)
      };
    } else if (reportType === 'opportunity') {
      const totalOppValue = opportunityReportData.reduce((sum, o) => sum + o.estimated_value, 0);
      const wonOpps = opportunityReportData.filter(o => o.status === 'Won');
      const totalWeighted = opportunityReportData.reduce((sum, o) => sum + (o.estimated_value * (o.success_probability / 100)), 0);

      return {
        totalSelected: opportunityReportData.length,
        totalValue: totalOppValue,
        totalWeighted,
        wonCount: wonOpps.length,
        wonValue: wonOpps.reduce((sum, o) => sum + o.estimated_value, 0)
      };
    } else {
      const totalUsd = currencyReportData.filter(r => r.currency === 'USD').reduce((sum, r) => sum + r.amount, 0);
      const totalThb = currencyReportData.reduce((sum, r) => sum + r.amountThb, 0);
      return {
        totalSelected: currencyReportData.length,
        totalUsd,
        totalThb,
        exchangeRate: currencyExchangeRate
      };
    }
  }, [reportType, customerReportData, opportunityReportData, currencyReportData, currencyExchangeRate]);

  // EXCEL CSV DOWNLOAD
  const handleExportCSV = () => {
    let csvHeaders: string[] = [];
    let rows: any[][] = [];
    let filename = '';

    if (reportType === 'customer') {
      filename = `Customer_Report_${new Date().toISOString().split('T')[0]}.csv`;
      csvHeaders = ['รหัสลูกค้า', 'ชื่อผู้ประกอบการลูกค้า', 'เลขผู้เสียภาษี', 'กลุ่มอุตสาหกรรม', 'เงื่อนไขเครดิต', 'เบอร์โทรศัพท์', 'อีเมล', 'จำนวนผู้ประสานงานติดต่อ', 'สถานะบัญชี'];
      rows = customerReportData.map(c => [
        c.customer_code,
        c.customer_name,
        c.tax_id,
        c.industry_type,
        c.payment_term,
        c.phone,
        c.email,
        c.contacts?.length || 0,
        c.status
      ]);
    } else if (reportType === 'opportunity') {
      filename = `Opportunity_Report_${new Date().toISOString().split('T')[0]}.csv`;
      csvHeaders = ['เลขที่โอกาสทางการขาย', 'ชื่อลูกค้า / บริษัท', 'โครงการนำเสนอพัฒนา', 'กลุ่มประเภทบริการ', 'มูลค่างบประมาณร่วม', 'ความน่าจะเป็นสำเร็จ %', 'วัตถุประสงค์วันปิดดีล', 'เจ้าหน้าที่ฝ่ายขาย AM', 'สถานะขั้นตอน'];
      rows = opportunityReportData.map(o => [
        o.opportunity_no,
        o.customer?.customer_name || '',
        o.project_name,
        o.service_type,
        o.estimated_value,
        o.success_probability + '%',
        o.expected_close_date,
        salesStaffMap.get(o.sales_person_id) || '',
        o.status
      ]);
    } else {
      filename = `MultiCurrency_THB_Report_${new Date().toISOString().split('T')[0]}.csv`;
      csvHeaders = ['Document', 'Doc Type', 'Customer', 'Project', 'Currency', 'Amount', 'Exchange Rate', 'Amount THB', 'Traceability Flow', 'Status'];
      rows = currencyReportData.map(r => [
        r.docNo,
        r.docTypeName,
        r.customer,
        r.project,
        r.currency,
        r.amount,
        r.exchangeRate,
        r.amountThb,
        r.flow,
        r.status
      ]);
    }

    // Process BOM Download links
    const csvContent = "\uFEFF" + [
      csvHeaders.join(","),
      ...rows.map(e => e.map(val => {
        const escaped = String(val ?? '').replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.className = "hidden";
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onToast('ส่งออกรายงาน Excel/CSV เรียบร้อย', 'success');
  };

  // PDF Printing trigger
  const handlePrintPDF = () => {
    window.print();
  };

  // Reset filters
  const handleResetFilters = () => {
    setStartDate('2026-01-01');
    setEndDate('2026-12-31');
    setCustomerFilter('All');
    setStatusFilter('All');
    setSalesFilter('All');
    onToast('รีเซ็ตเงื่อนไขกรองรายงานทั้งหมด', 'success');
  };

  // Format currency helper
  const formatTHB = (num: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6 print:p-0 print:space-y-4">
      
      {/* Hide on printing */}
      <div className="print:hidden space-y-6">
        
        {/* Main tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800">ศูนย์รายงานวิเคราะห์ธุรกิจ (CRM Reports Console)</h2>
            <p className="text-slate-400 text-xs mt-0.5">ออกรายงานสำหรับฝ่ายบริหาร ดึงสรุปรายชื่อลูกค้า และประเมินโอกาสทางการขายพร้อมกัน</p>
          </div>
          
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => { setReportType('opportunity'); setStatusFilter('All'); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer ${reportType === 'opportunity' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <Target className="w-4 h-4" />
              รายงานโอกาสการขาย
            </button>
            <button
              onClick={() => { setReportType('customer'); setStatusFilter('All'); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer ${reportType === 'customer' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <Users className="w-4 h-4" />
              รายงานข้อมูลลูกค้า
            </button>
            <button
              onClick={() => { setReportType('currency'); setStatusFilter('All'); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer ${reportType === 'currency' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              รายงานสรุปสกุลเงิน USD → THB
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-slate-800 border-b pb-2">
            <span className="text-sm font-bold flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-blue-500" />
              ตั้งเงื่อนไขกรองรายงาน (Query Filter)
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs font-medium text-slate-400 hover:text-blue-600 flex items-center gap-1 border-none bg-none outline-none cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              รีเซ็ตตัวกรอง
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-700">
            {/* Start Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">เริ่มต้นตั้งแต่วันที่</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-mono text-xs focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">ถึงเป้าหมายวันที่</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-mono text-xs focus:outline-none"
              />
            </div>

            {/* Conditional Filter 1: Customer / Exchange Rate */}
            {reportType === 'opportunity' ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 block">คัดกรองเฉพาะลูกค้า</label>
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none text-slate-700 text-xs font-sans cursor-pointer"
                >
                  <option value="All">ดึงข้อมูลลูกค้าทั้งหมด</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.customer_name}</option>
                  ))}
                </select>
              </div>
            ) : reportType === 'currency' ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 block">อัตราแลกเปลี่ยน (THB/USD)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={currencyExchangeRate}
                    onChange={(e) => setCurrencyExchangeRate(parseFloat(e.target.value) || 35.00)}
                    className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg font-mono text-xs font-bold text-emerald-700 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-bold">THB</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 block">สัญญาลูกค้า (Credit Term)</label>
                <select
                  disabled
                  className="w-full p-2 border border-slate-200 bg-slate-100 rounded-lg text-slate-400 text-xs font-sans"
                >
                  <option>ไม่ได้ใช้งานสำหรับลูกค้า</option>
                </select>
              </div>
            )}

            {/* Conditional Filter 2: Status / Doc Type Filter */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">
                {reportType === 'currency' ? 'ประเภทเอกสาร (Doc Type)' : 'เจาะจงขั้นตอนสถานะ'}
              </label>
              {reportType === 'currency' ? (
                <select
                  value={currencyDocFilter}
                  onChange={(e) => setCurrencyDocFilter(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none text-slate-700 text-xs font-sans cursor-pointer font-medium"
                >
                  <option value="ALL">เอกสารทั้งหมด (QT + SO + INV)</option>
                  <option value="QT">Quotations (QT) ใบเสนอราคา</option>
                  <option value="SO">Sales Orders (SO) ใบสั่งขาย</option>
                  <option value="INV">Invoices (INV) ใบแจ้งหนี้</option>
                </select>
              ) : reportType === 'customer' ? (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none text-slate-700 text-xs font-sans cursor-pointer"
                >
                  <option value="All">ทุกสถานะลูกค้า</option>
                  <option value="Active">Active บัญชีเปิดใช้งาน</option>
                  <option value="Inactive">Inactive บัญชีปิดใช้งาน</option>
                </select>
              ) : (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none text-slate-700 text-xs font-sans cursor-pointer"
                >
                  <option value="All">ทุกขั้นตอนความคืบหน้า</option>
                  <option value="Lead">Lead (มีลีด)</option>
                  <option value="Qualified">Qualified (ผ่านเกณฑ์)</option>
                  <option value="Proposal">Proposal (เสนอราคา)</option>
                  <option value="Negotiation">Negotiation (เจรจาต่อรอง)</option>
                  <option value="Won">Won (ปิดการขายสำเร็จ)</option>
                  <option value="Lost">Lost (พ่ายแพ้ดีล)</option>
                  <option value="Cancelled">Cancelled (ยกเลิกดีล)</option>
                </select>
              )}
            </div>

            {/* Conditional Filter 3: Currency Type Filter (Only for Currency Report) */}
            {reportType === 'currency' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 block">กรองสกุลเงิน (Currency Scope)</label>
                <select
                  value={currencyTypeFilter}
                  onChange={(e) => setCurrencyTypeFilter(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none text-slate-700 text-xs font-sans cursor-pointer font-bold text-indigo-700"
                >
                  <option value="USD">เฉพาะสกุลเงิน USD (USD Only)</option>
                  <option value="ALL">ทุกสกุลเงิน (All Currencies)</option>
                </select>
              </div>
            )}

            {/* Conditional Filter 4: Sales Person Staff */}
            {reportType === 'opportunity' && (
              <div className="space-y-1 lg:col-start-4">
                <label className="text-xs font-semibold text-slate-500 block">พนักงานการขายผู้รับผิดชอบ</label>
                <select
                  value={salesFilter}
                  onChange={(e) => setSalesFilter(e.target.value)}
                  className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none text-slate-700 text-xs font-sans cursor-pointer"
                >
                  <option value="All">เจ้าหน้าที่ทุกคนทั้งหมด</option>
                  {SAMPLE_SALES_PERSONS.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Download & Print bars */}
          <div className="flex border-t border-slate-100 pt-4 justify-end gap-2.5">
            <button
              onClick={handlePrintPDF}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs flex items-center gap-1.5 focus:outline-none cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              พิมพ์รายงาน / บันทึก PDF (Print)
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 focus:outline-none cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              ส่งออกสรุป Excel (CSV)
            </button>
          </div>
        </div>

      </div>

      {/* --- RENDER REPORT AREA (OPTIMIZED FOR WEB DISPLAY & PRINT TO PDF) --- */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm print:shadow-none print:border-none print:p-0 space-y-6">
        
        {/* Printable Report Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {reportType === 'customer' 
                ? 'รายงานตรวจสอบข้อมูลลูกค้าผู้ประกอบการ' 
                : reportType === 'opportunity' 
                ? 'รายงานวิเคราะห์คาดคะเนโอกาสทางการขายหลัก' 
                : 'รายงานการคำนวณและสรุปยอดสกุลเงินต่างประเทศ (USD → THB Multi-Currency Report)'}
            </h1>
            <p className="text-xs text-slate-500 font-sans">
              {reportType === 'currency'
                ? 'หลักการคำนวณ: ยอด USD × Exchange Rate = ยอด THB (คงสกุลเงินจริง USD ในเอกสารต้นทาง) | พิมพ์เมื่อวันที่ ' + new Date().toLocaleDateString('th-TH')
                : 'ระบบตรวจสอบสถิติลีดภายในองค์กร CRM Sales System Phase 1 | พิมพ์เมื่อวันที่ ' + new Date().toLocaleDateString('th-TH')}
            </p>
          </div>
          <div className="text-xs text-slate-500 md:text-right font-mono space-y-0.5">
            <div>ช่วงขอบเขตข้อมูลวิจับ: {startDate} ถึง {endDate}</div>
            <div>
              {reportType === 'currency' 
                ? `สกุลเงิน: ${currencyTypeFilter} | อัตราแลกเปลี่ยน: ${currencyExchangeRate.toFixed(2)} THB/USD` 
                : `ประเภทรายงานสถานะ: ${statusFilter === 'All' ? 'ดึงทุกสถานะ' : statusFilter}`}
            </div>
          </div>
        </div>

        {/* Aggregate KPI boxes for the target printed document */}
        {reportType === 'customer' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
              <span className="text-xs font-medium text-slate-400 block">ลูกค้ารวมในขอบเขต</span>
              <span className="font-mono text-xl font-bold text-slate-800 block">{reportsStats.totalSelected}</span>
            </div>
            <div className="p-4 bg-green-50/50 rounded-xl border border-green-100/50 text-center space-y-1">
              <span className="text-xs font-medium text-green-600 block">สัญญายังคงอยู่ (Active)</span>
              <span className="font-mono text-xl font-bold text-green-700 block">{reportsStats.active}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
              <span className="text-xs font-medium text-slate-400 block font-sans">ปิดบัญชีชั่วคราว (Inactive)</span>
              <span className="font-mono text-xl font-bold text-slate-500 block">{reportsStats.inactive}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
              <span className="text-xs font-medium text-slate-400 block font-sans">บุคคลผู้ประสานงานรวม</span>
              <span className="font-mono text-xl font-bold text-blue-700 block">{reportsStats.totalContactsCount} คน</span>
            </div>
          </div>
        ) : reportType === 'opportunity' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
              <span className="text-xs font-medium text-slate-400 block">ปริมาณโครงการที่ประเมิน</span>
              <span className="font-mono text-lg font-bold text-slate-800 block">{reportsStats.totalSelected} รายการ</span>
            </div>
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 text-center space-y-1 col-span-1">
              <span className="text-xs font-medium text-blue-600 block">มูลค่างบประมาณที่บันทึก</span>
              <span className="font-mono text-base font-bold text-blue-700 block">{formatTHB(reportsStats.totalValue || 0)}</span>
            </div>
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-center space-y-1">
              <span className="text-xs font-medium text-indigo-500 block font-sans">มูลค่าถ่วงตามโอกาส % (Weighted)</span>
              <span className="font-mono text-base font-bold text-indigo-700 block">{formatTHB(reportsStats.totalWeighted || 0)}</span>
            </div>
            <div className="p-4 bg-green-50/50 rounded-xl border border-green-100/50 text-center space-y-1">
              <span className="text-xs font-medium text-green-600 block">ปิดดีลชนะสำเร็จ (Won)</span>
              <span className="font-mono text-sm font-bold text-green-700 block">
                {reportsStats.wonCount} งาน ({formatTHB(reportsStats.wonValue || 0)})
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Currency Formula banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Coins className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-900 block text-sm">หลักการคำนวณ: ยอด USD × Exchange Rate = ยอด THB</span>
                  <span className="text-emerald-700 text-[11px]">ตัวอย่าง: USD 1,000 × Exchange Rate 35.00 = THB 35,000 (เอกสารต้นทางคงสกุลเงินจริงเป็น USD)</span>
                </div>
              </div>
              <div className="bg-white/80 border border-emerald-300 px-3 py-1.5 rounded-lg font-mono font-bold text-emerald-800 text-xs shadow-xs shrink-0 text-center">
                อัตราแลกเปลี่ยนอ้างอิง: 1 USD = {currencyExchangeRate.toFixed(2)} THB
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-center space-y-1">
                <span className="text-xs font-semibold text-indigo-600 block">ยอดรวมเดิม (Original USD)</span>
                <span className="font-mono text-xl font-black text-indigo-700 block">
                  ${(reportsStats.totalUsd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center space-y-1">
                <span className="text-xs font-semibold text-emerald-600 block">ยอดแปลงสกุลเงิน (Converted THB)</span>
                <span className="font-mono text-xl font-black text-emerald-700 block">
                  ฿{(reportsStats.totalThb || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
                <span className="text-xs font-semibold text-slate-500 block">จำนวนเอกสารในรายงาน</span>
                <span className="font-mono text-xl font-bold text-slate-800 block">{reportsStats.totalSelected} ฉบับ</span>
              </div>
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100 text-center space-y-1">
                <span className="text-xs font-semibold text-amber-700 block">Traceability Complete</span>
                <span className="font-mono text-xs font-bold text-amber-800 block pt-1">
                  QT &rarr; SO &rarr; INV (100%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Printable tabular content */}
        <div className="overflow-x-auto">
          {reportType === 'customer' ? (
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="p-3 border border-slate-200 w-24">รหัสลูกค้า</th>
                  <th className="p-3 border border-slate-200">ชื่อสถานประกอบการหลัก</th>
                  <th className="p-3 border border-slate-200 w-28">เลขประจำตัวผู้เสียภาษี</th>
                  <th className="p-3 border border-slate-200 w-32">กลุ่มอุตสาหกรรม</th>
                  <th className="p-3 border border-slate-200 w-24">เครดิตเทอม</th>
                  <th className="p-3 border border-slate-200 w-28">เบอร์ติดต่อ</th>
                  <th className="p-3 border border-slate-200 w-20 text-center">สัญญาย่อย</th>
                  <th className="p-3 border border-slate-200 w-20 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {customerReportData.length > 0 ? (
                  customerReportData.map(c => (
                    <tr key={c.id}>
                      <td className="p-3 border border-slate-200 font-mono font-bold text-slate-800">{c.customer_code}</td>
                      <td className="p-3 border border-slate-200 font-medium text-slate-900">{c.customer_name}</td>
                      <td className="p-3 border border-slate-200 font-mono">{c.tax_id}</td>
                      <td className="p-3 border border-slate-200">{c.industry_type}</td>
                      <td className="p-3 border border-slate-200">{c.payment_term}</td>
                      <td className="p-3 border border-slate-200 font-mono">{c.phone}</td>
                      <td className="p-3 border border-slate-200 text-center font-mono">{c.contacts?.length || 0}</td>
                      <td className="p-3 border border-slate-200 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-sans border border-slate-200">
                      ไม่พบผลลัพธ์ข้อมูลรายงานตามขอบเขตกหนดค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : reportType === 'opportunity' ? (
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="p-3 border border-slate-200 w-24">เลขที่ลีด</th>
                  <th className="p-3 border border-slate-200">ชื่อบริษัทลูกค้า</th>
                  <th className="p-3 border border-slate-200">โครงการเสนอขาย/จัดซื้อ</th>
                  <th className="p-3 border border-slate-200 w-28">ประเภทกลุ่มบริการ</th>
                  <th className="p-3 border border-slate-200 w-28 text-right">งบประมาณเสนอ</th>
                  <th className="p-3 border border-slate-200 w-16 text-center">ชนะ %</th>
                  <th className="p-3 border border-slate-200 w-20 text-center">วันปิดเป้าหมาย</th>
                  <th className="p-3 border border-slate-200 w-32">พนักงานขาย</th>
                  <th className="p-3 border border-slate-200 w-20 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {opportunityReportData.length > 0 ? (
                  opportunityReportData.map(o => (
                    <tr key={o.id}>
                      <td className="p-3 border border-slate-200 font-mono font-semibold">{o.opportunity_no}</td>
                      <td className="p-3 border border-slate-200 font-medium">{o.customer?.customer_name || '-'}</td>
                      <td className="p-3 border border-slate-200 font-medium text-slate-900">{o.project_name}</td>
                      <td className="p-3 border border-slate-200">{o.service_type}</td>
                      <td className="p-3 border border-slate-200 text-right font-mono font-bold text-slate-800">{formatTHB(o.estimated_value)}</td>
                      <td className="p-3 border border-slate-200 text-center font-mono">{o.success_probability}%</td>
                      <td className="p-3 border border-slate-200 text-center font-mono text-[10px]">{o.expected_close_date || '-'}</td>
                      <td className="p-3 border border-slate-200 text-xs">{salesStaffMap.get(o.sales_person_id) || '-'}</td>
                      <td className="p-3 border border-slate-200 text-center">
                        <span className="text-[10px] font-bold font-mono">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 font-sans border border-slate-200">
                      ไม่พบผลลัพธ์ข้อมูลรายงานตามขอบเขตกหนดค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                  <th className="p-3 border border-slate-200">Document (เลขที่เอกสาร)</th>
                  <th className="p-3 border border-slate-200 text-center">Type</th>
                  <th className="p-3 border border-slate-200">ลูกค้า / โครงการ</th>
                  <th className="p-3 border border-slate-200 text-center">Currency</th>
                  <th className="p-3 border border-slate-200 text-right font-mono">Amount (USD)</th>
                  <th className="p-3 border border-slate-200 text-right font-mono">Exchange Rate</th>
                  <th className="p-3 border border-slate-200 text-right font-mono text-emerald-700 bg-emerald-50/40">Amount THB</th>
                  <th className="p-3 border border-slate-200">Traceability Flow</th>
                  <th className="p-3 border border-slate-200 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {currencyReportData.length > 0 ? (
                  currencyReportData.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 border border-slate-200 font-mono font-bold text-indigo-700">
                        {r.docNo}
                      </td>
                      <td className="p-3 border border-slate-200 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.docType === 'QT' 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : r.docType === 'SO' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {r.docTypeName}
                        </span>
                      </td>
                      <td className="p-3 border border-slate-200">
                        <div className="font-semibold text-slate-900">{r.customer}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{r.project}</div>
                      </td>
                      <td className="p-3 border border-slate-200 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono">
                          {r.currency}
                        </span>
                      </td>
                      <td className="p-3 border border-slate-200 text-right font-mono font-bold text-slate-900">
                        ${r.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 border border-slate-200 text-right font-mono font-medium text-slate-600">
                        {r.exchangeRate.toFixed(2)}
                      </td>
                      <td className="p-3 border border-slate-200 text-right font-mono font-black text-emerald-700 bg-emerald-50/30">
                        ฿{r.amountThb.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 border border-slate-200 font-mono text-[11px]">
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {r.flow}
                        </span>
                      </td>
                      <td className="p-3 border border-slate-200 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'Approved' || r.status === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 font-sans border border-slate-200">
                      ไม่พบผลลัพธ์ข้อมูลรายงานตามขอบเขตกหนดค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
              {currencyReportData.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300">
                    <td colSpan={4} className="p-3 text-right font-sans text-slate-800">
                      รวมทั้งสิ้น (Total Summary):
                    </td>
                    <td className="p-3 text-right font-mono text-indigo-800">
                      ${(reportsStats.totalUsd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-500">
                      Avg: {currencyExchangeRate.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-800 bg-emerald-100/50">
                      ฿{(reportsStats.totalThb || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td colSpan={2} className="p-3 font-mono text-[11px] text-slate-500">
                      {currencyReportData.length} รายการ (Traceable Flow)
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>

        {/* Printable Signature space for physical approval in custom dashboard style */}
        <div className="hidden print:grid grid-cols-2 gap-12 pt-16 text-xs text-slate-500 font-sans text-center">
          <div className="space-y-12">
            <div className="w-48 border-b border-slate-350 mx-auto"></div>
            <p>ผู้พิจารณาจัดทำข้อมูล (Sales Manager Signature)</p>
          </div>
          <div className="space-y-12">
            <div className="w-48 border-b border-slate-350 mx-auto"></div>
            <p>ผู้อนุมัติเอกสารฝ่ายบริหาร (Director Signature)</p>
          </div>
        </div>

      </div>

    </div>
  );
}
