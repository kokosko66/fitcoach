"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AccountForm({ user, profile }) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fileInputRef = useRef(null);
  const router = useRouter();
  const supabase = createClient();

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File must be under 2MB");
      return;
    }

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Add cache buster
    const url = `${publicUrl}?t=${Date.now()}`;
    setAvatarUrl(url);

    await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", user.id);

    setUploading(false);
    router.refresh();
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    setChangingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    }

    setChangingPassword(false);
  }

  async function handleDeleteAccount() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    // Sign out and show message — actual deletion needs a server function
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const inputClasses =
    "w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-gray-400 dark:focus:border-gray-500 transition-all dark:bg-gray-800 dark:text-white dark:placeholder-gray-500";

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-bold dark:text-white mb-4">Profile</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-900 dark:bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-white dark:text-black text-lg font-bold">
                  {initials}
                </span>
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Change photo"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
              JPG, PNG. Max 2MB.
            </p>
          </div>
        </div>

        {/* Name + email form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 dark:text-white">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 dark:text-white">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className={`${inputClasses} opacity-60 cursor-not-allowed`}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 dark:text-white">
              Role
            </label>
            <input
              type="text"
              value={profile?.role === "coach" ? "Coach" : "Client"}
              disabled
              className={`${inputClasses} opacity-60 cursor-not-allowed capitalize`}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-sm"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            {saved && (
              <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                Saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Password section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-bold dark:text-white mb-4">
          Change password
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordError && (
            <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg font-medium">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-lg font-medium">
              Password updated successfully!
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1.5 dark:text-white">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 dark:text-white">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
              className={inputClasses}
            />
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-sm"
          >
            {changingPassword ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/50 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-red-600 dark:text-red-400 mb-2">
          Danger zone
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        {deleteConfirm ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDeleteAccount}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
            >
              Yes, delete my account
            </button>
            <button
              onClick={() => setDeleteConfirm(false)}
              className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-white"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="px-5 py-2.5 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            Delete account
          </button>
        )}
      </div>
    </div>
  );
}
