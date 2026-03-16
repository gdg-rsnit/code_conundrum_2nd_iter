import { useState } from "react";

const mockQuestions = [
  { id: 1, text: "Find the bug in this function", difficulty: "EASY", correct: 1, total: 4, round: "Round 2" },
  { id: 2, text: "Optimize this algorithm", difficulty: "HARD", correct: 1, total: 3, round: "Round 2" },
  { id: 3, text: "Trace the execution path", difficulty: "MEDIUM", correct: 1, total: 5, round: "Round 2" },
];

export default function QuestionsPanel() {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [difficultFilter, setDifficultFilter] = useState("ALL");

  const getDifficultyStyle = (difficulty) => {
    const styles = {
      EASY: { color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/50", icon: "🟢" },
      MEDIUM: { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/50", icon: "🟠" },
      HARD: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/50", icon: "🔴" }
    };
    return styles[difficulty];
  };

  const filteredQuestions = difficultFilter === "ALL" 
    ? mockQuestions 
    : mockQuestions.filter(q => q.difficulty === difficultFilter);

  return (
    <>
      {/* Header with Actions */}
      <div className="panel bg-linear-to-r from-green-400/5 to-cyan-400/5 border-green-400/50 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="panel-title m-0">
            <span className="text-2xl">📝</span>
            Question Bank
          </h2>
          <button className="btn btn-green uppercase font-bold">
            ➕ Add Question
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["ALL", "EASY", "MEDIUM", "HARD"].map(diff => (
            <button
              key={diff}
              onClick={() => setDifficultFilter(diff)}
              className={`px-4 py-2 rounded border text-xs font-bold transition ${
                difficultFilter === diff
                  ? "bg-green-400/20 border-green-400 text-green-300"
                  : "border-green-400/30 text-green-400/60 hover:bg-green-400/10"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, i) => {
            const style = getDifficultyStyle(q.difficulty);
            const correctPercentage = Math.round((q.correct / q.total) * 100);
            return (
              <div
                key={q.id}
                onClick={() => setSelectedQuestion(selectedQuestion === q.id ? null : q.id)}
                className={`panel bg-black/30 border-2 ${style.border} hover:shadow-lg transition-all cursor-pointer ${style.bg}`}
              >
                {/* Main Content */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl font-black text-cyan-400">Q{i + 1}</span>
                      <span className={`px-3 py-1 rounded-full border ${style.border} ${style.bg}`}>
                        <span className="text-xs font-bold flex items-center gap-1">
                          {style.icon} {q.difficulty}
                        </span>
                      </span>
                    </div>
                    <p className="font-semibold text-white mb-3">{q.text}</p>

                    {/* Stats Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Correct Snippets</span>
                        <span>{correctPercentage}%</span>
                      </div>
                      <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-gray-600">
                        <div
                          className={`h-full transition-all ${styles.bg === "bg-green-400/10" ? "bg-green-400" : styles.bg === "bg-orange-400/10" ? "bg-orange-400" : "bg-red-400"}`}
                          style={{ width: `${correctPercentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 text-right mt-1">
                        {q.correct}/{q.total} snippets marked correct
                      </div>
                    </div>
                  </div>

                  {/* Actions - Always Visible */}
                  <div className="flex gap-2 ml-4">
                    <button className="btn btn-cyan text-xs px-3! hover:shadow-md">
                      ✏️
                    </button>
                    <button className="btn btn-danger text-xs px-3! hover:shadow-md">
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedQuestion === q.id && (
                  <div className="mt-4 pt-4 border-t border-cyan-400/20 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-black/50 rounded border border-cyan-400/20">
                        <p className="text-xs text-gray-400">Round</p>
                        <p className="font-bold text-cyan-300">{q.round}</p>
                      </div>
                      <div className="p-3 bg-black/50 rounded border border-cyan-400/20">
                        <p className="text-xs text-gray-400">Total Submissions</p>
                        <p className="font-bold text-cyan-300">{q.total * 10}</p>
                      </div>
                    </div>

                    {/* Code Preview */}
                    <div className="bg-black rounded border border-green-400/30 p-3">
                      <p className="text-xs text-gray-400 mb-2">📄 Correct Answer Preview</p>
                      <code className="text-xs font-mono text-green-300 line-clamp-3">
                        function solve(input) {"{"}
                        return input.filter(x {"=>"} x % 2 === 0);
                        {"}"}
                      </code>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 btn btn-cyan text-xs font-bold">
                        👁️ View All Answers
                      </button>
                      <button className="flex-1 btn btn-orange text-xs font-bold">
                        🔧 Manage Snippets
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="panel text-center py-12">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-gray-400">No questions found</p>
          </div>
        )}
      </div>

      {/* Summary Card */}
      <div className="panel bg-linear-to-r from-blue-400/5 to-cyan-400/5 border-blue-400/50 mt-8">
        <h3 className="font-bold mb-4 text-cyan-300">📊 Question Summary</h3>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded bg-green-400/10 border border-green-400/30">
            <p className="text-xl font-black text-green-400">{mockQuestions.filter(q => q.difficulty === "EASY").length}</p>
            <p className="text-xs text-gray-400">Easy</p>
          </div>
          <div className="p-3 rounded bg-orange-400/10 border border-orange-400/30">
            <p className="text-xl font-black text-orange-400">{mockQuestions.filter(q => q.difficulty === "MEDIUM").length}</p>
            <p className="text-xs text-gray-400">Medium</p>
          </div>
          <div className="p-3 rounded bg-red-400/10 border border-red-400/30">
            <p className="text-xl font-black text-red-400">{mockQuestions.filter(q => q.difficulty === "HARD").length}</p>
            <p className="text-xs text-gray-400">Hard</p>
          </div>
          <div className="p-3 rounded bg-cyan-400/10 border border-cyan-400/30">
            <p className="text-xl font-black text-cyan-400">{mockQuestions.length}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
        </div>
      </div>
    </>
  );
}