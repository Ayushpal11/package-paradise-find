import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { packageApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface EnquiryFormProps {
  packageId: string;
  packageTitle: string;
  onClose: () => void;
}

export const EnquiryForm = ({ packageId, packageTitle, onClose }: EnquiryFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    travellers: "2",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await packageApi.submitEnquiry({
        packageId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        travellers: parseInt(formData.travellers),
        message: formData.message || undefined,
      });
      
      toast({
        title: "Enquiry Submitted!",
        description: "We'll contact you soon with package details.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast({
        title: "Error",
        description: "Failed to submit enquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enquire About Package</DialogTitle>
          <DialogDescription>{packageTitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="travellers">Number of Travellers *</Label>
            <Input
              id="travellers"
              type="number"
              min="1"
              max="10"
              value={formData.travellers}
              onChange={(e) => setFormData({ ...formData, travellers: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Any specific requirements or questions..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Enquiry"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
