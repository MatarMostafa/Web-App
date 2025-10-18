"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "react-hot-toast";

interface AddContactDialogProps {
  children?: React.ReactNode;
}

const AddContactDialog: React.FC<AddContactDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    location: "",
  });

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      jobTitle: "",
      location: "",
    });
    setSelectedTags([]);
  };

  const handleSubmit = async () => {
    const toastId = toast.loading("Creating contact...");

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: selectedTags }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to add contact");

      toast.success("Contact created!", { id: toastId });
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
        { id: toastId }
      );
    }
  };

  const tags = [
    {
      name: "Client",
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
    {
      name: "Investor",
      color: "bg-orange-100 text-orange-800 border-orange-200",
    },
    { name: "Friend", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
    {
      name: "Coworker",
      color: "bg-violet-100 text-violet-800 border-violet-200",
    },
    { name: "Family", color: "bg-pink-100 text-pink-800 border-pink-200" },
    { name: "Mentor", color: "bg-teal-100 text-teal-800 border-teal-200" },
    { name: "Partner", color: "bg-amber-100 text-amber-800 border-amber-200" },
    { name: "VIP", color: "bg-orange-50 text-orange-600 border-orange-100" },
    { name: "Networking", color: "bg-blue-50 text-blue-600 border-blue-100" },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your Lovable network.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue="manual"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="ai">AI Assisted</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="pt-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium mb-1"
                  >
                    First name
                  </label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium mb-1"
                  >
                    Last name
                  </label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-1"
                >
                  Phone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium mb-1"
                  >
                    Company
                  </label>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, company: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="jobTitle"
                    className="block text-sm font-medium mb-1"
                  >
                    Job Title
                  </label>
                  <Input
                    id="jobTitle"
                    value={form.jobTitle}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, jobTitle: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium mb-1"
                >
                  Location
                </label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={tag.name + index}
                      variant="outline"
                      className={cn(
                        "cursor-pointer border text-sm py-1 px-3",
                        selectedTags.includes(tag.name)
                          ? tag.color
                          : "bg-background"
                      )}
                      onClick={() => handleTagSelect(tag.name)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSubmit}
                >
                  Add Contact
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-4">
              <div className="text-center p-8">
                <p className="text-muted-foreground mb-4">
                  Paste a LinkedIn profile URL, resume, or any text about a
                  person, and our AI will extract contact details automatically.
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  Try AI Contact Creation
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <Toaster
        position="top-right"
        containerClassName="!z-[99999]"
        toastOptions={{
          className: "!bg-background !text-foreground !border",
          duration: 4000,
        }}
      />
    </>
  );
};

export default AddContactDialog;
