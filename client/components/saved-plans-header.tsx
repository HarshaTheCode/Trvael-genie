
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./saved-plans-header.module.css";

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

  // Simple dropdown state for account menu
  const [showDropdown, setShowDropdown] = React.useState(false);
  const toggleDropdown = () => setShowDropdown((v) => !v);
  const handleSignOut = () => {
    setShowDropdown(false);
    if (typeof onSignOut === "function") onSignOut();
  };

  return (
    <header className={styles["saved-plans-header"]}>
      <div className={styles["saved-plans-container"]}>
        <div className={styles["saved-plans-inner"]}>
          {/* Logo */}
          <div className={styles["saved-plans-logo"]}>
            <div className={styles["saved-plans-logoIcon"]}>
              <span className={styles["saved-plans-logoText"]}>T</span>
            </div>
            <span className={styles["saved-plans-logoTitle"]}>TravelGenie</span>
          </div>

          {/* Search Bar */}
          <div className={styles["saved-plans-search"]}>
            <div className={styles["saved-plans-searchWrapper"]}>
              <span role="img" aria-label="Search" className={styles["saved-plans-searchIcon"]}>🔍</span>
              <input
                placeholder="Search destinations or trip names..."
                className={styles["saved-plans-searchInput"]}
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className={styles["saved-plans-actions"]}>
            <button className={styles["saved-plans-buttonPrimary"]} onClick={handleCreate}>
              <span role="img" aria-label="Add" className={styles["saved-plans-plusIcon"]}>➕</span>
              Create New Itinerary
            </button>
            <div style={{ position: "relative", display: "inline-block" }}>
              <button
                className={styles["saved-plans-dropdownTrigger"]}
                onClick={toggleDropdown}
                type="button"
              >
                <span role="img" aria-label="User" className={styles["saved-plans-userIcon"]}>👤</span>
                {userEmail || "Account"}
              </button>
              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    minWidth: 120,
                    zIndex: 10,
                  }}
                >
                  <button
                    onClick={handleSignOut}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      background: "none",
                      border: "none",
                      padding: "8px 12px",
                      cursor: "pointer",
                    }}
                  >
                    <span role="img" aria-label="Logout" className={styles["saved-plans-logoutIcon"]}>🚪</span>
                    <span style={{ marginLeft: 8 }}>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export { SavedPlansHeader };
export default SavedPlansHeader;
