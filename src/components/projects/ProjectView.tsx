import React, { useState } from 'react';
import {
  Sun,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Zap,
  Shield,
  Edit2,
  Trash2,
  X,
  Download,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project, SystemType, ProjectStatus, ProjectType } from '../../types';

export const ProjectView: React.FC = () => {
  const { projects, customers, employees, addProject, updateProject, deleteProject } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerMobile: '',
    projectType: 'Residential' as ProjectType,
    systemType: 'Hybrid' as SystemType,
    capacityKW: 5,
    panelsCount: 10,
    panelModel: 'Adani 540W Mono PERC',
    inverterModel: 'Luminous 5KVA Hybrid',
    batteryCount: 4,
    batteryModel: 'Luminous 150Ah Tubular',
    structureType: 'HDG High Structure',
    installationDate: new Date().toISOString().split('T')[0],
    completionDate: '',
    warrantyYears: 5,
    technicianAssigned: employees[0]?.name || 'Amit Kumar',
    status: 'Pending' as ProjectStatus,
    progressPercent: 10,
    location: '',
    notes: '',
  });

  const handleOpenAdd = () => {
    setEditingProject(null);
    const firstCust = customers[0];
    setFormData({
      customerId: firstCust?.id || '',
      customerName: firstCust?.name || '',
      customerMobile: firstCust?.mobile || '',
      projectType: firstCust?.projectType || 'Residential',
      systemType: 'Hybrid',
      capacityKW: 5,
      panelsCount: 10,
      panelModel: 'Waaree 540W Mono PERC',
      inverterModel: 'Growatt 5kW Hybrid',
      batteryCount: 4,
      batteryModel: 'Exide 150Ah Tubular',
      structureType: 'Super High Structure HDG',
      installationDate: new Date().toISOString().split('T')[0],
      completionDate: '',
      warrantyYears: 5,
      technicianAssigned: employees[0]?.name || 'Amit Kumar',
      status: 'Pending',
      progressPercent: 10,
      location: firstCust ? `${firstCust.district}, ${firstCust.state}` : 'Local Site',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setFormData({
      customerId: p.customerId,
      customerName: p.customerName,
      customerMobile: p.customerMobile,
      projectType: p.projectType,
      systemType: p.systemType,
      capacityKW: p.capacityKW,
      panelsCount: p.panelsCount,
      panelModel: p.panelModel,
      inverterModel: p.inverterModel,
      batteryCount: p.batteryCount || 0,
      batteryModel: p.batteryModel || '',
      structureType: p.structureType,
      installationDate: p.installationDate,
      completionDate: p.completionDate || '',
      warrantyYears: p.warrantyYears,
      technicianAssigned: p.technicianAssigned,
      status: p.status,
      progressPercent: p.progressPercent,
      location: p.location,
      notes: p.notes,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateProject(editingProject.id, formData);
    } else {
      addProject(formData);
    }
    setModalOpen(false);
  };

  const handleExportExcel = () => {
    if (projects.length === 0) {
      alert('No projects available to export.');
      return;
    }

    const headers = [
      'Project ID',
      'Customer Name',
      'Mobile',
      'Location',
      'Project Type',
      'System Type',
      'Capacity (KW)',
      'Panels Count',
      'Panel Model',
      'Inverter Model',
      'Battery Count',
      'Battery Model',
      'Structure Type',
      'Assigned Technician',
      'Installation Date',
      'Warranty (Years)',
      'Status',
      'Progress (%)',
      'Notes',
    ];

    const rows = projects.map((p) => [
      `"${p.projectId || ''}"`,
      `"${p.customerName || ''}"`,
      `"${p.customerMobile || ''}"`,
      `"${p.location || ''}"`,
      `"${p.projectType || ''}"`,
      `"${p.systemType || ''}"`,
      p.capacityKW || 0,
      p.panelsCount || 0,
      `"${p.panelModel || ''}"`,
      `"${p.inverterModel || ''}"`,
      p.batteryCount || 0,
      `"${p.batteryModel || ''}"`,
      `"${p.structureType || ''}"`,
      `"${p.technicianAssigned || ''}"`,
      `"${p.installationDate || ''}"`,
      p.warrantyYears || 0,
      `"${p.status || ''}"`,
      `${p.progressPercent || 0}%`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `UPSW_Solar_Projects_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.projectId.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#24372D] dark:text-[#E6EEE8] tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] text-[#25845A]">
              <Sun className="w-5 h-5" />
            </span>
            <span>Solar Project Management</span>
          </h2>
          <p className="text-xs text-[#68786E] dark:text-[#8E9F94] mt-1 font-medium">
            Track solar system installations, plant capacity (KW), technicians, and site progress
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2720] text-[#24372D] dark:text-[#E6EEE8] text-xs font-bold border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] hover:bg-[#F8FAF8] transition"
          >
            <Download className="w-4 h-4 text-[#68786E]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25845A] hover:bg-[#1D7049] text-white font-bold text-xs transition shadow-[0_4px_12px_rgba(37,132,90,0.25)] border border-[#1D7049] active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Solar Project</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#25845A] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Project ID, Customer, Location..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-[#24372D] dark:text-white text-xs shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['ALL', 'Pending', 'Running', 'Completed', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-[#25845A] text-white shadow-[0_2px_6px_rgba(37,132,90,0.3)]'
                    : 'bg-[#F1F5F1] dark:bg-[#152019] text-[#68786E] dark:text-[#8E9F94] border border-[#D9E2DA] dark:border-[#223328] hover:bg-[#E9EFEA]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#F1F5F1] dark:bg-[#152019] p-1 rounded-xl border border-[#D9E2DA] dark:border-[#223328]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-[#25845A] text-white shadow-xs'
                  : 'text-[#68786E] hover:text-[#24372D]'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'card'
                  ? 'bg-[#25845A] text-white shadow-xs'
                  : 'text-[#68786E] hover:text-[#24372D]'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F1F5F1] dark:bg-[#152019] text-[#68786E] dark:text-[#8E9F94] text-xs font-bold uppercase tracking-wider border-b border-[#D9E2DA] dark:border-[#223328]">
                  <th className="p-4">Project ID</th>
                  <th className="p-4">Customer & Location</th>
                  <th className="p-4">Capacity & System</th>
                  <th className="p-4">Panels & Inverter</th>
                  <th className="p-4">Technician</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2DA] dark:divide-[#223328] text-xs text-[#24372D] dark:text-[#E6EEE8]">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-[#87938B]">
                      No solar projects found matching search filter.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F8FAF8] dark:hover:bg-[#202E25]/50 transition">
                      <td className="p-4">
                        <span className="font-mono text-xs font-black text-[#25845A] dark:text-[#2DA16E] bg-[#DCEBE0] px-2 py-1 rounded-md border border-[#25845A]/20 block w-fit">
                          {p.projectId}
                        </span>
                        <span className="text-[10px] text-[#87938B] mt-1 block">Date: {p.installationDate}</span>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-[#24372D] dark:text-[#E6EEE8] text-sm">{p.customerName}</p>
                        <p className="text-[11px] text-[#68786E] dark:text-[#8E9F94]">📱 {p.customerMobile}</p>
                        <p className="text-[11px] text-[#87938B] truncate max-w-xs">📍 {p.location}</p>
                      </td>

                      <td className="p-4">
                        <span className="font-black text-[#25845A] dark:text-[#2DA16E] text-sm block">{p.capacityKW} KW</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#F1F5F1] dark:bg-[#152019] text-[#24372D] dark:text-[#E6EEE8] border border-[#D9E2DA] dark:border-[#223328]">
                            {p.systemType}
                          </span>
                          <span className="text-[10px] text-[#87938B]">({p.projectType})</span>
                        </div>
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="font-semibold text-[#24372D] dark:text-[#E6EEE8] truncate">
                          ⚡ {p.panelsCount}x {p.panelModel}
                        </p>
                        <p className="text-[11px] text-[#87938B] truncate">🔌 {p.inverterModel}</p>
                        {p.batteryModel && (
                          <p className="text-[11px] text-[#87938B] truncate">
                            🔋 {p.batteryCount}x {p.batteryModel}
                          </p>
                        )}
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-[#24372D] dark:text-[#E6EEE8]">👨‍🔧 {p.technicianAssigned}</p>
                        <p className="text-[10px] text-[#87938B]">Warranty: {p.warrantyYears} Years</p>
                      </td>

                      <td className="p-4 min-w-[140px]">
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="font-bold text-[#68786E] dark:text-[#8E9F94]">Completion</span>
                          <span className="font-black text-[#25845A] dark:text-[#2DA16E]">{p.progressPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#F1F5F1] dark:bg-[#152019] border border-[#D9E2DA] dark:border-[#223328] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#25845A] transition-all duration-500 rounded-full"
                            style={{ width: `${p.progressPercent}%` }}
                          ></div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 text-[11px] font-bold rounded-full block w-fit ${
                            p.status === 'Completed'
                              ? 'bg-[#DCEBE0] text-[#25845A] border border-[#25845A]/25'
                              : p.status === 'Running'
                              ? 'bg-[#D99A18]/12 text-[#D99A18] border border-[#D99A18]/25'
                              : 'bg-[#68786E]/12 text-[#68786E] border border-[#68786E]/25'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-[#68786E] hover:text-[#25845A] bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[1px_1px_3px_rgba(36,55,45,0.06),-1px_-1px_3px_rgba(255,255,255,0.85)] transition"
                            title="Edit Project"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete project ${p.projectId}?`)) deleteProject(p.id);
                            }}
                            className="p-1.5 rounded-lg text-[#68786E] hover:text-[#D83B3B] bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[1px_1px_3px_rgba(36,55,45,0.06),-1px_-1px_3px_rgba(255,255,255,0.85)] transition"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.length === 0 ? (
            <div className="col-span-2 text-center py-16 bg-[#FFFFFF] dark:bg-[#1B2720] rounded-2xl border border-[#D9E2DA] dark:border-[#223328] text-[#87938B] text-xs">
              No projects found matching search filter.
            </div>
          ) : (
            filteredProjects.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#25845A] dark:text-[#2DA16E] bg-[#DCEBE0] px-2 py-0.5 rounded-md border border-[#25845A]/20">
                        {p.projectId}
                      </span>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#F1F5F1] text-[#24372D] border border-[#D9E2DA]">
                        {p.systemType}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#24372D] dark:text-white text-base mt-2">
                      {p.customerName}
                    </h3>
                    <p className="text-xs text-[#68786E]">📍 {p.location}</p>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      p.status === 'Completed'
                        ? 'bg-[#DCEBE0] text-[#25845A] border border-[#25845A]/25'
                        : p.status === 'Running'
                        ? 'bg-[#D99A18]/12 text-[#D99A18] border border-[#D99A18]/25'
                        : 'bg-[#68786E]/12 text-[#68786E] border border-[#68786E]/25'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                {/* Specs Badge */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-[#F1F5F1] dark:bg-[#152019] rounded-xl text-center text-xs border border-[#D9E2DA] dark:border-[#223328]">
                  <div>
                    <p className="text-[10px] text-[#87938B] uppercase font-bold">Capacity</p>
                    <p className="font-black text-[#25845A] dark:text-[#2DA16E]">{p.capacityKW} KW</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#87938B] uppercase font-bold">Panels</p>
                    <p className="font-bold text-[#24372D] dark:text-white">{p.panelsCount} Nos</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#87938B] uppercase font-bold">Warranty</p>
                    <p className="font-bold text-[#24372D] dark:text-white">{p.warrantyYears} Yrs</p>
                  </div>
                </div>

                {/* Detailed Specs */}
                <div className="text-xs space-y-1 text-[#24372D] dark:text-[#E6EEE8]">
                  <p>⚡ <span className="font-bold">Panel:</span> {p.panelModel}</p>
                  <p>🔌 <span className="font-bold">Inverter:</span> {p.inverterModel}</p>
                  {p.batteryModel && (
                    <p>🔋 <span className="font-bold">Battery:</span> {p.batteryCount}x {p.batteryModel}</p>
                  )}
                  <p>🏗️ <span className="font-bold">Structure:</span> {p.structureType}</p>
                  <p>👨‍🔧 <span className="font-bold">Technician:</span> {p.technicianAssigned}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 pt-2 border-t border-[#D9E2DA] dark:border-[#223328]">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#68786E]">Installation Progress</span>
                    <span className="font-black text-[#25845A]">{p.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F1] rounded-full overflow-hidden border border-[#D9E2DA]">
                    <div
                      className="h-full bg-[#25845A] transition-all duration-500 rounded-full"
                      style={{ width: `${p.progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-[#87938B] font-mono">Date: {p.installationDate}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg text-[#68786E] hover:text-[#25845A] bg-[#FFFFFF] border border-[#D9E2DA] shadow-xs transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete project ${p.projectId}?`)) deleteProject(p.id);
                      }}
                      className="p-1.5 rounded-lg text-[#68786E] hover:text-[#D83B3B] bg-[#FFFFFF] border border-[#D9E2DA] shadow-xs transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CREATE / EDIT PROJECT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#FFFFFF] dark:bg-[#1B2720] rounded-3xl shadow-[0_12px_36px_rgba(36,55,45,0.12)] border border-[#D9E2DA] dark:border-[#223328] overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D9E2DA] dark:border-[#223328] bg-[#F1F5F1] dark:bg-[#152019]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] text-[#25845A]">
                  <Sun className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-[#24372D] dark:text-white">
                  {editingProject ? 'Edit Solar Project' : 'Create Solar Installation Project'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-[#68786E] hover:text-[#24372D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Select Customer *
                  </label>
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) => {
                      const cust = customers.find((c) => c.id === e.target.value);
                      if (cust) {
                        setFormData({
                          ...formData,
                          customerId: cust.id,
                          customerName: cust.name,
                          customerMobile: cust.mobile,
                          projectType: cust.projectType,
                          location: `${cust.district}, ${cust.state}`,
                        });
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id} - {c.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    System Configuration
                  </label>
                  <select
                    value={formData.systemType}
                    onChange={(e) => setFormData({ ...formData, systemType: e.target.value as SystemType })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  >
                    <option value="On Grid">On Grid</option>
                    <option value="Off Grid">Off Grid</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Plant Capacity (KW)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacityKW}
                    onChange={(e) => setFormData({ ...formData, capacityKW: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A] font-black"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Panels Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.panelsCount}
                    onChange={(e) => setFormData({ ...formData, panelsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Solar Panel Model
                  </label>
                  <input
                    type="text"
                    value={formData.panelModel}
                    onChange={(e) => setFormData({ ...formData, panelModel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Inverter Model
                  </label>
                  <input
                    type="text"
                    value={formData.inverterModel}
                    onChange={(e) => setFormData({ ...formData, inverterModel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Assigned Technician
                  </label>
                  <select
                    value={formData.technicianAssigned}
                    onChange={(e) => setFormData({ ...formData, technicianAssigned: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Project Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Running">Running</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Completion Progress ({formData.progressPercent}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.progressPercent}
                    onChange={(e) => setFormData({ ...formData, progressPercent: Number(e.target.value) })}
                    className="w-full accent-[#25845A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Installation Date
                  </label>
                  <input
                    type="date"
                    value={formData.installationDate}
                    onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#D9E2DA] dark:border-[#223328] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#152019] text-[#68786E] dark:text-[#8E9F94] font-bold border border-[#D9E2DA] dark:border-[#223328]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#25845A] hover:bg-[#1D7049] text-white font-bold transition shadow-[0_4px_12px_rgba(37,132,90,0.25)]"
                >
                  Save Solar Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
