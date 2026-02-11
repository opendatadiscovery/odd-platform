import { formatInTimeZone } from 'date-fns-tz';
import {
  formatDistanceToNowStrict,
  formatDistanceStrict,
  formatDuration,
  intervalToDuration,
  minutesToMilliseconds,
  formatDistanceToNow,
  add,
} from 'date-fns';
import {
  datedListFormat,
  mainEUDateFormat,
  mainEUDateTimeFormat,
  mainUSDateFormat,
  mainUSDateTimeFormat,
} from 'lib/constants';

type DateTimePatternNames =
  | 'datasetStructureVersion'
  | 'alert'
  | 'associationRequest'
  | 'entityStatus'
  | 'dataEntity'
  | 'term'
  | 'metadata'
  | 'activity'
  | 'datasetField'
  | 'linkedEntity'
  | 'qualityTest'
  | 'qualityTestRun'
  | 'datedList';
type TimeZones = 'us' | 'eu';
type DateTimePatterns = Record<DateTimePatternNames, Record<TimeZones, string>>;
interface Helpers {
  formatDistanceStrict: (...args: Parameters<typeof formatDistanceStrict>) => string;
  add: (...args: Parameters<typeof add>) => Date;
  formatDistanceToNow: (...args: Parameters<typeof formatDistanceToNow>) => string;
  formatDistanceToNowStrict: (
    ...args: Parameters<typeof formatDistanceToNowStrict>
  ) => string;
  formatDuration: (...args: Parameters<typeof formatDuration>) => string;
  intervalToDuration: (...args: Parameters<typeof intervalToDuration>) => Duration;
  minutesToMilliseconds: (...args: Parameters<typeof minutesToMilliseconds>) => number;
}
type UseAppDateTimeReturn = Record<
  `${DateTimePatternNames}FormattedDateTime`,
  (date: number | Date) => string
> &
  Helpers;

const useAppDateTime = (): UseAppDateTimeReturn => {
  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const dateTimePatterns: DateTimePatterns = {
    datasetStructureVersion: { us: mainUSDateTimeFormat, eu: mainEUDateTimeFormat },
    alert: { us: mainUSDateTimeFormat, eu: mainEUDateTimeFormat },
    associationRequest: { us: mainUSDateTimeFormat, eu: mainEUDateTimeFormat },
    entityStatus: { us: mainUSDateTimeFormat, eu: mainEUDateTimeFormat },
    dataEntity: { us: mainUSDateFormat, eu: mainEUDateFormat },
    term: { us: mainUSDateFormat, eu: mainEUDateFormat },
    metadata: { us: mainUSDateFormat, eu: mainEUDateFormat },
    activity: { us: 'p', eu: 'HH:mm' },
    datasetField: { us: mainUSDateFormat, eu: mainEUDateFormat },
    linkedEntity: { us: mainUSDateFormat, eu: mainEUDateFormat },
    qualityTest: { us: mainUSDateTimeFormat, eu: mainEUDateTimeFormat },
    qualityTestRun: { us: mainUSDateTimeFormat, eu: mainEUDateTimeFormat },
    datedList: { us: datedListFormat, eu: datedListFormat },
  };

  const formatDate = (datePattern: DateTimePatternNames) => (date: number | Date) => {
    let timezone: TimeZones = 'eu';
    if (currentTimezone.startsWith('America')) timezone = 'us';

    return formatInTimeZone(
      date,
      currentTimezone,
      dateTimePatterns[datePattern][timezone]
    );
  };

  return {
    formatDistanceToNow,
    formatDistanceToNowStrict,
    formatDistanceStrict,
    formatDuration,
    intervalToDuration,
    minutesToMilliseconds,
    add,
    datasetStructureVersionFormattedDateTime: formatDate('datasetStructureVersion'),
    alertFormattedDateTime: formatDate('alert'),
    associationRequestFormattedDateTime: formatDate('associationRequest'),
    entityStatusFormattedDateTime: formatDate('entityStatus'),
    dataEntityFormattedDateTime: formatDate('dataEntity'),
    termFormattedDateTime: formatDate('term'),
    metadataFormattedDateTime: formatDate('metadata'),
    activityFormattedDateTime: formatDate('activity'),
    datasetFieldFormattedDateTime: formatDate('datasetField'),
    linkedEntityFormattedDateTime: formatDate('linkedEntity'),
    qualityTestFormattedDateTime: formatDate('qualityTest'),
    qualityTestRunFormattedDateTime: formatDate('qualityTestRun'),
    datedListFormattedDateTime: formatDate('datedList'),
  };
};

export default useAppDateTime;
