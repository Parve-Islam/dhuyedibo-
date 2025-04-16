// app/profile/edit/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfileEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Fetch user profile data when component mounts
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }
    
    async function fetchUserProfile() {
      try {
        const response = await fetch("/api/user/profile");
        
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        
        const data = await response.json();
        setFormData({
          name: data.user.name || "",
        });
        if (data.user.profilePicture) {
          setPreviewUrl(data.user.profilePicture);
        }
        setIsLoading(false);
      } catch (error) {
        setError("Error loading profile data. Please try again.");
        setIsLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [session, status, router]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Basic validation
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
      setError("File must be a valid image (JPEG, PNG, or GIF)");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError("Image must be less than 5MB");
      return;
    }
    
    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(""); // Clear any previous errors
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      // First, handle image upload if there's a new image
      let profilePictureUrl = previewUrl;
      
      if (profileImage) {
        setUploadingImage(true);
        const imageFormData = new FormData();
        imageFormData.append("image", profileImage);
        
        const uploadResponse = await fetch("/api/upload/image", {
          method: "POST",
          body: imageFormData,
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || "Failed to upload image");
        }
        
        const imageData = await uploadResponse.json();
        profilePictureUrl = imageData.imageUrl;
        setUploadingImage(false);
      }
      
      // Then update the profile with all data including the image URL
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          profilePicture: profilePictureUrl,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      
      setSuccess("Profile updated successfully!");
      
      // Optional: Redirect after successful update
      // setTimeout(() => router.push("/profile"), 2000);
    } catch (error) {
      setError(error.message || "An error occurred while updating profile");
      setUploadingImage(false);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  if (isLoading) {
    return <div className="container mx-auto p-6 text-center">Loading profile...</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2 font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Profile Picture
          </label>
          
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 overflow-hidden rounded-full bg-gray-100">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Profile picture preview"
                  fill
                  style={{ objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = "/placeholder-avatar.png"; // Fallback image
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            
            <div>
              <input
                type="file"
                id="profileImage"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/jpeg, image/png, image/gif"
              />
              
              <button
                type="button"
                onClick={triggerFileInput}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
                disabled={uploadingImage}
              >
                {uploadingImage ? "Uploading..." : "Change Photo"}
              </button>
            </div>
          </div>
          
          <p className="mt-2 text-sm text-gray-500">
            Recommended: Square image, max 5MB (JPEG, PNG, GIF)
          </p>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            disabled={uploadingImage}
          >
            {uploadingImage ? "Uploading..." : "edit"}
          </button>
          
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
            disabled={uploadingImage}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}