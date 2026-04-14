import useAuthStore from '../store/authStore.js';

const Dashboard = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-neutral-100">
        <div className="flex justify-between items-center mb-8 border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Portal Dashboard</h1>
            <p className="text-slate-500 capitalize">{user?.role} Access</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-all"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-primary-50 rounded-xl border border-primary-100">
            <h3 className="font-bold text-primary-900 mb-2">Welcome, {user?.name}!</h3>
            <p className="text-primary-700 text-sm">
              You are successfully logged in as a {user?.role}.
            </p>
          </div>
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2">Institutional Announcements</h3>
            <p className="text-slate-600 text-sm italic">
              No new announcements at this time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
