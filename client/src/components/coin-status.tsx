import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import type { Coin } from "@shared/schema";

interface CoinStatusProps {
  coins?: Coin[];
  isLoading: boolean;
  onSelectCoin: (symbol: string) => void;
}

export default function CoinStatus({ coins, isLoading, onSelectCoin }: CoinStatusProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCoinSymbol, setNewCoinSymbol] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mutation for adding a new coin
  const addCoinMutation = useMutation({
    mutationFn: (symbol: string) => API.addCoin(symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coins'] });
      toast({
        title: "Coin added",
        description: `${newCoinSymbol} has been added to tracked coins.`,
      });
      setNewCoinSymbol("");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to add coin",
        description: error.message || "An error occurred while adding the coin.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for toggling coin tracking status
  const toggleTrackingMutation = useMutation({
    mutationFn: ({ id, isTracked }: { id: number, isTracked: boolean }) => 
      API.toggleCoinTracking(id, isTracked),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/coins'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: data.data?.isTracked ? "Coin tracked" : "Coin untracked",
        description: `${data.data?.symbol} is now ${data.data?.isTracked ? 'being tracked' : 'no longer tracked'}.`,
      });
    }
  });

  const handleAddCoin = () => {
    if (!newCoinSymbol.trim()) {
      toast({
        title: "Symbol required",
        description: "Please enter a valid coin symbol.",
        variant: "destructive",
      });
      return;
    }
    
    addCoinMutation.mutate(newCoinSymbol.trim().toUpperCase());
  };
  
  return (
    <>
      <Card>
        <CardContent className="p-5">
          <h3 className="text-lg font-medium text-foreground">Tracked Coins</h3>
          <div className="mt-4 space-y-3">
            {isLoading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-3 bg-accent/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="ml-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-14 mt-1" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-10 mt-1" />
                  </div>
                </div>
              ))
            ) : coins && coins.length > 0 ? (
              // Coin list
              coins.filter(coin => coin.isTracked).map((coin) => (
                <div 
                  key={coin.id} 
                  className="p-3 bg-accent/10 rounded-lg flex items-center justify-between hover:bg-accent/20 cursor-pointer"
                  onClick={() => onSelectCoin(coin.symbol)}
                >
                  <div className="flex items-center">
                    <img 
                      src={coin.image || `https://via.placeholder.com/32/6366f1/ffffff?text=${coin.symbol.charAt(0)}`} 
                      alt={`${coin.name} coin`} 
                      className="w-8 h-8 rounded-full" 
                    />
                    <div className="ml-3">
                      <h4 className="font-medium text-foreground">{coin.name}</h4>
                      <p className="text-xs text-muted-foreground">${coin.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-foreground">
                      ${Number(coin.currentPrice).toFixed(coin.currentPrice < 0.01 ? 8 : 5)}
                    </p>
                    <p className={`text-xs ${Number(coin.priceChangePercentage) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Number(coin.priceChangePercentage) >= 0 ? '+' : ''}{coin.priceChangePercentage}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              // Empty state
              <div className="text-center py-4">
                <p className="text-muted-foreground">No coins are currently being tracked.</p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => setIsDialogOpen(true)}
            >
              <span className="material-icons text-sm mr-1">add</span>
              <span>Add Coin</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Coin Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Coin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Coin Symbol (e.g., DOGE, SHIB)</Label>
              <Input
                id="symbol"
                placeholder="Enter coin symbol"
                value={newCoinSymbol}
                onChange={(e) => setNewCoinSymbol(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddCoin}
              disabled={addCoinMutation.isPending}
            >
              {addCoinMutation.isPending ? "Adding..." : "Add Coin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
