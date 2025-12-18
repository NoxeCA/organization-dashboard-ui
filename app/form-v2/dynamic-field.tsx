"use client";

import { useState } from "react";
import { FormField, FieldOption } from "./form-config";
import { ProblemList, ProblemListValue } from "./problem-list";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  Upload,
  X,
  FileIcon,
  ImageIcon,
  Check,
  Info,
  AlertCircle,
} from "lucide-react";

interface DynamicFieldProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

export function DynamicField({
  field,
  value,
  onChange,
  error,
}: DynamicFieldProps) {
  const renderField = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <div className="relative">
            <Input
              id={field.id}
              type={field.type === "phone" ? "tel" : field.type}
              placeholder={field.placeholder}
              value={(value as string) || ""}
              onChange={(e) => onChange(e.target.value)}
              maxLength={field.maxLength}
              aria-invalid={!!error}
              className={cn(
                "h-11 transition-all",
                error && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {field.maxLength && (value as string)?.length > field.maxLength * 0.8 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {(value as string).length}/{field.maxLength}
              </span>
            )}
          </div>
        );

      case "number":
        return (
          <Input
            id={field.id}
            type="number"
            placeholder={field.placeholder}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            className={cn(
              "h-11",
              error && "border-destructive focus-visible:ring-destructive"
            )}
          />
        );

      case "textarea":
        return (
          <div className="relative">
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={(value as string) || ""}
              onChange={(e) => onChange(e.target.value)}
              maxLength={field.maxLength}
              aria-invalid={!!error}
              className={cn(
                "min-h-[100px] resize-y transition-all",
                error && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {field.maxLength && (
              <div className="absolute right-3 bottom-3 text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded">
                {field.maxLength - ((value as string) || "").length}
              </div>
            )}
          </div>
        );

      case "select":
        return (
          <Select
            value={(value as string) || ""}
            onValueChange={onChange}
          >
            <SelectTrigger
              id={field.id}
              className={cn(
                "h-11",
                error && "border-destructive focus:ring-destructive"
              )}
              aria-invalid={!!error}
            >
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="py-2.5"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multiselect":
        return (
          <MultiSelectField
            field={field}
            value={value as string[]}
            onChange={onChange}
            error={error}
          />
        );

      case "radio":
        // Use inline toggle buttons for short option lists
        const isShortOptions = field.options && field.options.length <= 4 &&
          field.options.every(o => o.label.length <= 30);

        if (isShortOptions) {
          return (
            <div className="flex flex-wrap gap-2">
              {field.options?.map((option) => {
                const isSelected = value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl border-2 transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent border-input hover:border-primary/30"
                    )}
                  >
                    {isSelected && <Check className="w-4 h-4" />}
                    {option.label}
                  </button>
                );
              })}
            </div>
          );
        }

        return (
          <RadioGroup
            value={(value as string) || ""}
            onValueChange={onChange}
            className="flex flex-col gap-3"
          >
            {field.options?.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
                  value === option.value
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/30"
                )}
                onClick={() => onChange(option.value)}
              >
                <RadioGroupItem
                  value={option.value}
                  id={`${field.id}-${option.value}`}
                />
                <Label
                  htmlFor={`${field.id}-${option.value}`}
                  className="cursor-pointer font-normal text-sm flex-1"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
            value ? "border-primary bg-primary/5" : "border-input hover:border-primary/30"
          )}>
            <Checkbox
              id={field.id}
              checked={(value as boolean) || false}
              onCheckedChange={onChange}
            />
            <Label htmlFor={field.id} className="cursor-pointer font-normal flex-1">
              {field.label}
            </Label>
          </div>
        );

      case "date":
        return (
          <DatePickerField
            field={field}
            value={value as Date | undefined}
            onChange={onChange}
            error={error}
          />
        );

      case "file":
        return (
          <FileUploadField
            field={field}
            value={value as File[]}
            onChange={onChange}
          />
        );

      case "problem-list":
        return (
          <ProblemList
            value={value as ProblemListValue}
            onChange={onChange}
            error={error}
          />
        );

      default:
        return null;
    }
  };

  // Checkbox has its own label layout
  if (field.type === "checkbox") {
    return (
      <div className="space-y-2">
        {renderField()}
        {field.helperText && (
          <p className="text-muted-foreground text-sm flex items-start gap-1.5 ml-1">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            {field.helperText}
          </p>
        )}
        {error && (
          <p className="text-destructive text-sm flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id} className="flex items-center gap-1.5 text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
        {field.helperText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{field.helperText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Label>
      {renderField()}
      {error && (
        <p className="text-destructive text-sm flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

// Multi-select field component - uses toggle chips
function MultiSelectField({
  field,
  value,
  onChange,
  error,
}: {
  field: FormField;
  value: string[];
  onChange: (value: unknown) => void;
  error?: string;
}) {
  const selectedValues = value || [];

  const toggleOption = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter((v) => v !== optionValue));
    } else {
      onChange([...selectedValues, optionValue]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {field.options?.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleOption(option.value)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl border-2 transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent border-input hover:border-primary/30"
              )}
            >
              {isSelected && <Check className="w-4 h-4" />}
              {option.label}
            </button>
          );
        })}
      </div>
      {selectedValues.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {selectedValues.length} sélectionné{selectedValues.length > 1 ? "s" : ""}
          </Badge>
        </div>
      )}
    </div>
  );
}

// Date picker field component
function DatePickerField({
  field,
  value,
  onChange,
  error,
}: {
  field: FormField;
  value: Date | undefined;
  onChange: (value: unknown) => void;
  error?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-11 justify-start text-left font-normal",
            !value && "text-muted-foreground",
            error && "border-destructive"
          )}
          aria-invalid={!!error}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, "PPP", { locale: fr })
          ) : (
            <span>Sélectionner une date...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          locale={fr}
        />
      </PopoverContent>
    </Popover>
  );
}

// File upload field component
function FileUploadField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: File[];
  onChange: (value: unknown) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const files = value || [];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    onChange([...files, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      onChange([...files, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />;
    }
    return <FileIcon className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/25"
        )}
        onClick={() => document.getElementById(`file-${field.id}`)?.click()}
      >
        <input
          id={`file-${field.id}`}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            isDragging ? "bg-primary/20" : "bg-muted"
          )}>
            <Upload className={cn(
              "h-6 w-6 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className="text-sm font-medium">
              Glissez vos fichiers ici ou{" "}
              <span className="text-primary">parcourez</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Images, PDF, documents Office (max 10 MB)
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(file)}
                <div className="min-w-0">
                  <span className="text-sm font-medium truncate block">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Supprimer</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
