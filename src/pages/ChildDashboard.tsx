import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  BookOpen,
  PenLine,
  Star,
  Trophy,
  Sparkles,
  LogOut,
  Shield,
} from "lucide-react";

export default function ChildDashboard() {
  const navigate = useNavigate();
  const { data: ageGroups } = trpc.ageGroup.list.useQuery();
  const { data: characters } = trpc.character.list.useQuery();
  const { data: safetyHeaders } = trpc.safety.active.useQuery();

  useEffect(() => {
    const session = localStorage.getItem("childSession");
    if (!session) {
      navigate("/child-login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("childSession");
    navigate("/child-login");
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-amber-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Chindela
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-50 text-amber-700">
              <Star className="h-3 w-3 mr-1" />
              Child Mode
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Safety Header */}
      {safetyHeaders && safetyHeaders.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2">
          <div className="container mx-auto flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-600">
              {safetyHeaders[0]?.message}
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          custom={0}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hello, Little Explorer!
          </h1>
          <p className="text-gray-500">What would you like to do today?</p>
        </motion.div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={1}
          >
            <Link to="/child/read/1">
              <Card className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group border-4 border-amber-200 hover:border-amber-300">
                <div className="h-32 bg-gradient-to-br from-amber-300 to-orange-300 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-white group-hover:scale-110 transition-transform" />
                </div>
                <CardContent className="p-6 text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Read Stories</h2>
                  <p className="text-sm text-gray-500">
                    Explore amazing stories with Chindela and friends!
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={2}
          >
            <Link to="/child/diary">
              <Card className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group border-4 border-green-200 hover:border-green-300">
                <div className="h-32 bg-gradient-to-br from-green-300 to-emerald-300 flex items-center justify-center">
                  <PenLine className="h-16 w-16 text-white group-hover:scale-110 transition-transform" />
                </div>
                <CardContent className="p-6 text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">My Diary</h2>
                  <p className="text-sm text-gray-500">
                    Write about your good deeds and get feedback!
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* Characters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          custom={3}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-center mb-6">
            <Sparkles className="h-6 w-6 inline text-amber-500 mr-2" />
            Meet Your Friends
          </h2>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {characters?.map((char, i) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Card className="text-center overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                  {char.imageUrl ? (
                    <img
                      src={char.imageUrl}
                      alt={char.name}
                      className="w-full h-24 object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-24 flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: char.color || "#FFB347" }}
                    >
                      {char.name?.[0]}
                    </div>
                  )}
                  <CardContent className="p-3">
                    <p className="font-bold text-sm">{char.name}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {char.catchphrase}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )) || (
              <>
                {["Chindela", "Silibidi", "Zuri"].map((name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <Card className="text-center overflow-hidden">
                      <div
                        className={`w-full h-24 flex items-center justify-center text-white text-2xl font-bold ${
                          i === 0
                            ? "bg-gradient-to-br from-amber-400 to-orange-400"
                            : i === 1
                            ? "bg-gradient-to-br from-green-400 to-emerald-400"
                            : "bg-gradient-to-br from-blue-400 to-cyan-400"
                        }`}
                      >
                        {name[0]}
                      </div>
                      <CardContent className="p-3">
                        <p className="font-bold text-sm">{name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {i === 0
                            ? "Roar with kindness!"
                            : i === 1
                            ? "Let's swing into learning!"
                            : "Big hearts make big changes!"}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </motion.div>

        {/* Age Groups */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          custom={4}
        >
          <h2 className="text-2xl font-bold text-center mb-6">
            <Trophy className="h-6 w-6 inline text-amber-500 mr-2" />
            Choose Your Age Group
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {ageGroups?.map((ag, i) => (
              <motion.div
                key={ag.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
              >
                <Card
                  className="text-center cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-amber-300"
                  onClick={() => navigate(`/stories?age=${ag.id}`)}
                >
                  <CardContent className="p-4">
                    <div
                      className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: ag.color || "#FFB347" }}
                    >
                      {ag.minAge}+
                    </div>
                    <p className="font-medium text-sm">{ag.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )) || (
              ["3-4", "5-7", "8-10", "11-13", "14-16", "18+"].map((age, i) => (
                <motion.div
                  key={age}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                >
                  <Card className="text-center cursor-pointer hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <p className="font-bold text-lg text-amber-600">{age}</p>
                      <p className="text-xs text-gray-500">years</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
