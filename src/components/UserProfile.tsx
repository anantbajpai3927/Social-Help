import { useState } from 'react';
import { User, Mail, Globe, Calendar, Save, LogOut, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';

interface UserProfileProps {
  onClose?: () => void;
}

const UserProfile = ({ onClose }: UserProfileProps) => {
  const { user, signOut, deleteAccountAndSignOut } = useAuth();
  const { profile, updateProfile, loading } = useUserData();
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    country_code: profile?.country_code || 'US',
    timezone: profile?.timezone || 'UTC',
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile({
        full_name: formData.full_name,
        country_code: formData.country_code,
        timezone: formData.timezone,
      });
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      country_code: profile?.country_code || 'US',
      timezone: profile?.timezone || 'UTC',
    });
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Close the profile modal after successful sign out
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      setDeleteError(null);
      
      const { error } = await deleteAccountAndSignOut();
      
      if (error) {
        setDeleteError(error);
        setDeleting(false);
      } else {
        // Account deleted successfully, close modal
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">User Profile</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-green-800 text-sm">Profile updated successfully!</span>
        </div>
      )}

      {/* Delete Error Message */}
      {deleteError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <X className="w-4 h-4 text-red-600" />
          <span className="text-red-800 text-sm">{deleteError}</span>
          <button
            onClick={() => setDeleteError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-semibold mb-2">⚠️ Delete Account Permanently</h4>
          <p className="text-red-700 text-sm mb-4">
            This action cannot be undone. All your data including health information, emergency contacts, 
            and personalization settings will be permanently deleted.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
              <span>{deleting ? 'Deleting...' : 'Yes, Delete Forever'}</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Profile Content */}
      <div className="space-y-6">
        {/* Avatar and Basic Info */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {profile?.full_name || 'User'}
            </h3>
            <p className="text-gray-600 flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">
                {profile?.full_name || 'Not set'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            {isEditing ? (
              <select
                value={formData.country_code}
                onChange={(e) => setFormData(prev => ({ ...prev, country_code: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="IT">Italy</option>
                <option value="ES">Spain</option>
                <option value="IN">India</option>
                <option value="JP">Japan</option>
                <option value="CN">China</option>
                <option value="BR">Brazil</option>
                <option value="MX">Mexico</option>
              </select>
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">
                {profile?.country_code || 'Not set'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            {isEditing ? (
              <select
                value={formData.timezone}
                onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Europe/Berlin">Berlin</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Asia/Shanghai">Shanghai</option>
                <option value="Asia/Kolkata">Mumbai</option>
                <option value="Australia/Sydney">Sydney</option>
              </select>
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">
                {profile?.timezone || 'Not set'}
              </p>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Account Information</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(user?.created_at || '').toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Last sign in {new Date(user?.last_sign_in_at || '').toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving || !user}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200"
              >
                <User className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={handleSignOut}
                  className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;