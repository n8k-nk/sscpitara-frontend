"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { send } from "../../lib/client";
import styles from "./account.module.css";

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m13 6 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0 0-3l-.5-.5a2.1 2.1 0 0 0-3 0L5 15.5 4 20Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function firstError(data) {
  if (typeof data?.error === "string" && data.error) return data.error;
  if (data?.errors && typeof data.errors === "object") {
    for (const val of Object.values(data.errors)) {
      if (Array.isArray(val) && val[0]) return String(val[0]);
      if (typeof val === "string" && val) return val;
    }
  }
  return "Could not save. Check the value and try again.";
}

function InlineField({
  label,
  displayValue,
  editing,
  saving,
  error,
  onStartEdit,
  onSave,
  onCancel,
  showActions = true,
  children,
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        {editing ? (
          <div className={styles.editWrap}>
            <div className={styles.editRow}>
              {children}
              {showActions && (
                <div className={styles.editActions}>
                  {onSave && (
                    <button
                      type="button"
                      className={`${styles.actionIconBtn} ${styles.saveIconBtn}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={onSave}
                      disabled={saving}
                      aria-label={`Save ${label.toLowerCase()}`}
                      title="Save"
                    >
                      <CheckIcon />
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.actionIconBtn}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={onCancel}
                    disabled={saving}
                    aria-label={`Cancel editing ${label.toLowerCase()}`}
                    title="Cancel"
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}
            </div>
            {saving && <span className={styles.status}>Saving…</span>}
            {error && <p className={styles.fieldError} role="alert">{error}</p>}
          </div>
        ) : (
          <span className={styles.valueRow}>
            <span className={styles.valueText}>{displayValue}</span>
            <button
              type="button"
              className={styles.editBtn}
              onClick={onStartEdit}
              aria-label={`Edit ${label.toLowerCase()}`}
              title={`Edit ${label.toLowerCase()}`}
            >
              <PencilIcon />
            </button>
          </span>
        )}
      </dd>
    </div>
  );
}

export default function AccountProfile({
  initialValues,
  options,
  username,
  profileComplete,
  securityCard,
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [editing, setEditing] = useState(null); // field name or null
  const [draft, setDraft] = useState("");
  const [draftExams, setDraftExams] = useState(initialValues.target_exams || []);
  const [savingField, setSavingField] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const examsBoxRef = useRef(null);

  const savingRef = useRef(null);

  useEffect(() => {
    if (editing && editing !== "target_exams" && inputRef.current) {
      inputRef.current.focus();
      if (typeof inputRef.current.select === "function") inputRef.current.select();
    } else if (editing === "target_exams" && examsBoxRef.current) {
      examsBoxRef.current.focus();
    }
  }, [editing]);

  const labelFor = (field, val = values[field]) =>
    options[field]?.find((opt) => opt.value === String(val ?? ""))?.label;

  const startEdit = (field) => {
    setError("");
    if (field === "target_exams") {
      setDraftExams(values.target_exams || []);
    } else {
      setDraft(String(values[field] ?? ""));
    }
    setEditing(field);
  };

  const cancelEdit = () => {
    setError("");
    setEditing(null);
  };

  const persist = async (field, nextFieldValue) => {
    if (savingRef.current === field) return;

    const prevValue = values[field];
    const same = Array.isArray(nextFieldValue)
      ? JSON.stringify([...nextFieldValue].sort()) === JSON.stringify([...(prevValue || [])].sort())
      : String(nextFieldValue ?? "") === String(prevValue ?? "");

    if (same) {
      setEditing((cur) => (cur === field ? null : cur));
      setError("");
      return;
    }

    const nextValues = { ...values, [field]: nextFieldValue };
    savingRef.current = field;
    setSavingField(field);
    setError("");
    const { ok, data } = await send("profile", nextValues, "PUT");
    savingRef.current = null;
    setSavingField(null);

    if (!ok) {
      setError(firstError(data));
      return;
    }

    setValues(nextValues);
    setEditing((cur) => (cur === field ? null : cur));
    router.refresh();
  };

  const handleInputKeyDown = (e, field, nextVal) => {
    if (e.key === "Enter") {
      e.preventDefault();
      persist(field, nextVal);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  const toggleExam = (examId) => {
    setDraftExams((prev) =>
      prev.includes(examId) ? prev.filter((id) => id !== examId) : [...prev, examId]
    );
  };

  const handleExamsBlur = (e) => {
    if (examsBoxRef.current && e.relatedTarget && examsBoxRef.current.contains(e.relatedTarget)) {
      return;
    }
    persist("target_exams", draftExams);
  };

  const name = values.display_name || username;
  const targets = options.exams.filter((exam) => (values.target_exams || []).includes(exam.id));

  return (
    <>
      <header className={styles.hero}>
        <div className={styles.avatar} aria-hidden="true">
          {name?.trim().slice(0, 1).toUpperCase() || "?"}
        </div>
        <div>
          <h1>My account</h1>
          <p>{name}</p>
        </div>
        {!profileComplete && (
          <Link className="button" href="/onboarding/">
            Complete your profile
          </Link>
        )}
      </header>

      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="details-title">
          <h2 id="details-title">Profile details</h2>
          <dl>
            <InlineField
              label="Display name"
              displayValue={name || "—"}
              editing={editing === "display_name"}
              saving={savingField === "display_name"}
              error={editing === "display_name" ? error : ""}
              onStartEdit={() => startEdit("display_name")}
              onSave={() => persist("display_name", draft.trim())}
              onCancel={cancelEdit}
            >
              <input
                ref={inputRef}
                type="text"
                className={styles.inlineInput}
                value={draft}
                maxLength={80}
                placeholder={username}
                disabled={savingField === "display_name"}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e, "display_name", draft.trim())}
              />
            </InlineField>

            <InlineField
              label="Age"
              displayValue={values.age ? `${values.age} years` : "—"}
              editing={editing === "age"}
              saving={savingField === "age"}
              error={editing === "age" ? error : ""}
              onStartEdit={() => startEdit("age")}
              onSave={() => persist("age", draft.trim())}
              onCancel={cancelEdit}
            >
              <input
                ref={inputRef}
                type="number"
                min={0}
                max={125}
                className={styles.inlineInput}
                value={draft}
                disabled={savingField === "age"}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e, "age", draft.trim())}
              />
            </InlineField>

            <InlineField
              label="Education"
              displayValue={labelFor("education") || "—"}
              editing={editing === "education"}
              saving={savingField === "education"}
              error={editing === "education" ? error : ""}
              onStartEdit={() => startEdit("education")}
              onSave={() => persist("education", draft)}
              onCancel={cancelEdit}
            >
              <select
                ref={inputRef}
                className={styles.inlineSelect}
                value={draft}
                disabled={savingField === "education"}
                onChange={(e) => {
                  const val = e.target.value;
                  setDraft(val);
                  persist("education", val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancelEdit();
                }}
              >
                {options.education.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </InlineField>

            <InlineField
              label="Age relaxation"
              displayValue={labelFor("age_relaxation") || "—"}
              editing={editing === "age_relaxation"}
              saving={savingField === "age_relaxation"}
              error={editing === "age_relaxation" ? error : ""}
              onStartEdit={() => startEdit("age_relaxation")}
              onSave={() => persist("age_relaxation", draft)}
              onCancel={cancelEdit}
            >
              <select
                ref={inputRef}
                className={styles.inlineSelect}
                value={draft}
                disabled={savingField === "age_relaxation"}
                onChange={(e) => {
                  const val = e.target.value;
                  setDraft(val);
                  persist("age_relaxation", val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancelEdit();
                }}
              >
                {options.age_relaxation.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </InlineField>
          </dl>
        </section>

        <section className={styles.card} aria-labelledby="exam-title">
          <div className={styles.cardHead}>
            <h2 id="exam-title">Your target exams</h2>
            {editing !== "target_exams" && (
              <button
                type="button"
                className={styles.editBtn}
                onClick={() => startEdit("target_exams")}
                aria-label="Edit target exams"
                title="Edit target exams"
              >
                <PencilIcon />
              </button>
            )}
          </div>

          {editing === "target_exams" ? (
            <div
              ref={examsBoxRef}
              tabIndex={-1}
              className={styles.examsEditor}
              onBlur={handleExamsBlur}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  cancelEdit();
                }
              }}
            >
              <div className={styles.examsList}>
                {options.exams.map((exam) => (
                  <label key={exam.id} className={styles.examOption}>
                    <input
                      type="checkbox"
                      checked={draftExams.includes(exam.id)}
                      onChange={() => toggleExam(exam.id)}
                      disabled={savingField === "target_exams"}
                    />
                    <span>
                      <strong>{exam.code}</strong> {exam.title}
                    </span>
                  </label>
                ))}
              </div>
              <div className={styles.examsFooter}>
                {savingField === "target_exams" && <span className={styles.status}>Saving…</span>}
                <button
                  type="button"
                  className={styles.doneBtn}
                  onClick={() => persist("target_exams", draftExams)}
                  disabled={savingField === "target_exams"}
                >
                  Done
                </button>
              </div>
              {error && <p className={styles.fieldError} role="alert">{error}</p>}
            </div>
          ) : targets.length ? (
            <ul className={styles.targets}>
              {targets.map((exam) => (
                <li key={exam.id}>
                  <strong>{exam.code}</strong>
                  <span>{exam.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No target exam selected.</p>
          )}

          <dl>
            <InlineField
              label="Study language"
              displayValue={labelFor("language") || "—"}
              editing={editing === "language"}
              saving={savingField === "language"}
              error={editing === "language" ? error : ""}
              onStartEdit={() => startEdit("language")}
              onSave={() => persist("language", draft)}
              onCancel={cancelEdit}
            >
              <select
                ref={inputRef}
                className={styles.inlineSelect}
                value={draft}
                disabled={savingField === "language"}
                onChange={(e) => {
                  const val = e.target.value;
                  setDraft(val);
                  persist("language", val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancelEdit();
                }}
              >
                {options.language.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </InlineField>

            <InlineField
              label="Daily study time"
              displayValue={values.daily_minutes ? `${values.daily_minutes} minutes` : "—"}
              editing={editing === "daily_minutes"}
              saving={savingField === "daily_minutes"}
              error={editing === "daily_minutes" ? error : ""}
              onStartEdit={() => startEdit("daily_minutes")}
              onSave={() => persist("daily_minutes", draft.trim())}
              onCancel={cancelEdit}
            >
              <input
                ref={inputRef}
                type="number"
                min={5}
                max={720}
                className={styles.inlineInput}
                value={draft}
                disabled={savingField === "daily_minutes"}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e, "daily_minutes", draft.trim())}
              />
            </InlineField>
          </dl>
        </section>

        {securityCard}
      </div>
    </>
  );
}
