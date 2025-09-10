import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../Context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import ChangePasswordModal from "../components/ChangePasswordModal";

const Profile = () => {
  const { token, backendUrl, userData, getUserData, navigate } = useContext(ShopContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editedData, setEditedData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipcode: "",
    }
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (userData) {
      setEditedData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: {
          street: userData.address?.street || "",
          city: userData.address?.city || "",
          state: userData.address?.state || "",
          country: userData.address?.country || "",
          zipcode: userData.address?.zipcode || "",
        }
      });
    }
  }, [token, userData, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
    // Cập nhật editedData với dữ liệu hiện tại
    if (userData) {
      setEditedData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: {
          street: userData.address?.street || "",
          city: userData.address?.city || "",
          state: userData.address?.state || "",
          country: userData.address?.country || "",
          zipcode: userData.address?.zipcode || "",
        }
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userData) {
      setEditedData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: {
          street: userData.address?.street || "",
          city: userData.address?.city || "",
          state: userData.address?.state || "",
          country: userData.address?.country || "",
          zipcode: userData.address?.zipcode || "",
        }
      });
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      // Validate required fields
      if (!editedData.firstName?.trim()) {
        toast.error("First name is required");
        return;
      }
      if (!editedData.lastName?.trim()) {
        toast.error("Last name is required");
        return;
      }
      if (!editedData.email?.trim()) {
        toast.error("Email is required");
        return;
      }
      if (!editedData.address?.street?.trim()) {
        toast.error("Street address is required");
        return;
      }
      if (!editedData.address?.city?.trim()) {
        toast.error("City is required");
        return;
      }
      if (!editedData.address?.state?.trim()) {
        toast.error("State/Province is required");
        return;
      }
      if (!editedData.address?.country?.trim()) {
        toast.error("Country is required");
        return;
      }

      console.log('Sending update request:', {
        url: `${backendUrl}/api/user/update-profile`,
        data: editedData,
        headers: { token }
      });

      const response = await axios.put(
        `${backendUrl}/api/user/update-profile`,
        editedData,
        {
          headers: { token },
        }
      );
      
      console.log('Update response:', response.data);
      if (response.data.success) {
        await getUserData(); // Refresh user data
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }      } catch (error) {
      console.error('Update profile error:', error);
      console.error('Error response:', error.response?.data);
      
      // Show detailed error message
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error ||
                         error.message ||
                         "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen pt-8">
        <div className="max-w-2xl mx-auto p-4">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8">
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-2xl mb-8">
          <Title text1="MY" text2="PROFILE" />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm">First Name</label>
                  <p className="font-medium">{userData.firstName}</p>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">Last Name</label>
                  <p className="font-medium">{userData.lastName}</p>
                </div>
              </div>
              <div>
                <label className="text-gray-600 text-sm">Email</label>
                <p className="font-medium">{userData.email}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm">Phone</label>
                <p className="font-medium">{userData.phone || 'Not set'}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm">Street Address</label>
                <p className="font-medium">{userData.address?.street || 'Not set'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm">City</label>
                  <p className="font-medium">{userData.address?.city || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">State/Province</label>
                  <p className="font-medium">{userData.address?.state || 'Not set'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm">ZIP Code</label>
                  <p className="font-medium">{userData.address?.zipcode || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">Country</label>
                  <p className="font-medium">{userData.address?.country || 'Not set'}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md transition-colors duration-200 text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Profile
                </button>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md transition-colors duration-200 text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Change Password
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block">First Name</label>
                  <input
                    type="text"
                    value={editedData.firstName}
                    onChange={(e) =>
                      setEditedData({ ...editedData, firstName: e.target.value })
                    }
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block">Last Name</label>
                  <input
                    type="text"
                    value={editedData.lastName}
                    onChange={(e) =>
                      setEditedData({ ...editedData, lastName: e.target.value })
                    }
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-600 text-sm block">Email</label>
                <input
                  type="email"
                  value={editedData.email}
                  onChange={(e) =>
                    setEditedData({ ...editedData, email: e.target.value })
                  }
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm block">Phone (Optional)</label>
                <input
                  type="tel"
                  value={editedData.phone}
                  onChange={(e) =>
                    setEditedData({ ...editedData, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm block">Street Address</label>
                <input
                  type="text"
                  value={editedData.address.street}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      address: { ...editedData.address, street: e.target.value }
                    })
                  }
                  placeholder="Enter your street address"
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block">City</label>
                  <input
                    type="text"
                    value={editedData.address.city}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        address: { ...editedData.address, city: e.target.value }
                      })
                    }
                    placeholder="Enter your city"
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block">State/Province</label>
                  <input
                    type="text"
                    value={editedData.address.state}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        address: { ...editedData.address, state: e.target.value }
                      })
                    }
                    placeholder="Enter your state"
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm block">ZIP Code</label>
                  <input
                    type="text"
                    value={editedData.address.zipcode}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        address: { ...editedData.address, zipcode: e.target.value }
                      })
                    }
                    placeholder="Enter your ZIP code"
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm block">Country</label>
                  <input
                    type="text"
                    value={editedData.address.country}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        address: { ...editedData.address, country: e.target.value }
                      })
                    }
                    placeholder="Enter your country"
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors duration-200 text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md transition-colors duration-200 text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        token={token}
        backendUrl={backendUrl}
      />
    </div>
  );
};

export default Profile;