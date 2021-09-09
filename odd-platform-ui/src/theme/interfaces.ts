import {
  Palette,
  PaletteOptions,
} from '@material-ui/core/styles/createPalette';
import { Theme } from '@material-ui/core';
import { ThemeOptions } from '@material-ui/core/styles';

// palette interfaces
interface ReportStatusStyles {
  background: string;
  border: string;
}

export interface ODDPalette extends Palette {
  entityType?: {
    SET: string;
    TRANSFORMER: string;
    CONSUMER: string;
    INPUT: string;
    QUALITY_TEST: string;
  };
  runStatus?: {
    SUCCESS: string;
    FAILED: string;
    BROKEN: string;
    SKIPPED: string;
    ABORTED: string;
    UNKNOWN: string;
  };
  reportStatus?: {
    success: ReportStatusStyles;
    failed: ReportStatusStyles;
    broken: ReportStatusStyles;
    skipped: ReportStatusStyles;
    aborted: ReportStatusStyles;
    unknown: ReportStatusStyles;
  };
}

export interface ODDPaletteOptions extends PaletteOptions {
  entityType?: {
    SET: string;
    TRANSFORMER: string;
    CONSUMER: string;
    INPUT: string;
    QUALITY_TEST: string;
  };
  runStatus?: {
    SUCCESS: string;
    FAILED: string;
    BROKEN: string;
    SKIPPED: string;
    ABORTED: string;
    UNKNOWN: string;
  };
  reportStatus?: {
    success: ReportStatusStyles;
    failed: ReportStatusStyles;
    broken: ReportStatusStyles;
    skipped: ReportStatusStyles;
    aborted: ReportStatusStyles;
    unknown: ReportStatusStyles;
  };
}

// theme interfaces
export interface ODDTheme extends Theme {
  palette: ODDPalette;
}
export interface ODDThemeOptions extends ThemeOptions {
  palette?: ODDPalette;
}
