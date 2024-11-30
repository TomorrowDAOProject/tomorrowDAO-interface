interface PanelProps {
  isActive?: boolean;
  header?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  showArrow?: boolean;
  forceRender?: boolean;
  /** @deprecated Use `collapsible="disabled"` instead */
  disabled?: boolean;
  extra?: React.ReactNode;
  collapsible?: CollapsibleType;
}
