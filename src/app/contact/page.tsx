"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/send-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          type: "contact",
        }),
      });

      if (response.ok) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-4">Get In Touch</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have questions about our products? We'd love to hear from you. Reach out and let's
            start a conversation.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Email */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2">Email</h3>
              <p className="text-gray-600">
                <a href="mailto:info@rimacosmetics.com" className="hover:text-green-600">
                  info@rimacosmetics.com
                </a>
              </p>
            </div>

            {/* Phone */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2">Phone</h3>
              <p className="text-gray-600">
                <a href="tel:+919876543210" className="hover:text-green-600">
                  +91 98765 43210
                </a>
              </p>
            </div>

            {/* Location */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2">Location</h3>
              <p className="text-gray-600">
                Chennai, Tamil Nadu<br />
                India
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="mb-8">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="mb-2">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                {/* Subject */}
                <div>
                  <Label htmlFor="subject" className="mb-2">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                  />
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message" className="mb-2">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            {/* Additional Information */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="mb-6">Why Contact Us?</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>Product inquiries and recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>Bulk orders and wholesale partnerships</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>Customization and special requests</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>Feedback and suggestions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>General questions about our brand</span>
                </li>
              </ul>

              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Response Time:</strong> We typically respond to all inquiries within 24-48 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
