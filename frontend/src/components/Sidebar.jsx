import { useState } from "react";
import { Menu, X, Home, Users, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const navItems = [
    { icon: <Home size={20} />, label: "DashBoard" },
    { icon: <Users size={20} />, label: "Products" },
    { icon: <FileText size={20} />, label: "Orders" },
  ];

  const navigate = useNavigate();

  return (
    <div className="flex mb-6">
      {/* Mobile Navbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-800 text-white flex items-center justify-between p-4 z-50">
        <h1 className="text-lg font-bold">Dashboard</h1>
        <button
          onClick={toggleMobile}
          className="p-2 rounded-lg hover:bg-gray-700"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown nav */}
      <div
        className={`lg:hidden fixed top-14 left-0 right-0 bg-gray-400 text-white shadow-md transition-transform duration-300 ease-in-out z-40
        ${isMobileOpen ? "translate-y-0" : "-translate-y-full"}`}
      >
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    navigate(`/seller/${item.label.toLowerCase()}`);
                    setIsMobileOpen(false);
                  }}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="ml-3">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-white pt-2">
            <Button
              variant="link"
              className="text-white"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/signin");
                setIsMobileOpen(false);
              }}
            >
              Log Out
            </Button>
          </div>
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`min-h-screen hidden lg:flex bg-gray-400 text-white transition-all duration-300 ease-in-out flex-col
    ${isCollapsed ? "w-20" : "w-64"}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-white">
          {!isCollapsed && <h1 className="text-xl font-bold">Dashboard</h1>}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-gray-600"
          >
            {isCollapsed ? <Menu size={24} /> : <X size={24} />}
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() =>
                      navigate(`/seller/${item.label.toLowerCase()}`)
                    }
                    className={`w-full flex items-center p-3 rounded-lg hover:bg-gray-600 transition-colors ${
                      isCollapsed ? "justify-center" : ""
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div
          className={`p-4 border-t border-white ${
            isCollapsed ? "text-center" : "flex items-center"
          }`}
        >
          {!isCollapsed && (
            <div className="ml-3">
              <Button
                variant={"link"}
                className={"text-white"}
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/signin");
                }}
              >
                Log Out
              </Button>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default Sidebar;
