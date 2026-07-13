import { useState } from "react";
import { trpc } from "@/providers/trpcClient";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { BookOpen, Search, Calendar, User } from "lucide-react";

export default function StoryBrowser() {
  const { data: stories } = trpc.story.list.useQuery();
  const { data: ageGroups } = trpc.ageGroup.list.useQuery();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = stories?.filter((s) => {
    const matchAge = selectedAgeGroup === "all" || s.ageGroupId?.toString() === selectedAgeGroup;
    const matchSearch = !search || s.title?.toLowerCase().includes(search.toLowerCase());
    return matchAge && matchSearch && s.isActive;
  }) || [];

  const colorMap: Record<string, string> = {
    "3-4 years": "from-pink-400 to-rose-400",
    "5-7 years": "from-green-400 to-emerald-400",
    "8-10 years": "from-blue-400 to-cyan-400",
    "11-13 years": "from-purple-400 to-violet-400",
    "14-16 years": "from-amber-400 to-orange-400",
    "18+": "from-gray-400 to-slate-400",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Story Library</h1>
            <p className="text-gray-500">Browse all available stories</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search stories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Age Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Age Groups</SelectItem>
                {ageGroups?.map((ag) => (
                  <SelectItem key={ag.id} value={ag.id.toString()}>
                    {ag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/stories/${story.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group h-full">
                    <div className={`h-32 bg-gradient-to-br ${colorMap[story.ageGroup?.name] || "from-amber-400 to-orange-400"} relative`}>
                      {story.coverImage ? (
                        <img src={story.coverImage} alt="" className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-white/50" />
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-white/90 text-gray-800 hover:bg-white">
                          {story.ageGroup?.name}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-amber-600 transition-colors">
                        {story.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {story.description || "An interactive story for children."}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Day {story.dayNumber}
                        </span>
                        {story.character && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {story.character.name}
                          </span>
                        )}
                      </div>
                      {story.theme && (
                        <Badge variant="outline" className="mt-3 text-xs">
                          {story.theme}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No stories found matching your criteria.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
