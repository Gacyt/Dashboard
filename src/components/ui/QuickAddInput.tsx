export default function QuickAddInput({
  placeholder,
  value,
  onChange,
  buttonLabel,
  onClick
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  buttonLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="nx-quick-add">
      <input
        className="nx-q-input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button className="nx-q-btn" type="button" onClick={onClick}>
        {buttonLabel}
      </button>
    </div>
  );
}
