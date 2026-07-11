import { useState } from "react";
import { useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  BookOpen,
  MessageSquare,
  Sparkles,
  Calendar,
  Smile,
  Frown,
  Zap,
  Heart,
  Wind,
} from "lucide-react";

export default function Diary() {
  useAuth({ redirectOnUnauthenticated: true });
  const { data: children } = trpc.child.list.useQuery();
  const [searchParams] = useSearchParams();
  const initialChild = searchParams.get("child");

  const [selectedChild, setSelectedChild] = useState<string>(initialChild || "all");

  const { data: entries } = trpc.diary.list.useQuery(
    { childId: parseInt(selectedChild) },
    { enabled: selectedChild !== "all" }
  );

  const { data: feedback } = trpc.diary.feedback.useQuery(
    { childId: parseInt(selectedChild) },
    { enabled: selectedChild !== "all" }
  );

  const moodIcons: Record<string, any> = {
    happy: Smile,
    sad: Frown,
    excited: Zap,
    calm: Wind,
    loved: Heart,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Diary Entries</h1>
            <p className="text-gray-500">View your children's daily good deeds</p>
          </div>

          <div className="mb-6">
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a child" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Children</SelectItem>
                {children?.map((child) => (
                  <SelectItem key={child.id} value={child.id.toString()}>
                    {child.name} ({child.ageGroup?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedChild === "all" ? (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a child to view their diary</h3>
              <p className="text-gray-500">Choose a child from the dropdown above</p>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Entries */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                  Entries ({entries?.length || 0})
                </h2>
                <div className="space-y-4">
                  {entries?.map((entry) => {
                    const MoodIcon = moodIcons[entry.mood || "happy"] || Smile;
                    const entryFeedback = feedback?.find(
                      (f) => f.entryId === entry.id
                    );

                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="overflow-hidden">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <MoodIcon className="h-5 w-5 text-amber-500" />
                                <span className="text-sm font-medium capitalize">
                                  {entry.mood || "happy"}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {entry.entryDate
                                  ? new Date(entry.entryDate).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>

                            {entry.textContent && (
                              <p className="text-gray-700 mb-3">{entry.textContent}</p>
                            )}

                            {entry.imageUrl && (
                              <img
                                src={entry.imageUrl}
                                alt="Diary entry"
                                className="w-full max-h-48 object-cover rounded-lg mb-3"
                              />
                            )}

                            {entryFeedback && (
                              <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="h-4 w-4 text-amber-500" />
                                  <span className="text-sm font-medium text-amber-700">
                                    {entryFeedback.characterName || "Chindela"} says:
                                  </span>
                                </div>
                                <p className="text-sm text-amber-800">
                                  {entryFeedback.positiveFeedback}
                                </p>
                              </div>
                            )}

                            {entry.story && (
                              <Badge variant="outline" className="mt-3">
                                From: {entry.story.title}
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  }) || (
                    <p className="text-gray-500 text-center py-8">No diary entries yet.</p>
                  )}
                </div>
              </div>

              {/* AI Feedback Summary */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI Feedback Summary
                </h2>
                <div className="space-y-4">
                  {feedback?.map((fb) => (
                    <Card key={fb.id} className="overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-400" />
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-5 w-5 text-purple-500" />
                          <span className="font-medium text-purple-700">
                            {fb.characterName || "Chindela"}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Positive Feedback
                            </p>
                            <p className="text-sm text-gray-700">{fb.positiveFeedback}</p>
                          </div>

                          {fb.reflectionGuidance && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Reflection
                              </p>
                              <p className="text-sm text-gray-700">{fb.reflectionGuidance}</p>
                            </div>
                          )}

                          {fb.encouragement && (
                            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                                Encouragement
                              </p>
                              <p className="text-sm text-green-700">{fb.encouragement}</p>
                            </div>
                          )}

                          {fb.safeSuggestions && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                Suggestion
                              </p>
                              <p className="text-sm text-blue-700">{fb.safeSuggestions}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )) || (
                    <p className="text-gray-500 text-center py-8">No AI feedback yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
