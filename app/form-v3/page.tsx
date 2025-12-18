"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Wrench, 
  FileText, 
  GraduationCap, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Camera, 
  MapPin, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Building2,
  AlertCircle,
  UploadCloud,
  ArrowUpCircle,
  Clock,
  Settings,
  Activity,
  Server,
  Monitor
} from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

// --- Custom "Smart" Input Components to match Reference ---
// These mimic the dark "Dashboard Cards" look but for inputs.

const CustomSelectTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof SelectTrigger> & { icon?: React.ElementType, label?: string }>(
  ({ className, children, icon: Icon, label, ...props }, ref) => (
    <SelectTrigger 
      ref={ref}
      className={cn(
        "h-auto p-4 flex items-start gap-4 text-left border rounded-xl hover:bg-slate-50 transition-colors bg-white w-full", 
        className
      )}
      {...props}
    >
      <span className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 mt-0.5 flex items-center justify-center">
        {Icon ? <Icon className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
      </span>
      <span className="flex-1 min-w-0 flex flex-col gap-1 text-left">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">{label}</span>
        <span className="font-semibold text-slate-900 text-base block truncate">
          {children}
        </span>
      </span>
    </SelectTrigger>
  )
)
CustomSelectTrigger.displayName = "CustomSelectTrigger"


// --- Types & Schemas ---

const requestTypes = [
  {
    id: "support",
    title: "Technical Support",
    description: "Report issues with your security systems.",
    icon: Wrench,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "quote",
    title: "Request a Quote",
    description: "New equipment, installations, or upgrades.",
    icon: FileText,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "training",
    title: "Training",
    description: "Schedule training sessions for your team.",
    icon: GraduationCap,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "general",
    title: "General Inquiry",
    description: "Other questions or information.",
    icon: HelpCircle,
    color: "bg-orange-100 text-orange-600",
  },
] as const

const problemSchema = z.object({
  deviceType: z.string().min(1, "Device type is required"),
  location: z.string().optional(), 
  description: z.string().min(5, "Please describe the issue"),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  equipmentId: z.string().optional(),
})

const contactSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  companyName: z.string().min(2, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
})

const formSchema = z.object({
  requestType: z.string(),
  
  // Support specific (Global)
  title: z.string().optional(), 
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  maintenanceType: z.string().optional(),
  site: z.string().optional(),
  location: z.string().optional(),
  
  // Support specific (Detailed)
  problems: z.array(problemSchema).optional(),

  // Quote specific
  quoteDetails: z.string().optional(),
  
  // Training specific
  trainingTopic: z.string().optional(),
  attendeeCount: z.string().optional(),
  
  // General specific
  inquiryDetails: z.string().optional(),
  
  // Contact
  contact: contactSchema,
}).superRefine((data, ctx) => {
  if (data.requestType === "support") {
    if (!data.title || data.title.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Title is required (min 5 chars)",
        path: ["title"],
      })
    }
    if (!data.description || data.description.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Description is required (min 10 chars)",
        path: ["description"],
      })
    }
    if (!data.priority) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Priority is required",
        path: ["priority"],
      })
    }
    if (!data.site) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Site is required",
        path: ["site"],
      })
    }
    if (!data.maintenanceType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Type of maintenance is required",
          path: ["maintenanceType"],
        })
      }
  }
  if (data.requestType === "quote" && (!data.quoteDetails || data.quoteDetails.length < 10)) {
     ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please provide details about your quote request",
        path: ["quoteDetails"],
      })
  }
  if (data.requestType === "general" && (!data.inquiryDetails || data.inquiryDetails.length < 10)) {
     ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please provide details about your inquiry",
        path: ["inquiryDetails"],
      })
  }
})

type FormValues = z.infer<typeof formSchema>

// --- Main Component ---

