import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileJson, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCcw, 
  X, 
  Calendar, 
  Layers, 
  HardDrive,
  Sparkles,
  ShieldCheck,
  ArrowDownToLine,
  CalendarDays,
  History
} from 'lucide-react';
import { 
  performAutoSave, 
  downloadJSONBackup, 
  restoreJSONBackup, 
  exportExcelBackup, 
  DateRangeType 
} from '../utils/backupExport';

interface BackupExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string, type: 'success' | 'err') => void;
  onRefreshData?: () => void;
}

export default function BackupExportModal({ 
  isOpen, 
  onClose, 
  onToast,
  onRefreshData 
}: BackupExportModalProps) {
  const [lastSaved, setLastSaved] = useState<string>(() => {
    const raw = localStorage.getItem('crm_last_autosave_time');
    return raw ? new Date(raw).toLocaleTimeString('th-TH') : 'ยังไม่มีบันทึกวันนี้';
  });
  
  const [autoSaveInterval, setAutoSaveInterval] = useState<number>(() => {
    const saved = localStorage.getItem('crm_autosave_interval_sec');
    return saved ? parseInt(saved, 10) : 30; // 30 seconds default
  });

  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [restoring, setRestoring] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger immediate manual local storage auto-save
  const handleManualAutoSave = () => {
    setIsAutoSaving(true);
    setTimeout(() => {
      const res = performAutoSave();
      if (res.success) {
        setLastSaved(res.savedAt);
        onToast(`บันทึกข้อมูลลง Local Storage สำเร็จ (${res.totalRecords} รายการ)`, 'success');
      } else {
        onToast('เกิดข้อผิดพลาดในการบันทึก Local Storage', 'err');
      }
      setIsAutoSaving(false);
    }, 400);
  };

  // Trigger JSON download
  const handleDownloadJSON = () => {
    performAutoSave(); // Ensure sync first
    downloadJSONBackup();
    onToast('ดาวน์โหลดไฟล์สำรองข้อมูล JSON เรียบร้อยแล้ว', 'success');
  };

  // Handle JSON restore upload
  const handleJSONFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('คำเตือน: การนำเข้าข้อมูลสำรองจะทำการเขียนทับข้อมูลที่มีอยู่ในระบบ คุณต้องการดำเนินการต่อหรือไม่?')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setRestoring(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = restoreJSONBackup(content);
      if (res.success) {
        setLastSaved(new Date().toLocaleTimeString('th-TH'));
        onToast(res.message, 'success');
        if (onRefreshData) onRefreshData();
      } else {
        onToast(res.message, 'err');
      }
      setRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Handle Excel Export
  const handleExcelExport = (range: DateRangeType) => {
    performAutoSave();
    exportExcelBackup(range);
    
    const rangeTextMap: Record<DateRangeType, string> = {
      all: 'ข้อมูลทั้งหมด (All Data)',
      this_week: 'สัปดาห์นี้ (This Week)',
      last_week: 'สัปดาห์ที่แล้ว (Last Week)',
      this_month: 'เดือนนี้ (This Month)',
      last_month: 'เดือนที่แล้ว (Last Month)'
    };

    onToast(`ส่งออกไฟล์ Excel สำเร็จสำหรับช่วง: ${rangeTextMap[range]}`, 'success');
  };

  // Handle auto-save interval change
  const handleIntervalChange = (sec: number) => {
    setAutoSaveInterval(sec);
    localStorage.setItem('crm_autosave_interval_sec', sec.toString());
    onToast(`ปรับเปลี่ยนรอบบันทึกอัตโนมัติเป็นทุกๆ ${sec} วินาที`, 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 border border-indigo-500/40 rounded-2xl text-indigo-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                ระบบบันทึกอัตโนมัติ & สำรองข้อมูล Excel/JSON
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono font-bold">
                  AUTO-SAVE ACTIVE
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                จัดการ Auto-Save ลง Local Storage และส่งออกรายงาน Excel รายสัปดาห์ / รายเดือน / ทั้งหมด
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Section 1: Local Storage Auto-Save Status */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow-inner">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute"></div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full relative"></div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    สถานะการบันทึกอัตโนมัติ (Local Storage Sync)
                  </div>
                  <div className="text-sm font-black text-white mt-0.5 flex items-center gap-2 font-mono">
                    บันทึกล่าสุด: <span className="text-emerald-400">{lastSaved}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualAutoSave}
                  disabled={isAutoSaving}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${isAutoSaving ? 'animate-spin text-indigo-400' : ''}`} />
                  {isAutoSaving ? 'กำลังบันทึก...' : 'บันทึกทันที'}
                </button>

                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-[11px] font-bold">
                  <span className="px-2 text-slate-400 text-[10px]">ถี่:</span>
                  {[15, 30, 60].map(sec => (
                    <button
                      key={sec}
                      onClick={() => handleIntervalChange(sec)}
                      className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                        autoSaveInterval === sec ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Export Data to Excel (.XLSX) */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-extrabold text-white">
                    ส่งออกรายงานตารางข้อมูลไป Excel (.xlsx)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    รองรับแยกช่วงเวลา รายสัปดาห์, รายเดือน, สัปดาห์ก่อน, เดือนก่อน และข้อมูลทั้งหมดทุกตาราง (8 Sheets)
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-900 px-2.5 py-1 rounded-lg">
                Multi-Sheet Excel
              </span>
            </div>

            {/* Excel Range Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              
              {/* Range 1: All Data */}
              <button
                onClick={() => handleExcelExport('all')}
                className="p-3.5 bg-gradient-to-br from-emerald-950/40 to-slate-900 hover:from-emerald-900/50 hover:to-slate-800 border border-emerald-800/60 rounded-2xl text-left transition-all group cursor-pointer shadow-md hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between text-emerald-400 font-extrabold text-xs">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-4 h-4" />
                    ตารางข้อมูลทั้งหมด
                  </span>
                  <ArrowDownToLine className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </div>
                <div className="text-[11px] text-slate-300 font-bold mt-1.5">
                  All Data (ทุกหมวด)
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  ส่งออกครบ 8 ชีท (ลูกค้า, ดีล, QT, SO, INV, ส่งของ ฯลฯ)
                </div>
              </button>

              {/* Range 2: This Month */}
              <button
                onClick={() => handleExcelExport('this_month')}
                className="p-3.5 bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-800 rounded-2xl text-left transition-all group cursor-pointer shadow-sm hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between text-indigo-400 font-extrabold text-xs">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    เดือนนี้ (This Month)
                  </span>
                  <ArrowDownToLine className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </div>
                <div className="text-[11px] text-slate-300 font-bold mt-1.5">
                  ประจำเดือนปัจจุบัน
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  กรองเฉพาะรายการที่สร้างในเดือนนี้
                </div>
              </button>

              {/* Range 3: Last Month */}
              <button
                onClick={() => handleExcelExport('last_month')}
                className="p-3.5 bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-800 rounded-2xl text-left transition-all group cursor-pointer shadow-sm hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between text-blue-400 font-extrabold text-xs">
                  <span className="flex items-center gap-1.5">
                    <History className="w-4 h-4" />
                    เดือนที่แล้ว (Last Month)
                  </span>
                  <ArrowDownToLine className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </div>
                <div className="text-[11px] text-slate-300 font-bold mt-1.5">
                  ย้อนหลัง 1 เดือน
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  สรุปยอดรวมของเดือนที่ผ่านมา
                </div>
              </button>

              {/* Range 4: This Week */}
              <button
                onClick={() => handleExcelExport('this_week')}
                className="p-3.5 bg-slate-900 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-800 rounded-2xl text-left transition-all group cursor-pointer shadow-sm hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between text-amber-400 font-extrabold text-xs">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    สัปดาห์นี้ (This Week)
                  </span>
                  <ArrowDownToLine className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </div>
                <div className="text-[11px] text-slate-300 font-bold mt-1.5">
                  รอบสัปดาห์ปัจจุบัน
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  กรองความเคลื่อนไหว 7 วันล่าสุด
                </div>
              </button>

              {/* Range 5: Last Week */}
              <button
                onClick={() => handleExcelExport('last_week')}
                className="p-3.5 bg-slate-900 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-800 rounded-2xl text-left transition-all group cursor-pointer shadow-sm hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between text-orange-400 font-extrabold text-xs">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    สัปดาห์ที่แล้ว (Last Week)
                  </span>
                  <ArrowDownToLine className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </div>
                <div className="text-[11px] text-slate-300 font-bold mt-1.5">
                  รอบสัปดาห์ก่อนหน้า
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  เปรียบเทียบข้อมูลย้อนหลังสัปดาห์ที่แล้ว
                </div>
              </button>

            </div>
          </div>

          {/* Section 3: JSON Full System Snapshot & Restore */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <FileJson className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-sm font-extrabold text-white">
                    ดาวน์โหลด / คืนค่า Snapshot JSON สำรองระบบ
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    สำรองข้อมูลเชิงโครงสร้างระบบทั้งหมด หรือย้ายข้อมูลไปยังอุปกรณ์อื่น
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Manual Backup JSON Button */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-indigo-400" />
                    Manual Backup JSON
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    สร้างไฟล์ .json สำรองฐานข้อมูลทั้งหมด ( Customers, Opportunities, Quotations, Invoices ฯลฯ)
                  </p>
                </div>

                <button
                  onClick={handleDownloadJSON}
                  className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลดไฟล์สำรอง JSON
                </button>
              </div>

              {/* Restore JSON Backup */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-amber-400" />
                    Restore Data from JSON
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    นำเข้าไฟล์ .json ที่เคยสำรองไว้ เพื่อเขียนทับคืนค่าระบบกลับมาใช้งาน
                  </p>
                </div>

                <div className="mt-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleJSONFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={restoring}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {restoring ? 'กำลังนำเข้าข้อมูล...' : 'เลือกไฟล์ JSON เพื่อนำเข้า (Restore)'}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ข้อมูลปลอดภัย บันทึกลงบน Local Storage ฝั่ง Browser เสมอ
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
