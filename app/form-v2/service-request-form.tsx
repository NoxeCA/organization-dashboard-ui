"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  requestTypes,
  requestTypesByCategory,
  RequestTypeConfig,
  FormField,
  ProblemEntry,
  equipmentTypeOptions,
  equipmentProblemOptions,
} from "./form-config";
import { ProblemListValue } from "./problem-list";
import { DynamicField } from "./dynamic-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Headphones,
  Wrench,
  Shield,
  Calendar,
  Settings,
  FileText,
  Code,
  Package,
  GraduationCap,
  ClipboardCheck,
  Palette,
  HelpCircle,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  ArrowLeft,
  Send,
  Check,
  Loader2,
  ListTodo,
  Search,
  Sparkles,
  Zap,
  PanelRightOpen,
  X,
  Info,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from "lucide-react";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Headphones,
  Wrench,
  Shield,
  Calendar,
  Settings,
  FileText,
  Code,
  Package,
  GraduationCap,
  ClipboardCheck,
  Palette,
  HelpCircle,
  RefreshCw,
  MoreHorizontal,
};

// Category colors with gradients
const categoryConfig: Record<string, { color: string; gradient: string; icon: React.ComponentType<{ className?: string }> }> = {
  support: {
    color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    gradient: "from-blue-500/20 to-blue-600/5",
    icon: Wrench,
  },
  quote: {
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    gradient: "from-emerald-500/20 to-emerald-600/5",
    icon: FileText,
  },
  training: {
    color: "text-purple-600 bg-purple-500/10 border-purple-500/20",
    gradient: "from-purple-500/20 to-purple-600/5",
    icon: GraduationCap,
  },
  other: {
    color: "text-orange-600 bg-orange-500/10 border-orange-500/20",
    gradient: "from-orange-500/20 to-orange-600/5",
    icon: HelpCircle,
  },
};

type FormStep = "select-type" | "fill-form" | "review" | "success";

interface FormData {
  requestType: string;
  fields: Record<string, unknown>;
}

// Step configuration
const steps = [
  { key: "select-type", label: "Type", shortLabel: "1" },
  { key: "fill-form", label: "Détails", shortLabel: "2" },
  { key: "review", label: "Confirmation", shortLabel: "3" },
] as const;

