"use client";

import { useState } from "react";
import {
  ProblemEntry,
  createEmptyProblem,
  equipmentTypeOptions,
  equipmentProblemOptions,
} from "./form-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  ChevronDown,
  AlertCircle,
  GripVertical,
  FileText,
  Layers,
  Check,
  CheckCircle2,
  Camera,
  KeyRound,
  Phone,
  Car,
  RotateCcw,
  Bell,
  Monitor,
  MoreHorizontal,
  AlertTriangle,
  Zap,
  TrendingDown,
  Wrench,
  Settings,
  HelpCircle,
  CircleDot,
} from "lucide-react";

export interface ProblemListValue {
  globalTitle: string;
  globalDescription: string;
  mode: "simple" | "detailed";
  problems: ProblemEntry[];
}

interface ProblemListProps {
  value: ProblemListValue;
  onChange: (value: ProblemListValue) => void;
  error?: string;
}

export const createEmptyProblemListValue = (): ProblemListValue => ({
  globalTitle: "",
  globalDescription: "",
  mode: "simple",
  problems: [],
});

// Equipment type icons
const equipmentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "video-surveillance": Camera,
  "access-control": KeyRound,
  "intercom": Phone,
  "vehicle-gate": Car,
  "turnstile": RotateCcw,
  "alarm": Bell,
  "software": Monitor,
  "other": MoreHorizontal,
};

// Problem type icons
const problemIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "not-working": AlertTriangle,
  "intermittent": Zap,
  "degraded": TrendingDown,
  "damage": Wrench,
  "configuration": Settings,
  "other": HelpCircle,
};

// Problem type colors
const problemColors: Record<string, string> = {
  "not-working": "text-red-600 bg-red-500/10 border-red-500/20",
  "intermittent": "text-amber-600 bg-amber-500/10 border-amber-500/20",
  "degraded": "text-orange-600 bg-orange-500/10 border-orange-500/20",
  "damage": "text-purple-600 bg-purple-500/10 border-purple-500/20",
  "configuration": "text-blue-600 bg-blue-500/10 border-blue-500/20",
  "other": "text-gray-600 bg-gray-500/10 border-gray-500/20",
};

