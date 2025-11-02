import { useState } from "react";
import { Search, Calendar, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export const SearchBar = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    origin: "",
    destination: "",
    startDate: "",
    endDate: "",
    travellers: "2",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/results", { state: searchData });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-6xl mx-auto bg-card rounded-2xl shadow-lg p-6 space-y-4 md:space-y-0"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="From (City)"
            value={searchData.origin}
            onChange={(e) => setSearchData({ ...searchData, origin: e.target.value })}
            className="pl-10"
            required
          />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="To (Destination)"
            value={searchData.destination}
            onChange={(e) => setSearchData({ ...searchData, destination: e.target.value })}
            className="pl-10"
            required
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="date"
            value={searchData.startDate}
            onChange={(e) => setSearchData({ ...searchData, startDate: e.target.value })}
            className="pl-10"
            required
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="date"
            value={searchData.endDate}
            onChange={(e) => setSearchData({ ...searchData, endDate: e.target.value })}
            className="pl-10"
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
            className="pl-10"
            required
          />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full md:w-auto">
        <Search className="mr-2 h-5 w-5" />
        Search Packages
      </Button>
    </form>
  );
};
