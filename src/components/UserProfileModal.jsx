// NON OMNIS MORIAR — UserProfileModal.jsx
// EX MACHINA — Fase 17: User Profile Hub + Avatar Upload
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function UserProfileModal({
  user,
  savedDecks,
  onClose,
  onProfileUpdate,
}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [discordHandle, setDiscordHandle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      const p = data || {};
      setProfile(p);
      setDisplayName(
        p.display_name || p.discord_username || user.email?.split("@")[0] || "",
      );
      setBio(p.bio || "");
      setDiscordHandle(p.discord_handle || p.discord_username || "");
      setAvatarUrl(
        p.avatar_url || p.discord_avatar || user?.discord_avatar || "",
      );
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── AVATAR UPLOAD ──────────────────────────────────────────────────────────
  const handleAvatarClick = () => {
    if (!editMode) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones client-side
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Solo se permiten imágenes JPG, PNG, WebP o GIF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("La imagen no puede superar 2MB.");
      return;
    }

    setError("");
    setUploadingAvatar(true);

    try {
      // Nombre único: userId/avatar.ext
      const ext = file.name.split(".").pop().toLowerCase();
      const path = `${user.id}/avatar.${ext}`;

      // Eliminar avatar anterior si existe
      await supabase.storage
        .from("avatars")
        .remove([
          `${user.id}/avatar.jpg`,
          `${user.id}/avatar.jpeg`,
          `${user.id}/avatar.png`,
          `${user.id}/avatar.webp`,
          `${user.id}/avatar.gif`,
        ]);

      // Upload
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      // URL pública
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}?t=${Date.now()}`;

      // Actualizar profile en DB
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setSuccessMsg("Avatar updated ✓");
      onProfileUpdate?.();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Avatar upload error:", err);
      setError("Error uploading avatar. Try again.");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  // ── SAVE PROFILE ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          discord_handle: discordHandle.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (error) throw error;

      setSuccessMsg("Profile updated ✓");
      setEditMode(false);
      await loadProfile();
      onProfileUpdate?.();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Error saving profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const displayUsername =
    profile?.display_name ||
    profile?.discord_username ||
    user?.email?.split("@")[0] ||
    "RUNNER";
  const streetCred = profile?.street_cred || 0;
  const totalDecks = savedDecks?.length || 0;

  const inputClass =
    "w-full bg-term-black border border-term-amber/40 text-term-amber rounded px-3 py-2 font-mono text-sm focus:border-term-amber focus:outline-none placeholder-term-amber/30";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-term-gray border-2 border-term-amber rounded-lg max-w-lg w-full relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="bg-term-black border-b border-term-amber/30 px-6 py-3 flex items-center justify-between">
            <span className="text-term-amber font-mono text-xs tracking-widest">
              ▓ RUNNER PROFILE
            </span>
            <button
              onClick={onClose}
              className="text-term-amber/50 hover:text-term-amber font-mono text-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <p className="text-term-green font-mono text-sm animate-pulse">
                [LOADING PROFILE DATA...]
              </p>
            </div>
          ) : (
            <div className="p-6">
              {/* Avatar + identity */}
              <div className="flex items-center gap-5 mb-6">
                {/* Avatar con overlay de upload en edit mode */}
                <div className="relative">
                  <button
                    onClick={handleAvatarClick}
                    disabled={!editMode || uploadingAvatar}
                    className={`relative block rounded-full ${editMode ? "cursor-pointer group" : "cursor-default"}`}
                    title={editMode ? "Click to change avatar" : ""}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full border-2 border-term-amber object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-2 border-term-amber bg-term-black flex items-center justify-center">
                        <span className="text-term-amber font-mono text-2xl font-bold">
                          {displayUsername[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Overlay en edit mode */}
                    {editMode && (
                      <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {uploadingAvatar ? (
                          <span className="text-white text-xs font-mono">
                            ...
                          </span>
                        ) : (
                          <span className="text-white text-xs font-mono text-center leading-tight px-1">
                            CHANGE
                          </span>
                        )}
                      </div>
                    )}
                  </button>

                  {/* Online dot */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-term-green border-2 border-term-gray"></div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-white font-bold font-mono text-xl">
                    {displayUsername}
                  </h2>
                  <p className="text-term-amber/60 font-mono text-xs">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-term-green font-mono text-xs border border-term-green/30 rounded px-2 py-0.5">
                      ★ {streetCred} STREET CRED
                    </span>
                    <span className="text-term-amber/60 font-mono text-xs">
                      {totalDecks} decks
                    </span>
                  </div>
                  {editMode && (
                    <p className="text-term-amber/40 font-mono text-xs mt-1">
                      ↑ click avatar to change (max 2MB)
                    </p>
                  )}
                </div>
              </div>

              {/* Bio / edit */}
              {!editMode ? (
                <div className="mb-5">
                  <p className="text-term-amber/50 font-mono text-xs mb-2 tracking-wider">
                    BIO
                  </p>
                  <p className="text-term-green/80 font-mono text-sm leading-relaxed">
                    {profile?.bio || (
                      <span className="text-term-amber/30 italic">
                        No bio set.
                      </span>
                    )}
                  </p>
                  {profile?.discord_handle && (
                    <div className="mt-3 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-[#5865F2]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                      </svg>
                      <span className="text-[#5865F2] font-mono text-sm">
                        {profile.discord_handle}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-5 space-y-3">
                  <div>
                    <label className="text-term-amber/70 font-mono text-xs mb-1 block tracking-wider">
                      DISPLAY NAME
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="How the community sees you"
                      className={inputClass}
                      maxLength={32}
                    />
                  </div>
                  <div>
                    <label className="text-term-amber/70 font-mono text-xs mb-1 block tracking-wider">
                      BIO
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell Night City who you are..."
                      className={inputClass + " resize-none h-20"}
                      maxLength={200}
                    />
                    <p className="text-term-amber/30 font-mono text-xs text-right mt-1">
                      {bio.length}/200
                    </p>
                  </div>
                  <div>
                    <label className="text-term-amber/70 font-mono text-xs mb-1 block tracking-wider">
                      DISCORD HANDLE
                    </label>
                    <input
                      type="text"
                      value={discordHandle}
                      onChange={(e) => setDiscordHandle(e.target.value)}
                      placeholder="@username"
                      className={inputClass}
                      maxLength={32}
                    />
                    <p className="text-term-amber/30 font-mono text-xs mt-1">
                      Shown on your public decks
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-red-400 font-mono text-xs mb-3 bg-red-400/10 border border-red-400/20 rounded p-2">
                  {error}
                </p>
              )}
              {successMsg && (
                <p className="text-term-green font-mono text-xs mb-3">
                  {successMsg}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {editMode ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-term-amber text-term-black py-2 font-mono font-bold text-sm rounded hover:bg-term-amber/80 transition-colors disabled:opacity-40"
                    >
                      {saving ? "[SAVING...]" : "[SAVE CHANGES]"}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setError("");
                      }}
                      className="px-4 py-2 border border-term-amber/40 text-term-amber/70 font-mono text-sm rounded hover:border-term-amber transition-colors"
                    >
                      CANCEL
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex-1 border border-term-amber text-term-amber py-2 font-mono font-bold text-sm rounded hover:bg-term-amber/10 transition-colors"
                  >
                    [EDIT PROFILE]
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
