import React, { useState } from "react";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";

interface CustomerCredentialsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  password: string;
}

export default function CustomerCredentialsModal({
  open,
  onOpenChange,
  username,
  password,
}: CustomerCredentialsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Customer Portal Account Created
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="text-center text-sm text-muted-foreground">
            Customer portal account has been created successfully. Please save these credentials:
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modal-username">Username</Label>
              <div className="flex gap-2">
                <Input
                  id="modal-username"
                  value={username}
                  readOnly
                  className="bg-muted"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(username, "username")}
                  className="shrink-0"
                >
                  {copiedField === "username" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-password">Password</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="modal-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    readOnly
                    className="bg-muted pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(password, "password")}
                  className="shrink-0"
                >
                  {copiedField === "password" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-800">
              <strong>Important:</strong> Please save these credentials securely. 
              The customer will need them to access their portal.
            </div>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}