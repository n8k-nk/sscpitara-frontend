"use client";

import { useState } from "react";

export const messages = (errors, name) => errors?.[name] ?? [];

export function Errors({ list, className = "errorlist" }) {
  return list?.length ? <ul className={className}>{list.map((text) => <li key={text}>{text}</li>)}</ul> : null;
}

/** One labelled input with help text and server-side errors. */
export function Field({ name, label, type = "text", value, onChange, errors, help, optional, wide, revealPassword, ...rest }) {
  const list = messages(errors, name);
  const [visible, setVisible] = useState(false);
  const id = `id_${name}`;
  const action = visible ? "Hide" : "Show";
  const input = <input id={id} name={name} type={visible ? "text" : type} value={value ?? ""}
    onChange={(e) => onChange(e.target.value)} aria-invalid={list.length ? true : undefined} {...rest} />;

  return <div className={`profile-field${list.length ? " has-error" : ""}${wide ? " wide" : ""}`}>
    <label htmlFor={id}>{label}{optional && <span className="optional"> (optional)</span>}</label>
    {type === "textarea"
      ? <textarea id={id} name={name} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />
      : revealPassword
        ? <div className="password-field">
          {input}
          <button type="button" aria-controls={id} aria-label={`${action} ${label.toLowerCase()}`}
            onClick={() => setVisible(!visible)}>{action}</button>
        </div>
        : input}
    {help && <small id={`id_${name}_helptext`}>{help}</small>}
    <Errors list={list} />
  </div>;
}

export function Select({ name, label, value, onChange, options, errors, placeholder = "Choose…", help }) {
  const list = messages(errors, name);
  return <div className={`profile-field${list.length ? " has-error" : ""}`}>
    <label htmlFor={`id_${name}`}>{label}</label>
    <select id={`id_${name}`} name={name} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {help && <small>{help}</small>}
    <Errors list={list} />
  </div>;
}

/** Radio (single) or checkbox (multiple) choices shown as selectable tiles. */
export function Tiles({ name, label, value, onChange, options, errors, multiple, list: stacked }) {
  const list = messages(errors, name);
  const picked = multiple ? new Set((value ?? []).map(String)) : String(value ?? "");
  const toggle = (id) => {
    if (!multiple) return onChange(id);
    const next = new Set(picked);
    next.has(id) ? next.delete(id) : next.add(id);
    onChange([...next]);
  };
  return <div className={`profile-field${list.length ? " has-error" : ""}`}>
    <fieldset><legend>{label}</legend>
      <div className={`tiles${stacked ? " list" : ""}`}>{options.map((o) => {
        const id = String(o.value);
        const checked = multiple ? picked.has(id) : picked === id;
        return <label className="tile" key={id}>
          <input type={multiple ? "checkbox" : "radio"} name={name} value={id} checked={checked} onChange={() => toggle(id)} />
          <span className="tile-text">{o.label}{o.hint && <small>{o.hint}</small>}</span>{o.badge && <span className={`badge ${o.badge[0]}`}>{o.badge[1]}</span>}{o.tag && <span className="code">{o.tag}</span>}
        </label>;
      })}</div>
    </fieldset>
    <Errors list={list} />
  </div>;
}

export const duration = (minutes) => {
  const m = Number(minutes) || 0;
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} hr${m % 60 ? ` ${m % 60} min` : ""}`;
};

/** Minutes slider with a live readout and a few labelled stops. */
export function Slider({ name, label, value, onChange, errors, min = 15, max = 240, step = 5, stops = [], formatValue = duration }) {
  const list = messages(errors, name);
  const current = Number(value) || min;
  const top = Math.max(max, current);
  const fill = `${((current - min) / (top - min)) * 100}%`;
  return <div className={`profile-field${list.length ? " has-error" : ""}`}>
    <div className="slider-head">
      <label htmlFor={`id_${name}`}>{label}</label>
      <output htmlFor={`id_${name}`} className="slider-value">{formatValue(current)}</output>
    </div>
    <input id={`id_${name}`} name={name} type="range" className="slider" min={min} max={top} step={step} value={current}
      style={{ "--fill": fill }} aria-valuetext={formatValue(current)} onChange={(e) => onChange(e.target.value)} />
    <div className="slider-stops" aria-hidden="true">{stops.map((m) => <span key={m}>{formatValue(m)}</span>)}</div>
    <Errors list={list} />
  </div>;
}
