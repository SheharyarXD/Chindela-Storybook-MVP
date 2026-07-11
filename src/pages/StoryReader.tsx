import { useParams } from "react-router";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Volume2,
  Shield,
  User,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router";

export default function StoryReader() {
  const { id } = useParams<{ id: string }>();
  const storyId = parseInt(id || "0");
  const { data: story } = trpc.story.byId.useQuery({ id: storyId });
  const { data: lessons } = trpc.story.lessons.useQuery({ storyId });
  const { data: safetyHeaders } = trpc.safety.active.useQuery();

  const [currentPage, setCurrentPage] = useState(0);

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );
  }

  const allPages = [
    // Cover page
    {
      type: "cover" as const,
      title: story.title,
      description: story.description,
      coverImage: story.coverImage,
      character: story.character,
    },
    // Character intro page
    ...(story.character
      ? [{
          type: "character" as const,
          character: story.character,
        }]
      : []),
    // Lesson pages
    ...(lessons || []).map((lesson) => ({
      type: "lesson" as const,
      lesson,
    })),
    // Moral lesson page
    ...(story.moralLesson
      ? [{
          type: "moral" as const,
          moralLesson: story.moralLesson,
        }]
      : []),
  ];

  const totalPages = allPages.length;
  const currentData = allPages[currentPage];

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage((p) => p + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  // A4 aspect ratio container
  const a4Style = {
    aspectRatio: "210/297",
    maxHeight: "80vh",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/stories">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Library
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {story.ageGroup?.name}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Day {story.dayNumber}
            </Badge>
          </div>
        </div>

        {/* Safety Header */}
        {safetyHeaders && safetyHeaders.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              {safetyHeaders[Math.floor(Math.random() * safetyHeaders.length)]?.message}
            </p>
          </div>
        )}

        {/* Storybook Container - A4 Aspect Ratio */}
        <div className="flex justify-center">
          <div
            className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border-8 border-amber-100 overflow-hidden relative"
            style={a4Style}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-8 overflow-y-auto"
              >
                {currentData?.type === "cover" && (
                  <CoverPage data={currentData} story={story} />
                )}
                {currentData?.type === "character" && (
                  <CharacterPage character={currentData.character} />
                )}
                {currentData?.type === "lesson" && (
                  <LessonPage lesson={currentData.lesson} />
                )}
                {currentData?.type === "moral" && (
                  <MoralPage moralLesson={currentData.moralLesson} story={story} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {/* Page dots */}
              <div className="flex justify-center gap-1 mt-3">
                {allPages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentPage ? "bg-amber-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoverPage({ data, story }: { data: any; story: any }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      {data.coverImage ? (
        <img src={data.coverImage} alt="" className="w-48 h-48 object-cover rounded-xl mb-6 shadow-lg" />
      ) : (
        <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-amber-300 to-orange-300 flex items-center justify-center mb-6 shadow-lg">
          <BookOpen className="h-20 w-20 text-white/70" />
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h1>
      <p className="text-gray-600 mb-6 max-w-md">{data.description}</p>
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          Day {story.dayNumber}
        </span>
        {data.character && (
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            Featuring {data.character.name}
          </span>
        )}
      </div>
      {story.theme && (
        <Badge className="mt-4 bg-amber-500">{story.theme}</Badge>
      )}
    </div>
  );
}

function CharacterPage({ character }: { character: any }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      {character.imageUrl ? (
        <img
          src={character.imageUrl}
          alt={character.name}
          className="w-40 h-40 object-cover rounded-full mb-6 border-4 shadow-lg"
          style={{ borderColor: character.color || "#FFB347" }}
        />
      ) : (
        <div
          className="w-40 h-40 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-6 border-4 shadow-lg"
          style={{ backgroundColor: character.color || "#FFB347", borderColor: character.color || "#FFB347" }}
        >
          {character.name?.[0]}
        </div>
      )}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Meet {character.name}</h2>
      <p className="text-gray-600 mb-4 max-w-md">{character.description}</p>
      <p className="text-sm text-gray-500 mb-4">
        <strong>Personality:</strong> {character.personality}
      </p>
      <blockquote className="italic text-amber-600 text-lg">
        "{character.catchphrase}"
      </blockquote>
    </div>
  );
}

function LessonPage({ lesson }: { lesson: any }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline">Page {lesson.pageNumber}</Badge>
        {lesson.audioUrl && (
          <Badge variant="outline" className="text-blue-500">
            <Volume2 className="h-3 w-3 mr-1" />
            Audio
          </Badge>
        )}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">{lesson.title}</h2>

      {lesson.imageUrl && (
        <img
          src={lesson.imageUrl}
          alt=""
          className="w-full max-h-40 object-cover rounded-lg mb-4"
        />
      )}

      <div className="prose prose-sm max-w-none flex-1">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {lesson.content}
        </p>
      </div>

      {lesson.characterDialogue && (
        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-sm text-amber-800 italic">"{lesson.characterDialogue}"</p>
        </div>
      )}

      {lesson.interactiveElement && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700 font-medium">
            Interactive Activity: {lesson.interactiveElement}
          </p>
        </div>
      )}
    </div>
  );
}

function MoralPage({ moralLesson, story }: { moralLesson: string; story: any }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-orange-300 flex items-center justify-center mb-6">
        <BookOpen className="h-12 w-12 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">The Moral of the Story</h2>
      <blockquote className="text-xl text-gray-700 italic mb-6 max-w-md">
        "{moralLesson}"
      </blockquote>
      <p className="text-sm text-gray-500">
        Thank you for reading "{story.title}"!
      </p>
      <div className="mt-6">
        <Link to="/child/diary">
          <Button className="bg-amber-500 hover:bg-amber-600">
            Write in Your Diary
          </Button>
        </Link>
      </div>
    </div>
  );
}
