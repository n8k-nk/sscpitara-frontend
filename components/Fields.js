"use client";

export const messages = (errors, name) => errors?.[name] ?? [];

export function Errors({ list, className = "errorlist" }) {
  return list?.length ? <ul className={className}>{list.map((text) => <li key={text}>{text}</li>)}</ul> : null;
}

/** One labelled input with help text and server-side errors. */
export function Field({ name, label, type = "text", value, onChange, errors, help, optional, wide, ...rest }) {
  const list = messages(errors, name);
  return <div className={`profile-field${list.length ? " has-error" : ""}${wide ? " wide" : ""}`}>
    <label htmlFor={`id_${name}`}>{label}{optional && <span className="optional"> (optional)</span>}</label>
    {type === "textarea"
      ? <textarea id={`id_${name}`} name={name} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />
      : <input id={`id_${name}`} name={name} type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} aria-invalid={list.length ? true : undefined} {...rest} />}
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
export function Tiles({ name, label, value, onChange, options, errors, multiple }) {
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
      <div className="tiles">{options.map((o) => {
        const id = String(o.value);
        const checked = multiple ? picked.has(id) : picked === id;
        return <label className="tile" key={id}>
          <input type={multiple ? "checkbox" : "radio"} name={name} value={id} checked={checked} onChange={() => toggle(id)} />{o.label}
        </label>;
      })}</div>
    </fieldset>
    <Errors list={list} />
  </div>;
}
