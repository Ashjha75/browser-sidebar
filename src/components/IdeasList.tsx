import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Tag,
  Calendar,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Mic,
} from 'lucide-react';
import { appwriteService } from '../services/appwrite.service';
import type { Idea, IdeaStatus } from '../types';

interface IdeasListProps {
  onCreateNew: () => void;
  onEdit: (idea: Idea) => void;
  refreshTrigger?: number;
}

export function IdeasList({ onCreateNew, onEdit, refreshTrigger }: IdeasListProps) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'All'>('All');
  const [stats, setStats] = useState({ total: 0, planning: 0, inProgress: 0, completed: 0 });

  useEffect(() => {
    loadIdeas();
  }, [refreshTrigger]);

  useEffect(() => {
    filterIdeas();
  }, [ideas, searchQuery, statusFilter]);

  const loadIdeas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await appwriteService.getCurrentUser();
      if (user) {
        const [fetchedIdeas, fetchedStats] = await Promise.all([
          appwriteService.listIdeas(user.$id),
          appwriteService.getIdeasStats(user.$id),
        ]);
        setIdeas(fetchedIdeas);
        setStats(fetchedStats);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load ideas');
    } finally {
      setIsLoading(false);
    }
  };

  const filterIdeas = () => {
    let filtered = ideas;

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter((idea) => idea.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(query) ||
          idea.description.toLowerCase().includes(query) ||
          idea.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredIdeas(filtered);
  };

  const handleDelete = async (ideaId: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) return;

    try {
      await appwriteService.deleteIdea(ideaId);
      await loadIdeas();
    } catch (err: any) {
      alert(err.message || 'Failed to delete idea');
    }
  };

  const getStatusIcon = (status: IdeaStatus) => {
    switch (status) {
      case 'Planning':
        return <Circle className="w-5 h-5 text-yellow-500" />;
      case 'In_Progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusBadge = (status: IdeaStatus) => {
    const styles = {
      Planning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      In_Progress: 'bg-blue-50 text-blue-700 border-blue-200',
      Completed: 'bg-green-50 text-green-700 border-green-200',
    };

    const labels = {
      Planning: '📋 Planning',
      In_Progress: '🚀 In Progress',
      Completed: '✅ Completed',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Ideas</h1>
          <p className="text-gray-600 mt-1">Track and manage your creative ideas</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick Access to Blank Page */}
          <a
            href="https://blank.page/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-blue-400 transition-all shadow-sm"
            title="Open Blank Page with Mic"
          >
            <FileText className="w-5 h-5" />
            <Mic className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Blank Page</span>
          </a>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Idea
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Ideas</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
          <div className="text-sm text-yellow-700 mb-1">Planning</div>
          <div className="text-3xl font-bold text-yellow-900">{stats.planning}</div>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <div className="text-sm text-blue-700 mb-1">In Progress</div>
          <div className="text-3xl font-bold text-blue-900">{stats.inProgress}</div>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <div className="text-sm text-green-700 mb-1">Completed</div>
          <div className="text-3xl font-bold text-green-900">{stats.completed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ideas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as IdeaStatus | 'All')}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Planning">Planning</option>
              <option value="In_Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Ideas List */}
      {filteredIdeas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-6xl mb-4">💡</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'All'
              ? 'No ideas found'
              : 'No ideas yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter !== 'All'
              ? 'Try adjusting your filters'
              : 'Start by creating your first idea'}
          </p>
          {!searchQuery && statusFilter === 'All' && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create First Idea
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.$id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(idea.status)}
                    {getStatusBadge(idea.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(idea)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(idea.$id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {idea.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {idea.description}
                </p>

                {/* Tags */}
                {idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {idea.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                    {idea.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{idea.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <Calendar className="w-3 h-3" />
                  {formatDate(idea.$createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