export function ServiceRequestForm() {
  const [step, setStep] = useState<FormStep>("select-type");
  const [selectedType, setSelectedType] = useState<RequestTypeConfig | null>(null);
  const [formData, setFormData] = useState<FormData>({
    requestType: "",
    fields: {},
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [animatingProgress, setAnimatingProgress] = useState(0);

  // Calculate progress
  const currentStepIndex = steps.findIndex((s) => s.key === step);
  const progress = step === "success" ? 100 : ((currentStepIndex + 1) / steps.length) * 100;

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatingProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (step === "select-type") {
          setCommandOpen((open) => !open);
        }
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [step]);

  // Get the selected request type configuration
  const currentConfig = useMemo(() => {
    return requestTypes.find((t) => t.id === formData.requestType);
  }, [formData.requestType]);

  // Calculate form completion percentage
  const formCompletion = useMemo(() => {
    if (!currentConfig) return 0;
    const requiredFields = currentConfig.fields.filter((f) => f.required);
    const filledFields = requiredFields.filter((f) => {
      const value = formData.fields[f.id];
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (f.type === "problem-list") {
        const problemData = value as ProblemListValue;
        return problemData?.globalTitle && problemData?.globalDescription;
      }
      return true;
    });
    return Math.round((filledFields.length / requiredFields.length) * 100);
  }, [currentConfig, formData.fields]);

  // Handle request type selection
  const handleSelectType = useCallback((type: RequestTypeConfig) => {
    setSelectedType(type);
    setFormData({
      requestType: type.id,
      fields: {},
    });
    setErrors({});
    setStep("fill-form");
    setCommandOpen(false);
  }, []);

  // Handle field change
  const handleFieldChange = useCallback((fieldId: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldId]: value,
      },
    }));
    setErrors((prev) => {
      if (prev[fieldId]) {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentConfig) return false;

    currentConfig.fields.forEach((field) => {
      const value = formData.fields[field.id];

      if (field.required) {
        if (value === undefined || value === null || value === "") {
          newErrors[field.id] = "Ce champ est requis";
        } else if (Array.isArray(value) && value.length === 0) {
          newErrors[field.id] = "Veuillez sélectionner au moins une option";
        }
      }

      // Validate problem-list fields
      if (field.type === "problem-list" && field.required) {
        const problemData = value as ProblemListValue | undefined;

        if (!problemData?.globalTitle?.trim()) {
          newErrors[field.id] = "Le titre de la demande est requis";
        } else if (!problemData?.globalDescription?.trim()) {
          newErrors[field.id] = "La description du problème est requise";
        } else if (problemData.mode === "detailed") {
          const problems = problemData.problems || [];
          if (problems.length === 0) {
            newErrors[field.id] = "Ajoutez au moins un équipement en mode détaillé";
          } else {
            const incompleteProblems = problems.filter(
              (p) => !p.equipmentType || !p.equipmentProblem
            );
            if (incompleteProblems.length > 0) {
              newErrors[field.id] = `${incompleteProblems.length} équipement(s) incomplet(s)`;
            }
          }
        }
      }

      if (value && field.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value as string)) {
          newErrors[field.id] = "Adresse email invalide";
        }
      }

      if (value && field.minLength && (value as string).length < field.minLength) {
        newErrors[field.id] = `Minimum ${field.minLength} caractères`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentConfig, formData.fields]);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;
    setStep("review");
  }, [validateForm]);

  // Handle final submission
  const handleFinalSubmit = useCallback(async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setStep("success");
  }, []);

  // Reset form
  const handleReset = useCallback(() => {
    setStep("select-type");
    setSelectedType(null);
    setFormData({ requestType: "", fields: {} });
    setErrors({});
    setAnimatingProgress(0);
  }, []);

  // Go back
  const handleBack = useCallback(() => {
    if (step === "fill-form") {
      setStep("select-type");
    } else if (step === "review") {
      setStep("fill-form");
    }
  }, [step]);

  // Get task count
  const getTaskCount = useCallback((): number => {
    const problemsField = currentConfig?.fields.find((f) => f.type === "problem-list");
    if (problemsField) {
      const problemData = formData.fields[problemsField.id] as ProblemListValue | undefined;
      if (problemData?.mode === "detailed") {
        return problemData.problems?.length || 0;
      }
      return 1;
    }
    return 1;
  }, [currentConfig, formData.fields]);

  // Render command palette type selector
  const renderCommandSelector = () => {
    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Nouvelle demande</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sélectionnez le type de demande ou utilisez la recherche pour trouver rapidement ce dont vous avez besoin.
          </p>
        </div>

        {/* Search Trigger */}
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => setCommandOpen(true)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-dashed",
              "bg-gradient-to-r from-muted/50 to-muted/30",
              "hover:border-primary/50 hover:bg-muted/60 transition-all duration-200",
              "group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
          >
            <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-muted-foreground group-hover:text-foreground transition-colors flex-1 text-left">
              Rechercher un type de demande...
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-background border rounded text-xs text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Category Quick Access */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(requestTypesByCategory).map(([categoryKey, category]) => {
            const config = categoryConfig[categoryKey];
            const CategoryIcon = config.icon;

            return (
              <button
                key={categoryKey}
                onClick={() => setCommandOpen(true)}
                className={cn(
                  "group relative p-6 rounded-2xl border text-left transition-all duration-300",
                  "hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "bg-gradient-to-br",
                  config.gradient
                )}
              >
                <div className={cn("p-3 rounded-xl border w-fit mb-4", config.color)}>
                  <CategoryIcon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-1">{category.label}</h3>
                <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {category.types.length} options
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Popular Options */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Demandes fréquentes
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {requestTypes.slice(0, 6).map((type) => {
              const TypeIcon = iconMap[type.icon] || HelpCircle;
              const config = categoryConfig[type.category];

              return (
                <button
                  key={type.id}
                  onClick={() => handleSelectType(type)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border text-left",
                    "hover:bg-accent hover:border-primary/30 transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "group"
                  )}
                >
                  <div className={cn("p-2 rounded-lg border shrink-0", config.color)}>
                    <TypeIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {type.label}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {requestTypesByCategory[type.category].label}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Command Dialog */}
        <Drawer open={commandOpen} onOpenChange={setCommandOpen}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="sr-only">
              <DrawerTitle>Sélectionner un type de demande</DrawerTitle>
              <DrawerDescription>Recherchez ou parcourez les types de demandes disponibles</DrawerDescription>
            </DrawerHeader>
            <Command className="rounded-t-xl border-0">
              <CommandInput placeholder="Rechercher une demande..." className="h-14 text-lg" />
              <CommandList className="max-h-[60vh]">
                <CommandEmpty>
                  <div className="py-8 text-center">
                    <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun résultat trouvé</p>
                  </div>
                </CommandEmpty>
                {Object.entries(requestTypesByCategory).map(([categoryKey, category], index) => {
                  const config = categoryConfig[categoryKey];
                  const CategoryIcon = config.icon;

                  return (
                    <div key={categoryKey}>
                      {index > 0 && <CommandSeparator />}
                      <CommandGroup
                        heading={
                          <div className="flex items-center gap-2 py-1">
                            <CategoryIcon className={cn("w-4 h-4", config.color.split(" ")[0])} />
                            <span>{category.label}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {category.types.length}
                            </Badge>
                          </div>
                        }
                      >
                        {category.types.map((type) => {
                          const TypeIcon = iconMap[type.icon] || HelpCircle;
                          return (
                            <CommandItem
                              key={type.id}
                              value={`${type.label} ${type.description} ${category.label}`}
                              onSelect={() => handleSelectType(type)}
                              className="py-3 px-4 cursor-pointer"
                            >
                              <div className={cn("p-2 rounded-lg border mr-3", config.color)}>
                                <TypeIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{type.label}</div>
                                <div className="text-sm text-muted-foreground">{type.description}</div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </div>
                  );
                })}
              </CommandList>
            </Command>
          </DrawerContent>
        </Drawer>
      </div>
    );
  };

  // Helper to determine if field should be full width
  const isFullWidthField = (field: FormField) => {
    return (
      field.type === "textarea" ||
      field.type === "problem-list" ||
      field.type === "file" ||
      (field.type === "multiselect" && (field.options?.length || 0) > 4)
    );
  };

  // Group fields for smart layout
  const getFieldGroups = (fields: FormField[]) => {
    const groups: FormField[][] = [];
    let currentGroup: FormField[] = [];

    fields.forEach((field) => {
      if (isFullWidthField(field)) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
          currentGroup = [];
        }
        groups.push([field]);
      } else {
        currentGroup.push(field);
        if (currentGroup.length === 2) {
          groups.push(currentGroup);
          currentGroup = [];
        }
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  // Render form fields
  const renderFormFields = () => {
    if (!currentConfig) return null;

    const TypeIcon = iconMap[currentConfig.icon] || HelpCircle;
    const fieldGroups = getFieldGroups(currentConfig.fields);
    const config = categoryConfig[currentConfig.category];

    return (
      <div className="space-y-6">
        {/* Header with Type Info */}
        <div className="flex items-start gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleBack}
                  className="p-2 hover:bg-accent rounded-xl transition-colors shrink-0 mt-1"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Retour à la sélection</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("p-2.5 rounded-xl border", config.color)}>
                <TypeIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{currentConfig.label}</h2>
                <p className="text-sm text-muted-foreground">{currentConfig.description}</p>
              </div>
            </div>
          </div>

          {/* Summary Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSummaryOpen(true)}
                  className="shrink-0"
                >
                  <PanelRightOpen className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voir le résumé</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Progression du formulaire</span>
              <span className="font-medium">{formCompletion}%</span>
            </div>
            <Progress value={formCompletion} className="h-2" />
          </div>
          {formCompletion === 100 && (
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          )}
        </div>

        <Separator />

        {/* Form Content */}
        <div className="space-y-5">
          {fieldGroups.map((group, groupIndex) => {
            if (group.length === 1 && isFullWidthField(group[0])) {
              return (
                <DynamicField
                  key={group[0].id}
                  field={group[0]}
                  value={formData.fields[group[0].id]}
                  onChange={(value) => handleFieldChange(group[0].id, value)}
                  error={errors[group[0].id]}
                />
              );
            }

            return (
              <div
                key={`group-${groupIndex}`}
                className={cn(
                  "grid gap-4",
                  group.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                )}
              >
                {group.map((field) => (
                  <DynamicField
                    key={field.id}
                    field={field}
                    value={formData.fields[field.id]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    error={errors[field.id]}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">
                {Object.keys(errors).length} champ(s) à corriger
              </p>
              <p className="text-sm text-destructive/80">
                Veuillez remplir tous les champs obligatoires avant de continuer.
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="min-w-[180px]"
            disabled={formCompletion < 100}
          >
            Vérifier ma demande
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Summary Sheet */}
        <Sheet open={summaryOpen} onOpenChange={setSummaryOpen}>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Résumé de votre demande</SheetTitle>
              <SheetDescription>
                Aperçu en temps réel des informations saisies
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {/* Type Badge */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className={cn("p-2 rounded-lg border", config.color)}>
                  <TypeIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-sm">{currentConfig.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {requestTypesByCategory[currentConfig.category].label}
                  </div>
                </div>
              </div>

              {/* Field Summary */}
              <div className="space-y-3">
                {currentConfig.fields.map((field) => {
                  const value = formData.fields[field.id];
                  const hasValue = value !== undefined && value !== null && value !== "" &&
                    !(Array.isArray(value) && value.length === 0);

                  return (
                    <div key={field.id} className="flex items-start gap-3">
                      {hasValue ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      ) : field.required ? (
                        <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium flex items-center gap-1">
                          {field.label}
                          {field.required && <span className="text-destructive">*</span>}
                        </div>
                        {hasValue && (
                          <div className="text-xs text-muted-foreground truncate">
                            {getDisplayValueShort(field, value)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Completion Status */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Progression</span>
                  <span className="font-medium">{formCompletion}%</span>
                </div>
                <Progress value={formCompletion} className="h-2" />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  };

  // Get short display value for summary
  const getDisplayValueShort = (field: FormField, value: unknown): string => {
    if (value === undefined || value === null || value === "") return "";

    if (field.type === "select" || field.type === "radio") {
      const option = field.options?.find((o) => o.value === value);
      return option?.label || String(value);
    }

    if (field.type === "multiselect" && Array.isArray(value)) {
      return `${value.length} sélectionné(s)`;
    }

    if (field.type === "problem-list") {
      const problemData = value as ProblemListValue;
      if (problemData?.mode === "detailed") {
        return `${problemData.problems?.length || 0} équipement(s)`;
      }
      return problemData?.globalTitle || "";
    }

    if (field.type === "file" && Array.isArray(value)) {
      return `${value.length} fichier(s)`;
    }

    return String(value).slice(0, 50) + (String(value).length > 50 ? "..." : "");
  };

  // Get full display value for review
  const getDisplayValue = (field: FormField, value: unknown): string => {
    if (value === undefined || value === null || value === "") return "-";

    if (field.type === "select" || field.type === "radio") {
      const option = field.options?.find((o) => o.value === value);
      return option?.label || String(value);
    }

    if (field.type === "multiselect" && Array.isArray(value)) {
      return value
        .map((v) => field.options?.find((o) => o.value === v)?.label || v)
        .join(", ");
    }

    if (field.type === "date" && value instanceof Date) {
      return value.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    if (field.type === "file" && Array.isArray(value)) {
      return value.map((f: File) => f.name).join(", ");
    }

    if (field.type === "checkbox") {
      return value ? "Oui" : "Non";
    }

    return String(value);
  };

  // Render problem review
  const renderProblemReview = (problemData: ProblemListValue) => {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <dt className="text-sm text-muted-foreground">Titre</dt>
            <dd className="text-sm col-span-2 font-medium">{problemData.globalTitle}</dd>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <dt className="text-sm text-muted-foreground">Description</dt>
            <dd className="text-sm col-span-2">{problemData.globalDescription}</dd>
          </div>
        </div>

        {problemData.mode === "detailed" && problemData.problems.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-sm font-medium text-muted-foreground">
              Équipements ({problemData.problems.length})
            </div>
            {problemData.problems.map((problem, index) => {
              const equipType = equipmentTypeOptions.find(
                (o) => o.value === problem.equipmentType
              );
              const problemType = equipmentProblemOptions.find(
                (o) => o.value === problem.equipmentProblem
              );

              return (
                <Card key={problem.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="shrink-0 mt-0.5">
                        {index + 1}
                      </Badge>
                      <div className="flex-1 space-y-1">
                        <div className="font-medium text-sm">
                          {equipType?.label || "-"} — {problemType?.label || "-"}
                        </div>
                        {problem.equipmentId && (
                          <div className="text-sm text-muted-foreground">
                            ID: {problem.equipmentId}
                          </div>
                        )}
                        {problem.location && (
                          <div className="text-sm text-muted-foreground">
                            Emplacement: {problem.location}
                          </div>
                        )}
                        {problem.description && (
                          <div className="text-sm text-muted-foreground">
                            Note: {problem.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render review step
  const renderReview = () => {
    if (!currentConfig) return null;

    const TypeIcon = iconMap[currentConfig.icon] || HelpCircle;
    const taskCount = getTaskCount();
    const config = categoryConfig[currentConfig.category];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 hover:bg-accent rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold">Vérifiez votre demande</h2>
            <p className="text-sm text-muted-foreground">
              Assurez-vous que toutes les informations sont correctes
            </p>
          </div>
        </div>

        {/* Task count banner */}
        {currentConfig.supportsMultipleProblems && taskCount > 0 && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
            <ListTodo className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-blue-900 dark:text-blue-100">
                {taskCount} tâche{taskCount > 1 ? "s" : ""} sera{taskCount > 1 ? "ont" : ""} créée{taskCount > 1 ? "s" : ""}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Chaque problème signalé génère une tâche assignable à un technicien
              </div>
            </div>
          </div>
        )}

        <Card className="overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl border", config.color)}>
                <TypeIcon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">{currentConfig.label}</CardTitle>
                <Badge variant="outline" className="mt-1">
                  {requestTypesByCategory[currentConfig.category].label}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <dl className="space-y-4">
              {currentConfig.fields.map((field) => {
                const value = formData.fields[field.id];

                if (field.type === "problem-list") {
                  const problemData = value as ProblemListValue | undefined;
                  if (!problemData?.globalTitle) return null;

                  return (
                    <div key={field.id} className="space-y-2">
                      <dt className="text-sm text-muted-foreground font-medium">
                        Détails de la demande
                      </dt>
                      <dd>{renderProblemReview(problemData)}</dd>
                    </div>
                  );
                }

                const displayValue = getDisplayValue(field, value);
                if (!field.required && displayValue === "-") return null;

                return (
                  <div key={field.id} className="grid grid-cols-3 gap-2">
                    <dt className="text-sm text-muted-foreground">{field.label}</dt>
                    <dd className="text-sm col-span-2 font-medium">{displayValue}</dd>
                  </div>
                );
              })}
            </dl>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleBack}>
            Modifier
          </Button>
          <Button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="min-w-[160px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Render success step
  const renderSuccess = () => {
    const taskCount = getTaskCount();

    return (
      <div className="text-center py-16">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-bounce">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">Demande envoyée !</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Votre demande a été transmise à notre équipe. Vous recevrez une
          confirmation par email et nous vous contacterons dans les plus brefs
          délais.
        </p>

        {currentConfig?.supportsMultipleProblems && taskCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-full text-sm mb-8">
            <ListTodo className="w-4 h-4" />
            <span>
              <strong>{taskCount}</strong> tâche{taskCount > 1 ? "s" : ""} créée{taskCount > 1 ? "s" : ""}
            </span>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Nouvelle demande
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Progress Header */}
      {step !== "success" && (
        <div className="mb-8">
          {/* Step Progress Bar */}
          <div className="relative mb-6">
            <Progress value={animatingProgress} className="h-1.5" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-8">
            {steps.map((s, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = s.key === step;

              return (
                <div
                  key={s.key}
                  className={cn(
                    "flex items-center gap-2 transition-all duration-300",
                    isCurrent && "scale-105"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium hidden sm:inline transition-colors",
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <Card className="border-0 shadow-xl bg-gradient-to-b from-background to-muted/10">
        <CardContent className="p-6 sm:p-8">
          {step === "select-type" && renderCommandSelector()}
          {step === "fill-form" && renderFormFields()}
          {step === "review" && renderReview()}
          {step === "success" && renderSuccess()}
        </CardContent>
      </Card>
    </div>
  );
}
