"use client";

import { useEffect, useState, useRef } from "react";
import { getSiteSettings, updateSiteSettings, uploadLogo, type SiteSettings } from "@/app/actions/cms-settings";
import { Loader2, Save, Sparkles, Image, Menu, Type, Upload, X } from "lucide-react";

export default function BrandingSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  
  const completeBannerInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSiteSettings().then((data) => {
      setSettings(data);
    });
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setSuccess(false);
    setError(null);
    const res = await updateSiteSettings(settings);
    setSaving(false);
    if (!res.success) {
      setError(res.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  async function handleLogoUpload(type: 'complete-banner' | 'icon' | 'text', file: File) {
    setUploading(type);
    setError(null);
    const res = await uploadLogo(file);
    setUploading(null);
    
    if (!res.success) {
      setError(res.error || 'Failed to upload logo');
      return;
    }
    
    if (!settings) return;
    
    if (type === 'complete-banner') {
      setSettings({ ...settings, logo_complete_banner_url: res.url });
    } else if (type === 'icon') {
      setSettings({ ...settings, logo_icon_url: res.url });
    } else if (type === 'text') {
      setSettings({ ...settings, logo_text_url: res.url });
    }
  }

  if (!settings) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
          Branding & Logo Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Customize the header logo and general branding configurations of your platform.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300">
          🎉 Branding settings updated and live successfully!
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
          ❌ Failed to update settings: {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Logo Upload Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-md font-semibold text-gray-900">Logo Upload</h3>
          <p className="text-xs text-gray-500">Upload custom logos for each display style. If not uploaded, default logos will be used.</p>
          
          <div className="space-y-4">
            {/* Complete Banner Logo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Complete Banner Logo</label>
              <div className="flex items-center gap-3">
                <input
                  ref={completeBannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload('complete-banner', file);
                  }}
                />
                <button
                  onClick={() => completeBannerInputRef.current?.click()}
                  disabled={uploading === 'complete-banner'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
                >
                  {uploading === 'complete-banner' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading === 'complete-banner' ? 'Uploading...' : 'Upload'}
                </button>
                {settings.logo_complete_banner_url && (
                  <button
                    onClick={() => setSettings({ ...settings, logo_complete_banner_url: undefined })}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    title="Remove custom logo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {settings.logo_complete_banner_url && (
                <div className="mt-2">
                  <img src={settings.logo_complete_banner_url} alt="Complete Banner Logo" className="h-12 w-auto object-contain border rounded" />
                </div>
              )}
            </div>

            {/* Icon Logo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Icon Logo</label>
              <div className="flex items-center gap-3">
                <input
                  ref={iconInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload('icon', file);
                  }}
                />
                <button
                  onClick={() => iconInputRef.current?.click()}
                  disabled={uploading === 'icon'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
                >
                  {uploading === 'icon' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading === 'icon' ? 'Uploading...' : 'Upload'}
                </button>
                {settings.logo_icon_url && (
                  <button
                    onClick={() => setSettings({ ...settings, logo_icon_url: undefined })}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    title="Remove custom logo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {settings.logo_icon_url && (
                <div className="mt-2">
                  <img src={settings.logo_icon_url} alt="Icon Logo" className="h-12 w-12 object-contain border rounded" />
                </div>
              )}
            </div>

            {/* Text Logo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Text Logo</label>
              <div className="flex items-center gap-3">
                <input
                  ref={textInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload('text', file);
                  }}
                />
                <button
                  onClick={() => textInputRef.current?.click()}
                  disabled={uploading === 'text'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
                >
                  {uploading === 'text' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading === 'text' ? 'Uploading...' : 'Upload'}
                </button>
                {settings.logo_text_url && (
                  <button
                    onClick={() => setSettings({ ...settings, logo_text_url: undefined })}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    title="Remove custom logo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {settings.logo_text_url && (
                <div className="mt-2">
                  <img src={settings.logo_text_url} alt="Text Logo" className="h-12 w-auto object-contain border rounded" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Style Selection */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-md font-semibold text-gray-900">Header Logo Layout</h3>
          <p className="text-xs text-gray-500">Choose how the brand logo displays in your public header.</p>
          
          <div className="space-y-3">
            {/* Complete Banner Option */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              settings.logo_style === "complete-banner" 
                ? "border-purple-600 bg-purple-50/30" 
                : "border-gray-200 hover:bg-gray-50"
            }`}>
              <input
                type="radio"
                name="logo_style"
                value="complete-banner"
                checked={settings.logo_style === "complete-banner"}
                onChange={() => setSettings({ ...settings, logo_style: "complete-banner" })}
                className="mt-1 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <Image className="h-4 w-4 text-purple-600" />
                  Option A: Complete Shiny Logo Banner
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Uses the complete transparent-background PNG banner logo with both graphic and text included. Recommended for modern screens!
                </p>
              </div>
            </label>

            {/* Icon and Text Option */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              settings.logo_style === "icon-and-text" 
                ? "border-purple-600 bg-purple-50/30" 
                : "border-gray-200 hover:bg-gray-50"
            }`}>
              <input
                type="radio"
                name="logo_style"
                value="icon-and-text"
                checked={settings.logo_style === "icon-and-text"}
                onChange={() => setSettings({ ...settings, logo_style: "icon-and-text" })}
                className="mt-1 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <Menu className="h-4 w-4 text-purple-600" />
                  Option B: Graphic Icon + Gold Text
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Displays the standalone graphical modular-house logo icon inside a rounded white container alongside separate gold brand text.
                </p>
              </div>
            </label>

            {/* Text Only Option */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              settings.logo_style === "text-only" 
                ? "border-purple-600 bg-purple-50/30" 
                : "border-gray-200 hover:bg-gray-50"
            }`}>
              <input
                type="radio"
                name="logo_style"
                value="text-only"
                checked={settings.logo_style === "text-only"}
                onChange={() => setSettings({ ...settings, logo_style: "text-only" })}
                className="mt-1 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <Type className="h-4 w-4 text-purple-600" />
                  Option C: Gold Brand Text Only
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Reverts the header to display the classic gold-gradient "Apex Modular Construction" SVG text logo by itself.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Height & Size Options */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-900">Logo Height & Size</h3>
            <p className="text-xs text-gray-500">Adjust the vertical scale of the header logo to fit perfectly.</p>
            
            <div className="grid grid-cols-3 gap-3">
              {(["h-12", "h-16", "h-20"] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setSettings({ ...settings, logo_height: h })}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    settings.logo_height === h
                      ? "border-purple-600 bg-purple-50/50 text-purple-700 shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {h === "h-12" ? "Small (48px)" : h === "h-16" ? "Medium (64px)" : "Large (80px)"}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Preview */}
          <div className="rounded-xl bg-gray-950 p-6 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Real-time Header Preview</p>
            <div className="w-full bg-[#4B1D8F] h-24 rounded-lg flex items-center px-6 border border-purple-800/40 relative overflow-hidden">
              {settings.logo_style === "complete-banner" && (
                <div className={`flex items-center bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-xl shadow-lg border border-white/20 overflow-hidden transition-all ${
                  settings.logo_height === "h-12" ? "h-12" : settings.logo_height === "h-16" ? "h-16" : "h-20"
                }`}>
                  <img 
                    src={settings.logo_complete_banner_url || "/logo.png"} 
                    alt="Apex Logo Complete" 
                    className="h-full w-auto object-contain" 
                  />
                </div>
              )}

              {settings.logo_style === "icon-and-text" && (
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center rounded-xl bg-white/95 backdrop-blur-sm p-0.5 shadow-lg border border-white/20 overflow-hidden transition-all ${
                    settings.logo_height === "h-12" ? "h-12 w-12" : settings.logo_height === "h-16" ? "h-16 w-16" : "h-20 w-20"
                  }`}>
                    <img 
                      src={settings.logo_icon_url || "/logo.jpg"} 
                      alt="Apex Icon" 
                      className="h-full w-full object-contain" 
                    />
                  </div>
                  <img 
                    src={settings.logo_text_url || "/logo.svg"} 
                    alt="Apex Text" 
                    className="h-10 w-auto" 
                  />
                </div>
              )}

              {settings.logo_style === "text-only" && (
                <div className="bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-xl shadow-lg border border-white/20">
                  <img 
                    src={settings.logo_text_url || "/logo.svg"} 
                    alt="Apex Text Only" 
                    className="h-12 w-auto" 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-6 py-3 shadow-md transition-all shrink-0 cursor-pointer"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {saving ? "Saving Changes…" : "Save Configurations"}
        </button>
      </div>
    </div>
  );
}
