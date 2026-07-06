import { Users2, Layers, UserCog, Shield, StampIcon, Lightbulb, Download } from 'lucide-react';
import Loader from '@/components/ui/Loader';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import { useEffect, useState } from 'react';
import Api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type UserDashboard = {
  role: 'User';
  batches: number;
  students: number;
  maxBatches: number;
  maxStudentsPerBatch: number;
  remainingBatches: number;
};

type MasterDashboard = {
  role: 'MasterAdmin';
  users: number;
  masterAdmins: number;
  totalUsers: number;
  batches: number;
  students: number;
};

function DashboardHome() {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<UserDashboard | MasterDashboard | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Api.get('api/auth/admin/dashboard')
      .then((res) => setDashboard(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const isMaster = hasRole('MasterAdmin');

  return (
    <div>
      <PageHeader
        title={isMaster ? 'Master Admin Dashboard' : 'Dashboard'}
        subtitle={
          isMaster
            ? 'Overview of users, batches, and students'
            : 'Your batches, students, and remaining capacity'
        }
      />

      {isMaster && dashboard?.role === 'MasterAdmin' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard className="stagger-1 animate-slide-up" label="Total users" value={dashboard.totalUsers} icon={Users2} accent="indigo" onClick={() => navigate('/users')} />
          <StatCard className="stagger-2 animate-slide-up" label="Users" value={dashboard.users} icon={UserCog} accent="emerald" onClick={() => navigate('/users')} />
          <StatCard className="stagger-3 animate-slide-up" label="Master admins" value={dashboard.masterAdmins} icon={Shield} accent="violet" onClick={() => navigate('/users')} />
          <StatCard className="stagger-4 animate-slide-up" label="Batches" value={dashboard.batches} icon={Layers} accent="emerald" onClick={() => navigate('/batch')} />
          <StatCard className="stagger-5 animate-slide-up" label="Students" value={dashboard.students} icon={Users2} accent="indigo" onClick={() => navigate('/student')} />
        </div>
      ) : dashboard?.role === 'User' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard className="stagger-1 animate-slide-up" label="Students" value={dashboard.students} icon={Users2} accent="indigo" onClick={() => navigate('/student')} />
          <StatCard className="stagger-2 animate-slide-up" label="Batches" value={dashboard.batches} icon={Layers} accent="emerald" onClick={() => navigate('/batch')} />
          <StatCard className="stagger-3 animate-slide-up" label="Remaining batches" value={dashboard.remainingBatches} icon={StampIcon} accent="amber" />
          <StatCard className="stagger-4 animate-slide-up" label="Max students / batch" value={dashboard.maxStudentsPerBatch} icon={UserCog} accent="violet" />
        </div>
      ) : null}

      <div className="surface-card mt-6 overflow-hidden sm:mt-10">
        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 to-violet-50/50 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-indigo-600" />
            <h3 className="font-semibold text-slate-900">Quick tips</h3>
          </div>
        </div>
        <ul className="space-y-3 p-4 text-sm leading-relaxed text-slate-600 sm:p-6">
          {isMaster ? (
            <>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                Create users with batch limits and permissions from the Users page.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                As Master Admin you can create unlimited batches and students.
              </li>
            </>
          ) : (
            <>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                Create batches first, then register students with fingerprint capture.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>
                  Install MFS100 drivers from the header{' '}
                  <Download className="mb-0.5 inline h-3.5 w-3.5 text-indigo-500" /> before scanning.
                </span>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default DashboardHome;
