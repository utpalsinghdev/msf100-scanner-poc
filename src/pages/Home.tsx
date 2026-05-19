import { Users2, Layers, UserCog, Shield, StampIcon } from 'lucide-react';
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
          <StatCard
            label="Total users"
            value={dashboard.totalUsers}
            icon={Users2}
            accent="indigo"
            onClick={() => navigate('/users')}
          />
          <StatCard
            label="Users"
            value={dashboard.users}
            icon={UserCog}
            accent="emerald"
            onClick={() => navigate('/users')}
          />
          <StatCard
            label="Master admins"
            value={dashboard.masterAdmins}
            icon={Shield}
            accent="violet"
            onClick={() => navigate('/users')}
          />
          <StatCard
            label="Batches"
            value={dashboard.batches}
            icon={Layers}
            accent="emerald"
            onClick={() => navigate('/batch')}
          />
          <StatCard
            label="Students"
            value={dashboard.students}
            icon={Users2}
            accent="indigo"
            onClick={() => navigate('/student')}
          />
        </div>
      ) : dashboard?.role === 'User' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Students"
            value={dashboard.students}
            icon={Users2}
            accent="indigo"
            onClick={() => navigate('/student')}
          />
          <StatCard
            label="Batches"
            value={dashboard.batches}
            icon={Layers}
            accent="emerald"
            onClick={() => navigate('/batch')}
          />
          <StatCard
            label="Remaining batches"
            value={dashboard.remainingBatches}
            icon={StampIcon}
            accent="amber"
          />
          <StatCard
            label="Max students / batch"
            value={dashboard.maxStudentsPerBatch}
            icon={UserCog}
            accent="violet"
          />
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-10 sm:p-6">
        <h3 className="font-semibold text-slate-900">Quick tips</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {isMaster ? (
            <>
              <li>• Create Users with batch limits and access permissions from the Users page.</li>
              <li>• You can create unlimited batches and students as Master Admin.</li>
            </>
          ) : (
            <>
              <li>• Create batches first, then register students with fingerprint capture.</li>
              <li>• Install MFS100 drivers from the header before scanning.</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default DashboardHome;
