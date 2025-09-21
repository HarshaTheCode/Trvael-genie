import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, User, LogOut } from "lucide-react";

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
    navigate("/index");
  };

  const handleSignOut = () => {
    if (typeof onSignOut === "function") onSignOut();
  };

  return (
    <>
      <style>
        {`
          .header {
            background: white;
            border-bottom: 1px solid #e5e7eb;
            position: sticky;
            top: 0;
            z-index: 50;
            padding: 16px 0;
          }
          
          .header-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .logo {
            width: 32px;
            height: 32px;
            background: #0891b2;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
          }
          
          .brand-name {
            font-size: 20px;
            font-weight: bold;
            color: #111827;
          }
          
          .search-container {
            flex: 1;
            max-width: 400px;
            margin: 0 32px;
            position: relative;
          }
          
          .search-input {
            width: 100%;
            padding: 10px 16px 10px 40px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }
          
          .search-input:focus {
            border-color: #0891b2;
            box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
          }
          
          .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #6b7280;
            width: 16px;
            height: 16px;
          }
          
          .actions {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          
          .create-btn {
            background: #0891b2;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            transition: background-color 0.2s;
          }
          
          .create-btn:hover {
            background: #0e7490;
          }
          
          .user-dropdown {
            position: relative;
          }
          
          .user-btn {
            background: none;
            border: none;
            color: #6b7280;
            padding: 8px 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            border-radius: 6px;
            transition: background-color 0.2s;
          }
          
          .user-btn:hover {
            background: #f3f4f6;
          }
          
          .dropdown-content {
            position: absolute;
            right: 0;
            top: 100%;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            min-width: 160px;
            z-index: 100;
          }
          
          .dropdown-item {
            padding: 12px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #374151;
            transition: background-color 0.2s;
          }
          
          .dropdown-item:hover {
            background: #f3f4f6;
          }
          
          @media (max-width: 768px) {
            .search-container {
              display: none;
            }
            
            .header-container {
              padding: 0 16px;
            }
          }
        `}
      </style>
      
      <header className="header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo">T</div>
            <span className="brand-name">TravelGenie</span>
          </div>

          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search destinations or trip names..."
              className="search-input"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>

          <div className="actions">
            <button className="create-btn" onClick={handleCreate}>
              <Plus size={16} />
              Create New Itinerary
            </button>

            <div className="user-dropdown">
              <button className="user-btn">
                <User size={16} />
                {userEmail || "harsha01092004@gmail.com"}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export { SavedPlansHeader };
export default SavedPlansHeader;