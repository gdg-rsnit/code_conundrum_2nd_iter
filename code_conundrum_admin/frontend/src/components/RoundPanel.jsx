import { useState } from "react";

const mockRounds = [
  { id: 1, number: 1, status: "DRAFT", duration: 300, questions: 5 },
  { id: 2, number: 2, status: "LIVE", duration: 600, questions: 8 },
  { id: 3, number: 3, status: "ENDED", duration: 900, questions: 6 },
];

const makeAnswer = () => ({ code: "", isDecoy: true });
const makeQuestion = () => ({
  question: "",
  difficulty: "EASY",
  answers: [makeAnswer(), makeAnswer()],
  correctAnswerIndex: 0,
});

export default function RoundPanel() {
  const [form, setForm] = useState({
    number: "",
    duration: "",
    questions: [makeQuestion()],
  });
  const [errors, setErrors] = useState({});

  const handleValidate = () => {
    const newErrors = {};
    if (!form.number || Number(form.number) <= 0) newErrors.number = "Valid number required";
    if (!form.duration || Number(form.duration) < 60) newErrors.duration = "Min 60 seconds";
    if (!form.questions.length) newErrors.questions = "At least one question is required";

    form.questions.forEach((q, questionIndex) => {
      if (!q.question.trim()) {
        newErrors[`q_${questionIndex}_question`] = "Question text is required";
      }
      if (q.answers.length < 2) {
        newErrors[`q_${questionIndex}_answers`] = "Each question must have at least 2 answers";
      }
      q.answers.forEach((a, answerIndex) => {
        if (!a.code.trim()) {
          newErrors[`q_${questionIndex}_a_${answerIndex}`] = "Answer code is required";
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onCreateRound = () => {
    if (!handleValidate()) {
      return;
    }
  };

  const addQuestion = () => {
    setForm((prev) => ({ ...prev, questions: [...prev.questions, makeQuestion()] }));
  };

  const removeQuestion = (questionIndex) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== questionIndex),
    }));
  };

  const updateQuestion = (questionIndex, patch) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, index) =>
        index === questionIndex ? { ...question, ...patch } : question
      ),
    }));
  };

  const addAnswer = (questionIndex) => {
    const question = form.questions[questionIndex];
    updateQuestion(questionIndex, {
      answers: [...question.answers, makeAnswer()],
    });
  };

  const removeAnswer = (questionIndex, answerIndex) => {
    const question = form.questions[questionIndex];
    if (question.answers.length <= 2) {
      return;
    }

    const nextAnswers = question.answers.filter((_, index) => index !== answerIndex);
    const nextCorrectIndex =
      question.correctAnswerIndex === answerIndex
        ? 0
        : question.correctAnswerIndex > answerIndex
          ? question.correctAnswerIndex - 1
          : question.correctAnswerIndex;

    updateQuestion(questionIndex, {
      answers: nextAnswers,
      correctAnswerIndex: nextCorrectIndex,
    });
  };

  const updateAnswer = (questionIndex, answerIndex, value) => {
    const question = form.questions[questionIndex];
    const nextAnswers = question.answers.map((answer, index) =>
      index === answerIndex ? { ...answer, code: value } : answer
    );
    updateQuestion(questionIndex, { answers: nextAnswers });
  };

  const markCorrectAnswer = (questionIndex, answerIndex) => {
    updateQuestion(questionIndex, { correctAnswerIndex: answerIndex });
  };

  // Helper to get status styling
  const getStatusStyle = (status) => {
    const styles = {
      DRAFT: { bg: "bg-orange-400/10", border: "border-orange-400", text: "text-orange-300", icon: "⏸️", glow: "shadow-orange-400/20" },
      LIVE: { bg: "bg-green-400/10", border: "border-green-400", text: "text-green-300", icon: "🔴", glow: "shadow-green-400/20" },
      ENDED: { bg: "bg-red-400/10", border: "border-red-400", text: "text-red-300", icon: "⏹️", glow: "shadow-red-400/20" }
    };
    return styles[status];
  };

  return (
    <>
      {/* Create Round Form */}
      <div className="panel bg-linear-to-br from-cyan-400/5 to-blue-400/5 border-cyan-400/50">
        <h2 className="panel-title">
          <span className="text-2xl">➕</span>
          Create New Round (with Questions + Answers)
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                className={`input ${errors.number ? "border-red-400 bg-red-400/5" : ""}`}
                placeholder="Round Number"
                type="number"
                min="1"
                value={form.number}
                onChange={(e) => {
                  setForm({ ...form, number: e.target.value });
                  if (errors.number) setErrors({ ...errors, number: "" });
                }}
              />
              {errors.number && <p className="text-xs text-red-400 mt-1">⚠️ {errors.number}</p>}
            </div>

            <div>
              <input
                className={`input ${errors.duration ? "border-red-400 bg-red-400/5" : ""}`}
                placeholder="Duration (seconds)"
                type="number"
                min="60"
                value={form.duration}
                onChange={(e) => {
                  setForm({ ...form, duration: e.target.value });
                  if (errors.duration) setErrors({ ...errors, duration: "" });
                }}
              />
              {errors.duration && <p className="text-xs text-red-400 mt-1">⚠️ {errors.duration}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <h3 className="text-sm font-bold text-cyan-200">Questions Builder</h3>
            <button type="button" className="btn btn-green text-xs" onClick={addQuestion}>
              ➕ Add Question
            </button>
          </div>

          <div className="space-y-4">
            {form.questions.map((question, questionIndex) => (
              <div key={`question-${questionIndex}`} className="rounded-lg border border-cyan-400/30 bg-black/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-cyan-300">Question {questionIndex + 1}</p>
                  {form.questions.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger text-xs"
                      onClick={() => removeQuestion(questionIndex)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <textarea
                  className={`input min-h-[84px] ${errors[`q_${questionIndex}_question`] ? "border-red-400 bg-red-400/5" : ""}`}
                  placeholder="Enter question text"
                  value={question.question}
                  onChange={(event) =>
                    updateQuestion(questionIndex, { question: event.target.value })
                  }
                />
                {errors[`q_${questionIndex}_question`] && (
                  <p className="text-xs text-red-400 mb-2">⚠️ {errors[`q_${questionIndex}_question`]}</p>
                )}

                <select
                  className="input"
                  value={question.difficulty}
                  onChange={(event) =>
                    updateQuestion(questionIndex, { difficulty: event.target.value })
                  }
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>

                <div className="space-y-2">
                  {question.answers.map((answer, answerIndex) => {
                    const answerErrorKey = `q_${questionIndex}_a_${answerIndex}`;
                    const isCorrect = question.correctAnswerIndex === answerIndex;
                    return (
                      <div key={`answer-${questionIndex}-${answerIndex}`} className="rounded border border-cyan-400/20 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            checked={isCorrect}
                            onChange={() => markCorrectAnswer(questionIndex, answerIndex)}
                            name={`correct-answer-${questionIndex}`}
                          />
                          <span className="text-xs text-cyan-200">Mark as correct answer</span>
                          {question.answers.length > 2 && (
                            <button
                              type="button"
                              className="ml-auto btn btn-danger text-xs"
                              onClick={() => removeAnswer(questionIndex, answerIndex)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <textarea
                          className={`input min-h-[72px] mb-0 ${errors[answerErrorKey] ? "border-red-400 bg-red-400/5" : ""}`}
                          placeholder={`Answer snippet ${answerIndex + 1}`}
                          value={answer.code}
                          onChange={(event) =>
                            updateAnswer(questionIndex, answerIndex, event.target.value)
                          }
                        />
                        {errors[answerErrorKey] && (
                          <p className="text-xs text-red-400 mt-1">⚠️ {errors[answerErrorKey]}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="btn btn-cyan text-xs mt-3"
                  onClick={() => addAnswer(questionIndex)}
                >
                  ➕ Add Answer Snippet
                </button>
              </div>
            ))}
          </div>

          {errors.questions && <p className="text-xs text-red-400">⚠️ {errors.questions}</p>}

          <button
            className="w-full btn btn-cyan font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-cyan-400/50"
            onClick={onCreateRound}
          >
            🚀 Create Round with Questions
          </button>
        </div>
      </div>

      {/* Rounds Grid */}
      <div>
        <h2 className="text-lg font-bold mb-6 text-cyan-300">📊 All Rounds ({mockRounds.length})</h2>
        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
          {mockRounds.map((r) => {
            const style = getStatusStyle(r.status);
            return (
              <div 
                key={r.id} 
                className={`panel ${style.bg} border-2 ${style.border} hover:shadow-xl ${style.glow} transition-all duration-300 hover:-translate-y-1`}
              >
                {/* Header with status */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-5xl font-black text-cyan-300">#{r.number}</div>
                    <p className="text-xs text-gray-400">Round</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full border ${style.border} ${style.bg}`}>
                    <span className="text-sm font-bold flex items-center gap-1">
                      {style.icon}
                      <span className={style.text}>{r.status}</span>
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-cyan-400/20">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{r.duration}s</p>
                    <p className="text-xs text-gray-400">Duration</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{r.questions}</p>
                    <p className="text-xs text-gray-400">Questions</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  {r.status === "DRAFT" && (
                    <>
                      <button className="btn btn-cyan text-xs">✏️ Edit</button>
                      <button className="btn btn-green text-xs">▶️ Start</button>
                    </>
                  )}
                  {r.status === "LIVE" && (
                    <>
                      <button className="btn btn-orange text-xs">⏱️ Extend</button>
                      <button className="btn btn-danger text-xs">⏹️ End</button>
                    </>
                  )}
                  {r.status === "ENDED" && (
                    <>
                      <button className="btn btn-cyan text-xs">📊 Results</button>
                      <button className="btn btn-green text-xs">🔄 Reset</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}