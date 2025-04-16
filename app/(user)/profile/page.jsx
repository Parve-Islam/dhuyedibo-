// app/profile/page.js
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
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
        setUserData(data.user);
        setIsLoading(false);
      } catch (error) {
        setError("Error loading profile data. Please try again.");
        setIsLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [session, status, router]);
  
  if (isLoading) {
    return <div className="container mx-auto p-6 text-center">Loading profile...</div>;
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }
  
  if (!userData) {
    return <div className="container mx-auto p-6 text-center">No profile data available.</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-center p-6 bg-gray-50">
          <div className="relative w-32 h-32 rounded-full overflow-hidden">
            {userData.profilePicture ? (
              <Image
                src={userData.profilePicture}
                alt={userData.name || "Profile picture"}
                fill
                style={{ objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = "/placeholder-avatar.png"; // Fallback image
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <h1 className="text-xl font-bold text-center mb-4">
            {userData.name || "No Name"}
          </h1>
          
          <div className="mb-4">
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {userData.email}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Role:</span> {userData.role}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Verified:</span> {userData.isVerified ? "Yes" : "No"}
            </p>
          </div>
          
          <div className="flex justify-center">
            <Link
              href="/profile/edit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}