import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

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

export const FilterSidebar = ({ onFilterChange }: FilterSidebarProps) => {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 200000],
    nights: [],
    hotelStars: [],
    meals: false,
    transfers: false,
    refundable: false,
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const resetFilters = () => {
    const reset: FilterState = {
      priceRange: [0, 200000],
      nights: [],
      hotelStars: [],
      meals: false,
      transfers: false,
      refundable: false,
    };
    setFilters(reset);
    onFilterChange(reset);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
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
      </CardContent>
    </Card>
  );
};
