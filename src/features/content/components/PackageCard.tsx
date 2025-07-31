import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PackagePreview, Package, fetchPackageById, formatPrice, formatFileSize, formatDuration } from '../api/packages.api';
import { EditPackageModal } from './EditPackageModal';
import { ImageFallback } from './ImageFallback';
import { 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff,
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2,
  Package as PackageIcon,
  Globe,
  Lock,
  Star,
  Percent,
  ShoppingCart,
  Play
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface PackageCardProps {
  package: PackagePreview;
  onTogglePublication?: (packageId: string, isPublished: boolean) => void;
  onDelete?: (packageId: string) => void;
  onPackageUpdated?: (updatedPackage: Package) => void;
  isExpanded?: boolean;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  package: packageData,
  onTogglePublication,
  onDelete,
  onPackageUpdated,
  isExpanded: controlledExpanded
}: PackageCardProps) => {
  const [isExpanded, setIsExpanded] = useState(controlledExpanded ?? false);
  const [coverMediaError, setCoverMediaError] = useState(false);
  const [fullPackage, setFullPackage] = useState<Package | null>(null);
  const [loadingFullPackage, setLoadingFullPackage] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { toast } = useToast();

  // Reset image error states when edit modal closes
  useEffect(() => {
    if (!editModalOpen) {
      setCoverMediaError(false);
    }
  }, [editModalOpen]);

  const expanded = controlledExpanded !== undefined ? controlledExpanded : isExpanded;
  const currentPackage = fullPackage || packageData;

  const toggleExpanded = async () => {
    if (controlledExpanded !== undefined) return;
    
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    // Lazy load full package when expanding
    if (newExpanded && !fullPackage && !loadingFullPackage) {
      await loadFullPackage();
    }
  };

  const loadFullPackage = async () => {
    setLoadingFullPackage(true);
    try {
      const fullPackageData = await fetchPackageById(packageData.package_id);
      setFullPackage(fullPackageData);
    } catch (error: any) {
      toast({
        title: "Failed to load full package details",
        description: error.response?.data?.message || "An error occurred while loading the package details.",
        variant: "destructive",
      });
    } finally {
      setLoadingFullPackage(false);
    }
  };

  const handlePublishToggle = async () => {
    if (publishing) return;
    
    setPublishing(true);
    try {
      await onTogglePublication?.(currentPackage.package_id, !currentPackage.is_published);
    } finally {
      setPublishing(false);
    }
  };

  const handleEdit = async () => {
    if (!fullPackage && !loadingFullPackage) {
      setLoadingFullPackage(true);
      try {
        const fullPackageData = await fetchPackageById(packageData.package_id);
        setFullPackage(fullPackageData);
        setEditModalOpen(true);
      } catch (error: any) {
        toast({
          title: "Failed to load package data",
          description: error.response?.data?.message || "An error occurred while loading the package data.",
          variant: "destructive",
        });
      } finally {
        setLoadingFullPackage(false);
      }
    } else if (fullPackage) {
      setEditModalOpen(true);
    }
  };

  const handlePackageUpdated = (updatedPackage: Package) => {
    setFullPackage(updatedPackage);
    onPackageUpdated?.(updatedPackage);
  };

  // Helper function to ensure numeric values
  const ensureNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Calculate revenue for this package
  const revenue = ensureNumber(packageData.package_price) * ensureNumber(packageData.purchase_count);

  return (
    <>
      <Card className="group w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {currentPackage.title}
                </h3>
                {packageData.is_featured && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                )}
              </div>
              
              {/* Essential badges only */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <PackageIcon className="h-3 w-3 mr-1" />
                  {packageData.content_count} items
                </Badge>

                {ensureNumber(packageData.discount_percentage) > 0 && (
                  <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <Percent className="h-3 w-3 mr-1" />
                    {ensureNumber(packageData.discount_percentage).toFixed(0)}% OFF
                  </Badge>
                )}

                <Badge variant={packageData.is_published ? 'default' : 'secondary'} className="text-xs">
                  {packageData.is_published ? '✅ Live' : '📝 Draft'}
                </Badge>

                <Badge variant="outline" className="text-xs">
                  {packageData.is_public ? (
                    <>
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePublishToggle} disabled={publishing}>
                  {currentPackage.is_published ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Publish
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete?.(currentPackage.package_id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {(packageData.description || packageData.short_metadata) && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {packageData.description || packageData.short_metadata}
            </p>
          )}

          {/* Price and Stats Row */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-3 border border-green-200/50 dark:border-green-800/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatPrice(ensureNumber(packageData.package_price))}
                </div>
                {ensureNumber(packageData.savings_amount) > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="line-through">{formatPrice(ensureNumber(packageData.individual_total_price))}</span>
                    <span className="ml-2 text-green-600 font-semibold">
                      Save {formatPrice(ensureNumber(packageData.savings_amount))}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-purple-600">
                  {formatPrice(revenue)}
                </div>
                <div className="text-xs text-muted-foreground">total revenue</div>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{packageData.view_count} views</span>
              </div>
              <div className="flex items-center gap-1">
                <ShoppingCart className="h-3 w-3" />
                <span>{packageData.purchase_count} sales</span>
              </div>
              <span>{formatFileSize(ensureNumber(packageData.total_size_bytes))}</span>
            </div>

            {/* Expand button */}
            {(packageData.description || packageData.short_metadata || packageData.cover_media_url) && controlledExpanded === undefined && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
                className="h-8 px-2 text-xs text-purple-600 hover:text-purple-800"
                disabled={loadingFullPackage}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    {loadingFullPackage ? 'Loading...' : 'Show more'}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Expanded Content */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
              
              {/* Loading State */}
              {loadingFullPackage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading package details...
                </div>
              )}

              {/* Package Contents */}
              {fullPackage?.content_items && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <PackageIcon className="h-4 w-4" />
                    Package Contents ({fullPackage.content_items.length} items)
                  </h4>
                  <div className="space-y-2">
                    {fullPackage.content_items.map((item, index) => (
                      <div key={item.content_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="text-xs text-muted-foreground font-medium w-6">
                            #{index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {item.title}
                            </h5>
                            <Badge variant="outline" className="text-xs capitalize mt-1">
                              {item.content_type}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          {formatPrice(item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Media Preview - In expanded section with controls */}
              {packageData.cover_media_url && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Package Preview
                  </h4>
                  <div className="w-full">
                    {coverMediaError ? (
                      <ImageFallback 
                        contentType="package"
                        title={packageData.title}
                        className="w-full h-64"
                        isLarge={true}
                      />
                    ) : packageData.cover_media_type === 'video' ? (
                      <video
                        src={packageData.cover_media_url}
                        className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-600 bg-black"
                        controls
                        onError={() => setCoverMediaError(true)}
                      />
                    ) : (
                      <img
                        src={packageData.cover_media_url}
                        alt={`${packageData.title} cover`}
                        className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-600"
                        onError={() => setCoverMediaError(true)}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>

      {/* Edit Modal */}
      {fullPackage && (
        <EditPackageModal
          package={fullPackage}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onPackageUpdated={handlePackageUpdated}
        />
      )}
    </>
  );
};