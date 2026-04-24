"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Building, Edit2, Save, X, CheckCircle, Clock } from "lucide-react";
import { LuxuryButton } from "@/components/seller/LuxuryButton";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

export default function SellerProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    businessName: "Your Business Name",
    email: "business@example.com",
    phone: "+1 234 567 8900",
    address: "123 Business St, City, State 12345",
    description: "Your business description goes here...",
  });
  const [editProfile, setEditProfile] = useState(profile);

  const handleSave = () => { setProfile(editProfile); setIsEditing(false); };
  const handleCancel = () => { setEditProfile(profile); setIsEditing(false); };

  const inputClass =
    "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] transition-shadow";

  const fields = [
    { icon: Building, label: "Business Name", key: "businessName" as const, type: "text" },
    { icon: Mail, label: "Email Address", key: "email" as const, type: "email" },
    { icon: Phone, label: "Phone Number", key: "phone" as const, type: "tel" },
  ];

  const verifications = [
    { label: "Email", status: "verified" },
    { label: "Phone", status: "verified" },
    { label: "Business", status: "verified" },
    { label: "Address", status: "pending" },
  ];

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div
          className="h-20 relative"
          style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #3a1570 100%)` }}
        >
          <span className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-yellow-400 rounded-tl-md" />
          <span className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-yellow-400 rounded-tr-md" />
        </div>
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div
              className="h-16 w-16 rounded-2xl border-4 border-white flex items-center justify-center shadow-md"
              style={{ backgroundColor: PURPLE }}
            >
              <Building className="h-7 w-7 text-white" />
            </div>
            {!isEditing ? (
              <LuxuryButton size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4" /> Edit Profile
              </LuxuryButton>
            ) : (
              <div className="flex gap-2">
                <LuxuryButton size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4" /> Save
                </LuxuryButton>
                <LuxuryButton size="sm" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4" /> Cancel
                </LuxuryButton>
              </div>
            )}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{profile.businessName}</h2>
          <p className="text-sm text-gray-500">{profile.email}</p>
        </div>
      </div>

      {/* Business info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide" style={{ color: PURPLE }}>
          Business Information
        </h3>
        {fields.map(({ icon: Icon, label, key, type }) => (
          <div key={key} className="flex items-start gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5"
              style={{ backgroundColor: "#EDE9F6" }}
            >
              <Icon className="h-4 w-4" style={{ color: PURPLE }} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
              {isEditing ? (
                <input
                  type={type}
                  value={editProfile[key]}
                  onChange={(e) => setEditProfile({ ...editProfile, [key]: e.target.value })}
                  className={inputClass}
                />
              ) : (
                <p className="text-sm text-gray-900">{profile[key]}</p>
              )}
            </div>
          </div>
        ))}

        {/* Address */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5" style={{ backgroundColor: "#EDE9F6" }}>
            <MapPin className="h-4 w-4" style={{ color: PURPLE }} />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Business Address</label>
            {isEditing ? (
              <textarea
                value={editProfile.address}
                onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            ) : (
              <p className="text-sm text-gray-900">{profile.address}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5" style={{ backgroundColor: "#EDE9F6" }}>
            <User className="h-4 w-4" style={{ color: PURPLE }} />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Business Description</label>
            {isEditing ? (
              <textarea
                value={editProfile.description}
                onChange={(e) => setEditProfile({ ...editProfile, description: e.target.value })}
                rows={4}
                className={`${inputClass} resize-none`}
              />
            ) : (
              <p className="text-sm text-gray-900">{profile.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-sm uppercase tracking-wide mb-4" style={{ color: PURPLE }}>
          Verification Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {verifications.map(({ label, status }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border text-center"
              style={{ borderColor: status === "verified" ? "#bbf7d0" : "#fde68a", backgroundColor: status === "verified" ? "#f0fdf4" : "#fefce8" }}
            >
              {status === "verified" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-600" />
              )}
              <p className="text-xs font-semibold text-gray-700">{label}</p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {status === "verified" ? "Verified" : "Pending"}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl text-sm" style={{ backgroundColor: "#EDE9F6", color: PURPLE }}>
          Complete all verifications to unlock premium features and increase buyer trust.
        </div>
      </div>
    </div>
  );
}
