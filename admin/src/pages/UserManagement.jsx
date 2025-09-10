// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// eslint-disable-next-line react/prop-types
const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // Fetch danh sách người dùng từ API
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/list`, {
        headers: { token },
      });
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch user list.");
    } finally {
      setLoading(false);
    }
  };

  // Xóa người dùng
  const removeUser = async (id) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/remove`,
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove user.");
    }
  };

  const toggleUserLock = async (userId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/toggle-lock`,
        { userId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers(); // Refresh danh sách
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error toggling user lock status"
      );
    }
  };

  const handleChangePassword = async (userId) => {
    try {
      const { value: newPassword } = await Swal.fire({
        title: "Enter new password",
        input: "password",
        inputLabel: "New password",
        inputPlaceholder: "Enter new password",
        inputAttributes: {
          minlength: "6",
          autocapitalize: "off",
          autocorrect: "off",
        },
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "Please enter a password";
          }
          if (value.length < 6) {
            return "Password must be at least 6 characters long";
          }
        },
      });

      if (newPassword) {
        const response = await axios.post(
          `${backendUrl}/api/user/admin-change-password`,
          { userId, newPassword },
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error changing password");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_2fr_2fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
            <b>ID</b>
            <b>Name</b>
            <b>Email</b>
            <b className="text-center">Action</b>
          </div>
          {/* User list */}
          {users.map((user) => (
            <div
              key={user._id}
              className="grid grid-cols-[1fr_2fr_2fr_1fr] items-center gap-2 py-3 border text-sm"
            >
              <p>{user._id}</p>
              <p>{user.name}</p>
              <p>{user.email}</p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => removeUser(user._id)}
                  className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
                >
                  X
                </button>                <button
                  onClick={() => toggleUserLock(user._id)}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    user.isLocked
                      ? "text-green-700 bg-green-100 hover:bg-green-200"
                      : "text-red-700 bg-red-100 hover:bg-red-200"
                  }`}
                >
                  {user.isLocked ? "Unlock" : "Lock"}
                </button>
                <button
                  onClick={() => handleChangePassword(user._id)}
                  className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Change Password
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;