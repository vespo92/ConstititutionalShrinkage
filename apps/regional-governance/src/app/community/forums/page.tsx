'use client';

import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { mockForumTopics, mockForumPosts } from '@/lib/mock-data';
import ForumPost from '@/components/community/ForumPost';
import SearchBar from '@/components/shared/SearchBar';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import { useState } from 'react';

export default function ForumsPage() {
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const filteredPosts = mockForumPosts.filter(post => {
    if (search && !post.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedTopic && post.topicId !== selectedTopic) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link href="/community" className="inline-flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} className="mr-1" />
        Back to Community
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discussion Forums</h1>
          <p className="mt-1 text-gray-600">
            Join the conversation with your community
          </p>
        </div>
        <Link href="/community/forums/new">
          <Button>
            <Plus size={18} className="mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Topics */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent>
              <h3 className="font-medium text-gray-900 mb-3">Topics</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    !selectedTopic ? 'bg-pod-green-100 text-pod-green-700' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  All Topics
                </button>
                {mockForumTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                      selectedTopic === topic.id ? 'bg-pod-green-100 text-pod-green-700' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span className="flex items-center">
                      <span className="mr-2">{topic.icon}</span>
                      {topic.name}
                    </span>
                    <span className="text-xs text-gray-400">{topic.postCount}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Posts */}
        <div className="lg:col-span-3">
          <div className="mb-4">
            <SearchBar
              placeholder="Search discussions..."
              onSearch={setSearch}
            />
          </div>

          <div className="space-y-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <ForumPost key={post.id} post={post} showContent />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No discussions found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
