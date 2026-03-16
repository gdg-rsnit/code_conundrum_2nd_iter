import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { useGetRounds } from "../hooks/roundHook";
import {
  useCreateQuestionsWithAnswers,
  useDeleteQuestion,
  useDeleteQuestionsByRound,
  useGetQuestionsByRound,
  useUpdateQuestion,
} from "../hooks/questionHook";
import {
  useCreateAnswer,
  useDeleteAnswer,
  useDeleteAnswersByRound,
  useGetAnswersByRound,
  useUpdateAnswer,
} from "../hooks/answerHook";

const createDraftItem = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  question: "",
  correctAnswer: "",
});

const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (error?.name === "ZodError" && Array.isArray(error.issues)) {
    return error.issues.map((issue) => issue.message).join(", ");
  }

  if (Array.isArray(error?.response?.data?.error)) {
    return error.response.data.error.map((issue) => issue.message).join(", ");
  }

  return error?.response?.data?.message || error?.message || fallback;
};

const ModalShell = ({ title, accentClass, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
    <div className={`max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg border-2 bg-[#0a0a1a] p-6 ${accentClass}`}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-cyan-300">{title}</h2>
        <button
          onClick={onClose}
          className="text-3xl leading-none text-gray-400 transition hover:text-red-400"
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
      {children}
    </div>
  </div>
);

const ConfirmDialog = ({
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
  isPending,
}) => (
  <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-lg border-2 border-red-400 bg-[#0a0a1a] p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-red-300">{title}</h3>
      <p className="mt-3 text-sm text-gray-200">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn border border-gray-500 text-gray-200 hover:bg-gray-600/30" onClick={onCancel} disabled={isPending}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={isPending}>
          {isPending ? "Processing..." : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default function QuestionsPanel() {
  const [selectedRound, setSelectedRound] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [draftItems, setDraftItems] = useState([createDraftItem()]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionDraft, setQuestionDraft] = useState("");
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [answerDraft, setAnswerDraft] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const { data: rounds = [], isLoading, error } = useGetRounds();
  const createQuestionsMutation = useCreateQuestionsWithAnswers();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();
  const deleteQuestionsByRoundMutation = useDeleteQuestionsByRound();
  const createAnswerMutation = useCreateAnswer();
  const updateAnswerMutation = useUpdateAnswer();
  const deleteAnswerMutation = useDeleteAnswer();
  const deleteAnswersByRoundMutation = useDeleteAnswersByRound();

  const selectedRoundId = selectedRound?._id;
  const shouldLoadRoundData = Boolean(
    selectedRoundId && (activeModal === "questions" || activeModal === "answers")
  );

  const {
    data: questions = [],
    isLoading: isQuestionsLoading,
    error: questionsError,
  } = useGetQuestionsByRound(shouldLoadRoundData ? selectedRoundId : undefined);

  const {
    data: answers = [],
    isLoading: isAnswersLoading,
    error: answersError,
  } = useGetAnswersByRound(shouldLoadRoundData ? selectedRoundId : undefined);

  const answerMap = useMemo(
    () => new Map(answers.map((answer) => [answer._id, answer])),
    [answers]
  );

  const questionsWithAnswers = useMemo(
    () =>
      questions.map((question) => ({
        ...question,
        answer: answerMap.get(question.correctAnswerId) || null,
      })),
    [questions, answerMap]
  );

  const canEditSelectedRound = selectedRound?.status === "DRAFT";

  const getStatusStyle = (status) => {
    const styles = {
      DRAFT: {
        bg: "bg-orange-400/10",
        border: "border-orange-400",
        text: "text-orange-300",
      },
      LIVE: {
        bg: "bg-green-400/10",
        border: "border-green-400",
        text: "text-green-300",
      },
      ENDED: {
        bg: "bg-red-400/10",
        border: "border-red-400",
        text: "text-red-300",
      },
    };
    return styles[status] || styles.DRAFT;
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedRound(null);
    setEditingQuestionId(null);
    setQuestionDraft("");
    setEditingAnswerId(null);
    setAnswerDraft("");
    setDraftItems([createDraftItem()]);
    setConfirmDialog(null);
    setIsConfirming(false);
  };

  const openModal = (modalType, round) => {
    setSelectedRound(round);
    setActiveModal(modalType);
    setEditingQuestionId(null);
    setQuestionDraft("");
    setEditingAnswerId(null);
    setAnswerDraft("");
    if (modalType === "create") {
      setDraftItems([createDraftItem()]);
    }
  };

  const updateDraftItem = (id, field, value) => {
    setDraftItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addDraftItem = () => {
    setDraftItems((current) => [...current, createDraftItem()]);
  };

  const removeDraftItem = (id) => {
    setDraftItems((current) => {
      if (current.length === 1) {
        return current;
      }
      return current.filter((item) => item.id !== id);
    });
  };

  const handleCreateQuestions = async () => {
    const payloadQuestions = draftItems.map((item) => ({
      question: item.question.trim(),
      correctAnswer: item.correctAnswer.trim(),
    }));

    if (!payloadQuestions.length) {
      toast.error("Add at least one question before saving.");
      return;
    }

    if (payloadQuestions.some((item) => !item.question || !item.correctAnswer)) {
      toast.error("Each question needs both question text and answer code.");
      return;
    }

    const loadingToast = toast.loading("Creating questions and answers...");

    try {
      await createQuestionsMutation.mutateAsync({
        roundId: selectedRoundId,
        questions: payloadQuestions,
      });
      toast.success("Questions added successfully.", { id: loadingToast });
      closeModal();
    } catch (mutationError) {
      toast.error(getErrorMessage(mutationError, "Failed to create questions."), {
        id: loadingToast,
      });
    }
  };

  const startEditingQuestion = (question) => {
    setEditingQuestionId(question._id);
    setQuestionDraft(question.question);
  };

  const saveQuestion = async (questionId) => {
    const nextQuestion = questionDraft.trim();

    if (!nextQuestion) {
      toast.error("Question text cannot be empty.");
      return;
    }

    const loadingToast = toast.loading("Updating question...");

    try {
      await updateQuestionMutation.mutateAsync({
        questionId,
        input: { question: nextQuestion },
      });
      toast.success("Question updated.", { id: loadingToast });
      setEditingQuestionId(null);
      setQuestionDraft("");
    } catch (mutationError) {
      toast.error(getErrorMessage(mutationError, "Failed to update question."), {
        id: loadingToast,
      });
    }
  };

  const removeQuestion = async (question) => {
    if (!question?._id) {
      return;
    }

    setConfirmDialog({
      title: "Delete Question",
      message: "Delete this question? This action cannot be undone from this panel.",
      confirmLabel: "Delete Question",
      action: async () => {
        const loadingToast = toast.loading("Deleting question...");

        try {
          await deleteQuestionMutation.mutateAsync(question._id);

          if (editingQuestionId === question._id) {
            setEditingQuestionId(null);
            setQuestionDraft("");
          }

          toast.success("Question deleted.", { id: loadingToast });
        } catch (mutationError) {
          toast.error(getErrorMessage(mutationError, "Failed to delete question."), {
            id: loadingToast,
          });
          throw mutationError;
        }
      },
    });
  };

  const removeAnswer = async (answer) => {
    if (!answer?._id) {
      return;
    }

    setConfirmDialog({
      title: "Delete Answer",
      message: "Delete this answer?",
      confirmLabel: "Delete Answer",
      action: async () => {
        const loadingToast = toast.loading("Deleting answer...");

        try {
          await deleteAnswerMutation.mutateAsync(answer._id);

          if (editingAnswerId === answer._id) {
            setEditingAnswerId(null);
            setAnswerDraft("");
          }

          toast.success("Answer deleted.", { id: loadingToast });
        } catch (mutationError) {
          toast.error(getErrorMessage(mutationError, "Failed to delete answer."), {
            id: loadingToast,
          });
          throw mutationError;
        }
      },
    });
  };

  const removeRoundQuestions = async () => {
    if (!selectedRoundId) {
      return;
    }

    setConfirmDialog({
      title: "Delete All Questions",
      message: `Delete all questions for Round #${selectedRound.roundNumber}?`,
      confirmLabel: "Delete All Questions",
      action: async () => {
        const loadingToast = toast.loading("Deleting all questions...");

        try {
          await deleteQuestionsByRoundMutation.mutateAsync(selectedRoundId);

          if (editingQuestionId) {
            setEditingQuestionId(null);
            setQuestionDraft("");
          }

          toast.success("All questions deleted for this round.", {
            id: loadingToast,
          });
        } catch (mutationError) {
          toast.error(getErrorMessage(mutationError, "Failed to delete round questions."), {
            id: loadingToast,
          });
          throw mutationError;
        }
      },
    });
  };

  const removeRoundAnswers = async () => {
    if (!selectedRoundId) {
      return;
    }

    setConfirmDialog({
      title: "Delete All Answers",
      message: `Delete all answers for Round #${selectedRound.roundNumber}?`,
      confirmLabel: "Delete All Answers",
      action: async () => {
        const loadingToast = toast.loading("Deleting all answers...");

        try {
          await deleteAnswersByRoundMutation.mutateAsync(selectedRoundId);

          if (editingAnswerId) {
            setEditingAnswerId(null);
            setAnswerDraft("");
          }

          toast.success("All answers deleted for this round.", {
            id: loadingToast,
          });
        } catch (mutationError) {
          toast.error(
            getErrorMessage(mutationError, "Failed to delete round answers."),
            {
              id: loadingToast,
            }
          );
          throw mutationError;
        }
      },
    });
  };

  const closeConfirmDialog = () => {
    if (isConfirming) {
      return;
    }
    setConfirmDialog(null);
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog?.action || isConfirming) {
      return;
    }

    setIsConfirming(true);
    try {
      await confirmDialog.action();
      setConfirmDialog(null);
    } catch {
      // Keep dialog open on error so user can retry or cancel.
    } finally {
      setIsConfirming(false);
    }
  };

  const startEditingAnswer = (answer) => {
    setEditingAnswerId(answer._id);
    setAnswerDraft(answer.code);
  };

  const saveAnswer = async (answerId) => {
    const nextCode = answerDraft.trim();

    if (!nextCode) {
      toast.error("Answer code cannot be empty.");
      return;
    }

    const loadingToast = toast.loading("Updating answer...");

    try {
      await updateAnswerMutation.mutateAsync({
        answerId,
        input: { code: nextCode },
      });
      toast.success("Answer updated.", { id: loadingToast });
      setEditingAnswerId(null);
      setAnswerDraft("");
    } catch (mutationError) {
      toast.error(getErrorMessage(mutationError, "Failed to update answer."), {
        id: loadingToast,
      });
    }
  };

  const createDummyAnswer = async () => {
    if (!selectedRoundId) {
      return;
    }

    const loadingToast = toast.loading("Creating dummy answer...");

    try {
      await createAnswerMutation.mutateAsync({
        roundId: selectedRoundId,
        code: `// Dummy answer for Round #${selectedRound.roundNumber}\nfunction solve() {\n  return \"replace me\";\n}`,
      });
      toast.success("Dummy answer added to the round.", { id: loadingToast });
    } catch (mutationError) {
      toast.error(getErrorMessage(mutationError, "Failed to create dummy answer."), {
        id: loadingToast,
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="terminal-container">
        <div className="panel border-red-400/40 bg-red-400/5 text-red-300">
          Failed to load rounds: {getErrorMessage(error, "Unable to fetch rounds.")}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="terminal-container">
        <h1 className="terminal-title">QUESTIONS & ANSWERS MANAGEMENT</h1>

        <div className="panel bg-linear-to-br from-cyan-400/5 to-blue-400/5">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-cyan-300">Select a Round</h2>
              <p className="mt-1 text-sm text-gray-400">
                Draft rounds support question creation and editing. Live and ended rounds are read-only here.
              </p>
            </div>
            <div className="text-sm text-cyan-400">{rounds.length} total rounds</div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
            {rounds.map((round) => {
              const style = getStatusStyle(round.status);

              return (
                <div
                  key={round._id}
                  className={`panel mb-0 border-2 ${style.border} ${style.bg} card-hover`}
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-5xl font-black text-cyan-300">#{round.roundNumber}</div>
                      <p className="text-xs text-gray-400">Round ID: {round._id}</p>
                    </div>
                    <div className={`rounded-full border px-3 py-1 ${style.border} ${style.bg}`}>
                      <span className={`text-sm font-bold ${style.text}`}>{round.status}</span>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded border border-cyan-400/20 bg-black/30 p-3">
                      <div className="text-xs text-gray-400">Duration</div>
                      <div className="mt-1 font-bold text-cyan-200">
                        {Math.round((Number(round.duration) || 0) / 60)} min
                      </div>
                    </div>
                    <div className="rounded border border-cyan-400/20 bg-black/30 p-3">
                      <div className="text-xs text-gray-400">Editing</div>
                      <div className="mt-1 font-bold text-cyan-200">
                        {round.status === "DRAFT" ? "Enabled" : "Locked"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="btn btn-cyan"
                        onClick={() => openModal("questions", round)}
                      >
                        View Questions
                      </button>
                      <button
                        className="btn border border-blue-400 text-blue-300 hover:bg-blue-400 hover:text-black"
                        onClick={() => openModal("answers", round)}
                      >
                        View Answers
                      </button>
                    </div>

                    {round.status === "DRAFT" && (
                      <button
                        className="btn btn-green w-full"
                        onClick={() => openModal("create", round)}
                      >
                        Add Questions
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {activeModal === "create" && selectedRound && (
        <ModalShell
          title={`Add Questions to Round #${selectedRound.roundNumber}`}
          accentClass="border-green-400"
          onClose={closeModal}
        >
          <div className="mb-6 rounded-lg border border-green-400/30 bg-green-400/5 p-4 text-sm text-green-200">
            Add question and answer pairs for this draft round. Each question creates one linked correct answer.
          </div>

          <div className="space-y-4">
            {draftItems.map((item, index) => (
              <div key={item.id} className="rounded-lg border border-green-400/20 bg-black/30 p-4">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="font-bold text-green-300">Question Block {index + 1}</h3>
                  <button
                    className="btn btn-danger"
                    onClick={() => removeDraftItem(item.id)}
                    disabled={draftItems.length === 1 || createQuestionsMutation.isPending}
                  >
                    Remove
                  </button>
                </div>

                <label className="mb-1 block text-xs text-cyan-300">Question</label>
                <textarea
                  className="input min-h-24 resize-y"
                  value={item.question}
                  onChange={(event) => updateDraftItem(item.id, "question", event.target.value)}
                  placeholder="Enter the question statement"
                  disabled={createQuestionsMutation.isPending}
                />

                <label className="mb-1 block text-xs text-green-300">Correct Answer Code</label>
                <textarea
                  className="input min-h-32 resize-y font-mono"
                  value={item.correctAnswer}
                  onChange={(event) => updateDraftItem(item.id, "correctAnswer", event.target.value)}
                  placeholder="Enter the correct answer or code snippet"
                  disabled={createQuestionsMutation.isPending}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <button
              className="btn btn-cyan"
              onClick={addDraftItem}
              disabled={createQuestionsMutation.isPending}
            >
              Add Another Pair
            </button>

            <div className="flex gap-3">
              <button className="btn btn-danger" onClick={closeModal} disabled={createQuestionsMutation.isPending}>
                Cancel
              </button>
              <button
                className="btn btn-green"
                onClick={handleCreateQuestions}
                disabled={createQuestionsMutation.isPending}
              >
                {createQuestionsMutation.isPending ? "Saving..." : "Save Questions"}
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {activeModal === "questions" && selectedRound && (
        <ModalShell
          title={`Questions for Round #${selectedRound.roundNumber}`}
          accentClass="border-cyan-400"
          onClose={closeModal}
        >
          {canEditSelectedRound && (
            <div className="mb-4 flex justify-end">
              <button
                className="btn btn-danger"
                onClick={removeRoundQuestions}
                disabled={
                  deleteQuestionsByRoundMutation.isPending ||
                  deleteAnswersByRoundMutation.isPending
                }
              >
                {deleteQuestionsByRoundMutation.isPending || deleteAnswersByRoundMutation.isPending
                  ? "Deleting Questions..."
                  : "Delete All Questions"}
              </button>
            </div>
          )}

          {!canEditSelectedRound && (
            <div className="mb-6 rounded-lg border border-orange-400/30 bg-orange-400/5 p-4 text-sm text-orange-200">
              This round is not in draft mode. Questions are shown read-only.
            </div>
          )}

          {isQuestionsLoading || isAnswersLoading ? (
            <div className="rounded-lg border border-cyan-400/20 bg-black/30 p-8 text-center text-cyan-300">
              Loading round data...
            </div>
          ) : questionsError || answersError ? (
            <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-4 text-red-200">
              Failed to load questions for this round: {getErrorMessage(questionsError || answersError, "Unable to fetch question data.")}
            </div>
          ) : questionsWithAnswers.length === 0 ? (
            <div className="rounded-lg border border-cyan-400/20 bg-black/30 p-8 text-center text-cyan-300">
              No questions added for this round yet.
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-cyan-300">Total questions: {questionsWithAnswers.length}</p>

              {questionsWithAnswers.map((question, index) => (
                <div key={question._id} className="rounded-lg border border-cyan-400/30 bg-black/30 p-4">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <h3 className="font-bold text-cyan-200">Question {index + 1}</h3>
                    {canEditSelectedRound && (
                      <div className="flex gap-2">
                        {editingQuestionId === question._id ? (
                          <>
                            <button
                              className="btn btn-green"
                              onClick={() => saveQuestion(question._id)}
                              disabled={updateQuestionMutation.isPending}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => {
                                setEditingQuestionId(null);
                                setQuestionDraft("");
                              }}
                              disabled={updateQuestionMutation.isPending}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn border border-blue-400 text-blue-300 hover:bg-blue-400 hover:text-black"
                              onClick={() => startEditingQuestion(question)}
                              disabled={deleteQuestionMutation.isPending}
                            >
                              Edit Question
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => removeQuestion(question)}
                              disabled={deleteQuestionMutation.isPending}
                            >
                              {deleteQuestionMutation.isPending ? "Deleting..." : "Delete Question"}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs text-cyan-300">Question</label>
                      {editingQuestionId === question._id ? (
                        <textarea
                          className="input min-h-24 resize-y"
                          value={questionDraft}
                          onChange={(event) => setQuestionDraft(event.target.value)}
                          disabled={updateQuestionMutation.isPending}
                        />
                      ) : (
                        <div className="rounded border border-cyan-400/20 bg-black/50 p-3 text-sm text-white">
                          {question.question}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-green-400">Correct Answer Code</label>
                      <div className="rounded border border-green-400/30 bg-green-400/5 p-3 font-mono text-sm whitespace-pre-wrap text-green-100">
                        {question.answer?.code || "Answer not found for this question."}
                      </div>
                      {canEditSelectedRound && (
                        <p className="mt-2 text-xs text-gray-400">
                          Use the Answers modal to edit the stored answer code for this question.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalShell>
      )}

      {activeModal === "answers" && selectedRound && (
        <ModalShell
          title={`Answers for Round #${selectedRound.roundNumber}`}
          accentClass="border-blue-400"
          onClose={closeModal}
        >
          {canEditSelectedRound && (
            <div className="mb-6 flex flex-wrap justify-end gap-3">
              <button
                className="btn btn-danger"
                onClick={removeRoundAnswers}
                disabled={
                  deleteQuestionsByRoundMutation.isPending ||
                  deleteAnswersByRoundMutation.isPending
                }
              >
                {deleteQuestionsByRoundMutation.isPending || deleteAnswersByRoundMutation.isPending
                  ? "Deleting Answers..."
                  : "Delete All Answers"}
              </button>
              <button
                className="btn btn-cyan"
                onClick={createDummyAnswer}
                disabled={createAnswerMutation.isPending}
              >
                {createAnswerMutation.isPending ? "Adding Dummy Answer..." : "Add Dummy Answer"}
              </button>
            </div>
          )}

          {!canEditSelectedRound && (
            <div className="mb-6 rounded-lg border border-orange-400/30 bg-orange-400/5 p-4 text-sm text-orange-200">
              This round is not in draft mode. Answers are shown read-only.
            </div>
          )}

          {isAnswersLoading ? (
            <div className="rounded-lg border border-blue-400/20 bg-black/30 p-8 text-center text-blue-300">
              Loading answers...
            </div>
          ) : answersError ? (
            <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-4 text-red-200">
              Failed to load answers for this round: {getErrorMessage(answersError, "Unable to fetch answer data.")}
            </div>
          ) : answers.length === 0 ? (
            <div className="rounded-lg border border-blue-400/20 bg-black/30 p-8 text-center text-blue-300">
              No answers added for this round yet.
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-blue-300">Total answers: {answers.length}</p>

              {answers.map((answer, index) => (
                <div key={answer._id} className="rounded-lg border border-blue-400/30 bg-black/30 p-4">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-blue-200">Answer {index + 1}</h3>
                      <p className="text-xs text-gray-400">ID: {answer._id}</p>
                    </div>

                    {canEditSelectedRound && (
                      <div className="flex gap-2">
                        {editingAnswerId === answer._id ? (
                          <>
                            <button
                              className="btn btn-green"
                              onClick={() => saveAnswer(answer._id)}
                              disabled={updateAnswerMutation.isPending}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => {
                                setEditingAnswerId(null);
                                setAnswerDraft("");
                              }}
                              disabled={updateAnswerMutation.isPending}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn border border-blue-400 text-blue-300 hover:bg-blue-400 hover:text-black"
                              onClick={() => startEditingAnswer(answer)}
                              disabled={deleteAnswerMutation.isPending}
                            >
                              Edit Answer
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => removeAnswer(answer)}
                              disabled={deleteAnswerMutation.isPending}
                            >
                              {deleteAnswerMutation.isPending ? "Deleting..." : "Delete Answer"}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {editingAnswerId === answer._id ? (
                    <textarea
                      className="input min-h-32 resize-y font-mono"
                      value={answerDraft}
                      onChange={(event) => setAnswerDraft(event.target.value)}
                      disabled={updateAnswerMutation.isPending}
                    />
                  ) : (
                    <div className="rounded border border-blue-400/20 bg-black/50 p-3 font-mono text-sm whitespace-pre-wrap text-white">
                      {answer.code}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ModalShell>
      )}

      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          onCancel={closeConfirmDialog}
          onConfirm={handleConfirmAction}
          isPending={isConfirming}
        />
      )}
    </>
  );
}
