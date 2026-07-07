import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserCheck, UserX, Shield, Search, Filter, Download, Trash2, AlertTriangle, X, Plus, History, Lock, FileText, Upload, ChevronRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { SystemActivityLogs } from './SystemActivityLogs';

export function AdminView() {
  const [activeTab, setActiveTab] = useState('Isticmaalayaasha');
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserInfo, setNewUserInfo] = useState({ email: '', role: 'Injineerka' });

  // Load from local storage sync key or default records
  const [users, setUsers] = useState<any[]>(() => {
    const raw = localStorage.getItem('geomds_registered_users');
    let usersList: any[] = [];
    if (!raw) {
      usersList = [
        { email: 'admin@admin.com', password: 'admin', role: 'Maamulaha', name: 'Admin Maamule', active: true, status: 'Firfircoon', date: '02/01/2026' },
        { email: 'engmohamedyare7@gmail.com', password: 'admin', role: 'Maamulaha', name: 'Eng. Mohamed Abduqaadir', active: true, status: 'Firfircoon', date: '10/01/2026' },
        { email: 'injineer@geodms.com', password: 'admin', role: 'Injineerka', name: 'Inj. Maxamed Cabdulqaadir', active: true, status: 'Firfircoon', date: '15/01/2026' },
        { email: 'user@example.com', password: 'admin', role: 'Injineerka', name: 'User Example', active: false, status: 'Aan Firfircoonayn', date: '01/01/2026' }
      ];
      localStorage.setItem('geomds_registered_users', JSON.stringify(usersList));
      return usersList;
    }
    try {
      usersList = JSON.parse(raw);
    } catch (e) {
      usersList = [];
    }

    // Proactively upgrade Eng. Mohamed accounts to full Maamulaha (Admins) and Active in the persistent storage
    let modified = false;
    usersList = usersList.map((user: any) => {
      const emailLower = (user.email || '').toLowerCase();
      const isMohamedEng = emailLower === 'engmohamedyare7@gmail.com' || 
                           emailLower === 'mohamedabduqaadir361@gmail.com' || 
                           emailLower.includes('mohamedabduqaadir') ||
                           emailLower.includes('mohamedyare');
      
      if (isMohamedEng && (user.role !== 'Maamulaha' || !user.active)) {
        modified = true;
        return {
          ...user,
          role: 'Maamulaha',
          active: true,
          status: 'Firfircoon'
        };
      }
      return user;
    });

    if (modified) {
      localStorage.setItem('geomds_registered_users', JSON.stringify(usersList));
    }

    return usersList;
  });

  // Automatically save users on any change to state
  useEffect(() => {
    localStorage.setItem('geomds_registered_users', JSON.stringify(users));
  }, [users]);

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    publicRegistration: false,
    mfaRequired: true,
    autoBackup: true
  });

  const fileActivities = [
    { id: '1', file: 'Highway_A42_Layout.dwg', action: 'Uploaded', user: 'Eng. Mohamed', size: '12.4 MB', time: '5 mins ago', type: 'dwg' },
    { id: '2', file: 'Annual_Budget_2026.pdf', action: 'Renamed', user: 'Admin', size: '4.2 MB', time: '1 hour ago', type: 'pdf' },
    { id: '3', file: 'Contract_Sarah_Final.docx', action: 'Approved', user: 'Legal Dept', size: '0.8 MB', time: '3 hours ago', type: 'doc' },
    { id: '4', file: 'Old_Draft_V1.pdf', action: 'Deleted', user: 'Admin', size: '1.2 MB', time: '5 hours ago', type: 'pdf' },
    { id: '5', file: 'Topographic_Map_Z4.dwg', action: 'Moved to Cloud', user: 'System', size: '18.7 MB', time: 'Yesterday', type: 'dwg' },
  ];

  const logs = [
    { event: 'User Login', user: 'admin@admin.com', ip: '192.168.1.1', time: '10 mins ago' },
    { event: 'Document Uploaded', user: 'engmohamedyare7@gmail.com', ip: '192.168.1.45', time: '1 hour ago' },
    { event: 'System Backup', user: 'System', ip: 'internal', time: '3 hours ago' },
    { event: 'Permission Changed', user: 'admin@admin.com', ip: '192.168.1.1', time: '5 hours ago' },
  ];

  const handleDeleteUser = () => {
    if (userToDelete) {
      setUsers(prev => prev.filter(u => u.email !== userToDelete));
      setUserToDelete(null);
    }
  };

  const handleToggleStatus = (email: string) => {
    setUsers(prev => prev.map(u => 
      u.email === email ? { ...u, active: !u.active, status: !u.active ? 'Firfircoon' : 'Aan Firfircoonayn' } : u
    ));
  };

  const handleRoleChange = (email: string, role: string) => {
    setUsers(prev => prev.map(u => 
      u.email === email ? { ...u, role } : u
    ));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserInfo.email) {
      setUsers(prev => [
        { 
          email: newUserInfo.email, 
          password: 'admin',
          name: newUserInfo.email.split('@')[0],
          role: newUserInfo.role, 
          status: 'Aan Firfircoonayn', 
          date: new Date().toLocaleDateString('en-GB'), 
          active: false 
        },
        ...prev
      ]);
      setNewUserInfo({ email: '', role: 'Injineerka' });
      setIsAddModalOpen(false);
    }
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  const stats = [
    { label: 'Wadarta', value: users.length.toString(), icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Firfircoon', value: users.filter(u => u.active).length.toString(), icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Aan Firfircoonayn', value: users.filter(u => !u.active).length.toString(), icon: UserX, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Maamulayaal', value: users.filter(u => u.role === 'Maamulaha').length.toString(), icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleAddUser} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Xaqiiji Isticmaale Cusub</h3>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-1">Email</label>
                    <input 
                      required
                      type="email" 
                      value={newUserInfo.email}
                      onChange={(e) => setNewUserInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="user@example.com"
                      className="w-full bg-sidebar/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div id="add-user-role-display" className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-1">Doorka</label>
                    <select 
                      value={newUserInfo.role}
                      onChange={(e) => setNewUserInfo(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full bg-sidebar/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none transition-all cursor-pointer font-bold"
                    >
                      <option value="Injineerka">Injineerka (Engineer)</option>
                      <option value="Maamulaha">Maamulaha (Admin)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2">
                   Ku dar Isticmaalaha
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUserToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <AlertTriangle className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Xaqiiji Masaxidda</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Ma hubtaa inaad tirtirto isticmaalahan?</p>
                  </div>
                </div>

                <div className="bg-sidebar/50 border border-border rounded-xl p-4 mb-6">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Isticmaalaha la tirtirayo</p>
                  <p className="text-sm font-bold text-white tracking-tight">{userToDelete}</p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setUserToDelete(null)}
                    className="flex-1 px-4 py-3 rounded-xl bg-sidebar border border-border text-white text-xs font-bold uppercase tracking-widest hover:bg-muted transition-all"
                  >
                    Jooji
                  </button>
                  <button 
                    onClick={handleDeleteUser}
                    className="flex-1 px-4 py-3 rounded-xl bg-rose-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all"
                  >
                    Haa, Tirtir
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Maamulka Nidaamka</h2>
          <p className="text-sm text-muted-foreground mt-1">Maaray isticmaalayaasha, diiwaanka, iyo dejinta nidaamka</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search admin data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-sidebar border border-border rounded-xl pl-10 pr-4 py-2 text-xs focus:border-primary outline-none transition-all w-48 md:w-64"
            />
          </div>
          <div className="relative">
            <button className="p-2 rounded-xl bg-sidebar border border-border text-muted-foreground hover:text-white transition-all">
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-sidebar" />
              <div className="w-4 h-4 flex items-center justify-center text-[8px] font-bold">2</div>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              type: "spring",
              damping: 20,
              stiffness: 100
            }}
            className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 hover:border-primary/30 transition-all cursor-default group"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        {/* Tabs */}
        <div className="flex items-center gap-8 px-6 py-4 border-b border-border bg-sidebar-accent/5 overflow-x-auto no-scrollbar">
          {['Isticmaalayaasha', 'Diiwaanka', 'Hawlgalka Faylasha', 'Amniga Hawlgalka', 'Dejinta'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] font-bold uppercase tracking-[0.2em] relative py-1 transition-all whitespace-nowrap
                ${activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-white'}
              `}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="adminTab" className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'Isticmaalayaasha' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">Isticmaalayaasha</h3>
                  <p className="text-xs text-muted-foreground">Liiska dhammaan isticmaalayaasha iyo doorarkooda</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add User
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Doorka</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Xaalada</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Taariikhda</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Hawlgal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredUsers.map((user, i) => (
                      <tr key={i} className="hover:bg-sidebar-accent/10 transition-colors group">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sidebar-accent border border-border flex items-center justify-center text-[10px] font-bold text-primary uppercase">
                              {(user.name || user.email)[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white group-hover:text-primary transition-colors leading-tight">
                                {user.name || (user.email ? user.email.split('@')[0] : 'Engineer')}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono leading-none mt-0.5">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td id={`user-row-role-${i}`} className="px-4 py-4">
                          <select 
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.email, e.target.value)}
                            className={`border px-2 py-1.5 rounded-lg text-xs font-bold focus:border-primary focus:outline-none transition-all cursor-pointer bg-sidebar-accent/40
                              ${user.role === 'Maamulaha' 
                                ? 'text-purple-400 border-purple-500/20 hover:bg-purple-500/5' 
                                : 'text-[#00b0ff] border-[#00b0ff]/20 hover:bg-[#00b0ff]/5'
                              }
                            `}
                          >
                            <option value="Injineerka" className="bg-[#13262f] text-white">Injineerka (Engineer)</option>
                            <option value="Maamulaha" className="bg-[#13262f] text-white">Maamulaha (Admin)</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border inline-flex items-center gap-1.5
                            ${user.active 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }
                          `}>
                            <div className={`w-1 h-1 rounded-full ${user.active ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[10px] text-muted-foreground font-mono">{user.date}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => setUserToDelete(user.email)}
                              className="p-1.5 rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="h-4 w-px bg-border/50 mx-1" />
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                {user.active ? 'Jooji' : 'Hawlgeli'}
                              </span>
                              <button 
                                onClick={() => handleToggleStatus(user.email)}
                                className={`w-10 h-5 rounded-full transition-all relative ${user.active ? 'bg-primary' : 'bg-muted'}`}
                              >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${user.active ? 'left-6' : 'left-1'}`} />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Diiwaanka' && (
            <SystemActivityLogs />
          )}

          {activeTab === 'Hawlgalka Faylasha' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">Dhaqdhaqaaqa Faylasha</h3>
                  <p className="text-xs text-muted-foreground">Tracking all file modifications and uploads</p>
                </div>
                <div className="flex gap-2">
                   <button className="px-4 py-2 rounded-xl bg-sidebar border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-all">Today</button>
                   <button className="px-4 py-2 rounded-xl bg-sidebar border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-all">This Week</button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {fileActivities.map((activity) => (
                  <div key={activity.id} className="group p-4 rounded-2xl bg-sidebar/30 border border-border hover:border-primary/30 transition-all flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110
                      ${activity.action === 'Deleted' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                        activity.action === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                        'bg-primary/10 text-primary border border-primary/20'}
                    `}>
                      {activity.action === 'Uploaded' ? <Upload className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{activity.file}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded
                          ${activity.action === 'Deleted' ? 'bg-rose-500/20 text-rose-500' : 
                            activity.action === 'Approved' ? 'bg-emerald-500/20 text-emerald-500' : 
                            'bg-primary/20 text-primary'}
                        `}>{activity.action}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-muted-foreground text-[11px]">
                        <span>By {activity.user}</span>
                        <span>•</span>
                        <span className="font-mono">{activity.size}</span>
                        <span>•</span>
                        <span className="bg-muted px-1.5 rounded text-[10px] font-bold uppercase tracking-tighter">{activity.type}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 mb-2">{activity.time}</p>
                      <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Amniga Hawlgalka' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground tracking-tight">Security Activities</h3>
                    <p className="text-xs text-muted-foreground">Monitoring critical system entry points and threats</p>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { type: 'Alert', event: 'Failed Login Attempt', user: 'Unknown', source: '88.132.x.x', severity: 'high', time: '5 mins ago' },
                      { type: 'Auth', event: 'New Admin Assigned', user: 'admin@admin.com', source: 'Internal', severity: 'medium', time: '2 hours ago' },
                      { type: 'Security', event: 'MFA Disabled for user', user: 'user@example.com', source: '102.32.x.x', severity: 'critical', time: 'Yesterday' },
                      { type: 'Network', event: 'DDoS Mitigation Active', user: 'System', source: 'Public API', severity: 'low', time: '2 days ago' },
                    ].map((sec, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-sidebar/30 border border-border group hover:border-rose-500/30 transition-all">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                          ${sec.severity === 'critical' ? 'bg-rose-500/20 text-rose-500' : 
                            sec.severity === 'high' ? 'bg-orange-500/20 text-orange-500' : 'bg-primary/20 text-primary'}
                        `}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{sec.event}</span>
                            <span className={`text-[8px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm border
                              ${sec.severity === 'critical' ? 'border-rose-500/30 text-rose-500' : 'border-border text-muted-foreground'}
                            `}>{sec.severity}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">User: <span className="text-white">{sec.user}</span> • Source: <span className="font-mono">{sec.source}</span></p>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{sec.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-sidebar-accent/10 border border-border rounded-2xl p-5">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" /> Active Sessions
                    </h4>
                    <div className="space-y-4">
                      {[
                        { device: 'Workstation X-1', os: 'Windows 11', location: 'Mogadishu, SO', status: 'Online' },
                        { device: 'Mobile Pixel 8', os: 'Android 14', location: 'Dubai, UAE', status: 'Idle' },
                      ].map((session, i) => (
                        <div key={i} className="flex items-center justify-between pb-3 border-b border-border/30 last:border-0 last:pb-0">
                          <div>
                            <p className="text-xs font-bold text-white">{session.device}</p>
                            <p className="text-[10px] text-muted-foreground">{session.os} • {session.location}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                            <span className="text-[9px] text-emerald-500 font-bold uppercase mt-1">{session.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-rose-500 mb-2">Threat Score</h4>
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-3xl font-bold text-white">0.02</span>
                      <span className="text-[10px] text-emerald-500 font-bold mb-1.5 uppercase tracking-tighter">Low Risk</span>
                    </div>
                    <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                      <div className="w-2 h-full bg-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Dejinta' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">System Configuration</h3>
                  <p className="text-xs text-muted-foreground">Adjust global system parameters and security policies</p>
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Mugdi / Iftiin</p>
                   <ThemeToggle />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Disable public access for updates', icon: Shield },
                  { id: 'publicRegistration', label: 'Public Registration', desc: 'Allow new users to create accounts', icon: Users },
                  { id: 'mfaRequired', label: 'Require MFA', desc: 'Force all admins to use 2FA', icon: Lock },
                  { id: 'autoBackup', label: 'Auto Backups', desc: 'Automatically backup system data weekly', icon: History },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-sidebar/30 border border-border hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-sidebar-accent flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">{item.desc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSystemSettings(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof systemSettings] }))}
                      className={`w-10 h-5 rounded-full transition-all relative ${systemSettings[item.id as keyof typeof systemSettings] ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${systemSettings[item.id as keyof typeof systemSettings] ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-border/50">
                <button className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl hover:opacity-90 active:scale-95 transition-all">
                  Save System Layout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
