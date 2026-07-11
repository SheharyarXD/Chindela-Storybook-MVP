import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  PenLine,
  Send,
  Sparkles,
  Smile,
  Frown,
  Zap,
  Heart,
  Wind,
  Star,
  Calendar,
  Trophy,
  BookOpen,
  LogOut,
} from "lucide-react";

const moods = [
  { key: "happy", label: "Happy", icon: Smile, color: "bg-yellow-100 text-yellow-600 border-yellow-300" },
  { key: "excited", label: "Excited", icon: Zap, color: "bg-orange-100 text-orange-600 border-orange-300" },
  { key: "calm", label: "Calm", icon: Wind, color: "bg-blue-100 text-blue-600 border-blue-300" },
  { key: "loved", label: "Loved", icon: Heart, color: "bg-red-100 text-red-600 border-red-300" },
  { key: "sad", label: "Sad", icon: Frown, color: "bg-gray-100 text-gray-600 border-gray-300" },
];

export default function ChildDiary() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [selectedMood, setSelectedMood] = useState("happy");
  const [submitted, setSubmitted] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState<any>(null);
  const { data: characters } = trpc.character.list.useQuery();

  useEffect(() => {
    const session = localStorage.getItem("childSession");
    if (!session) {
      navigate("/child-login");
    }
  }, [navigate]);

  // Demo child ID - in production this would come from auth
  const demoChildId = 1;

  const createEntry = trpc.diary.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setText("");
      // Simulate getting feedback after a short delay
      setTimeout(() => {
        const charName = characters?.[0]?.name || "Chindela";
        setLatestFeedback({
          positiveFeedback: `Wow! That was such a kind thing you did! ${charName} is so proud of you! Your kindness shines brighter than a thousand stars!`,
          reflectionGuidance: "Think about how your kindness made someone else feel. How did it make YOU feel inside? When we help others, we help ourselves too!",
          encouragement: "Keep shining bright! The world needs more people like you! Every good deed creates ripples of happiness!",
          safeSuggestions: "Try giving someone a compliment today - it costs nothing but means everything! Your words have magical powers!",
          characterName: charName,
        });
      }, 1500);
    },
  });

  const handleSubmit = () => {
    if (!text.trim()) return;
    createEntry.mutate({
      childId: demoChildId,
      textContent: text,
      mood: selectedMood,
      entryDate: new Date().toISOString(),
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("childSession");
    navigate("/child-login");
  };

  const streakDays = 5;
  const totalEntries = 12;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-green-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/child">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
              <PenLine className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">My Diary</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-50 text-amber-700">
              <Trophy className="h-3 w-3 mr-1" />
              {streakDays} day streak
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <Card className="text-center border-2 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <Star className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{totalEntries}</p>
              <p className="text-xs text-gray-500">Entries</p>
            </CardContent>
          </Card>
          <Card className="text-center border-2 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <Trophy className="h-6 w-6 text-orange-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{streakDays}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </CardContent>
          </Card>
          <Card className="text-center border-2 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <Calendar className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleDateString("en", { weekday: "short" })}
              </p>
              <p className="text-xs text-gray-500">Today</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Entry Form */}
        {!submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-4 border-green-200 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400" />
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  What good deed did you do today?
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Write about something kind you did, or something that made you feel proud!
                </p>

                {/* Mood Selector */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">How are you feeling?</p>
                  <div className="flex gap-2 flex-wrap">
                    {moods.map((mood) => (
                      <button
                        key={mood.key}
                        onClick={() => setSelectedMood(mood.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                          selectedMood === mood.key
                            ? mood.color + " scale-105"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <mood.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Input */}
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Today I helped my friend by..."
                  className="min-h-[120px] text-base border-2 border-gray-200 focus:border-green-300 rounded-xl resize-none"
                />

                <Button
                  onClick={handleSubmit}
                  disabled={!text.trim() || createEntry.isPending}
                  className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-full h-12 text-lg font-bold gap-2"
                >
                  {createEntry.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Submit My Good Deed!
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
            >
              {/* Success Message */}
              <Card className="border-4 border-amber-200 overflow-hidden mb-6">
                <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-400" />
                <CardContent className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 to-orange-300 flex items-center justify-center mx-auto mb-4">
                      <Star className="h-10 w-10 text-white" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Amazing Job!
                  </h2>
                  <p className="text-gray-600">
                    Your good deed has been recorded! Check back soon for feedback from{" "}
                    {characters?.[0]?.name || "Chindela"}!
                  </p>
                  <Button
                    onClick={() => { setSubmitted(false); setLatestFeedback(null); }}
                    variant="outline"
                    className="mt-4 rounded-full"
                  >
                    Write Another Entry
                  </Button>
                </CardContent>
              </Card>

              {/* AI Feedback */}
              {latestFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-4 border-purple-200 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-400" />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">
                            {latestFeedback.characterName} has a message for you!
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            AI Feedback
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                          <p className="text-sm font-medium text-amber-700 mb-1">Positive Feedback</p>
                          <p className="text-gray-700">{latestFeedback.positiveFeedback}</p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                          <p className="text-sm font-medium text-blue-700 mb-1">Think About This</p>
                          <p className="text-gray-700">{latestFeedback.reflectionGuidance}</p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                          <p className="text-sm font-medium text-green-700 mb-1">Encouragement</p>
                          <p className="text-gray-700">{latestFeedback.encouragement}</p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                          <p className="text-sm font-medium text-purple-700 mb-1">Your Next Mission</p>
                          <p className="text-gray-700">{latestFeedback.safeSuggestions}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Previous Entries */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-500" />
            Previous Entries
          </h2>
          <div className="space-y-3">
            {[
              { text: "I helped my mom clean the kitchen today! It made her smile.", mood: "happy", date: "Yesterday" },
              { text: "I shared my favorite toy with my little brother.", mood: "loved", date: "2 days ago" },
              { text: "I said thank you to my teacher for helping me with math.", mood: "calm", date: "3 days ago" },
            ].map((entry, i) => {
              const moodData = moods.find((m) => m.key === entry.mood) || moods[0];
              return (
                <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${moodData.color.split(" ")[0]}`}>
                        <moodData.icon className={`h-4 w-4 ${moodData.color.split(" ")[1]}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 text-sm">{entry.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{entry.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
