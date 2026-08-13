import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Star, Filter, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";

interface FilterState {
  priceRange: [number, number];
  nights: number[];
  hotelStars: number[];
  meals: boolean;
  transfers: boolean;
  refundable: boolean;
}

interface FilterSidebarProps {
  onFilterChange: (filters: FilterState) => void;
}

const defaultFilters: FilterState = {
  priceRange: [0, 200000],
  nights: [],
  hotelStars: [],
  meals: false,
  transfers: false,
  refundable: false,
};

export const FilterSidebar = ({ onFilterChange }: FilterSidebarProps) => {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sheetOpen, setSheetOpen] = useState(false);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 200000 ||
      filters.nights.length > 0 ||
      filters.hotelStars.length > 0 ||
      filters.meals ||
      filters.transfers ||
      filters.refundable
    );
  };

  const renderFilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Price Range (₹)</Label>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
          max={200000}
          step={5000}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹{filters.priceRange[0].toLocaleString()}</span>
          <span>₹{filters.priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Duration (Nights)</Label>
        <div className="space-y-2">
          {[3, 5, 7, 10].map((night) => (
            <div key={night} className="flex items-center space-x-2">
              <Checkbox
                id={`night-${night}`}
                checked={filters.nights.includes(night)}
                onCheckedChange={(checked) => {
                  const nights = checked
                    ? [...filters.nights, night]
                    : filters.nights.filter((n) => n !== night);
                  updateFilters({ nights });
                }}
              />
              <Label htmlFor={`night-${night}`} className="text-sm font-normal cursor-pointer">
                {night}+ Nights
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Hotel Rating</Label>
        <div className="space-y-2">
          {[3, 4, 5].map((stars) => (
            <div key={stars} className="flex items-center space-x-2">
              <Checkbox
                id={`stars-${stars}`}
                checked={filters.hotelStars.includes(stars)}
                onCheckedChange={(checked) => {
                  const hotelStars = checked
                    ? [...filters.hotelStars, stars]
                    : filters.hotelStars.filter((s) => s !== stars);
                  updateFilters({ hotelStars });
                }}
              />
              <Label htmlFor={`stars-${stars}`} className="text-sm font-normal cursor-pointer flex items-center gap-1">
                {stars}
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {stars === 5 ? "" : "+"}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Inclusions</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="meals"
              checked={filters.meals}
              onCheckedChange={(checked) => updateFilters({ meals: checked as boolean })}
            />
            <Label htmlFor="meals" className="text-sm font-normal cursor-pointer">
              Meals Included
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="transfers"
              checked={filters.transfers}
              onCheckedChange={(checked) => updateFilters({ transfers: checked as boolean })}
            />
            <Label htmlFor="transfers" className="text-sm font-normal cursor-pointer">
              Transfers Included
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Refund Policy</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="refundable"
            checked={filters.refundable}
            onCheckedChange={(checked) => updateFilters({ refundable: checked as boolean })}
          />
          <Label htmlFor="refundable" className="text-sm font-normal cursor-pointer">
            Refundable Only
          </Label>
        </div>
      </div>
    </div>
  );

  // Mobile: Sheet/Drawer
  if (isMobile) {
    return (
      <>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full gap-2 justify-start"
              size="lg"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {hasActiveFilters() && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {[
                    filters.priceRange[0] > 0 || filters.priceRange[1] < 200000 ? 1 : 0,
                    filters.nights.length,
                    filters.hotelStars.length,
                    filters.meals ? 1 : 0,
                    filters.transfers ? 1 : 0,
                    filters.refundable ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-[320px] p-0">
            <SheetHeader className="p-4 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle>Filters</SheetTitle>
                <Button variant="ghost" size="icon" onClick={() => setSheetOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>
            <div className="p-4 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
              {renderFilterContent()}
            </div>
            <div className="p-4 border-t flex gap-2">
              <Button variant="outline" className="flex-1" onClick={resetFilters}>
                Reset All
              </Button>
              <Button className="flex-1" onClick={() => setSheetOpen(false)}>
                Apply
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop: Inline Card
  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>{renderFilterContent()}</CardContent>
    </Card>
  );
};