export default function ServicePortalPage() {
  const [step, setStep] = React.useState<"type" | "details" | "contact" | "review" | "success">("type")
  const [direction, setDirection] = React.useState(0)
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requestType: "",
      problems: [], 
      contact: { fullName: "", companyName: "", email: "", phone: "" },
      priority: "medium",
    },
  })

  const { fields: problemFields, append: appendProblem, remove: removeProblem } = useFieldArray({
    control: form.control,
    name: "problems",
  })

  const selectedType = form.watch("requestType")
  
  const handleTypeSelect = (typeId: string) => {
    form.setValue("requestType", typeId)
    setDirection(1)
    setStep("details")
  }

  const nextStep = async () => {
    let isValid = false
    
    if (step === "details") {
      if (selectedType === "support") {
        isValid = await form.trigger(["title", "description", "priority", "site", "location", "problems", "maintenanceType"])
      } else if (selectedType === "quote") {
        isValid = await form.trigger("quoteDetails")
      } else if (selectedType === "training") {
        isValid = await form.trigger(["trainingTopic", "attendeeCount"])
      } else {
        isValid = await form.trigger("inquiryDetails")
      }
    } else if (step === "contact") {
      isValid = await form.trigger("contact")
    }

    if (isValid) {
      setDirection(1)
      setStep(prev => prev === "details" ? "contact" : "review")
    }
  }

  const prevStep = () => {
    setDirection(-1)
    setStep(prev => prev === "contact" ? "details" : prev === "review" ? "contact" : "type")
  }

  const onSubmit = async (data: FormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log("Form Submitted:", data)
    setStep("success")
    toast.success("Request submitted successfully!")
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">
              N
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Noxe Security</h1>
              <p className="text-sm text-slate-500">Service Portal</p>
            </div>
          </div>
          
          {step !== "type" && step !== "success" && (
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400">
              <span className={step === "details" ? "text-emerald-600 font-semibold" : ""}>Details</span>
              <ArrowRight className="h-4 w-4" />
              <span className={step === "contact" ? "text-emerald-600 font-semibold" : ""}>Contact</span>
              <ArrowRight className="h-4 w-4" />
              <span className={step === "review" ? "text-emerald-600 font-semibold" : ""}>Review</span>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <AnimatePresence mode="wait" custom={direction}>
              
              {/* STEP 1: REQUEST TYPE */}
              {step === "type" && (
                <motion.div
                  key="type"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-10 space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">How can we help you today?</h2>
                    <p className="text-slate-500 text-lg">Select the type of service you need.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requestTypes.map((type) => (
                      <Card 
                        key={type.id} 
                        className="cursor-pointer hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group border-2 border-transparent hover:bg-white"
                        onClick={() => handleTypeSelect(type.id)}
                      >
                        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                          <div className={`p-4 rounded-xl ${type.color} group-hover:scale-110 transition-transform shadow-sm`}>
                            <type.icon className="h-6 w-6" />
                          </div>
                          <div className="space-y-1.5 pt-1">
                            <CardTitle className="text-lg">{type.title}</CardTitle>
                            <CardDescription>{type.description}</CardDescription>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: DETAILS */}
              {step === "details" && (
                <motion.div
                  key="details"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                     <h2 className="text-2xl font-bold text-slate-900">
                       {requestTypes.find(t => t.id === selectedType)?.title} Details
                     </h2>
                     <Button variant="ghost" onClick={prevStep} className="hover:text-emerald-600">Change Type</Button>
                  </div>

                  {/* Support: Enhanced Layout */}
                  {selectedType === "support" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left Column: Details Card */}
                      <div className="lg:col-span-2 space-y-6">
                        <Card className="border-0 shadow-lg shadow-slate-200/50 overflow-hidden">
                           <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                           <CardHeader>
                             <div className="flex items-center justify-between mb-2">
                                <CardTitle className="text-lg">Request Description</CardTitle>
                                <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-rose-100">Mandatory</Badge>
                             </div>
                             <CardDescription>Please provide a clear title and detailed description of the issue.</CardDescription>
                           </CardHeader>
                           <CardContent className="space-y-6">
                              <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Title</Label>
                                    <FormControl>
                                      <Input 
                                        placeholder="e.g. Main Entrance Camera Offline" 
                                        className="text-lg font-medium border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-500 placeholder:font-normal" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Description</Label>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Describe the issue in detail..." 
                                        className="min-h-[150px] resize-y border-slate-200 bg-slate-50/50 focus:bg-white transition-colors" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                           </CardContent>
                        </Card>

                        {/* File Upload Area */}
                        <div className="pt-2">
                           <Label className="mb-3 block text-sm font-medium text-slate-700">Attachments</Label>
                           <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-emerald-50/30 hover:border-emerald-200 transition-all cursor-pointer group bg-white">
                              <div className="p-4 bg-slate-50 rounded-full mb-4 group-hover:bg-emerald-100 transition-colors">
                                 <UploadCloud className="h-8 w-8 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                              </div>
                              <p className="text-base font-medium text-slate-900 group-hover:text-emerald-700">Click to upload or drag and drop</p>
                              <p className="text-sm text-slate-500 mt-2">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                           </div>
                        </div>

                         {/* Problem List Section */}
                        <div className="pt-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Specific Equipment</h3>
                                <p className="text-sm text-slate-500">Add details for specific devices if known</p>
                            </div>
                            <Button 
                                type="button" 
                                onClick={() => appendProblem({ deviceType: "camera", location: "", description: "", urgency: "medium", equipmentId: "" })}
                                className="bg-slate-900 text-white hover:bg-slate-800"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Issue
                            </Button>
                          </div>
                          
                          {problemFields.length === 0 ? (
                             <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center text-slate-400 text-sm">
                                No specific equipment added. This request will be treated as a general issue.
                             </div>
                          ) : (
                             <div className="space-y-4">
                                {problemFields.map((field, index) => (
                                  <Collapsible key={field.id} defaultOpen={true}>
                                    <Card className="border shadow-sm group">
                                      <CardHeader className="py-3 px-4 bg-slate-50/50 border-b flex flex-row items-center justify-between space-y-0">
                                        <div className="flex items-center gap-3">
                                           <div className="h-8 w-8 rounded-lg bg-white border flex items-center justify-center shadow-sm text-slate-500">
                                             {index + 1}
                                           </div>
                                           <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                             {form.watch(`problems.${index}.deviceType`) || "New Item"}
                                           </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                           <Button 
                                              type="button" 
                                              variant="ghost" 
                                              size="icon" 
                                              className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                              onClick={() => removeProblem(index)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                           <CollapsibleTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-8 w-8">
                                               <ChevronDown className="h-4 w-4" />
                                             </Button>
                                           </CollapsibleTrigger>
                                        </div>
                                      </CardHeader>
                                      <CollapsibleContent>
                                        <CardContent className="p-4 grid gap-4 bg-white">
                                           {/* Problem Fields similar to Main Form but compact */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                              control={form.control}
                                              name={`problems.${index}.deviceType`}
                                              render={({ field }) => (
                                                <FormItem>
                                                  <Label className="text-xs uppercase text-slate-500 font-semibold">Type</Label>
                                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                      <SelectTrigger>
                                                        <SelectValue />
                                                      </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                      <SelectItem value="camera">Video Surveillance</SelectItem>
                                                      <SelectItem value="access">Access Control</SelectItem>
                                                      <SelectItem value="alarm">Intrusion Alarm</SelectItem>
                                                      <SelectItem value="intercom">Intercom</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </FormItem>
                                              )}
                                            />
                                            
                                            <FormField
                                              control={form.control}
                                              name={`problems.${index}.equipmentId`}
                                              render={({ field }) => (
                                                <FormItem>
                                                   <Label className="text-xs uppercase text-slate-500 font-semibold">ID</Label>
                                                  <FormControl>
                                                    <Input placeholder="CAM-A-101" {...field} />
                                                  </FormControl>
                                                </FormItem>
                                              )}
                                            />
                                          </div>
                                          <FormField
                                            control={form.control}
                                            name={`problems.${index}.description`}
                                            render={({ field }) => (
                                              <FormItem>
                                                <Label className="text-xs uppercase text-slate-500 font-semibold">Specific Issue</Label>
                                                <FormControl>
                                                  <Textarea placeholder="Details..." className="min-h-[60px]" {...field} />
                                                </FormControl>
                                              </FormItem>
                                            )}
                                          />
                                        </CardContent>
                                      </CollapsibleContent>
                                    </Card>
                                  </Collapsible>
                                ))}
                             </div>
                          )}
                        </div>

                      </div>

                      {/* Right Column: Key Info Grid */}
                      <div className="space-y-6">
                         <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-5 w-5 text-emerald-600" />
                            <h3 className="font-semibold text-slate-900">Key Attributes</h3>
                         </div>
                         <div className="grid grid-cols-1 gap-4">
                            {/* Priority Card Input */}
                            <FormField
                              control={form.control}
                              name="priority"
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <CustomSelectTrigger icon={ArrowUpCircle} label="Priority">
                                        <SelectValue placeholder="Select..." />
                                      </CustomSelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium (Average)</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage className="mt-1" />
                                </FormItem>
                              )}
                            />

                            {/* Maintenance Type Input */}
                             <FormField
                              control={form.control}
                              name="maintenanceType"
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <CustomSelectTrigger icon={Wrench} label="Maintenance Type">
                                        <SelectValue placeholder="Select..." />
                                      </CustomSelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="repair">Minor Repair</SelectItem>
                                      <SelectItem value="major_repair">Major Repair</SelectItem>
                                      <SelectItem value="preventive">Preventive</SelectItem>
                                      <SelectItem value="installation">Installation</SelectItem>
                                      <SelectItem value="software">Software</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage className="mt-1" />
                                </FormItem>
                              )}
                            />

                            {/* Site Input */}
                             <FormField
                              control={form.control}
                              name="site"
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <CustomSelectTrigger icon={Building2} label="Site">
                                        <SelectValue placeholder="Select..." />
                                      </CustomSelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="pavilion_b">Pavilion B</SelectItem>
                                      <SelectItem value="hq_main">HQ Main Building</SelectItem>
                                      <SelectItem value="warehouse">Warehouse A</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage className="mt-1" />
                                </FormItem>
                              )}
                            />

                             {/* Location Input */}
                             <FormField
                              control={form.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <div className="h-auto p-4 flex items-start gap-4 text-left border rounded-xl bg-white hover:bg-slate-50 transition-colors cursor-text" onClick={() => document.getElementById('location-input')?.focus()}>
                                     <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                                        <MapPin className="h-5 w-5" />
                                     </div>
                                     <div className="flex-1 min-w-0 space-y-1">
                                        <Label htmlFor="location-input" className="text-xs font-medium text-slate-500 uppercase tracking-wider block cursor-pointer">Location</Label>
                                        <FormControl>
                                           <Input 
                                              id="location-input"
                                              placeholder="e.g. Room 204" 
                                              className="h-6 p-0 border-0 shadow-none focus-visible:ring-0 font-semibold text-slate-900 text-base placeholder:font-normal placeholder:text-slate-400" 
                                              {...field} 
                                            />
                                        </FormControl>
                                     </div>
                                  </div>
                                  <FormMessage className="mt-1" />
                                </FormItem>
                              )}
                            />
                         </div>
                      </div>
                    </div>
                  )}

                  {/* Other Types (Simplified) */}
                  {selectedType === "quote" && (
                     <FormField
                       control={form.control}
                       name="quoteDetails"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Project Requirements</FormLabel>
                           <FormControl>
                             <Textarea 
                               placeholder="Tell us about your project requirements..." 
                               className="min-h-[200px]"
                               {...field} 
                             />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                  )}

                  {selectedType === "training" && (
                    <div className="grid gap-6">
                        {/* Training fields would go here */}
                    </div>
                  )}

                  {selectedType === "general" && (
                     <FormField
                       control={form.control}
                       name="inquiryDetails"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Inquiry Details</FormLabel>
                           <FormControl>
                             <Textarea 
                               placeholder="Type your message here..." 
                               className="min-h-[200px]"
                               {...field} 
                             />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                  )}

                  <div className="flex justify-between pt-8 border-t">
                    <Button type="button" variant="outline" onClick={prevStep} className="px-6">Back</Button>
                    <Button 
                        type="button" 
                        onClick={nextStep} 
                        className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                    >
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: CONTACT */}
              {step === "contact" && (
                 <motion.div
                  key="contact"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Contact Information</h2>
                    <p className="text-slate-500">Who should we contact about this request?</p>
                  </div>

                  <Card className="border-0 shadow-lg shadow-slate-200/50">
                    <CardContent className="pt-8 grid gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="contact.fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" className="h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="contact.companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Acme Corp" className="h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="contact.email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="john@example.com" type="email" className="h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="contact.phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 000-0000" className="h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                   <div className="flex justify-between pt-6">
                    <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                    <Button 
                        type="button" 
                        onClick={nextStep}
                        className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                    >
                        Review Request <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: REVIEW */}
              {step === "review" && (
                 <motion.div
                  key="review"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                   <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Review Request</h2>
                    <p className="text-slate-500">Please verify the details before submitting.</p>
                  </div>

                  <div className="grid gap-6">
                    {/* Summary Cards */}
                    {selectedType === "support" && (
                        <Card className="border-0 shadow-md">
                             <CardHeader className="pb-4 border-b bg-slate-50/50">
                                <CardTitle className="text-base font-medium">Request Summary</CardTitle>
                             </CardHeader>
                             <CardContent className="pt-6 space-y-6">
                                <div>
                                    <h4 className="font-semibold text-xl text-slate-900">{form.getValues("title")}</h4>
                                    <p className="text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed">{form.getValues("description")}</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                                    <div className="p-3 rounded-lg bg-slate-50 border">
                                        <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Priority</p>
                                        <Badge variant={form.getValues("priority") === "critical" ? "destructive" : "secondary"} className="capitalize">
                                            {form.getValues("priority")}
                                        </Badge>
                                    </div>
                                    <div className="p-3 rounded-lg bg-slate-50 border">
                                        <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Site</p>
                                        <p className="font-medium capitalize text-slate-900">{form.getValues("site")?.replace("_", " ")}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-slate-50 border col-span-2">
                                        <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Location</p>
                                        <p className="font-medium text-slate-900">{form.getValues("location") || "N/A"}</p>
                                    </div>
                                </div>
                             </CardContent>
                        </Card>
                    )}

                    {selectedType === "support" && form.getValues("problems") && form.getValues("problems")!.length > 0 && (
                        <Card className="border-0 shadow-md">
                             <CardHeader className="pb-4 border-b bg-slate-50/50">
                                <CardTitle className="text-base font-medium">Specific Equipment ({form.getValues("problems")?.length})</CardTitle>
                             </CardHeader>
                             <CardContent className="pt-6 space-y-4">
                                {form.getValues("problems")?.map((prob, idx) => (
                                   <div key={idx} className="flex gap-4 p-4 bg-white rounded-xl border shadow-sm">
                                      <div className="bg-slate-100 p-2.5 rounded-lg border h-fit text-slate-500">
                                          {prob.deviceType === "camera" && <Camera className="h-5 w-5" />}
                                          {prob.deviceType !== "camera" && <Wrench className="h-5 w-5" />}
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                              <span className="font-bold text-slate-900 capitalize">{prob.deviceType}</span>
                                              {prob.equipmentId && <Badge variant="outline" className="text-xs font-mono">{prob.equipmentId}</Badge>}
                                          </div>
                                          <p className="text-slate-600 text-sm leading-relaxed">{prob.description}</p>
                                      </div>
                                   </div>
                                ))}
                             </CardContent>
                        </Card>
                    )}

                    <Card className="border-0 shadow-md">
                      <CardHeader className="pb-4 border-b bg-slate-50/50">
                        <CardTitle className="text-base font-medium text-slate-500">Contact Details</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6 grid grid-cols-2 gap-6 text-sm">
                        <div>
                          <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Name</p>
                          <p className="font-medium text-base text-slate-900">{form.getValues("contact.fullName")}</p>
                        </div>
                         <div>
                          <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Company</p>
                          <p className="font-medium text-base text-slate-900">{form.getValues("contact.companyName")}</p>
                        </div>
                         <div>
                          <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Email</p>
                          <p className="font-medium text-base text-slate-900">{form.getValues("contact.email")}</p>
                        </div>
                         <div>
                          <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Phone</p>
                          <p className="font-medium text-base text-slate-900">{form.getValues("contact.phone")}</p>
                        </div>
                      </CardContent>
                    </Card>

                  </div>

                  <div className="flex justify-between pt-8">
                    <Button type="button" variant="outline" onClick={prevStep} className="px-6">Back</Button>
                    <Button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700 w-40 h-11 text-lg shadow-lg shadow-emerald-500/20"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>Submit <CheckCircle2 className="ml-2 h-5 w-5" /></>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: SUCCESS */}
               {step === "success" && (
                 <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 space-y-8 text-center"
                >
                  <div className="h-28 w-28 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-100">
                    <CheckCircle2 className="h-14 w-14" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-4xl font-bold text-slate-900">Request Received!</h2>
                    <p className="text-slate-500 max-w-md mx-auto text-lg leading-relaxed">
                      Thank you for contacting Noxe Security. Your request has been logged and a confirmation email has been sent.
                    </p>
                  </div>
                  
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 shadow-sm">
                    Request Reference: <span className="font-mono font-bold text-slate-900 ml-2 text-base">#REQ-{Math.floor(Math.random() * 10000)}</span>
                  </div>

                  <Button onClick={() => window.location.reload()} size="lg" className="bg-emerald-600 hover:bg-emerald-700">Submit Another Request</Button>
                </motion.div>
               )}

            </AnimatePresence>
          </form>
        </Form>
      </div>
    </div>
  )
}
