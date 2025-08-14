import { themeQuartz } from "ag-grid-community";

export const theme = themeQuartz.withParams({
    backgroundColor: 'hsl(var(--background))',
    foregroundColor: 'hsl(var(--foreground))',
    headerTextColor: 'hsl(var(--foreground))',
    borderColor: 'hsl(var(--border))',
    oddRowBackgroundColor: 'rgb(0, 0, 0, 0.03)',
    rowHoverColor: 'rgb(255, 255, 255, 0.01)',
    headerColumnResizeHandleColor: 'hsl(var(--border))',
    rangeSelectionBorderColor: 'hsl(var(--primary))',
    inputFocusBorder: '1px solid hsl(var(--border))',
    focusShadow: '0px 0px 0px 3px color-mix(in srgb, transparent, hsl(var(--border)) 50%)',
    headerFontWeight: 700,
    checkboxCheckedBackgroundColor: 'hsl(var(--primary))',
    checkboxCheckedBorderColor: 'hsl(var(--primary))',
    menuBorder: '1px solid hsl(var(--border))',
    accentColor: 'hsl(var(--primary))',
    borderRadius: 0,
    inputBorderRadius: 0,
    checkboxBorderRadius: 0,
    wrapperBorderRadius: 0
});