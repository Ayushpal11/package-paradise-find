import { useState } from "react";
import { Search, Calendar, Users, MapPin, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const indianCities = [
  { label: "New Delhi", value: "new delhi" },
  { label: "Mumbai", value: "mumbai" },
  { label: "Bangalore", value: "bangalore" },
  { label: "Hyderabad", value: "hyderabad" },
  { label: "Ahmedabad", value: "ahmedabad" },
  { label: "Chennai", value: "chennai" },
  { label: "Kolkata", value: "kolkata" },
  { label: "Surat", value: "surat" },
  { label: "Pune", value: "pune" },
  { label: "Jaipur", value: "jaipur" },
  { label: "Lucknow", value: "lucknow" },
  { label: "Kanpur", value: "kanpur" },
  { label: "Nagpur", value: "nagpur" },
  { label: "Indore", value: "indore" },
  { label: "Thane", value: "thane" },
  { label: "Bhopal", value: "bhopal" },
  { label: "Visakhapatnam", value: "visakhapatnam" },
  { label: "Pimpri-Chinchwad", value: "pimpri-chinchwad" },
  { label: "Patna", value: "patna" },
  { label: "Vadodara", value: "vadodara" },
  { label: "Ghaziabad", value: "ghaziabad" },
  { label: "Ludhiana", value: "ludhiana" },
  { label: "Agra", value: "agra" },
  { label: "Nashik", value: "nashik" },
  { label: "Faridabad", value: "faridabad" },
  { label: "Meerut", value: "meerut" },
  { label: "Rajkot", value: "rajkot" },
  { label: "Kalyan-Dombivli", value: "kalyan-dombivli" },
  { label: "Vasai-Virar", value: "vasai-virar" },
  { label: "Varanasi", value: "varanasi" },
  { label: "Srinagar", value: "srinagar" },
  { label: "Aurangabad", value: "aurangabad" },
  { label: "Dhanbad", value: "dhanbad" },
  { label: "Amritsar", value: "amritsar" },
  { label: "Navi Mumbai", value: "navi mumbai" },
  { label: "Allahabad", value: "allahabad" },
  { label: "Ranchi", value: "ranchi" },
  { label: "Howrah", value: "howrah" },
  { label: "Coimbatore", value: "coimbatore" },
  { label: "Jabalpur", value: "jabalpur" },
  { label: "Gwalior", value: "gwalior" },
  { label: "Vijayawada", value: "vijayawada" },
  { label: "Jodhpur", value: "jodhpur" },
  { label: "Madurai", value: "madurai" },
  { label: "Raipur", value: "raipur" },
  { label: "Kota", value: "kota" },
  { label: "Chandigarh", value: "chandigarh" },
  { label: "Guwahati", value: "guwahati" },
  { label: "Solapur", value: "solapur" },
  { label: "Manali", value: "manali" },
  { label: "Leh", value: "leh" },
  { label: "Shimla", value: "shimla" },
  { label: "Goa", value: "goa" },
  { label: "Kochi", value: "kochi" },
  { label: "Ooty", value: "ooty" },
  { label: "Munnar", value: "munnar" },
  { label: "Rishikesh", value: "rishikesh" },
  { label: "Agatti", value: "agatti" },
  { label: "Port Blair", value: "port blair" },
];

export const SearchBar = () => {
  const navigate = useNavigate();
  const [openOrigin, setOpenOrigin] = useState(false);
  const [openDest, setOpenDest] = useState(false);
  
  const [searchData, setSearchData] = useState({
    origin: "",
    destination: "",
    startDate: "",
    endDate: "",
    travellers: "2",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchData.origin || !searchData.destination) return;
    navigate("/results", { state: searchData });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-6xl mx-auto bg-card rounded-2xl shadow-xl p-6 space-y-4 md:space-y-0 relative z-50"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Origin Dropdown */}
        <div className="relative">
          <Popover open={openOrigin} onOpenChange={setOpenOrigin}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openOrigin}
                className="w-full justify-between pl-10 h-11 bg-background border-input hover:bg-background/90"
              >
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <span className="truncate">
                  {searchData.origin
                    ? indianCities.find((city) => city.value === searchData.origin)?.label
                    : "From (City)"}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search city..." />
                <CommandList>
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup>
                    {indianCities.map((city) => (
                      <CommandItem
                        key={city.value}
                        value={city.value}
                        onSelect={(currentValue) => {
                          setSearchData({ ...searchData, origin: currentValue === searchData.origin ? "" : currentValue });
                          setOpenOrigin(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            searchData.origin === city.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {city.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Destination Dropdown */}
        <div className="relative">
          <Popover open={openDest} onOpenChange={setOpenDest}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openDest}
                className="w-full justify-between pl-10 h-11 bg-background border-input hover:bg-background/90"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <span className="truncate">
                  {searchData.destination
                    ? indianCities.find((city) => city.value === searchData.destination)?.label
                    : "To (Destination)"}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search destination..." />
                <CommandList>
                  <CommandEmpty>No destination found.</CommandEmpty>
                  <CommandGroup>
                    {indianCities.map((city) => (
                      <CommandItem
                        key={city.value}
                        value={city.value}
                        onSelect={(currentValue) => {
                          setSearchData({ ...searchData, destination: currentValue === searchData.destination ? "" : currentValue });
                          setOpenDest(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            searchData.destination === city.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {city.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="date"
            value={searchData.startDate}
            onChange={(e) => setSearchData({ ...searchData, startDate: e.target.value })}
            className="pl-10 h-11"
            required
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="date"
            value={searchData.endDate}
            onChange={(e) => setSearchData({ ...searchData, endDate: e.target.value })}
            className="pl-10 h-11"
            required
          />
        </div>

        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="number"
            min="1"
            max="10"
            placeholder="Travellers"
            value={searchData.travellers}
            onChange={(e) => setSearchData({ ...searchData, travellers: e.target.value })}
            className="pl-10 h-11"
            required
          />
        </div>
      </div>

      <div className="h-4" />
      <div className="flex justify-center">
        <Button type="submit" size="lg" className="w-full md:w-auto px-12 hover:bg-primary/90 flex items-center justify-center transition-all duration-300">
          <Search className="mr-2 h-5 w-5" />
          Search Packages
        </Button>
      </div>
    </form>
  );
};
