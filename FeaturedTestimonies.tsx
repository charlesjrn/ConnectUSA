import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export function FeaturedTestimonies() {
  const [, setLocation] = useLocation();
  const { data: testimonies, isLoading } = trpc.messages.featured.useQuery({ limit: 5 });
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading || !testimonies || testimonies.length === 0) {
    return null;
  }

  const currentTestimony = testimonies[currentIndex];

  const nextTestimony = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonies.length);
  };

  const prevTestimony = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonies.length) % testimonies.length);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h3 className="text-2xl font-bold">Featured Testimonies</h3>
      </div>
      
      <Card className="relative border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {currentTestimony.title && (
                <h4 className="text-xl font-semibold text-amber-900 mb-2">
                  {currentTestimony.title}
                </h4>
              )}
              <p className="text-sm text-muted-foreground">
                {new Date(currentTestimony.createdAt).toLocaleDateString()}
              </p>
            </div>
            {testimonies.length > 1 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"