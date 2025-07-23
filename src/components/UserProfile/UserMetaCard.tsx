import { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { getProfile, updateProfileWithImage } from "../../services/profileServices";
import { toast } from "react-toastify";

interface User {
  fullName: string;
  avatar: string | null;
}

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [user, setUser] = useState<User | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        console.log("Profile fetched:", profile); // Debug log
        setUser(profile);
      } catch (err: any) {
        console.error("Profile fetch error:", err.message); // Debug log
        setError(err.message);
        toast.error(err.message, { position: "top-right", autoClose: 3000, theme: "colored" });
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        return;
      }
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      if (!["jpg", "jpeg", "png"].includes(fileExt || "")) {
        toast.error("Only JPG, JPEG, and PNG files are allowed", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        return;
      }
      setAvatarFile(file);
    } else {
      setAvatarFile(null);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await updateProfileWithImage(user?.fullName || "", avatarFile);
      console.log("Profile updated:", updatedUser); // Debug log
      setUser(updatedUser);
      setAvatarFile(null);
      setAvatarError(false);
      toast.success("Profile updated successfully!", { position: "top-right", autoClose: 3000, theme: "colored" });
      closeModal();
    } catch (err: any) {
      console.error("Profile update error:", err.message); // Debug log
      setError(err.message);
      toast.error(err.message, { position: "top-right", autoClose: 3000, theme: "colored" });
    } finally {
      setLoading(false);
    }
  };

  // Generate initials from fullName
  const getInitials = (fullName: string) => {
    const [first, last] = fullName.split(" ");
    return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();
  };

  if (!user) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        {error ? (
          <div className="mb-4 p-3 text-red-800 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      {error && (
        <div className="mb-4 p-3 text-red-800 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center">
            {user.avatar && !avatarError ? (
              <img
                src={user.avatar}
                alt="user"
                className="w-full h-full object-cover"
                onError={() => {
                  console.error("Failed to load avatar:", user.avatar); // Debug log
                  setAvatarError(true);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-xl font-semibold">
                {getInitials(user.fullName)}
              </div>
            )}
          </div>
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {user.fullName}
            </h4>
          </div>
        </div>
        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Profile
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your avatar to keep your profile up-to-date.
            </p>
          </div>
          {error && (
            <div className="mb-4 p-3 text-red-800 bg-red-100 border border-red-400 rounded">
              {error}
            </div>
          )}
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Profile Information
                </h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Avatar Image</Label>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}