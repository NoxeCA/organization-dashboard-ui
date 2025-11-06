"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { 
  Building2, 
  User, 
  Upload, 
  Check, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Shield
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Field of work options
const FIELD_OF_WORK_OPTIONS = [
  "Technology & Software Development",
  "Manufacturing",
  "Healthcare",
  "Finance & Banking",
  "Retail & E-commerce",
  "Construction",
  "Education",
  "Transportation & Logistics",
  "Hospitality",
  "Other"
];

// Membership tiers
const MEMBERSHIP_TIERS = [
  "Basic",
  "Premium Tier 1",
  "Premium Tier 2",
  "Premium Tier 3",
  "Enterprise"
];

export default function InternalOnboardingPage() {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Organization Information
  const [organizationName, setOrganizationName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [fieldOfWork, setFieldOfWork] = useState("");
  const [membershipTier, setMembershipTier] = useState("Basic");

  // Step 2: Primary Contact & Addresses
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  // Default Addresses
  const [createShippingAddress, setCreateShippingAddress] = useState(false);
  const [createBillingAddress, setCreateBillingAddress] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [shippingCountry, setShippingCountry] = useState("USA");
  
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [billingCountry, setBillingCountry] = useState("USA");

  // Step 3: First Site (Optional)
  const [createFirstSite, setCreateFirstSite] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [siteCity, setSiteCity] = useState("");
  const [siteState, setSiteState] = useState("");
  const [siteZip, setSiteZip] = useState("");
  const [siteCountry, setSiteCountry] = useState("USA");
  
  // Site addresses (required if creating a site)
  const [siteBillingSource, setSiteBillingSource] = useState<"default" | "custom" | "">("");
  const [siteShippingSource, setSiteShippingSource] = useState<"default" | "custom" | "">("");
  const [siteBillingAddress, setSiteBillingAddress] = useState("");
  const [siteBillingCity, setSiteBillingCity] = useState("");
  const [siteBillingState, setSiteBillingState] = useState("");
  const [siteBillingZip, setSiteBillingZip] = useState("");
  const [siteBillingCountry, setSiteBillingCountry] = useState("USA");
  const [siteShippingAddress, setSiteShippingAddress] = useState("");
  const [siteShippingCity, setSiteShippingCity] = useState("");
  const [siteShippingState, setSiteShippingState] = useState("");
  const [siteShippingZip, setSiteShippingZip] = useState("");
  const [siteShippingCountry, setSiteShippingCountry] = useState("USA");

  // Auto-generate logo from org name
  const generateLogo = () => {
    if (!logo && organizationName) {
      const words = organizationName.split(" ");
      if (words.length >= 2) {
        setLogo(`${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase());
      } else {
        setLogo(organizationName.substring(0, 2).toUpperCase());
      }
    }
  };

  // Auto-generate initials for profile picture
  const generateInitials = () => {
    if (firstName && lastName && !profilePicture) {
      setProfilePicture(`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase());
    }
  };

  const handleNext = async () => {
    if (step === 3) {
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSaving(false);
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    if (step === 3) {
      setStep(4);
    }
  };

  const isStep1Valid = organizationName;
  const isStep2Valid = firstName && lastName && email;
  
  // Step 3 validation: if creating a site, must have name and billing/shipping addresses
  const isStep3Valid = !createFirstSite || (
    siteName &&
    siteBillingSource && 
    siteShippingSource &&
    (siteBillingSource === "default" || (siteBillingAddress && siteBillingCity && siteBillingState && siteBillingZip)) &&
    (siteShippingSource === "default" || (siteShippingAddress && siteShippingCity && siteShippingState && siteShippingZip))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-lg p-8 shadow-xl border-slate-200 dark:border-slate-800">
            {/* Admin Badge */}
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="default" className="bg-blue-600">
                <Shield className="h-3 w-3 mr-1" />
                Internal Admin
              </Badge>
              <span className="text-sm text-muted-foreground">Creating New Organization</span>
            </div>

            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Step {step} of 4</span>
                <span className="text-sm text-muted-foreground">
                  {step === 1 && "Organization"}
                  {step === 2 && "Contact & Addresses"}
                  {step === 3 && "First Site"}
                  {step === 4 && "Complete"}
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-600"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(step / 4) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Organization Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Organization Details</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter the customer&apos;s organization information.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Organization Name */}
                      <div className="space-y-2">
                        <Label htmlFor="orgName">Organization Name *</Label>
                        <Input
                          id="orgName"
                          placeholder="Acme Corporation"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                        />
                      </div>

                      {/* Logo */}
                      <div className="space-y-2">
                        <Label>Logo (Optional)</Label>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-dashed border-slate-300 dark:border-slate-700">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 text-blue-600 font-bold text-xl">
                              {logo}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-2">
                              {logo ? "Logo auto-generated" : "Upload or generate logo"}
                            </p>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={generateLogo}
                              >
                                {logo ? "Regenerate" : "Generate"}
                              </Button>
                              {logo && (
                                <Button variant="ghost" size="sm" onClick={() => setLogo("")}>
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Website */}
                      <div className="space-y-2">
                        <Label htmlFor="website">Website (Optional)</Label>
                        <Input
                          id="website"
                          type="url"
                          placeholder="https://www.example.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                          id="description"
                          placeholder="Brief description of the organization"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>

                      {/* Field of Work */}
                      <div className="space-y-2">
                        <Label htmlFor="fieldOfWork">Field of Work (Optional)</Label>
                        <Select value={fieldOfWork} onValueChange={setFieldOfWork}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_OF_WORK_OPTIONS.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Membership Tier */}
                      <div className="space-y-2">
                        <Label htmlFor="membershipTier">Membership Tier *</Label>
                        <Select value={membershipTier} onValueChange={setMembershipTier}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MEMBERSHIP_TIERS.map((tier) => (
                              <SelectItem key={tier} value={tier}>
                                {tier}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      onClick={handleNext} 
                      className="w-full" 
                      size="lg"
                      disabled={!isStep1Valid}
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Primary Contact & Addresses */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Primary Contact & Addresses</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Set up the first user and default addresses.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Primary Contact Section */}
                      <div className="space-y-3 pb-4 border-b">
                        <p className="text-sm font-medium">Primary Contact *</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              placeholder="John"
                              value={firstName}
                              onChange={(e) => {
                                setFirstName(e.target.value);
                                generateInitials();
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              placeholder="Doe"
                              value={lastName}
                              onChange={(e) => {
                                setLastName(e.target.value);
                                generateInitials();
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            An invitation email will be sent to create their password
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="position">Position (Optional)</Label>
                          <Input
                            id="position"
                            placeholder="CEO, Manager, etc."
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Default Addresses Section */}
                      <div className="space-y-4 pt-2">
                        <p className="text-sm font-medium">Default Addresses (Optional)</p>
                        
                        {/* Shipping Address */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="createShipping"
                              checked={createShippingAddress}
                              onCheckedChange={(checked) => setCreateShippingAddress(checked as boolean)}
                            />
                            <Label htmlFor="createShipping" className="text-sm cursor-pointer">
                              Add default shipping address
                            </Label>
                          </div>

                          <AnimatePresence>
                            {createShippingAddress && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 pl-6 border-l-2 border-blue-500/20"
                              >
                                <Input
                                  placeholder="Street Address"
                                  value={shippingAddress}
                                  onChange={(e) => setShippingAddress(e.target.value)}
                                  className="text-sm"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    placeholder="City"
                                    value={shippingCity}
                                    onChange={(e) => setShippingCity(e.target.value)}
                                    className="text-sm"
                                  />
                                  <Input
                                    placeholder="State"
                                    value={shippingState}
                                    onChange={(e) => setShippingState(e.target.value)}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    placeholder="ZIP Code"
                                    value={shippingZip}
                                    onChange={(e) => setShippingZip(e.target.value)}
                                    className="text-sm"
                                  />
                                  <Input
                                    placeholder="Country"
                                    value={shippingCountry}
                                    onChange={(e) => setShippingCountry(e.target.value)}
                                    className="text-sm"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Billing Address */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="createBilling"
                              checked={createBillingAddress}
                              onCheckedChange={(checked) => setCreateBillingAddress(checked as boolean)}
                            />
                            <Label htmlFor="createBilling" className="text-sm cursor-pointer">
                              Add default billing address
                            </Label>
                          </div>

                          <AnimatePresence>
                            {createBillingAddress && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 pl-6 border-l-2 border-blue-500/20"
                              >
                                <Input
                                  placeholder="Street Address"
                                  value={billingAddress}
                                  onChange={(e) => setBillingAddress(e.target.value)}
                                  className="text-sm"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    placeholder="City"
                                    value={billingCity}
                                    onChange={(e) => setBillingCity(e.target.value)}
                                    className="text-sm"
                                  />
                                  <Input
                                    placeholder="State"
                                    value={billingState}
                                    onChange={(e) => setBillingState(e.target.value)}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    placeholder="ZIP Code"
                                    value={billingZip}
                                    onChange={(e) => setBillingZip(e.target.value)}
                                    className="text-sm"
                                  />
                                  <Input
                                    placeholder="Country"
                                    value={billingCountry}
                                    onChange={(e) => setBillingCountry(e.target.value)}
                                    className="text-sm"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={handleBack} 
                        variant="outline"
                        className="flex-1" 
                        size="lg"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button 
                        onClick={handleNext} 
                        className="flex-1" 
                        size="lg"
                        disabled={!isStep2Valid}
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: First Site (Optional) */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">First Site (Optional)</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add the first site location for this organization.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="createSite"
                          checked={createFirstSite}
                          onCheckedChange={(checked) => setCreateFirstSite(checked as boolean)}
                        />
                        <Label htmlFor="createSite" className="text-base font-medium cursor-pointer">
                          Create a site now
                        </Label>
                      </div>

                      <AnimatePresence>
                        {createFirstSite && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="siteName">Site Name *</Label>
                              <Input
                                id="siteName"
                                placeholder="Main Office, Warehouse, etc."
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Site Physical Address (Optional)</Label>
                              <Input
                                placeholder="Street Address"
                                value={siteAddress}
                                onChange={(e) => setSiteAddress(e.target.value)}
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <Input
                                  placeholder="City"
                                  value={siteCity}
                                  onChange={(e) => setSiteCity(e.target.value)}
                                />
                                <Input
                                  placeholder="State"
                                  value={siteState}
                                  onChange={(e) => setSiteState(e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <Input
                                  placeholder="ZIP Code"
                                  value={siteZip}
                                  onChange={(e) => setSiteZip(e.target.value)}
                                />
                                <Input
                                  placeholder="Country"
                                  value={siteCountry}
                                  onChange={(e) => setSiteCountry(e.target.value)}
                                />
                              </div>
                            </div>

                            {/* Site Billing Address */}
                            <div className="pt-4 border-t space-y-4">
                              <p className="text-sm font-medium">Site Billing Address *</p>
                              {createBillingAddress ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                                    <input
                                      type="radio"
                                      id="useDefaultBilling"
                                      name="billingSource"
                                      checked={siteBillingSource === "default"}
                                      onChange={() => setSiteBillingSource("default")}
                                      className="h-4 w-4"
                                    />
                                    <Label htmlFor="useDefaultBilling" className="cursor-pointer flex-1">
                                      Use default billing address
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {billingAddress}, {billingCity}, {billingState} {billingZip}
                                      </p>
                                    </Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      id="customBilling"
                                      name="billingSource"
                                      checked={siteBillingSource === "custom"}
                                      onChange={() => setSiteBillingSource("custom")}
                                      className="h-4 w-4"
                                    />
                                    <Label htmlFor="customBilling" className="cursor-pointer">
                                      Create custom billing address
                                    </Label>
                                  </div>
                                  {siteBillingSource === "custom" && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      className="pl-6 space-y-2"
                                    >
                                      <Input
                                        placeholder="Street Address *"
                                        value={siteBillingAddress}
                                        onChange={(e) => setSiteBillingAddress(e.target.value)}
                                      />
                                      <div className="grid grid-cols-2 gap-2">
                                        <Input
                                          placeholder="City *"
                                          value={siteBillingCity}
                                          onChange={(e) => setSiteBillingCity(e.target.value)}
                                        />
                                        <Input
                                          placeholder="State *"
                                          value={siteBillingState}
                                          onChange={(e) => setSiteBillingState(e.target.value)}
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <Input
                                          placeholder="ZIP *"
                                          value={siteBillingZip}
                                          onChange={(e) => setSiteBillingZip(e.target.value)}
                                        />
                                        <Input
                                          placeholder="Country"
                                          value={siteBillingCountry}
                                          onChange={(e) => setSiteBillingCountry(e.target.value)}
                                        />
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                  <p className="text-sm text-amber-800 dark:text-amber-200">
                                    No default billing address set. Create one now:
                                  </p>
                                  <Input
                                    placeholder="Street Address *"
                                    value={siteBillingAddress}
                                    onChange={(e) => {
                                      setSiteBillingAddress(e.target.value);
                                      setSiteBillingSource("custom");
                                    }}
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input
                                      placeholder="City *"
                                      value={siteBillingCity}
                                      onChange={(e) => setSiteBillingCity(e.target.value)}
                                    />
                                    <Input
                                      placeholder="State *"
                                      value={siteBillingState}
                                      onChange={(e) => setSiteBillingState(e.target.value)}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input
                                      placeholder="ZIP *"
                                      value={siteBillingZip}
                                      onChange={(e) => setSiteBillingZip(e.target.value)}
                                    />
                                    <Input
                                      placeholder="Country"
                                      value={siteBillingCountry}
                                      onChange={(e) => setSiteBillingCountry(e.target.value)}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Site Shipping Address */}
                            <div className="pt-4 border-t space-y-4">
                              <p className="text-sm font-medium">Site Shipping Address *</p>
                              {createShippingAddress ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                                    <input
                                      type="radio"
                                      id="useDefaultShipping"
                                      name="shippingSource"
                                      checked={siteShippingSource === "default"}
                                      onChange={() => setSiteShippingSource("default")}
                                      className="h-4 w-4"
                                    />
                                    <Label htmlFor="useDefaultShipping" className="cursor-pointer flex-1">
                                      Use default shipping address
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {shippingAddress}, {shippingCity}, {shippingState} {shippingZip}
                                      </p>
                                    </Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      id="customShipping"
                                      name="shippingSource"
                                      checked={siteShippingSource === "custom"}
                                      onChange={() => setSiteShippingSource("custom")}
                                      className="h-4 w-4"
                                    />
                                    <Label htmlFor="customShipping" className="cursor-pointer">
                                      Create custom shipping address
                                    </Label>
                                  </div>
                                  {siteShippingSource === "custom" && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      className="pl-6 space-y-2"
                                    >
                                      <Input
                                        placeholder="Street Address *"
                                        value={siteShippingAddress}
                                        onChange={(e) => setSiteShippingAddress(e.target.value)}
                                      />
                                      <div className="grid grid-cols-2 gap-2">
                                        <Input
                                          placeholder="City *"
                                          value={siteShippingCity}
                                          onChange={(e) => setSiteShippingCity(e.target.value)}
                                        />
                                        <Input
                                          placeholder="State *"
                                          value={siteShippingState}
                                          onChange={(e) => setSiteShippingState(e.target.value)}
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <Input
                                          placeholder="ZIP *"
                                          value={siteShippingZip}
                                          onChange={(e) => setSiteShippingZip(e.target.value)}
                                        />
                                        <Input
                                          placeholder="Country"
                                          value={siteShippingCountry}
                                          onChange={(e) => setSiteShippingCountry(e.target.value)}
                                        />
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                  <p className="text-sm text-amber-800 dark:text-amber-200">
                                    No default shipping address set. Create one now:
                                  </p>
                                  <Input
                                    placeholder="Street Address *"
                                    value={siteShippingAddress}
                                    onChange={(e) => {
                                      setSiteShippingAddress(e.target.value);
                                      setSiteShippingSource("custom");
                                    }}
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input
                                      placeholder="City *"
                                      value={siteShippingCity}
                                      onChange={(e) => setSiteShippingCity(e.target.value)}
                                    />
                                    <Input
                                      placeholder="State *"
                                      value={siteShippingState}
                                      onChange={(e) => setSiteShippingState(e.target.value)}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input
                                      placeholder="ZIP *"
                                      value={siteShippingZip}
                                      onChange={(e) => setSiteShippingZip(e.target.value)}
                                    />
                                    <Input
                                      placeholder="Country"
                                      value={siteShippingCountry}
                                      onChange={(e) => setSiteShippingCountry(e.target.value)}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {isSaving && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Spinner className="h-4 w-4" />
                          Creating organization...
                        </motion.div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={handleBack} 
                        variant="outline"
                        size="lg"
                        disabled={isSaving}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button 
                        onClick={handleSkip} 
                        variant="outline"
                        className="flex-1" 
                        size="lg"
                        disabled={isSaving}
                      >
                        Skip
                      </Button>
                      <Button 
                        onClick={handleNext} 
                        className="flex-1" 
                        size="lg"
                        disabled={isSaving || !isStep3Valid}
                      >
                        {isSaving ? (
                          <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Creating...
                          </>
                        ) : (
                          <>
                            Create Organization
                            <Check className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Completion */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="space-y-6 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center"
                    >
                      <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </motion.div>

                    <div>
                      <h2 className="text-3xl font-bold tracking-tight">Organization Created!</h2>
                      <p className="text-muted-foreground mt-2">
                        {organizationName} has been successfully created.
                      </p>
                    </div>

                    <Card className="p-6 border-2 border-blue-500/20 bg-blue-500/5">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">Organization Setup</p>
                            <p className="text-sm text-muted-foreground">{organizationName} • {membershipTier}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">Primary Contact</p>
                            <p className="text-sm text-muted-foreground">
                              {firstName} {lastName} • {email}
                            </p>
                          </div>
                        </div>
                        {(createShippingAddress || createBillingAddress) && (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium">Default Addresses</p>
                              <p className="text-sm text-muted-foreground">
                                {createShippingAddress && createBillingAddress ? "Shipping & Billing" : 
                                 createShippingAddress ? "Shipping" : "Billing"}
                              </p>
                            </div>
                          </div>
                        )}
                        {createFirstSite && siteName && (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium">First Site Created</p>
                              <p className="text-sm text-muted-foreground">{siteName}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Next Steps:</strong> An invitation email has been sent to {email} to complete their account setup and create a password.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={() => window.location.href = '/'}
                        variant="outline"
                        className="flex-1"
                        size="lg"
                      >
                        Back to Dashboard
                      </Button>
                      <Button 
                        onClick={() => window.location.reload()}
                        className="flex-1"
                        size="lg"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create Another
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Right Side - Live Preview */}
        <div className="hidden lg:flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`preview-${step}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              <Card className="p-8 shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-800/50">
                {step < 4 ? (
                  <>
                    <div className="text-center mb-6">
                      <Badge variant="secondary" className="mb-4">
                        Preview
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {step === 1 && "Organization profile"}
                        {step === 2 && "Contact & addresses"}
                        {step === 3 && "First site"}
                      </p>
                    </div>

                    <motion.div layout className="space-y-6">
                      {/* Organization Info */}
                      {step >= 1 && (
                        <motion.div layout className="flex items-center gap-4 pb-6 border-b">
                          <AnimatePresence mode="wait">
                            {logo ? (
                              <motion.div
                                key="logo-present"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <Avatar className="h-16 w-16">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-400 text-white font-bold text-xl">
                                    {logo}
                                  </AvatarFallback>
                                </Avatar>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="logo-absent"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700" />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex-1">
                            <p className="font-semibold text-lg">{organizationName || "Organization Name"}</p>
                            {(fieldOfWork || membershipTier) && (
                              <div className="flex items-center gap-2 mt-1">
                                {fieldOfWork && <p className="text-sm text-muted-foreground">{fieldOfWork}</p>}
                                {membershipTier && <Badge variant="outline" className="text-xs">{membershipTier}</Badge>}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}

                      <motion.div layout className="space-y-4">
                        {website && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm"
                          >
                            <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">Website</p>
                            <p className="text-blue-600 hover:underline">{website}</p>
                          </motion.div>
                        )}

                        {description && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm"
                          >
                            <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">About</p>
                            <p className="text-muted-foreground">{description}</p>
                          </motion.div>
                        )}

                        {step >= 2 && (firstName || email) && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm"
                          >
                            <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">
                              <User className="h-3 w-3 inline mr-1" />
                              Primary Contact
                            </p>
                            <p className="font-medium">{firstName} {lastName}</p>
                            {email && <p className="text-xs text-muted-foreground">{email}</p>}
                            {position && <p className="text-xs text-muted-foreground">{position}</p>}
                          </motion.div>
                        )}

                        {(createShippingAddress && shippingAddress) && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm"
                          >
                            <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              Shipping Address
                            </p>
                            <p>{shippingAddress}</p>
                            <p>{shippingCity}, {shippingState} {shippingZip}</p>
                          </motion.div>
                        )}

                        {(createBillingAddress && billingAddress) && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm"
                          >
                            <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              Billing Address
                            </p>
                            <p>{billingAddress}</p>
                            <p>{billingCity}, {billingState} {billingZip}</p>
                          </motion.div>
                        )}

                        {(createFirstSite && siteName) && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
                          >
                            <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">
                              <Building2 className="h-3 w-3 inline mr-1" />
                              First Site
                            </p>
                            <p className="font-medium">{siteName}</p>
                            {siteAddress && (
                              <>
                                <p className="text-xs text-muted-foreground mt-1">{siteAddress}</p>
                                {siteCity && <p className="text-xs text-muted-foreground">{siteCity}, {siteState} {siteZip}</p>}
                              </>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-950 dark:to-green-900 flex items-center justify-center mb-4">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-400 text-white font-bold text-2xl">
                          {logo || "ORG"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="font-bold text-xl mb-2">{organizationName}</h3>
                    <Badge variant="secondary" className="mb-4">{membershipTier}</Badge>
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                        <Check className="h-4 w-4" />
                        Organization Created
                      </p>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

