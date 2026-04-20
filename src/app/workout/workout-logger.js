"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function WorkoutLogger({ day, clientId, timesCompleted }) {
  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState(() => {
    const initial = {};
    (day.exercises || []).forEach((exercise) => {
      initial[exercise.id] = Array.from({ length: exercise.sets }, () => ({
        reps_done: "",
        weight_used: "",
      }));
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const sortedExercises = (day.exercises || []).sort(
    (a, b) => a.order_index - b.order_index
  );

  function updateSet(exerciseId, setIndex, field, value) {
    setLogs((prev) => {
      const exerciseLogs = [...prev[exerciseId]];
      exerciseLogs[setIndex] = { ...exerciseLogs[setIndex], [field]: value };
      return { ...prev, [exerciseId]: exerciseLogs };
    });
  }

  async function handleFinishWorkout() {
    setSaving(true);

    const { data: workoutLog, error: logError } = await supabase
      .from("workout_logs")
      .insert({
        client_id: clientId,
        program_day_id: day.id,
      })
      .select()
      .single();

    if (logError) {
      setSaving(false);
      return;
    }

    const exerciseLogs = [];
    Object.entries(logs).forEach(([exerciseId, sets]) => {
      sets.forEach((set, index) => {
        if (set.reps_done) {
          exerciseLogs.push({
            workout_log_id: workoutLog.id,
            exercise_id: exerciseId,
            set_number: index + 1,
            reps_done: parseInt(set.reps_done),
            weight_used: set.weight_used ? parseFloat(set.weight_used) : null,
          });
        }
      });
    });

    if (exerciseLogs.length > 0) {
      await supabase.from("exercise_logs").insert(exerciseLogs);
    }

    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full text-left bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all group"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
              <span className="text-sm font-extrabold">{day.day_number}</span>
            </div>
            <div>
              <h3 className="font-bold text-sm dark:text-white">{day.name}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                {sortedExercises.length} exercises
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {timesCompleted > 0 && (
              <span className="text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-semibold border border-green-100 dark:border-green-900">
                Done {timesCompleted}x
              </span>
            )}
            <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
      </button>
    );
  }

  if (saved) {
    return (
      <div className="bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <p className="font-bold text-green-800 dark:text-green-300">Workout complete!</p>
        <p className="text-green-600 dark:text-green-400 text-sm mt-1 font-medium">Great work. Keep it up.</p>
        <button
          onClick={() => {
            setSaved(false);
            setExpanded(false);
          }}
          className="mt-4 text-sm text-green-700 dark:text-green-400 font-semibold hover:underline"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
            <span className="text-white dark:text-black text-xs font-extrabold">{day.day_number}</span>
          </div>
          <h3 className="font-bold text-sm dark:text-white">{day.name}</h3>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="text-sm text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors font-medium"
        >
          Collapse
        </button>
      </div>

      {/* Exercises */}
      <div className="p-5 space-y-6">
        {sortedExercises.map((exercise) => (
          <div key={exercise.id}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold dark:text-white">{exercise.name}</h4>
              <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded font-medium">
                Target: {exercise.sets} x {exercise.reps}
                {exercise.rest_seconds && ` | ${exercise.rest_seconds}s rest`}
              </span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-[2rem_1fr_1fr] gap-2 text-xs text-gray-400 dark:text-gray-500 px-1 font-semibold">
                <span>Set</span>
                <span>Reps</span>
                <span>Weight (kg)</span>
              </div>
              {logs[exercise.id]?.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className="grid grid-cols-[2rem_1fr_1fr] gap-2 items-center"
                >
                  <span className="text-xs text-gray-400 dark:text-gray-500 text-center font-semibold">
                    {setIndex + 1}
                  </span>
                  <input
                    type="number"
                    placeholder={exercise.reps}
                    value={set.reps_done}
                    onChange={(e) =>
                      updateSet(exercise.id, setIndex, "reps_done", e.target.value)
                    }
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-gray-400 dark:focus:border-gray-500 transition-all dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="0"
                    value={set.weight_used}
                    onChange={(e) =>
                      updateSet(exercise.id, setIndex, "weight_used", e.target.value)
                    }
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-gray-400 dark:focus:border-gray-500 transition-all dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                    min="0"
                    step="0.5"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <button
          onClick={handleFinishWorkout}
          disabled={saving}
          className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-sm"
        >
          {saving ? "Saving..." : "Finish workout"}
        </button>
      </div>
    </div>
  );
}
