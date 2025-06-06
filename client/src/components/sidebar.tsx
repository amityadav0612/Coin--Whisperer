import { Link, useLocation } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [location] = useLocation();
  
  // Close sidebar when clicking outside on mobile
  const handleBackdropClick = () => {
    setIsOpen(false);
  };
  
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden" 
          onClick={handleBackdropClick}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto md:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-16 border-b border-border">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-foreground">Coin Whisperer</span>
          </div>
        </div>
        <div className="flex flex-col flex-grow px-4 py-4">
          <nav className="flex-1 space-y-2">
            <Link href="/" className={`flex items-center px-4 py-3 rounded-lg group ${
                location === "/" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-accent/50"
              }`}>
                <span className="material-icons mr-3">dashboard</span>
                <span>Dashboard</span>
            </Link>
            <Link href="/trading" className="flex items-center px-4 py-3 text-muted-foreground rounded-lg hover:bg-accent/50 group">
                <span className="material-icons mr-3">trending_up</span>
                <span>Trading</span>
            </Link>
            <Link href="/coins" className="flex items-center px-4 py-3 text-muted-foreground rounded-lg hover:bg-accent/50 group">
                <span className="material-icons mr-3">tag</span>
                <span>Coins</span>
            </Link>
            <Link href="/history" className="flex items-center px-4 py-3 text-muted-foreground rounded-lg hover:bg-accent/50 group">
                <span className="material-icons mr-3">history</span>
                <span>History</span>
            </Link>
            <Link href="/analytics" className="flex items-center px-4 py-3 text-muted-foreground rounded-lg hover:bg-accent/50 group">
                <span className="material-icons mr-3">auto_graph</span>
                <span>Analytics</span>
            </Link>
            <Link href="/settings" className="flex items-center px-4 py-3 text-muted-foreground rounded-lg hover:bg-accent/50 group">
                <span className="material-icons mr-3">settings</span>
                <span>Settings</span>
            </Link>
          </nav>
          <div className="pt-4 mt-6 border-t border-border">
            <button className="flex w-full items-center px-4 py-3 text-muted-foreground rounded-lg hover:bg-accent/50">
              <span className="material-icons mr-3">account_circle</span>
              <span>Profile</span>
            </button>
            <button className="flex w-full items-center px-4 py-3 text-muted-foreground rounded-lg hover:bg-accent/50">
              <span className="material-icons mr-3">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
