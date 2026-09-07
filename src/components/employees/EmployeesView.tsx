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
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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

  // Submit Add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addEmployee(formData);
    setAddModalOpen(false);
    showToast(`Employee ${created.name} (${created.code}) added!`, 'success');
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    updateEmployee(selectedEmployee.id, formData);
    setEditModalOpen(false);
    showToast(`Updated employee details for ${selectedEmployee.name}!`, 'success');
  };

  // Submit Delete
  const handleDeleteConfirm = () => {
    if (!selectedEmployee) return;
    deleteEmployee(selectedEmployee.id);
    setDeleteModalOpen(false);
    showToast(`Deleted employee ${selectedEmployee.name}.`, 'info');
  };

  // Status Toggle (Active <-> Inactive)
  const handleToggleStatus = (emp: Employee) => {
    const nextStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    updateEmployee(emp.id, { status: nextStatus });
    showToast(`Updated status for ${emp.name} to ${nextStatus}`, 'info');
  };

  // Attendance Quick Toggle
  const handleToggleAttendance = (emp: Employee) => {
    const nextAtt =
      emp.attendanceToday === 'Present'
        ? 'Absent'
        : emp.attendanceToday === 'Absent'
        ? 'Half Day'
        : 'Present';

    updateEmployee(emp.id, { attendanceToday: nextAtt });
    showToast(`Marked ${emp.name} as ${nextAtt} today`, 'success');
  };

  // CSV Export
  const handleExportCSV = () => {
    const rows = employees.map((e) => ({
      'Employee ID': e.code,
      'Name': e.name,
      'Designation': e.designation,
      'Department': e.department || 'Installation',
      'Phone': e.phone,
      'Email': e.email,
      'Joining Date': e.joiningDate,
      'Monthly Salary (₹)': e.salary,
      'Status': e.status,
      'Today Attendance': e.attendanceToday,
    }));
    exportToCSV('Solar_Employee_Staff_Report', rows);
    showToast('Exported employee directory to CSV', 'success');
  };

  // Filtering
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone.includes(searchTerm) ||
      (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = departmentFilter === 'ALL' || (emp.department || 'Installation') === departmentFilter;
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
    <div className="space-y-6 animate-in fade-in duration-300">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Employee & Staff Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage solar engineers, field technicians, department structures, salary records & daily attendance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Headcount</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalEmployees}</h3>
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-[10px] text-slate-400">Total staff roster</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Staff</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-emerald-500">{activeCount}</h3>
            <UserCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-[10px] text-slate-400">Currently active status</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Present Today</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-blue-500">{presentTodayCount}</h3>
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-[10px] text-slate-400">On site / duty today</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Monthly Payroll</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">₹{totalPayroll.toLocaleString()}</h3>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-[10px] text-slate-400">Cumulative staff salary</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search employee ID, name, designation, phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500"
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
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-700"
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
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-700 font-bold"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Employee Roster Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    No employees found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const initial = emp.name.charAt(0).toUpperCase();

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="p-4 font-mono font-bold text-amber-500 whitespace-nowrap">
                        {emp.code}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {emp.photoUrl ? (
                            <img
                              src={emp.photoUrl}
                              alt={emp.name}
                              className="w-8 h-8 rounded-full object-cover border border-amber-500/30"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center text-xs">
                              {initial}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {emp.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {emp.designation}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                          {emp.department || 'Installation'}
                        </span>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        <div>{emp.phone}</div>
                        <div className="text-slate-400 font-sans text-[10px]">{emp.email}</div>
                      </td>

                      <td className="p-4 text-center text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {emp.joiningDate}
                      </td>

                      <td className="p-4 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                        ₹{emp.salary.toLocaleString()}
                      </td>

                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleAttendance(emp)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 mx-auto ${
                            emp.attendanceToday === 'Present'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : emp.attendanceToday === 'Half Day'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
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
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : emp.status === 'On Leave'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20'
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="View Employee Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit Employee"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} staff records
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

      {/* VIEW DETAILS MODAL */}
      {viewModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <span className="font-mono text-xs font-bold text-amber-500">{selectedEmployee.code}</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Employee Roster Card</h3>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                {selectedEmployee.photoUrl ? (
                  <img
                    src={selectedEmployee.photoUrl}
                    alt={selectedEmployee.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 font-extrabold flex items-center justify-center text-xl">
                    {selectedEmployee.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedEmployee.name}</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold">{selectedEmployee.designation}</p>
                  <span className="mt-1 inline-block px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-bold text-[10px]">
                    {selectedEmployee.department || 'Installation'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                  <p className="text-slate-400">Phone Contact:</p>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">{selectedEmployee.phone}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                  <p className="text-slate-400">Email Address:</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedEmployee.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-center">
                <div>
                  <p className="text-slate-400 text-[10px]">Joining Date</p>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">{selectedEmployee.joiningDate}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Monthly Salary</p>
                  <p className="font-extrabold text-emerald-500 text-sm">₹{selectedEmployee.salary.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Today Status</p>
                  <p className="font-bold text-amber-500">{selectedEmployee.attendanceToday}</p>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {addModalOpen ? 'Add New Employee / Staff' : `Edit Employee ${selectedEmployee?.code}`}
              </h3>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalOpen(false);
                }}
                className="p-1 text-slate-400"
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
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Employee Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-mono text-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-slate-900 dark:text-white"
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
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-emerald-500 font-extrabold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">Profile Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-3 rounded-full bg-red-500/10">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Delete Employee Record</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete employee record for <strong className="text-slate-900 dark:text-white">{selectedEmployee.name}</strong> (<span className="font-mono text-amber-500">{selectedEmployee.code}</span>)?
            </p>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md"
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
