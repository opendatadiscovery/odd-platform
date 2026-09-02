import React from 'react';
import { useTranslation } from 'react-i18next';
import AppTooltip from 'components/shared/elements/AppTooltip/AppTooltip';
import { TooltipBody } from 'components/shared/elements/AppTooltip/AppTooltipStyles';
import { InformationIcon } from 'components/shared/icons';

// Inline "(i)" help for the search box's query syntax (#1840 / ST-6). Operators nobody is told about are
// close to non-existent, so the three the platform now understands - a quoted phrase, a `-` exclusion and
// `or` - get the platform's established inline-help affordance (ADR-0076): an InformationIcon wrapped in an
// AppTooltip, the same pattern as the Activity filter hints, the Data Entity "About" block and Term
// definitions. The body is the SHARED TooltipBody, never a bare string: the "light" popper brings no padding
// or max width of its own, so an unwrapped string renders as one unreadable edge-to-edge row (LSN-035).
const SearchSyntaxHint: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AppTooltip
      checkForOverflow={false}
      title={
        <TooltipBody>
          {t(
            'Words match from the start, so "cust ord" finds "Customers Orders". Refine with "a quoted phrase" for words that must be next to each other, -word to exclude, and or for alternatives. Operators narrow a search - they never turn off start-of-word matching on the other words.'
          )}
        </TooltipBody>
      }
    >
      <InformationIcon width={16} height={16} />
    </AppTooltip>
  );
};

export default SearchSyntaxHint;
