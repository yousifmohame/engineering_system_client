export const ScrollArea = ({ className, children, style }) => (
  <div className={`overflow-auto ${className}`} style={style}>
    {children}
  </div>
);