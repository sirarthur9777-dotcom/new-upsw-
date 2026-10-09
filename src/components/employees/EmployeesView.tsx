import React, { useState } from 'react';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Award,
  CheckCircle2,
  XCircle,
  Search,
  Edit2,
  X,
  Trash2,
  Eye,
  AlertTriangle,
  Download,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  DollarSign,
  UserCheck,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';

export const EmployeesView: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, projects, exportToCSV } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    designation: 'Solar System Technician',
    department: 'Installation',
    phone: '',
    email: '',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: 25000,
    status: 'Active' as 'Active' | 'On Leave' | 'Inactive',
    attendanceToday: 'Present' as 'Present' | 'Absent' | 'Leave' | 'Half Day',
    photoUrl: '',
    assignedProjects: [] as string[],
  });

  const departments = ['Engineering', 'Installation', 'Operations', 'Sales', 'Accounts'];

  // Open Add Modal
  const openAddModal = () => {
    const nextCode = `EMP-${100 + employees.length + 1}`;
    setFormData({
      code: nextCode,
      name: 'Pankaj Kumar',
      designation: 'Senior Field Engineer',
      department: 'Engineering',
      phone: '9876543210',
      email: 'pankaj.tech@solarix.com',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 32000,
      status: 'Active',
      attendanceToday: 'Present',
      photoUrl: '',
      assignedProjects: [projects[0]?.id || 'PRJ-1'],
    });
    setAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormData({
      code: emp.code,
      name: emp.name,
      designation: emp.designation,
      department: emp.department || 'Installation',
      phone: emp.phone,
      email: emp.email,
      joiningDate: emp.joiningDate,
      salary: emp.salary,
      status: emp.status,
      attendanceToday: emp.attendanceToday,
      photoUrl: emp.photoUrl || '',
      assignedProjects: emp.assignedProjects || [],
    });
    setEditModalOpen(true);
  };

  // Handle Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('Please provide employee name and contact number.', 'error');
      return;
    }

    addEmployee({
      code: formData.code,
      name: formData.name,
      designation: formData.designation,
      department: formData.department,
      phone: formData.phone,
      email: formData.email,
      joiningDate: formData.joiningDate,
      salary: Number(formData.salary),
      status: formData.status,
      attendanceToday: formData.attendanceToday,
      photoUrl: formData.photoUrl,
      assignedProjects: formData.assignedProjects,
    });

    setAddModalOpen(false);
    showToast(`Employee ${formData.name} added successfully!`, 'success');
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    updateEmployee(selectedEmployee.id, {
      name: formData.name,
      designation: formData.designation,
      department: formData.department,
      phone: formData.phone,
      email: formData.email,
      joiningDate: formData.joiningDate,
      salary: Number(formData.salary),
      status: formData.status,
      attendanceToday: formData.attendanceToday,
      photoUrl: formData.photoUrl,
      assignedProjects: formData.assignedProjects,
    });

    setEditModalOpen(false);
    showToast(`Updated employee details for ${formData.name}.`, 'success');
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = () => {
    if (!selectedEmployee) return;
    deleteEmployee(selectedEmployee.id);
    setDeleteModalOpen(false);
    showToast(`Removed employee ${selectedEmployee.name}.`, 'info');
  };

  // Toggle Attendance
  const handleToggleAttendance = (emp: Employee) => {
    const nextAttendance =
      emp.attendanceToday === 'Present'
        ? 'Half Day'
        : emp.attendanceToday === 'Half Day'
        ? 'Absent'
        : 'Present';

    updateEmployee(emp.id, { attendanceToday: nextAttendance });
    showToast(`Updated attendance for ${emp.name} to ${nextAttendance}`, 'info');
  };

  // Toggle Status
  const handleToggleStatus = (emp: Employee) => {
    const nextStatus = emp.status === 'Active' ? 'On Leave' : emp.status === 'On Leave' ? 'Inactive' : 'Active';
    updateEmployee(emp.id, { status: nextStatus });
    showToast(`Employee ${emp.name} marked as ${nextStatus}`, 'info');
  };

  // CSV Export
  const handleExportCSV = () => {
    const rows = employees.map((e) => ({
      'Employee Code': e.code,
      'Name': e.name,
      'Designation': e.designation,
      'Department': e.department,
      'Phone': e.phone,
      'Email': e.email,
      'Joining Date': e.joiningDate,
      'Salary (₹)': e.salary,
      'Status': e.status,
      'Attendance Today': e.attendanceToday,
    }));
    exportToCSV('Solar_Employees_Roster', rows);
    showToast('Exported employee roster to CSV', 'success');
  };

  // Filter Logic
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone.includes(searchTerm) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Pagination Math
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary Metrics
  const totalEmployees = employees.length;
  const activeCount = employees.filter((e) => e.status === 'Active').length;
  const presentTodayCount = employees.filter((e) => e.attendanceToday === 'Present' || e.attendanceToday === 'Half Day').length;
  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-[0_8px_20px_rgba(36,55,45,0.15)] flex items-center gap-3 border font-bold text-xs text-white animate-in slide-in-from-bottom-5 ${
            toastType === 'success'
              ? 'bg-[#25845A] border-[#1D7049]'
              : toastType === 'error'
              ? 'bg-[#D83B3B] border-[#B02828]'
              : 'bg-[#24372D] border-[#1A261F]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#24372D] dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#DCEBE0] text-[#25845A]">
              <Users className="w-5 h-5" />
            </span>
            <span>Employee & Staff Directory</span>
          </h2>
          <p className="text-xs text-[#68786E] dark:text-[#8E9F94] mt-1 font-medium">
            Manage solar engineers, field technicians, department structures, salary records & daily attendance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1A261F] text-[#24372D] dark:text-[#E6EEE8] border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] hover:bg-[#F8FAF8] font-bold text-xs transition"
          >
            <Download className="w-4 h-4 text-[#25845A]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25845A] hover:bg-[#1D7049] text-white font-bold text-xs transition shadow-[0_4px_12px_rgba(37,132,90,0.25)] border border-[#1D7049] active:translate-y-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] space-y-1">
          <p className="text-[11px] font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">Total Headcount</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-[#24372D] dark:text-white tabular-nums">{totalEmployees}</h3>
            <div className="w-8 h-8 rounded-xl bg-[#DCEBE0] text-[#25845A] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-[#68786E]">Total staff roster</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] space-y-1">
          <p className="text-[11px] font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">Active Staff</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-[#25845A] dark:text-[#2DA16E] tabular-nums">{activeCount}</h3>
            <div className="w-8 h-8 rounded-xl bg-[#DCEBE0] text-[#25845A] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-[#68786E]">Currently active status</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] space-y-1">
          <p className="text-[11px] font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">Present Today</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-[#2878C7] tabular-nums">{presentTodayCount}</h3>
            <div className="w-8 h-8 rounded-xl bg-[#2878C7]/15 text-[#2878C7] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-[#68786E]">On site / duty today</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] space-y-1">
          <p className="text-[11px] font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">Total Monthly Payroll</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-black text-[#24372D] dark:text-white tabular-nums">₹{totalPayroll.toLocaleString()}</h3>
            <div className="w-8 h-8 rounded-xl bg-[#DCEBE0] text-[#25845A] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-[#68786E]">Cumulative staff salary</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#25845A] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search employee ID, name, designation, phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] placeholder-[#87938B] text-xs focus:outline-none focus:border-[#25845A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] text-xs font-medium focus:outline-none focus:border-[#25845A]"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] text-xs font-bold focus:outline-none focus:border-[#25845A]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Employee Roster Table */}
      <div className="rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F1F5F1] dark:bg-[#152019] text-[#68786E] dark:text-[#8E9F94] font-bold uppercase tracking-wider border-b border-[#D9E2DA] dark:border-[#223328]">
                <th className="p-4">Employee ID</th>
                <th className="p-4">Employee Profile</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Department</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4 text-center">Joining Date</th>
                <th className="p-4 text-right">Salary (₹)</th>
                <th className="p-4 text-center">Attendance</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2DA] dark:divide-[#223328]">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-[#87938B]">
                    No employees found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const initial = emp.name.charAt(0).toUpperCase();

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-[#F8FAF8] dark:hover:bg-[#202E25]/50 transition"
                    >
                      <td className="p-4 font-mono font-bold text-[#25845A] whitespace-nowrap">
                        {emp.code}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {emp.photoUrl ? (
                            <img
                              src={emp.photoUrl}
                              alt={emp.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#25845A]/30"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#DCEBE0] text-[#25845A] font-bold flex items-center justify-center text-xs">
                              {initial}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-[#24372D] dark:text-white block">
                              {emp.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-medium text-[#24372D] dark:text-[#E6EEE8] whitespace-nowrap">
                        {emp.designation}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-[#F1F5F1] dark:bg-[#121A15] text-[#24372D] dark:text-[#E6EEE8] border border-[#D9E2DA] dark:border-[#223328] font-semibold text-[11px]">
                          {emp.department || 'Installation'}
                        </span>
                      </td>

                      <td className="p-4 text-[#68786E] dark:text-[#8E9F94] whitespace-nowrap font-mono text-[11px]">
                        <div>{emp.phone}</div>
                        <div className="text-[#87938B] font-sans text-[10px]">{emp.email}</div>
                      </td>

                      <td className="p-4 text-center text-[#87938B] font-mono text-[11px] whitespace-nowrap">
                        {emp.joiningDate}
                      </td>

                      <td className="p-4 text-right font-black text-[#24372D] dark:text-white whitespace-nowrap tabular-nums">
                        ₹{emp.salary.toLocaleString()}
                      </td>

                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleAttendance(emp)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex items-center gap-1 mx-auto ${
                            emp.attendanceToday === 'Present'
                              ? 'bg-[#DCEBE0] text-[#25845A] border border-[#25845A]/30'
                              : emp.attendanceToday === 'Half Day'
                              ? 'bg-[#D99A18]/15 text-[#D99A18] border border-[#D99A18]/30'
                              : 'bg-[#D83B3B]/15 text-[#D83B3B] border border-[#D83B3B]/30'
                          }`}
                        >
                          {emp.attendanceToday === 'Present' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>{emp.attendanceToday}</span>
                        </button>
                      </td>

                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition ${
                            emp.status === 'Active'
                              ? 'bg-[#DCEBE0] text-[#25845A] border border-[#25845A]/30'
                              : emp.status === 'On Leave'
                              ? 'bg-[#D99A18]/15 text-[#D99A18] border border-[#D99A18]/30'
                              : 'bg-[#68786E]/15 text-[#68786E] border border-[#68786E]/30'
                          }`}
                        >
                          {emp.status}
                        </button>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setViewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-[#68786E] hover:text-[#25845A] bg-[#FFFFFF] dark:bg-[#1A261F] border border-[#D9E2DA] dark:border-[#223328] shadow-[1px_1px_3px_rgba(36,55,45,0.06),-1px_-1px_3px_rgba(255,255,255,0.85)] transition"
                            title="View Employee Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-1.5 rounded-lg text-[#68786E] hover:text-[#25845A] bg-[#FFFFFF] dark:bg-[#1A261F] border border-[#D9E2DA] dark:border-[#223328] shadow-[1px_1px_3px_rgba(36,55,45,0.06),-1px_-1px_3px_rgba(255,255,255,0.85)] transition"
                            title="Edit Employee"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-[#68786E] hover:text-[#D83B3B] bg-[#FFFFFF] dark:bg-[#1A261F] border border-[#D9E2DA] dark:border-[#223328] shadow-[1px_1px_3px_rgba(36,55,45,0.06),-1px_-1px_3px_rgba(255,255,255,0.85)] transition"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-[#F1F5F1] dark:bg-[#152019] border-t border-[#D9E2DA] dark:border-[#223328] flex items-center justify-between text-xs">
            <span className="text-[#68786E] dark:text-[#8E9F94]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} staff records
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-[#D9E2DA] dark:border-[#223328] bg-white dark:bg-[#1A261F] disabled:opacity-40 hover:bg-[#F8FAF8] transition"
              >
                <ChevronLeft className="w-4 h-4 text-[#24372D] dark:text-white" />
              </button>
              <span className="font-bold text-[#24372D] dark:text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-[#D9E2DA] dark:border-[#223328] bg-white dark:bg-[#1A261F] disabled:opacity-40 hover:bg-[#F8FAF8] transition"
              >
                <ChevronRight className="w-4 h-4 text-[#24372D] dark:text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24372D]/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#FFFFFF] dark:bg-[#1B2720] rounded-2xl shadow-[0_10px_35px_rgba(36,55,45,0.2)] border border-[#D9E2DA] dark:border-[#223328] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D9E2DA] dark:border-[#223328]">
              <div>
                <span className="font-mono text-xs font-bold text-[#25845A]">{selectedEmployee.code}</span>
                <h3 className="font-bold text-[#24372D] dark:text-white text-base">Employee Roster Card</h3>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="p-1 text-[#87938B] hover:text-[#24372D] dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-4 p-4 bg-[#F1F5F1] dark:bg-[#121A15] rounded-xl border border-[#D9E2DA] dark:border-[#223328]">
                {selectedEmployee.photoUrl ? (
                  <img
                    src={selectedEmployee.photoUrl}
                    alt={selectedEmployee.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#25845A]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#DCEBE0] text-[#25845A] font-extrabold flex items-center justify-center text-xl">
                    {selectedEmployee.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-base font-extrabold text-[#24372D] dark:text-white">{selectedEmployee.name}</h4>
                  <p className="text-[#68786E] dark:text-[#8E9F94] font-semibold">{selectedEmployee.designation}</p>
                  <span className="mt-1 inline-block px-2 py-0.5 rounded-md bg-[#DCEBE0] text-[#25845A] font-bold text-[10px]">
                    {selectedEmployee.department || 'Installation'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#F1F5F1] dark:bg-[#121A15] rounded-xl border border-[#D9E2DA] dark:border-[#223328] space-y-1">
                  <p className="text-[#87938B]">Phone Contact:</p>
                  <p className="font-mono font-bold text-[#24372D] dark:text-white">{selectedEmployee.phone}</p>
                </div>
                <div className="p-3 bg-[#F1F5F1] dark:bg-[#121A15] rounded-xl border border-[#D9E2DA] dark:border-[#223328] space-y-1">
                  <p className="text-[#87938B]">Email Address:</p>
                  <p className="font-semibold text-[#24372D] dark:text-white">{selectedEmployee.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-[#F1F5F1] dark:bg-[#121A15] border border-[#D9E2DA] dark:border-[#223328] rounded-xl text-center">
                <div>
                  <p className="text-[#87938B] text-[10px]">Joining Date</p>
                  <p className="font-mono font-bold text-[#24372D] dark:text-white">{selectedEmployee.joiningDate}</p>
                </div>
                <div>
                  <p className="text-[#87938B] text-[10px]">Monthly Salary</p>
                  <p className="font-extrabold text-[#25845A] text-sm tabular-nums">₹{selectedEmployee.salary.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[#87938B] text-[10px]">Today Status</p>
                  <p className="font-bold text-[#24372D] dark:text-white">{selectedEmployee.attendanceToday}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D9E2DA] dark:border-[#223328] flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-[#24372D] dark:text-white border border-[#D9E2DA] dark:border-[#223328] font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT EMPLOYEE MODAL */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24372D]/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#FFFFFF] dark:bg-[#1B2720] rounded-2xl shadow-[0_10px_35px_rgba(36,55,45,0.2)] border border-[#D9E2DA] dark:border-[#223328] overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D9E2DA] dark:border-[#223328]">
              <h3 className="font-bold text-[#24372D] dark:text-white text-base">
                {addModalOpen ? 'Add New Employee / Staff' : `Edit Employee ${selectedEmployee?.code}`}
              </h3>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalOpen(false);
                }}
                className="p-1 text-[#87938B] hover:text-[#24372D] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={addModalOpen ? handleAddSubmit : handleEditSubmit}
              className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#24372D] dark:text-[#E6EEE8]">Employee Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] font-mono text-[#25845A] font-bold outline-none focus:border-[#25845A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#24372D] dark:text-[#E6EEE8]">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#24372D] dark:text-[#E6EEE8]">Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#24372D] dark:text-[#E6EEE8]">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#24372D] dark:text-[#E6EEE8]">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] font-mono outline-none focus:border-[#25845A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#24372D] dark:text-[#E6EEE8]">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#24372D] dark:text-[#E6EEE8]">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#24372D] dark:text-[#E6EEE8]">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#25845A] font-extrabold outline-none focus:border-[#25845A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#24372D] dark:text-[#E6EEE8]">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] font-bold outline-none focus:border-[#25845A]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#24372D] dark:text-[#E6EEE8]">Profile Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                />
              </div>

              <div className="pt-4 border-t border-[#D9E2DA] dark:border-[#223328] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-[#68786E] border border-[#D9E2DA] dark:border-[#223328] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#25845A] hover:bg-[#1D7049] text-white font-bold shadow-[0_4px_12px_rgba(37,132,90,0.25)] border border-[#1D7049] transition"
                >
                  {addModalOpen ? 'Save Employee' : 'Update Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DELETE DIALOG */}
      {deleteModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24372D]/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#1B2720] rounded-2xl shadow-[0_10px_35px_rgba(36,55,45,0.2)] border border-[#D9E2DA] dark:border-[#223328] overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#D83B3B]">
              <div className="p-3 rounded-full bg-[#D83B3B]/10">
                <AlertTriangle className="w-6 h-6 text-[#D83B3B]" />
              </div>
              <div>
                <h3 className="font-bold text-[#24372D] dark:text-white text-base">Delete Employee Record</h3>
                <p className="text-xs text-[#87938B]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#68786E] dark:text-[#8E9F94]">
              Are you sure you want to delete employee record for <strong className="text-[#24372D] dark:text-white">{selectedEmployee.name}</strong> (<span className="font-mono text-[#25845A]">{selectedEmployee.code}</span>)?
            </p>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-[#68786E] border border-[#D9E2DA] dark:border-[#223328] font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-[#D83B3B] hover:bg-[#B02828] text-white font-bold text-xs shadow-md transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
