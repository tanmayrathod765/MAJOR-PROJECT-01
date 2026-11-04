import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createInstitution,
  getMyInstitution,
  updateInstitution,
} from "../api/institutionApi";

const emptyForm = {
  name: "",
  type: "school",
  address: "",
  city: "",
  state: "",
  pincode: "",
  district: "",
};

const InstitutionSetup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  const [institutionId, setInstitutionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadInstitution = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getMyInstitution();

        if (response.success && response.institution) {
          const institution = response.institution;

          setInstitutionId(institution._id);

          setFormData({
            name: institution.name || "",
            type: institution.type || "school",
            address: institution.address || "",
            city: institution.city || "",
            state: institution.state || "",
            pincode: institution.pincode || "",
            district: institution.district || "",
          });

          setEmergencyContacts(
            institution.emergencyContacts || []
          );
        }
      } catch (err) {
        // 404 simply means this admin has no institution yet.
        if (err.response?.status !== 404) {
          setError(
            err.response?.data?.message ||
              "Unable to load institution."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadInstitution();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleContactChange = (index, field, value) => {
    setEmergencyContacts((previous) =>
      previous.map((contact, contactIndex) =>
        contactIndex === index
          ? {
              ...contact,
              [field]: value,
            }
          : contact
      )
    );
  };

  const addContact = () => {
    setEmergencyContacts((previous) => [
      ...previous,
      {
        label: "",
        phone: "",
      },
    ]);
  };

  const removeContact = (index) => {
    setEmergencyContacts((previous) =>
      previous.filter((_, contactIndex) => contactIndex !== index)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        ...formData,
        emergencyContacts,
      };

      if (institutionId) {
        const response = await updateInstitution(
          institutionId,
          payload
        );

        if (response.success) {
          setSuccess("Institution details updated successfully.");
        }
      } else {
        const response = await createInstitution(payload);

        if (response.success) {
          setSuccess("Institution created successfully.");

          setTimeout(() => {
            navigate("/dashboard");
          }, 800);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save institution details."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-slate-200" />
            <div className="h-12 rounded bg-slate-200" />
            <div className="h-12 rounded bg-slate-200" />
            <div className="h-12 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-800">
          Institution Management
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          {institutionId
            ? "Manage Institution"
            : "Set Up Institution"}
        </h1>

        <p className="mt-2 text-slate-500">
          {institutionId
            ? "Update your institution's information and emergency contacts."
            : "Add your institution's details to get started."}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Basic details */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Institution Details
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Institution Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Shri Vaishnav Public School"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Type
              </label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              >
                <option value="school">School</option>
                <option value="college">College</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Pincode
              </label>

              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                placeholder="e.g. 452001"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Full institution address"
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                City
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                State
              </label>

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                District
              </label>

              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </section>

        {/* Emergency contacts */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Emergency Contacts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add important emergency contacts for your institution.
              </p>
            </div>

            <button
              type="button"
              onClick={addContact}
              className="rounded-lg border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50"
            >
              + Add Contact
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {emergencyContacts.length === 0 && (
              <div className="rounded-lg bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                No emergency contacts added yet.
              </div>
            )}

            {emergencyContacts.map((contact, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Label
                    </label>

                    <input
                      type="text"
                      value={contact.label}
                      onChange={(event) =>
                        handleContactChange(
                          index,
                          "label",
                          event.target.value
                        )
                      }
                      placeholder="e.g. Principal"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Phone
                    </label>

                    <input
                      type="text"
                      value={contact.phone}
                      onChange={(event) =>
                        handleContactChange(
                          index,
                          "phone",
                          event.target.value
                        )
                      }
                      placeholder="e.g. 9876543210"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 sm:w-auto"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end pb-8">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-900 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : institutionId
                ? "Save Changes"
                : "Create Institution"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstitutionSetup;