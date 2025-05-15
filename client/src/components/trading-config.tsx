import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import type { Config } from "@shared/schema";

interface TradingConfigProps {
  config?: Config;
  isLoading: boolean;
}

export default function TradingConfig({ config, isLoading }: TradingConfigProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local state to track changes
  const [buyThreshold, setBuyThreshold] = useState<number | null>(null);
  const [sellThreshold, setSellThreshold] = useState<number | null>(null);
  const [autoTrading, setAutoTrading] = useState<boolean | null>(null);
  const [notifications, setNotifications] = useState<boolean | null>(null);
  const [riskLevel, setRiskLevel] = useState<string | null>(null);
  
  // Get current values (either from local state or from the config)
  const currentBuyThreshold = buyThreshold !== null ? buyThreshold : config?.buyThreshold ? Number(config.buyThreshold) : 0.65;
  const currentSellThreshold = sellThreshold !== null ? sellThreshold : config?.sellThreshold ? Number(config.sellThreshold) : 0.40;
  const currentAutoTrading = autoTrading !== null ? autoTrading : config?.autoTrading ?? true;
  const currentNotifications = notifications !== null ? notifications : config?.notifications ?? true;
  const currentRiskLevel = riskLevel !== null ? riskLevel : config?.riskLevel ?? "Medium";
  
  // Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: (config: Partial<Config>) => API.updateConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
      toast({
        title: "Configuration updated",
        description: "Your trading configuration has been saved.",
      });
      
      // Reset local state since changes are saved
      setBuyThreshold(null);
      setSellThreshold(null);
      setAutoTrading(null);
      setNotifications(null);
      setRiskLevel(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update configuration",
        description: error.message || "An error occurred while saving your configuration.",
        variant: "destructive",
      });
    }
  });
  
  // Handle save configuration
  const handleSaveConfig = () => {
    const updates: Partial<Config> = {};
    
    if (buyThreshold !== null) updates.buyThreshold = buyThreshold;
    if (sellThreshold !== null) updates.sellThreshold = sellThreshold;
    if (autoTrading !== null) updates.autoTrading = autoTrading;
    if (notifications !== null) updates.notifications = notifications;
    if (riskLevel !== null) updates.riskLevel = riskLevel;
    
    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      updateConfigMutation.mutate(updates);
    } else {
      toast({
        title: "No changes to save",
        description: "You haven't made any changes to your configuration.",
      });
    }
  };
  
  // Check if any values have been modified
  const hasChanges = buyThreshold !== null || 
                     sellThreshold !== null || 
                     autoTrading !== null || 
                     notifications !== null || 
                     riskLevel !== null;
  
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-lg font-medium text-foreground">Trading Configuration</h3>
        {isLoading ? (
          // Loading state
          <div className="mt-4 space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-10" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-10" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-full mt-2" />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Sentiment Threshold Sliders */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-muted-foreground">Buy Threshold</Label>
                  <span className="text-sm font-medium text-foreground">{currentBuyThreshold.toFixed(2)}</span>
                </div>
                <div className="mt-2">
                  <Slider
                    value={[currentBuyThreshold]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => setBuyThreshold(value[0])}
                    className="py-1"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-muted-foreground">Sell Threshold</Label>
                  <span className="text-sm font-medium text-foreground">{currentSellThreshold.toFixed(2)}</span>
                </div>
                <div className="mt-2">
                  <Slider
                    value={[currentSellThreshold]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => setSellThreshold(value[0])}
                    className="py-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Trading Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Auto-Trading</Label>
                <Switch
                  checked={currentAutoTrading}
                  onCheckedChange={(checked) => setAutoTrading(checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Trade Notifications</Label>
                <Switch
                  checked={currentNotifications}
                  onCheckedChange={(checked) => setNotifications(checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Risk Level</Label>
                <Select 
                  value={currentRiskLevel} 
                  onValueChange={(value) => setRiskLevel(value)}
                >
                  <SelectTrigger className="w-[130px] bg-secondary/20 border-border">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button
              className="w-full mt-2"
              onClick={handleSaveConfig}
              disabled={updateConfigMutation.isPending || !hasChanges}
            >
              {updateConfigMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
