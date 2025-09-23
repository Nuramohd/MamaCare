import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Heart, MessageCircle, Filter, Search, Send } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Community() {
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['/api/community/posts', filterCategory, searchTerm],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; category?: string }) => {
      const response = await apiRequest('POST', '/api/community/posts', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
      setNewPostOpen(false);
      setNewPostContent("");
      setNewPostCategory("");
      toast({
        title: "Post Shared Successfully",
        description: "Your experience has been shared with the community.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Share Post",
        description: error.message || "Please try again",
      });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest('POST', `/api/community/posts/${postId}/like`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Like Post",
        description: error.message || "Please try again",
      });
    },
  });

  const categories = [
    { value: "pregnancy", label: "Pregnancy", color: "bg-purple-100 text-purple-800" },
    { value: "childcare", label: "Child Care", color: "bg-blue-100 text-blue-800" },
    { value: "vaccination", label: "Vaccination", color: "bg-green-100 text-green-800" },
    { value: "nutrition", label: "Nutrition", color: "bg-orange-100 text-orange-800" },
    { value: "general", label: "General", color: "bg-gray-100 text-gray-800" },
  ];

  const getCategoryStyle = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
  };

  const getInitials = (firstName: string) => {
    return firstName?.[0]?.toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-xl h-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground" data-testid="text-page-title">Community</h1>
              <p className="text-xs text-muted-foreground">Share experiences with other mothers</p>
            </div>
          </div>
          <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-post">
                <Plus className="w-4 h-4 mr-2" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" data-testid="dialog-new-post">
              <DialogHeader>
                <DialogTitle>Share Your Experience</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category (optional)</label>
                  <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Your Message</label>
                  <Textarea
                    placeholder="Share your experience, ask questions, or offer advice to other mothers..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                    data-testid="textarea-post-content"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setNewPostOpen(false)}
                    className="flex-1"
                    data-testid="button-cancel-post"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => createPostMutation.mutate({
                      content: newPostContent,
                      category: newPostCategory || undefined,
                    })}
                    disabled={!newPostContent.trim() || createPostMutation.isPending}
                    className="flex-1"
                    data-testid="button-share-post"
                  >
                    {createPostMutation.isPending ? (
                      "Sharing..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Share
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {/* Community Guidelines */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">Welcome to MamaCare Community</h3>
                <p className="text-sm text-green-800 leading-relaxed">
                  Connect with other Kenyan mothers, share experiences, ask questions, and support each other 
                  on this beautiful journey of motherhood. Remember to be kind and respectful.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <div className="flex space-x-3 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-posts"
              />
            </div>
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-32" data-testid="select-filter-category">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Posts List */}
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <Card key={post.id} data-testid={`post-${post.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {getInitials(post.author?.firstName)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-sm text-card-foreground">
                          {post.author?.firstName || 'Anonymous'} {post.author?.lastName?.[0]}. 
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(post.createdAt)}
                        </span>
                        {post.category && (
                          <Badge className={`text-xs ${getCategoryStyle(post.category)}`}>
                            {categories.find(c => c.value === post.category)?.label || post.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center space-x-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs p-0 h-auto text-muted-foreground hover:text-red-500"
                          onClick={() => likePostMutation.mutate(post.id)}
                          data-testid={`button-like-${post.id}`}
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          {post.likesCount || 0}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs p-0 h-auto text-muted-foreground hover:text-blue-500"
                          data-testid={`button-comment-${post.id}`}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.commentsCount || 0}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center space-y-6 mt-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Users className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {filterCategory === 'all' ? 'No Posts Yet' : `No ${categories.find(c => c.value === filterCategory)?.label} Posts`}
              </h2>
              <p className="text-muted-foreground mb-6">
                Be the first to share your experience and start a conversation with other mothers.
              </p>
              <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" data-testid="button-first-post">
                    <Plus className="w-5 h-5 mr-2" />
                    Share Your Experience
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
            
            {/* Community Benefits */}
            <Card className="text-left">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Community Benefits:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Connect with other Kenyan mothers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-secondary" />
                    <span>Get advice and support from experienced moms</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-accent" />
                    <span>Share your journey and celebrate milestones</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
