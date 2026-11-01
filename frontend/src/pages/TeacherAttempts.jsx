import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getStudentsForReview } from "../api/attemptApi";
const TeacherAttempts = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosClient.get("/attempts/students");

        if (response.data?.success) {
          setStudents(response.data.students || []);
        } else {
          setError(
            response.data?.message || "Unable to load students."
          );
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load students."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-slate-600">Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-800">
          Unable to load students
        </h2>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Student Attempts
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Select a student to review their drill attempts and
          Disaster Diary reflections.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-800">
            No students found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            There are currently no students available for review.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Student
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Grade
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {student.name}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {student.email}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {student.grade || "—"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/dashboard/attempts/student/${student._id}`}
                        className="inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
                      >
                        View Attempts
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
const fetchStudents = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await getStudentsForReview();

    if (response.success) {
      setStudents(response.students || []);
    } else {
      setError(response.message || "Unable to load students.");
    }
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Unable to load students."
    );
  } finally {
    setLoading(false);
  }
};

export default TeacherAttempts;