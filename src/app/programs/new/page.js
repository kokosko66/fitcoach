"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";

const inputClasses =
  "px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-gray-400 dark:focus:border-gray-500 transition-all bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500";

function ExerciseForm({ exercise, index, onChange, onRemove }) {
  return (
    <div className="flex gap-2 items-start p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg group">
      <span className="text-xs text-gray-400 dark:text-gray-500 mt-2.5 w-5 shrink-0 font-semibold">
        {index + 1}.
      </span>
      <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2">
        <input
          type="text"
          placeholder="Exercise name"
          value={exercise.name}
          onChange={(e) => onChange({ ...exercise, name: e.target.value })}
          className={`col-span-2 ${inputClasses}`}
          required
        />
        <input
          type="number"
          placeholder="Sets"
          value={exercise.sets}
          onChange={(e) => onChange({ ...exercise, sets: e.target.value })}
          className={inputClasses}
          min="1"
          required
        />
        <input
          type="text"
          placeholder="Reps (e.g. 8-12)"
          value={exercise.reps}
          onChange={(e) => onChange({ ...exercise, reps: e.target.value })}
          className={inputClasses}
          required
        />
        <input
          type="number"
          placeholder="Rest (sec)"
          value={exercise.rest_seconds}
          onChange={(e) =>
            onChange({ ...exercise, rest_seconds: e.target.value })
          }
          className={inputClasses}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button>
    </div>
  );
}

function DayForm({ day, dayIndex, onChange, onRemove }) {
  function addExercise() {
    onChange({
      ...day,
      exercises: [
        ...day.exercises,
        { name: "", sets: "", reps: "", rest_seconds: "" },
      ],
    });
  }

  function updateExercise(exIndex, updated) {
    const exercises = [...day.exercises];
    exercises[exIndex] = updated;
    onChange({ ...day, exercises });
  }

  function removeExercise(exIndex) {
    onChange({
      ...day,
      exercises: day.exercises.filter((_, i) => i !== exIndex),
    });
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-7 h-7 bg-black dark:bg-white rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white dark:text-black text-xs font-extrabold">{dayIndex + 1}</span>
          </div>
          <input
            type="text"
            value={day.name}
            onChange={(e) => onChange({ ...day, name: e.target.value })}
            placeholder={`Day name (e.g. Push, Pull, Legs)`}
            className={`flex-1 font-medium ${inputClasses}`}
            required
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 ml-3 transition-colors font-medium"
        >
          Remove
        </button>
      </div>

      <div className="space-y-2">
        {day.exercises.map((exercise, exIndex) => (
          <ExerciseForm
            key={exIndex}
            exercise={exercise}
            index={exIndex}
            onChange={(updated) => updateExercise(exIndex, updated)}
            onRemove={() => removeExercise(exIndex)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addExercise}
        className="mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 font-medium"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add exercise
      </button>
    </div>
  );
}

export default function NewProgramPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState([
    { name: "", exercises: [{ name: "", sets: "", reps: "", rest_seconds: "" }] },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  function addDay() {
    setDays([
      ...days,
      { name: "", exercises: [{ name: "", sets: "", reps: "", rest_seconds: "" }] },
    ]);
  }

  function updateDay(index, updated) {
    const newDays = [...days];
    newDays[index] = updated;
    setDays(newDays);
  }

  function removeDay(index) {
    setDays(days.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: program, error: programError } = await supabase
      .from("programs")
      .insert({ title, description, coach_id: user.id })
      .select()
      .single();

    if (programError) {
      setError(programError.message);
      setLoading(false);
      return;
    }

    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const { data: programDay, error: dayError } = await supabase
        .from("program_days")
        .insert({
          program_id: program.id,
          day_number: i + 1,
          name: day.name || `Day ${i + 1}`,
        })
        .select()
        .single();

      if (dayError) {
        setError(dayError.message);
        setLoading(false);
        return;
      }

      const exercises = day.exercises
        .filter((ex) => ex.name)
        .map((ex, j) => ({
          program_day_id: programDay.id,
          name: ex.name,
          sets: parseInt(ex.sets) || 3,
          reps: ex.reps || "10",
          rest_seconds: ex.rest_seconds ? parseInt(ex.rest_seconds) : null,
          order_index: j,
        }));

      if (exercises.length > 0) {
        const { error: exError } = await supabase
          .from("exercises")
          .insert(exercises);

        if (exError) {
          setError(exError.message);
          setLoading(false);
          return;
        }
      }
    }

    router.push("/programs");
    router.refresh();
  }

  return (
    <DashboardShell user={null} profile={{ role: "coach" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold dark:text-white">Create program</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">
          Build a workout program with days and exercises
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {error && (
          <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg font-medium">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold mb-1.5 dark:text-white">
              Program title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 12-Week Strength Program"
              required
              className={`w-full ${inputClasses}`}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold mb-1.5 dark:text-white"
            >
              Description{" "}
              <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the program"
              rows={2}
              className={`w-full resize-none ${inputClasses}`}
            />
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold mb-3 dark:text-white">Workout days</h2>
          <div className="space-y-4">
            {days.map((day, index) => (
              <DayForm
                key={index}
                day={day}
                dayIndex={index}
                onChange={(updated) => updateDay(index, updated)}
                onRemove={() => removeDay(index)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addDay}
            className="mt-4 px-4 py-2.5 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all w-full flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add another day
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? "Creating..." : "Create program"}
        </button>
      </form>
    </DashboardShell>
  );
}
