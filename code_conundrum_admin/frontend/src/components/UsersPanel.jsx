import { useState } from "react";
import toast from "react-hot-toast";
import { useGetAllUsers, useDeleteUser } from "../hooks/authHook";
import Loading from "./Loading";

export default function UsersPanel() {
  const [filterRole, setFilterRole] = useState("ALL");
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Fetch users data
  const { data: users = [], isLoading, error } = useGetAllUsers();
  const deleteUserMutation = useDeleteUser();

  // Filter users based on role
  const filteredUsers = filterRole === "ALL" 
    ? users 
    : users.filter(u => u.role === filterRole);

  // Calculate stats
  const adminCount = users.filter(u => u.role === "ADMIN").length;
  const teamCount = users.filter(u => u.role === "TEAM").length;

  const stats = [
    { label: "TOTAL USERS", value: users.length, color: "cyan", icon: "👥" },
    { label: "ADMINS", value: adminCount, color: "purple", icon: "👑" },
    { label: "TEAM USERS", value: teamCount, color: "green", icon: "👤" }
  ];

  const getRoleStyle = (role) => {
    return role === "ADMIN"
      ? { bg: "bg-purple-400/10", border: "border-purple-400/50", text: "text-purple-300", badge: "👑" }
      : { bg: "bg-green-400/10", border: "border-green-400/50", text: "text-green-300", badge: "👤" };
  };

  const handleDeleteUser = async (userId, userEmail) => {
    const loadingToast = toast.loading("Deleting user...");
    
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast.success(`User ${userEmail} deleted successfully!`, { id: loadingToast });
      setShowDeleteConfirm(null);
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to delete user";
      toast.error(message, { id: loadingToast });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    toast.error(`Error loading users: ${error.message}`);
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Error loading users. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(200px,1fr))] mb-8">
        {stats.map((stat, idx) => {
          const colorClass = {
            cyan: "from-cyan-400/10 to-cyan-400/5 border-cyan-400/50 shadow-cyan-400/20",
            purple: "from-purple-400/10 to-purple-400/5 border-purple-400/50 shadow-purple-400/20",
            green: "from-green-400/10 to-green-400/5 border-green-400/50 shadow-green-400/20"
          }[stat.color];

          return (
            <div key={idx} className={`panel bg-linear-to-br ${colorClass} border-2 hover:shadow-lg transition-all`}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-4xl font-black mb-2">{stat.value}</div>
              <p className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Users Management */}
      <div className="panel">
        <div className="flex justify-between items-center mb-6">
          <h2 className="panel-title m-0">
            <span className="text-2xl">👥</span>
            User Management
          </h2>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {["ALL", "ADMIN", "TEAM"].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded border text-xs font-bold transition ${
                filterRole === role
                  ? "bg-cyan-400/20 border-cyan-400 text-cyan-300"
                  : "border-cyan-400/30 text-cyan-400/60 hover:bg-cyan-400/10"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Users Table */}
        {filteredUsers.length > 0 ? (
          <div className="space-y-2">
            {filteredUsers.map((user) => {
              const style = getRoleStyle(user.role);
              const createdDate = new Date(user.createdAt).toLocaleDateString();
              
              return (
                <div
                  key={user._id}
                  className={`p-4 rounded-lg border-2 ${style.border} ${style.bg} hover:shadow-lg transition-all hover:-translate-y-0.5`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl font-bold">{user.email}</span>
                        <span className={`text-xl ${style.text}`}>{style.badge}</span>
                        <span className={`text-xs px-2 py-1 rounded ${style.bg} ${style.border} border ${style.text}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {user._id} • Created: {createdDate}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {user.role !== "ADMIN" && (
                        <button 
                          className="btn btn-danger text-xs px-3!"
                          onClick={() => setShowDeleteConfirm(user)}
                          disabled={deleteUserMutation.isPending}
                        >
                          🗑️ Delete
                        </button>
                      )}
                      {user.role === "ADMIN" && (
                        <span className="text-xs text-gray-500 px-3">Protected</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No users found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="panel max-w-md w-full bg-red-400/5 border-red-400/50">
            <h3 className="text-xl font-bold text-red-300 mb-4">⚠️ Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete user <strong>{showDeleteConfirm.email}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 btn btn-danger"
                onClick={() => handleDeleteUser(showDeleteConfirm._id, showDeleteConfirm.email)}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                className="flex-1 btn btn-cyan"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deleteUserMutation.isPending}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