export function ProblemList({ value, onChange, error }: ProblemListProps) {
  const data = value || createEmptyProblemListValue();
  const { globalTitle, globalDescription, mode, problems } = data;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const updateField = <K extends keyof ProblemListValue>(
    field: K,
    fieldValue: ProblemListValue[K]
  ) => {
    onChange({ ...data, [field]: fieldValue });
  };

  const switchToDetailedMode = () => {
    updateField("mode", "detailed");
    if (problems.length === 0) {
      addProblem();
    }
  };

  const switchToSimpleMode = () => {
    updateField("mode", "simple");
  };

  const addProblem = () => {
    const newProblem = createEmptyProblem();
    onChange({
      ...data,
      mode: "detailed",
      problems: [...problems, newProblem],
    });
    setExpandedIds((prev) => new Set([...prev, newProblem.id]));
  };

  const removeProblem = (id: string) => {
    const newProblems = problems.filter((p) => p.id !== id);
    onChange({
      ...data,
      problems: newProblems,
      mode: newProblems.length === 0 ? "simple" : "detailed",
    });
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const updateProblem = (id: string, updates: Partial<ProblemEntry>) => {
    onChange({
      ...data,
      problems: problems.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getProblemSummary = (problem: ProblemEntry, index: number) => {
    const type = equipmentTypeOptions.find(
      (o) => o.value === problem.equipmentType
    );
    const problemType = equipmentProblemOptions.find(
      (o) => o.value === problem.equipmentProblem
    );

    if (type && problemType) {
      return `${type.label} - ${problemType.label}`;
    }
    if (type) {
      return type.label;
    }
    return `Équipement ${index + 1}`;
  };

  const isProblemComplete = (problem: ProblemEntry) => {
    return problem.equipmentType && problem.equipmentProblem;
  };

  const getProblemProgress = (problem: ProblemEntry) => {
    let filled = 0;
    const total = 2; // Required fields: equipmentType, equipmentProblem
    if (problem.equipmentType) filled++;
    if (problem.equipmentProblem) filled++;
    return (filled / total) * 100;
  };

  const taskCount = mode === "simple" ? 1 : Math.max(1, problems.length);

  return (
    <div className="space-y-6">
      {/* Global Title & Description */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="global-title" className="flex items-center gap-1.5">
            Titre de la demande
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="global-title"
            placeholder="Ex: Caméra hors service - Entrée principale"
            value={globalTitle}
            onChange={(e) => updateField("globalTitle", e.target.value)}
            maxLength={100}
            className="h-11"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Un titre clair aide à identifier rapidement votre demande
            </p>
            <span className="text-xs text-muted-foreground">
              {globalTitle.length}/100
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="global-description" className="flex items-center gap-1.5">
            Description du problème
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Textarea
              id="global-description"
              placeholder="Décrivez le problème rencontré, les circonstances, et toute information utile pour le diagnostic..."
              value={globalDescription}
              onChange={(e) => updateField("globalDescription", e.target.value)}
              className="min-h-[120px] resize-y pr-16"
              maxLength={2000}
            />
            <div className="absolute right-3 bottom-3 text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded">
              {2000 - globalDescription.length}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Toggle - Visual Toggle Group */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Type de demande</Label>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value) => {
            if (value === "simple") switchToSimpleMode();
            else if (value === "detailed") switchToDetailedMode();
          }}
          className="justify-start gap-3"
        >
          <ToggleGroupItem
            value="simple"
            aria-label="Demande simple"
            className={cn(
              "flex-1 sm:flex-none h-auto px-4 py-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
              "border-2 data-[state=on]:border-primary rounded-xl"
            )}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Demande simple</div>
                <div className="text-xs opacity-80">1 tâche sera créée</div>
              </div>
              {mode === "simple" && <Check className="w-4 h-4 ml-2" />}
            </div>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="detailed"
            aria-label="Plusieurs équipements"
            className={cn(
              "flex-1 sm:flex-none h-auto px-4 py-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
              "border-2 data-[state=on]:border-primary rounded-xl"
            )}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Plusieurs équipements</div>
                <div className="text-xs opacity-80">Multi-tâches</div>
              </div>
              {mode === "detailed" && <Check className="w-4 h-4 ml-2" />}
            </div>
          </ToggleGroupItem>
        </ToggleGroup>

        <p className="text-sm text-muted-foreground">
          {mode === "simple" ? (
            <>Une seule tâche sera créée pour cette demande.</>
          ) : (
            <>Chaque équipement génère une tâche distincte assignable à un technicien.</>
          )}
        </p>
      </div>

      {/* Detailed Mode - Equipment List */}
      {mode === "detailed" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Équipements concernés</Label>
            <Badge variant="outline" className="text-xs">
              {problems.length} équipement{problems.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {problems.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-medium mb-1">Aucun équipement ajouté</p>
                  <p className="text-muted-foreground text-sm mb-4">
                    Ajoutez les équipements concernés par votre demande
                  </p>
                  <Button onClick={addProblem} variant="default" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un équipement
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {problems.map((problem, index) => {
                const isExpanded = expandedIds.has(problem.id);
                const isComplete = isProblemComplete(problem);
                const progress = getProblemProgress(problem);
                const EquipIcon = equipmentIcons[problem.equipmentType] || CircleDot;
                const ProblemIcon = problemIcons[problem.equipmentProblem] || CircleDot;
                const problemColor = problemColors[problem.equipmentProblem] || "text-gray-600 bg-gray-500/10 border-gray-500/20";

                return (
                  <Collapsible
                    key={problem.id}
                    open={isExpanded}
                    onOpenChange={() => toggleExpanded(problem.id)}
                  >
                    <Card
                      className={cn(
                        "transition-all duration-200",
                        isExpanded && "ring-2 ring-primary/20 shadow-md",
                        !isComplete && "border-amber-500/30"
                      )}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="py-3 px-4 cursor-pointer hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="cursor-grab hover:cursor-grab">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>Réorganiser</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <div className="flex-1 flex items-center gap-3 min-w-0">
                              {/* Status Badge */}
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center border",
                                isComplete
                                  ? "bg-green-500/10 border-green-500/20 text-green-600"
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                              )}>
                                {isComplete ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <span className="text-sm font-medium">{index + 1}</span>
                                )}
                              </div>

                              {/* Equipment & Problem Icons */}
                              <div className="flex items-center gap-2">
                                {problem.equipmentType && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="p-1.5 rounded-md bg-muted">
                                          <EquipIcon className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {equipmentTypeOptions.find(o => o.value === problem.equipmentType)?.label}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {problem.equipmentProblem && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className={cn("p-1.5 rounded-md border", problemColor)}>
                                          <ProblemIcon className="w-4 h-4" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {equipmentProblemOptions.find(o => o.value === problem.equipmentProblem)?.label}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>

                              {/* Summary Text */}
                              <span className="font-medium text-sm truncate">
                                {getProblemSummary(problem, index)}
                              </span>

                              {/* Incomplete Badge */}
                              {!isComplete && (
                                <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/20">
                                  Incomplet
                                </Badge>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeProblem(problem.id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Supprimer</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                  isExpanded && "rotate-180"
                                )}
                              />
                            </div>
                          </div>

                          {/* Progress Bar (when collapsed and incomplete) */}
                          {!isExpanded && !isComplete && (
                            <div className="mt-2 ml-11">
                              <Progress value={progress} className="h-1" />
                            </div>
                          )}
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-4 px-4">
                          <div className="grid gap-4 mt-3 ml-11">
                            {/* Equipment Type - Visual Selector */}
                            <div className="space-y-2">
                              <Label className="text-sm flex items-center gap-1">
                                Type d&apos;équipement
                                <span className="text-destructive">*</span>
                              </Label>
                              <div className="grid grid-cols-4 gap-2">
                                {equipmentTypeOptions.map((option) => {
                                  const Icon = equipmentIcons[option.value] || CircleDot;
                                  const isSelected = problem.equipmentType === option.value;
                                  return (
                                    <TooltipProvider key={option.value}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateProblem(problem.id, {
                                                equipmentType: option.value,
                                              })
                                            }
                                            className={cn(
                                              "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                                              isSelected
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20"
                                            )}
                                          >
                                            <Icon className="w-5 h-5" />
                                            <span className="text-xs font-medium text-center leading-tight">
                                              {option.label.split(" ")[0]}
                                            </span>
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>{option.label}</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Problem Type - Visual Selector */}
                            <div className="space-y-2">
                              <Label className="text-sm flex items-center gap-1">
                                Type de problème
                                <span className="text-destructive">*</span>
                              </Label>
                              <div className="grid grid-cols-3 gap-2">
                                {equipmentProblemOptions.map((option) => {
                                  const Icon = problemIcons[option.value] || CircleDot;
                                  const isSelected = problem.equipmentProblem === option.value;
                                  const color = problemColors[option.value];
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() =>
                                        updateProblem(problem.id, {
                                          equipmentProblem: option.value,
                                        })
                                      }
                                      className={cn(
                                        "flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left",
                                        isSelected
                                          ? `border-current ${color}`
                                          : "border-transparent bg-muted/50 hover:bg-muted"
                                      )}
                                    >
                                      <div className={cn(
                                        "p-1.5 rounded-lg",
                                        isSelected ? "bg-current/10" : "bg-muted"
                                      )}>
                                        <Icon className={cn("w-4 h-4", isSelected ? "" : "text-muted-foreground")} />
                                      </div>
                                      <span className="text-sm font-medium">{option.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Additional Details - Compact Row */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">ID équipement</Label>
                                <Input
                                  placeholder="CAM-A-101"
                                  className="h-9"
                                  value={problem.equipmentId}
                                  onChange={(e) =>
                                    updateProblem(problem.id, {
                                      equipmentId: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Emplacement</Label>
                                <Input
                                  placeholder="Étage 3, salle 204"
                                  className="h-9"
                                  value={problem.location}
                                  onChange={(e) =>
                                    updateProblem(problem.id, {
                                      location: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>

                            {/* Specific Note */}
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">
                                Remarque spécifique
                              </Label>
                              <Input
                                placeholder="Détails supplémentaires pour cet équipement..."
                                className="h-9"
                                value={problem.description}
                                onChange={(e) =>
                                  updateProblem(problem.id, {
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}

              {/* Add More Button */}
              <Button
                type="button"
                variant="outline"
                onClick={addProblem}
                className="w-full border-dashed border-2 h-12 hover:border-primary hover:bg-primary/5"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un autre équipement
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Task Count Summary */}
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-xl border",
        mode === "detailed" && problems.length > 1
          ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
          : "bg-muted/50 border-transparent"
      )}>
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          mode === "detailed" && problems.length > 1
            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600"
            : "bg-muted text-muted-foreground"
        )}>
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="font-medium">
            {taskCount} tâche{taskCount > 1 ? "s" : ""} sera{taskCount > 1 ? "ont" : ""} créée{taskCount > 1 ? "s" : ""}
          </div>
          <div className="text-sm text-muted-foreground">
            {taskCount > 1
              ? "Chaque équipement créera une tâche distincte"
              : "Une tâche sera créée pour cette demande"}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
