export const Switch = ({ id, checked, onCheckedChange }) => (
  <input
    type="checkbox"
    id={id}
    checked={checked}
    onChange={(e) => onCheckedChange(e.target.checked)}
    className="h-5 w-9 appearance-none rounded-full bg-gray-200 checked:bg-blue-600 cursor-pointer relative transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform checked:after:translate-x-4"
  />
);