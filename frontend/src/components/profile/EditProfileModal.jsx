import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCamera, FiLock, FiUser, FiPhone, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";
import { useUser } from "../../contexts/AuthContext";

export default function EditProfileModal({ open, onClose }) {
  const { user, updateProfile, changePassword, uploadAvatar } = useUser();
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pwData, setPwData] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);
  const fileRef = useRef(null);

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5 MB)");
      return;
    }
    setUploading(true);
    try {
      await uploadAvatar(file);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name, phone });
      toast.success("Profile updated");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwData.next !== pwData.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwData.next.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(pwData.current, pwData.next);
      toast.success("Password changed");
      setPwData({ current: "", next: "", confirm: "" });
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  const avatarSrc = user?.avatar_url
    ? `${import.meta.env.VITE_API_URL || ""}${user.avatar_url}`
    : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[220] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-5 border border-beige-200 dark:border-dark-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Edit profile</h3>
              <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700">
                <FiX size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-dark-900 rounded-lg mb-4">
              {[
                { id: "profile", label: "Profile" },
                { id: "password", label: "Password" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                    tab === t.id
                      ? "bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-leetcode-yellow to-yellow-500 flex items-center justify-center text-gray-900 text-3xl font-bold overflow-hidden border-4 border-white dark:border-dark-700 shadow-lg">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.[0]?.toUpperCase() || "U"
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-leetcode-yellow text-gray-900 flex items-center justify-center shadow-md hover:bg-yellow-500 disabled:opacity-50"
                      title="Change picture"
                    >
                      <FiCamera size={14} />
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatar}
                      className="hidden"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {uploading ? "Uploading…" : "Click camera to change (max 5 MB)"}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      minLength={2}
                      maxLength={80}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white dark:bg-dark-900 border border-beige-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Phone</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 …"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white dark:bg-dark-900 border border-beige-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 text-center">
                  Email: <span className="font-medium text-gray-500">{user?.email}</span> (cannot be changed)
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full flex items-center justify-center gap-2 bg-leetcode-yellow text-gray-900 py-2.5 rounded-lg font-medium text-sm hover:bg-yellow-500 disabled:opacity-50"
                >
                  <FiSave size={14} /> {savingProfile ? "Saving…" : "Save changes"}
                </button>
              </form>
            )}

            {tab === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Current password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="password"
                      value={pwData.current}
                      onChange={(e) => setPwData({ ...pwData, current: e.target.value })}
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white dark:bg-dark-900 border border-beige-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">New password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="password"
                      value={pwData.next}
                      onChange={(e) => setPwData({ ...pwData, next: e.target.value })}
                      required
                      minLength={8}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white dark:bg-dark-900 border border-beige-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Confirm new password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="password"
                      value={pwData.confirm}
                      onChange={(e) => setPwData({ ...pwData, confirm: e.target.value })}
                      required
                      minLength={8}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white dark:bg-dark-900 border border-beige-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-leetcode-yellow"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingPw}
                  className="w-full flex items-center justify-center gap-2 bg-leetcode-yellow text-gray-900 py-2.5 rounded-lg font-medium text-sm hover:bg-yellow-500 disabled:opacity-50"
                >
                  <FiSave size={14} /> {savingPw ? "Updating…" : "Change password"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}