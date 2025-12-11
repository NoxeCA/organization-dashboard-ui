"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderPlus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { type TaskGroup } from "@/lib/types/service-call";

const taskGroupFormSchema = z.object({
  name: z.string().min(1, "Group name is required").max(50, "Name too long"),
});

type TaskGroupFormValues = z.infer<typeof taskGroupFormSchema>;

interface TaskGroupDialogProps {
  serviceCallId: string;
  existingGroup?: TaskGroup;
  onGroupCreate?: (group: TaskGroup) => void;
  onGroupUpdate?: (group: TaskGroup) => void;
  trigger?: React.ReactNode;
}

export function TaskGroupDialog({
  serviceCallId,
  existingGroup,
  onGroupCreate,
  onGroupUpdate,
  trigger,
}: TaskGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!existingGroup;

  const form = useForm<TaskGroupFormValues>({
    resolver: zodResolver(taskGroupFormSchema),
    defaultValues: {
      name: existingGroup?.name || "",
    },
  });

  const onSubmit = (data: TaskGroupFormValues) => {
    if (isEditing && existingGroup) {
      const updatedGroup: TaskGroup = {
        ...existingGroup,
        name: data.name,
      };
      onGroupUpdate?.(updatedGroup);
    } else {
      const newGroup: TaskGroup = {
        id: `tg-${Date.now()}`,
        name: data.name,
        serviceCallId,
      };
      onGroupCreate?.(newGroup);
    }
    form.reset();
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && existingGroup) {
      form.setValue("name", existingGroup.name);
    } else if (!newOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <FolderPlus className="mr-1 h-4 w-4" />
            New Group
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Task Group" : "Create Task Group"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the name of this task group."
              : "Create a new group to organize related tasks together."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Installation, Configuration, Testing"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Save Changes" : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
