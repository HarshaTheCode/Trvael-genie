import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Search, User, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface SavedPlansHeaderProps {
  userEmail?: string;
  onSearch?: (q: string) => void;
  onCreate?: () => void;
  onSignOut?: () => void;
}

function SavedPlansHeader({ userEmail, onSearch, onCreate, onSignOut }: SavedPlansHeaderProps) {
  const navigate = useNavigate();
  const handleCreate = () => {
    if (typeof onCreate === "function") {
      onCreate();
      return;
    }
    navigate("/");
  };

  const handleSignOut = () => {
    if (typeof onSignOut === "function") onSignOut();
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-foreground">TravelGenie</span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search destinations or trip names..."
                className="pl-10 bg-background border-border focus:ring-primary"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Itinerary
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <User className="w-4 h-4 mr-2" />
                  {userEmail || "Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export { SavedPlansHeader };
export default SavedPlansHeader;