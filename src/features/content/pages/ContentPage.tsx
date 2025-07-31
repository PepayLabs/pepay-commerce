import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentCard } from '../components/ContentCard';
import { PackageCard } from '../components/PackageCard';
import { CreateContentModal } from '../components/CreateContentModal';
import { CreatePackageModal } from '../components/CreatePackageModal';
import { fetchContent, ContentPreview } from '../api/content.api';
import { fetchPackages, PackagePreview, togglePackagePublication, deletePackage } from '../api/packages.api';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Filter,
  Package as PackageIcon,
  FileText,
  TrendingUp,
  DollarSign,
  Eye,
  BarChart3,
  Sparkles,
  Grid3X3,
  List,
  RefreshCw,
  SortAsc,
  SortDesc,
  Calendar,
  Loader2
} from 'lucide-react';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'price_high' | 'price_low' | 'popular' | 'revenue';
type FilterOption = 'all' | 'published' | 'draft' | 'public' | 'private';

export const ContentPage: React.FC = () => {
  // Content state
  const [content, setContent] = useState<ContentPreview[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentPage, setContentPage] = useState(0);
  const [contentHasMore, setContentHasMore] = useState(true);

  // Packages state
  const [packages, setPackages] = useState<PackagePreview[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [packagesPage, setPackagesPage] = useState(0);
  const [packagesHasMore, setPackagesHasMore] = useState(true);

  // UI state
  const [activeTab, setActiveTab] = useState<'content' | 'packages'>('content');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [createContentModalOpen, setCreateContentModalOpen] = useState(false);
  const [createPackageModalOpen, setCreatePackageModalOpen] = useState(false);

  const { toast } = useToast();
  const pageSize = 12;

  // Load initial data
  useEffect(() => {
    loadContent();
    loadPackages();
  }, []);

  const loadContent = async (reset = true) => {
    setContentLoading(true);
    try {
      const offset = reset ? 0 : contentPage * pageSize;
      const response = await fetchContent(pageSize, offset);
      
      if (reset) {
        setContent(response.content);
        setContentPage(1);
      } else {
        setContent(prev => [...prev, ...response.content]);
        setContentPage(prev => prev + 1);
      }
      
      setContentHasMore(response.pagination.has_more);
    } catch (error: any) {
      toast({
        title: "Failed to load content",
        description: "Could not load your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setContentLoading(false);
    }
  };

  const loadPackages = async (reset = true) => {
    setPackagesLoading(true);
    try {
      const offset = reset ? 0 : packagesPage * pageSize;
      const response = await fetchPackages(pageSize, offset);
      
      if (reset) {
        setPackages(response.packages);
        setPackagesPage(1);
      } else {
        setPackages(prev => [...prev, ...response.packages]);
        setPackagesPage(prev => prev + 1);
      }
      
      setPackagesHasMore(response.pagination.has_more);
    } catch (error: any) {
      toast({
        title: "Failed to load packages",
        description: "Could not load your packages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPackagesLoading(false);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'content') {
      loadContent();
    } else {
      loadPackages();
    }
  };

  const handleLoadMore = () => {
    if (activeTab === 'content' && !contentLoading && contentHasMore) {
      loadContent(false);
    } else if (activeTab === 'packages' && !packagesLoading && packagesHasMore) {
      loadPackages(false);
    }
  };

  const handleTogglePackagePublication = async (packageId: string, isPublished: boolean) => {
    try {
      await togglePackagePublication(packageId, isPublished);
      
      // Update local state
      setPackages(prev => prev.map(pkg => 
        pkg.package_id === packageId 
          ? { ...pkg, is_published: isPublished, published_at: isPublished ? new Date().toISOString() : undefined }
          : pkg
      ));

      toast({
        title: isPublished ? "Package published! 🎉" : "Package unpublished",
        description: isPublished 
          ? "Your package is now live and available for purchase."
          : "Your package has been hidden from public view.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update package",
        description: error.response?.data?.message || "An error occurred while updating the package.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return;
    }

    try {
      await deletePackage(packageId);
      
      // Remove from local state
      setPackages(prev => prev.filter(pkg => pkg.package_id !== packageId));

      toast({
        title: "Package deleted successfully",
        description: "The package has been permanently removed.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete package",
        description: error.response?.data?.message || "An error occurred while deleting the package.",
        variant: "destructive",
      });
    }
  };

  const handleContentCreated = () => {
    loadContent(); // Refresh content list
  };

  const handlePackageCreated = () => {
    loadPackages(); // Refresh packages list
  };

  // Filter and sort content
  const filteredContent = content.filter(item => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    switch (filterBy) {
      case 'published':
        return item.is_published;
      case 'draft':
        return !item.is_published;
      case 'public':
        return item.is_public;
      case 'private':
        return !item.is_public;
      default:
        return true;
    }
  }).sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'price_high':
        return b.price - a.price;
      case 'price_low':
        return a.price - b.price;
      case 'popular':
        return b.view_count - a.view_count;
      case 'revenue':
        return (b.price * b.purchase_count) - (a.price * a.purchase_count);
      default: // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Filter and sort packages
  const filteredPackages = packages.filter(item => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    switch (filterBy) {
      case 'published':
        return item.is_published;
      case 'draft':
        return !item.is_published;
      case 'public':
        return item.is_public;
      case 'private':
        return !item.is_public;
      default:
        return true;
    }
  }).sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'price_high':
        return b.package_price - a.package_price;
      case 'price_low':
        return a.package_price - b.package_price;
      case 'popular':
        return b.view_count - a.view_count;
      case 'revenue':
        return (b.package_price * b.purchase_count) - (a.package_price * a.purchase_count);
      default: // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Calculate summary stats
  const contentStats = {
    total: content.length,
    published: content.filter(c => c.is_published).length,
    totalRevenue: content.reduce((sum, c) => sum + (c.price * c.purchase_count), 0),
    totalViews: content.reduce((sum, c) => sum + c.view_count, 0)
  };

  const packageStats = {
    total: packages.length,
    published: packages.filter(p => p.is_published).length,
    totalRevenue: packages.reduce((sum, p) => sum + (p.package_price * p.purchase_count), 0),
    totalViews: packages.reduce((sum, p) => sum + p.view_count, 0)
  };

  const getSortIcon = () => {
    if (sortBy === 'oldest' || sortBy === 'price_low') {
      return <SortAsc className="h-4 w-4" />;
    }
    return <SortDesc className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
            Content Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Create, manage, and monetize your premium content and packages
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={contentLoading || packagesLoading}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`h-4 w-4 sm:mr-2 ${(contentLoading || packagesLoading) ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={() => activeTab === 'content' ? setCreateContentModalOpen(true) : setCreatePackageModalOpen(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white flex-1 sm:flex-none"
            size="sm"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="sm:hidden">Create</span>
            <span className="hidden sm:inline">Create {activeTab === 'content' ? 'Content' : 'Package'}</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Enhanced Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
              {activeTab === 'content' ? (
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              ) : (
                <PackageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'content' ? contentStats.total : packageStats.total}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {activeTab === 'content' ? 'Content' : 'Packages'}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/20 rounded-lg flex-shrink-0">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'content' ? contentStats.published : packageStats.published}
              </div>
              <div className="text-xs text-muted-foreground">Published</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {(activeTab === 'content' ? contentStats.totalViews : packageStats.totalViews).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex-shrink-0">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                ${(activeTab === 'content' ? contentStats.totalRevenue : packageStats.totalRevenue).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Revenue</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'content' | 'packages')}>
        {/* Controls - Responsive: Stacked on mobile, single row on large screens */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Tabs - Always visible */}
          <TabsList className="grid w-full sm:w-fit grid-cols-2 bg-gray-100 dark:bg-gray-800 lg:order-first">
            <TabsTrigger value="content" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Content</span>
              <span className="xs:hidden">Items</span>
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <PackageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Packages</span>
              <span className="xs:hidden">Bundles</span>
            </TabsTrigger>
          </TabsList>

          {/* Controls Row - Single row on large screens */}
          <div className="flex flex-col sm:flex-row lg:flex-row gap-3 lg:items-center">
            {/* Search Bar */}
            <div className="relative lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 sm:h-9"
              />
            </div>

            {/* Filter & Sort - Side by side on mobile, inline on large */}
            <div className="flex gap-2 lg:gap-3">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="flex-1 lg:w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm touch-manipulation"
              >
                <option value="all">All Items</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="flex-1 lg:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm touch-manipulation"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_high">Price: High to Low</option>
                <option value="price_low">Price: Low to High</option>
                <option value="popular">Most Popular</option>
                <option value="revenue">Highest Revenue</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden w-fit mx-auto sm:mx-0 lg:mx-0">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none px-3 h-10 sm:h-9"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none px-3 h-10 sm:h-9"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Grid - Back to original 3-column max */}
        <TabsContent value="content" className="mt-6">
          {filteredContent.length === 0 && !contentLoading ? (
            <Card className="p-6 sm:p-12 text-center">
              <div className="max-w-sm mx-auto">
                <div className="mb-4">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery || filterBy !== 'all' ? 'No content found' : 'No content yet'}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6">
                  {searchQuery || filterBy !== 'all' 
                    ? 'Try adjusting your search or filters.'
                    : 'Create your first piece of premium content to start monetizing.'
                  }
                </p>
                {!searchQuery && filterBy === 'all' && (
                  <Button
                    onClick={() => setCreateContentModalOpen(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Content
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <>
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' 
                  : 'space-y-3 sm:space-y-4'
              }>
                {filteredContent.map((item) => (
                  <ContentCard
                    key={item.content_id}
                    content={item}
                    isExpanded={viewMode === 'list'}
                  />
                ))}
              </div>

              {/* Load More - Enhanced Mobile Button */}
              {(contentHasMore || contentLoading) && (
                <div className="text-center mt-6 sm:mt-8">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    disabled={contentLoading}
                    className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                  >
                    {contentLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Content'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="packages" className="mt-6">
          {/* Same pattern - 3 columns max */}
          {filteredPackages.length === 0 && !packagesLoading ? (
            <Card className="p-6 sm:p-12 text-center">
              <div className="max-w-sm mx-auto">
                <div className="mb-4">
                  <PackageIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery || filterBy !== 'all' ? 'No packages found' : 'No packages yet'}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6">
                  {searchQuery || filterBy !== 'all' 
                    ? 'Try adjusting your search or filters.'
                    : 'Bundle your content together to offer amazing deals.'
                  }
                </p>
                {!searchQuery && filterBy === 'all' && (
                  <Button
                    onClick={() => setCreatePackageModalOpen(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Package
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <>
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' 
                  : 'space-y-3 sm:space-y-4'
              }>
                {filteredPackages.map((item) => (
                  <PackageCard
                    key={item.package_id}
                    package={item}
                    isExpanded={viewMode === 'list'}
                    onTogglePublication={handleTogglePackagePublication}
                    onDelete={handleDeletePackage}
                  />
                ))}
              </div>

              {/* Load More */}
              {(packagesHasMore || packagesLoading) && (
                <div className="text-center mt-6 sm:mt-8">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    disabled={packagesLoading}
                    className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                  >
                    {packagesLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Packages'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateContentModal
        isOpen={createContentModalOpen}
        onClose={() => setCreateContentModalOpen(false)}
        onSuccess={handleContentCreated}
      />

      <CreatePackageModal
        isOpen={createPackageModalOpen}
        onClose={() => setCreatePackageModalOpen(false)}
        onSuccess={handlePackageCreated}
      />
    </div>
  );
};
