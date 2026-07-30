import { createContext, useContext, useEffect } from "react";

/**
 * Shared by MenuBar (the provider) and the controls it renders. Kept in its own
 * module so TextColorPicker can join the toolbar's focus group without importing
 * MenuBar, which imports it back.
 *
 * `null` outside a provider, which makes useToolbarItem a no-op — a control used
 * on its own keeps native tab behaviour.
 */
export const ToolbarFocusContext = createContext(null);

/**
 * Roving tabindex for one toolbar control (the ARIA toolbar pattern): the toolbar
 * as a whole is a single tab stop, so only the control holding it is tabbable and
 * the arrow keys — handled by MenuBar — move focus between them. Without this,
 * every button is its own tab stop and reaching the text area means tabbing past
 * the entire toolbar.
 *
 * Spread the result onto the control's button.
 */
export const useToolbarItem = ({ label, disabled = false }) => {
  const context = useContext(ToolbarFocusContext);
  const isTabStop = context?.tabStop === label;

  // A disabled control can't take focus, so leaving it in charge of the tab stop
  // would drop the whole toolbar out of the tab order (undo/redo flip to disabled
  // as the history empties, possibly while focused).
  useEffect(() => {
    if (disabled && isTabStop) context?.releaseTabStop();
  }, [disabled, isTabStop, context]);

  if (!context) return {};

  return {
    tabIndex: isTabStop ? 0 : -1,
    onFocus: () => context.setTabStop(label),
  };
};
